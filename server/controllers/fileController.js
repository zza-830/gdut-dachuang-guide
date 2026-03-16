const path = require('path');
const fs = require('fs');
const { query } = require('../config/db');
const { logAudit } = require('../utils/auditLog');

/**
 * 上传项目文件
 * POST /api/files/:projectId/upload
 */
const uploadFile = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { category } = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({ success: false, message: '请选择要上传的文件' });
    }

    // Fix Multer UTF-8 filename encoding (latin1 → utf8)
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');

    // 确定 file_type 映射
    let fileType = 'other';
    if (category === '专利文件') fileType = 'attachment';
    else if (category === '申报文档') fileType = 'application';
    else if (category === '其他资料') fileType = 'other';

    const filepath = `/uploads/projects/${file.filename}`;

    const result = await query(
      `INSERT INTO files (project_id, user_id, filename, filepath, file_type, file_size, mime_type, description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [projectId, req.user.id, originalName, filepath, fileType, file.size, file.mimetype, category || '未分类']
    );

    // Fire and forget — don't block the response
    logAudit({
      userId: req.user.id,
      action: 'upload_file',
      entityType: 'project',
      entityId: projectId,
      details: { filename: originalName, file_id: result.insertId, project_id: parseInt(projectId), category: category || '未分类' }
    }).catch(err => console.error('[AuditLog] upload_file failed:', err.message));

    res.status(201).json({
      success: true,
      message: '文件上传成功',
      data: {
        id: result.insertId,
        filename: originalName,
        filepath,
        file_size: file.size,
        mime_type: file.mimetype,
        category: category || '未分类',
        uploaded_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({ success: false, message: '文件上传失败' });
  }
};

/**
 * 获取项目文件列表
 * GET /api/files/:projectId
 */
const getProjectFiles = async (req, res) => {
  try {
    const { projectId } = req.params;

    const files = await query(
      `SELECT f.id, f.filename, f.filepath, f.file_type, f.file_size, f.mime_type,
              f.description AS category, f.download_count, f.uploaded_at,
              u.name AS uploader_name
       FROM files f
       LEFT JOIN users u ON f.user_id = u.id
       WHERE f.project_id = ?
       ORDER BY f.uploaded_at DESC`,
      [projectId]
    );

    res.json({ success: true, data: files });
  } catch (error) {
    console.error('Get project files error:', error);
    res.status(500).json({ success: false, message: '获取文件列表失败' });
  }
};

/**
 * 下载文件
 * GET /api/files/download/:fileId
 */
const downloadFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const [file] = await query('SELECT * FROM files WHERE id = ?', [fileId]);
    if (!file) {
      return res.status(404).json({ success: false, message: '文件不存在' });
    }

    // 增加下载计数
    await query('UPDATE files SET download_count = download_count + 1 WHERE id = ?', [fileId]);

    // Fire and forget
    logAudit({
      userId: req.user.id,
      action: 'download_file',
      entityType: 'project',
      entityId: file.project_id,
      details: { filename: file.filename, file_id: parseInt(fileId), project_id: parseInt(file.project_id) }
    }).catch(err => console.error('[AuditLog] download_file failed:', err.message));

    const absolutePath = path.join(__dirname, '..', file.filepath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ success: false, message: '文件不存在于服务器' });
    }

    res.download(absolutePath, file.filename);
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ success: false, message: '文件下载失败' });
  }
};

/**
 * 删除文件
 * DELETE /api/files/:fileId
 */
const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const [file] = await query('SELECT * FROM files WHERE id = ?', [fileId]);
    if (!file) {
      return res.status(404).json({ success: false, message: '文件不存在' });
    }

    // 删除物理文件
    const absolutePath = path.join(__dirname, '..', file.filepath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    // 删除数据库记录
    await query('DELETE FROM files WHERE id = ?', [fileId]);

    // Fire and forget
    logAudit({
      userId: req.user.id,
      action: 'delete_file',
      entityType: 'project',
      entityId: file.project_id,
      details: { filename: file.filename, file_id: parseInt(fileId), project_id: parseInt(file.project_id) }
    }).catch(err => console.error('[AuditLog] delete_file failed:', err.message));

    res.json({ success: true, message: '文件已删除' });
  } catch (error) {
    console.error('Delete file error:', error);
    res.status(500).json({ success: false, message: '文件删除失败' });
  }
};

/**
 * 重命名文件
 * PUT /api/files/:fileId/rename
 */
const renameFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    const { filename } = req.body;

    if (!filename || !filename.trim()) {
      return res.status(400).json({ success: false, message: '文件名不能为空' });
    }

    const [file] = await query('SELECT * FROM files WHERE id = ?', [fileId]);
    if (!file) {
      return res.status(404).json({ success: false, message: '文件不存在' });
    }

    // 保留原始后缀名，只替换文件名部分
    const oldExt = path.extname(file.filename);
    const newName = filename.trim();
    const newExt = path.extname(newName);
    // 如果用户输入的名称已包含正确后缀则直接使用，否则追加原后缀
    const finalName = newExt ? newName : `${newName}${oldExt}`;

    await query('UPDATE files SET filename = ? WHERE id = ?', [finalName, fileId]);

    // Fire and forget
    logAudit({
      userId: req.user.id,
      action: 'rename_file',
      entityType: 'project',
      entityId: file.project_id,
      details: { file_id: parseInt(fileId), old_name: file.filename, new_name: finalName, project_id: parseInt(file.project_id) }
    }).catch(err => console.error('[AuditLog] rename_file failed:', err.message));

    res.json({ success: true, message: '文件重命名成功', data: { id: parseInt(fileId), filename: finalName } });
  } catch (error) {
    console.error('Rename file error:', error);
    res.status(500).json({ success: false, message: '文件重命名失败' });
  }
};

module.exports = { uploadFile, getProjectFiles, downloadFile, deleteFile, renameFile };
