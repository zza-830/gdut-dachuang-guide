// 专利填报 AI 编辑器
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import {
  FaLightbulb,
  FaArrowLeft,
  FaMagic,
  FaSave,
  FaDownload,
  FaRobot,
  FaClipboardList,
  FaCogs,
  FaFileAlt,
  FaCheckCircle
} from 'react-icons/fa';
import AISection from '../components/AISection';
import { exportToWord } from '../utils/exportToWord';
import { showToast } from '../components/Toast';

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

const PatentEditor = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    // 基本信息
    patentTitle: '',
    inventors: '',
    applicant: '',
    patentType: '发明专利',
    technicalField: '',
    
    // 技术背景
    backgroundArt: '',
    existingProblems: '',
    
    // 发明内容
    technicalProblem: '',
    technicalSolution: '',
    beneficialEffects: '',
    
    // 具体实施方式
    implementationDetails: '',
    embodiments: '',
    
    // 权利要求
    independentClaims: '',
    dependentClaims: '',
    
    // 摘要
    abstractContent: '',
    abstractDrawing: ''
  });

  // 从 localStorage 加载草稿
  useEffect(() => {
    const storageKey = `patent_draft_${id || 'default'}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData(parsed.data || parsed);
        safeShowToast('info', '已加载上次保存的草稿');
      } catch (e) {
        console.error('Failed to load draft:', e);
      }
    }
  }, [id]);

  const sections = [
    { id: 'basic', title: '基本信息', icon: <FaClipboardList /> },
    { id: 'background', title: '技术背景', icon: <FaFileAlt /> },
    { id: 'invention', title: '发明内容', icon: <FaLightbulb /> },
    { id: 'implementation', title: '具体实施', icon: <FaCogs /> },
    { id: 'claims', title: '权利要求', icon: <FaCheckCircle /> },
    { id: 'abstract', title: '摘要', icon: <FaFileAlt /> }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    setIsSaving(true);
    const storageKey = `patent_draft_${id || 'default'}`;
    const saveData = {
      data: formData,
      timestamp: new Date().toISOString()
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(saveData));
      safeShowToast('success', '草稿保存成功');
    } catch (e) {
      console.error('Save failed:', e);
      safeShowToast('error', '保存失败，请重试');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExport = async () => {
    const exportSections = [
      { label: '一、发明名称', content: formData.patentTitle },
      { label: '二、发明人', content: formData.inventors },
      { label: '三、申请人', content: formData.applicant },
      { label: '四、专利类型', content: formData.patentType },
      { label: '五、技术领域', content: formData.technicalField },
      { label: '六、背景技术', content: formData.backgroundArt },
      { label: '七、现有技术存在的问题', content: formData.existingProblems },
      { label: '八、发明要解决的技术问题', content: formData.technicalProblem },
      { label: '九、技术方案', content: formData.technicalSolution },
      { label: '十、有益效果', content: formData.beneficialEffects },
      { label: '十一、具体实施方式', content: formData.implementationDetails },
      { label: '十二、实施例', content: formData.embodiments },
      { label: '十三、独立权利要求', content: formData.independentClaims },
      { label: '十四、从属权利要求', content: formData.dependentClaims },
      { label: '十五、摘要', content: formData.abstractContent },
      { label: '十六、摘要附图说明', content: formData.abstractDrawing }
    ];
    try {
      await exportToWord(formData.patentTitle || '专利交底书', exportSections);
      safeShowToast('success', 'Word 文件导出成功！');
    } catch (err) {
      console.error('Export failed:', err);
      safeShowToast('error', '导出失败，请重试');
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'basic':
        return (
          <div className="section-content">
            <h5 className="section-title mb-4">
              <FaClipboardList className="me-2" style={{ color: '#fa8c16' }} />
              基本信息
            </h5>
            
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">发明名称 *</Form.Label>
              <Form.Control
                type="text"
                placeholder="请输入专利发明名称"
                value={formData.patentTitle}
                onChange={(e) => handleInputChange('patentTitle', e.target.value)}
              />
              <Form.Text className="text-muted">
                名称应简明、准确地表明发明的主题和类型
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">发明人</Form.Label>
              <Form.Control
                type="text"
                placeholder="多个发明人用逗号分隔"
                value={formData.inventors}
                onChange={(e) => handleInputChange('inventors', e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">申请人</Form.Label>
              <Form.Control
                type="text"
                placeholder="个人或单位名称"
                value={formData.applicant}
                onChange={(e) => handleInputChange('applicant', e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">专利类型</Form.Label>
              <Form.Select
                value={formData.patentType}
                onChange={(e) => handleInputChange('patentType', e.target.value)}
              >
                <option value="发明专利">发明专利</option>
                <option value="实用新型">实用新型</option>
                <option value="外观设计">外观设计</option>
              </Form.Select>
            </Form.Group>

            <AISection
              title="技术领域"
              promptKey="technicalField"
              value={formData.technicalField}
              onChange={(value) => handleInputChange('technicalField', value)}
              placeholder="描述本发明所属的技术领域"
              inputRows={3}
              outputRows={4}
            />
          </div>
        );

      case 'background':
        return (
          <div className="section-content">
            <h5 className="section-title mb-4">
              <FaFileAlt className="me-2" style={{ color: '#fa8c16' }} />
              技术背景
            </h5>

            <AISection
              title="背景技术"
              promptKey="backgroundArt"
              value={formData.backgroundArt}
              onChange={(value) => handleInputChange('backgroundArt', value)}
              placeholder="描述与本发明最接近的现有技术"
              inputRows={6}
              outputRows={8}
            />

            <AISection
              title="现有技术存在的问题"
              promptKey="existingProblems"
              value={formData.existingProblems}
              onChange={(value) => handleInputChange('existingProblems', value)}
              placeholder="分析现有技术的缺陷和不足"
              inputRows={4}
              outputRows={6}
            />
          </div>
        );

      case 'invention':
        return (
          <div className="section-content">
            <h5 className="section-title mb-4">
              <FaLightbulb className="me-2" style={{ color: '#fa8c16' }} />
              发明内容
            </h5>

            <AISection
              title="要解决的技术问题"
              promptKey="technicalProblem"
              value={formData.technicalProblem}
              onChange={(value) => handleInputChange('technicalProblem', value)}
              placeholder="明确本发明要解决的技术问题"
              inputRows={3}
              outputRows={4}
            />

            <AISection
              title="技术方案"
              promptKey="technicalSolution"
              value={formData.technicalSolution}
              onChange={(value) => handleInputChange('technicalSolution', value)}
              placeholder="详细描述本发明的技术方案"
              inputRows={8}
              outputRows={12}
            />

            <AISection
              title="有益效果"
              promptKey="beneficialEffects"
              value={formData.beneficialEffects}
              onChange={(value) => handleInputChange('beneficialEffects', value)}
              placeholder="说明本发明相比现有技术的优点和效果"
              inputRows={4}
              outputRows={6}
            />
          </div>
        );

      case 'implementation':
        return (
          <div className="section-content">
            <h5 className="section-title mb-4">
              <FaCogs className="me-2" style={{ color: '#fa8c16' }} />
              具体实施方式
            </h5>

            <AISection
              title="具体实施方式"
              promptKey="implementationDetails"
              value={formData.implementationDetails}
              onChange={(value) => handleInputChange('implementationDetails', value)}
              placeholder="详细描述实现本发明的具体方式"
              inputRows={8}
              outputRows={10}
            />

            <AISection
              title="实施例"
              promptKey="embodiments"
              value={formData.embodiments}
              onChange={(value) => handleInputChange('embodiments', value)}
              placeholder="提供一个或多个具体实施例"
              inputRows={6}
              outputRows={8}
            />
          </div>
        );

      case 'claims':
        return (
          <div className="section-content">
            <h5 className="section-title mb-4">
              <FaCheckCircle className="me-2" style={{ color: '#fa8c16' }} />
              权利要求
            </h5>

            <Alert variant="info" className="mb-4">
              <FaRobot className="me-2" />
              权利要求是专利保护范围的核心，建议在专业人员指导下撰写
            </Alert>

            <AISection
              title="独立权利要求"
              promptKey="independentClaims"
              value={formData.independentClaims}
              onChange={(value) => handleInputChange('independentClaims', value)}
              placeholder="撰写独立权利要求，限定发明的必要技术特征"
              inputRows={6}
              outputRows={8}
            />

            <AISection
              title="从属权利要求"
              promptKey="dependentClaims"
              value={formData.dependentClaims}
              onChange={(value) => handleInputChange('dependentClaims', value)}
              placeholder="撰写从属权利要求，进一步限定技术特征"
              inputRows={6}
              outputRows={8}
            />
          </div>
        );

      case 'abstract':
        return (
          <div className="section-content">
            <h5 className="section-title mb-4">
              <FaFileAlt className="me-2" style={{ color: '#fa8c16' }} />
              摘要
            </h5>

            <AISection
              title="摘要内容"
              promptKey="abstractContent"
              value={formData.abstractContent}
              onChange={(value) => handleInputChange('abstractContent', value)}
              placeholder="撰写专利摘要（不超过300字）"
              inputRows={5}
              outputRows={6}
            />

            <Form.Group className="mb-4 p-4" style={{ backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #eee' }}>
              <Form.Label className="fw-bold">摘要附图说明</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="指定摘要附图（如有）"
                value={formData.abstractDrawing}
                onChange={(e) => handleInputChange('abstractDrawing', e.target.value)}
              />
            </Form.Group>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Container fluid className="py-4" style={{ backgroundColor: '#F0F4F8', minHeight: 'calc(100vh - 60px)' }}>
      {/* Header */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <Button
                variant="link"
                className="p-0 me-3 text-decoration-none"
                onClick={() => navigate(-1)}
              >
                <FaArrowLeft size={20} style={{ color: '#666' }} />
              </Button>
              <div>
                <h2 className="mb-1" style={{ fontSize: '24px', fontWeight: 'bold', color: '#1a1a2e' }}>
                  <FaLightbulb className="me-2" style={{ color: '#fa8c16' }} />
                  专利填报 AI 编辑器
                </h2>
                <p className="mb-0 text-muted" style={{ fontSize: '14px' }}>
                  智能辅助生成专利交底书与申请文档
                </p>
              </div>
            </div>
            <div className="d-flex gap-2">
              <Button variant="outline-secondary" onClick={handleSave} disabled={isSaving}>
                <FaSave className="me-2" />
                {isSaving ? '保存中...' : '保存草稿'}
              </Button>
              <Button variant="warning" onClick={handleExport} style={{ color: '#fff' }}>
                <FaDownload className="me-2" />
                导出文档
              </Button>
            </div>
          </div>
        </Col>
      </Row>

      <Row>
        {/* Left Sidebar - Section Navigation */}
        <Col md={3}>
          <Card className="border-0 shadow-sm" style={{ borderRadius: '16px' }}>
            <Card.Body className="p-0">
              <div className="p-3 border-bottom" style={{ backgroundColor: '#fff7e6', borderTopLeftRadius: '16px', borderTopRightRadius: '16px' }}>
                <h6 className="mb-0 fw-bold" style={{ color: '#fa8c16' }}>
                  <FaRobot className="me-2" />
                  模块导航
                </h6>
              </div>
              <div className="p-2">
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    style={{
                      padding: '12px 16px',
                      cursor: 'pointer',
                      borderRadius: '8px',
                      marginBottom: '4px',
                      backgroundColor: activeSection === section.id ? '#fff7e6' : 'transparent',
                      borderLeft: activeSection === section.id ? '3px solid #fa8c16' : '3px solid transparent',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div className="d-flex align-items-center">
                      <span
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: activeSection === section.id ? '#fa8c16' : '#e8e8e8',
                          color: activeSection === section.id ? '#fff' : '#666',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          marginRight: '12px'
                        }}
                      >
                        {index + 1}
                      </span>
                      <span
                        style={{
                          fontWeight: activeSection === section.id ? '600' : '400',
                          color: activeSection === section.id ? '#fa8c16' : '#333'
                        }}
                      >
                        {section.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>

          {/* Tips Card */}
          <Card className="border-0 shadow-sm mt-3" style={{ borderRadius: '16px' }}>
            <Card.Body>
              <h6 className="fw-bold mb-3" style={{ color: '#fa8c16' }}>
                <FaMagic className="me-2" />
                AI 助手提示
              </h6>
              <ul className="mb-0 ps-3" style={{ fontSize: '13px', color: '#666', lineHeight: '1.8' }}>
                <li>在「原始输入」框输入关键信息</li>
                <li>点击「✨ AI 润色」生成专业内容</li>
                <li>生成的内容可以随时手动修改</li>
                <li>定期点击右上角「保存草稿」防止丢失</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        {/* Main Content Area */}
        <Col md={9}>
          <div style={{ paddingBottom: '40px' }}>
            {renderSection()}
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default PatentEditor;
