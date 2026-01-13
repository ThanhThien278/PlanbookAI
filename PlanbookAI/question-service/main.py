from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime
import logging
import uvicorn

from models import (
    Question,
    QuestionCreate,
    QuestionUpdate,
    QuestionResponse
)
from database import get_db, engine
from config import settings
from utils import get_current_user, publish_event

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Question Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# CREATE QUESTION
# =========================
@app.post("/questions", response_model=QuestionResponse)
async def create_question(
    question_data: QuestionCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    question = Question(
        created_by=current_user["id"],
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

    db.add(question)
    db.commit()
    db.refresh(question)

    publish_event("question.created", {
        "question_id": str(question.id),
        "created_by": current_user["id"]
    })

    return question


# =========================
# LIST QUESTIONS
# =========================
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
    query = db.query(Question)

    if subject:
        query = query.filter(Question.subject == subject)
    if topic:
        query = query.filter(Question.topic.ilike(f"%{topic}%"))
    if difficulty:
        query = query.filter(Question.difficulty == difficulty)
    if question_type:
        query = query.filter(Question.question_type == question_type)

    # Admin/Manager xem tất cả
    if current_user["role"] not in ["admin", "manager"]:
        query = query.filter(
            (Question.is_public == True) |
            (Question.created_by == current_user["id"])
        )

    if is_public is not None:
        query = query.filter(Question.is_public == is_public)

    query = query.filter(
        (Question.status == "approved") |
        (Question.created_by == current_user["id"])
    )

    return query.offset(skip).limit(limit).all()


# =========================
# GET QUESTION DETAIL
# =========================
@app.get("/questions/{question_id}", response_model=QuestionResponse)
async def get_question(
    question_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    question = db.query(Question).filter(Question.id == question_id).first()

    if not question:
        raise HTTPException(404, "Question not found")

    if (
        not question.is_public and
        question.created_by != current_user["id"] and
        current_user["role"] not in ["admin", "manager"]
    ):
        raise HTTPException(403, "Access denied")

    return question


# =========================
# UPDATE QUESTION
# =========================
@app.put("/questions/{question_id}", response_model=QuestionResponse)
async def update_question(
    question_id: str,
    question_data: QuestionUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(404, "Question not found")

    if (
        question.created_by != current_user["id"] and
        current_user["role"] not in ["admin", "manager"]
    ):
        raise HTTPException(403, "Access denied")

    update_data = question_data.dict(exclude_unset=True)

    # Không cho user thường sửa status
    if "status" in update_data and current_user["role"] not in ["admin", "manager"]:
        update_data.pop("status")

    for field, value in update_data.items():
        setattr(question, field, value)

    question.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(question)

    publish_event("question.updated", {
        "question_id": str(question.id),
        "updated_by": current_user["id"]
    })

    return question


# =========================
# DELETE QUESTION
# =========================
@app.delete("/questions/{question_id}")
async def delete_question(
    question_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(404, "Question not found")

    if (
        question.created_by != current_user["id"] and
        current_user["role"] != "admin"
    ):
        raise HTTPException(403, "Access denied")

    db.delete(question)
    db.commit()

    publish_event("question.deleted", {
        "question_id": question_id,
        "deleted_by": current_user["id"]
    })

    return {"message": "Deleted successfully"}


# =========================
# APPROVE QUESTION
# =========================
@app.post("/questions/{question_id}/approve")
async def approve_question(
    question_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user["role"] not in ["admin", "manager"]:
        raise HTTPException(403, "Permission denied")

    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(404, "Question not found")

    question.status = "approved"
    question.updated_at = datetime.utcnow()
    db.commit()

    return {"message": "Question approved"}


# =========================
# STATS
# =========================
@app.get("/questions/stats/summary")
async def get_stats(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total = db.query(func.count(Question.id)).filter(
        Question.created_by == current_user["id"]
    ).scalar()

    by_status = dict(
        db.query(Question.status, func.count())
        .filter(Question.created_by == current_user["id"])
        .group_by(Question.status)
        .all()
    )

    by_subject = dict(
        db.query(Question.subject, func.count())
        .filter(Question.created_by == current_user["id"])
        .group_by(Question.subject)
        .all()
    )

    return {
        "total": total,
        "by_status": by_status,
        "by_subject": by_subject
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
