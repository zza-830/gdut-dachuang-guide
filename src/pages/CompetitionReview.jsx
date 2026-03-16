import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Table, Badge, Spinner, Alert, Modal, Form, Row, Col
} from 'react-bootstrap';
import { FaClipboardCheck, FaCalendarAlt, FaCheckCircle } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import CommonButton from '../components/CommonButton';

/** 格式化 datetime 为 YYYY-MM-DD（用于 input[type=date]） */
const toDateValue = (str) => {
  if (!str) return '';
  return str.slice(0, 10);
};

/** 格式化为中文可读日期 */
const formatDate = (str) => {
  if (!str) return '-';
  return new Date(str).toLocaleDateString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
  });
};

const getLevelBadge = (level) => {
  if (level === 'National')   return { bg: 'danger', label: '国家级' };
  if (level === 'Provincial') return { bg: 'info',   label: '省级' };
  return { bg: 'secondary', label: level || '-' };
};

const CompetitionReview = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [list, setList]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  // Modal state
  const [showModal, setShowModal]       = useState(false);
  const [current, setCurrent]           = useState(null);   // 当前编辑的竞赛
  const [formStart, setFormStart]       = useState('');
  const [formEnd, setFormEnd]           = useState('');
  const [submitting, setSubmitting]     = useState(false);
  const [formError, setFormError]       = useState('');

  // 权限守卫：仅 admin 可见
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  const fetchList = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/competitions/review/list');
      if (res.data.success) {
        setList(res.data.data);
      } else {
        setError(res.data.error || '获取列表失败');
      }
    } catch (err) {
      setError(err.response?.data?.error || '获取审核列表失败，请检查服务');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchList(); }, [fetchList]);

  // 打开核对弹窗
  const handleOpenReview = (comp) => {
    setCurrent(comp);
    setFormStart(toDateValue(comp.start_time));
    setFormEnd(toDateValue(comp.end_time));
    setFormError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setCurrent(null);
  };

  // 提交审核
  const handleSubmit = async () => {
    setFormError('');
    if (!formStart || !formEnd) {
      setFormError('起始时间和截止时间均不能为空');
      return;
    }
    if (formStart >= formEnd) {
      setFormError('开始时间必须早于结束时间');
      return;
    }
    try {
      setSubmitting(true);
      const res = await api.put(`/competitions/${current.id}/review`, {
        start_time: formStart,
        end_time:   formEnd,
      });
      if (res.data.success) {
        setSuccess(`「${current.name}」时间已核对完成`);
        setShowModal(false);
        fetchList();  // 刷新列表
      } else {
        setFormError(res.data.error || '提交失败');
      }
    } catch (err) {
      setFormError(err.response?.data?.error || '提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-4" style={{ maxWidth: '1100px' }}>
      {/* 页头 */}
      <div className="d-flex align-items-center gap-3 mb-4">
        <div style={{
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'linear-gradient(135deg, #faad14 0%, #d48806 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
        }}>
          <FaClipboardCheck size={22} color="#fff" />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 'bold' }}>赛事时间审核</h2>
          <p style={{ margin: 0, color: '#8c8c8c', fontSize: '13px' }}>
            以下赛事由定时任务自动滚动跨年，请核对起止时间后确认
          </p>
        </div>
      </div>

      {error   && <Alert variant="danger"  onClose={() => setError('')}   dismissible>{error}</Alert>}
      {success && <Alert variant="success" onClose={() => setSuccess('')} dismissible>
        <FaCheckCircle style={{ marginRight: '6px' }} />{success}
      </Alert>}

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="warning" />
          <p className="mt-3 text-muted">加载待审核列表...</p>
        </div>
      ) : (
        <div style={{
          backgroundColor: '#fff', borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)', overflow: 'hidden',
        }}>
          <Table hover responsive style={{ margin: 0 }}>
            <thead>
              <tr style={{ backgroundColor: '#fffbe6' }}>
                {['竞赛名称', '级别', '类别', '当前开始时间', '当前结束时间', '截止报名', '操作'].map(h => (
                  <th key={h} style={{ padding: '13px 14px', fontWeight: '600', fontSize: '13px', color: '#666', whiteSpace: 'nowrap' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    🎉 暂无待审核赛事，所有数据均已核对完毕
                  </td>
                </tr>
              ) : list.map(comp => {
                const lvl = getLevelBadge(comp.level);
                return (
                  <tr key={comp.id}>
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', fontWeight: '500', maxWidth: '280px' }}>
                      {comp.name}
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                      <Badge bg={lvl.bg}>{lvl.label}</Badge>
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', fontSize: '13px', color: '#555' }}>
                      {comp.category || '-'}
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', fontSize: '13px' }}>
                      <span style={{ color: comp.start_time ? '#1677ff' : '#bbb' }}>
                        <FaCalendarAlt style={{ marginRight: '4px', opacity: 0.6 }} />
                        {formatDate(comp.start_time)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', fontSize: '13px' }}>
                      <span style={{ color: comp.end_time ? '#1677ff' : '#bbb' }}>
                        <FaCalendarAlt style={{ marginRight: '4px', opacity: 0.6 }} />
                        {formatDate(comp.end_time)}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle', fontSize: '13px', color: '#666' }}>
                      {comp.deadline || '-'}
                    </td>
                    <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                      <CommonButton
                        variant="warning"
                        size="sm"
                        onClick={() => handleOpenReview(comp)}
                        style={{ borderRadius: '6px', fontSize: '12px', padding: '4px 14px', color: '#fff' }}
                      >
                        <FaClipboardCheck style={{ marginRight: '4px' }} />
                        核对时间
                      </CommonButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </Table>

          {list.length > 0 && (
            <div style={{ padding: '10px 16px', backgroundColor: '#fafafa', borderTop: '1px solid #f0f0f0', fontSize: '13px', color: '#888' }}>
              共 {list.length} 条待审核记录
            </div>
          )}
        </div>
      )}

      {/* 核对时间弹窗 */}
      <Modal show={showModal} onHide={handleCloseModal} centered>
        <Modal.Header closeButton style={{ borderBottom: '1px solid #f0f0f0' }}>
          <Modal.Title style={{ fontSize: '16px', fontWeight: 'bold' }}>
            <FaClipboardCheck style={{ marginRight: '8px', color: '#faad14' }} />
            核对赛事时间
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {current && (
            <>
              <p style={{ fontSize: '14px', color: '#555', marginBottom: '16px' }}>
                <strong>竞赛：</strong>{current.name}
              </p>
              {formError && <Alert variant="danger" style={{ fontSize: '13px', padding: '8px 12px' }}>{formError}</Alert>}
              <Row className="g-3">
                <Col xs={12} sm={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: '13px', fontWeight: '600' }}>
                      <FaCalendarAlt style={{ marginRight: '4px', color: '#1677ff' }} />
                      开始时间（报名开始）
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={formStart}
                      onChange={e => setFormStart(e.target.value)}
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Group>
                    <Form.Label style={{ fontSize: '13px', fontWeight: '600' }}>
                      <FaCalendarAlt style={{ marginRight: '4px', color: '#ff4d4f' }} />
                      结束时间（报名截止）
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={formEnd}
                      onChange={e => setFormEnd(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <p style={{ fontSize: '12px', color: '#aaa', marginTop: '12px', marginBottom: 0 }}>
                确认后将清除"待审核"标记，该竞赛将不再出现在本列表中。
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer style={{ borderTop: '1px solid #f0f0f0' }}>
          <CommonButton variant="secondary" size="sm" onClick={handleCloseModal} disabled={submitting}>
            取消
          </CommonButton>
          <CommonButton
            variant="warning"
            size="sm"
            onClick={handleSubmit}
            disabled={submitting}
            style={{ color: '#fff' }}
          >
            {submitting ? <Spinner animation="border" size="sm" /> : '确认保存'}
          </CommonButton>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default CompetitionReview;
