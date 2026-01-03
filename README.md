### Giới thiệ đề tài:

1. Project Overview

Project Name:
PlanbookAI – Build an AI Tools Portal for High School Teachers
Vietnamese Name: PlanbookAI – Xây dựng cổng công cụ AI dành cho giáo viên THPT
Abbreviation: PBA

Within the scope of the Capstone Project, PlanbookAI (PBA) is developed as an AI-powered tool portal to support high school teachers. Due to limited development time, the system currently focuses on Chemistry teachers, with plans to expand to other subjects in the future.

2. Context & Problem Statement

High school teachers are responsible for both teaching and administrative tasks such as lesson planning, grading, attendance tracking, and reporting. Several key issues have been identified:

High workload & repetition: Tasks like grading and lesson preparation are repetitive and time-consuming.

Manual and fragmented processes: Many tasks are handled manually or using disconnected tools, reducing efficiency.

Lack of intelligent automation: Existing systems provide limited AI support, requiring teachers to perform most tasks manually.

Difficulty accessing resources: Teachers struggle to find suitable templates, teaching materials, and reference resources.

These challenges reduce productivity and increase work pressure on teachers.

3. Proposed Solution – PlanbookAI

PlanbookAI is an AI-powered platform designed to optimize teaching-related tasks through specialized tools such as lesson planning, exam generation, and automated grading. The platform reduces manual workload, improves efficiency, and provides each teacher with a personal workspace to organize teaching materials and resources.

4. Key Features

Question Bank Management: Centralized storage and categorization of questions by subject, topic, and difficulty.

Exercise Creation: Automatic generation of exercises based on learning objectives and student levels.

Multiple Choice Exam Generation: Flexible creation of exams with configurable questions and multiple versions.

OCR-based Grading: Automated grading of multiple-choice exams using OCR for both printed and handwritten answers.

5. System Actors

Admin: Manage users, system configuration, curriculum templates, and revenue tracking.

Manager: Manage service packages, orders, and approve educational content.

Staff: Create sample lesson plans, question banks, and AI prompt templates.

Teacher: Create lesson plans, generate exams, use OCR tools, grade multiple-choice tests, and monitor student performance.

6. Non-Functional Requirements

RESTful API consistency

High performance and scalability

Role-Based Access Control (RBAC) using user roles

7. System Requirements & Deliverables

Documentation: Full UML 2.0 documentation (URD, SRS, SAD, DDD, Testing, Deployment, User Guide).

Technology Stack:

Backend: Spring Boot

Frontend: ReactJS

Database: MySQL

AI & Services: Gemini AI, Supabase

Deployment: Docker, AWS

Architecture:

N-Tier Architecture

JWT-based Authentication

RESTful API communication

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



