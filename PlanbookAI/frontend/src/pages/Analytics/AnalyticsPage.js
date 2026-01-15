import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FiBarChart, FiTrendingUp, FiDollarSign, FiUsers, FiBook } from 'react-icons/fi';

export default function AnalyticsPage() {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Báo cáo & Thống kê</h1>
        <p className="text-gray-600 mt-1">Theo dõi và phân tích hoạt động hệ thống</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'overview', label: 'Tổng quan', icon: FiBarChart },
              { id: 'revenue', label: 'Doanh thu', icon: FiDollarSign },
              { id: 'users', label: 'Người dùng', icon: FiUsers },
              { id: 'content', label: 'Nội dung', icon: FiBook },
            ].map((tab) => (
              <a
                key={tab.id}
                href={`/admin/analytics?tab=${tab.id}`}
                className={`flex items-center px-6 py-4 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="mr-2" />
                {tab.label}
              </a>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Tổng doanh thu</p>
                      <p className="text-3xl font-bold mt-2">150M VNĐ</p>
                    </div>
                    <FiDollarSign className="text-4xl opacity-50" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Tổng người dùng</p>
                      <p className="text-3xl font-bold mt-2">150</p>
                    </div>
                    <FiUsers className="text-4xl opacity-50" />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-100 text-sm">Nội dung hệ thống</p>
                      <p className="text-3xl font-bold mt-2">1,655</p>
                    </div>
                    <FiBook className="text-4xl opacity-50" />
                  </div>
                </div>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Biểu đồ thống kê</h3>
                <div className="h-64 flex items-center justify-center text-gray-400">
                  Biểu đồ sẽ được hiển thị ở đây
                </div>
              </div>
            </div>
          )}

          {activeTab === 'revenue' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Doanh thu theo tháng</h3>
                  <div className="h-48 flex items-center justify-center text-gray-400">
                    Biểu đồ doanh thu
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4">Gói dịch vụ phổ biến</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Gói Premium</span>
                      <span className="font-semibold">75 đăng ký</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Gói Basic</span>
                      <span className="font-semibold">45 đăng ký</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Thống kê người dùng</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-indigo-600">150</p>
                    <p className="text-sm text-gray-600">Tổng người dùng</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">142</p>
                    <p className="text-sm text-gray-600">Đang hoạt động</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">120</p>
                    <p className="text-sm text-gray-600">Giáo viên</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-600">30</p>
                    <p className="text-sm text-gray-600">Quản trị</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'content' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-indigo-600">1,250</p>
                  <p className="text-gray-600 mt-2">Câu hỏi</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-green-600">85</p>
                  <p className="text-gray-600 mt-2">Đề thi</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-purple-600">320</p>
                  <p className="text-gray-600 mt-2">Giáo án</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


