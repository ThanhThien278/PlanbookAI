from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uvicorn
import json
import logging

from models import Question, QuestionCreate, QuestionUpdate, QuestionResponse, QuestionFilter
from database import get_db, engine, Base
from config import settings
from utils import get_current_user, publish_event

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Question Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/questions", response_model=QuestionResponse)
async def create_question(
    question_data: QuestionCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new question"""
    db_question = Question(
        created_by=current_user['id'],
        subject=question_data.subject,
        topic=question_data.topic,
        grade_level=question_data.grade_level,
        question_type=question_data.question_type,
        difficulty=question_data.difficulty,
        question_text=question_data.question_text,
        options=question_data.options,
        correct_answer=question_data.correct_answer,
        explanation=question_data.explanation,
        points=question_data.points or 1.0,
        tags=question_data.tags,
        is_public=question_data.is_public or False,
        status="draft"
    )
    
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    
    publish_event("question.created", {
        "question_id": str(db_question.id),
        "created_by": current_user['id'],
        "subject": db_question.subject,
        "topic": db_question.topic
    })
    
    logger.info(f"Question created: {db_question.id}")
    return db_question

@app.get("/questions", response_model=List[QuestionResponse])
async def list_questions(
    subject: Optional[str] = None,
    topic: Optional[str] = None,
    difficulty: Optional[str] = None,
    question_type: Optional[str] = None,
    is_public: Optional[bool] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List questions with filters"""
    query = db.query(Question)
    
    # Apply filters
    if subject:
        query = query.filter(Question.subject == subject)
    if topic:
        query = query.filter(Question.topic.ilike(f"%{topic}%"))
    if difficulty:
        query = query.filter(Question.difficulty == difficulty)
    if question_type:
        query = query.filter(Question.question_type == question_type)
    
    # Show public questions or user's own questions
    if is_public is not None:
        query = query.filter(Question.is_public == is_public)
    else:
        query = query.filter(
            (Question.is_public == True) | (Question.created_by == current_user['id'])
        )
    
    # Filter by status - approved or user's own
    query = query.filter(
        (Question.status == "approved") | (Question.created_by == current_user['id'])
    )
    
    questions = query.offset(skip).limit(limit).all()
    return questions

@app.get("/questions/{question_id}", response_model=QuestionResponse)
async def get_question(
    question_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get question by ID"""
    question = db.query(Question).filter(Question.id == question_id).first()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Check access permissions
    if not question.is_public and question.created_by != current_user['id']:
        if current_user['role'] not in ['admin', 'manager']:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return question

@app.put("/questions/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: str,
    question_data: QuestionUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update question"""
    question = db.query(Question).filter(Question.id == question_id).first()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Check permissions
    if question.created_by != current_user['id']:
        if current_user['role'] not in ['admin', 'manager']:
            raise HTTPException(status_code=403, detail="Access denied")
    
    # Update fields
    update_data = question_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(question, field, value)
    
    question.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(question)
    
    publish_event("question.updated", {
        "question_id": str(question.id),
        "updated_by": current_user['id']
    })
    
    logger.info(f"Question updated: {question.id}")
    return question

@app.delete("/questions/{question_id}")
async def delete_question(
    question_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete question"""
    question = db.query(Question).filter(Question.id == question_id).first()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Check permissions
    if question.created_by != current_user['id']:
        if current_user['role'] not in ['admin']:
            raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(question)
    db.commit()
    
    publish_event("question.deleted", {
        "question_id": question_id,
        "deleted_by": current_user['id']
    })
    
    logger.info(f"Question deleted: {question_id}")
    return {"message": "Question deleted successfully"}

@app.post("/questions/{question_id}/approve")
async def approve_question(
    question_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Approve question (Manager/Admin only)"""
    if current_user['role'] not in ['admin', 'manager']:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    question = db.query(Question).filter(Question.id == question_id).first()
    
    if not question:
        raise HTTPException(status_code=404, detail="Question not found")
    
    question.status = "approved"
    question.updated_at = datetime.utcnow()
    db.commit()
    
    publish_event("question.approved", {
        "question_id": question_id,
        "approved_by": current_user['id']
    })
    
    return {"message": "Question approved successfully"}

@app.get("/questions/stats/summary")
async def get_questions_stats(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get questions statistics"""
    total = db.query(Question).filter(Question.created_by == current_user['id']).count()
    by_status = db.query(Question.status, db.func.count(Question.id)).filter(
        Question.created_by == current_user['id']
    ).group_by(Question.status).all()
    
    by_subject = db.query(Question.subject, db.func.count(Question.id)).filter(
        Question.created_by == current_user['id']
    ).group_by(Question.subject).all()
    
    return {
        "total": total,
        "by_status": dict(by_status),
        "by_subject": dict(by_subject)
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "question-service"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8003)