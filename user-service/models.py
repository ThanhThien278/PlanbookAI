from sqlalchemy import ( Column, Integer, String, Text, Boolean, Float, Numeric, DateTime, ForeignKey)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from database import Base
import uuid

# SQLAlchemy Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), unique=True)
    phone = Column(String(20))
    address = Column(Text)
    school_name = Column(String(255))
    subject = Column(String(100))
    grade_level = Column(String(50))
    avatar_url = Column(Text)
    bio = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class UserSettings(Base):
    __tablename__ = "user_settings"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'), unique=True)
    language = Column(String(10), default='vi')
    timezone = Column(String(50), default='Asia/Ho_Chi_Minh')
    email_notifications = Column(Boolean, default=True)
    push_notifications = Column(Boolean, default=True)
    theme = Column(String(20), default='light')
    preferences = Column(JSONB)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class ActivityLog(Base):
    __tablename__ = "activity_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey('users.id', ondelete='CASCADE'))
    action = Column(String(100), nullable=False)
    entity_type = Column(String(50))
    entity_id = Column(UUID(as_uuid=True))
    details = Column(JSONB)
    ip_address = Column(String(50))
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic Models
class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    username: str
    full_name: Optional[str]
    role: str
    is_active: bool
    is_verified: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserProfileUpdate(BaseModel):
    phone: Optional[str] = None
    address: Optional[str] = None
    school_name: Optional[str] = None
    subject: Optional[str] = None
    grade_level: Optional[str] = None
    bio: Optional[str] = None

class UserProfileResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    phone: Optional[str]
    address: Optional[str]
    school_name: Optional[str]
    subject: Optional[str]
    grade_level: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserSettingsUpdate(BaseModel):
    language: Optional[str] = None
    timezone: Optional[str] = None
    email_notifications: Optional[bool] = None
    push_notifications: Optional[bool] = None
    theme: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

class ActivityLogResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    action: str
    entity_type: Optional[str]
    entity_id: Optional[uuid.UUID]
    details: Optional[Dict[str, Any]]
    ip_address: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True