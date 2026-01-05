from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
import uvicorn
import logging
import secrets

from models import (
    Package, PackageCreate, PackageResponse,
    Order, OrderCreate, OrderResponse,
    Subscription, SubscriptionResponse
)
from database import get_db, engine, Base
from config import settings
from utils import get_current_user, publish_event, require_roles

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Package Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== PACKAGES ====================

@app.get("/packages", response_model=List[PackageResponse])
async def list_packages(
    is_active: Optional[bool] = True,
    db: Session = Depends(get_db)
):
    """List all packages"""
    query = db.query(Package)
    
    if is_active is not None:
        query = query.filter(Package.is_active == is_active)
    
    packages = query.order_by(Package.price).all()
    return packages

@app.get("/packages/{package_id}", response_model=PackageResponse)
async def get_package(
    package_id: str,
    db: Session = Depends(get_db)
):
    """Get package by ID"""
    package = db.query(Package).filter(Package.id == package_id).first()
    
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    return package

@app.post("/packages", response_model=PackageResponse)
async def create_package(
    package_data: PackageCreate,
    current_user: dict = Depends(require_roles('admin', 'manager')),
    db: Session = Depends(get_db)
):
    """Create new package (Admin/Manager only)"""
    db_package = Package(
        name=package_data.name,
        description=package_data.description,
        price=package_data.price,
        duration_days=package_data.duration_days,
        features=package_data.features,
        max_questions=package_data.max_questions,
        max_exams=package_data.max_exams,
        max_lessons=package_data.max_lessons,
        max_storage_mb=package_data.max_storage_mb,
        is_active=True
    )
    
    db.add(db_package)
    db.commit()
    db.refresh(db_package)
    
    publish_event("package.created", {
        "package_id": str(db_package.id),
        "name": db_package.name,
        "price": float(db_package.price)
    }, queue_name='package_events')
    
    return db_package

@app.put("/packages/{package_id}", response_model=PackageResponse)
async def update_package(
    package_id: str,
    package_data: PackageCreate,
    current_user: dict = Depends(require_roles('admin', 'manager')),
    db: Session = Depends(get_db)
):
    """Update package"""
    package = db.query(Package).filter(Package.id == package_id).first()
    
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    for field, value in package_data.dict(exclude_unset=True).items():
        setattr(package, field, value)
    
    package.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(package)
    
    return package

@app.delete("/packages/{package_id}")
async def delete_package(
    package_id: str,
    current_user: dict = Depends(require_roles('admin')),
    db: Session = Depends(get_db)
):
    """Delete package (Admin only)"""
    package = db.query(Package).filter(Package.id == package_id).first()
    
    if not package:
        raise HTTPException(status_code=404, detail="Package not found")
    
    # Soft delete
    package.is_active = False
    package.updated_at = datetime.utcnow()
    db.commit()
    
    return {"message": "Package deleted successfully"}

# ==================== ORDERS ====================

@app.post("/orders", response_model=OrderResponse)
async def create_order(
    order_data: OrderCreate,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create new order"""
    # Get package
    package = db.query(Package).filter(Package.id == order_data.package_id).first()
    
    if not package or not package.is_active:
        raise HTTPException(status_code=404, detail="Package not found")
    
    # Generate unique order code
    order_code = f"ORD-{datetime.utcnow().strftime('%Y%m%d')}-{secrets.token_hex(4).upper()}"
    
    # Calculate dates
    start_date = datetime.utcnow()
    end_date = start_date + timedelta(days=package.duration_days)
    
    # Create order
    db_order = Order(
        user_id=current_user['id'],
        package_id=package.id,
        order_code=order_code,
        amount=package.price,
        status="pending",
        payment_method=order_data.payment_method,
        start_date=start_date,
        end_date=end_date
    )
    
    db.add(db_order)
    db.commit()
    db.refresh(db_order)
    
    publish_event("order.created", {
        "order_id": str(db_order.id),
        "user_id": current_user['id'],
        "package_id": str(package.id),
        "amount": float(package.price),
        "order_code": order_code
    }, queue_name='order_events')
    
    logger.info(f"Order created: {order_code}")
    
    return db_order

@app.get("/orders", response_model=List[OrderResponse])
async def list_orders(
    status: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List orders"""
    query = db.query(Order)
    
    # Regular users see only their orders
    if current_user['role'] not in ['admin', 'manager']:
        query = query.filter(Order.user_id == current_user['id'])
    
    if status:
        query = query.filter(Order.status == status)
    
    orders = query.order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return orders

@app.get("/orders/{order_id}", response_model=OrderResponse)
async def get_order(
    order_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get order by ID"""
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check access
    if order.user_id != current_user['id']:
        if current_user['role'] not in ['admin', 'manager']:
            raise HTTPException(status_code=403, detail="Access denied")
    
    return order

@app.post("/orders/{order_id}/confirm")
async def confirm_payment(
    order_id: str,
    payment_details: dict,
    current_user: dict = Depends(require_roles('admin', 'manager')),
    db: Session = Depends(get_db)
):
    """Confirm payment (Admin/Manager only)"""
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    if order.status != "pending":
        raise HTTPException(status_code=400, detail="Order is not pending")
    
    # Update order
    order.status = "completed"
    order.payment_date = datetime.utcnow()
    order.updated_at = datetime.utcnow()
    db.commit()
    
    # Create/update subscription
    subscription = db.query(Subscription).filter(
        Subscription.user_id == order.user_id
    ).first()
    
    if subscription:
        # Extend existing subscription
        if subscription.end_date and subscription.end_date > datetime.utcnow():
            subscription.end_date = subscription.end_date + timedelta(days=order.duration_days)
        else:
            subscription.start_date = datetime.utcnow()
            subscription.end_date = datetime.utcnow() + timedelta(days=order.duration_days)
        subscription.package_id = order.package_id
        subscription.is_active = True
    else:
        # Create new subscription
        subscription = Subscription(
            user_id=order.user_id,
            package_id=order.package_id,
            start_date=order.start_date,
            end_date=order.end_date,
            is_active=True
        )
        db.add(subscription)
    
    subscription.updated_at = datetime.utcnow()
    db.commit()
    
    # Publish events
    publish_event("order.completed", {
        "order_id": str(order.id),
        "user_id": str(order.user_id),
        "package_id": str(order.package_id)
    }, queue_name='order_events')
    
    publish_event("subscription.activated", {
        "user_id": str(order.user_id),
        "package_id": str(order.package_id),
        "end_date": order.end_date.isoformat()
    }, queue_name='subscription_events')
    
    return {"message": "Payment confirmed", "order": order}

@app.post("/orders/{order_id}/cancel")
async def cancel_order(
    order_id: str,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cancel order"""
    order = db.query(Order).filter(Order.id == order_id).first()
    
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    # Check permission
    if order.user_id != current_user['id']:
        if current_user['role'] not in ['admin']:
            raise HTTPException(status_code=403, detail="Access denied")
    
    if order.status not in ['pending']:
        raise HTTPException(status_code=400, detail="Cannot cancel this order")
    
    order.status = "cancelled"
    order.updated_at = datetime.utcnow()
    db.commit()
    
    publish_event("order.cancelled", {
        "order_id": str(order.id),
        "user_id": str(order.user_id)
    }, queue_name='order_events')
    
    return {"message": "Order cancelled"}

# ==================== SUBSCRIPTIONS ====================

@app.get("/subscription/current", response_model=SubscriptionResponse)
async def get_current_subscription(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's subscription"""
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user['id']
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="No active subscription")
    
    # Check if expired
    if subscription.end_date < datetime.utcnow():
        subscription.is_active = False
        db.commit()
    
    return subscription

@app.get("/subscription/check")
async def check_subscription(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check subscription status and limits"""
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user['id'],
        Subscription.is_active == True
    ).first()
    
    if not subscription:
        return {
            "has_subscription": False,
            "package": None,
            "limits": None,
            "expires_at": None
        }
    
    # Get package details
    package = db.query(Package).filter(Package.id == subscription.package_id).first()
    
    # Calculate usage (mock - in production, query actual usage)
    usage = {
        "questions_used": 0,
        "exams_used": 0,
        "lessons_used": 0,
        "storage_used_mb": 0
    }
    
    return {
        "has_subscription": True,
        "package": {
            "name": package.name,
            "price": float(package.price)
        },
        "limits": {
            "max_questions": package.max_questions,
            "max_exams": package.max_exams,
            "max_lessons": package.max_lessons,
            "max_storage_mb": package.max_storage_mb
        },
        "usage": usage,
        "expires_at": subscription.end_date,
        "days_remaining": (subscription.end_date - datetime.utcnow()).days
    }

# ==================== STATISTICS ====================

@app.get("/stats/revenue")
async def get_revenue_stats(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: dict = Depends(require_roles('admin', 'manager')),
    db: Session = Depends(get_db)
):
    """Get revenue statistics (Admin/Manager only)"""
    query = db.query(Order).filter(Order.status == "completed")
    
    if start_date:
        query = query.filter(Order.payment_date >= start_date)
    if end_date:
        query = query.filter(Order.payment_date <= end_date)
    
    orders = query.all()
    
    total_revenue = sum(float(order.amount) for order in orders)
    total_orders = len(orders)
    
    # Revenue by package
    revenue_by_package = {}
    for order in orders:
        package = db.query(Package).filter(Package.id == order.package_id).first()
        if package:
            if package.name not in revenue_by_package:
                revenue_by_package[package.name] = 0
            revenue_by_package[package.name] += float(order.amount)
    
    return {
        "total_revenue": total_revenue,
        "total_orders": total_orders,
        "average_order_value": total_revenue / total_orders if total_orders > 0 else 0,
        "revenue_by_package": revenue_by_package
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "package-service"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8007)