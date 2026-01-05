from pydantic import BaseModel
from typing import Optional, Dict, Any
from datetime import datetime
from decimal import Decimal
from sqlalchemy import ( Column, Integer, String, Text, Boolean, Float, Numeric, DateTime, ForeignKey)
from sqlalchemy.dialects.postgresql import UUID, JSONB
from database import Base
import uuid

# SQLAlchemy Models
class Package(Base):
    __tablename__ = "packages"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(String)
    price = Column(Numeric(10, 2), nullable=False)
    duration_days = Column(Integer, nullable=False)
    features = Column(JSONB)
    max_questions = Column(Integer)
    max_exams = Column(Integer)
    max_lessons = Column(Integer)
    max_storage_mb = Column(Integer)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Order(Base):
    __tablename__ = "orders"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False)
    package_id = Column(UUID(as_uuid=True), ForeignKey('packages.id'))
    order_code = Column(String(50), unique=True, nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    status = Column(String(50), nullable=False)
    payment_method = Column(String(50))
    payment_date = Column(DateTime)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), nullable=False, unique=True)
    package_id = Column(UUID(as_uuid=True), ForeignKey('packages.id'))
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

# Pydantic Models
class PackageCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal
    duration_days: int
    features: Optional[Dict[str, Any]] = None
    max_questions: Optional[int] = -1
    max_exams: Optional[int] = -1
    max_lessons: Optional[int] = -1
    max_storage_mb: Optional[int] = 1000

class PackageResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: Optional[str]
    price: Decimal
    duration_days: int
    features: Optional[Dict[str, Any]]
    max_questions: Optional[int]
    max_exams: Optional[int]
    max_lessons: Optional[int]
    max_storage_mb: Optional[int]
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class OrderCreate(BaseModel):
    package_id: str
    payment_method: Optional[str] = "bank_transfer"

class OrderResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    package_id: uuid.UUID
    order_code: str
    amount: Decimal
    status: str
    payment_method: Optional[str]
    payment_date: Optional[datetime]
    start_date: datetime
    end_date: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

class SubscriptionResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    package_id: uuid.UUID
    start_date: datetime
    end_date: datetime
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True