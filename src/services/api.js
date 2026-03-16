import axios from 'axios';

// 创建 axios 实例
// Docker/生产环境通过 Nginx 反向代理，使用相对路径 /api
// 开发环境可通过 VITE_API_URL 环境变量覆盖
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器 - 自动附加 token，处理 FormData
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // FormData 时让浏览器自动设置 Content-Type（含 boundary）
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器 - 处理 401
// 登录/注册的 401 直接抛给调用方；其他 401 只清除凭据，由 React 路由自然跳转
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // 登录/注册接口的 401 不做任何处理，直接抛给调用方显示错误
      if (url.includes('/auth/login') || url.includes('/auth/register')) {
        return Promise.reject(error);
      }
      // 其他接口的 401 表示 token 过期，只清除凭据
      // 不做 window.location.href 硬跳转（会导致白屏）
      // React 的 RequireAuth 组件会检测到 user 为 null 后自动跳转到 /login
      localStorage.removeItem('token');
      localStorage.removeItem('auth_user');
    }
    return Promise.reject(error);
  }
);

export default api;
