// MidtermEditor - 中期检查报告 AI 编辑器页面
// 包含 5 个 AI 辅助编辑区块
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ProgressBar } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaSave,
  FaClipboardCheck,
  FaCheckCircle,
  FaDownload,
  FaTrash,
  FaCopy,
  FaFileExport
} from 'react-icons/fa';
import CommonButton from '../components/CommonButton';
import AISection from '../components/AISection';
import { showToast } from '../components/Toast';
import { MIDTERM_PROMPTS } from '../data/reportPrompts';
import { exportToWord } from '../utils/exportToWord';

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

// 5 个中期检查字段配置
const SECTIONS_CONFIG = [
  {
    key: 'achievements',
    title: '1. 已取得的阶段性成果',
    placeholder: '请输入已完成的技术成果、学术成果、竞赛获奖等信息...',
    inputRows: 4,
    outputRows: 8
  },
  {
    key: 'progress_summary',
    title: '2. 项目进展状况小结',
    placeholder: '请输入项目进展情况、已完成的模块、遇到的技术难点等...',
    inputRows: 4,
    outputRows: 6
  },
  {
    key: 'budget_usage',
    title: '3. 经费使用情况',
    placeholder: '请输入已使用的经费明细（硬件、材料、版面费等）...',
    inputRows: 3,
    outputRows: 5
  },
  {
    key: 'problems_solutions',
    title: '4. 存在问题及解决方案',
    placeholder: '请输入当前遇到的困难、问题原因、解决思路等...',
    inputRows: 4,
    outputRows: 6
  },
  {
    key: 'next_plan',
    title: '5. 下一步工作计划',
    placeholder: '请输入后续任务安排、时间节点、结题目标等...',
    inputRows: 4,
    outputRows: 6
  }
];

const MidtermEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // 表单数据状态
  const [formData, setFormData] = useState({
    achievements: '',
    progress_summary: '',
    budget_usage: '',
    problems_solutions: '',
    next_plan: ''
  });

  // 保存状态
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // 从 localStorage 加载草稿
  useEffect(() => {
    const storageKey = `midterm_draft_${id || 'default'}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.data || parsed);
        setLastSaved(parsed.timestamp ? new Date(parsed.timestamp) : null);
        safeShowToast('info', '已加载上次保存的草稿');
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, [id]);

  // 更新单个字段
  const updateField = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // 保存草稿
  const handleSave = () => {
    setIsSaving(true);
    const storageKey = `midterm_draft_${id || 'default'}`;
    const saveData = {
      data: formData,
      timestamp: new Date().toISOString()
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(saveData));
      setLastSaved(new Date());
      safeShowToast('success', '草稿保存成功');
    } catch (e) {
      console.error('Save failed:', e);
      safeShowToast('error', '保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  // 清空草稿
  const handleClear = () => {
    if (window.confirm('确定要清空所有内容吗？此操作不可撤销。')) {
      setFormData({
        achievements: '',
        progress_summary: '',
        budget_usage: '',
        problems_solutions: '',
        next_plan: ''
      });
      const storageKey = `midterm_draft_${id || 'default'}`;
      localStorage.removeItem(storageKey);
      setLastSaved(null);
      safeShowToast('info', '已清空所有内容');
    }
  };

  // 计算完成进度
  const completedCount = Object.values(formData).filter(v => v && v.trim().length > 0).length;
  const progress = Math.round((completedCount / 5) * 100);

  // 生成导出文本
  const generateExportText = () => {
    const sections = [
      { key: 'achievements', title: '1. 已取得的阶段性成果' },
      { key: 'progress_summary', title: '2. 项目进展状况小结' },
      { key: 'budget_usage', title: '3. 经费使用情况' },
      { key: 'problems_solutions', title: '4. 存在问题及解决方案' },
      { key: 'next_plan', title: '5. 下一步工作计划' }
    ];

    let text = '========================================\n';
    text += '        大学生创新创业训练计划\n';
    text += '            中期检查报告\n';
    text += '========================================\n\n';
    text += `导出时间: ${new Date().toLocaleString()}\n`;
    text += `完成进度: ${completedCount}/5 (${progress}%)\n\n`;

    sections.forEach(section => {
      text += `=== ${section.title} ===\n`;
      text += formData[section.key] ? formData[section.key].trim() : '(未填写)';
      text += '\n\n';
    });

    text += '========================================\n';
    text += '              --- END ---\n';
    text += '========================================\n';

    return text;
  };

  // 复制到剪贴板
  const handleCopyAll = async () => {
    const text = generateExportText();
    try {
      await navigator.clipboard.writeText(text);
      safeShowToast('success', '已复制到剪贴板！');
    } catch (err) {
      console.error('Copy failed:', err);
      safeShowToast('error', '复制失败，请重试');
    }
  };

  // 下载为 Word 文件
  const handleDownload = async () => {
    const sections = SECTIONS_CONFIG.map(s => ({
      label: s.title,
      content: formData[s.key] || ''
    }));
    try {
      await exportToWord('大学生创新创业训练计划中期检查报告', sections);
      safeShowToast('success', 'Word 文件下载成功！');
    } catch (err) {
      console.error('Export failed:', err);
      safeShowToast('error', '导出失败，请重试');
    }
  };

  return (
    <Container fluid className="p-4 page-transition" style={{ backgroundColor: '#F0F4F8', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-4">
        <CommonButton
          variant="link"
          onClick={() => navigate(-1)}
          style={{ padding: 0, marginBottom: '16px', color: '#6c757d', textDecoration: 'none' }}
        >
          <FaArrowLeft style={{ marginRight: '8px' }} />
          返回
        </CommonButton>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
              <FaClipboardCheck style={{ marginRight: '10px', color: '#fa8c16' }} />
              中期检查报告 AI 编辑器
            </h1>
            <p style={{ fontSize: '13px', color: '#6c757d', margin: 0 }}>
              使用 AI 辅助生成高质量的中期检查报告内容
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <CommonButton variant="secondary" onClick={handleClear} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaTrash size={12} /> 清空
            </CommonButton>
            <CommonButton variant="secondary" onClick={handleCopyAll} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaCopy size={12} /> 复制全部
            </CommonButton>
            <CommonButton
              variant="secondary"
              onClick={handleDownload}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)',
                color: '#fff',
                border: 'none'
              }}
            >
              <FaDownload size={12} /> 导出文件
            </CommonButton>
            <CommonButton
              variant="primary"
              onClick={handleSave}
              disabled={isSaving}
              style={{
                background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <FaSave size={12} /> {isSaving ? '保存中...' : '保存草稿'}
            </CommonButton>
          </div>
        </div>
      </div>

      <Row>
        {/* Main Content - 5 Sections */}
        <Col lg={9}>
          {SECTIONS_CONFIG.map((section) => (
            <AISection
              key={section.key}
              title={section.title}
              promptKey={section.key}
              placeholder={section.placeholder}
              value={formData[section.key]}
              onChange={(value) => updateField(section.key, value)}
              inputRows={section.inputRows}
              outputRows={section.outputRows}
            />
          ))}
        </Col>

        {/* Right Sidebar - Progress & Actions */}
        <Col lg={3}>
          <div style={{ position: 'sticky', top: '20px' }}>
            {/* Progress Card */}
            <Card className="mb-4" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <Card.Body className="p-4">
                <h6 style={{ fontWeight: '600', marginBottom: '16px', color: '#333' }}>
                  📊 填写进度
                </h6>
                <ProgressBar
                  now={progress}
                  variant={progress === 100 ? 'success' : progress > 50 ? 'warning' : 'danger'}
                  style={{ height: '10px', borderRadius: '5px', marginBottom: '12px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666' }}>
                  <span>{completedCount} / 5 已完成</span>
                  <span style={{ fontWeight: '600', color: progress === 100 ? '#52c41a' : '#fa8c16' }}>{progress}%</span>
                </div>

                {lastSaved && (
                  <div style={{ marginTop: '16px', padding: '10px', backgroundColor: '#f6ffed', borderRadius: '8px', fontSize: '12px', color: '#52c41a' }}>
                    <FaCheckCircle style={{ marginRight: '6px' }} />
                    上次保存: {lastSaved.toLocaleTimeString()}
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Section Navigation */}
            <Card className="mb-4" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <Card.Body className="p-4">
                <h6 style={{ fontWeight: '600', marginBottom: '12px', color: '#333' }}>
                  📑 快速导航
                </h6>
                <div>
                  {SECTIONS_CONFIG.map((section, index) => {
                    const hasContent = formData[section.key] && formData[section.key].trim().length > 0;
                    return (
                      <a
                        key={section.key}
                        href={`#section-${section.key}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '10px 12px',
                          marginBottom: '6px',
                          borderRadius: '8px',
                          backgroundColor: hasContent ? '#fff7e6' : '#fafafa',
                          color: hasContent ? '#fa8c16' : '#666',
                          textDecoration: 'none',
                          fontSize: '13px',
                          transition: 'all 0.2s'
                        }}
                      >
                        {hasContent ? <FaCheckCircle size={12} style={{ marginRight: '8px' }} /> : <span style={{ width: '20px' }}>{index + 1}.</span>}
                        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {section.title.replace(/^\d+\.\s*/, '')}
                        </span>
                      </a>
                    );
                  })}
                </div>
              </Card.Body>
            </Card>

            {/* Tips */}
            <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <Card.Body className="p-4">
                <h6 style={{ fontWeight: '600', marginBottom: '12px', color: '#333' }}>
                  💡 中期检查要点
                </h6>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#666', lineHeight: '1.8' }}>
                  <li>如实汇报项目进展情况</li>
                  <li>量化描述已取得的成果</li>
                  <li>客观分析存在的问题</li>
                  <li>制定切实可行的后续计划</li>
                  <li>经费使用需符合规定</li>
                </ul>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>

      {/* Floating Action Buttons */}
      <div style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <CommonButton
          variant="primary"
          onClick={handleDownload}
          title="导出文件"
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #fa8c16 0%, #d46b08 100%)',
            border: 'none',
            boxShadow: '0 4px 16px rgba(250, 140, 22, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <FaFileExport size={18} />
        </CommonButton>
        <CommonButton
          variant="primary"
          onClick={handleCopyAll}
          title="复制全部"
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
            border: 'none',
            boxShadow: '0 4px 16px rgba(114, 46, 209, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <FaCopy size={18} />
        </CommonButton>
        <CommonButton
          variant="primary"
          onClick={handleSave}
          disabled={isSaving}
          title="保存草稿"
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
            border: 'none',
            boxShadow: '0 4px 16px rgba(82, 196, 26, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <FaSave size={20} />
        </CommonButton>
      </div>
    </Container>
  );
};

export default MidtermEditor;
