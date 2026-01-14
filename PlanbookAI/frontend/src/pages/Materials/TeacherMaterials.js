import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiFolder, FiUpload, FiDownload, FiTrash2, FiFile, FiImage, FiFileText } from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../../services/api';

export default function TeacherMaterials() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      // TODO: Load từ API
      setMaterials([
        { id: 1, name: 'Giáo án Hóa học lớp 10', type: 'document', size: '2.5 MB', uploaded_at: '2024-01-15' },
        { id: 2, name: 'Đề kiểm tra 15 phút', type: 'document', size: '1.2 MB', uploaded_at: '2024-01-14' },
        { id: 3, name: 'Hình ảnh minh họa', type: 'image', size: '3.8 MB', uploaded_at: '2024-01-13' },
      ]);
    } catch (error) {
      toast.error('Không thể tải học liệu');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // TODO: Upload to API
      // await api.post('/materials/upload', formData);
      
      toast.success('Đã tải lên thành công');
      loadMaterials();
    } catch (error) {
      toast.error('Không thể tải lên file');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa học liệu này?')) return;
    
    try {
      await api.delete(`/materials/${id}`);
      toast.success('Đã xóa học liệu');
      loadMaterials();
    } catch (error) {
      toast.error('Không thể xóa học liệu');
    }
  };

  const getFileIcon = (type) => {
    if (type === 'image') return <FiImage className="text-blue-600" />;
    if (type === 'document') return <FiFileText className="text-green-600" />;
    return <FiFile className="text-gray-600" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Học liệu của tôi</h1>
          <p className="text-gray-600 mt-1">Quản lý tài liệu giảng dạy cá nhân</p>
        </div>
        <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
          <FiUpload className="mr-2" />
          Tải lên học liệu
          <input
            type="file"
            className="hidden"
            onChange={handleFileUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Upload Area */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <FiFolder className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">Kéo thả file vào đây hoặc click để chọn</p>
          <p className="text-sm text-gray-500">Hỗ trợ: PDF, DOCX, PPTX, JPG, PNG (Tối đa 10MB)</p>
        </div>
      </div>

      {/* Materials List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Danh sách học liệu</h2>
        </div>
        <div className="divide-y divide-gray-200">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : materials.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Chưa có học liệu nào
            </div>
          ) : (
            materials.map((material) => (
              <div key={material.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="mr-4">
                      {getFileIcon(material.type)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{material.name}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{material.size}</span>
                        <span>•</span>
                        <span>{new Date(material.uploaded_at).toLocaleDateString('vi-VN')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {/* Download */}}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Tải xuống"
                    >
                      <FiDownload />
                    </button>
                    <button
                      onClick={() => handleDelete(material.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Xóa"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


