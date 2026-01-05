from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://admin:admin123@postgres:5432/planbookai"
    
    # RabbitMQ
    RABBITMQ_URL: str = "amqp://admin:admin123@rabbitmq:5672/"
    
    # Redis
    REDIS_URL: str = "redis://redis:6379"
    
    # Question Service URL
    QUESTION_SERVICE_URL: str = "http://question-service:8003"
    
    class Config:
        env_file = ".env"

settings = Settings()




