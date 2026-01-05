from fastapi import FastAPI, Depends, HTTPException, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uvicorn
import json
import logging

from models import (
    LessonPlan, LessonPlanCreate, LessonPlanUpdate, LessonPlanResponse,
    LessonTemplate, CurriculumFramework, LessonActivity
)
from database import get_db, engine, Base
from config import settings
from utils import get_current_user, publish_event, require_roles
from ai_generator import generate_lesson_plan_with_ai

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Lesson Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== LESSON PLANS ====================

@app.post("/lessons", response_model=LessonPlanResponse)
async def create_lesson_plan(
    lesson_data: LessonPlanCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new lesson plan"""
    db_lesson = LessonPlan(
        created_by=current_user['id'],
        title=lesson_data.title,
        subject=lesson_data.subject,
        grade_level=lesson_data.grade_level,
        topic=lesson_data.topic,
        duration_minutes=lesson_data.duration_minutes,
        objectives=lesson_data.objectives,
        materials=lesson_data.materials,
        activities=lesson_data.activities,
        assessment=lesson_data.assessment,
        homework=lesson_data.homework,
        notes=lesson_data.notes,
        is_public=lesson_data.is_public or False,
        status="draft",
        tags=lesson_data.tags or []
    )
    
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    
    publish_event("lesson.created", {
        "lesson_id": str(db_lesson.id),
        "created_by": current_user['id'],
        "title": db_lesson.title,
        "subject": db_lesson.subject
    }, queue_name='lesson_events')
    
    logger.info(f"Lesson plan created: {db_lesson.id}")
    return db_lesson

@app.get("/lessons", response_model=List[LessonPlanResponse])
async def list_lesson_plans(
    subject: Optional[str] = None,
    grade_level: Optional[str] = None,
    topic: Optional[str] = None,
    is_public: Optional[bool] = None,
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List lesson plans with filters"""
    query = db.query(LessonPlan)
    
    if subject:
        query = query.filter(LessonPlan.subject == subject)
    if grade_level:
        query = query.filter(LessonPlan.grade_level == grade_level)
    if topic:
        query = query.filter(LessonPlan.topic.ilike(f"%{topic}%"))
    if status:
        query = query.filter(LessonPlan.status == status)
    
    # Show public lessons or user's own lessons
    if is_public is not None:
        query = query.filter(LessonPlan.is_public == is_public)
    else:
        query = query.filter(
            (LessonPlan.is_public == True) | (LessonPlan.created_by == current_user['id'])
        )
    
    # Filter by status
    query = query.filter(
        (LessonPlan.status == "approved") | (LessonPlan.created_by == current_user['id'])
    )
    
    lessons = query.order_by(LessonPlan.created_at.desc()).offset(skip).limit(limit).all()
    return lessons

@app.get("/lessons/{lesson_id}", response_model=LessonPlanResponse)
async def get_lesson_plan(
    lesson_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get lesson plan by ID"""
    lesson = db.query(LessonPlan).filter(LessonPlan.id == lesson_id).first()
    
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson plan not found")
    
    # Check access permissions
    if not lesson.is_public and lesson.created_by != current_user['id']:
        if current_user['role'] not in ['admin', 'manager']:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return lesson

@app.put("/lessons/{lesson_id}", response_model=LessonPlanResponse)
async def update_lesson_plan(
    lesson_id: str,
    lesson_data: LessonPlanUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update lesson plan"""
    lesson = db.query(LessonPlan).filter(LessonPlan.id == lesson_id).first()
    
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson plan not found")
    
    if lesson.created_by != current_user['id']:
        if current_user['role'] not in ['admin', 'manager']:
            raise HTTPException(status_code=403, detail="Access denied")
    
    update_data = lesson_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(lesson, field, value)
    
    lesson.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(lesson)
    
    publish_event("lesson.updated", {
        "lesson_id": str(lesson.id),
        "updated_by": current_user['id']
    }, queue_name='lesson_events')
    
    return lesson

@app.delete("/lessons/{lesson_id}")
async def delete_lesson_plan(
    lesson_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete lesson plan"""
    lesson = db.query(LessonPlan).filter(LessonPlan.id == lesson_id).first()
    
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson plan not found")
    
    if lesson.created_by != current_user['id']:
        if current_user['role'] not in ['admin']:
            raise HTTPException(status_code=403, detail="Access denied")
    
    db.delete(lesson)
    db.commit()
    
    publish_event("lesson.deleted", {
        "lesson_id": lesson_id,
        "deleted_by": current_user['id']
    }, queue_name='lesson_events')
    
    return {"message": "Lesson plan deleted successfully"}

@app.post("/lessons/{lesson_id}/approve")
async def approve_lesson_plan(
    lesson_id: str,
    current_user: dict = Depends(require_roles('admin', 'manager')),
    db: Session = Depends(get_db)
):
    """Approve lesson plan (Manager/Admin only)"""
    lesson = db.query(LessonPlan).filter(LessonPlan.id == lesson_id).first()
    
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson plan not found")
    
    lesson.status = "approved"
    lesson.updated_at = datetime.utcnow()
    db.commit()
    
    publish_event("lesson.approved", {
        "lesson_id": lesson_id,
        "approved_by": current_user['id']
    }, queue_name='lesson_events')
    
    return {"message": "Lesson plan approved successfully"}

@app.post("/lessons/{lesson_id}/duplicate")
async def duplicate_lesson_plan(
    lesson_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Duplicate lesson plan"""
    original = db.query(LessonPlan).filter(LessonPlan.id == lesson_id).first()
    
    if not original:
        raise HTTPException(status_code=404, detail="Lesson plan not found")
    
    # Check access
    if not original.is_public and original.created_by != current_user['id']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Create duplicate
    duplicate = LessonPlan(
        created_by=current_user['id'],
        title=f"{original.title} (Copy)",
        subject=original.subject,
        grade_level=original.grade_level,
        topic=original.topic,
        duration_minutes=original.duration_minutes,
        objectives=original.objectives,
        materials=original.materials,
        activities=original.activities,
        assessment=original.assessment,
        homework=original.homework,
        notes=original.notes,
        is_public=False,
        status="draft",
        tags=original.tags
    )
    
    db.add(duplicate)
    db.commit()
    db.refresh(duplicate)
    
    return duplicate

# ==================== AI GENERATION ====================

@app.post("/lessons/generate")
async def generate_lesson_with_ai(
    prompt: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate lesson plan using AI"""
    try:
        ai_result = await generate_lesson_plan_with_ai(
            subject=prompt.get('subject'),
            topic=prompt.get('topic'),
            grade_level=prompt.get('grade_level'),
            duration=prompt.get('duration_minutes', 45),
            objectives=prompt.get('objectives', [])
        )
        
        # Save generated lesson
        db_lesson = LessonPlan(
            created_by=current_user['id'],
            title=ai_result['title'],
            subject=prompt['subject'],
            grade_level=prompt['grade_level'],
            topic=prompt['topic'],
            duration_minutes=prompt.get('duration_minutes', 45),
            objectives=ai_result['objectives'],
            materials=ai_result['materials'],
            activities=ai_result['activities'],
            assessment=ai_result['assessment'],
            homework=ai_result.get('homework', ''),
            notes="Generated by AI",
            is_public=False,
            status="draft"
        )
        
        db.add(db_lesson)
        db.commit()
        db.refresh(db_lesson)
        
        return db_lesson
    
    except Exception as e:
        logger.error(f"AI generation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate lesson plan")

# ==================== TEMPLATES ====================

@app.get("/templates", response_model=List[dict])
async def list_templates(
    subject: Optional[str] = None,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List lesson templates"""
    query = db.query(LessonTemplate)
    
    if subject:
        query = query.filter(LessonTemplate.subject == subject)
    
    query = query.filter(LessonTemplate.is_active == True)
    templates = query.all()
    
    return templates

@app.post("/templates")
async def create_template(
    template_data: dict,
    current_user: dict = Depends(require_roles('admin', 'manager', 'staff')),
    db: Session = Depends(get_db)
):
    """Create lesson template (Staff/Manager/Admin only)"""
    db_template = LessonTemplate(
        created_by=current_user['id'],
        name=template_data['name'],
        description=template_data.get('description'),
        subject=template_data['subject'],
        grade_level=template_data.get('grade_level'),
        structure=template_data['structure'],
        is_active=True
    )
    
    db.add(db_template)
    db.commit()
    db.refresh(db_template)
    
    return db_template

# ==================== CURRICULUM FRAMEWORKS ====================

@app.get("/frameworks")
async def list_frameworks(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List curriculum frameworks"""
    frameworks = db.query(CurriculumFramework).filter(
        CurriculumFramework.is_active == True
    ).all()
    return frameworks

@app.post("/frameworks")
async def create_framework(
    framework_data: dict,
    current_user: dict = Depends(require_roles('admin')),
    db: Session = Depends(get_db)
):
    """Create curriculum framework (Admin only)"""
    db_framework = CurriculumFramework(
        created_by=current_user['id'],
        name=framework_data['name'],
        description=framework_data.get('description'),
        subject=framework_data['subject'],
        grade_level=framework_data.get('grade_level'),
        structure=framework_data['structure'],
        is_active=True
    )
    
    db.add(db_framework)
    db.commit()
    db.refresh(db_framework)
    
    return db_framework

# ==================== STATISTICS ====================

@app.get("/lessons/stats/summary")
async def get_lesson_stats(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get lesson statistics"""
    total = db.query(LessonPlan).filter(
        LessonPlan.created_by == current_user['id']
    ).count()
    
    by_status = db.query(
        LessonPlan.status, 
        db.func.count(LessonPlan.id)
    ).filter(
        LessonPlan.created_by == current_user['id']
    ).group_by(LessonPlan.status).all()
    
    by_subject = db.query(
        LessonPlan.subject, 
        db.func.count(LessonPlan.id)
    ).filter(
        LessonPlan.created_by == current_user['id']
    ).group_by(LessonPlan.subject).all()
    
    return {
        "total": total,
        "by_status": dict(by_status),
        "by_subject": dict(by_subject)
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "lesson-service"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8005)
