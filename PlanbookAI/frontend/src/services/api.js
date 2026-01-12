import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_GATEWAY_URL || "http://localhost:8000";

// ✅ FIX 1: KHÔNG set Content-Type mặc định
// Axios sẽ tự động set đúng Content-Type cho từng loại request
const api = axios.create({
  baseURL: API_BASE_URL,
});

// ================== REQUEST INTERCEPTOR ==================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // ✅ QUAN TRỌNG: Xử lý form-urlencoded data
    // Nếu data là string và Content-Type là form-urlencoded, không transform
    if (config.headers["Content-Type"] === "application/x-www-form-urlencoded") {
      if (typeof config.data === "string") {
        // Data đã là string, giữ nguyên
        config.transformRequest = [(data) => data];
      } else if (config.data instanceof URLSearchParams) {
        // Convert URLSearchParams to string
        config.data = config.data.toString();
        config.transformRequest = [(data) => data];
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ================== RESPONSE INTERCEPTOR ==================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ✅ CHỈ clear token khi thực sự là 401 (unauthorized)
    // Không clear khi network error để giữ session
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      // Không redirect tự động, để component xử lý
      // window.location.href = "/login";
    }
    // Nếu là network error (không có response), không clear token
    
    // ✅ FIX 4: Đảm bảo error.response.data.detail LUÔN LÀ STRING
    if (error.response?.data?.detail) {
      const detail = error.response.data.detail;
      
      // Nếu detail là object hoặc array, convert sang string an toàn
      if (typeof detail !== 'string') {
        if (Array.isArray(detail)) {
          // FastAPI validation errors: [{ type, loc, msg, input, url }]
          error.response.data.detail = detail
            .map(d => typeof d === 'string' ? d : (d.msg || 'Lỗi xác thực dữ liệu'))
            .join(', ');
        } else if (typeof detail === 'object') {
          error.response.data.detail = detail.msg || detail.message || 'Lỗi xác thực dữ liệu';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
