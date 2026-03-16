// 专利填报 AI 编辑器
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Form, Button, Badge, Spinner, Alert } from 'react-bootstrap';
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
import AIField from '../components/AIField';
import { polishText } from '../services/aiService';
import { exportToWord } from '../utils/exportToWord';

const PatentEditor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('basic');
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

  const handleAIGenerate = async (field, prompt) => {
    setLoading(true);
    try {
      const result = await polishText(prompt, field);
      handleInputChange(field, result);
    } catch (error) {
      console.error('AI 生成失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    localStorage.setItem('patentDraft', JSON.stringify(formData));
    alert('草稿已保存！');
  };

  const handleExport = async () => {
    const sections = [
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
      { label: '十五、摘要', content: formData.abstractContent }
    ];
    try {
      await exportToWord('专利交底书', sections);
    } catch (err) {
      console.error('Export failed:', err);
      alert('导出失败，请重试');
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

            <AIField
              label="技术领域"
              value={formData.technicalField}
              onChange={(value) => handleInputChange('technicalField', value)}
              placeholder="描述本发明所属的技术领域"
              rows={3}
              aiPrompt="根据发明名称，生成专利技术领域描述"
              onAIGenerate={() => handleAIGenerate('technicalField', `请根据发明名称"${formData.patentTitle}"，生成专利申请书中的技术领域描述，要求简洁准确，符合专利撰写规范。`)}
              loading={loading}
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

            <AIField
              label="背景技术"
              value={formData.backgroundArt}
              onChange={(value) => handleInputChange('backgroundArt', value)}
              placeholder="描述与本发明最接近的现有技术"
              rows={6}
              aiPrompt="生成背景技术描述"
              onAIGenerate={() => handleAIGenerate('backgroundArt', `请根据发明名称"${formData.patentTitle}"和技术领域"${formData.technicalField}"，生成专利申请书中的背景技术描述，包括现有技术的发展状况和相关技术方案。`)}
              loading={loading}
            />

            <AIField
              label="现有技术存在的问题"
              value={formData.existingProblems}
              onChange={(value) => handleInputChange('existingProblems', value)}
              placeholder="分析现有技术的缺陷和不足"
              rows={4}
              aiPrompt="分析现有技术问题"
              onAIGenerate={() => handleAIGenerate('existingProblems', `基于背景技术"${formData.backgroundArt}"，分析现有技术存在的主要问题和缺陷，为引出本发明做铺垫。`)}
              loading={loading}
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

            <AIField
              label="要解决的技术问题"
              value={formData.technicalProblem}
              onChange={(value) => handleInputChange('technicalProblem', value)}
              placeholder="明确本发明要解决的技术问题"
              rows={3}
              aiPrompt="生成技术问题描述"
              onAIGenerate={() => handleAIGenerate('technicalProblem', `根据现有技术问题"${formData.existingProblems}"，明确本发明"${formData.patentTitle}"要解决的具体技术问题。`)}
              loading={loading}
            />

            <AIField
              label="技术方案"
              value={formData.technicalSolution}
              onChange={(value) => handleInputChange('technicalSolution', value)}
              placeholder="详细描述本发明的技术方案"
              rows={8}
              aiPrompt="生成技术方案"
              onAIGenerate={() => handleAIGenerate('technicalSolution', `针对技术问题"${formData.technicalProblem}"，为发明"${formData.patentTitle}"生成详细的技术方案描述，包括技术特征、实现方式等。`)}
              loading={loading}
            />

            <AIField
              label="有益效果"
              value={formData.beneficialEffects}
              onChange={(value) => handleInputChange('beneficialEffects', value)}
              placeholder="说明本发明相比现有技术的优点和效果"
              rows={4}
              aiPrompt="生成有益效果"
              onAIGenerate={() => handleAIGenerate('beneficialEffects', `根据技术方案"${formData.technicalSolution}"，总结本发明相比现有技术的有益效果和优势。`)}
              loading={loading}
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

            <AIField
              label="具体实施方式"
              value={formData.implementationDetails}
              onChange={(value) => handleInputChange('implementationDetails', value)}
              placeholder="详细描述实现本发明的具体方式"
              rows={8}
              aiPrompt="生成实施方式"
              onAIGenerate={() => handleAIGenerate('implementationDetails', `根据技术方案"${formData.technicalSolution}"，详细描述本发明"${formData.patentTitle}"的具体实施方式，包括步骤、参数、条件等。`)}
              loading={loading}
            />

            <AIField
              label="实施例"
              value={formData.embodiments}
              onChange={(value) => handleInputChange('embodiments', value)}
              placeholder="提供一个或多个具体实施例"
              rows={6}
              aiPrompt="生成实施例"
              onAIGenerate={() => handleAIGenerate('embodiments', `为发明"${formData.patentTitle}"提供具体的实施例，包括具体参数、数据和实验结果。`)}
              loading={loading}
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

            <AIField
              label="独立权利要求"
              value={formData.independentClaims}
              onChange={(value) => handleInputChange('independentClaims', value)}
              placeholder="撰写独立权利要求，限定发明的必要技术特征"
              rows={6}
              aiPrompt="生成独立权利要求"
              onAIGenerate={() => handleAIGenerate('independentClaims', `根据技术方案"${formData.technicalSolution}"，为发明"${formData.patentTitle}"撰写独立权利要求，包含前序部分和特征部分。`)}
              loading={loading}
            />

            <AIField
              label="从属权利要求"
              value={formData.dependentClaims}
              onChange={(value) => handleInputChange('dependentClaims', value)}
              placeholder="撰写从属权利要求，进一步限定技术特征"
              rows={6}
              aiPrompt="生成从属权利要求"
              onAIGenerate={() => handleAIGenerate('dependentClaims', `基于独立权利要求"${formData.independentClaims}"，撰写2-5条从属权利要求，进一步限定附加技术特征。`)}
              loading={loading}
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

            <AIField
              label="摘要内容"
              value={formData.abstractContent}
              onChange={(value) => handleInputChange('abstractContent', value)}
              placeholder="撰写专利摘要（不超过300字）"
              rows={5}
              aiPrompt="生成摘要"
              onAIGenerate={() => handleAIGenerate('abstractContent', `为发明"${formData.patentTitle}"生成专利摘要，包括技术问题、技术方案和主要用途，不超过300字。`)}
              loading={loading}
            />

            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">摘要附图说明</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
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
                onClick={() => navigate('/ai-creation')}
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
              <Button variant="outline-secondary" onClick={handleSave}>
                <FaSave className="me-2" />
                保存草稿
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
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              <div className="p-3 border-bottom" style={{ backgroundColor: '#fff7e6' }}>
                <h6 className="mb-0 fw-bold" style={{ color: '#fa8c16' }}>
                  <FaRobot className="me-2" />
                  填写进度
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
          <Card className="border-0 shadow-sm mt-3">
            <Card.Body>
              <h6 className="fw-bold mb-3" style={{ color: '#fa8c16' }}>
                <FaMagic className="me-2" />
                AI 助手提示
              </h6>
              <ul className="mb-0 ps-3" style={{ fontSize: '13px', color: '#666' }}>
                <li className="mb-2">点击输入框旁的 AI 按钮可自动生成内容</li>
                <li className="mb-2">先填写基本信息，AI 生成效果更好</li>
                <li className="mb-2">生成的内容可以手动修改完善</li>
                <li>建议在专业人员指导下完成权利要求</li>
              </ul>
            </Card.Body>
          </Card>
        </Col>

        {/* Main Content Area */}
        <Col md={9}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              {loading && (
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    borderRadius: '8px'
                  }}
                >
                  <div className="text-center">
                    <Spinner animation="border" variant="warning" />
                    <p className="mt-2 mb-0" style={{ color: '#fa8c16' }}>AI 正在生成内容...</p>
                  </div>
                </div>
              )}
              {renderSection()}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default PatentEditor;
