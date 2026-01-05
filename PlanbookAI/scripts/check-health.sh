echo "🏥 Checking health of all services..."
echo ""

services=(
    "api-gateway:8000"
    "auth-service:8001"
    "user-service:8002"
    "question-service:8003"
    "exam-service:8004"
    "lesson-service:8005"
    "ocr-service:8006"
    "package-service:8007"
)

for service in "${services[@]}"; do
    IFS=':' read -ra PARTS <<< "$service"
    name="${PARTS[0]}"
    port="${PARTS[1]}"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$port/health 2>/dev/null)
    
    if [ "$response" = "200" ]; then
        echo "✅ $name (port $port) - Healthy"
    else
        echo "❌ $name (port $port) - Unhealthy (HTTP $response)"
    fi
done