import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(
        !!localStorage.getItem("token")
    );
    const [loading, setLoading] = useState(true);

    // ======================
    // FETCH USER INFO
    // ======================
    const fetchUserInfo = async () => {
        try {
            const res = await api.get("/auth/me");
            setUser(res.data);
            setIsAuthenticated(true);
            return res.data;
        } catch (err) {
            // ✅ CHỈ clear token nếu là 401 (unauthorized)
            // Giữ token nếu là network error để không mất session
            if (err?.response?.status === 401) {
                localStorage.removeItem("token");
                setUser(null);
                setIsAuthenticated(false);
            }
            // Nếu là lỗi khác (network, CORS), không clear token
            // Để user có thể retry sau
            throw err; // Re-throw để caller xử lý
        }
    };

    // Load user on refresh
    useEffect(() => {
        const loadUser = async () => {
            const token = localStorage.getItem("token");
            if (token) {
                try {
                    const userInfo = await fetchUserInfo();
                    if (userInfo) {
                        setUser(userInfo);
                        setIsAuthenticated(true);
                    }
                } catch (error) {
                    console.error("Error loading user:", error);
                    // ✅ CHỈ clear token nếu là 401 (unauthorized)
                    // Giữ token nếu là network error để không mất session
                    if (error?.response?.status === 401) {
                        localStorage.removeItem("token");
                        setUser(null);
                        setIsAuthenticated(false);
                    } else {
                        // Network error hoặc lỗi khác - giữ token, user có thể reload
                        // Không set isAuthenticated = true ngay, để user biết đang có vấn đề
                        // Nhưng cũng không clear token để không mất session
                        setIsAuthenticated(true); // Giữ authenticated để không redirect
                    }
                }
            } else {
                // ✅ BẮT BUỘC ĐĂNG NHẬP: Không có token = không authenticated
                setUser(null);
                setIsAuthenticated(false);
            }
            setLoading(false);
        };

        loadUser();
    }, []);

    // ======================
    // LOGIN
    // ======================
    const login = async (username, password, portal) => {
        try {
            // ✅ FIX 2: Gửi form data đúng chuẩn OAuth2PasswordRequestForm
            const formData = new URLSearchParams();
            formData.append("username", username);
            formData.append("password", password);

            // ✅ QUAN TRỌNG: Convert URLSearchParams to string
            const formDataString = formData.toString();

            const res = await api.post("/auth/login", formDataString, {
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });

            const { access_token, user: userFromResponse } = res.data;

            if (!access_token) {
                throw new Error("Không nhận được access token");
            }

            // Lưu token
            localStorage.setItem("token", access_token);
            setIsAuthenticated(true);

            // ✅ Sử dụng user info từ response nếu có
            let userInfo = userFromResponse;

            if (!userInfo) {
                // Nếu không có user info trong response, thử fetch từ /me
                // Nhưng không throw error nếu fail, vì có thể do CORS hoặc network
                try {
                    userInfo = await fetchUserInfo();
                } catch (fetchError) {
                    console.warn("Could not fetch user info, but login succeeded:", fetchError);
                    // Vẫn tiếp tục với token, user sẽ được load sau
                }

                if (!userInfo) {
                    // Nếu vẫn không có user info, tạo một object tạm từ token
                    // User sẽ được load trong useEffect khi component mount
                    console.warn("No user info available, will load on next render");
                }
            }

            // Set user nếu có
            if (userInfo) {
                setUser(userInfo);
            }

            const role = userInfo.role?.toLowerCase();

            // Check role theo portal
            if (portal === "admin" && !["admin", "manager", "staff"].includes(role)) {
                throw new Error("Không có quyền truy cập cổng quản trị");
            }

            if (portal === "teacher" && role !== "teacher") {
                throw new Error("Không có quyền truy cập cổng giáo viên");
            }

            setIsAuthenticated(true);
            return { success: true, user: userInfo };

        } catch (err) {
            console.error("Login error:", err);

            // ✅ FIX 4: Set error LUÔN LÀ STRING
            const errorMessage =
                err?.response?.data?.detail ||
                err?.message ||
                "Đăng nhập thất bại";

            localStorage.removeItem("token");
            setUser(null);
            setIsAuthenticated(false);

            return {
                success: false,
                error: errorMessage,
            };
        }
    };

    // ======================
    // LOGOUT
    // ======================
    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                loading,
                login,
                logout,
                fetchUserInfo,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
};
