# 🎓 PlanbookAI - AI Tools Portal for High School Teachers

## 📖 Giới Thiệu

**PlanbookAI** là một hệ thống microservices hoàn chỉnh được xây dựng bằng **Python FastAPI**, hỗ trợ giáo viên trung học phổ thông trong việc:
- 📝 Quản lý ngân hàng câu hỏi
- 📋 Tạo đề thi và bài tập tự động
- 🤖 Chấm điểm tự động bằng OCR và AI
- 📚 Quản lý giáo án
- 💰 Quản lý gói dịch vụ và đăng ký

## 🏗️ Kiến Trúc Hệ Thống

### Microservices Architecture
```
┌──────────────────────────────────────────────────────────┐
│                      Client Layer                         │
│              (Web Browser / Mobile App)                   │
└────────────────────────┬─────────────────────────────────┘
                         │
                         ▼
┌────────────────────────────────────────────────────────────┐
│                   API Gateway (Port 8000)                   │
│  • Request Routing     • Authentication                     │
│  • Rate Limiting       • Load Balancing                     │
└────────┬───────────────────────────────────────────────────┘
         │
    ┌────┴────┬────────┬─────────┬─────────┬─────────┬────────┐
    ▼         ▼        ▼         ▼         ▼         ▼        ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│  Auth  │ │  User  │ │Question│ │  Exam  │ │ Lesson │ │  OCR   │
│  :8001 │ │  :8002 │ │  :8003 │ │  :8004 │ │  :8005 │ │  :8006 │
└───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘ └───┬────┘
    │          │          │          │          │          │
    └──────────┴──────────┴──────────┴──────────┴──────────┘
                          │
         ┌────────────────┼────────────────────────┐
         ▼                ▼                        ▼
    ┌──────────┐    ┌──────────┐           ┌──────────┐
    │PostgreSQL│    │ RabbitMQ │           │  Redis   │
    │   :5432  │    │   :5672  │           │  :6379   │
    └──────────┘    └──────────┘           └──────────┘
```

### Tech Stack

**Backend:**
- 🐍 **Python 3.11** - Programming Language
- ⚡ **FastAPI** - Modern, fast web framework
- 🗄️ **PostgreSQL** - Relational Database
- 🐰 **RabbitMQ** - Message Broker for Event-Driven Architecture
- 🔴 **Redis** - Caching & Session Management
- 🔐 **JWT** - Authentication
- 🗃️ **SQLAlchemy** - ORM
- 🐳 **Docker** - Containerization

**Frontend:**
- ⚛️ **React.js** - UI Framework
- 🎨 **Tailwind CSS** - Styling
- 📡 **Axios** - HTTP Client

**External Services:**
- 🤖 **Gemini AI** - OCR & AI Analysis
- ☁️ **Supabase** - File Storage

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Git
- 8GB RAM minimum

### Installation

1. **Clone repository**
```bash
git clone https://github.com/yourusername/planbookai-microservices.git
cd planbookai-microservices
```

2. **Setup environment**
```bash
chmod +x scripts/*.sh
./scripts/setup-env.sh
```

3. **Update .env file**
```bash
nano .env
# Update GEMINI_API_KEY with your actual API key
```

4. **Build all services**
```bash
./scripts/build-all.sh
```

5. **Start all services**
```bash
./scripts/start-all.sh
```

6. **Check health**
```bash
./scripts/check-health.sh
```

### Access Points

- 🌐 **API Gateway**: http://localhost:8000
- 📚 **API Documentation**: http://localhost:8000/docs
- 🐰 **RabbitMQ Management**: http://localhost:15672 (admin/admin123)
- 💻 **Frontend**: http://localhost:3000
- 🗄️ **PostgreSQL**: localhost:5432 (admin/admin123)
- 🔴 **Redis**: localhost:6379

## 📂 Project Structure

```
planbookai-microservices/
├── 📄 docker-compose.yml          # Orchestration file
├── 📄 .env                        # Environment variables
├── 📁 database/                   # Database scripts
│   └── init/
│       └── 01-create-tables.sql   # Schema initialization
├── 📁 api-gateway/                # API Gateway Service
│   ├── main.py                    # Gateway application
│   ├── config.py                  # Configuration
│   ├── requirements.txt           # Dependencies
│   └── Dockerfile
├── 📁 auth-service/               # Authentication Service
│   ├── main.py                    # Auth endpoints
│   ├── models.py                  # User models
│   ├── database.py                # Database config
│   ├── config.py
│   ├── requirements.txt
│   └── Dockerfile
├── 📁 user-service/               # User Management Service
├── 📁 question-service/           # Question Bank Service
│   ├── main.py                    # Question CRUD
│   ├── models.py                  # Question models
│   └── utils.py                   # Shared utilities
├── 📁 exam-service/               # Exam Management Service
│   ├── main.py                    # Exam creation & management
│   └── models.py                  # Exam models
├── 📁 lesson-service/             # Lesson Plan Service
├── 📁 ocr-service/                # OCR Grading Service
│   ├── main.py                    # OCR processing
│   ├── workers/                   # Background workers
│   └── gemini_client.py           # AI integration
├── 📁 package-service/            # Package & Subscription Service
├── 📁 frontend/                   # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   └── App.js
│   └── Dockerfile
└── 📁 scripts/                    # Utility scripts
    ├── setup-env.sh               # Environment setup
    ├── start-all.sh               # Start all services
    ├── stop-all.sh                # Stop all services
    ├── build-all.sh               # Build all images
    ├── check-health.sh            # Health check
    └── test-api.sh                # API testing
```

## 🔑 Core Services

### 1. API Gateway (Port 8000)
**Chức năng:**
- Single entry point cho tất cả requests
- Authentication middleware với JWT
- Request routing đến các microservices
- Rate limiting & caching
- Health monitoring

**Endpoints:**
```
GET  /health                      # Health check
ALL  /auth/*                      # → Auth Service
ALL  /users/*                     # → User Service
ALL  /questions/*                 # → Question Service
ALL  /exams/*                     # → Exam Service
ALL  /lessons/*                   # → Lesson Service
ALL  /ocr/*                       # → OCR Service
ALL  /packages/*                  # → Package Service
```

### 2. Auth Service (Port 8001)
**Chức năng:**
- User registration & login
- JWT token generation & verification
- Password hashing (bcrypt)
- Role-based access control

**Endpoints:**
```
POST /register                    # Đăng ký user mới
POST /login                       # Đăng nhập
GET  /me                         # Lấy thông tin user hiện tại
POST /logout                     # Đăng xuất
GET  /health                     # Health check
```

**User Roles:**
- `admin` - Full system access
- `manager` - Content approval, analytics
- `staff` - Create templates & questions
- `teacher` - Create exams & grade

### 3. Question Service (Port 8003)
**Chức năng:**
- Quản lý ngân hàng câu hỏi
- CRUD operations
- Search & filter
- Question approval workflow

**Endpoints:**
```
POST   /questions                 # Tạo câu hỏi mới
GET    /questions                 # Danh sách câu hỏi (filter)
GET    /questions/{id}            # Chi tiết câu hỏi
PUT    /questions/{id}            # Cập nhật câu hỏi
DELETE /questions/{id}            # Xóa câu hỏi
POST   /questions/{id}/approve    # Duyệt câu hỏi (Manager)
GET    /questions/stats/summary   # Thống kê
```

**Question Types:**
- `multiple_choice` - Trắc nghiệm
- `short_answer` - Câu trả lời ngắn
- `essay` - Tự luận
- `true_false` - Đúng/Sai

### 4. Exam Service (Port 8004)
**Chức năng:**
- Tạo đề thi từ ngân hàng câu hỏi
- Randomize câu hỏi
- Manage exam versions
- Publish/unpublish exams

**Endpoints:**
```
POST   /exams                     # Tạo đề thi
POST   /exams/{id}/questions      # Thêm câu hỏi vào đề
GET    /exams                     # Danh sách đề thi
GET    /exams/{id}                # Chi tiết đề + câu hỏi
PUT    /exams/{id}                # Cập nhật đề thi
DELETE /exams/{id}                # Xóa đề thi
POST   /exams/{id}/publish        # Xuất bản đề thi
```

### 5. OCR Service (Port 8006)
**Chức năng:**
- Upload ảnh bài làm
- OCR text extraction
- Gemini AI analysis
- Auto grading
- Generate feedback

**Endpoints:**
```
POST /ocr/grade                   # Upload & chấm điểm
GET  /ocr/result/{id}             # Lấy kết quả
GET  /ocr/queue                   # Queue status
```

**Processing Flow:**
```
1. Teacher upload ảnh bài thi
   ↓
2. Image stored in queue (status: pending)
   ↓
3. RabbitMQ worker picks up job
   ↓
4. OCR extracts text from image
   ↓
5. Gemini AI analyzes answers
   ↓
6. Compare with correct answers
   ↓
7. Calculate score & generate feedback
   ↓
8. Update status: completed
   ↓
9. Notify teacher
```

### 6. Package Service (Port 8007)
**Chức năng:**
- Quản lý gói dịch vụ
- Process subscriptions
- Order management
- Payment integration

**Packages:**
- **Free**: 50 questions, 5 exams, 5 lessons (30 days)
- **Basic**: 200 questions, 20 exams, 20 lessons - 99,000 VND/month
- **Professional**: 1000 questions, 100 exams, 100 lessons - 299,000 VND/month
- **Premium**: Unlimited - 599,000 VND/month

## 🔐 Authentication Flow

### Registration
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "teacher@school.com",
  "username": "teacher123",
  "password": "securepass",
  "full_name": "Nguyen Van A",
  "role": "teacher"
}

Response: 201 Created
{
  "id": "uuid",
  "email": "teacher@school.com",
  "username": "teacher123",
  "role": "teacher",
  "created_at": "2024-01-01T00:00:00"
}
```

### Login
```bash
POST /auth/login
Content-Type: application/x-www-form-urlencoded

username=teacher123&password=securepass

Response: 200 OK
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer"
}
```

### Using Token
```bash
GET /questions
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

## 📊 Event-Driven Architecture

### RabbitMQ Queues

1. **user_events**
   - `user.created` - User đăng ký
   - `user.updated` - User cập nhật profile
   - `user.logged_in` - User đăng nhập
   - `user.logged_out` - User đăng xuất

2. **question_events**
   - `question.created` - Câu hỏi mới
   - `question.updated` - Câu hỏi cập nhật
   - `question.approved` - Câu hỏi được duyệt
   - `question.deleted` - Câu hỏi bị xóa

3. **exam_events**
   - `exam.created` - Đề thi mới
   - `exam.published` - Đề thi xuất bản
   - `exam.deleted` - Đề thi bị xóa

4. **ocr_queue**
   - OCR grading jobs

5. **notification_queue**
   - Email notifications
   - In-app notifications

### Event Publishing Example
```python
publish_event("user.created", {
    "user_id": "uuid",
    "email": "user@example.com",
    "role": "teacher",
    "timestamp": "2024-01-01T00:00:00"
})
```

## 🗄️ Database Schema

### Core Tables

**users** - User accounts
- id (UUID, PK)
- email, username (unique)
- password_hash
- role (admin|manager|staff|teacher)
- is_active, is_verified

**questions** - Question bank
- id (UUID, PK)
- created_by (FK → users)
- subject, topic, grade_level
- question_type, difficulty
- question_text, options (JSONB)
- correct_answer, explanation
- tags (ARRAY), status

**exams** - Exam definitions
- id (UUID, PK)
- created_by (FK → users)
- title, description, subject
- exam_type, duration_minutes
- total_points, passing_score
- is_randomized, is_public

**exam_questions** - Exam-Question mapping
- exam_id (FK → exams)
- question_id (FK → questions)
- question_order, points

**student_results** - Grading results
- id (UUID, PK)
- exam_id (FK → exams)
- student_name, student_id
- answers (JSONB), score
- feedback, graded_at

## 🧪 Testing

### Run All Tests
```bash
./scripts/test-api.sh
```

### Manual Testing

1. **Register**
```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "username": "testuser",
    "password": "test123456",
    "role": "teacher"
  }'
```

2. **Login**
```bash
curl -X POST http://localhost:8000/auth/login \
  -d "username=testuser&password=test123456"
```

3. **Create Question** (với token)
```bash
curl -X POST http://localhost:8000/questions \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Chemistry",
    "topic": "Organic",
    "question_type": "multiple_choice",
    "question_text": "What is H2O?",
    "options": {"A": "Water", "B": "Salt"},
    "correct_answer": "A"
  }'
```

## 📈 Monitoring & Logs

### View Logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f auth-service

# Using script
./scripts/logs.sh auth-service
```

### Health Check
```bash
# Check all services
./scripts/check-health.sh

# Manual check
curl http://localhost:8000/health
```

### RabbitMQ Management
- URL: http://localhost:15672
- Username: admin
- Password: admin123
- Monitor: Queues, Messages, Connections

## 🔧 Development

### Add New Service

1. Create service directory
```bash
mkdir new-service
cd new-service
```

2. Create files
```
new-service/
├── main.py
├── models.py
├── database.py
├── requirements.txt
└── Dockerfile
```

3. Add to docker-compose.yml
```yaml
new-service:
  build: ./new-service
  ports:
    - "8008:8008"
  environment:
    - DATABASE_URL=...
```

4. Add route in API Gateway
```python
@app.api_route("/newservice/{path:path}", methods=["GET", "POST"])
async def new_proxy(request: Request, path: str):
    return await proxy_request(request, "http://new-service:8008")
```

### Database Migration
```bash
# Create migration
alembic revision --autogenerate -m "description"

# Run migration
alembic upgrade head

# Rollback
alembic downgrade -1
```

## 🐛 Troubleshooting

### Service won't start
```bash
# Check logs
docker-compose logs service-name

# Rebuild
docker-compose build --no-cache service-name
docker-compose up -d service-name
```

### Database connection error
```bash
# Restart PostgreSQL
docker-compose restart postgres

# Check if running
docker-compose ps postgres

# Connect manually
docker exec -it planbookai_postgres psql -U admin -d planbookai
```

### RabbitMQ messages stuck
```bash
# Check queue length
# Visit: http://localhost:15672

# Restart RabbitMQ
docker-compose restart rabbitmq

# Purge queue (BE CAREFUL!)
docker exec planbookai_rabbitmq rabbitmqctl purge_queue queue_name
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| DATABASE_URL | PostgreSQL connection | postgresql://admin:admin123@postgres:5432/planbookai |
| RABBITMQ_URL | RabbitMQ connection | amqp://admin:admin123@rabbitmq:5672/ |
| REDIS_URL | Redis connection | redis://redis:6379 |
| JWT_SECRET | Secret for JWT | change-in-production |
| GEMINI_API_KEY | Google AI API key | - |
| ACCESS_TOKEN_EXPIRE_MINUTES | Token expiration | 30 |

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- **Your Name** - *Initial work*

## 🙏 Acknowledgments

- FastAPI framework
- SQLAlchemy ORM
- RabbitMQ messaging
- Docker containerization
- All contributors

## 📞 Support

- Email: support@planbookai.com
- Issues: [GitHub Issues](https://github.com/yourusername/planbookai/issues)
- Docs: [Documentation](https://docs.planbookai.com)

---

Made with ❤️ for Teachers