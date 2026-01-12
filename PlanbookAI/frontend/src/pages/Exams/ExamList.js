import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { examService } from '../../services/examService';
import { FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ExamList() {
  const location = useLocation();
  
  // ✅ Tự động detect context từ pathname
  const getBasePath = () => {
    if (location.pathname.startsWith('/admin')) return '/admin/exams';
    if (location.pathname.startsWith('/teacher')) return '/teacher/exams';
    return '/admin/exams'; // default
  };
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExams();
  }, []);

  const loadExams = async () => {
    try {
      setLoading(true);
      const response = await examService.getAll();
      setExams(response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách đề thi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa đề thi này?')) return;
    
    try {
      await examService.delete(id);
      toast.success('Đã xóa đề thi');
      loadExams();
    } catch (error) {
      toast.error('Không thể xóa đề thi');
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách đề thi</h1>
          <p className="text-gray-600">Quản lý tất cả đề thi của bạn</p>
        </div>
        <Link
          to={`${getBasePath()}/create`}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="mr-2" />
          Tạo đề thi mới
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : exams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Chưa có đề thi nào</p>
            <Link
              to={`${getBasePath()}/create`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Tạo đề thi đầu tiên →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {exams.map((exam) => (
              <div key={exam.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {exam.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{exam.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{exam.subject}</span>
                      <span>Thời gian: {exam.duration_minutes} phút</span>
                      <span>Điểm: {exam.total_points}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        exam.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {exam.status === 'published' ? 'Đã xuất bản' : 'Bản nháp'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Link
                      to={`${getBasePath()}/${exam.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FiEye size={18} />
                    </Link>
                    <Link
                      to={`${getBasePath()}/${exam.id}/edit`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FiEdit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(exam.id)}
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




