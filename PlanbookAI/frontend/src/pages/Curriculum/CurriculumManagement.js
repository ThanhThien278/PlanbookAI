import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiGrid, FiPlus, FiEdit3, FiTrash2, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { curriculumService } from '../../services/curriculumService';

export default function CurriculumManagement() {
  const [curriculums, setCurriculums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCurriculums();
  }, []);

  const loadCurriculums = async () => {
    try {
      setLoading(true);
      const response = await curriculumService.getAll();
      setCurriculums(response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách khung chương trình');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa khung chương trình này?')) return;
    
    try {
      await curriculumService.delete(id);
      toast.success('Đã xóa khung chương trình');
      loadCurriculums(); // ✅ Realtime update
    } catch (error) {
      toast.error('Không thể xóa khung chương trình');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Khung chương trình</h1>
          <p className="text-gray-600 mt-1">Quản lý khung chương trình học tập</p>
        </div>
        <Link
          to="/admin/curriculum/create"
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FiPlus className="mr-2" />
          Tạo khung chương trình
        </Link>
      </div>

      {/* Curriculums List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tên khung chương trình</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Môn học</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Khối lớp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ngày tạo</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Thao tác</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                  </td>
                </tr>
              ) : curriculums.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    Chưa có khung chương trình nào
                  </td>
                </tr>
              ) : (
                curriculums.map((curriculum) => (
                  <tr key={curriculum.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <FiGrid className="mr-3 text-indigo-600" />
                        <span className="font-medium text-gray-900">{curriculum.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{curriculum.subject}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{curriculum.grade}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(curriculum.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/admin/curriculum/${curriculum.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          <FiEdit3 />
                        </Link>
                        <button
                          onClick={() => {/* Delete */}}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


