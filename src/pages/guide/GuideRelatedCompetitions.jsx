// 相关竞赛页面 - 从 dachuang_guide_competitions API 获取数据，Markdown 渲染详情
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Modal, Alert, Spinner, Badge } from 'react-bootstrap';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import { FaExternalLinkAlt, FaClock, FaGlobe, FaTimes, FaLink } from 'react-icons/fa';
import api from '../../services/api';

// 等级颜色映射
const levelColorMap = {
  '国际级': '#9b59b6',
  '国家级': '#FF6B6B',
  '省级': '#FFA500',
  '校级': '#4ECDC4'
};

const GuideRelatedCompetitions = () => {
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        setLoading(true);
        const res = await api.get('/guide-competitions');
        setCompetitions(res.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch guide competitions:', err);
        setError('无法加载竞赛数据，请检查后端服务是否运行');
        setCompetitions(fallbackData);
      } finally {
        setLoading(false);
      }
    };
    fetchCompetitions();
  }, []);

  const handleCompetitionClick = (comp) => {
    setSelectedCompetition(comp);
    setShowModal(true);
  };

  return (
    <Container fluid className="p-4" style={{ backgroundColor: '#F0F4F8', minHeight: 'calc(100vh - 60px)' }}>
      <Row className="g-4 justify-content-center">
        <Col xs={12} md={10} lg={8}>
          <Card className="card-modern mb-4">
            <Card.Body style={{ padding: '30px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#001F3F', marginBottom: '16px' }}>
                相关竞赛
              </h2>
              <p style={{ fontSize: '16px', color: '#666666', marginBottom: '24px', lineHeight: '1.5' }}>
                参与至少三个比赛，提升影响力。点击"详情"查看完整参赛指南与大创关联分析。
              </p>

              {/* 五级赛事表格 */}
              <div className="mb-4">
                <h5 style={{ color: '#001F3F', fontWeight: '600', marginBottom: '16px' }}>精选竞赛：</h5>

                {loading ? (
                  <div className="text-center py-4">
                    <Spinner animation="border" variant="primary" />
                    <p className="mt-2 text-muted">加载竞赛数据...</p>
                  </div>
                ) : error ? (
                  <Alert variant="warning">{error}</Alert>
                ) : (
                  <Table striped bordered hover responsive>
                    <thead style={{ backgroundColor: '#001F3F', color: '#FFFFFF' }}>
                      <tr>
                        <th>竞赛名称</th>
                        <th style={{ whiteSpace: 'nowrap', width: '80px' }}>等级</th>
                        <th>时间概要</th>
                        <th style={{ whiteSpace: 'nowrap', width: '80px' }}>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {competitions.map((comp) => (
                        <tr key={comp.id || comp.name}>
                          <td style={{ fontWeight: '500' }}>{comp.name}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '4px',
                              backgroundColor: levelColorMap[comp.level] || '#999',
                              color: '#FFFFFF',
                              fontSize: '13px',
                              fontWeight: '500',
                              display: 'inline-block'
                            }}>
                              {comp.level}
                            </span>
                          </td>
                          <td style={{ fontSize: '14px', color: '#555' }}>{comp.summary_time}</td>
                          <td style={{ whiteSpace: 'nowrap' }}>
                            <Button
                              size="sm"
                              variant="primary"
                              onClick={() => handleCompetitionClick(comp)}
                              style={{ backgroundColor: '#00BFFF', borderColor: '#00BFFF' }}
                            >
                              详情
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </div>

              <Alert variant="info" style={{ borderLeft: '4px solid #00BFFF' }}>
                <strong>注意事项：</strong>
                <ul style={{ marginBottom: 0, paddingLeft: '20px' }}>
                  <li>报名/准备/执行分行进行，确保时间不冲突</li>
                  <li>关注学校通知，及时了解报名信息</li>
                  <li>提前准备材料，避免临时抱佛脚</li>
                  <li>参与多个比赛可提升项目影响力</li>
                </ul>
              </Alert>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Competition Detail Modal */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="xl"
        centered
        dialogClassName="guide-competition-modal"
      >
        {selectedCompetition && (
          <>
            <Modal.Header
              style={{
                background: `linear-gradient(135deg, ${levelColorMap[selectedCompetition.level] || '#001F3F'}, #001F3F)`,
                color: '#fff',
                borderBottom: 'none',
                padding: '20px 24px'
              }}
            >
              <div style={{ flex: 1 }}>
                <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                  <h4 style={{ margin: 0, fontWeight: '700', fontSize: '20px' }}>
                    {selectedCompetition.name}
                  </h4>
                  <Badge style={{
                    backgroundColor: 'rgba(255,255,255,0.25)',
                    color: '#fff',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}>
                    {selectedCompetition.level}
                  </Badge>
                </div>
                {selectedCompetition.summary_time && (
                  <p style={{ margin: 0, opacity: 0.85, fontSize: '14px' }}>
                    <FaClock style={{ marginRight: '6px' }} />
                    {selectedCompetition.summary_time}
                  </p>
                )}
              </div>
              <Button
                variant="link"
                onClick={() => setShowModal(false)}
                style={{ color: '#fff', padding: '4px', opacity: 0.8 }}
              >
                <FaTimes size={20} />
              </Button>
            </Modal.Header>

            <Modal.Body style={{ padding: 0, maxHeight: '70vh', overflowY: 'auto' }}>
              <Row className="g-0">
                {/* Left: Main Content (65%) */}
                <Col md={8} style={{ padding: '24px', borderRight: '1px solid #eee' }}>
                  {/* Description */}
                  {selectedCompetition.description && (
                    <div className="guide-markdown-content mb-4">
                      <h5 className="section-title">📖 竞赛介绍</h5>
                      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{selectedCompetition.description}</ReactMarkdown>
                    </div>
                  )}

                  {/* Registration Process */}
                  {selectedCompetition.registration_process && (
                    <div className="guide-markdown-content mb-4">
                      <h5 className="section-title">📋 报名流程</h5>
                      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{selectedCompetition.registration_process}</ReactMarkdown>
                    </div>
                  )}

                  {/* DaChuang Relevance */}
                  {selectedCompetition.dachuang_relevance && (
                    <div className="guide-markdown-content">
                      <h5 className="section-title">🔗 与大创的关联</h5>
                      <ReactMarkdown rehypePlugins={[rehypeRaw]}>{selectedCompetition.dachuang_relevance}</ReactMarkdown>
                    </div>
                  )}
                </Col>

                {/* Right: Timeline & Meta (35%) */}
                <Col md={4} style={{ padding: '24px', backgroundColor: '#fafbfc' }}>
                  {/* Timeline Details */}
                  {selectedCompetition.timeline_details && Array.isArray(selectedCompetition.timeline_details) && (
                    <div style={{ marginBottom: '20px' }}>
                      <h6 style={{ color: '#001F3F', fontWeight: '700', marginBottom: '14px', fontSize: '15px' }}>
                        📅 时间线
                      </h6>
                      <div style={{ position: 'relative', paddingLeft: '20px' }}>
                        {selectedCompetition.timeline_details.map((item, idx) => (
                          <div key={idx} style={{
                            position: 'relative',
                            paddingBottom: idx < selectedCompetition.timeline_details.length - 1 ? '16px' : '0',
                            borderLeft: idx < selectedCompetition.timeline_details.length - 1 ? '2px solid #d9d9d9' : '2px solid transparent',
                            paddingLeft: '16px',
                            marginLeft: '-1px'
                          }}>
                            <div style={{
                              position: 'absolute',
                              left: '-7px',
                              top: '4px',
                              width: '12px',
                              height: '12px',
                              borderRadius: '50%',
                              backgroundColor: idx === 0 ? '#00BFFF' : '#d9d9d9',
                              border: '2px solid #fff',
                              boxShadow: '0 0 0 1px ' + (idx === 0 ? '#00BFFF' : '#d9d9d9')
                            }} />
                            <div style={{
                              fontSize: '12px',
                              color: '#00BFFF',
                              fontWeight: '600',
                              marginBottom: '2px'
                            }}>
                              {item.time}
                            </div>
                            <div style={{ fontSize: '13px', color: '#444', lineHeight: '1.5' }}>
                              {item.event}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Official Link */}
                  {selectedCompetition.official_link && (
                    <a
                      href={selectedCompetition.official_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="d-flex align-items-center justify-content-center gap-2"
                      style={{
                        display: 'block',
                        backgroundColor: '#001F3F',
                        color: '#fff',
                        padding: '12px 16px',
                        borderRadius: '10px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '14px',
                        textAlign: 'center',
                        transition: 'opacity 0.2s',
                        marginTop: '16px'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '0.85'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                    >
                      <FaGlobe /> 访问官网 <FaExternalLinkAlt size={12} />
                    </a>
                  )}
                </Col>
              </Row>
            </Modal.Body>
          </>
        )}
      </Modal>

      {/* Styles */}
      <style>{`
        .guide-competition-modal .modal-dialog {
          max-width: 920px;
        }
        .guide-competition-modal .modal-content {
          border-radius: 16px;
          overflow: hidden;
          border: none;
          box-shadow: 0 20px 60px rgba(0,0,0,0.2);
        }
        .section-title {
          color: #001F3F;
          font-weight: 700;
          font-size: 16px;
          border-bottom: 2px solid #00BFFF;
          padding-bottom: 8px;
          margin-bottom: 16px;
        }
        .guide-markdown-content h2 {
          font-size: 18px;
          font-weight: 700;
          color: #001F3F;
          margin-top: 20px;
          margin-bottom: 10px;
        }
        .guide-markdown-content p {
          font-size: 14px;
          line-height: 1.7;
          color: #444;
          margin-bottom: 10px;
        }
        .guide-markdown-content ul,
        .guide-markdown-content ol {
          padding-left: 20px;
          margin-bottom: 12px;
        }
        .guide-markdown-content li {
          font-size: 14px;
          line-height: 1.7;
          color: #444;
          margin-bottom: 4px;
        }
        .guide-markdown-content strong {
          color: #001F3F;
        }
        .guide-markdown-content blockquote {
          border-left: 3px solid #00BFFF;
          padding: 8px 16px;
          margin: 12px 0;
          background: #f0f9ff;
          border-radius: 0 6px 6px 0;
          font-size: 14px;
          color: #555;
        }
        .guide-markdown-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 12px 0;
          font-size: 14px;
        }
        .guide-markdown-content th,
        .guide-markdown-content td {
          border: 1px solid #e8e8e8;
          padding: 8px 12px;
          text-align: left;
        }
        .guide-markdown-content th {
          background-color: #f5f5f5;
          font-weight: 600;
          color: #333;
        }
        @media (max-width: 768px) {
          .guide-competition-modal .modal-dialog {
            max-width: 95%;
            margin: 10px auto;
          }
        }
      `}</style>
    </Container>
  );
};

// Fallback data when API is unavailable
const fallbackData = [
  {
    id: 1, name: '大学生创新创业训练计划 (DaChuang)', level: '国家级',
    summary_time: '每年10月启动申报，次年3-4月立项',
    description: '**核心定位**：高校本科教学质量与教学改革工程的一部分，是所有创新创业项目的"孵化器"。',
    registration_process: '1. **选题与组队** (10月-12月)\n2. **申报书撰写** (1月-3月)\n3. **校级评审** (4月)',
    dachuang_relevance: '**大创是"种子"**：几乎所有"互联网+"和"挑战杯"的获奖项目，其前身都是一个优秀的大创项目。',
    official_link: 'http://gjcxcy.bjtu.edu.cn/',
    timeline_details: [{ time: '10月-12月', event: '选题与组队' }, { time: '次年3月', event: '提交申报书' }]
  },
  {
    id: 2, name: '中国国际大学生创新大赛 (原互联网+)', level: '国家级',
    summary_time: '每年4月-10月',
    description: '**核心定位**：中国覆盖面最大、影响最广、含金量最高的大学生双创赛事。',
    registration_process: '1. **注册报名** (4月-7月)\n2. **校级初赛** (6月-7月)\n3. **全国总决赛** (10月)',
    dachuang_relevance: '**大创项目的最佳出口**：大创项目的结题成果可以直接包装为本大赛的参赛作品。',
    official_link: 'https://cy.ncss.cn/',
    timeline_details: [{ time: '4月-5月', event: '官网报名启动' }, { time: '10月', event: '全国总决赛' }]
  }
];

export default GuideRelatedCompetitions;
