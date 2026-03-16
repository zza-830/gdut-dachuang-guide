const axios = require('axios');

// ============================================
// AI Controller - 代理前端 AI 请求，密钥仅存于后端
// ============================================

/**
 * 通用 Qwen (通义千问) 润色接口
 * POST /api/ai/qwen
 * Body: { text, sectionKey, systemPrompt }
 */
const polishWithQwen = async (req, res) => {
  try {
    const { text, sectionKey, systemPrompt } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: '请提供需要润色的文本内容'
      });
    }

    const apiKey = process.env.ALIYUN_DASHSCOPE_API_KEY;
    if (!apiKey) {
      console.error('[AI Controller] ALIYUN_DASHSCOPE_API_KEY not configured');
      return res.status(503).json({
        success: false,
        message: 'AI 服务未配置，请联系管理员'
      });
    }

    const defaultPrompt = '你是一位专业的学术写作助手。请润色以下文本，使其更加专业、清晰、有说服力。保持原意的同时，优化语言表达，符合大学创新训练项目申报书的学术规范。';

    const response = await axios.post(
      'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions',
      {
        model: 'qwen-plus',
        messages: [
          {
            role: 'system',
            content: systemPrompt || defaultPrompt
          },
          {
            role: 'user',
            content: text.trim()
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 60000
      }
    );

    const data = response.data;
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return res.json({
        success: true,
        data: {
          content: data.choices[0].message.content,
          model: 'qwen-plus',
          usage: data.usage || null
        }
      });
    }

    return res.status(502).json({
      success: false,
      message: 'AI 接口返回格式异常'
    });
  } catch (error) {
    console.error('[AI Controller] Qwen API error:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || 'AI 服务请求失败，请稍后重试';
    return res.status(status >= 500 ? 502 : status).json({
      success: false,
      message
    });
  }
};

/**
 * DeepSeek 内容生成接口
 * POST /api/ai/deepseek
 * Body: { text, systemPrompt }
 */
const generateDeepSeekContent = async (req, res) => {
  try {
    const { text, systemPrompt } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: '请提供输入文本'
      });
    }

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      console.error('[AI Controller] DEEPSEEK_API_KEY not configured');
      return res.status(503).json({
        success: false,
        message: 'DeepSeek 服务未配置，请联系管理员'
      });
    }

    const defaultPrompt = '你是一位专业的学术写作助手，请根据用户输入生成高质量的学术内容。';

    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt || defaultPrompt
          },
          {
            role: 'user',
            content: text.trim()
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        timeout: 60000
      }
    );

    const data = response.data;
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return res.json({
        success: true,
        data: {
          content: data.choices[0].message.content,
          model: 'deepseek-chat',
          usage: data.usage || null
        }
      });
    }

    return res.status(502).json({
      success: false,
      message: 'AI 接口返回格式异常'
    });
  } catch (error) {
    console.error('[AI Controller] DeepSeek API error:', error.response?.data || error.message);
    const status = error.response?.status || 500;
    const message = error.response?.data?.error?.message || 'DeepSeek 服务请求失败，请稍后重试';
    return res.status(status >= 500 ? 502 : status).json({
      success: false,
      message
    });
  }
};

module.exports = { polishWithQwen, generateDeepSeekContent };
