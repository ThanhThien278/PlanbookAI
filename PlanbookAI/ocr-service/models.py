from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from sqlalchemy import ( Column, Integer, String, Text, Boolean, Float, Numeric, DateTime, ForeignKey)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from database import Base
import uuid

class OCRQueue(Base):
    __tablename__ = "ocr_queue"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id = Column(UUID(as_uuid=True))
    user_id = Column(UUID(as_uuid=True))
    image_url = Column(Text)
    image_data = Column(Text)
    status = Column(String(50), default='pending')
    result = Column(JSONB)
    error_message = Column(Text)
    processing_started_at = Column(DateTime)
    processing_completed_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class StudentResult(Base):
    __tablename__ = "student_results"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    exam_id = Column(UUID(as_uuid=True))
    student_name = Column(String(255))
    student_id = Column(String(100))
    answers = Column(JSONB)
    score = Column(Float)
    total_points = Column(Float)
    percentage = Column(Float)
    graded_by = Column(UUID(as_uuid=True))
    feedback = Column(Text)
    submitted_at = Column(DateTime)
    graded_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class OCRQueueCreate(BaseModel):
    exam_id: str
    
class OCRQueueResponse(BaseModel):
    id: uuid.UUID
    exam_id: uuid.UUID
    user_id: uuid.UUID
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True