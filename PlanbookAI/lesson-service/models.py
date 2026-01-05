from pydantic import BaseModel, validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from sqlalchemy import ( Column, Integer, String, Text, Boolean, Float, Numeric, DateTime, ForeignKey)
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from database import Base
import uuid

# SQLAlchemy Models
class LessonPlan(Base):
    __tablename__ = "lesson_plans"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_by = Column(UUID(as_uuid=True), nullable=False)
    title = Column(String(255), nullable=False)
    subject = Column(String(100), nullable=False, index=True)
    grade_level = Column(String(50))
    topic = Column(String(255))
    duration_minutes = Column(Integer)
    objectives = Column(Text)
    materials = Column(Text)
    activities = Column(JSONB)
    assessment = Column(Text)
    homework = Column(Text)
    notes = Column(Text)
    is_public = Column(Boolean, default=False)
    status = Column(String(50), default='draft')
    tags = Column(ARRAY(String))
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class LessonTemplate(Base):
    __tablename__ = "lesson_templates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_by = Column(UUID(as_uuid=True))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    subject = Column(String(100))
    grade_level = Column(String(50))
    structure = Column(JSONB, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class CurriculumFramework(Base):
    __tablename__ = "curriculum_frameworks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    created_by = Column(UUID(as_uuid=True))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    subject = Column(String(100))
    grade_level = Column(String(50))
    structure = Column(JSONB, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic Models
class LessonActivity(BaseModel):
    name: str
    duration: int
    description: str
    method: Optional[str] = None

class LessonPlanCreate(BaseModel):
    title: str
    subject: str
    grade_level: Optional[str] = None
    topic: str
    duration_minutes: int
    objectives: str
    materials: Optional[str] = None
    activities: Optional[List[Dict[str, Any]]] = None
    assessment: Optional[str] = None
    homework: Optional[str] = None
    notes: Optional[str] = None
    is_public: Optional[bool] = False
    tags: Optional[List[str]] = []

class LessonPlanUpdate(BaseModel):
    title: Optional[str] = None
    subject: Optional[str] = None
    grade_level: Optional[str] = None
    topic: Optional[str] = None
    duration_minutes: Optional[int] = None
    objectives: Optional[str] = None
    materials: Optional[str] = None
    activities: Optional[List[Dict[str, Any]]] = None
    assessment: Optional[str] = None
    homework: Optional[str] = None
    notes: Optional[str] = None
    is_public: Optional[bool] = None
    status: Optional[str] = None
    tags: Optional[List[str]] = None

class LessonPlanResponse(BaseModel):
    id: uuid.UUID
    created_by: uuid.UUID
    title: str
    subject: str
    grade_level: Optional[str]
    topic: str
    duration_minutes: int
    objectives: str
    materials: Optional[str]
    activities: Optional[List[Dict[str, Any]]]
    assessment: Optional[str]
    homework: Optional[str]
    notes: Optional[str]
    is_public: bool
    status: str
    tags: Optional[List[str]]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True