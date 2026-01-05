from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uvicorn
import logging
import base64
from PIL import Image
import io

from models import OCRQueue, OCRQueueCreate, OCRQueueResponse, StudentResult
from database import get_db, engine, Base
from config import settings
from utils import get_current_user, publish_event
from ocr_processor import process_ocr_image
from gemini_client import GeminiAIClient

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="OCR Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize AI client
ai_client = GeminiAIClient(api_key=settings.GEMINI_API_KEY)

@app.post("/ocr/upload", response_model=OCRQueueResponse)
async def upload_for_grading(
    exam_id: str,
    file: UploadFile = File(...),
    background_tasks: BackgroundTasks = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload answer sheet image for OCR grading"""
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read and validate image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert to base64
        buffered = io.BytesIO()
        image.save(buffered, format=image.format or 'PNG')
        image_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        # Create OCR queue entry
        ocr_queue = OCRQueue(
            exam_id=exam_id,
            user_id=current_user['id'],
            image_url=f"data:image/{image.format.lower()};base64,{image_base64[:50]}...",
            image_data=image_base64,
            status="pending"
        )
        
        db.add(ocr_queue)
        db.commit()
        db.refresh(ocr_queue)
        
        # Add to background processing
        if background_tasks:
            background_tasks.add_task(
                process_grading_task,
                ocr_queue.id,
                image_base64,
                exam_id
            )
        
        # Publish event
        publish_event("ocr.uploaded", {
            "ocr_id": str(ocr_queue.id),
            "exam_id": exam_id,
            "user_id": current_user['id']
        }, queue_name='ocr_queue')
        
        logger.info(f"OCR job created: {ocr_queue.id}")
        
        return ocr_queue
        
    except Exception as e:
        logger.error(f"Upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

async def process_grading_task(ocr_id: str, image_data: str, exam_id: str):
    """Background task to process OCR grading"""
    db = next(get_db())
    
    try:
        # Get OCR queue entry
        ocr_queue = db.query(OCRQueue).filter(OCRQueue.id == ocr_id).first()
        if not ocr_queue:
            logger.error(f"OCR queue {ocr_id} not found")
            return
        
        # Update status to processing
        ocr_queue.status = "processing"
        ocr_queue.processing_started_at = datetime.utcnow()
        db.commit()
        
        # Decode image
        image_bytes = base64.b64decode(image_data)
        image = Image.open(io.BytesIO(image_bytes))
        
        # Process OCR
        extracted_text = process_ocr_image(image)
        
        # Get exam questions from exam service
        # (In production, call exam service API)
        exam_questions = get_exam_questions(exam_id)
        
        # Analyze with Gemini AI
        result = await ai_client.analyze_answers(
            extracted_text=extracted_text,
            questions=exam_questions
        )
        
        # Save result
        ocr_queue.result = result
        ocr_queue.status = "completed"
        ocr_queue.processing_completed_at = datetime.utcnow()
        
        # Create student result
        student_result = StudentResult(
            exam_id=exam_id,
            student_name=result.get('student_name', 'Unknown'),
            student_id=result.get('student_id'),
            answers=result.get('answers'),
            score=result.get('score'),
            total_points=result.get('total_points'),
            percentage=result.get('percentage'),
            graded_by=ocr_queue.user_id,
            feedback=result.get('feedback'),
            graded_at=datetime.utcnow()
        )
        
        db.add(student_result)
        db.commit()
        
        # Publish completion event
        publish_event("ocr.completed", {
            "ocr_id": str(ocr_id),
            "exam_id": exam_id,
            "score": result.get('score')
        }, queue_name='ocr_queue')
        
        logger.info(f"OCR processing completed: {ocr_id}")
        
    except Exception as e:
        logger.error(f"Processing error: {e}")
        
        # Update status to failed
        ocr_queue.status = "failed"
        ocr_queue.error_message = str(e)
        ocr_queue.processing_completed_at = datetime.utcnow()
        db.commit()
        
        publish_event("ocr.failed", {
            "ocr_id": str(ocr_id),
            "error": str(e)
        }, queue_name='ocr_queue')

def get_exam_questions(exam_id: str):
    """Get exam questions (mock for now)"""
    # In production, call exam service API
    return [
        {
            "id": "1",
            "question_text": "What is H2O?",
            "correct_answer": "A",
            "options": {"A": "Water", "B": "Salt", "C": "Sugar", "D": "Air"}
        }
    ]

@app.get("/ocr/queue", response_model=List[OCRQueueResponse])
async def list_ocr_queue(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 20,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List OCR processing queue"""
    query = db.query(OCRQueue).filter(OCRQueue.user_id == current_user['id'])
    
    if status:
        query = query.filter(OCRQueue.status == status)
    
    items = query.order_by(OCRQueue.created_at.desc()).offset(skip).limit(limit).all()
    return items

@app.get("/ocr/result/{ocr_id}")
async def get_ocr_result(
    ocr_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get OCR grading result"""
    ocr_queue = db.query(OCRQueue).filter(OCRQueue.id == ocr_id).first()
    
    if not ocr_queue:
        raise HTTPException(status_code=404, detail="OCR job not found")
    
    if ocr_queue.user_id != current_user['id']:
        if current_user['role'] not in ['admin', 'manager']:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return {
        "id": ocr_queue.id,
        "status": ocr_queue.status,
        "result": ocr_queue.result,
        "error_message": ocr_queue.error_message,
        "created_at": ocr_queue.created_at,
        "processing_started_at": ocr_queue.processing_started_at,
        "processing_completed_at": ocr_queue.processing_completed_at
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ocr-service"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8006)