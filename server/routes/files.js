const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { uploadFile, getProjectFiles, downloadFile, deleteFile, renameFile } = require('../controllers/fileController');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '..', 'uploads', 'projects');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer 配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}_${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `project_${req.params.projectId}_${uniqueSuffix}${ext}`);
  }
});

// 危险文件后缀黑名单 - 可执行文件一律拦截
const DANGEROUS_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.php', '.py', '.rb', '.pl', '.sh', '.bash', '.zsh',
  '.bat', '.cmd', '.ps1', '.psm1',
  '.exe', '.dll', '.so', '.dylib', '.bin', '.com', '.msi',
  '.jar', '.class', '.war',
  '.asp', '.aspx', '.jsp', '.cgi',
  '.htaccess', '.htpasswd',
  '.svg'  // SVG 可内嵌脚本，存在 XSS 风险
]);

// 安全文件后缀白名单
const ALLOWED_EXTENSIONS = new Set([
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  '.jpg', '.jpeg', '.png', '.gif', '.webp',
  '.zip', '.rar', '.7z',
  '.txt', '.csv'
]);

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB - 防止恶意大文件上传
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();

    // 1. 先检查黑名单 - 危险文件直接拦截
    if (DANGEROUS_EXTENSIONS.has(ext)) {
      return cb(new Error(`禁止上传可执行或脚本文件 (${ext})`));
    }

    // 2. 再检查白名单 - 只允许已知安全类型
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return cb(new Error(`不支持的文件类型 (${ext})，允许: pdf, doc(x), xls(x), ppt(x), jpg, png, gif, webp, zip, rar, 7z, txt, csv`));
    }

    cb(null, true);
  }
});

// 下载文件 (must be before /:projectId to avoid route conflict)
router.get('/download/:fileId', authenticate, downloadFile);

// 获取项目文件列表
router.get('/:projectId', authenticate, getProjectFiles);

// 上传文件到项目 (含 multer 错误处理)
router.post('/:projectId/upload', authenticate, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      // Multer 文件大小超限
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: '文件大小超过限制（最大 10MB）'
        });
      }
      // 文件类型校验失败或其他 multer 错误
      return res.status(400).json({
        success: false,
        message: err.message || '文件上传失败'
      });
    }
    next();
  });
}, uploadFile);

// 重命名文件
router.put('/:fileId/rename', authenticate, renameFile);

// 删除文件
router.delete('/:fileId', authenticate, deleteFile);

module.exports = router;
