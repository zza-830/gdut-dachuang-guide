// AI 双创智填中心 - Selection Hub
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaBrain,
  FaFileAlt,
  FaChartLine,
  FaFlagCheckered,
  FaChevronRight,
  FaLightbulb
} from 'react-icons/fa';

const AICreation = () => {
  const navigate = useNavigate();

  const cards = [
    {
      id: 'application',
      icon: <FaFileAlt size={40} />,
      title: '申报书填写',
      description: '智能辅助填写大创项目申报书，自动生成研究背景、技术路线等内容',
      color: '#1890ff',
      bgColor: '#e6f7ff',
      path: '/application-editor'
    },
    {
      id: 'midterm',
      icon: <FaChartLine size={40} />,
      title: '中期填报',
      description: '智能生成中期检查报告，自动总结项目进展和阶段性成果',
      color: '#722ed1',
      bgColor: '#f9f0ff',
      path: '/midterm-editor'
    },
    {
      id: 'final',
      icon: <FaFlagCheckered size={40} />,
      title: '结题填报',
      description: '智能辅助撰写结题报告，自动整理项目成果和创新点',
      color: '#52c41a',
      bgColor: '#f6ffed',
      path: '/final-editor'
    },
    {
      id: 'patent',
      icon: <FaLightbulb size={40} />,
      title: '专利填报',
      description: '智能辅助生成专利交底书与申请文档，规范化专利撰写流程',
      color: '#fa8c16',
      bgColor: '#fff7e6',
      path: '/patent-editor'
    }
  ];

  return (
    <div style={{ flex: 1, padding: '32px', backgroundColor: '#F0F4F8', minHeight: 'calc(100vh - 60px)' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: '0 8px 24px rgba(102, 126, 234, 0.35)'
          }}
        >
          <FaBrain size={36} style={{ color: '#fff' }} />
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '12px' }}>
          AI 双创智填中心
        </h1>
        <p style={{ fontSize: '16px', color: '#666', maxWidth: '500px', margin: '0 auto' }}>
          选择文档类型，开始 AI 辅助写作
        </p>
      </div>

      {/* Cards Grid - 4 Column Layout */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            onClick={() => navigate(card.path)}
            style={{
              backgroundColor: '#fff',
              borderRadius: '14px',
              padding: '24px',
              border: '1px solid #e8e8e8',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                backgroundColor: card.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                color: card.color
              }}
            >
              {card.icon}
            </div>

            {/* Title */}
            <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1a1a2e', marginBottom: '10px' }}>
              {card.title}
            </h3>

            {/* Description */}
            <p style={{ fontSize: '13px', color: '#666', lineHeight: '1.6', marginBottom: '20px', flex: 1 }}>
              {card.description}
            </p>

            {/* Button */}
            <button
              style={{
                backgroundColor: card.color,
                color: '#fff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '24px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              开始填写 <FaChevronRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {/* Bottom Tip */}
      <div
        style={{
          textAlign: 'center',
          marginTop: '48px',
          padding: '20px',
          backgroundColor: '#fff',
          borderRadius: '12px',
          maxWidth: '600px',
          margin: '48px auto 0',
          border: '1px solid #e8e8e8'
        }}
      >
        <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
          💡 <strong>提示：</strong>中期填报和结题填报需要先选择已有项目，系统将自动关联项目信息
        </p>
      </div>
    </div>
  );
};

export default AICreation;
