// 全局通用按钮组件 - V3.0 Design System
import React from 'react';
import { Spinner } from 'react-bootstrap';

/**
 * CommonButton - 统一按钮组件
 * @param {string} variant - 按钮类型: 'primary' | 'secondary' | 'tertiary' | 'danger' | 'link'
 * @param {boolean} loading - 是否显示加载状态
 * @param {boolean} disabled - 是否禁用
 * @param {ReactNode} children - 按钮内容
 * @param {object} style - 自定义样式
 * @param {function} onClick - 点击事件
 * @param {string} size - 按钮大小: 'sm' | 'md' | 'lg'
 * @param {boolean} fullWidth - 是否全宽
 */
const CommonButton = ({
  variant = 'primary',
  loading = false,
  disabled = false,
  children,
  style = {},
  onClick,
  size = 'md',
  fullWidth = false,
  className = '',
  type = 'button',
  ...props
}) => {
  // 按钮样式定义
  const getVariantStyles = () => {
    const baseStyles = {
      border: 'none',
      borderRadius: variant === 'primary' ? '50px' : '8px', // Primary使用圆角pill
      fontWeight: '500',
      transition: 'all 0.3s ease',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      position: 'relative',
      overflow: 'hidden',
      boxShadow: variant === 'primary' ? '0 2px 8px rgba(0, 123, 255, 0.3)' : 'none',
    };

    const sizeStyles = {
      sm: { padding: '6px 16px', fontSize: '14px', minHeight: '32px' },
      md: { padding: '10px 24px', fontSize: '16px', minHeight: '44px' },
      lg: { padding: '14px 32px', fontSize: '18px', minHeight: '52px' },
    };

    const variantStyles = {
      primary: {
        backgroundColor: '#007BFF', // GDUT官方蓝
        color: '#FFFFFF',
        boxShadow: '0 2px 8px rgba(0, 123, 255, 0.3)',
        ':hover': {
          backgroundColor: '#0056b3',
          transform: 'translateY(-1px)',
          boxShadow: '0 4px 12px rgba(0, 123, 255, 0.4)',
        },
        ':active': {
          transform: 'scale(0.95)',
        },
      },
      secondary: {
        backgroundColor: '#FFFFFF',
        color: '#007BFF',
        border: '2px solid #007BFF',
        ':hover': {
          backgroundColor: '#F0F4F8',
          borderColor: '#0056b3',
        },
      },
      tertiary: {
        backgroundColor: 'transparent',
        color: '#6c757d',
        border: 'none',
        ':hover': {
          color: '#007BFF',
          backgroundColor: '#F8F9FA',
        },
      },
      danger: {
        backgroundColor: '#FFF5F5',
        color: '#DC3545',
        border: '1px solid #DC3545',
        ':hover': {
          backgroundColor: '#FFEBEE',
          borderColor: '#C82333',
        },
      },
      link: {
        backgroundColor: 'transparent',
        color: '#6c757d',
        border: 'none',
        boxShadow: 'none',
        padding: '0',
        minHeight: 'auto',
        ':hover': {
          color: '#007BFF',
          textDecoration: 'underline',
        },
      },
    };

    return {
      ...baseStyles,
      ...sizeStyles[size],
      ...variantStyles[variant],
      width: fullWidth ? '100%' : 'auto',
      opacity: disabled || loading ? 0.6 : 1,
    };
  };

  const handleClick = (e) => {
    if (disabled || loading) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      type={type}
      className={`common-button common-button-${variant} ${className}`}
      style={{
        ...getVariantStyles(),
        ...style,
      }}
      onClick={handleClick}
      disabled={disabled || loading}
      onMouseDown={(e) => {
        if (variant === 'primary' && !disabled && !loading) {
          e.currentTarget.style.transform = 'scale(0.95)';
        }
      }}
      onMouseUp={(e) => {
        if (variant === 'primary' && !disabled && !loading) {
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary' && !disabled && !loading) {
          e.currentTarget.style.transform = 'scale(1)';
        }
      }}
      {...props}
    >
      {loading && (
        <Spinner
          animation="border"
          size="sm"
          style={{
            width: '16px',
            height: '16px',
            borderWidth: '2px',
            marginRight: '8px',
          }}
        />
      )}
      <span style={{ opacity: loading ? 0.7 : 1 }}>{children}</span>
    </button>
  );
};

export default CommonButton;

