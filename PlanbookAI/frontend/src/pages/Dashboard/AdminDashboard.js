import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiUsers, FiBook, FiFileText, FiBookOpen, FiCheckSquare, 
  FiBarChart, FiSettings, FiDollarSign, FiPackage, FiTrendingUp,
  FiShield, FiEdit3, FiTrash2, FiPlus, FiGrid, FiLayers
} from 'react-icons/fi';

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    users: { total: 0, active: 0, new: 0 },
    questions: 0,
    exams: 0,
    lessons: 0,
    revenue: { monthly: 0, total: 0 },
    packages: { active: 0, subscriptions: 0 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    // TODO: Load từ API
    setStats({
      users: { total: 150, active: 142, new: 8 },
      questions: 1250,
      exams: 85,
      lessons: 320,
      revenue: { monthly: 12500000, total: 150000000 },
      packages: { active: 45, subscriptions: 120 }
    });
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Bảng điều khiển</h1>
          <p className="text-gray-600 mt-1">
            {user?.role === 'admin' ? 'Tổng quan hệ thống PlanbookAI - Quản trị viên' :
             user?.role === 'manager' ? 'Tổng quan hệ thống PlanbookAI - Quản lý' :
             user?.role === 'staff' ? 'Tổng quan hệ thống PlanbookAI - Nhân viên' :
             'Tổng quan hệ thống PlanbookAI'}
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng người dùng"
          value={stats.users.total}
          subtitle={`${stats.users.active} đang hoạt động`}
          icon={<FiUsers size={24} />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          trend={{ value: `+${stats.users.new}`, label: "mới tháng này", positive: true }}
        />
        <StatCard
          title="Doanh thu tháng"
          value={`${(stats.revenue.monthly / 1000000).toFixed(1)}M`}
          subtitle="VNĐ"
          icon={<FiDollarSign size={24} />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          trend={{ value: "+12%", label: "so với tháng trước", positive: true }}
        />
        <StatCard
          title="Gói dịch vụ"
          value={stats.packages.active}
          subtitle={`${stats.packages.subscriptions} đăng ký`}
          icon={<FiPackage size={24} />}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatCard
          title="Nội dung hệ thống"
          value={stats.questions + stats.exams + stats.lessons}
          subtitle="Tổng câu hỏi, đề thi, giáo án"
          icon={<FiBook size={24} />}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* Main Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Management */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <FiUsers className="mr-2 text-indigo-600" />
              Quản lý người dùng
            </h2>
            <Link
              to="/admin/users/create"
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <FiPlus className="mr-2" />
              Tạo người dùng
            </Link>
          </div>
          <div className="space-y-3">
            <QuickActionCard
              to="/admin/users"
              icon={<FiUsers />}
              title="Danh sách người dùng"
              description="Xem và quản lý tất cả người dùng trong hệ thống"
              badge="150"
            />
            <QuickActionCard
              to="/admin/users?filter=role"
              icon={<FiShield />}
              title="Phân quyền người dùng"
              description="Cấu hình vai trò và quyền truy cập"
            />
            <QuickActionCard
              to="/admin/users?filter=new"
              icon={<FiTrendingUp />}
              title="Người dùng mới"
              description={`${stats.users.new} người dùng mới trong tháng này`}
              badge={stats.users.new}
            />
          </div>
        </div>

        {/* System Configuration */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-bold mb-6 flex items-center">
            <FiSettings className="mr-2 text-indigo-600" />
            Cấu hình hệ thống
          </h2>
          <div className="space-y-3">
            <QuickActionCard
              to="/admin/settings"
              icon={<FiSettings />}
              title="Cài đặt chung"
              description="Cấu hình hệ thống và tham số"
            />
            <QuickActionCard
              to="/admin/templates"
              icon={<FiLayers />}
              title="Quản lý mẫu giáo án"
              description="Quản lý template tạo giáo án"
            />
            <QuickActionCard
              to="/admin/curriculum"
              icon={<FiGrid />}
              title="Khung chương trình"
              description="Quản lý khung chương trình học"
            />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Doanh thu</h2>
            <select className="text-sm border border-gray-300 rounded-lg px-3 py-1">
              <option>8 tháng qua</option>
              <option>12 tháng qua</option>
            </select>
          </div>
          <SimpleLineChart data={[
            { month: 'Th1', revenue: 8, expenses: 5 },
            { month: 'Th2', revenue: 12, expenses: 7 },
            { month: 'Th3', revenue: 15, expenses: 9 },
            { month: 'Th4', revenue: 18, expenses: 11 },
            { month: 'Th5', revenue: 20, expenses: 12 },
            { month: 'Th6', revenue: 22, expenses: 13 },
            { month: 'Th7', revenue: 25, expenses: 15 },
            { month: 'Th8', revenue: 28, expenses: 16 },
          ]} />
        </div>

        {/* Packages Chart */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Gói dịch vụ</h2>
            <Link
              to="/admin/packages"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              Xem tất cả →
            </Link>
          </div>
          <SimpleDonutChart 
            total={stats.packages.subscriptions}
            data={[
              { label: 'Free', value: 45, color: 'bg-blue-500' },
              { label: 'Basic', value: 35, color: 'bg-green-500' },
              { label: 'Premium', value: 20, color: 'bg-purple-500' },
            ]}
          />
        </div>
      </div>

      {/* Revenue & Packages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <FiDollarSign className="mr-2 text-green-600" />
              Theo dõi doanh thu
            </h2>
            <Link
              to="/admin/analytics?tab=revenue"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              Xem chi tiết →
            </Link>
          </div>
          <div className="space-y-4">
            <RevenueItem
              label="Doanh thu tháng này"
              value={`${(stats.revenue.monthly / 1000000).toFixed(1)}M VNĐ`}
              trend="+12%"
              positive
            />
            <RevenueItem
              label="Tổng doanh thu"
              value={`${(stats.revenue.total / 1000000).toFixed(0)}M VNĐ`}
              trend="+8%"
              positive
            />
            <RevenueItem
              label="Gói đang hoạt động"
              value={`${stats.packages.active} gói`}
              trend={`${stats.packages.subscriptions} đăng ký`}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold flex items-center">
              <FiPackage className="mr-2 text-purple-600" />
              Quản lý gói dịch vụ
            </h2>
            <Link
              to="/admin/packages"
              className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
            >
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-3">
            <QuickActionCard
              to="/admin/packages"
              icon={<FiPackage />}
              title="Danh sách gói dịch vụ"
              description="Quản lý các gói thuê bao"
            />
            <QuickActionCard
              to="/admin/packages/orders"
              icon={<FiTrendingUp />}
              title="Đơn hàng & Đăng ký"
              description="Theo dõi đơn hàng và đăng ký mới"
            />
          </div>
        </div>
      </div>

      {/* Content Management */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-6 flex items-center">
          <FiBook className="mr-2 text-indigo-600" />
          Quản lý nội dung
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <QuickActionCard
            to="/admin/questions"
            icon={<FiBook />}
            title="Duyệt câu hỏi"
            description={`${stats.questions} câu hỏi trong hệ thống`}
            badge={stats.questions}
          />
          <QuickActionCard
            to="/admin/exams"
            icon={<FiFileText />}
            title="Quản lý đề thi"
            description={`${stats.exams} đề thi`}
            badge={stats.exams}
          />
          <QuickActionCard
            to="/admin/lessons"
            icon={<FiBookOpen />}
            title="Quản lý giáo án"
            description={`${stats.lessons} giáo án`}
            badge={stats.lessons}
          />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">📊 Hoạt động gần đây</h2>
        <div className="space-y-3">
          <ActivityItem
            action="Người dùng mới đăng ký"
            subject="5 giáo viên mới"
            time="2 giờ trước"
            icon={<FiUsers className="text-green-600" />}
          />
          <ActivityItem
            action="Duyệt câu hỏi"
            subject="25 câu hỏi đã được duyệt"
            time="4 giờ trước"
            icon={<FiBook className="text-blue-600" />}
          />
          <ActivityItem
            action="Đăng ký gói mới"
            subject="3 đăng ký gói Premium"
            time="1 ngày trước"
            icon={<FiPackage className="text-purple-600" />}
          />
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ title, value, subtitle, icon, iconBg, iconColor, trend, link }) => {
  const CardContent = (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`${iconBg} ${iconColor} p-3 rounded-lg`}>
          {icon}
        </div>
        {trend && (
          <div className="text-right">
            <div className={`text-sm font-semibold ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.value}
            </div>
            <div className="text-xs text-gray-500">{trend.label}</div>
          </div>
        )}
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

const QuickActionCard = ({ to, icon, title, description, badge }) => (
  <Link to={to}>
    <div className="border-2 border-gray-200 rounded-lg p-4 hover:border-indigo-500 hover:shadow-md transition-all group">
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1">
          <div className="text-indigo-600 mr-3 mt-1 group-hover:scale-110 transition-transform">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
            <p className="text-sm text-gray-600">{description}</p>
          </div>
        </div>
        {badge && (
          <span className="ml-3 px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
            {badge}
          </span>
        )}
      </div>
    </div>
  </Link>
);

const RevenueItem = ({ label, value, trend, positive }) => (
  <div className="flex items-center justify-between py-3 border-b last:border-b-0">
    <div>
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-lg font-bold text-gray-900 mt-1">{value}</p>
    </div>
    {trend && (
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
        positive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
      }`}>
        {trend}
      </span>
    )}
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

// Simple Line Chart Component
const SimpleLineChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => Math.max(d.revenue, d.expenses)));
  const height = 200;

  return (
    <div className="relative" style={{ height: `${height}px` }}>
      <svg className="w-full h-full" viewBox={`0 0 ${data.length * 60} ${height}`} preserveAspectRatio="none">
        {/* Revenue line */}
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="3"
          points={data.map((d, i) => `${i * 60 + 30},${height - (d.revenue / maxValue) * (height - 40) - 20}`).join(' ')}
        />
        {/* Expenses line */}
        <polyline
          fill="none"
          stroke="#3b82f6"
          strokeWidth="3"
          points={data.map((d, i) => `${i * 60 + 30},${height - (d.expenses / maxValue) * (height - 40) - 20}`).join(' ')}
        />
      </svg>
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
        {data.map((d, i) => (
          <span key={i}>{d.month}</span>
        ))}
      </div>
      <div className="absolute top-0 right-0 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-green-500"></div>
          <span className="text-gray-600">Doanh thu</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-0.5 bg-blue-500"></div>
          <span className="text-gray-600">Chi phí</span>
        </div>
      </div>
    </div>
  );
};

// Simple Donut Chart Component
const SimpleDonutChart = ({ total, data }) => {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 50;
  const centerX = 64;
  const centerY = 64;
  let currentAngle = -90; // Start from top

  const getColorClass = (colorClass) => {
    const colorMap = {
      'bg-blue-500': '#3b82f6',
      'bg-green-500': '#10b981',
      'bg-purple-500': '#8b5cf6',
      'bg-orange-500': '#f97316',
    };
    return colorMap[colorClass] || '#6b7280';
  };

  return (
    <div className="flex items-center justify-center py-4">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full" viewBox="0 0 128 128">
          {data.map((item, index) => {
            const percentage = (item.value / totalValue) * 100;
            const angle = (percentage / 100) * 360;
            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;
            currentAngle = endAngle;

            const startAngleRad = (startAngle * Math.PI) / 180;
            const endAngleRad = (endAngle * Math.PI) / 180;

            const x1 = centerX + radius * Math.cos(startAngleRad);
            const y1 = centerY + radius * Math.sin(startAngleRad);
            const x2 = centerX + radius * Math.cos(endAngleRad);
            const y2 = centerY + radius * Math.sin(endAngleRad);

            const largeArc = angle > 180 ? 1 : 0;

            return (
              <path
                key={index}
                d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`}
                fill={getColorClass(item.color)}
                opacity="0.8"
              />
            );
          })}
          {/* Inner circle for donut effect */}
          <circle cx={centerX} cy={centerY} r="30" fill="white" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">{total}</div>
            <div className="text-xs text-gray-500">Tổng đăng ký</div>
          </div>
        </div>
      </div>
      <div className="ml-8 space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <div className={`w-4 h-4 rounded-full ${item.color}`}></div>
            <div className="flex-1">
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
