// ============================================
// AI Service - 通过后端代理调用 AI 接口
// ============================================
// 所有 AI 请求均通过自有后端 /api/ai/* 转发，
// API Key 仅存于后端环境变量，前端零泄露。

import api from './api';
import { APPLICATION_PROMPTS, FIELD_KEY_MAP, getPromptByLabel } from '../data/applicationPrompts';
import { MIDTERM_PROMPTS, FINAL_PROMPTS } from '../data/reportPrompts';

// ============================================
// CONFIGURATION
// ============================================
const USE_MOCK = false; // Set to true to use mock mode without API calls
const MOCK_DELAY = 1500;

// ============================================
// LEGACY SYSTEM PROMPTS - For non-application fields
// ============================================
const LEGACY_PROMPTS = {
  '已取得成果': '你是一位学术成果评审专家。请润色以下成果描述，使其数据详实、成果突出、表述专业。',
  '项目进展小结': '你是一位项目进度评估专家。请优化以下进展小结，使其条理清晰、重点突出。',
  '今后计划': '你是一位项目规划专家。请优化以下计划描述，使其目标明确、措施具体、可执行性强。',
  '项目总结': '你是一位项目结题评审专家。请润色以下项目总结，使其全面、客观、专业。',
  '经费决算': '你是一位财务管理专家。请优化以下经费说明，使其清晰、规范、合理。',
  '团队成长与收获': '你是一位教育评估专家。请润色以下团队成长描述，使其真实、具体、有感染力。',
  'default': '你是一位专业的学术写作助手。请润色以下文本，使其更加专业、清晰、有说服力。保持原意的同时，优化语言表达，符合大学创新训练项目申报书的学术规范。'
};

// ============================================
// MOCK RESPONSES
// ============================================
const generateMockResponse = (userDraft, sectionType) => {
  const mockPrefix = '✅ [AI 润色结果]\n\n';
  const mockSuffix = '\n\n---\n📝 提示：这是模拟生成的内容。';

  const mockTemplates = {
    'project_intro': `${mockPrefix}本项目聚焦于${userDraft.substring(0, 20)}...领域的创新研究。\n\n【项目背景】\n随着相关技术的快速发展，该领域面临着新的机遇与挑战。\n\n【核心目标】\n本项目旨在通过系统性研究，探索创新解决方案，推动领域发展。\n\n【预期成果】\n项目完成后，预计将形成具有自主知识产权的技术方案。${mockSuffix}`,
    'research_purpose': `${mockPrefix}【研究背景与痛点】\n1. 当前领域存在效率低下的问题\n2. 传统方法难以满足新需求\n3. 缺乏系统性的解决方案\n\n【研究目标】\n本项目旨在解决上述痛点，通过创新技术手段实现突破。\n\n【预期价值】\n项目成果将为相关领域提供重要参考。${mockSuffix}`,
    'default': `${mockPrefix}${userDraft}\n\n【优化建议】\n1. 建议增加具体的数据支撑\n2. 可以补充相关的理论依据\n3. 注意语言的学术规范性\n4. 建议增强逻辑连贯性${mockSuffix}`
  };

  const key = FIELD_KEY_MAP[sectionType] || sectionType;
  return mockTemplates[key] || mockTemplates['default'];
};

// ============================================
// GET SYSTEM PROMPT
// ============================================
const getSystemPrompt = (sectionType) => {
  if (APPLICATION_PROMPTS[sectionType]) return APPLICATION_PROMPTS[sectionType];
  if (MIDTERM_PROMPTS && MIDTERM_PROMPTS[sectionType]) return MIDTERM_PROMPTS[sectionType];
  if (FINAL_PROMPTS && FINAL_PROMPTS[sectionType]) return FINAL_PROMPTS[sectionType];

  const key = FIELD_KEY_MAP[sectionType];
  if (key && APPLICATION_PROMPTS[key]) return APPLICATION_PROMPTS[key];
  if (LEGACY_PROMPTS[sectionType]) return LEGACY_PROMPTS[sectionType];

  return getPromptByLabel(sectionType);
};

// ============================================
// MAIN API FUNCTION - polishText (通过后端 Qwen 代理)
// ============================================
export const polishText = async (userDraft, sectionKey = 'default') => {
  if (!userDraft || typeof userDraft !== 'string') {
    return '请先输入内容，AI 将帮助您润色和优化文本。';
  }

  const trimmedDraft = userDraft.trim();
  if (trimmedDraft.length === 0) {
    return '请先输入内容，AI 将帮助您润色和优化文本。';
  }

  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, MOCK_DELAY));
    return generateMockResponse(trimmedDraft, sectionKey);
  }

  try {
    const systemPrompt = getSystemPrompt(sectionKey);

    console.log('[AI Service] Calling backend /api/ai/qwen ...');
    console.log('[AI Service] Section Key:', sectionKey);

    const response = await api.post('/ai/qwen', {
      text: trimmedDraft,
      sectionKey,
      systemPrompt
    });

    if (response.data?.success && response.data?.data?.content) {
      return response.data.data.content;
    }

    throw new Error(response.data?.message || 'AI 返回格式异常');
  } catch (error) {
    console.error('[AI Service] Error:', error);

    const message = error.response?.data?.message || error.message || '未知错误';

    // 401 表示未登录，不回退 mock，直接提示
    if (error.response?.status === 401) {
      throw new Error('请先登录后再使用 AI 功能');
    }

    // 其他错误回退到 mock
    console.warn('[AI Service] Falling back to mock mode due to error');
    await new Promise(resolve => setTimeout(resolve, 500));
    return `⚠️ AI 服务暂时不可用（${message}），已使用模拟结果：\n\n${generateMockResponse(trimmedDraft, sectionKey)}`;
  }
};

// ============================================
// DEEPSEEK GENERATION (通过后端代理)
// ============================================
export const generateDeepSeekContent = async (text, systemPrompt) => {
  if (!text || typeof text !== 'string' || !text.trim()) {
    return '请先输入内容。';
  }

  try {
    const response = await api.post('/ai/deepseek', {
      text: text.trim(),
      systemPrompt
    });

    if (response.data?.success && response.data?.data?.content) {
      return response.data.data.content;
    }

    throw new Error(response.data?.message || 'AI 返回格式异常');
  } catch (error) {
    console.error('[AI Service] DeepSeek error:', error);
    if (error.response?.status === 401) {
      throw new Error('请先登录后再使用 AI 功能');
    }
    throw new Error(error.response?.data?.message || error.message || 'DeepSeek 服务请求失败');
  }
};

// ============================================
// LEGACY EXPORT
// ============================================
export const generatePolishedText = polishText;

// ============================================
// BATCH PROCESSING
// ============================================
export const polishAllFields = async (formData) => {
  const result = {};
  for (const [key, value] of Object.entries(formData)) {
    if (value && value.trim()) {
      try {
        result[key] = await polishText(value, key);
      } catch (error) {
        console.error(`[AI Service] Error polishing field ${key}:`, error);
        result[key] = value;
      }
    } else {
      result[key] = value;
    }
  }
  return result;
};

// ============================================
// SERVICE STATUS CHECK
// ============================================
export const getServiceStatus = () => {
  return {
    isConfigured: true, // 密钥在后端，前端无法判断，默认 true
    isMockMode: USE_MOCK,
    apiUrl: '/api/ai/qwen',
    model: 'qwen-plus'
  };
};

// ============================================
// AVAILABLE PROMPTS
// ============================================
export const getAvailablePromptKeys = () => {
  return Object.keys(APPLICATION_PROMPTS);
};

export default {
  polishText,
  generatePolishedText: polishText,
  generateDeepSeekContent,
  polishAllFields,
  getServiceStatus,
  getAvailablePromptKeys
};
