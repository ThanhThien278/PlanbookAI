API_URL="http://localhost:8000"

echo "🧪 Testing PlanbookAI APIs..."
echo ""

# Test 1: Register user
echo "1️⃣ Testing user registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "test123456",
    "full_name": "Test User",
    "role": "teacher"
  }')

if echo "$REGISTER_RESPONSE" | grep -q "email"; then
    echo "✅ Registration successful"
    USER_ID=$(echo $REGISTER_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
else
    echo "❌ Registration failed"
    echo $REGISTER_RESPONSE
    exit 1
fi

echo ""

# Test 2: Login
echo "2️⃣ Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=test123456")

if echo "$LOGIN_RESPONSE" | grep -q "access_token"; then
    echo "✅ Login successful"
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
else
    echo "❌ Login failed"
    echo $LOGIN_RESPONSE
    exit 1
fi

echo ""

# Test 3: Get current user
echo "3️⃣ Testing get current user..."
ME_RESPONSE=$(curl -s -X GET "$API_URL/auth/me" \
  -H "Authorization: Bearer $TOKEN")

if echo "$ME_RESPONSE" | grep -q "testuser"; then
    echo "✅ Get current user successful"
else
    echo "❌ Get current user failed"
    echo $ME_RESPONSE
fi

echo ""

# Test 4: Create question
echo "4️⃣ Testing create question..."
QUESTION_RESPONSE=$(curl -s -X POST "$API_URL/questions" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Chemistry",
    "topic": "Organic Chemistry",
    "grade_level": "10",
    "question_type": "multiple_choice",
    "difficulty": "medium",
    "question_text": "What is the chemical formula for water?",
    "options": {"A": "H2O", "B": "CO2", "C": "O2", "D": "N2"},
    "correct_answer": "A",
    "explanation": "Water is composed of two hydrogen atoms and one oxygen atom",
    "points": 1.0
  }')

if echo "$QUESTION_RESPONSE" | grep -q "question_text"; then
    echo "✅ Create question successful"
    QUESTION_ID=$(echo $QUESTION_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
else
    echo "❌ Create question failed"
    echo $QUESTION_RESPONSE
fi

echo ""

# Test 5: List questions
echo "5️⃣ Testing list questions..."
QUESTIONS_LIST=$(curl -s -X GET "$API_URL/questions?subject=Chemistry" \
  -H "Authorization: Bearer $TOKEN")

if echo "$QUESTIONS_LIST" | grep -q "question_text"; then
    echo "✅ List questions successful"
else
    echo "❌ List questions failed"
    echo $QUESTIONS_LIST
fi

echo ""

# Test 6: Create exam
echo "6️⃣ Testing create exam..."
EXAM_RESPONSE=$(curl -s -X POST "$API_URL/exams" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Chemistry Midterm Exam",
    "description": "Midterm exam for grade 10 chemistry",
    "subject": "Chemistry",
    "grade_level": "10",
    "exam_type": "midterm",
    "duration_minutes": 60,
    "passing_score": 50
  }')

if echo "$EXAM_RESPONSE" | grep -q "title"; then
    echo "✅ Create exam successful"
    EXAM_ID=$(echo $EXAM_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4)
else
    echo "❌ Create exam failed"
    echo $EXAM_RESPONSE
fi

echo ""
echo "🎉 API tests completed!"
echo ""
echo "Test Summary:"
echo "  Token: $TOKEN"
echo "  User ID: $USER_ID"
echo "  Question ID: $QUESTION_ID"
echo "  Exam ID: $EXAM_ID"

# Make scripts executable
chmod +x scripts/*.sh