// 大创全流程指引 - Horizontal Timeline
import React, { useState, useEffect } from 'react';
import { Container, Card, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import {
  FaRocket,
  FaTrophy,
  FaClipboardCheck,
  FaFlagCheckered,
  FaChevronRight,
  FaUsers,
  FaUserTie,
  FaFileAlt,
  FaMedal,
  FaMoneyBillWave,
  FaExclamationTriangle,
  FaCalendarAlt
} from 'react-icons/fa';
import CommonButton from '../../components/CommonButton';
import { useAuth } from '../../context/AuthContext';

const ProcessGuide = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [latestProjectId, setLatestProjectId] = useState(null);

  // 获取用户最新项目ID
  useEffect(() => {
    if (user) {
      const savedProjects = localStorage.getItem('my_projects');
      if (savedProjects) {
        const projects = JSON.parse(savedProjects);
        if (projects.length > 0) {
          setLatestProjectId(projects[0].id);
        }
      }
    }
  }, [user]);

  // 处理导航到项目编辑页面
  const handleProjectAction = (path) => {
    if (latestProjectId) {
      navigate(path.replace('[id]', latestProjectId));
    } else {
      navigate('/my-projects');
    }
  };

  // 时间线数据
  const timelineData = [
    {
      id: 1,
      phase: '起步与立项',
      time: '10月',
      timeLabel: 'October',
      title: '项目启动 & 申报',
      icon: <FaRocket size={20} />,
      color: '#1890ff',
      bgColor: '#e6f7ff',
      details: [
        { icon: <FaUsers size={12} />, text: '组建团队（3-5人）' },
        { icon: <FaUserTie size={12} />, text: '匹配导师' },
        { icon: <FaFileAlt size={12} />, text: '填写申报书' }
      ],
      action: {
        text: '去写申报书',
        path: '/application-editor',
        needsProject: false
      }
    },
    {
      id: 2,
      phase: '竞赛练兵',
      time: '3-5月',
      timeLabel: 'Mar-May',
      title: '核心赛事参与',
      icon: <FaTrophy size={20} />,
      color: '#fa8c16',
      bgColor: '#fff7e6',
      details: [
        { icon: <FaCalendarAlt size={12} />, text: '3月：青创杯' },
        { icon: <FaCalendarAlt size={12} />, text: '5月：互联网+' },
        { icon: <FaMedal size={12} />, text: '至少参与3个比赛' }
      ],
      action: {
        text: '查看竞赛',
        path: '/guide/related-competitions',
        needsProject: false
      }
    },
    {
      id: 3,
      phase: '中期检查',
      time: '4月',
      timeLabel: 'April',
      title: '中期审查 & 经费',
      icon: <FaClipboardCheck size={20} />,
      color: '#52c41a',
      bgColor: '#f6ffed',
      details: [
        { icon: <FaFileAlt size={12} />, text: '上传成果证明' },
        { icon: <FaMoneyBillWave size={12} />, text: '发放50%经费' }
      ],
      action: {
        text: '去写中期报告',
        path: '/midterm-editor',
        needsProject: false
      }
    },
    {
      id: 4,
      phase: '结题验收',
      time: '6月',
      timeLabel: 'June',
      title: '结题答辩 & 决算',
      icon: <FaFlagCheckered size={20} />,
      color: '#722ed1',
      bgColor: '#f9f0ff',
      details: [
        { icon: <FaFileAlt size={12} />, text: '提交结题书' },
        { icon: <FaExclamationTriangle size={12} />, text: '经费半年内用完', warning: true }
      ],
      action: {
        text: '去写结题报告',
        path: '/final-editor',
        needsProject: false
      }
    }
  ];

  // 获取当前阶段（基于月份）
  const getCurrentPhase = () => {
    const month = new Date().getMonth() + 1;
    if (month >= 10 || month <= 2) return 1;
    if (month >= 3 && month <= 5) return 2;
    if (month === 4) return 3;
    return 4;
  };

  const currentPhase = getCurrentPhase();

  return (
    <Container fluid className="p-4" style={{ backgroundColor: '#f5f7fa', minHeight: 'calc(100vh - 60px)' }}>
      {/* Header */}
      <div className="mb-4">
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>
          🗺️ 大创全流程指引
        </h1>
        <p style={{ fontSize: '15px', color: '#666', margin: 0 }}>
          从 10 月立项到 6 月结题，一图掌握大创项目完整生命周期
        </p>
      </div>

      {/* Horizontal Timeline Container */}
      <div
        className="timeline-wrapper"
        style={{
          width: '100%',
          maxWidth: '1100px',
          margin: '0 auto',
          paddingBottom: '20px'
        }}
      >
        <div
          className="timeline-horizontal"
          style={{
            display: 'flex',
            gap: '0',
            width: '100%',
            padding: '20px 10px',
            position: 'relative'
          }}
        >
          {/* Horizontal Line */}
          <div
            style={{
              position: 'absolute',
              top: '60px',
              left: '40px',
              right: '40px',
              height: '4px',
              background: 'linear-gradient(90deg, #1890ff 0%, #52c41a 50%, #722ed1 100%)',
              borderRadius: '2px',
              zIndex: 0
            }}
          />

          {/* Timeline Nodes */}
          {timelineData.map((item, index) => {
            const isActive = item.id === currentPhase;

            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: '1 1 25%',
                  maxWidth: '25%',
                  minWidth: '0',
                  position: 'relative',
                  padding: '0 6px'
                }}
              >
                {/* Node Circle */}
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? item.color : '#fff',
                    border: `4px solid ${item.color}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isActive ? '#fff' : item.color,
                    zIndex: 2,
                    boxShadow: isActive ? `0 0 16px ${item.color}50` : '0 2px 8px rgba(0,0,0,0.1)',
                    marginBottom: '16px',
                    flexShrink: 0
                  }}
                >
                  {item.icon}
                </div>

                {/* Connector Line to Card */}
                <div
                  style={{
                    width: '2px',
                    height: '20px',
                    backgroundColor: item.color,
                    marginBottom: '8px',
                    flexShrink: 0
                  }}
                />

                {/* Content Card */}
                <Card
                  style={{
                    width: '100%',
                    border: isActive ? `2px solid ${item.color}` : '1px solid #e8e8e8',
                    borderRadius: '14px',
                    boxShadow: isActive ? `0 6px 20px ${item.color}25` : '0 2px 8px rgba(0,0,0,0.06)',
                    transition: 'all 0.3s ease',
                    overflow: 'hidden'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = `0 10px 28px ${item.color}30`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = isActive ? `0 6px 20px ${item.color}25` : '0 2px 8px rgba(0,0,0,0.06)';
                  }}
                >
                  {/* Card Header */}
                  <div
                    style={{
                      backgroundColor: item.bgColor,
                      padding: '14px 16px',
                      borderBottom: `1px solid ${item.color}20`
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <Badge
                        style={{
                          backgroundColor: item.color,
                          color: '#fff',
                          padding: '5px 10px',
                          borderRadius: '16px',
                          fontSize: '11px',
                          fontWeight: '600'
                        }}
                      >
                        {item.phase}
                      </Badge>
                      {isActive && (
                        <Badge
                          style={{
                            backgroundColor: '#ff4d4f',
                            color: '#fff',
                            padding: '3px 8px',
                            borderRadius: '10px',
                            fontSize: '10px',
                            animation: 'pulse 2s infinite'
                          }}
                        >
                          当前
                        </Badge>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '20px', fontWeight: 'bold', color: item.color }}>
                        {item.time}
                      </span>
                      <span style={{ fontSize: '11px', color: '#999' }}>
                        {item.timeLabel}
                      </span>
                    </div>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#333', margin: '6px 0 0 0' }}>
                      {item.title}
                    </h4>
                  </div>

                  {/* Card Body */}
                  <Card.Body style={{ padding: '14px 16px' }}>
                    {/* Details List */}
                    <div style={{ marginBottom: '14px' }}>
                      {item.details.map((detail, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            marginBottom: '8px',
                            padding: detail.warning ? '6px 8px' : '0',
                            backgroundColor: detail.warning ? '#fff2e8' : 'transparent',
                            borderRadius: detail.warning ? '6px' : '0',
                            border: detail.warning ? '1px solid #ffbb96' : 'none'
                          }}
                        >
                          <span style={{ color: detail.warning ? '#fa541c' : item.color }}>
                            {detail.icon}
                          </span>
                          <span
                            style={{
                              fontSize: '12px',
                              color: detail.warning ? '#ad4e00' : '#555',
                              lineHeight: '1.4'
                            }}
                          >
                            {detail.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Action Button */}
                    <CommonButton
                      variant="primary"
                      fullWidth
                      onClick={() => {
                        if (item.action.needsProject) {
                          handleProjectAction(item.action.path);
                        } else {
                          navigate(item.action.path);
                        }
                      }}
                      style={{
                        backgroundColor: item.color,
                        borderColor: item.color,
                        padding: '10px 16px',
                        fontSize: '13px',
                        fontWeight: '600',
                        borderRadius: '8px'
                      }}
                    >
                      {item.action.text} <FaChevronRight style={{ marginLeft: '6px', fontSize: '11px' }} />
                    </CommonButton>
                  </Card.Body>
                </Card>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Summary */}
      <Card
        style={{
          marginTop: '24px',
          border: 'none',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff'
        }}
      >
        <Card.Body style={{ padding: '20px', textAlign: 'center' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '10px' }}>
            📌 重要提醒
          </h4>
          <p style={{ fontSize: '13px', opacity: 0.9, margin: 0, lineHeight: '1.7' }}>
            大创项目周期约为 <strong>8-10 个月</strong>，请合理规划时间。
            经费报销需在结题后 <strong>半年内</strong> 完成，逾期作废。
          </p>
        </Card.Body>
      </Card>

      {/* CSS Animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.6; }
        }
        
        /* Hide scrollbar but keep functionality */
        div::-webkit-scrollbar {
          height: 6px;
        }
        div::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        div::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
        
        /* Mobile responsive - stack vertically */
        @media (max-width: 768px) {
          .timeline-horizontal {
            flex-direction: column !important;
            align-items: center !important;
          }
          .timeline-horizontal > div {
            max-width: 100% !important;
            flex: 1 1 100% !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </Container>
  );
};

export default ProcessGuide;
