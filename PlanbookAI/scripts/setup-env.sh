echo "🚀 Setting up PlanbookAI Microservices Environment..."

# Create .env file if not exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'EOF'
# Database Configuration
POSTGRES_DB=planbookai
POSTGRES_USER=admin
POSTGRES_PASSWORD=admin123
DATABASE_URL=postgresql://admin:admin123@postgres:5432/planbookai

# RabbitMQ Configuration
RABBITMQ_DEFAULT_USER=admin
RABBITMQ_DEFAULT_PASS=admin123
RABBITMQ_URL=amqp://admin:admin123@rabbitmq:5672/

# Redis Configuration
REDIS_URL=redis://redis:6379

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-please
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Service URLs
AUTH_SERVICE_URL=http://auth-service:8001
USER_SERVICE_URL=http://user-service:8002
QUESTION_SERVICE_URL=http://question-service:8003
EXAM_SERVICE_URL=http://exam-service:8004
LESSON_SERVICE_URL=http://lesson-service:8005
OCR_SERVICE_URL=http://ocr-service:8006
PACKAGE_SERVICE_URL=http://package-service:8007

# External APIs
GEMINI_API_KEY=your-gemini-api-key-here
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key

# Frontend
REACT_APP_API_GATEWAY_URL=http://localhost:8000
EOF
    echo "✅ .env file created!"
else
    echo "✅ .env file already exists!"
fi

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p database/init
mkdir -p logs

echo "✅ Environment setup completed!"
echo ""
echo "Next steps:"
echo "1. Update .env with your actual API keys"
echo "2. Run: ./scripts/build-all.sh"
echo "3. Run: ./scripts/start-all.sh"
