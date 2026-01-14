import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiPlus, FiEdit3, FiTrash2, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { packageService } from '../../services/packageService';

export default function PackageManagement() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      setLoading(true);
      const response = await packageService.getAll();
      setPackages(response.data);
    } catch (error) {
      toast.error('Không thể tải danh sách gói dịch vụ');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa gói dịch vụ này?')) return;
    
    try {
      await packageService.delete(id);
      toast.success('Đã xóa gói dịch vụ');
      loadPackages(); // ✅ Realtime update
    } catch (error) {
      toast.error('Không thể xóa gói dịch vụ');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý Gói dịch vụ</h1>
          <p className="text-gray-600 mt-1">Quản lý các gói thuê bao và đăng ký</p>
        </div>
        <Link
          to="/admin/packages/create"
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <FiPlus className="mr-2" />
          Tạo gói mới
        </Link>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          </div>
        ) : packages.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            Chưa có gói dịch vụ nào
          </div>
        ) : (
          packages.map((pkg) => (
            <div key={pkg.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <FiPackage className="text-indigo-600 text-2xl" />
                <div className="flex gap-2">
                  <Link
                    to={`/admin/packages/${pkg.id}/edit`}
                    className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg"
                  >
                    <FiEdit3 />
                  </Link>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 text-lg mb-2">{pkg.name}</h3>
              <div className="mb-4">
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-indigo-600">{pkg.price.toLocaleString('vi-VN')}</span>
                  <span className="text-gray-600 ml-2">VNĐ/{pkg.duration} ngày</span>
                </div>
              </div>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Tính năng:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {pkg.features.map((feature, idx) => (
                    <li key={idx}>• {feature}</li>
                  ))}
                </ul>
              </div>
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Đăng ký:</span>
                  <span className="font-semibold text-indigo-600">{pkg.subscriptions}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Orders & Subscriptions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center">
            <FiTrendingUp className="mr-2 text-indigo-600" />
            Đơn hàng & Đăng ký
          </h2>
          <Link
            to="/admin/packages/orders"
            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
          >
            Xem tất cả →
          </Link>
        </div>
        <div className="text-center py-8 text-gray-500">
          Tính năng đang được phát triển...
        </div>
      </div>
    </div>
  );
}


