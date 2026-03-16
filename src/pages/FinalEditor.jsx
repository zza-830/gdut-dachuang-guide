// FinalEditor - 结题报告 AI 编辑器页面
// 包含 4 个 AI 辅助编辑区块
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ProgressBar } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaSave,
  FaFlagCheckered,
  FaCheckCircle,
  FaDownload,
  FaTrash,
  FaCopy,
  FaFileExport
} from 'react-icons/fa';
import CommonButton from '../components/CommonButton';
import AISection from '../components/AISection';
import { showToast } from '../components/Toast';
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

// 4 个结题报告字段配置
const SECTIONS_CONFIG = [
  {
    key: 'project_summary',
    title: '1. 项目总结',
    placeholder: '请输入项目背景、研究目的、实施过程、主要成果等信息...',
    inputRows: 5,
    outputRows: 10
  },
  {
    key: 'detailed_achievements',
    title: '2. 详细成果描述',
    placeholder: '请输入实物作品、软件系统、论文专利、性能指标等详细信息...',
    inputRows: 5,
    outputRows: 10
  },
  {
    key: 'budget_final',
    title: '3. 经费决算',
    placeholder: '请输入各项支出明细（设备费、材料费、版面费等）及使用说明...',
    inputRows: 4,
    outputRows: 6
  },
  {
    key: 'member_contributions',
    title: '4. 成员分工与心得',
    placeholder: '请输入每位成员的分工、贡献、心得体会等...',
    inputRows: 4,
    outputRows: 8
  }
];

const FinalEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // 表单数据状态
  const [formData, setFormData] = useState({
    project_summary: '',
    detailed_achievements: '',
    budget_final: '',
    member_contributions: ''
  });

  // 保存状态
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // 从 localStorage 加载草稿
  useEffect(() => {
    const storageKey = `final_draft_${id || 'default'}`;
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
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // 保存草稿
  const handleSave = () => {
    setIsSaving(true);
    const storageKey = `final_draft_${id || 'default'}`;
    const saveData = { data: formData, timestamp: new Date().toISOString() };

    try {
      localStorage.setItem(storageKey, JSON.stringify(saveData));
      setLastSaved(new Date());
      safeShowToast('success', '草稿保存成功');
    } catch (e) {
      safeShowToast('error', '保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  // 清空草稿
  const handleClear = () => {
    if (window.confirm('确定要清空所有内容吗？此操作不可撤销。')) {
      setFormData({ project_summary: '', detailed_achievements: '', budget_final: '', member_contributions: '' });
      localStorage.removeItem(`final_draft_${id || 'default'}`);
      setLastSaved(null);
      safeShowToast('info', '已清空所有内容');
    }
  };

  // 计算完成进度
  const completedCount = Object.values(formData).filter(v => v && v.trim().length > 0).length;
  const progress = Math.round((completedCount / 4) * 100);

  // 生成导出文本
  const generateExportText = () => {
    const sections = [
      { key: 'project_summary', title: '1. 项目总结' },
      { key: 'detailed_achievements', title: '2. 详细成果描述' },
      { key: 'budget_final', title: '3. 经费决算' },
      { key: 'member_contributions', title: '4. 成员分工与心得' }
    ];

    let text = '========================================\n';
    text += '        大学生创新创业训练计划\n';
    text += '              结题报告\n';
    text += '========================================\n\n';
    text += `导出时间: ${new Date().toLocaleString()}\n`;
    text += `完成进度: ${completedCount}/4 (${progress}%)\n\n`;

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

  const handleCopyAll = async () => {
    try {
      await navigator.clipboard.writeText(generateExportText());
      safeShowToast('success', '已复制到剪贴板！');
    } catch (err) {
      safeShowToast('error', '复制失败，请重试');
    }
  };

  const handleDownload = async () => {
    const sections = SECTIONS_CONFIG.map(s => ({
      label: s.title,
      content: formData[s.key] || ''
    }));
    try {
      await exportToWord('大学生创新创业训练计划结题报告', sections);
      safeShowToast('success', 'Word 文件下载成功！');
    } catch (err) {
      console.error('Export failed:', err);
      safeShowToast('error', '导出失败，请重试');
    }
  };

  return (
    <Container fluid className="p-4 page-transition" style={{ backgroundColor: '#F0F4F8', minHeight: '100vh' }}>
      <div className="mb-4">
        <CommonButton variant="link" onClick={() => navigate(-1)} style={{ padding: 0, marginBottom: '16px', color: '#6c757d', textDecoration: 'none' }}>
          <FaArrowLeft style={{ marginRight: '8px' }} /> 返回
        </CommonButton>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
              <FaFlagCheckered style={{ marginRight: '10px', color: '#52c41a' }} />
              结题报告 AI 编辑器
            </h1>
            <p style={{ fontSize: '13px', color: '#6c757d', margin: 0 }}>使用 AI 辅助生成高质量的结题报告内容</p>
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <CommonButton variant="secondary" onClick={handleClear} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaTrash size={12} /> 清空
            </CommonButton>
            <CommonButton variant="secondary" onClick={handleCopyAll} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaCopy size={12} /> 复制全部
            </CommonButton>
            <CommonButton variant="secondary" onClick={handleDownload} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)', color: '#fff', border: 'none' }}>
              <FaDownload size={12} /> 导出文件
            </CommonButton>
            <CommonButton variant="primary" onClick={handleSave} disabled={isSaving} style={{ background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)', border: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <FaSave size={12} /> {isSaving ? '保存中...' : '保存草稿'}
            </CommonButton>
          </div>
        </div>
      </div>

      <Row>
        <Col lg={9}>
          {SECTIONS_CONFIG.map((section) => (
            <AISection key={section.key} title={section.title} promptKey={section.key} placeholder={section.placeholder} value={formData[section.key]} onChange={(value) => updateField(section.key, value)} inputRows={section.inputRows} outputRows={section.outputRows} />
          ))}
        </Col>

        <Col lg={3}>
          <div style={{ position: 'sticky', top: '20px' }}>
            <Card className="mb-4" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <Card.Body className="p-4">
                <h6 style={{ fontWeight: '600', marginBottom: '16px', color: '#333' }}>📊 填写进度</h6>
                <ProgressBar now={progress} variant={progress === 100 ? 'success' : progress > 50 ? 'info' : 'warning'} style={{ height: '10px', borderRadius: '5px', marginBottom: '12px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666' }}>
                  <span>{completedCount} / 4 已完成</span>
                  <span style={{ fontWeight: '600', color: progress === 100 ? '#52c41a' : '#1890ff' }}>{progress}%</span>
                </div>
                {lastSaved && (
                  <div style={{ marginTop: '16px', padding: '10px', backgroundColor: '#f6ffed', borderRadius: '8px', fontSize: '12px', color: '#52c41a' }}>
                    <FaCheckCircle style={{ marginRight: '6px' }} /> 上次保存: {lastSaved.toLocaleTimeString()}
                  </div>
                )}
              </Card.Body>
            </Card>

            <Card className="mb-4" style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <Card.Body className="p-4">
                <h6 style={{ fontWeight: '600', marginBottom: '12px', color: '#333' }}>📑 快速导航</h6>
                {SECTIONS_CONFIG.map((section, index) => {
                  const hasContent = formData[section.key] && formData[section.key].trim().length > 0;
                  return (
                    <a key={section.key} href={`#section-${section.key}`} style={{ display: 'flex', alignItems: 'center', padding: '10px 12px', marginBottom: '6px', borderRadius: '8px', backgroundColor: hasContent ? '#f6ffed' : '#fafafa', color: hasContent ? '#52c41a' : '#666', textDecoration: 'none', fontSize: '13px' }}>
                      {hasContent ? <FaCheckCircle size={12} style={{ marginRight: '8px' }} /> : <span style={{ width: '20px' }}>{index + 1}.</span>}
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{section.title.replace(/^\d+\.\s*/, '')}</span>
                    </a>
                  );
                })}
              </Card.Body>
            </Card>

            <Card style={{ border: 'none', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
              <Card.Body className="p-4">
                <h6 style={{ fontWeight: '600', marginBottom: '12px', color: '#333' }}>💡 结题报告要点</h6>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#666', lineHeight: '1.8' }}>
                  <li>全面总结项目成果和创新点</li>
                  <li>详细描述技术实现和性能指标</li>
                  <li>如实报告经费使用情况</li>
                  <li>总结团队合作经验和收获</li>
                </ul>
              </Card.Body>
            </Card>
          </div>
        </Col>
      </Row>

      <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <CommonButton variant="primary" onClick={handleDownload} title="导出文件" style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)', border: 'none', boxShadow: '0 4px 16px rgba(82, 196, 26, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaFileExport size={18} />
        </CommonButton>
        <CommonButton variant="primary" onClick={handleCopyAll} title="复制全部" style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #722ed1 0%, #531dab 100%)', border: 'none', boxShadow: '0 4px 16px rgba(114, 46, 209, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaCopy size={18} />
        </CommonButton>
        <CommonButton variant="primary" onClick={handleSave} disabled={isSaving} title="保存草稿" style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)', border: 'none', boxShadow: '0 4px 16px rgba(24, 144, 255, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <FaSave size={20} />
        </CommonButton>
      </div>
    </Container>
  );
};

export default FinalEditor;
