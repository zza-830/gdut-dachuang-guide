// AISection - Reusable Dual-Box AI Editor Component
// Input -> Polish -> Output structure for AI-powered text generation
import React, { useState, useCallback } from 'react';
import { Card, Form, Alert } from 'react-bootstrap';
import { FaMagic, FaEdit, FaCopy, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import CommonButton from './CommonButton';
import { polishText } from '../services/aiService';
import { showToast } from './Toast';

// 纯 CSS Spinner 组件 - 避免 React Bootstrap Spinner 的兼容性问题
const InlineSpinner = ({ size = 16, color = '#fff' }) => (
  <span
    style={{
      display: 'inline-block',
      width: size,
      height: size,
      border: `2px solid ${color}`,
      borderTopColor: 'transparent',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }}
  />
);

// 安全的 Toast 调用
const safeShowToast = (type, message) => {
  try {
    if (typeof showToast === 'function') {
      showToast(type, message);
    } else if (window.showToast) {
      window.showToast(type, message);
    } else {
      console.log(`[Toast ${type}]: ${message}`);
    }
  } catch (e) {
    console.error('Toast error:', e);
  }
};

/**
 * AISection - 双文本框 AI 编辑器区块组件
 * @param {string} title - 区块标题（如"1. 项目简介"）
 * @param {string} promptKey - 提示词 key（如"project_intro"）
 * @param {string} placeholder - 输入框占位符
 * @param {string} value - AI 润色后的最终内容（受控）
 * @param {function} onChange - 更新父组件状态的回调
 * @param {number} inputRows - 输入框行数
 * @param {number} outputRows - 输出框行数
 */
const AISection = ({
  title,
  promptKey,
  placeholder = '请输入原始想法...',
  value = '',
  onChange,
  inputRows = 4,
  outputRows = 6
}) => {
  // 本地状态：用户原始输入
  const [userInput, setUserInput] = useState('');
  // 加载状态
  const [isPolishing, setIsPolishing] = useState(false);
  // 错误状态
  const [error, setError] = useState(null);

  // 处理 AI 润色
  const handlePolish = useCallback(async () => {
    // 实施防御性编程修复，确保调用 trim 的是字符串
    const safeInput = typeof userInput === 'string' ? userInput : String(userInput || '');
    if (!safeInput.trim()) {
      safeShowToast('warning', '请先输入内容');
      return;
    }

    setError(null);
    setIsPolishing(true);

    try {
      console.log('[AISection] Starting polish for:', promptKey);
      const result = await polishText(userInput, promptKey);
      console.log('[AISection] Polish result received:', typeof result);
      
      if (result && typeof result === 'string') {
        onChange(result);
        safeShowToast('success', 'AI 润色完成');
      } else {
        throw new Error('AI 返回结果无效');
      }
    } catch (err) {
      console.error('[AISection] AI Polish Error:', err);
      const errorMsg = err?.message || 'AI 服务暂时不可用';
      setError(errorMsg);
      safeShowToast('error', `润色失败: ${errorMsg}`);
    } finally {
      setIsPolishing(false);
    }
  }, [userInput, promptKey, onChange]);

  // 复制结果
  const handleCopy = useCallback(() => {
    if (value) {
      navigator.clipboard.writeText(value).then(() => {
        safeShowToast('success', '已复制到剪贴板');
      }).catch(err => {
        console.error('Copy failed:', err);
      });
    }
  }, [value]);

  // 应用结果到输入框
  const handleApplyToInput = useCallback(() => {
    if (value) {
      setUserInput(value);
      safeShowToast('success', '已应用到输入框');
    }
  }, [value]);

  return (
    <Card className="mb-4" style={{
      border: 'none',
      borderRadius: '16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)'
    }}>
      <Card.Body className="p-4">
        {/* Section Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h5 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '600',
            color: '#333'
          }}>
            {title}
          </h5>
          <CommonButton
            variant="primary"
            onClick={handlePolish}
            disabled={isPolishing || !(typeof userInput === 'string' ? userInput : String(userInput || '')).trim()}
            style={{
              background: isPolishing ? '#a0a0a0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              padding: '8px 20px',
              fontSize: '13px',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              opacity: isPolishing ? 0.7 : 1,
              cursor: isPolishing ? 'not-allowed' : 'pointer'
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isPolishing && <InlineSpinner size={14} color="#fff" />}
              <span>{isPolishing ? '生成中...' : '✨ AI 润色'}</span>
            </span>
          </CommonButton>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="warning" dismissible onClose={() => setError(null)} style={{
            fontSize: '13px',
            padding: '10px 14px',
            marginBottom: '16px',
            borderRadius: '10px'
          }}>
            <FaExclamationTriangle style={{ marginRight: '8px' }} />
            {error}
          </Alert>
        )}

        {/* User Input Box (Top) */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{
            fontSize: '12px',
            color: '#8c8c8c',
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <FaEdit size={11} />
            原始输入 (Raw Input)
          </div>
          <Form.Control
            as="textarea"
            rows={inputRows}
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder={placeholder}
            disabled={isPolishing}
            style={{
              backgroundColor: '#fff',
              border: '1px solid #d9d9d9',
              borderRadius: '10px',
              padding: '12px',
              fontSize: '14px',
              resize: 'vertical',
              opacity: isPolishing ? 0.7 : 1
            }}
          />
        </div>

        {/* AI Result Box (Bottom) */}
        <div>
          <div style={{
            fontSize: '12px',
            color: '#1890ff',
            marginBottom: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaMagic size={11} />
              AI 润色结果 (Polished Result)
            </span>
            {value && !isPolishing && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <span onClick={handleCopy} style={{
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: '#1890ff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <FaCopy size={10} /> 复制
                </span>
                <span onClick={handleApplyToInput} style={{
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: '#52c41a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <FaCheck size={10} /> 应用到输入
                </span>
              </div>
            )}
          </div>

          {isPolishing ? (
            <div style={{
              backgroundColor: '#e6f7ff',
              border: '1px solid #91d5ff',
              borderRadius: '10px',
              padding: '30px',
              textAlign: 'center',
              color: '#1890ff'
            }}>
              <InlineSpinner size={16} color="#1890ff" />
              <span style={{ marginLeft: '10px' }}>AI 正在生成内容，请稍候...</span>
            </div>
          ) : (
            <Form.Control
              as="textarea"
              rows={outputRows}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="点击「AI 润色」按钮生成内容，或直接在此编辑..."
              style={{
                backgroundColor: value ? '#f0f9ff' : '#fafafa',
                border: value ? '1px solid #91d5ff' : '1px solid #e8e8e8',
                borderRadius: '10px',
                padding: '12px',
                fontSize: '14px',
                resize: 'vertical',
                color: value ? '#333' : '#bfbfbf'
              }}
            />
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default AISection;
