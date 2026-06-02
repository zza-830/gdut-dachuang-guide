// Toast通知组件 - V3.0 Feedback System
import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

/**
 * Toast通知系统
 * 使用方式：
 * import { showToast } from '../components/Toast';
 * showToast('success', '操作成功！');
 */

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    // 全局注册showToast函数
    window.showToast = (type, message, duration = 3000) => {
      const id = Date.now();
      const newToast = { id, type, message, duration };
      setToasts((prev) => [...prev, newToast]);

      // 自动移除
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
      }, duration);
    };
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const getToastConfig = (type) => {
    const configs = {
      success: {
        variant: 'success',
        icon: <FaCheckCircle />,
        bgColor: '#D4EDDA',
        borderColor: '#28A745',
        textColor: '#155724',
      },
      error: {
        variant: 'danger',
        icon: <FaExclamationCircle />,
        bgColor: '#F8D7DA',
        borderColor: '#DC3545',
        textColor: '#721C24',
      },
      info: {
        variant: 'info',
        icon: <FaInfoCircle />,
        bgColor: '#D1ECF1',
        borderColor: '#17A2B8',
        textColor: '#0C5460',
      },
      warning: {
        variant: 'warning',
        icon: <FaExclamationCircle />,
        bgColor: '#FFF3CD',
        borderColor: '#FFC107',
        textColor: '#856404',
      },
    };
    return configs[type] || configs.info;
  };

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '400px',
      }}
    >
      {toasts.map((toast) => {
        const config = getToastConfig(toast.type);
        return (
          <Alert
            key={toast.id}
            variant={config.variant}
            style={{
              backgroundColor: config.bgColor,
              border: `1px solid ${config.borderColor}`,
              color: config.textColor,
              borderRadius: '8px',
              padding: '12px 16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              animation: 'slideInRight 0.3s ease-out',
              minWidth: '300px',
            }}
          >
            <span style={{ fontSize: '20px' }}>{config.icon}</span>
            <span style={{ flex: 1, fontSize: '14px', fontWeight: '500' }}>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: config.textColor,
                cursor: 'pointer',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                opacity: 0.7,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.7')}
            >
              <FaTimes />
            </button>
          </Alert>
        );
      })}
    </div>
  );
};

// 导出便捷函数
export const showToast = (type, message, duration = 3000) => {
  if (window.showToast) {
    window.showToast(type, message, duration);
  } else {
    // 降级到alert
    alert(message);
  }
};

export default ToastContainer;









