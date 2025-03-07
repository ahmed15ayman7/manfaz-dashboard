import axios from 'axios';
import authService from './services/auth.service';
import { BASE_URL } from './config';

const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// إضافة التوكن لكل الطلبات
axiosInstance.interceptors.request.use(
  (config) => {
    const token = authService.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// التعامل مع الاستجابات وتجديد التوكن عند الحاجة
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // التحقق من أن الخطأ 401 وأن الطلب لم يتم تجديده من قبل
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // محاولة تجديد التوكن
        const newAccessToken = await authService.refreshToken();

        // تحديث التوكن في الطلب الأصلي وإعادة المحاولة
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // إذا فشل تجديد التوكن، قم بتسجيل الخروج
        authService.logout();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance; 