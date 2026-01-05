from sqlalchemy import ( Column, Integer, String, Text, Boolean, Float, Numeric, DateTime, ForeignKey)
from sqlalchemy.dialects.postgresql import UUID
from database import Base
import uuid
from datetime import datetime

class Exam(Base):
    __tablename__ = "exams"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_by = Column(UUID(as_uuid=True), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    subject = Column(String(100), nullable=False, index=True)
    grade_level = Column(String(50))
    exam_type = Column(String(50), nullable=False)
    duration_minutes = Column(Integer)
    total_points = Column(Numeric(6, 2))
    passing_score = Column(Numeric(6, 2))
    instructions = Column(Text)
    is_randomized = Column(Boolean, default=False)
    is_public = Column(Boolean, default=False)
    status = Column(String(50), default='draft')
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class ExamQuestion(Base):
    __tablename__ = "exam_questions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id = Column(UUID(as_uuid=True), ForeignKey('exams.id', ondelete='CASCADE'))
    question_id = Column(UUID(as_uuid=True), nullable=False)
    question_order = Column(Integer)
    points = Column(Numeric(5, 2))
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic Models
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class ExamCreate(BaseModel):
    title: str
    description: Optional[str] = None
    subject: str
    grade_level: Optional[str] = None
    exam_type: str
    duration_minutes: Optional[int] = None
    total_points: Optional[float] = 0.0
    passing_score: Optional[float] = None
    instructions: Optional[str] = None
    is_randomized: Optional[bool] = False
    is_public: Optional[bool] = False

class ExamUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    subject: Optional[str] = None
    grade_level: Optional[str] = None
    exam_type: Optional[str] = None
    duration_minutes: Optional[int] = None
    total_points: Optional[float] = None
    passing_score: Optional[float] = None
    instructions: Optional[str] = None
    is_randomized: Optional[bool] = None
    is_public: Optional[bool] = None
    status: Optional[str] = None

class ExamResponse(BaseModel):
    id: uuid.UUID
    created_by: uuid.UUID
    title: str
    description: Optional[str]
    subject: str
    grade_level: Optional[str]
    exam_type: str
    duration_minutes: Optional[int]
    total_points: Optional[float]
    passing_score: Optional[float]
    instructions: Optional[str]
    is_randomized: bool
    is_public: bool
    status: str
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ExamWithQuestions(ExamResponse):
    questions: List[Dict[str, Any]] = []
    question_count: int = 0