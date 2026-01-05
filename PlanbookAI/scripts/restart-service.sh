#!/bin/bash

if [ -z "$1" ]; then
    echo "Usage: ./restart-service.sh <service-name>"
    echo "Available services:"
    echo "  - api-gateway"
    echo "  - auth-service"
    echo "  - user-service"
    echo "  - question-service"
    echo "  - exam-service"
    echo "  - lesson-service"
    echo "  - ocr-service"
    echo "  - package-service"
    exit 1
fi

SERVICE=$1

echo "🔄 Restarting $SERVICE..."
docker-compose restart $SERVICE

echo "✅ $SERVICE restarted!"
echo ""
echo "View logs:"
echo "  docker-compose logs -f $SERVICE"
