from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import uvicorn
import json
import pika
import logging
import boto3
from PIL import Image
import io

from models import (
    User, UserProfile, UserSettings, ActivityLog,
    UserProfileUpdate, UserSettingsUpdate, UserResponse, 
    UserProfileResponse, ActivityLogResponse
)
from database import get_db, engine, Base
from config import settings
from utils import get_current_user, publish_event

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="User Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# RabbitMQ Consumer for user events
def start_event_consumer():
    """Listen to user_events queue"""
    try:
        credentials = pika.PlainCredentials('admin', 'admin123')
        parameters = pika.ConnectionParameters(
            host='rabbitmq',
            credentials=credentials
        )
        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()
        channel.queue_declare(queue='user_events', durable=True)
        
        def callback(ch, method, properties, body):
            try:
                event = json.loads(body)
                event_type = event.get('event_type')
                data = event.get('data')
                
                if event_type == 'user.created':
                    # Create user profile when user registers
                    db = next(get_db())
                    profile = UserProfile(
                        user_id=data['user_id'],
                        subject=None,
                        grade_level=None
                    )
                    db.add(profile)
                    
                    # Create default settings
                    settings_obj = UserSettings(
                        user_id=data['user_id'],
                        language='vi',
                        timezone='Asia/Ho_Chi_Minh',
                        email_notifications=True,
                        theme='light'
                    )
                    db.add(settings_obj)
                    db.commit()
                    
                    logger.info(f"Created profile and settings for user {data['user_id']}")
                
                ch.basic_ack(delivery_tag=method.delivery_tag)
            except Exception as e:
                logger.error(f"Error processing event: {e}")
                ch.basic_nack(delivery_tag=method.delivery_tag, requeue=False)
        
        channel.basic_consume(
            queue='user_events',
            on_message_callback=callback
        )
        
        logger.info("Started consuming user_events")
        channel.start_consuming()
    except Exception as e:
        logger.error(f"Failed to start consumer: {e}")

# Start consumer in background (in production, use separate worker)
import threading
threading.Thread(target=start_event_consumer, daemon=True).start()

# ==================== USER PROFILE ====================

@app.get("/users/me/profile", response_model=UserProfileResponse)
async def get_my_profile(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's profile"""
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user['id']
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    return profile

@app.put("/users/me/profile", response_model=UserProfileResponse)
async def update_my_profile(
    profile_data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile"""
    profile = db.query(UserProfile).filter(
        UserProfile.user_id == current_user['id']
    ).first()
    
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    update_data = profile_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(profile, field, value)
    
    profile.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(profile)
    
    publish_event("user.profile.updated", {
        "user_id": current_user['id'],
        "fields_updated": list(update_data.keys())
    }, queue_name='user_events')
    
    return profile

@app.post("/users/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload user avatar"""
    try:
        # Validate image
        image = Image.open(io.BytesIO(await file.read()))
        if image.format not in ['JPEG', 'PNG', 'GIF']:
            raise HTTPException(status_code=400, detail="Invalid image format")
        
        # Resize image
        max_size = (400, 400)
        image.thumbnail(max_size, Image.Resampling.LANCZOS)
        
        # Save to buffer
        buffer = io.BytesIO()
        image.save(buffer, format=image.format)
        buffer.seek(0)
        
        # Upload to storage (Supabase or S3)
        # For demo, we'll just return a placeholder URL
        avatar_url = f"https://storage.example.com/avatars/{current_user['id']}.jpg"
        
        # Update profile
        profile = db.query(UserProfile).filter(
            UserProfile.user_id == current_user['id']
        ).first()
        
        if profile:
            profile.avatar_url = avatar_url
            profile.updated_at = datetime.utcnow()
            db.commit()
        
        return {"avatar_url": avatar_url}
    
    except Exception as e:
        logger.error(f"Avatar upload error: {e}")
        raise HTTPException(status_code=500, detail="Failed to upload avatar")

# ==================== USER SETTINGS ====================

@app.get("/users/me/settings")
async def get_my_settings(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's settings"""
    settings = db.query(UserSettings).filter(
        UserSettings.user_id == current_user['id']
    ).first()
    
    if not settings:
        # Create default settings
        settings = UserSettings(
            user_id=current_user['id'],
            language='vi',
            timezone='Asia/Ho_Chi_Minh',
            email_notifications=True
        )
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings

@app.put("/users/me/settings")
async def update_my_settings(
    settings_data: UserSettingsUpdate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's settings"""
    settings = db.query(UserSettings).filter(
        UserSettings.user_id == current_user['id']
    ).first()
    
    if not settings:
        settings = UserSettings(user_id=current_user['id'])
        db.add(settings)
    
    update_data = settings_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(settings, field, value)
    
    settings.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(settings)
    
    return settings

# ==================== ACTIVITY LOGS ====================

@app.get("/users/me/activities", response_model=List[ActivityLogResponse])
async def get_my_activities(
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's activity logs"""
    activities = db.query(ActivityLog).filter(
        ActivityLog.user_id == current_user['id']
    ).order_by(ActivityLog.created_at.desc()).limit(limit).all()
    
    return activities

@app.post("/users/me/activities")
async def log_activity(
    activity_data: dict,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Log user activity"""
    log = ActivityLog(
        user_id=current_user['id'],
        action=activity_data['action'],
        entity_type=activity_data.get('entity_type'),
        entity_id=activity_data.get('entity_id'),
        details=activity_data.get('details', {}),
        ip_address=activity_data.get('ip_address')
    )
    
    db.add(log)
    db.commit()
    
    return {"message": "Activity logged"}

# ==================== USER MANAGEMENT (Admin) ====================

@app.get("/users", response_model=List[UserResponse])
async def list_users(
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    skip: int = 0,
    limit: int = 50,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all users (Admin only)"""
    if current_user['role'] not in ['admin', 'manager']:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    query = db.query(User)
    
    if role:
        query = query.filter(User.role == role)
    if is_active is not None:
        query = query.filter(User.is_active == is_active)
    
    users = query.offset(skip).limit(limit).all()
    return users

@app.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user by ID (Admin/Manager only)"""
    if current_user['role'] not in ['admin', 'manager']:
        if current_user['id'] != user_id:
            raise HTTPException(status_code=403, detail="Permission denied")
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@app.put("/users/{user_id}/activate")
async def activate_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Activate user (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = True
    user.updated_at = datetime.utcnow()
    db.commit()
    
    publish_event("user.activated", {
        "user_id": user_id,
        "activated_by": current_user['id']
    }, queue_name='user_events')
    
    return {"message": "User activated"}

@app.put("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deactivate user (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = False
    user.updated_at = datetime.utcnow()
    db.commit()
    
    publish_event("user.deactivated", {
        "user_id": user_id,
        "deactivated_by": current_user['id']
    }, queue_name='user_events')
    
    return {"message": "User deactivated"}

@app.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user (Admin only)"""
    if current_user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Admin access required")
    
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    db.delete(user)
    db.commit()
    
    publish_event("user.deleted", {
        "user_id": user_id,
        "deleted_by": current_user['id']
    }, queue_name='user_events')
    
    return {"message": "User deleted"}

# ==================== STATISTICS ====================

@app.get("/users/stats/summary")
async def get_user_stats(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user statistics (Admin/Manager only)"""
    if current_user['role'] not in ['admin', 'manager']:
        raise HTTPException(status_code=403, detail="Permission denied")
    
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    
    by_role = db.query(
        User.role, 
        db.func.count(User.id)
    ).group_by(User.role).all()
    
    recent_registrations = db.query(User).filter(
        User.created_at >= datetime.utcnow() - timedelta(days=30)
    ).count()
    
    return {
        "total_users": total_users,
        "active_users": active_users,
        "inactive_users": total_users - active_users,
        "by_role": dict(by_role),
        "recent_registrations": recent_registrations
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "user-service"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)