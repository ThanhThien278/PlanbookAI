import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiLayers, FiPlus, FiEdit3, FiTrash2, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { templateService } from '../../services/templateService';

export default function TemplateManagement() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await templateService.getAll();
      setTemplates(response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách template');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa template này?')) return;
    
    try {
      await templateService.delete(id);
      toast.success('Đã xóa template');
      loadTemplates(); // ✅ Realtime update
    } catch (error) {
      toast.error('Không thể xóa template');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý mẫu giáo án</h1>
          <p className="text-gray-600 mt-1">Quản lý các template tạo giáo án</p>
        </div>
        <Link
          to="/admin/templates/create"
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FiPlus className="mr-2" />
          Tạo template mới
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm template..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : templates.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Chưa có template nào
          </div>
        ) : (
          templates.map((template) => (
            <div key={template.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <FiLayers className="text-indigo-600 text-2xl" />
                <div className="flex gap-2">
                  <Link
                    to={`/admin/templates/${template.id}/edit`}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  >
                    <FiEdit3 />
                  </Link>
                  <button
                    onClick={() => {/* Delete */}}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Môn: {template.subject}</p>
                <p>Lớp: {template.grade}</p>
                <p>Ngày tạo: {new Date(template.created_at).toLocaleDateString('vi-VN')}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


