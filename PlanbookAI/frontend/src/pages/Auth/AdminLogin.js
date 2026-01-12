import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';

export default function AdminLogin() {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Hiển thị thông báo từ register nếu có
  useEffect(() => {
    if (location.state?.message) {
      const message = typeof location.state.message === 'string'
        ? location.state.message
        : 'Thông báo';
      toast.success(message, {
        position: "top-center",
        autoClose: 3000,
      });
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(formData.username, formData.password, 'admin');

      if (!result.success) {
        // ✅ FIX: Set error LUÔN LÀ STRING
        const errorMsg = typeof result.error === 'string'
          ? result.error
          : (typeof result.error === 'object' && result.error?.detail
            ? String(result.error.detail)
            : 'Đăng nhập thất bại');
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }

      // Kiểm tra user từ result
      const user = result.user;
      if (!user) {
        setError('Không lấy được thông tin người dùng');
        return;
      }

      // ✅ Đảm bảo role là string
      const userRole = typeof user.role === 'string' ? user.role.toLowerCase() : '';

      // ✅ ĐÚNG CỔNG QUẢN TRỊ (admin, manager, staff)
      if (userRole === 'admin' || userRole === 'manager' || userRole === 'staff') {
        toast.success('Đăng nhập thành công!', {
          position: "top-center",
          autoClose: 1500,
        });
        navigate('/admin', { replace: true });
      } else {
        setError('Bạn không có quyền truy cập cổng quản trị. Vui lòng sử dụng cổng giáo viên.');
        navigate('/teacher/login', { replace: true });
      }
    } catch (err) {
      // ✅ FIX: Set error LUÔN LÀ STRING và convert sang tiếng Việt
      let errorMsg = 'Có lỗi xảy ra khi đăng nhập';

      if (err?.response?.data?.detail) {
        const detail = err.response.data.detail;
        if (typeof detail === 'string') {
          errorMsg = detail;
        } else if (Array.isArray(detail)) {
          errorMsg = detail.map(d => typeof d === 'string' ? d : JSON.stringify(d)).join(', ');
        } else if (typeof detail === 'object') {
          errorMsg = detail.msg || detail.message || JSON.stringify(detail);
        }
      } else if (err?.message && typeof err.message === 'string') {
        errorMsg = err.message;
      }

      // ✅ Convert message sang tiếng Việt
      if (errorMsg.includes('Incorrect username or password') || errorMsg.includes('401')) {
        errorMsg = 'Tên đăng nhập hoặc mật khẩu không đúng. Vui lòng thử lại.';
      } else if (errorMsg.includes('User not found')) {
        errorMsg = 'Tài khoản không tồn tại. Vui lòng kiểm tra lại.';
      } else if (errorMsg.includes('Unauthorized')) {
        errorMsg = 'Tên đăng nhập hoặc mật khẩu không đúng.';
      }

      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 mb-4">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            🔐 Cổng Quản trị
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Dành cho Admin, Manager, Staff - Quản lý hệ thống
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* ✅ FIX: TUYỆT ĐỐI KHÔNG RENDER OBJECT */}
          {error && typeof error === 'string' && error.length > 0 && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <p className="text-sm text-red-800">
                {error}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Tên đăng nhập / Email
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="Nhập tên đăng nhập hoặc email"
                value={formData.username}
                onChange={handleChange}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mật khẩu
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10"
                  placeholder="Nhập mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m13.42 13.42l-3.29-3.29m0 0a3 3 0 01-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">
              Bạn là giáo viên?{' '}
              <Link to="/teacher/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Đăng nhập tại đây
              </Link>
            </p>
            <p className="text-sm text-gray-600">
              Chưa có tài khoản?{' '}
              <Link to="/admin/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                Đăng ký Admin
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
