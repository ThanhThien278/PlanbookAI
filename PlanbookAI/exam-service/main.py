from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uvicorn
import requests
import random
import logging

from models import Exam, ExamQuestion, ExamCreate, ExamUpdate, ExamResponse, ExamWithQuestions
from database import get_db, engine, Base
from config import settings
from utils import get_current_user, publish_event

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Exam Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_questions_from_service(question_ids: List[str], token: str):
    """Fetch questions from Question Service"""
    try:
        headers = {"Authorization": f"Bearer {token}"}
        questions = []
        for qid in question_ids:
            response = requests.get(
                f"{settings.QUESTION_SERVICE_URL}/questions/{qid}",
                headers=headers,
                timeout=5
            )
            if response.status_code == 200:
                questions.append(response.json())
        return questions
    except Exception as e:
        logger.error(f"Error fetching questions: {e}")
        return []

@app.post("/exams", response_model=ExamResponse)
async def create_exam(
    exam_data: ExamCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new exam"""
    db_exam = Exam(
        created_by=current_user['id'],
        title=exam_data.title,
        description=exam_data.description,
        subject=exam_data.subject,
        grade_level=exam_data.grade_level,
        exam_type=exam_data.exam_type,
        duration_minutes=exam_data.duration_minutes,
        total_points=exam_data.total_points or 0.0,
        passing_score=exam_data.passing_score,
        instructions=exam_data.instructions,
        is_randomized=exam_data.is_randomized or False,
        is_public=exam_data.is_public or False,
        status="draft"
    )
    
    db.add(db_exam)
    db.commit()
    db.refresh(db_exam)
    
    publish_event("exam.created", {
        "exam_id": str(db_exam.id),
        "created_by": current_user['id'],
        "title": db_exam.title
    })
    
    logger.info(f"Exam created: {db_exam.id}")
    return db_exam

@app.post("/exams/{exam_id}/questions")
async def add_questions_to_exam(
    exam_id: str,
    question_ids: List[str],
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add questions to exam"""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    if exam.created_by != current_user['id']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Remove existing questions
    db.query(ExamQuestion).filter(ExamQuestion.exam_id == exam_id).delete()
    
    # Add new questions
    total_points = 0
    for idx, qid in enumerate(question_ids):
        exam_question = ExamQuestion(
            exam_id=exam_id,
            question_id=qid,
            question_order=idx + 1,
            points=1.0  # Default points
        )
        db.add(exam_question)
        total_points += 1.0
    
    # Update exam total points
    exam.total_points = total_points
    exam.updated_at = datetime.utcnow()
    
    db.commit()
    
    logger.info(f"Added {len(question_ids)} questions to exam {exam_id}")
    return {"message": f"Added {len(question_ids)} questions successfully"}

@app.get("/exams", response_model=List[ExamResponse])
async def list_exams(
    subject: Optional[str] = None,
    exam_type: Optional[str] = None,
    is_public: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List exams with filters"""
    query = db.query(Exam)
    
    if subject:
        query = query.filter(Exam.subject == subject)
    if exam_type:
        query = query.filter(Exam.exam_type == exam_type)
    
    # Show public exams or user's own exams
    if is_public is not None:
        query = query.filter(Exam.is_public == is_public)
    else:
        query = query.filter(
            (Exam.is_public == True) | (Exam.created_by == current_user['id'])
        )
    
    exams = query.offset(skip).limit(limit).all()
    return exams

@app.get("/exams/{exam_id}", response_model=ExamWithQuestions)
async def get_exam(
    exam_id: str,
    current_user: dict = Depends(get_current_user),
    token: str = None,
    db: Session = Depends(get_db)
):
    """Get exam with questions"""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    # Check access
    if not exam.is_public and exam.created_by != current_user['id']:
        if current_user['role'] not in ['admin', 'manager']:
            raise HTTPException(status_code=403, detail="Access denied")
    
    # Get exam questions
    exam_questions = db.query(ExamQuestion).filter(
        ExamQuestion.exam_id == exam_id
    ).order_by(ExamQuestion.question_order).all()
    
    question_ids = [eq.question_id for eq in exam_questions]
    
    # Fetch questions from Question Service
    questions = get_questions_from_service(question_ids, token)
    
    # Randomize if needed
    if exam.is_randomized:
        random.shuffle(questions)
    
    return {
        **exam.__dict__,
        "questions": questions,
        "question_count": len(questions)
    }

@app.put("/exams/{exam_id}", response_model=ExamResponse)
async def update_exam(
    exam_id: str,
    exam_data: ExamUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update exam"""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    if exam.created_by != current_user['id']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = exam_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(exam, field, value)
    
    exam.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(exam)
    
    publish_event("exam.updated", {
        "exam_id": str(exam.id),
        "updated_by": current_user['id']
    })
    
    return exam

@app.delete("/exams/{exam_id}")
async def delete_exam(
    exam_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete exam"""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    if exam.created_by != current_user['id']:
        if current_user['role'] not in ['admin']:
            raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(exam)
    db.commit()
    
    publish_event("exam.deleted", {
        "exam_id": exam_id,
        "deleted_by": current_user['id']
    })
    
    return {"message": "Exam deleted successfully"}

@app.post("/exams/{exam_id}/publish")
async def publish_exam(
    exam_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Publish exam"""
    exam = db.query(Exam).filter(Exam.id == exam_id).first()
    
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found")
    
    if exam.created_by != current_user['id']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Check if exam has questions
    question_count = db.query(ExamQuestion).filter(ExamQuestion.exam_id == exam_id).count()
    if question_count == 0:
        raise HTTPException(status_code=400, detail="Cannot publish exam without questions")
    
    exam.status = "published"
    exam.updated_at = datetime.utcnow()
    db.commit()
    
    publish_event("exam.published", {
        "exam_id": exam_id,
        "published_by": current_user['id']
    })
    
    return {"message": "Exam published successfully"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "exam-service"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8004)