import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Form, Table, Button, Badge, Card, ListGroup, Pagination, Spinner
} from 'react-bootstrap';
import api from '../services/api';

const CATEGORY_GROUPS = {
  '创新创业类': [
    'Innovation/Entrepreneurship', 'Entrepreneurship', 'Business/Entrepreneurship',
    'Innovation/Business', 'Innovation/Maker', 'Innovation/Research', 'Innovation/TRIZ',
    'Career Development', 'Skills/Innovation', 'IoT/Innovation',
    'Business/E-commerce', 'Business/Marketing', 'FinTech/Business',
    'Environment/Business', 'Science/Technology'
  ],
  '理工科技类': [
    'Computer Science', 'Computer Science/Design', 'Computer Science/Electronics',
    'Computer Science/Hardware', 'Computer Science/HPC', 'Computer Science/Mobile Dev',
    'Data Science/Computer Science', 'ICT/Computer Science', 'IoT/Computer Science',
    'Software Engineering', 'Software Engineering/Testing', 'Open Source/Software',
    'Mathematics', 'Physics', 'Optics/Physics', 'Mechanics', 'Mechanics/Physics',
    'Fluid Mechanics', 'Chemistry', 'Chemistry/Science', 'Biology/Chemistry',
    'Biology/Engineering', 'Life Sciences', 'Biomedical Engineering',
    'Chemical Engineering', 'Chemical Engineering/Safety', 'Pharmaceutical Engineering',
    'Electronics', 'Electronics/Embedded', 'Embedded Systems/IC',
    'Integrated Circuit/Electronics', 'Telecommunications', 'Telecommunications/IT',
    'Cybersecurity', 'Robotics/AI', 'Robotics/Education', 'Robotics/Engineering',
    'Robotics/Esports', 'Artificial Intelligence', 'AI/Economics',
    'Engineering', 'Engineering/Automation', 'Engineering/CAD', 'Engineering/Design',
    'Engineering/Robotics', 'Engineering/Sensor', 'Automation/Manufacturing',
    'Mechanical Engineering', 'Automotive Engineering', 'Marine Engineering',
    'Drone/Engineering', 'Civil Engineering', 'Civil Engineering/BIM',
    'Architecture', 'Architecture/Civil Engineering', 'Architecture/Construction',
    'Architecture/Design', 'Architecture/Green Energy', 'Architecture/Landscape',
    'Landscape Architecture', 'Landscape/Architecture', 'Urban Planning/Design',
    'Urban Planning/Land Management', 'Urban Planning/Rural', 'Underground Engineering',
    'Materials Science', 'Medicine', 'Agriculture/Engineering',
    'Water Conservancy', 'Water Engineering', 'HVAC/Building Environment',
    'HVAC/Engineering', 'Energy/Environment', 'Safety Engineering',
    'Geology/Science', 'Geomatics/Surveying', 'GIS/Geography',
    'Land Management', 'Real Estate', 'Real Estate/Management',
    'Transportation', 'Science/Lab Skills', 'Statistics/Data Science',
    '二级竞赛'
  ],
  '人文艺术类': [
    'Art/Performance', 'Dance', 'Theatre/Drama', 'Art Management',
    'Art/Culture', 'Art/Painting', 'Culture/Art',
    'Music/Chorus', 'Music/Vocal', 'Music/Dance', 'Music/Wind Band',
    'Music/Traditional', 'Music/Guqin', 'Music/A Cappella',
    'Recitation', 'Recitation/Media', 'Recitation/Culture',
    'Language/Culture', 'Language', 'Language/Humanities', 'Language/Japanese',
    'Language/Public Speaking', 'Debate', 'Speech/Defense', 'Psychology/Drama',
    'Design', 'Design/Art', 'Design/Concept', 'Design/Culture', 'Design/Digital',
    'Design/Digital Art', 'Design/Digital Media', 'Design/Industrial', 'Design/Media',
    'Design/UX', 'Graphic Design', 'Packaging Design',
    'Fashion Design', 'Fashion/Modeling', 'Textile/Fashion',
    'Advertising/Media', 'Humanities/Social Sciences', 'Tourism/MICE',
    'English', 'English/Vocabulary', 'English/Writing', 'Business English',
    'Japanese', 'Translation', 'Translation/Interpreting', 'Translation/Japanese',
    'Law'
  ],
  '商科经管类': [
    'Business/Management', 'Business/Accounting', 'Finance/Accounting',
    'Finance/Business', 'Finance/Economics', 'Finance/Taxation',
    'Economics', 'Economics/Energy', 'Economics/Finance',
    'Statistics/Business', 'Logistics/Management', 'Innovation/Business',
    'Business/Marketing'
  ],
  '体育类': ['Sports']
};

const CATEGORY_LABELS = Object.keys(CATEGORY_GROUPS);
const ITEMS_PER_PAGE = 12;

const getLevelBadge = (level) => {
  if (level === 'National') return { variant: 'danger', label: '国家级' };
  if (level === 'Provincial') return { variant: 'info', label: '省级' };
  return { variant: 'secondary', label: level };
};

const getStatusBadge = (status) => {
  // 后端动态计算后返回中文状态字符串
  if (status === '进行中' || status === 'ongoing')   return { variant: 'success',   label: '进行中' };
  if (status === '未开始' || status === 'upcoming')  return { variant: 'primary',   label: '未开始' };
  if (status === '已结束' || status === 'ended')     return { variant: 'secondary', label: '已结束' };
  return { variant: 'secondary', label: status || '-' };
};

const Competitions = () => {
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentCategory, setCurrentCategory] = useState('创新创业类');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCompetitions = async () => {
      try {
        setLoading(true);
        const res = await api.get('/competitions');
        setCompetitions(res.data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch competitions:', err);
        setError('获取竞赛数据失败，请检查后端服务是否启动');
      } finally {
        setLoading(false);
      }
    };
    fetchCompetitions();
  }, []);

  const filteredData = useMemo(() => {
    const allowedCategories = CATEGORY_GROUPS[currentCategory] || [];
    let data = competitions.filter(item => allowedCategories.includes(item.category));

    if (searchTerm.trim()) {
      const query = searchTerm.trim().toLowerCase();
      data = data.filter(item =>
        item.name.toLowerCase().includes(query) ||
        (item.organizer && item.organizer.toLowerCase().includes(query))
      );
    }
    return data;
  }, [competitions, currentCategory, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / ITEMS_PER_PAGE));
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredData.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredData, currentPage]);

  const handleCategoryClick = (label) => {
    setCurrentCategory(label);
    setCurrentPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  // 生成分页按钮（最多显示 7 个页码）
  const renderPaginationItems = () => {
    const items = [];
    let startPage = Math.max(1, currentPage - 3);
    let endPage = Math.min(totalPages, startPage + 6);
    if (endPage - startPage < 6) startPage = Math.max(1, endPage - 6);

    for (let p = startPage; p <= endPage; p++) {
      items.push(
        <Pagination.Item key={p} active={p === currentPage} onClick={() => handlePageChange(p)}>
          {p}
        </Pagination.Item>
      );
    }
    return items;
  };

  return (
    <Container fluid className="p-4" style={{ backgroundColor: '#F0F4F8', minHeight: 'calc(100vh - 60px)' }}>
      <div className="mb-4">
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', color: '#333', marginBottom: '10px' }}>竞赛信息</h2>
        <p style={{ fontSize: '16px', color: '#6c757d' }}>按类别查看各类竞赛，点击竞赛名称查看详情</p>
      </div>

      <Row className="g-3">
        {/* 左侧分类侧边栏 */}
        <Col xs={12} md={3}>
          <Card className="card-modern">
            <Card.Body>
              <h5 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>竞赛分类</h5>
              <ListGroup variant="flush">
                {CATEGORY_LABELS.map(label => {
                  const active = currentCategory === label;
                  return (
                    <ListGroup.Item
                      key={label}
                      action
                      onClick={() => handleCategoryClick(label)}
                      style={{ border: 'none', padding: '6px 0', backgroundColor: 'transparent' }}
                    >
                      <Button
                        variant={active ? 'primary' : 'light'}
                        size="sm"
                        style={{
                          width: '100%', textAlign: 'left', borderRadius: '999px',
                          backgroundColor: active ? '#0d6efd' : 'transparent',
                          color: active ? '#fff' : '#495057',
                          borderColor: active ? '#0d6efd' : 'transparent',
                          fontWeight: active ? '600' : '400'
                        }}
                      >
                        {label}
                      </Button>
                    </ListGroup.Item>
                  );
                })}
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* 右侧主内容区 */}
        <Col xs={12} md={9}>
          <Card className="card-modern mb-3">
            <Card.Body>
              <Row className="g-2 align-items-center">
                <Col xs={12} md={6}>
                  <Form.Control
                    type="text"
                    placeholder="搜索竞赛名称或主办单位..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </Col>
                <Col xs={12} md="auto" className="text-muted" style={{ fontSize: '14px' }}>
                  当前分类：{currentCategory}，共 {filteredData.length} 个竞赛
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="card-modern">
            <Card.Body>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <p className="mt-2 text-muted">加载竞赛数据中...</p>
                </div>
              ) : error ? (
                <div className="text-center py-5 text-danger">{error}</div>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table striped hover bordered className="mb-0">
                      <thead>
                        <tr>
                          <th>竞赛名称</th>
                          <th style={{ width: '90px' }}>等级</th>
                          <th style={{ width: '90px' }}>状态</th>
                          <th style={{ width: '120px' }}>截止日期</th>
                          <th style={{ width: '100px' }}>操作</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentData.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="text-center py-4 text-muted">
                              当前条件下没有匹配的竞赛
                            </td>
                          </tr>
                        ) : (
                          currentData.map(item => {
                            const levelBadge = getLevelBadge(item.level);
                            const statusBadge = getStatusBadge(item.status);
                            return (
                              <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/competitions/${item.id}`)}>
                                <td style={{ textAlign: 'left', color: '#212529' }}>{item.name}</td>
                                <td><Badge bg={levelBadge.variant}>{levelBadge.label}</Badge></td>
                                <td><Badge bg={statusBadge.variant}>{statusBadge.label}</Badge></td>
                                <td>{item.deadline || '-'}</td>
                                <td>
                                  <Button
                                    size="sm" variant="outline-primary"
                                    onClick={(e) => { e.stopPropagation(); navigate(`/competitions/${item.id}`); }}
                                  >
                                    查看详情
                                  </Button>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </Table>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <span className="text-muted" style={{ fontSize: '14px' }}>
                      共 {filteredData.length} 条，第 {currentPage}/{totalPages} 页
                    </span>
                    <Pagination size="sm" className="mb-0">
                      <Pagination.Prev onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1} />
                      {renderPaginationItems()}
                      <Pagination.Next onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages} />
                    </Pagination>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Competitions;
