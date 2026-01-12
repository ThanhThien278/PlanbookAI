import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { examService } from '../../services/examService';
import { questionService } from '../../services/questionService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ExamForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ Tự động detect context từ pathname
  const getBasePath = () => {
    if (location.pathname.startsWith('/admin')) return '/admin/exams';
    if (location.pathname.startsWith('/teacher')) return '/teacher/exams';
    return '/admin/exams'; // default
  };
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: '',
    grade_level: '',
    exam_type: 'quiz',
    duration_minutes: 60,
    passing_score: 50,
    instructions: '',
    is_randomized: false,
    is_public: false
  });
  const [availableQuestions, setAvailableQuestions] = useState([]);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadQuestions();
    if (isEdit) {
      loadExam();
    }
  }, [id]);

  const loadQuestions = async () => {
    try {
      const response = await questionService.getAll({ status: 'approved' });
      setAvailableQuestions(response.data);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  const loadExam = async () => {
    try {
      const response = await examService.getById(id);
      setFormData(response.data);
      if (response.data.questions) {
        setSelectedQuestions(response.data.questions.map(q => q.id));
      }
    } catch (error) {
      toast.error('Không thể tải đề thi');
      navigate(getBasePath());
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const toggleQuestion = (questionId) => {
    setSelectedQuestions(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let examId = id;
      if (!isEdit) {
        const createResponse = await examService.create(formData);
        examId = createResponse.data.id;
      } else {
        await examService.update(id, formData);
      }

      if (selectedQuestions.length > 0) {
        await examService.addQuestions(examId, selectedQuestions);
      }

      toast.success(isEdit ? 'Đã cập nhật đề thi' : 'Đã tạo đề thi mới');
      navigate(getBasePath());
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" />
      
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Chỉnh sửa đề thi' : 'Tạo đề thi mới'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại đề thi *
            </label>
            <select
              name="exam_type"
              value={formData.exam_type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="quiz">Bài kiểm tra</option>
              <option value="midterm">Giữa kỳ</option>
              <option value="final">Cuối kỳ</option>
              <option value="practice">Luyện tập</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Môn học *
            </label>
            <select
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Chọn môn học</option>
              <option value="Chemistry">Hóa học</option>
              <option value="Physics">Vật lý</option>
              <option value="Math">Toán học</option>
              <option value="Biology">Sinh học</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian (phút) *
            </label>
            <input
              type="number"
              name="duration_minutes"
              value={formData.duration_minutes}
              onChange={handleChange}
              required
              min="1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Điểm đạt
            </label>
            <input
              type="number"
              name="passing_score"
              value={formData.passing_score}
              onChange={handleChange}
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mô tả
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hướng dẫn
          </label>
          <textarea
            name="instructions"
            value={formData.instructions}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_randomized"
              checked={formData.is_randomized}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Xáo trộn câu hỏi</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="is_public"
              checked={formData.is_public}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Công khai</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Chọn câu hỏi ({selectedQuestions.length} đã chọn)
          </label>
          <div className="border border-gray-300 rounded-md max-h-64 overflow-y-auto p-4">
            {availableQuestions.map((question) => (
              <label key={question.id} className="flex items-start mb-3 p-2 hover:bg-gray-50 rounded">
                <input
                  type="checkbox"
                  checked={selectedQuestions.includes(question.id)}
                  onChange={() => toggleQuestion(question.id)}
                  className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <div className="ml-3 flex-1">
                  <p className="text-sm text-gray-900">{question.question_text}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {question.subject} - {question.difficulty} - {question.points} điểm
                  </p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/exams')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </form>
    </div>
  );
}




