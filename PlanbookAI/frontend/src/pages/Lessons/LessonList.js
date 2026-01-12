import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { lessonService } from '../../services/lessonService';
import { FiPlus, FiEdit, FiTrash2, FiCopy } from 'react-icons/fi';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function LessonList() {
  const location = useLocation();
  
  // ✅ Tự động detect context từ pathname
  const getBasePath = () => {
    if (location.pathname.startsWith('/admin')) return '/admin/lessons';
    if (location.pathname.startsWith('/teacher')) return '/teacher/lessons';
    return '/admin/lessons'; // default
  };
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLessons();
  }, []);

  const loadLessons = async () => {
    try {
      setLoading(true);
      const response = await lessonService.getAll();
      setLessons(response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách giáo án');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa giáo án này?')) return;
    
    try {
      await lessonService.delete(id);
      toast.success('Đã xóa giáo án');
      loadLessons();
    } catch (error) {
      toast.error('Không thể xóa giáo án');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      await lessonService.duplicate(id);
      toast.success('Đã sao chép giáo án');
      loadLessons();
    } catch (error) {
      toast.error('Không thể sao chép giáo án');
    }
  };

  return (
    <div className="space-y-6">
      <ToastContainer position="top-right" />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Danh sách giáo án</h1>
          <p className="text-gray-600">Quản lý tất cả giáo án của bạn</p>
        </div>
        <Link
          to={`${getBasePath()}/create`}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="mr-2" />
          Tạo giáo án mới
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">Chưa có giáo án nào</p>
            <Link
              to={`${getBasePath()}/create`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Tạo giáo án đầu tiên →
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {lessons.map((lesson) => (
              <div key={lesson.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {lesson.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{lesson.topic}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{lesson.subject}</span>
                      <span>Thời lượng: {lesson.duration_minutes} phút</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        lesson.status === 'approved' 
                          ? 'bg-green-100 text-green-800' 
                          : lesson.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {lesson.status === 'approved' ? 'Đã duyệt' : 
                         lesson.status === 'pending' ? 'Chờ duyệt' : 'Bản nháp'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleDuplicate(lesson.id)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FiCopy size={18} />
                    </button>
                    <Link
                      to={`${getBasePath()}/${lesson.id}/edit`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FiEdit size={18} />
                    </Link>
                    <button
                      onClick={() => handleDelete(lesson.id)}
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




