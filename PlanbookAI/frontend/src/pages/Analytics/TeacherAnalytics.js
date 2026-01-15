import React, { useState } from 'react';
import { FiBarChart, FiTrendingUp, FiUsers, FiCheckSquare } from 'react-icons/fi';

export default function TeacherAnalytics() {
  const [stats, setStats] = useState({
    students: { total: 150, analyzed: 120 },
    exams: { total: 8, average: 7.5 },
    grading: { total: 120, average: 8.2 }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Phân tích học tập</h1>
        <p className="text-gray-600 mt-1">Theo dõi điểm số và kết quả phân tích học tập của học sinh</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <FiUsers className="text-blue-600 text-2xl" />
            <span className="text-sm text-gray-500">Tổng số</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.students.total}</p>
          <p className="text-sm text-gray-600 mt-1">Học sinh</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <FiBarChart className="text-green-600 text-2xl" />
            <span className="text-sm text-gray-500">Đã phân tích</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.students.analyzed}</p>
          <p className="text-sm text-gray-600 mt-1">
            {Math.round((stats.students.analyzed / stats.students.total) * 100)}% học sinh
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <FiCheckSquare className="text-purple-600 text-2xl" />
            <span className="text-sm text-gray-500">Điểm trung bình</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{stats.exams.average}</p>
          <p className="text-sm text-gray-600 mt-1">Tất cả bài thi</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Phân bố điểm số</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Biểu đồ phân bố điểm số sẽ được hiển thị ở đây
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Tiến độ học tập</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Biểu đồ tiến độ học tập sẽ được hiển thị ở đây
          </div>
        </div>
      </div>

      {/* Student List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Danh sách học sinh</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Học sinh</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Điểm trung bình</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Số bài thi</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">Nguyễn Văn A</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">8.5</td>
                <td className="px-6 py-4 text-sm text-gray-600">5</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                    Tốt
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}


