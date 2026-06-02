const jwt = require('jsonwebtoken');

/**
 * JWT 认证中间件
 * 验证请求头中的 Authorization Bearer Token
 */
const authenticate = (req, res, next) => {
  try {
    // 获取 Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    // 提取 token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: '认证令牌格式错误'
      });
    }

    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 将用户信息附加到请求对象
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: '认证令牌已过期，请重新登录'
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: '无效的认证令牌'
      });
    }
    return res.status(500).json({
      success: false,
      message: '认证过程发生错误'
    });
  }
};

/**
 * 可选认证中间件
 * 如果提供了 token 则验证，否则继续
 */
const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
      }
    }
    next();
  } catch (error) {
    // 即使 token 无效也继续，只是不设置 req.user
    next();
  }
};

/**
 * 角色授权中间件
 * @param  {...string} roles - 允许的角色列表
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: '请先登录'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: '您没有权限执行此操作'
      });
    }

    next();
  };
};

/**
 * 检查是否为管理员
 */
const isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: '需要管理员权限'
    });
  }
  next();
};

/**
 * 检查是否为教师或管理员
 */
const isTeacherOrAdmin = (req, res, next) => {
  if (!req.user || !['teacher', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: '需要教师或管理员权限'
    });
  }
  next();
};

module.exports = {
  authenticate,
  optionalAuth,
  authorize,
  isAdmin,
  isTeacherOrAdmin
};
