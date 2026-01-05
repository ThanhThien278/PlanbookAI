from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import httpx
import uvicorn
import logging
import redis
import json
from typing import Optional

from config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="API Gateway", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis client for caching
redis_client = redis.Redis.from_url(settings.REDIS_URL, decode_responses=True)

# Service URLs mapping
SERVICES = {
    "auth": settings.AUTH_SERVICE_URL,
    "users": settings.USER_SERVICE_URL,
    "questions": settings.QUESTION_SERVICE_URL,
    "exams": settings.EXAM_SERVICE_URL,
    "lessons": settings.LESSON_SERVICE_URL,
    "ocr": settings.OCR_SERVICE_URL,
    "packages": settings.PACKAGE_SERVICE_URL,
}

# Public endpoints that don't require authentication
PUBLIC_ENDPOINTS = [
    "/auth/register",
    "/auth/login",
    "/auth/health",
    "/health",
    "/docs",
    "/openapi.json"
]

def is_public_endpoint(path: str) -> bool:
    """Check if endpoint is public"""
    return any(path.startswith(endpoint) for endpoint in PUBLIC_ENDPOINTS)

async def verify_token(token: str) -> Optional[dict]:
    """Verify JWT token with auth service"""
    try:
        # Check cache first
        cached_user = redis_client.get(f"token:{token}")
        if cached_user:
            return json.loads(cached_user)
        
        # Verify with auth service
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{SERVICES['auth']}/me",
                headers={"Authorization": f"Bearer {token}"},
                timeout=5.0
            )
            
            if response.status_code == 200:
                user_data = response.json()
                # Cache for 5 minutes
                redis_client.setex(f"token:{token}", 300, json.dumps(user_data))
                return user_data
            
            return None
    except Exception as e:
        logger.error(f"Token verification error: {e}")
        return None

@app.middleware("http")
async def authentication_middleware(request: Request, call_next):
    """Authentication middleware"""
    path = request.url.path
    
    # Skip auth for public endpoints
    if is_public_endpoint(path):
        return await call_next(request)
    
    # Get token from header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return JSONResponse(
            status_code=401,
            content={"detail": "Missing or invalid authorization header"}
        )
    
    token = auth_header.split(" ")[1]
    
    # Verify token
    user_data = await verify_token(token)
    if not user_data:
        return JSONResponse(
            status_code=401,
            content={"detail": "Invalid or expired token"}
        )
    
    # Add user info to request state
    request.state.user = user_data
    
    response = await call_next(request)
    return response

async def proxy_request(request: Request, service_url: str):
    """Proxy request to service"""
    try:
        # Build target URL
        path = request.url.path
        query = str(request.url.query)
        target_url = f"{service_url}{path}"
        if query:
            target_url += f"?{query}"
        
        # Prepare headers
        headers = dict(request.headers)
        headers.pop("host", None)
        
        # Get request body
        body = await request.body()
        
        # Forward request
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.request(
                method=request.method,
                url=target_url,
                headers=headers,
                content=body
            )
            
            # Log request
            logger.info(f"{request.method} {path} -> {service_url} [{response.status_code}]")
            
            return JSONResponse(
                status_code=response.status_code,
                content=response.json() if response.text else None,
                headers=dict(response.headers)
            )
    
    except httpx.TimeoutException:
        logger.error(f"Timeout calling {service_url}")
        raise HTTPException(status_code=504, detail="Service timeout")
    except httpx.ConnectError:
        logger.error(f"Connection error to {service_url}")
        raise HTTPException(status_code=503, detail="Service unavailable")
    except Exception as e:
        logger.error(f"Proxy error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# Auth routes
@app.api_route("/auth/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def auth_proxy(request: Request, path: str):
    return await proxy_request(request, SERVICES["auth"])

# User routes
@app.api_route("/users/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def user_proxy(request: Request, path: str):
    return await proxy_request(request, SERVICES["users"])

# Question routes
@app.api_route("/questions/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def question_proxy(request: Request, path: str):
    return await proxy_request(request, SERVICES["questions"])

# Exam routes
@app.api_route("/exams/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def exam_proxy(request: Request, path: str):
    return await proxy_request(request, SERVICES["exams"])

# Lesson routes
@app.api_route("/lessons/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def lesson_proxy(request: Request, path: str):
    return await proxy_request(request, SERVICES["lessons"])

# OCR routes
@app.api_route("/ocr/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def ocr_proxy(request: Request, path: str):
    return await proxy_request(request, SERVICES["ocr"])

# Package routes
@app.api_route("/packages/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def package_proxy(request: Request, path: str):
    return await proxy_request(request, SERVICES["packages"])

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    service_health = {}
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        for service_name, service_url in SERVICES.items():
            try:
                response = await client.get(f"{service_url}/health")
                service_health[service_name] = "healthy" if response.status_code == 200 else "unhealthy"
            except:
                service_health[service_name] = "unreachable"
    
    all_healthy = all(status == "healthy" for status in service_health.values())
    
    return {
        "status": "healthy" if all_healthy else "degraded",
        "service": "api-gateway",
        "services": service_health
    }

@app.get("/")
async def root():
    return {
        "service": "PlanbookAI API Gateway",
        "version": "1.0.0",
        "status": "running"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
