from pydantic import BaseModel, validator
from sqlalchemy import Column, String, Text, Boolean, Numeric, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from typing import Optional, List, Dict
from datetime import datetime
from enum import Enum
import uuid

from database import Base

# =========================
# ENUMS
# =========================

class QuestionType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    SHORT_ANSWER = "short_answer"
    ESSAY = "essay"
    TRUE_FALSE = "true_false"

class Difficulty(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class QuestionStatus(str, Enum):
    DRAFT = "draft"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


# =========================
# SQLALCHEMY MODEL
# =========================

class Question(Base):
    __tablename__ = "questions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_by = Column(UUID(as_uuid=True), nullable=False, index=True)

    subject = Column(String(100), nullable=False, index=True)
    topic = Column(String(255), nullable=False, index=True)
    grade_level = Column(String(50))

    question_type = Column(String(50), nullable=False)
    difficulty = Column(String(50))

    question_text = Column(Text, nullable=False)
    options = Column(JSONB)
    correct_answer = Column(Text)
    explanation = Column(Text)

    points = Column(Numeric(5, 2), default=1.0)
    tags = Column(ARRAY(String))

    is_public = Column(Boolean, default=False)
    status = Column(String(50), default=QuestionStatus.DRAFT.value)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )


# =========================
# Pydantic Models
# =========================

class QuestionCreate(BaseModel):
    subject: str
    topic: str
    grade_level: Optional[str] = None
    question_type: QuestionType
    difficulty: Difficulty = Difficulty.MEDIUM
    question_text: str

    options: Optional[Dict[str, str]] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None

    points: float = 1.0
    tags: Optional[List[str]] = None
    is_public: bool = False

    # ---------- Validators ----------

    @validator("question_text")
    def validate_question_text(cls, v):
        if len(v.strip()) < 10:
            raise ValueError("Question text must be at least 10 characters")
        return v

    @validator("points")
    def validate_points(cls, v):
        if v <= 0:
            raise ValueError("Points must be greater than 0")
        return v

    @validator("options", always=True)
    def validate_options(cls, v, values):
        qtype = values.get("question_type")

        if qtype == QuestionType.MULTIPLE_CHOICE:
            if not v or len(v) < 2:
                raise ValueError(
                    "Multiple choice questions must have at least 2 options"
                )

        return v

    @validator("correct_answer", always=True)
    def validate_correct_answer(cls, v, values):
        qtype = values.get("question_type")
        options = values.get("options")

        if qtype == QuestionType.MULTIPLE_CHOICE:
            if not v:
                raise ValueError("Correct answer is required")
            if v not in options:
                raise ValueError("Correct answer must be one of the options")

        if qtype == QuestionType.TRUE_FALSE:
            if v not in ["true", "false"]:
                raise ValueError("Correct answer must be 'true' or 'false'")

        return v


class QuestionUpdate(BaseModel):
    subject: Optional[str] = None
    topic: Optional[str] = None
    grade_level: Optional[str] = None

    question_type: Optional[QuestionType] = None
    difficulty: Optional[Difficulty] = None

    question_text: Optional[str] = None
    options: Optional[Dict[str, str]] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None

    points: Optional[float] = None
    tags: Optional[List[str]] = None
    is_public: Optional[bool] = None

    # status chỉ cho admin xử lý ở service
    status: Optional[QuestionStatus] = None


class QuestionResponse(BaseModel):
    id: uuid.UUID
    created_by: uuid.UUID

    subject: str
    topic: str
    grade_level: Optional[str]

    question_type: str
    difficulty: Optional[str]

    question_text: str
    options: Optional[Dict[str, str]]
    correct_answer: Optional[str]
    explanation: Optional[str]

    points: float
    tags: Optional[List[str]]

    is_public: bool
    status: str

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class QuestionFilter(BaseModel):
    subject: Optional[str] = None
    topic: Optional[str] = None
    difficulty: Optional[Difficulty] = None
    question_type: Optional[QuestionType] = None
    is_public: Optional[bool] = None
    tags: Optional[List[str]] = None
