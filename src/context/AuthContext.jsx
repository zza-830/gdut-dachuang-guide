import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // 关键修复：从 localStorage 同步初始化 user，避免白屏
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('auth_user');
      const token = localStorage.getItem('token');
      if (saved && token) return JSON.parse(saved);
    } catch {}
    return null;
  });

  // 如果已有缓存用户数据，不需要 loading（直接渲染）
  const [loading, setLoading] = useState(() => {
    const token = localStorage.getItem('token');
    const saved = localStorage.getItem('auth_user');
    // 有 token 但没有缓存用户 → 需要加载；否则不需要
    return !!(token && !saved);
  });

  // 启动时后台验证 token 有效性（不阻塞渲染）
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await api.get('/auth/profile');
        if (res.data.success) {
          const freshUser = res.data.data;
          setUser(freshUser);
          localStorage.setItem('auth_user', JSON.stringify(freshUser));
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('auth_user');
          setUser(null);
        }
      } catch (err) {
        // token 验证失败（包括 401、网络错误等）→ 清除缓存，强制重新登录
        localStorage.removeItem('token');
        localStorage.removeItem('auth_user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    verifySession();
  }, []);

  /**
   * 登录 - 返回 Promise，确保 user 状态已设置
   */
  const login = useCallback(async (studentId, password) => {
    try {
      const res = await api.post('/auth/login', {
        student_id: studentId,
        password
      });
      if (res.data.success) {
        const { user: userData, token } = res.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('auth_user', JSON.stringify(userData));
        setUser(userData);
        return { success: true, user: userData };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      // 后端不可用时，直接返回错误，不允许绕过登录
      const msg = err.response?.data?.message || '登录失败，后端服务不可用，请确认服务已启动';
      return { success: false, message: msg };
    }
  }, []);

  /**
   * 注册 - 注册成功后不自动登录，返回结果让调用方决定
   */
  const register = useCallback(async (data) => {
    try {
      const res = await api.post('/auth/register', {
        student_id: data.studentId,
        password: data.password,
        name: data.name,
        email: data.email,
        phone: data.phone,
        department: data.department,
        major: data.major,
        grade: data.grade
      });
      if (res.data.success) {
        // 注册成功，不自动设置 user（让用户手动登录）
        return { success: true, message: '注册成功，请登录' };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || '注册失败，请稍后重试';
      return { success: false, message: msg };
    }
  }, []);

  // 登出
  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('auth_user');
    sessionStorage.removeItem('auth_user');
  }, []);

  // 检查是否已登录
  const isAuthenticated = useCallback(() => user !== null, [user]);

  // 更新用户信息
  const updateUser = useCallback(async (updates) => {
    try {
      const res = await api.put('/auth/profile', updates);
      if (res.data.success) {
        setUser(res.data.data);
        localStorage.setItem('auth_user', JSON.stringify(res.data.data));
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || '更新失败';
      return { success: false, message: msg };
    }
  }, []);

  // 上传头像
  const uploadAvatar = useCallback(async (file) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const res = await api.post('/auth/avatar', formData);
      if (res.data.success) {
        setUser(res.data.data);
        localStorage.setItem('auth_user', JSON.stringify(res.data.data));
        return { success: true };
      }
      return { success: false, message: res.data.message };
    } catch (err) {
      const msg = err.response?.data?.message || '头像上传失败';
      return { success: false, message: msg };
    }
  }, []);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated,
    updateUser,
    uploadAvatar
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
