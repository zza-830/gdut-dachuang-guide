// AIField - Dual-Box AI Editor Component
// Input -> Process -> Output structure for AI-powered text polishing
// With robust error handling to prevent crashes

import React, { useState } from 'react';
import { Form, Spinner, Alert } from 'react-bootstrap';
import { FaMagic, FaCheck, FaEdit, FaCopy, FaExclamationTriangle } from 'react-icons/fa';
import CommonButton from './CommonButton';
import { polishText } from '../services/aiService';
import { showToast } from './Toast';

/**
 * AIField - 双文本框 AI 编辑器组件
 * @param {string} label - 字段标签
 * @param {string} value - 用户输入值
 * @param {function} onChange - 输入变化回调
 * @param {string} aiValue - AI 生成的值
 * @param {function} onAIChange - AI 值变化回调
 * @param {string} placeholder - 输入框占位符
 * @param {number} rows - 文本框行数
 * @param {boolean} required - 是否必填
 */
const AIField = ({
  label,
  value = '',
  onChange,
  aiValue = '',
  onAIChange,
  placeholder = '请输入内容...',
  rows = 4,
  required = false
}) => {
  const [isPolishing, setIsPolishing] = useState(false);
  const [isAIEditable, setIsAIEditable] = useState(false);
  const [error, setError] = useState(null);

  // 处理 AI 润色 - 带完整错误处理
  const handleAIPolish = async () => {
    // 输入验证
    if (!value || value.trim().length === 0) {
      showToast('warning', '请先输入内容');
      return;
    }

    // 清除之前的错误
    setError(null);
    setIsPolishing(true);

    try {
      // 调用 AI 服务
      const result = await polishText(value, label);

      // 检查结果是否有效
      if (result && typeof result === 'string') {
        onAIChange(result);
        setIsAIEditable(false);
        showToast('success', 'AI 润色完成');
      } else {
        throw new Error('AI 返回结果无效');
      }
    } catch (err) {
      // 错误处理 - 不会导致白屏
      console.error('AI Polish Error:', err);
      const errorMessage = err.message || 'AI 服务暂时不可用';
      setError(errorMessage);
      showToast('error', `AI 润色失败: ${errorMessage}`);

      // 即使出错也提供一个基本的回退结果
      const fallbackResult = `[润色失败] 原始内容：\n\n${value}\n\n请稍后重试或手动编辑。`;
      onAIChange(fallbackResult);
    } finally {
      // 无论成功失败都要重置加载状态
      setIsPolishing(false);
    }
  };

  // 复制 AI 结果到剪贴板
  const handleCopy = () => {
    if (aiValue) {
      try {
        navigator.clipboard.writeText(aiValue);
        showToast('success', '已复制到剪贴板');
      } catch (err) {
        console.error('Copy failed:', err);
        showToast('error', '复制失败，请手动选择复制');
      }
    }
  };

  // 使用 AI 结果替换原始输入
  const handleUseAIResult = () => {
    if (aiValue) {
      try {
        onChange({ target: { value: aiValue } });
        showToast('success', '已应用 AI 结果');
      } catch (err) {
        console.error('Apply failed:', err);
        showToast('error', '应用失败');
      }
    }
  };

  return (
    <div style={{ marginBottom: '24px' }}>
      {/* Header: Label + AI Button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '12px'
      }}>
        <Form.Label style={{
          fontSize: '14px',
          fontWeight: '600',
          color: '#333',
          margin: 0
        }}>
          {label}
          {required && <span style={{ color: '#ff4d4f', marginLeft: '4px' }}>*</span>}
        </Form.Label>

        {/* AI Polish Button - Top Right */}
        <CommonButton
          variant="primary"
          onClick={handleAIPolish}
          disabled={isPolishing || !value?.trim()}
          style={{
            background: isPolishing
              ? '#a0a0a0'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            padding: '6px 16px',
            fontSize: '12px',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: isPolishing ? 'not-allowed' : 'pointer',
            opacity: (!value?.trim() && !isPolishing) ? 0.5 : 1
          }}
        >
          {isPolishing ? (
            <>
              <Spinner animation="border" size="sm" />
              生成中...
            </>
          ) : (
            <>
              <FaMagic size={12} />
              ✨ AI 润色
            </>
          )}
        </CommonButton>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          variant="warning"
          dismissible
          onClose={() => setError(null)}
          style={{
            fontSize: '13px',
            padding: '8px 12px',
            marginBottom: '12px'
          }}
        >
          <FaExclamationTriangle style={{ marginRight: '8px' }} />
          {error}
        </Alert>
      )}

      {/* User Input Box (Top) */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{
          fontSize: '12px',
          color: '#8c8c8c',
          marginBottom: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <FaEdit size={10} />
          原始输入
        </div>
        <Form.Control
          as="textarea"
          rows={rows}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={isPolishing}
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #d9d9d9',
            borderRadius: '8px',
            padding: '12px',
            fontSize: '14px',
            resize: 'vertical',
            transition: 'border-color 0.2s',
            opacity: isPolishing ? 0.7 : 1
          }}
        />
      </div>

      {/* AI Result Box (Bottom) - Always show */}
      <div>
        <div style={{
          fontSize: '12px',
          color: '#1890ff',
          marginBottom: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FaMagic size={10} />
            AI 润色结果
          </span>
          {aiValue && !isPolishing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span
                onClick={handleCopy}
                style={{
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: '#1890ff',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <FaCopy size={10} />
                复制
              </span>
              <span
                onClick={handleUseAIResult}
                style={{
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: '#52c41a',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <FaCheck size={10} />
                应用
              </span>
              <span
                onClick={() => setIsAIEditable(!isAIEditable)}
                style={{
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: '#8c8c8c'
                }}
              >
                {isAIEditable ? '🔓' : '🔒'}
              </span>
            </div>
          )}
        </div>

        {isPolishing ? (
          <div style={{
            backgroundColor: '#e6f7ff',
            border: '1px solid #91d5ff',
            borderRadius: '8px',
            padding: '24px',
            textAlign: 'center',
            color: '#1890ff'
          }}>
            <Spinner animation="border" size="sm" style={{ marginRight: '8px' }} />
            AI 正在生成内容，请稍候...
          </div>
        ) : (
          <Form.Control
            as="textarea"
            rows={rows + 2}
            value={aiValue}
            onChange={(e) => isAIEditable && onAIChange(e.target.value)}
            readOnly={!isAIEditable}
            placeholder="点击右上角「AI 润色」按钮生成内容..."
            style={{
              backgroundColor: aiValue ? '#e6f7ff' : '#fafafa',
              border: aiValue ? '1px solid #91d5ff' : '1px solid #e8e8e8',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              resize: 'vertical',
              cursor: isAIEditable ? 'text' : 'default',
              color: aiValue ? '#333' : '#bfbfbf'
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AIField;
