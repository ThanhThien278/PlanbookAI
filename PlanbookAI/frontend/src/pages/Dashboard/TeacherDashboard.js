import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiBookOpen, FiFileText, FiBook, FiCheckSquare, FiFolder,
  FiUpload, FiBarChart, FiTrendingUp, FiDownload, FiEye, FiImage
} from 'react-icons/fi';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    lessons: { total: 0, recent: 0 },
    exams: { total: 0, recent: 0 },
    questions: { total: 0, recent: 0 },
    grading: { total: 0, pending: 0 },
    materials: 0,
    students: { total: 0, analyzed: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    // TODO: Load từ API
    setStats({
      lessons: { total: 15, recent: 3 },
      exams: { total: 8, recent: 2 },
      questions: { total: 45, recent: 5 },
      grading: { total: 120, pending: 8 },
      materials: 12,
      students: { total: 150, analyzed: 120 }
    });
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển</h1>
          <p className="text-gray-600 mt-1">Tổng quan công việc giảng dạy của bạn</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Giáo án của tôi"
          value={stats.lessons.total}
          subtitle={`${stats.lessons.recent} mới gần đây`}
          icon={<FiBookOpen size={24} />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          link="/teacher/lessons"
        />
        <StatCard
          title="Đề thi của tôi"
          value={stats.exams.total}
          subtitle={`${stats.exams.recent} mới gần đây`}
          icon={<FiFileText size={24} />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          link="/teacher/exams"
        />
        <StatCard
          title="Câu hỏi của tôi"
          value={stats.questions.total}
          subtitle={`${stats.questions.recent} mới thêm`}
          icon={<FiBook size={24} />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
          link="/teacher/questions"
        />
        <StatCard
          title="Đã chấm bài"
          value={stats.grading.total}
          subtitle={`${stats.grading.pending} đang chờ`}
          icon={<FiCheckSquare size={24} />}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
          link="/teacher/grading"
        />
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Teaching Tools */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <FiBookOpen className="mr-2 text-blue-600" />
            Công cụ giảng dạy
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ActionCard
              to="/teacher/lessons/create"
              icon="📖"
              title="Soạn giáo án mới"
              description="Tạo giáo án cho bài giảng của bạn"
              color="bg-blue-50 border-blue-200"
            />
            <ActionCard
              to="/teacher/exams/create"
              icon="📝"
              title="Tạo đề thi"
              description="Tạo đề thi từ ngân hàng câu hỏi"
              color="bg-green-50 border-green-200"
            />
            <ActionCard
              to="/teacher/questions/create"
              icon="❓"
              title="Thêm câu hỏi"
              description="Thêm câu hỏi vào ngân hàng"
              color="bg-purple-50 border-purple-200"
            />
            <ActionCard
              to="/teacher/materials"
              icon="📁"
              title="Học liệu của tôi"
              description="Quản lý tài liệu giảng dạy"
              color="bg-orange-50 border-orange-200"
            />
          </div>
        </div>

        {/* Auto Grading Tools */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <FiUpload className="mr-2 text-blue-600" />
            Công cụ chấm bài tự động
          </h2>
          <div className="space-y-3">
            <ActionCard
              to="/teacher/grading"
              icon={<FiCheckSquare className="text-blue-600" />}
              title="Chấm bài tự động"
              description="Chấm điểm tự động bằng công nghệ OCR"
              small
            />
            <ActionCard
              to="/teacher/ocr/convert"
              icon={<FiImage className="text-green-600" />}
              title="Chuyển đổi tài liệu"
              description="Chuyển tài liệu giấy sang số"
              small
            />
            <ActionCard
              to="/teacher/ocr/batch"
              icon={<FiFileText className="text-purple-600" />}
              title="Chấm hàng loạt"
              description="Chấm nhiều bài cùng lúc"
              small
            />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Progress Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Tiến độ học tập</h2>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
              <option>6 tháng</option>
              <option>12 tháng</option>
            </select>
          </div>
          <SimpleProgressChart data={[
            { month: 'T1', mark: 5.5 },
            { month: 'T2', mark: 6.2 },
            { month: 'T3', mark: 7.8 },
            { month: 'T4', mark: 7.0 },
            { month: 'T5', mark: 6.5 },
            { month: 'T6', mark: 7.8 },
          ]} />
        </div>

        {/* Grading Stats */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Kết quả chấm bài</h2>
            <Link
              to="/teacher/grading"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-4">
            <AnalyticsItem
              label="Tổng số học sinh"
              value={stats.students.total}
              icon={<FiTrendingUp className="text-green-600" />}
            />
            <AnalyticsItem
              label="Đã phân tích"
              value={stats.students.analyzed}
              icon={<FiBarChart className="text-blue-600" />}
              percentage={Math.round((stats.students.analyzed / stats.students.total) * 100)}
            />
            <Link
              to="/teacher/analytics"
              className="block w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center transition-colors"
            >
              Xem báo cáo chi tiết
            </Link>
          </div>
        </div>
      </div>

      {/* Student Analytics & Grading Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Analytics */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <FiBarChart className="mr-2 text-blue-600" />
              Phân tích học tập
            </h2>
            <Link
              to="/teacher/analytics"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Xem chi tiết →
            </Link>
          </div>
          <div className="space-y-4">
            <AnalyticsItem
              label="Tổng số học sinh"
              value={stats.students.total}
              icon={<FiTrendingUp className="text-green-600" />}
            />
            <AnalyticsItem
              label="Đã phân tích"
              value={stats.students.analyzed}
              icon={<FiBarChart className="text-blue-600" />}
              percentage={Math.round((stats.students.analyzed / stats.students.total) * 100)}
            />
            <Link
              to="/teacher/analytics"
              className="block w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-center transition-colors"
            >
              Xem báo cáo chi tiết
            </Link>
          </div>
        </div>

        {/* Grading Results */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <FiCheckSquare className="mr-2 text-green-600" />
              Kết quả chấm bài
            </h2>
            <Link
              to="/teacher/grading"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-3">
            <GradingItem
              exam="Đề kiểm tra 15 phút - Hóa học"
              total={stats.grading.total}
              pending={stats.grading.pending}
              date="Hôm nay"
            />
            <div className="pt-3 border-t">
              <Link
                to="/teacher/grading/export"
                className="flex items-center justify-center w-full px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              >
                <FiDownload className="mr-2" />
                Xuất báo cáo chấm bài
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">📊 Hoạt động gần đây</h2>
        <div className="space-y-3">
          <ActivityItem
            action="Tạo giáo án mới"
            subject="Bài 5: Phản ứng oxi hóa"
            time="2 giờ trước"
            icon={<FiBookOpen className="text-blue-600" />}
          />
          <ActivityItem
            action="Chấm bài tự động"
            subject="Đã chấm 25 bài thi"
            time="4 giờ trước"
            icon={<FiCheckSquare className="text-green-600" />}
          />
          <ActivityItem
            action="Tạo đề thi"
            subject="Đề kiểm tra 15 phút - Hóa học"
            time="1 ngày trước"
            icon={<FiFileText className="text-purple-600" />}
          />
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, subtitle, icon, iconBg, iconColor, link }) => {
  const CardContent = (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`${iconBg} ${iconColor} p-3 rounded-lg`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-sm text-gray-600 mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  );

  return link ? <Link to={link}>{CardContent}</Link> : CardContent;
};

const ActionCard = ({ to, icon, title, description, color, small }) => (
  <Link to={to}>
    <div className={`border-2 rounded-lg p-4 hover:shadow-md transition-all group ${
      color || 'border-gray-200 hover:border-blue-500'
    } ${small ? 'p-3' : ''}`}>
      <div className="flex items-start">
        {typeof icon === 'string' ? (
          <div className="text-3xl mr-3">{icon}</div>
        ) : (
          <div className="mr-3 mt-1">{icon}</div>
        )}
        <div className="flex-1">
          <h3 className={`font-semibold text-gray-900 mb-1 ${small ? 'text-sm' : ''}`}>
            {title}
          </h3>
          <p className={`text-gray-600 ${small ? 'text-xs' : 'text-sm'}`}>
            {description}
          </p>
        </div>
      </div>
    </div>
  </Link>
);

const AnalyticsItem = ({ label, value, icon, percentage }) => (
  <div className="flex items-center justify-between py-3 border-b last:border-b-0">
    <div className="flex items-center">
      <div className="mr-3">{icon}</div>
      <div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
    {percentage !== undefined && (
      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
        {percentage}%
      </span>
    )}
  </div>
);

const GradingItem = ({ exam, total, pending, date }) => (
  <div className="p-4 bg-gray-50 rounded-lg">
    <div className="flex items-center justify-between mb-2">
      <h4 className="font-semibold text-gray-900">{exam}</h4>
      <span className="text-xs text-gray-500">{date}</span>
    </div>
    <div className="flex items-center gap-4 mt-3">
      <div className="flex items-center">
        <FiCheckSquare className="text-green-600 mr-2" />
        <span className="text-sm text-gray-600">Đã chấm: {total - pending}</span>
      </div>
      {pending > 0 && (
        <div className="flex items-center">
          <FiEye className="text-orange-600 mr-2" />
          <span className="text-sm text-gray-600">Chờ chấm: {pending}</span>
        </div>
      )}
    </div>
  </div>
);

const ActivityItem = ({ action, subject, time, icon }) => (
  <div className="flex items-center justify-between py-3 border-b last:border-b-0">
    <div className="flex items-center flex-1">
      <div className="mr-3">{icon}</div>
      <div>
        <p className="font-medium text-gray-900">{action}</p>
        <p className="text-sm text-gray-600">{subject}</p>
      </div>
    </div>
    <span className="text-sm text-gray-500 ml-4">{time}</span>
  </div>
);

// Simple Progress Chart Component
const SimpleProgressChart = ({ data }) => {
  const maxValue = 10;
  const height = 200;

  return (
    <div className="relative" style={{ height: `${height}px` }}>
      <svg className="w-full h-full" viewBox={`0 0 ${data.length * 60} ${height}`} preserveAspectRatio="none">
        {/* Grid lines */}
        {[0, 2.5, 5, 7.5, 10].map((val, i) => (
          <line
            key={i}
            x1="0"
            y1={height - (val / maxValue) * (height - 40) - 20}
            x2={data.length * 60}
            y2={height - (val / maxValue) * (height - 40) - 20}
            stroke="#e5e7eb"
            strokeWidth="1"
            strokeDasharray="4 4"
          />
        ))}
        {/* Progress line */}
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          points={data.map((d, i) => `${i * 60 + 30},${height - (d.mark / maxValue) * (height - 40) - 20}`).join(' ')}
        />
        {/* Data points */}
        {data.map((d, i) => {
          const x = i * 60 + 30;
          const y = height - (d.mark / maxValue) * (height - 40) - 20;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="5"
              fill="#3b82f6"
            />
          );
        })}
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
        {data.map((d, i) => (
          <span key={i}>{d.month}</span>
        ))}
      </div>
      <div className="absolute top-0 right-0 text-xs text-gray-600">
        Điểm trung bình: 7.2
      </div>
    </div>
  );
};
