import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Button, Spinner } from 'react-bootstrap';
import Markdown from 'react-markdown';
import api from '../services/api';

const getLevelBadge = (level) => {
  if (level === 'National') return { variant: 'danger', label: '国家级' };
  if (level === 'Provincial') return { variant: 'info', label: '省级' };
  return { variant: 'secondary', label: level };
};

const getStatusBadge = (status) => {
  if (status === 'ongoing') return { variant: 'success', label: '进行中' };
  if (status === 'upcoming') return { variant: 'warning', label: '即将开始' };
  if (status === 'ended') return { variant: 'secondary', label: '已结束' };
  return { variant: 'secondary', label: status };
};

const CompetitionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [comp, setComp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/competitions/${id}`);
        setComp(res.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch competition detail:', err);
        setError(err.response?.status === 404 ? '竞赛不存在' : '获取竞赛详情失败');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">加载中...</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5 text-center">
        <p className="text-danger mb-3">{error}</p>
        <Button variant="outline-primary" onClick={() => navigate('/competitions')}>返回竞赛列表</Button>
      </Container>
    );
  }

  if (!comp) return null;

  const levelBadge = getLevelBadge(comp.level);
  const statusBadge = getStatusBadge(comp.status);

  return (
    <Container fluid className="p-4" style={{ backgroundColor: '#F0F4F8', minHeight: 'calc(100vh - 60px)' }}>
      {/* 返回按钮 */}
      <Button variant="link" className="mb-3 p-0" style={{ textDecoration: 'none', color: '#6c757d' }} onClick={() => navigate('/competitions')}>
        ← 返回竞赛列表
      </Button>

      {/* 标题区 */}
      <Card className="card-modern mb-3">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '8px' }}>{comp.name}</h2>
              <div className="d-flex gap-2 flex-wrap align-items-center">
                <Badge bg={levelBadge.variant}>{levelBadge.label}</Badge>
                <Badge bg={statusBadge.variant}>{statusBadge.label}</Badge>
                {comp.category && <Badge bg="light" text="dark" style={{ border: '1px solid #dee2e6' }}>{comp.category}</Badge>}
              </div>
            </div>
            {comp.official_website && (
              <Button
                variant="primary"
                href={comp.official_website}
                target="_blank"
                rel="noopener noreferrer"
              >
                前往官网报名 →
              </Button>
            )}
          </div>
        </Card.Body>
      </Card>

      <Row className="g-3">
        {/* 左侧主内容 */}
        <Col xs={12} md={8}>
          {/* 赛事介绍 */}
          {comp.description && (
            <Card className="card-modern mb-3">
              <Card.Body>
                <h5 style={{ fontWeight: '600', marginBottom: '16px', color: '#333' }}>赛事介绍</h5>
                <div className="markdown-content" style={{ lineHeight: '1.8', color: '#495057' }}>
                  <Markdown>{comp.description}</Markdown>
                </div>
              </Card.Body>
            </Card>
          )}

          {/* 参赛方式 */}
          {comp.entry_method && (
            <Card className="card-modern mb-3">
              <Card.Body>
                <h5 style={{ fontWeight: '600', marginBottom: '16px', color: '#333' }}>参赛方式</h5>
                <div className="markdown-content" style={{ lineHeight: '1.8', color: '#495057' }}>
                  <Markdown>{comp.entry_method}</Markdown>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>

        {/* 右侧信息栏 */}
        <Col xs={12} md={4}>
          <Card className="card-modern">
            <Card.Body>
              <h5 style={{ fontWeight: '600', marginBottom: '16px', color: '#333' }}>竞赛信息</h5>

              <InfoRow label="主办单位" value={comp.organizer} />
              <InfoRow label="截止日期" value={comp.deadline} />
              <InfoRow label="竞赛时间" value={comp.timeline} />
              <InfoRow label="参赛对象" value={comp.participants} />
              <InfoRow label="竞赛等级" value={levelBadge.label} />
              <InfoRow label="竞赛状态" value={statusBadge.label} />

              {comp.official_website && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e9ecef' }}>
                  <small className="text-muted d-block mb-1">官方网站</small>
                  <a href={comp.official_website} target="_blank" rel="noopener noreferrer" style={{ wordBreak: 'break-all', fontSize: '14px' }}>
                    {comp.official_website}
                  </a>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

const InfoRow = ({ label, value }) => {
  if (!value) return null;
  return (
    <div style={{ marginBottom: '12px' }}>
      <small className="text-muted d-block" style={{ marginBottom: '2px' }}>{label}</small>
      <span style={{ fontSize: '14px', color: '#333' }}>{value}</span>
    </div>
  );
};

export default CompetitionDetail;
