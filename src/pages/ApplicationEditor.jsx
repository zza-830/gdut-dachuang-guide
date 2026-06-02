// ApplicationEditor - 申报书 AI 编辑器页面
// 包含 13 个 AI 辅助编辑区块
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, ProgressBar } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaSave,
  FaFileAlt,
  FaCheckCircle,
  FaExclamationTriangle,
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

// 13 个申报书字段配置
const SECTIONS_CONFIG = [
  {
    key: 'project_intro',
    title: '1. 项目简介',
    placeholder: '请输入项目的核心技术、应用场景、创新点等关键信息...',
    inputRows: 4,
    outputRows: 8
  },
  {
    key: 'host_research',
    title: '2. 第一主持人科研情况',
    placeholder: '请输入负责人曾参与的科研项目、角色、成果等（如无可填"无"）...',
    inputRows: 2,
    outputRows: 3
  },
  {
    key: 'teacher_projects',
    title: '3. 指导教师承担科研课题情况',
    placeholder: '请输入指导教师的课题名称、编号、经费、时间、角色等信息...',
    inputRows: 4,
    outputRows: 6
  },
  {
    key: 'teacher_support',
    title: '4. 指导教师对本项目的支持情况',
    placeholder: '请输入指导教师将提供的具体支持形式...',
    inputRows: 3,
    outputRows: 4
  },
  {
    key: 'research_purpose',
    title: '5. 研究目的',
    placeholder: '请输入研究背景、痛点问题、核心目标、预期价值等...',
    inputRows: 4,
    outputRows: 8
  },
  {
    key: 'research_content',
    title: '6. 研究内容',
    placeholder: '请输入具体的研究内容、技术方法、系统模块等...',
    inputRows: 5,
    outputRows: 10
  },
  {
    key: 'research_status',
    title: '7. 国内外研究现状和发展动态',
    placeholder: '请输入国内外相关研究案例、市场数据、发展趋势等...',
    inputRows: 5,
    outputRows: 10
  },
  {
    key: 'innovation',
    title: '8. 创新点与项目特色',
    placeholder: '请输入项目的技术创新点、特色优势、与传统方案的对比等...',
    inputRows: 4,
    outputRows: 8
  },
  {
    key: 'tech_route',
    title: '9. 技术路线、拟解决的问题及预期成果',
    placeholder: '请输入技术实现步骤、待解决问题、预期产出成果等...',
    inputRows: 5,
    outputRows: 10
  },
  {
    key: 'schedule',
    title: '10. 项目研究进度安排',
    placeholder: '请输入各阶段的时间安排、具体任务、里程碑等...',
    inputRows: 4,
    outputRows: 8
  },
  {
    key: 'foundation',
    title: '11. 已有基础',
    placeholder: '请输入团队已有的研究积累、技术储备、资源条件等...',
    inputRows: 3,
    outputRows: 5
  },
  {
    key: 'related_achievements',
    title: '12. 与本项目有关的研究积累和已取得的成绩',
    placeholder: '请输入与项目相关的前期研究、获奖、论文等成绩...',
    inputRows: 3,
    outputRows: 6
  },
  {
    key: 'missing_conditions',
    title: '13. 已具备的条件，尚缺少的条件及解决方法',
    placeholder: '请输入已具备的条件、尚缺少的条件、以及解决方案...',
    inputRows: 4,
    outputRows: 8
  }
];

const ApplicationEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // 表单数据状态
  const [formData, setFormData] = useState({
    project_intro: '',
    host_research: '',
    teacher_projects: '',
    teacher_support: '',
    research_purpose: '',
    research_content: '',
    research_status: '',
    innovation: '',
    tech_route: '',
    schedule: '',
    foundation: '',
    related_achievements: '',
    missing_conditions: ''
  });

  // 保存状态
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);

  // 从 localStorage 加载草稿
  useEffect(() => {
    const storageKey = `application_draft_${id || 'default'}`;
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
    const storageKey = `application_draft_${id || 'default'}`;
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
        project_intro: '',
        host_research: '',
        teacher_projects: '',
        teacher_support: '',
        research_purpose: '',
        research_content: '',
        research_status: '',
        innovation: '',
        tech_route: '',
        schedule: '',
        foundation: '',
        related_achievements: '',
        missing_conditions: ''
      });
      const storageKey = `application_draft_${id || 'default'}`;
      localStorage.removeItem(storageKey);
      setLastSaved(null);
      safeShowToast('info', '已清空所有内容');
    }
  };

  // 计算完成进度
  const completedCount = Object.values(formData).filter(v => v && v.trim().length > 0).length;
  const progress = Math.round((completedCount / 13) * 100);

  // 生成导出文本
  const generateExportText = () => {
    const sections = [
      { key: 'project_intro', title: '1. 项目简介' },
      { key: 'host_research', title: '2. 第一主持人科研情况' },
      { key: 'teacher_projects', title: '3. 指导教师承担科研课题情况' },
      { key: 'teacher_support', title: '4. 指导教师对本项目的支持情况' },
      { key: 'research_purpose', title: '5. 研究目的' },
      { key: 'research_content', title: '6. 研究内容' },
      { key: 'research_status', title: '7. 国内外研究现状和发展动态' },
      { key: 'innovation', title: '8. 创新点与项目特色' },
      { key: 'tech_route', title: '9. 技术路线、拟解决的问题及预期成果' },
      { key: 'schedule', title: '10. 项目研究进度安排' },
      { key: 'foundation', title: '11. 已有基础' },
      { key: 'related_achievements', title: '12. 与本项目有关的研究积累和已取得的成绩' },
      { key: 'missing_conditions', title: '13. 已具备的条件，尚缺少的条件及解决方法' }
    ];

    let text = '========================================\n';
    text += '        大学生创新创业训练计划项目申报书\n';
    text += '========================================\n\n';
    text += `导出时间: ${new Date().toLocaleString()}\n`;
    text += `完成进度: ${completedCount}/13 (${progress}%)\n\n`;

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
      await exportToWord('大学生创新创业训练计划项目申报书', sections);
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
              <FaFileAlt style={{ marginRight: '10px', color: '#1890ff' }} />
              申报书 AI 编辑器
            </h1>
            <p style={{ fontSize: '13px', color: '#6c757d', margin: 0 }}>
              使用 AI 辅助生成高质量的申报书内容
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
                background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
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
        {/* Main Content - 13 Sections */}
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
                  variant={progress === 100 ? 'success' : progress > 50 ? 'info' : 'warning'}
                  style={{ height: '10px', borderRadius: '5px', marginBottom: '12px' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#666' }}>
                  <span>{completedCount} / 13 已完成</span>
                  <span style={{ fontWeight: '600', color: progress === 100 ? '#52c41a' : '#1890ff' }}>{progress}%</span>
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
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {SECTIONS_CONFIG.map((section, index) => {
                    const hasContent = formData[section.key] && formData[section.key].trim().length > 0;
                    return (
                      <a
                        key={section.key}
                        href={`#section-${section.key}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 10px',
                          marginBottom: '4px',
                          borderRadius: '8px',
                          backgroundColor: hasContent ? '#f6ffed' : '#fafafa',
                          color: hasContent ? '#52c41a' : '#666',
                          textDecoration: 'none',
                          fontSize: '12px',
                          transition: 'all 0.2s'
                        }}
                      >
                        {hasContent ? <FaCheckCircle size={10} style={{ marginRight: '8px' }} /> : <span style={{ width: '18px' }}>{index + 1}.</span>}
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
                  💡 使用提示
                </h6>
                <ul style={{ margin: 0, paddingLeft: '16px', fontSize: '12px', color: '#666', lineHeight: '1.8' }}>
                  <li>在「原始输入」框输入关键信息</li>
                  <li>点击「AI 润色」生成专业内容</li>
                  <li>可在「润色结果」框中手动修改</li>
                  <li>定期点击「保存草稿」防止丢失</li>
                  <li>草稿会自动保存到本地浏览器</li>
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
        {/* Export Button */}
        <CommonButton
          variant="primary"
          onClick={handleDownload}
          title="导出文件"
          style={{
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
            border: 'none',
            boxShadow: '0 4px 16px rgba(24, 144, 255, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <FaFileExport size={18} />
        </CommonButton>
        {/* Copy Button */}
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
        {/* Save Button */}
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

export default ApplicationEditor;
