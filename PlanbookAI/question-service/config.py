from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = "postgresql://admin:admin123@postgres:5432/planbookai"
    
    # RabbitMQ
    RABBITMQ_URL: str = "amqp://admin:admin123@rabbitmq:5672/"
    
    # Redis
    REDIS_URL: str = "redis://redis:6379"
    
    class Config:
        env_file = ".env"

settings = Settings()




