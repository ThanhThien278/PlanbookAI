import google.generativeai as genai
from typing import Dict, List, Any
import json

class GeminiAIClient:
    def __init__(self, api_key: str):
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro')
    
    async def analyze_answers(
        self, 
        extracted_text: str, 
        questions: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Analyze student answers with AI"""
        
        prompt = f"""
        Phân tích bài làm của học sinh và chấm điểm.
        
        Văn bản trích xuất từ bài làm:
        {extracted_text}
        
        Đề bài và đáp án đúng:
        {json.dumps(questions, ensure_ascii=False, indent=2)}
        
        Hãy trả về JSON với format sau:
        {{
            "student_name": "Tên học sinh (nếu có trong bài)",
            "student_id": "Mã số học sinh (nếu có)",
            "answers": {{
                "1": "A",
                "2": "B",
                ...
            }},
            "correct_count": số câu đúng,
            "score": điểm số,
            "total_points": tổng điểm,
            "percentage": phần trăm,
            "feedback": "Nhận xét chi tiết",
            "incorrect_questions": [danh sách câu sai]
        }}
        """
        
        try:
            response = self.model.generate_content(prompt)
            result_text = response.text
            
            # Parse JSON from response
            # Remove markdown code blocks if present
            if '```json' in result_text:
                result_text = result_text.split('```json')[1].split('```')[0]
            elif '```' in result_text:
                result_text = result_text.split('```')[1].split('```')[0]
            
            result = json.loads(result_text.strip())
            return result
            
        except Exception as e:
            raise Exception(f"AI analysis failed: {e}")