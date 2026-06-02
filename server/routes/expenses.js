// Routes: GET /:projectId, POST /:projectId, PUT /:expenseId, DELETE /:expenseId
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { addExpense, getExpenses, updateExpense, deleteExpense } = require('../controllers/expenseController');

// 确保发票上传目录存在
const invoiceDir = path.join(__dirname, '..', 'uploads', 'invoices');
if (!fs.existsSync(invoiceDir)) {
  fs.mkdirSync(invoiceDir, { recursive: true });
}

// Multer 配置 - 发票文件
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, invoiceDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    // 兼容 POST /:projectId 和 PUT /:expenseId 两种路由
    const idPart = req.params.projectId || req.params.expenseId || 'unknown';
    cb(null, `invoice_${idPart}_${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|jpg|jpeg|png|gif|webp/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    if (allowed.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('发票仅支持 PDF 或图片格式'));
    }
  }
});

// 获取项目支出列表及汇总
router.get('/:projectId', authenticate, getExpenses);

// 添加支出记录（含发票上传）
router.post('/:projectId', authenticate, (req, res, next) => {
  upload.single('invoice')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: '发票文件不能超过 10MB' });
      }
      return res.status(400).json({ success: false, message: `文件上传错误: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message || '文件上传失败' });
    }
    next();
  });
}, addExpense);

// 更新支出记录（含发票上传）
router.put('/:expenseId', authenticate, (req, res, next) => {
  upload.single('invoice')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: '发票文件不能超过 10MB' });
      }
      return res.status(400).json({ success: false, message: `文件上传错误: ${err.message}` });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message || '文件上传失败' });
    }
    next();
  });
}, updateExpense);

// 删除支出记录
router.delete('/:expenseId', authenticate, deleteExpense);

module.exports = router;
