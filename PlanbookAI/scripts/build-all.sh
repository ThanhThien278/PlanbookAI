echo "🔨 Building all Docker images..."

# Build each service
services=(
    "api-gateway"
    "auth-service"
    "user-service"
    "question-service"
    "exam-service"
    "lesson-service"
    "ocr-service"
    "package-service"
    "frontend"
)

for service in "${services[@]}"; do
    echo "Building $service..."
    docker-compose build $service
    if [ $? -eq 0 ]; then
        echo "✅ $service built successfully"
    else
        echo "❌ Failed to build $service"
        exit 1
    fi
done

echo ""
echo "✅ All services built successfully!"

# scripts/start-all.sh
#!/bin/bash

echo "🚀 Starting PlanbookAI Microservices..."

# Start infrastructure first
echo "📦 Starting infrastructure services..."
docker-compose up -d postgres rabbitmq redis

echo "⏳ Waiting for infrastructure to be ready..."
sleep 10

# Start application services
echo "🔧 Starting application services..."
docker-compose up -d

echo ""
echo "✅ All services started!"
echo ""
echo "Services status:"
docker-compose ps
echo ""
echo "Endpoints:"
echo "  - API Gateway: http://localhost:8000"
echo "  - API Docs: http://localhost:8000/docs"
echo "  - RabbitMQ Management: http://localhost:15672 (admin/admin123)"
echo "  - Frontend: http://localhost:3000"
echo ""
echo "View logs:"
echo "  docker-compose logs -f [service-name]"
echo ""
echo "Health check:"
echo "  curl http://localhost:8000/health"

# scripts/stop-all.sh
#!/bin/bash

echo "🛑 Stopping all services..."
docker-compose down

echo "✅ All services stopped!"
echo ""
echo "To remove volumes (WARNING: This will delete all data):"
echo "  docker-compose down -v"