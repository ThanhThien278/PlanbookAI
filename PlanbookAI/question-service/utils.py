from fastapi import HTTPException, Header
from typing import Optional, Dict
import jwt
import pika
import json
import logging
from datetime import datetime
import os

logger = logging.getLogger(__name__)

# =========================
# CONFIG (NÊN ĐỂ ENV)
# =========================

JWT_SECRET = os.getenv("JWT_SECRET", "change-me-in-production")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")

RABBITMQ_HOST = os.getenv("RABBITMQ_HOST", "rabbitmq")
RABBITMQ_USER = os.getenv("RABBITMQ_USER", "admin")
RABBITMQ_PASSWORD = os.getenv("RABBITMQ_PASSWORD", "admin123")
RABBITMQ_QUEUE = os.getenv("RABBITMQ_QUEUE", "question_events")

# =========================
# JWT
# =========================

def decode_token(token: str) -> Dict:
    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[JWT_ALGORITHM]
        )
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")

    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")


async def get_current_user(
    authorization: Optional[str] = Header(None)
) -> Dict:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")

    try:
        scheme, token = authorization.split()
    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid Authorization header format"
        )

    if scheme.lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication scheme"
        )

    payload = decode_token(token)

    user_id = payload.get("sub")
    role = payload.get("role")

    if not user_id or not role:
        raise HTTPException(
            status_code=401,
            detail="Invalid token payload"
        )

    return {
        "id": user_id,
        "role": role
    }

# =========================
# EVENT PUBLISHER
# =========================

def publish_event(
    event_type: str,
    data: dict,
    queue_name: str = RABBITMQ_QUEUE
):
    """
    Publish event to RabbitMQ.
    Không throw exception để tránh làm hỏng request chính.
    """

    try:
        credentials = pika.PlainCredentials(
            RABBITMQ_USER,
            RABBITMQ_PASSWORD
        )

        parameters = pika.ConnectionParameters(
            host=RABBITMQ_HOST,
            credentials=credentials,
            heartbeat=600,
            blocked_connection_timeout=5
        )

        connection = pika.BlockingConnection(parameters)
        channel = connection.channel()

        channel.queue_declare(
            queue=queue_name,
            durable=True
        )

        message = {
            "event_type": event_type,
            "data": data,
            "timestamp": datetime.utcnow().isoformat()
        }

        channel.basic_publish(
            exchange="",
            routing_key=queue_name,
            body=json.dumps(message),
            properties=pika.BasicProperties(
                delivery_mode=2  # persistent
            )
        )

        connection.close()
        logger.info(f"Published event: {event_type}")

    except Exception as e:
        # Không raise exception để tránh crash API
        logger.error(
            f"Failed to publish event {event_type}: {str(e)}"
        )
