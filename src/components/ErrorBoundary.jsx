import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
    this.retryCount = 0;
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);

    // DOM manipulation errors caused by browser extensions (e.g. translation plugins)
    // Try to recover automatically instead of showing error page
    const msg = error?.message || '';
    const isDomError = msg.includes('removeChild') ||
      msg.includes('insertBefore') ||
      msg.includes('appendChild') ||
      msg.includes('not a child');

    if (isDomError && this.retryCount < 3) {
      this.retryCount++;
      console.warn(`DOM error from browser extension detected, auto-recovering (attempt ${this.retryCount})...`);
      // Reset state to re-render children
      setTimeout(() => this.setState({ hasError: false, error: null }), 0);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex', justifyContent: 'center', alignItems: 'center',
          minHeight: '100vh', backgroundColor: '#f0f4f8', padding: '40px'
        }}>
          <div style={{
            textAlign: 'center', maxWidth: '480px', padding: '40px',
            backgroundColor: '#fff', borderRadius: '16px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚠️</div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
              页面加载出错
            </h2>
            <p style={{ fontSize: '14px', color: '#8c8c8c', marginBottom: '24px' }}>
              {this.state.error?.message || '发生了未知错误'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = '/';
              }}
              style={{
                padding: '10px 24px', fontSize: '14px', fontWeight: '500',
                backgroundColor: '#1890ff', color: '#fff', border: 'none',
                borderRadius: '8px', cursor: 'pointer'
              }}
            >
              返回首页
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
