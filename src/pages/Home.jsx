// Home Page - 2-Row Layout Design (Admin-Expanded)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBook,
  FaTrophy,
  FaProjectDiagram,
  FaChevronRight,
  FaBrain,
  FaServer,
  FaCogs,
  FaCalendarCheck,
  FaShieldAlt,
  FaClipboardCheck
} from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const [countdown, setCountdown] = useState(null);
  const handleEnterSystem = (e) => {
    if (e) e.stopPropagation();
    navigate('/my-projects');
  };

  useEffect(() => {
    const calculateCountdown = () => {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;

      let nextEvent = null;
      let eventName = '';

      if (currentMonth < 3) {
        nextEvent = new Date(now.getFullYear(), 2, 15);
        eventName = '中期检查';
      } else if (currentMonth < 10) {
        nextEvent = new Date(now.getFullYear(), 9, 1);
        eventName = '大创申报';
      } else if (currentMonth < 12) {
        nextEvent = new Date(now.getFullYear(), 11, 1);
        eventName = '结题填报';
      } else {
        nextEvent = new Date(now.getFullYear() + 1, 2, 15);
        eventName = '中期检查';
      }

      const diff = nextEvent - now;
      const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

      if (days > 0) {
        setCountdown({ days, eventName, date: nextEvent });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 86400000);
    return () => clearInterval(interval);
  }, []);

  const featureCards = [
    {
      icon: <FaBook size={36} />,
      title: '大创申请指南',
      description: '了解大创项目的申请流程、准备事项和注意事项。从团队组建到项目申报，全程指导。',
      color: '#007BFF',
      bgColor: '#E7F3FF',
      path: '/guide/process-map',
      buttonText: '开始指南'
    },
    {
      icon: <FaTrophy size={36} />,
      title: '竞赛信息',
      description: '国家级、省级、校级竞赛分类说明。参与竞赛可获得学分加分、奖学金等多项益处。',
      color: '#FD7E14',
      bgColor: '#FFF4E6',
      path: '/competitions',
      buttonText: '探索竞赛'
    },
    {
      icon: <FaBrain size={36} />,
      title: 'AI 双创智填',
      description: '集成 DeepSeek V3 与 Qwen3，智能生成申报书、PPT及专利文档。',
      color: '#6f42c1',
      bgColor: '#F3E8FF',
      path: '/ai-creation',
      buttonText: '立即体验'
    }
  ];

  return (
    <div className="home-wrapper">
      {/* Countdown Banner */}
      {countdown && (
        <div className="home-countdown-banner">
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
              ⏰ 距离{countdown.eventName}还有 <span style={{ fontSize: '32px' }}>{countdown.days}</span> 天
            </h3>
            <p style={{ fontSize: '14px', opacity: 0.85, margin: 0 }}>
              {countdown.date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={() => navigate('/guide/process-map')}
            style={{
              backgroundColor: 'transparent',
              border: '2px solid #fff',
              color: '#fff',
              padding: '10px 24px',
              borderRadius: '24px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            查看详情 <FaChevronRight />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '8px' }}>
          欢迎使用大创指南系统
        </h1>
        <p style={{ fontSize: '15px', color: '#666', margin: 0 }}>
          广东工业大学大学生创新创业训练计划完整指南
        </p>
      </div>

      {/* ROW 1: My Projects Hero Card */}
      <div
        className="home-project-card"
        onClick={handleEnterSystem}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', flex: 1, minWidth: 0 }}>
          <div
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              backgroundColor: '#e6f4ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            <FaProjectDiagram size={32} style={{ color: '#1890ff' }} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', color: '#1a1a2e' }}>我的项目</h2>
            <p style={{ fontSize: '14px', color: '#888', margin: 0, lineHeight: '1.6' }}>
              管理您的创新创业团队，实时追踪项目申报进度，体验 AI 智能辅助填报功能。
            </p>
          </div>
        </div>
        <button
          onClick={handleEnterSystem}
          style={{
            backgroundColor: '#1890ff',
            color: '#fff',
            border: 'none',
            padding: '12px 32px',
            borderRadius: '24px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0,
            whiteSpace: 'nowrap'
          }}
        >
          进入系统 <FaChevronRight />
        </button>
      </div>

      {/* ROW 2: 3-Column Premium Cards */}
      <div className="home-feature-grid home-premium-grid">
        {featureCards.map((card, index) => (
          <div
            key={index}
            className="home-feature-card home-premium-card"
            onClick={() => navigate(card.path)}
          >
            {/* Icon Circle */}
            <div className="premium-card-icon" style={{ backgroundColor: card.bgColor }}>
              <span style={{ color: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {card.icon}
              </span>
            </div>

            {/* Title */}
            <h3 className="premium-card-title">
              {card.title}
            </h3>

            {/* Description */}
            <p className="premium-card-desc">
              {card.description}
            </p>

            {/* Pill Button with glow */}
            <button
              className="premium-card-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate(card.path);
              }}
              style={{
                backgroundColor: card.color,
                boxShadow: `0 6px 20px ${card.color}44`
              }}
            >
              {card.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* ROW 3: Admin-Only Long-Strip Cards */}
      {isAdmin && (
        <div className="home-admin-row">
          {/* Card A: Backend Management */}
          <div
            className="home-admin-strip-card"
            onClick={() => navigate('/admin')}
          >
            <div className="admin-strip-left">
              <div className="admin-strip-icon" style={{ backgroundColor: '#E7F3FF' }}>
                <FaServer size={22} style={{ color: '#007BFF' }} />
                <FaCogs size={14} style={{ color: '#007BFF', position: 'absolute', bottom: '8px', right: '8px' }} />
              </div>
              <div className="admin-strip-text">
                <h3 className="admin-strip-title">后台管理系统入口</h3>
                <p className="admin-strip-desc">全面管理系统设置、用户权限和数据报告</p>
              </div>
            </div>
            <button
              className="premium-card-btn admin-strip-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/admin');
              }}
              style={{
                backgroundColor: '#007BFF',
                boxShadow: '0 6px 20px rgba(0, 123, 255, 0.27)'
              }}
            >
              进入管理
            </button>
          </div>

          {/* Card B: Competition Time Audit */}
          <div
            className="home-admin-strip-card"
            onClick={() => navigate('/admin/competition-review')}
          >
            <div className="admin-strip-left">
              <div className="admin-strip-icon" style={{ backgroundColor: '#E7F3FF' }}>
                <FaCalendarCheck size={22} style={{ color: '#007BFF' }} />
                <FaShieldAlt size={14} style={{ color: '#007BFF', position: 'absolute', bottom: '8px', right: '8px' }} />
              </div>
              <div className="admin-strip-text">
                <h3 className="admin-strip-title">赛事时间审核中心</h3>
                <p className="admin-strip-desc">审核和管理各项竞赛的提交时间表</p>
              </div>
            </div>
            <button
              className="premium-card-btn admin-strip-btn"
              onClick={(e) => {
                e.stopPropagation();
                navigate('/admin/competition-review');
              }}
              style={{
                backgroundColor: '#007BFF',
                boxShadow: '0 6px 20px rgba(0, 123, 255, 0.27)'
              }}
            >
              进行审核
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
