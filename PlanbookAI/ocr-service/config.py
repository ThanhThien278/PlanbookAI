from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql://admin:admin123@postgres:5432/planbookai"
    RABBITMQ_URL: str = "amqp://admin:admin123@rabbitmq:5672/"
    REDIS_URL: str = "redis://redis:6379"
    GEMINI_API_KEY: str = "your-gemini-api-key"
    
    class Config:
        env_file = ".env"

settings = Settings()