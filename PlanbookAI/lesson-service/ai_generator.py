import google.generativeai as genai
from config import settings
import json



genai.configure(api_key=settings.GEMINI_API_KEY)

async def generate_lesson_plan_with_ai(
    subject: str,
    topic: str,
    grade_level: str,
    duration: int,
    objectives: List[str]
) -> dict:
    """Generate lesson plan using Gemini AI"""
    
    prompt = f"""
    Tạo một giáo án chi tiết với các thông tin sau:
    - Môn học: {subject}
    - Chủ đề: {topic}
    - Lớp: {grade_level}
    - Thời lượng: {duration} phút
    - Mục tiêu: {', '.join(objectives)}
    
    Hãy tạo giáo án theo cấu trúc sau (trả về JSON):
    {{
        "title": "Tên bài học",
        "objectives": "Mục tiêu cụ thể",
        "materials": "Danh sách thiết bị và tài liệu cần thiết",
        "activities": [
            {{
                "name": "Tên hoạt động",
                "duration": số phút,
                "description": "Mô tả chi tiết",
                "method": "Phương pháp"
            }}
        ],
        "assessment": "Phương pháp đánh giá",
        "homework": "Bài tập về nhà"
    }}
    """
    
    model = genai.GenerativeModel('gemini-pro')
    response = model.generate_content(prompt)
    
    # Parse JSON from response
    result = json.loads(response.text)
    return result