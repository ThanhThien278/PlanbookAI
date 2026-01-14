import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { questionService } from '../../services/questionService';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function QuestionList() {
  const location = useLocation();
  
  // ✅ Tự động detect context từ pathname
  const getBasePath = () => {
    if (location.pathname.startsWith('/admin')) return '/admin/questions';
    if (location.pathname.startsWith('/teacher')) return '/teacher/questions';
    return '/admin/questions'; // default
  };
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    subject: '',
    topic: '',
    difficulty: '',
    question_type: ''
  });

  useEffect(() => {
    loadQuestions();
  }, [filters]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const response = await questionService.getAll(filters);
      setQuestions(response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách câu hỏi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa câu hỏi này?')) return;
    
    try {
      await questionService.delete(id);
      toast.success('Đã xóa câu hỏi');
      loadQuestions();
    } catch (error) {
      toast.error('Không thể xóa câu hỏi');
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const colors = {
      easy: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      hard: 'bg-red-100 text-red-800'
    };
    const labels = {
      easy: 'Dễ',
      medium: 'Trung bình',
      hard: 'Khó'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${colors[difficulty]}`}>
        {labels[difficulty]}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const labels = {
      multiple_choice: 'Trắc nghiệm',
      short_answer: 'Tự luận ngắn',
      essay: 'Tự luận',
      true_false: 'Đúng/Sai'
    };
    return (
      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
        {labels[type]}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" />
      
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ngân hàng câu hỏi</h1>
          <p className="text-gray-600">Quản lý tất cả câu hỏi của bạn</p>
        </div>
        <Link
          to={`${getBasePath()}/create`}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="mr-2" />
          Tạo câu hỏi mới
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Môn học
            </label>
            <select
              value={filters.subject}
              onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="Chemistry">Hóa học</option>
              <option value="Physics">Vật lý</option>
              <option value="Math">Toán học</option>
              <option value="Biology">Sinh học</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Độ khó
            </label>
            <select
              value={filters.difficulty}
              onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="easy">Dễ</option>
              <option value="medium">Trung bình</option>
              <option value="hard">Khó</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại câu hỏi
            </label>
            <select
              value={filters.question_type}
              onChange={(e) => setFilters({ ...filters, question_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả</option>
              <option value="multiple_choice">Trắc nghiệm</option>
              <option value="short_answer">Tự luận ngắn</option>
              <option value="essay">Tự luận</option>
              <option value="true_false">Đúng/Sai</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chủ đề
            </label>
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={filters.topic}
                onChange={(e) => setFilters({ ...filters, topic: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Questions List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Chưa có câu hỏi nào</p>
            <Link
              to={`${getBasePath()}/create`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Tạo câu hỏi đầu tiên →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {questions.map((question) => (
              <div key={question.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getTypeBadge(question.question_type)}
                      {getDifficultyBadge(question.difficulty)}
                      <span className="text-sm text-gray-500">
                        {question.subject} - {question.topic}
                      </span>
                    </div>
                    
                    <p className="text-gray-900 mb-2">
                      {question.question_text}
                    </p>
                    
                    {question.options && (
                      <div className="space-y-1 text-sm text-gray-600">
                        {Object.entries(question.options).map(([key, value]) => (
                          <div key={key} className="flex items-center">
                            <span className="font-medium mr-2">{key}.</span>
                            <span>{value}</span>
                            {key === question.correct_answer && (
                              <span className="ml-2 text-green-600">✓</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                      <span>Điểm: {question.points}</span>
                      <span>
                        {new Date(question.created_at).toLocaleDateString('vi-VN')}
                      </span>
                      {question.tags && question.tags.length > 0 && (
                        <div className="flex gap-1">
                          {question.tags.map((tag, i) => (
                            <span key={i} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <Link
                      to={`${getBasePath()}/${question.id}/edit`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FiEdit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(question.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}