// Enhanced for full process flow - Conclusion Page (结题填报)
// Competition data fetched from MySQL via API
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Table, Alert, Badge, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';

const GuideConclusion = () => {
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState([]);
  const [compLoading, setCompLoading] = useState(true);
  const [summary, setSummary] = useState('');
  const [results, setResults] = useState([
    { type: '', description: '', status: '已完成' }
  ]);
  const [files, setFiles] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleAddResult = () => {
    setResults([...results, { type: '', description: '', status: '已完成' }]);
  };

  const handleResultChange = (index, field, value) => {
    const newResults = [...results];
    newResults[index][field] = value;
    setResults(newResults);
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  // Fetch competitions from API (DB is the single source of truth)
  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        setCompLoading(true);
        const res = await api.get('/competitions');
        const filtered = res.data
          .filter(c => c.category === '创新创业类' && ['特级', '一级'].includes(c.level))
          .slice(0, 6);
        setCompetitions(filtered);
      } catch (err) {
        console.error('Failed to fetch competitions for conclusion page:', err);
        setCompetitions([]);
      } finally {
        setCompLoading(false);
      }
    };
    fetchCompetitions();
  }, []);

  const handleSubmit = () => {
    if (!summary || results.length === 0) {
      alert('请填写项目总结和成果信息！');
      return;
    }
    setIsSubmitted(true);
    alert('结题报告提交成功！\n（练习模式）\n\n项目已完成所有流程！');
  };

  return (
    <Container fluid className="p-4">
      <div className="mb-4">
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>
          结题填报
        </h2>
        <p style={{ fontSize: '16px', color: '#6c757d' }}>
          提交项目结题报告和最终成果
        </p>
      </div>

      {isSubmitted && (
        <Alert variant="success" className="mb-4">
          <h5>✅ 结题报告已提交！</h5>
          <p className="mb-0">项目已完成所有流程，感谢您的使用！</p>
        </Alert>
      )}

      <Row className="g-4">
        {/* Summary Section */}
        <Col md={12}>
          <Card className="card-modern">
            <Card.Body>
              <h4 className="mb-4" style={{ fontSize: '24px', fontWeight: 'bold' }}>
                项目总结
              </h4>
              <Form.Label style={{ fontWeight: '500' }}>项目完成情况总结 *</Form.Label>
              <Form.Control
                as="textarea"
                rows={10}
                placeholder="详细总结项目的完成情况、取得的成果、遇到的问题和解决方案、经验教训等..."
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                disabled={isSubmitted}
              />
            </Card.Body>
          </Card>
        </Col>

        {/* Results Section */}
        <Col md={8}>
          <Card className="card-modern">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                  项目成果
                </h4>
                <Button
                  size="sm"
                  variant="outline-primary"
                  onClick={handleAddResult}
                  disabled={isSubmitted}
                >
                  + 添加成果
                </Button>
              </div>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>成果类型</th>
                      <th>成果描述</th>
                      <th>状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr key={index}>
                        <td>
                          <Form.Select
                            value={result.type}
                            onChange={(e) => handleResultChange(index, 'type', e.target.value)}
                            disabled={isSubmitted}
                          >
                            <option value="">选择类型</option>
                            <option value="paper">论文</option>
                            <option value="patent">专利</option>
                            <option value="software">软件</option>
                            <option value="product">产品</option>
                            <option value="other">其他</option>
                          </Form.Select>
                        </td>
                        <td>
                          <Form.Control
                            type="text"
                            placeholder="描述成果内容"
                            value={result.description}
                            onChange={(e) => handleResultChange(index, 'description', e.target.value)}
                            disabled={isSubmitted}
                          />
                        </td>
                        <td>
                          <Form.Select
                            value={result.status}
                            onChange={(e) => handleResultChange(index, 'status', e.target.value)}
                            disabled={isSubmitted}
                          >
                            <option value="已完成">已完成</option>
                            <option value="进行中">进行中</option>
                            <option value="计划中">计划中</option>
                          </Form.Select>
                        </td>
                        <td>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => setResults(results.filter((_, i) => i !== index))}
                            disabled={isSubmitted}
                          >
                            删除
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Final Uploads */}
        <Col md={4}>
          <Card className="card-modern">
            <Card.Body>
              <h4 className="mb-4" style={{ fontSize: '24px', fontWeight: 'bold' }}>
                最终材料
              </h4>
              <Form.Label style={{ fontWeight: '500' }}>上传结题材料</Form.Label>
              <Form.Control
                type="file"
                multiple
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.jpg,.png,.zip"
                disabled={isSubmitted}
              />
              <Form.Text className="text-muted">
                可上传结题报告、成果展示、相关文档等
              </Form.Text>
              {files.length > 0 && (
                <Alert variant="info" className="mt-3">
                  已选择 {files.length} 个文件
                </Alert>
              )}

              <div className="mt-4">
                <h5 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '1rem' }}>
                  提交前检查
                </h5>
                <ul style={{ fontSize: '14px', color: '#6c757d' }}>
                  <li>项目总结已填写</li>
                  <li>成果信息已完善</li>
                  <li>相关材料已上传</li>
                  <li>所有信息已确认</li>
                </ul>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Related Competitions */}
      <Card className="card-modern mt-4">
        <Card.Body>
          <h4 className="mb-4" style={{ fontSize: '24px', fontWeight: 'bold' }}>
            相关竞赛推荐
          </h4>
          <p style={{ fontSize: '14px', color: '#6c757d', marginBottom: '20px' }}>
            项目完成后，可以参加以下相关竞赛展示您的成果：
          </p>
          <Row className="g-3">
            {compLoading ? (
              <Col xs={12} className="text-center py-3">
                <Spinner animation="border" size="sm" /> 加载竞赛数据...
              </Col>
            ) : competitions.length === 0 ? (
              <Col xs={12}>
                <Alert variant="info">暂无竞赛数据</Alert>
              </Col>
            ) : competitions.map((comp, index) => (
                <Col key={index} xs={12} md={6}>
                  <div 
                    className="p-3 border rounded"
                    style={{ 
                      backgroundColor: '#F8F9FA',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#E7F3FF';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#F8F9FA';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                    onClick={() => navigate(`/competitions?type=${comp.category}`)}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 style={{ fontSize: '16px', fontWeight: '500', margin: 0, flex: 1 }}>
                        {comp.name}
                      </h6>
                      <Badge bg={comp.level === '特级' ? 'danger' : 'warning'} className="ms-2">
                        {comp.level}
                      </Badge>
                    </div>
                    <p style={{ fontSize: '12px', color: '#6c757d', margin: 0 }}>
                      {comp.timeline || comp.time || ''}
                    </p>
                  </div>
                </Col>
            ))}
          </Row>
          <div className="mt-3 text-center">
            <Button
              variant="outline-primary"
              onClick={() => navigate('/competitions')}
              className="btn-modern"
            >
              查看所有竞赛 →
            </Button>
          </div>
        </Card.Body>
      </Card>

      {/* Navigation Buttons */}
      <div className="d-flex justify-content-between mt-4">
        <Button
          variant="secondary"
          onClick={() => navigate('/guide/midterm')}
          className="btn-modern"
          disabled={isSubmitted}
        >
          ← 返回中期
        </Button>
        <div className="d-flex gap-2">
          <Button
            variant="outline-primary"
            onClick={() => navigate('/guide')}
            className="btn-modern"
            disabled={isSubmitted}
          >
            返回指南首页
          </Button>
          <Button
            variant="success"
            onClick={handleSubmit}
            className="btn-modern"
            disabled={isSubmitted || !summary || results.length === 0}
            size="lg"
          >
            {isSubmitted ? '已提交' : '提交结题报告'}
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default GuideConclusion;
