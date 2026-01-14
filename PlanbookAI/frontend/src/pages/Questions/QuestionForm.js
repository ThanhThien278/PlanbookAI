import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { questionService } from '../../services/questionService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function QuestionForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ Tự động detect context từ pathname
  const getBasePath = () => {
    if (location.pathname.startsWith('/admin')) return '/admin/questions';
    if (location.pathname.startsWith('/teacher')) return '/teacher/questions';
    return '/admin/questions'; // default
  };
  
  const [formData, setFormData] = useState({
    subject: '',
    topic: '',
    grade_level: '',
    question_type: 'multiple_choice',
    difficulty: 'medium',
    question_text: '',
    options: {},
    correct_answer: '',
    explanation: '',
    points: 1.0,
    tags: [],
    is_public: false
  });
  const [loading, setLoading] = useState(false);
  const [currentOption, setCurrentOption] = useState({ key: '', value: '' });

  useEffect(() => {
    if (isEdit) {
      loadQuestion();
    }
  }, [id]);

  const loadQuestion = async () => {
    try {
      const response = await questionService.getById(id);
      setFormData(response.data);
    } catch (error) {
      toast.error('Không thể tải câu hỏi');
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

  const handleAddOption = () => {
    if (currentOption.key && currentOption.value) {
      setFormData({
        ...formData,
        options: {
          ...formData.options,
          [currentOption.key]: currentOption.value
        }
      });
      setCurrentOption({ key: '', value: '' });
    }
  };

  const handleRemoveOption = (key) => {
    const newOptions = { ...formData.options };
    delete newOptions[key];
    setFormData({ ...formData, options: newOptions });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEdit) {
        await questionService.update(id, formData);
        toast.success('Đã cập nhật câu hỏi');
      } else {
        await questionService.create(formData);
        toast.success('Đã tạo câu hỏi mới');
      }
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
          {isEdit ? 'Chỉnh sửa câu hỏi' : 'Tạo câu hỏi mới'}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              Chủ đề *
            </label>
            <input
              type="text"
              name="topic"
              value={formData.topic}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại câu hỏi *
            </label>
            <select
              name="question_type"
              value={formData.question_type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="multiple_choice">Trắc nghiệm</option>
              <option value="short_answer">Tự luận ngắn</option>
              <option value="essay">Tự luận</option>
              <option value="true_false">Đúng/Sai</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Độ khó *
            </label>
            <select
              name="difficulty"
              value={formData.difficulty}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="easy">Dễ</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Khó</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nội dung câu hỏi *
          </label>
          <textarea
            name="question_text"
            value={formData.question_text}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {formData.question_type === 'multiple_choice' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Các lựa chọn
            </label>
            <div className="space-y-2 mb-4">
              {Object.entries(formData.options).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="font-medium w-8">{key}:</span>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                      const newOptions = { ...formData.options };
                      newOptions[key] = e.target.value;
                      setFormData({ ...formData, options: newOptions });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveOption(key)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-md"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Key (A, B, C...)"
                value={currentOption.key}
                onChange={(e) => setCurrentOption({ ...currentOption, key: e.target.value.toUpperCase() })}
                className="w-20 px-3 py-2 border border-gray-300 rounded-md"
              />
              <input
                type="text"
                placeholder="Nội dung lựa chọn"
                value={currentOption.value}
                onChange={(e) => setCurrentOption({ ...currentOption, value: e.target.value })}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
              />
              <button
                type="button"
                onClick={handleAddOption}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Thêm
              </button>
            </div>
            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đáp án đúng
              </label>
              <select
                name="correct_answer"
                value={formData.correct_answer}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">Chọn đáp án</option>
                {Object.keys(formData.options).map((key) => (
                  <option key={key} value={key}>{key}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Giải thích
          </label>
          <textarea
            name="explanation"
            value={formData.explanation}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Điểm số
            </label>
            <input
              type="number"
              name="points"
              value={formData.points}
              onChange={handleChange}
              min="0"
              step="0.5"
              className="w-32 px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex items-center mt-6">
            <input
              type="checkbox"
              name="is_public"
              checked={formData.is_public}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Công khai
            </label>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/questions')}
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




