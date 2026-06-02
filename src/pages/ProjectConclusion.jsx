// Conclusion Report Form - 结题填报页面（使用双文本框 AI 编辑器）
import React, { useState, useEffect } from 'react';
import { Container, Card } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FaArrowLeft,
  FaSave,
  FaFlagCheckered,
  FaFileWord
} from 'react-icons/fa';
import CommonButton from '../components/CommonButton';
import AIField from '../components/AIField';
import { showToast } from '../components/Toast';

const ProjectConclusion = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  // 用户输入数据
  const [formData, setFormData] = useState({
    projectSummary: '',
    achievedResults: '',
    innovationPoints: '',
    budgetFinal: '',
    teamGrowth: '',
    futurePlan: '',
    acknowledgements: ''
  });

  // AI 润色结果数据
  const [aiData, setAiData] = useState({
    projectSummary: '',
    achievedResults: '',
    innovationPoints: '',
    budgetFinal: '',
    teamGrowth: '',
    futurePlan: '',
    acknowledgements: ''
  });

  // 从 localStorage 加载已保存的数据
  useEffect(() => {
    const savedData = localStorage.getItem(`project_${id}_conclusion`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setFormData(parsed.formData || parsed);
      setAiData(parsed.aiData || {});
    }
  }, [id]);

  // 表单区域配置
  const formSections = [
    {
      key: 'projectSummary',
      title: '项目总结',
      placeholder: '请对项目进行全面总结，包括：\n• 项目背景与目标回顾\n• 研究过程概述\n• 主要工作内容',
      required: true,
      rows: 5
    },
    {
      key: 'achievedResults',
      title: '取得的主要成果',
      placeholder: '请详细描述项目取得的成果，包括：\n• 技术成果（系统、原型、算法等）\n• 学术成果（论文、专利、软著等）\n• 竞赛获奖情况\n• 其他成果',
      required: true,
      rows: 5
    },
    {
      key: 'innovationPoints',
      title: '创新点与特色',
      placeholder: '请描述项目的创新点和特色，包括：\n• 技术创新\n• 方法创新\n• 应用创新',
      required: true,
      rows: 4
    },
    {
      key: 'budgetFinal',
      title: '经费决算',
      placeholder: '请说明经费使用的最终情况，包括：\n• 各项支出明细\n• 经费使用合理性说明\n• 结余情况',
      required: true,
      rows: 4
    },
    {
      key: 'teamGrowth',
      title: '团队成长与收获',
      placeholder: '请描述团队成员的成长与收获，包括：\n• 专业能力提升\n• 团队协作经验\n• 个人成长感悟',
      required: true,
      rows: 4
    },
    {
      key: 'futurePlan',
      title: '后续计划与展望',
      placeholder: '请描述项目的后续计划，包括：\n• 成果转化计划\n• 进一步研究方向\n• 应用推广计划',
      required: false,
      rows: 4
    },
    {
      key: 'acknowledgements',
      title: '致谢',
      placeholder: '感谢在项目过程中给予帮助和支持的老师、同学及相关单位',
      required: false,
      rows: 3
    }
  ];

  // 更新用户输入
  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  // 更新 AI 结果
  const handleAIChange = (key, value) => {
    setAiData(prev => ({ ...prev, [key]: value }));
  };

  // 生成 Word 文档
  const handleGenerateWord = () => {
    let content = '# 大学生创新创业训练计划项目结题报告\n\n';

    formSections.forEach(section => {
      const aiContent = aiData[section.key];
      const userContent = formData[section.key];
      const finalContent = aiContent || userContent || '（未填写）';

      content += `## ${section.title}\n\n${finalContent}\n\n---\n\n`;
    });

    const blob = new Blob([content], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `结题报告_${new Date().toLocaleDateString('zh-CN')}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('success', 'Word 文档已生成并下载');
  };

  // 保存数据
  const handleSave = () => {
    const saveData = {
      formData,
      aiData,
      lastSaved: new Date().toISOString()
    };

    localStorage.setItem(`project_${id}_conclusion`, JSON.stringify(saveData));
    showToast('success', '保存成功！');
  };

  // 保存并返回
  const handleSaveAndBack = () => {
    const saveData = {
      formData,
      aiData,
      lastSaved: new Date().toISOString()
    };

    localStorage.setItem(`project_${id}_conclusion`, JSON.stringify(saveData));
    showToast('success', '保存成功！');

    setTimeout(() => {
      navigate(`/project/${id}/edit`);
    }, 800);
  };

  return (
    <Container fluid className="p-4 page-transition" style={{ backgroundColor: '#F0F4F8', minHeight: '100vh' }}>
      {/* Header */}
      <div className="mb-4 animate-fade-in-up">
        <CommonButton
          variant="link"
          onClick={() => navigate(`/project/${id}/edit`)}
          style={{ padding: 0, marginBottom: '12px', color: '#6c757d', textDecoration: 'none' }}
        >
          <FaArrowLeft style={{ marginRight: '8px' }} />
          返回选择页面
        </CommonButton>

        <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#333', marginBottom: '4px' }}>
          <FaFlagCheckered style={{ marginRight: '10px', color: '#722ed1' }} />
          结题填报
        </h1>
        <p style={{ fontSize: '13px', color: '#6c757d', margin: 0 }}>
          填写项目结题材料，使用 AI 润色功能优化内容
        </p>
      </div>

      {/* Form Sections with AIField */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1000px' }}>
        {formSections.map((section, index) => (
          <Card
            key={section.key}
            className="animate-fade-in-up"
            style={{
              border: 'none',
              borderRadius: '16px',
              boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
              animationDelay: `${index * 0.05}s`
            }}
          >
            <Card.Body className="p-4">
              {/* Section Number Badge */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '28px',
                height: '28px',
                borderRadius: '50%',
                backgroundColor: '#722ed1',
                color: '#fff',
                fontSize: '13px',
                fontWeight: '600',
                marginBottom: '12px'
              }}>
                {index + 1}
              </div>

              <AIField
                label={section.title}
                value={formData[section.key]}
                onChange={(e) => handleInputChange(section.key, e.target.value)}
                aiValue={aiData[section.key]}
                onAIChange={(value) => handleAIChange(section.key, value)}
                placeholder={section.placeholder}
                rows={section.rows || 4}
                required={section.required}
              />
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* Bottom Buttons */}
      <div className="mt-4 d-flex justify-content-center gap-3 animate-fade-in-up" style={{ maxWidth: '1000px' }}>
        <CommonButton
          variant="primary"
          onClick={handleGenerateWord}
          style={{
            padding: '12px 36px',
            fontSize: '15px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none'
          }}
        >
          <FaFileWord style={{ marginRight: '8px' }} />
          生成 Word
        </CommonButton>
        <CommonButton
          variant="secondary"
          onClick={handleSave}
          style={{ padding: '12px 36px', fontSize: '15px' }}
        >
          <FaSave style={{ marginRight: '8px' }} />
          保存草稿
        </CommonButton>
        <CommonButton
          variant="primary"
          onClick={handleSaveAndBack}
          style={{ padding: '12px 36px', fontSize: '15px', backgroundColor: '#722ed1', borderColor: '#722ed1' }}
        >
          <FaSave style={{ marginRight: '8px' }} />
          保存并返回
        </CommonButton>
      </div>
    </Container>
  );
};

export default ProjectConclusion;
