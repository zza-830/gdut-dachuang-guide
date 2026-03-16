/**
 * 全局错误处理中间件
 */

/**
 * 404 Not Found 处理
 */
const notFound = (req, res, next) => {
  const error = new Error(`未找到路由: ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

/**
 * 全局错误处理器
 */
const errorHandler = (err, req, res, next) => {
  // 默认状态码
  let statusCode = err.statusCode || 500;
  let message = err.message || '服务器内部错误';

  // 开发环境下输出错误堆栈
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // MySQL 错误处理
  if (err.code) {
    switch (err.code) {
      case 'ER_DUP_ENTRY':
        statusCode = 409;
        message = '数据已存在，请勿重复提交';
        break;
      case 'ER_NO_REFERENCED_ROW_2':
        statusCode = 400;
        message = '关联数据不存在';
        break;
      case 'ER_DATA_TOO_LONG':
        statusCode = 400;
        message = '数据长度超出限制';
        break;
      case 'ECONNREFUSED':
        statusCode = 503;
        message = '数据库连接失败';
        break;
      default:
        if (err.code.startsWith('ER_')) {
          statusCode = 400;
          message = '数据库操作错误';
        }
    }
  }

  // Multer 文件上传错误
  if (err.code === 'LIMIT_FILE_SIZE') {
    statusCode = 400;
    message = '文件大小超出限制';
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    statusCode = 400;
    message = '不支持的文件字段';
  }

  // 验证错误
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = err.message;
  }

  // 返回错误响应
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      code: err.code
    })
  });
};

/**
 * 异步处理器包装函数
 * 用于捕获异步路由中的错误
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 创建自定义错误
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  notFound,
  errorHandler,
  asyncHandler,
  AppError
};
