import React, { useState, useEffect, useMemo } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { getMenuItemsByRole, isTeacher } from '../../utils/rbac';
import {
  FiHome, FiBook, FiFileText, FiSettings,
  FiUser, FiLogOut, FiMenu, FiX, FiBookOpen, FiFolder,
  FiSearch, FiBell, FiChevronDown, FiCheckSquare
} from 'react-icons/fi';

const iconMap = {
  FiHome,
  FiBook,
  FiFileText,
  FiSettings,
  FiUser,
  FiBookOpen,
  FiFolder,
  FiCheckSquare
};

export default function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [notifications] = useState(2); // Mock notification count
  const { user, logout, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // ✅ CHỈ KIỂM TRA ROLE
  useEffect(() => {
    if (loading) return; // Đợi loading xong
    if (!user) return;

    // ✅ Đảm bảo role là string
    const role = typeof user.role === 'string' ? user.role.toLowerCase() : '';
    if (role && !isTeacher(role)) {
      navigate('/admin', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/teacher/login', { replace: true });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Tìm kiếm trong các trang: questions, exams, lessons
      navigate(`/teacher/questions?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  // ✅ Đảm bảo navigation luôn là array và có cấu trúc đúng
  const navigation = useMemo(() => {
    // ✅ Đợi loading xong và user có role
    if (loading || !user) return [];
    
    // ✅ Đảm bảo role là string
    const userRole = typeof user.role === 'string' ? user.role : '';
    if (!userRole) return [];
    
    try {
      const items = getMenuItemsByRole(userRole);
      // Đảm bảo mỗi item có đúng cấu trúc và tất cả giá trị đều là string
      if (!Array.isArray(items)) return [];
      
      return items.filter(item => {
        if (!item || typeof item !== 'object') return false;
        return (
          typeof item.name === 'string' && 
          typeof item.href === 'string' && 
          typeof item.icon === 'string' &&
          item.name.length > 0 &&
          item.href.length > 0
        );
      }).map(item => ({
        name: String(item.name || ''),
        href: String(item.href || '/teacher'),
        icon: String(item.icon || 'FiHome'),
        permission: item.permission || null
      }));
    } catch (error) {
      console.error('Error getting menu items:', error);
      return [];
    }
  }, [user, loading]);

  // ✅ Loading state - không render khi đang load
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transform transition-transform
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 bg-blue-600">
            <Link to="/teacher" className="text-xl font-bold text-white">
              🎓 PlanbookAI
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-white">
              <FiX size={22} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation && navigation.length > 0 ? (
              navigation.map((item, index) => {
                // ✅ Đảm bảo item có đúng cấu trúc
                if (!item || typeof item !== 'object') return null;
                
                const iconName = typeof item.icon === 'string' ? item.icon : 'FiHome';
                const Icon = iconMap[iconName] || FiHome;
                const itemName = typeof item.name === 'string' ? item.name : '';
                const itemHref = typeof item.href === 'string' ? item.href : '/teacher';
                
                const active =
                  location.pathname === itemHref ||
                  location.pathname.startsWith(itemHref + '/');

                return (
                  <Link
                    key={`${itemName}-${index}`}
                    to={itemHref}
                    className={`flex items-center px-4 py-3 rounded-lg
                      ${active ? 'bg-blue-50 text-blue-600 font-semibold' : 'hover:bg-gray-100'}
                    `}
                  >
                    <Icon className="mr-3" />
                    {itemName}
                  </Link>
                );
              })
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                Đang tải menu...
              </div>
            )}
          </nav>
        </div>
      </aside>

      {/* Main */}
      <div className="lg:pl-64">
        <header className="h-16 bg-white shadow flex items-center justify-between px-6">
          <div className="flex items-center flex-1">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4">
              <FiMenu size={22} />
            </button>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="hidden md:flex items-center flex-1 max-w-md">
              <div className="relative w-full">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Tìm kiếm câu hỏi, đề thi, giáo án..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </form>
          </div>

          {/* Right Side: Blog, Notifications & Profile */}
          <div className="flex items-center gap-4">
            {/* Blog Link */}
            <Link
              to="/blog"
              className="hidden md:flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FiBookOpen className="mr-2" size={16} />
              Blog
            </Link>
            {/* Notifications */}
            <div className="relative">
              <button className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors">
                <FiBell size={20} />
                {notifications > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">
                  {(() => {
                    const username = user?.username || '';
                    const firstChar = typeof username === 'string' && username.length > 0 
                      ? username[0].toUpperCase() 
                      : 'T';
                    return firstChar;
                  })()}
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {(() => {
                    const fullName = user?.full_name || '';
                    const username = user?.username || '';
                    const displayName = typeof fullName === 'string' && fullName.length > 0
                      ? fullName
                      : (typeof username === 'string' && username.length > 0 ? username : 'Giáo viên');
                    return displayName;
                  })()}
                </span>
                <FiChevronDown className="hidden md:block text-gray-500" size={16} />
              </button>

              {/* Dropdown Menu */}
              {profileDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setProfileDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <div className="p-4 border-b border-gray-200">
                      <p className="font-semibold text-gray-900">
                        {(() => {
                          const fullName = user?.full_name || '';
                          const username = user?.username || '';
                          return typeof fullName === 'string' && fullName.length > 0
                            ? fullName
                            : (typeof username === 'string' && username.length > 0 ? username : 'Giáo viên');
                        })()}
                      </p>
                      <p className="text-xs text-gray-500">Giáo viên</p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/teacher/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setProfileDropdownOpen(false)}
                      >
                        <FiUser className="mr-3" size={16} />
                        Hồ sơ
                      </Link>
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          handleLogout();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <FiLogOut className="mr-3" size={16} />
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
