from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Redis
    REDIS_URL: str = "redis://redis:6379"
    
    # Service URLs
    AUTH_SERVICE_URL: str = "http://auth-service:8001"
    USER_SERVICE_URL: str = "http://user-service:8002"
    QUESTION_SERVICE_URL: str = "http://question-service:8003"
    EXAM_SERVICE_URL: str = "http://exam-service:8004"
    LESSON_SERVICE_URL: str = "http://lesson-service:8005"
    OCR_SERVICE_URL: str = "http://ocr-service:8006"
    PACKAGE_SERVICE_URL: str = "http://package-service:8007"
    
    class Config:
        env_file = ".env"

settings = Settings()