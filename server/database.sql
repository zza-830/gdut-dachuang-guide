-- =====================================================
-- GDUT 大创平台数据库模式
-- Database Schema for GDUT Innovation Platform
-- =====================================================

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS gdut_dachuang
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE gdut_dachuang;

-- =====================================================
-- 表 1: users (用户表 - 认证与权限)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_id VARCHAR(20) UNIQUE DEFAULT NULL COMMENT '学号/工号 - 用于校园系统集成',
  username VARCHAR(50) UNIQUE DEFAULT NULL COMMENT '自定义用户名 - 用于非学号登录',
  password VARCHAR(255) NOT NULL COMMENT '加密后的密码',
  name VARCHAR(50) NOT NULL COMMENT '真实姓名',
  email VARCHAR(100) DEFAULT NULL COMMENT '邮箱地址',
  phone VARCHAR(20) DEFAULT NULL COMMENT '联系电话',
  role ENUM('student', 'teacher', 'admin') DEFAULT 'student' COMMENT '用户角色',
  avatar VARCHAR(255) DEFAULT NULL COMMENT '头像路径',
  department VARCHAR(100) DEFAULT NULL COMMENT '学院/部门',
  major VARCHAR(100) DEFAULT NULL COMMENT '专业',
  grade VARCHAR(20) DEFAULT NULL COMMENT '年级',
  is_active TINYINT(1) DEFAULT 1 COMMENT '账户是否激活',
  last_login TIMESTAMP NULL COMMENT '最后登录时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  INDEX idx_student_id (student_id),
  INDEX idx_username (username),
  INDEX idx_role (role),
  INDEX idx_department (department)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- =====================================================
-- 表 2: projects (项目表 - 项目管理)
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL COMMENT '项目负责人ID',
  title VARCHAR(200) NOT NULL COMMENT '项目名称',
  project_type ENUM('national', 'provincial', 'school') DEFAULT 'school' COMMENT '项目级别',
  status ENUM('draft', 'pending', 'approved', 'in_progress', 'midterm', 'concluded', 'rejected') DEFAULT 'draft' COMMENT '项目状态',
  progress INT DEFAULT 0 COMMENT '项目进度百分比 (0-100)',
  description TEXT COMMENT '项目简介',
  research_field VARCHAR(100) DEFAULT NULL COMMENT '研究领域',
  keywords VARCHAR(255) DEFAULT NULL COMMENT '关键词',
  start_date DATE DEFAULT NULL COMMENT '项目开始日期',
  end_date DATE DEFAULT NULL COMMENT '项目结束日期',
  budget DECIMAL(10, 2) DEFAULT 0.00 COMMENT '项目预算',
  spent_budget DECIMAL(10, 2) DEFAULT 0.00 COMMENT '已使用预算',
  teacher_id INT DEFAULT NULL COMMENT '指导教师ID',
  team_members TEXT COMMENT '团队成员JSON数组',
  application_data JSON COMMENT '申请表数据',
  midterm_data JSON COMMENT '中期报告数据',
  conclusion_data JSON COMMENT '结题报告数据',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_project_type (project_type),
  INDEX idx_teacher_id (teacher_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='项目表';

-- =====================================================
-- 表 3: files (文件表 - 档案管理)
-- =====================================================
CREATE TABLE IF NOT EXISTS files (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL COMMENT '所属项目ID',
  user_id INT NOT NULL COMMENT '上传者ID',
  filename VARCHAR(255) NOT NULL COMMENT '原始文件名',
  filepath VARCHAR(500) NOT NULL COMMENT '存储路径',
  file_type ENUM('application', 'midterm', 'conclusion', 'reimbursement', 'attachment', 'other') DEFAULT 'other' COMMENT '文件类型',
  file_size INT DEFAULT 0 COMMENT '文件大小(字节)',
  mime_type VARCHAR(100) DEFAULT NULL COMMENT 'MIME类型',
  description VARCHAR(255) DEFAULT NULL COMMENT '文件描述',
  is_public TINYINT(1) DEFAULT 0 COMMENT '是否公开',
  download_count INT DEFAULT 0 COMMENT '下载次数',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_project_id (project_id),
  INDEX idx_user_id (user_id),
  INDEX idx_file_type (file_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文件表';

-- =====================================================
-- 表 4: audit_logs (审计日志表 - 系统历史)
-- =====================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT DEFAULT NULL COMMENT '操作用户ID',
  user_name VARCHAR(50) DEFAULT NULL COMMENT '操作用户姓名(冗余存储)',
  action VARCHAR(100) NOT NULL COMMENT '操作类型',
  entity_type VARCHAR(50) DEFAULT NULL COMMENT '实体类型 (user, project, file等)',
  entity_id INT DEFAULT NULL COMMENT '实体ID',
  details TEXT COMMENT '操作详情',
  ip_address VARCHAR(45) DEFAULT NULL COMMENT 'IP地址',
  user_agent VARCHAR(255) DEFAULT NULL COMMENT '用户代理',
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '操作时间',
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_action (action),
  INDEX idx_entity (entity_type, entity_id),
  INDEX idx_timestamp (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审计日志表';

-- =====================================================
-- 表 5: reimbursements (报销记录表)
-- =====================================================
CREATE TABLE IF NOT EXISTS reimbursements (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL COMMENT '所属项目ID',
  user_id INT NOT NULL COMMENT '申请人ID',
  amount DECIMAL(10, 2) NOT NULL COMMENT '报销金额',
  category ENUM('material', 'travel', 'service', 'equipment', 'other') DEFAULT 'other' COMMENT '报销类别',
  description TEXT COMMENT '报销说明',
  status ENUM('pending', 'approved', 'rejected', 'paid') DEFAULT 'pending' COMMENT '报销状态',
  receipt_files JSON COMMENT '票据文件路径数组',
  reviewer_id INT DEFAULT NULL COMMENT '审核人ID',
  review_comment TEXT COMMENT '审核意见',
  reviewed_at TIMESTAMP NULL COMMENT '审核时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_project_id (project_id),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='报销记录表';

-- =====================================================
-- 表 6: expenses (支出记录表 - 经费管理)
-- =====================================================
CREATE TABLE IF NOT EXISTS expenses (
  id INT PRIMARY KEY AUTO_INCREMENT,
  project_id INT NOT NULL COMMENT '所属项目ID',
  item_name VARCHAR(200) NOT NULL COMMENT '支出项目名称',
  amount DECIMAL(10, 2) NOT NULL COMMENT '支出金额',
  expense_date DATE NOT NULL COMMENT '支出日期',
  location VARCHAR(200) DEFAULT NULL COMMENT '支出地点',
  invoice_path VARCHAR(500) DEFAULT NULL COMMENT '发票文件路径',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',

  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  INDEX idx_project_id (project_id),
  INDEX idx_expense_date (expense_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支出记录表';

-- =====================================================
-- 插入默认管理员账户 (密码: admin123, 需要在应用中使用bcrypt加密)
-- =====================================================
INSERT INTO users (student_id, username, password, name, role) 
VALUES ('000000', 'test123', '$2b$10$.SoPwAhK2r2yoFKsJffsFuvwmedIfPw87V.mmTtLb9FXhJuGF14xK', '超级管理员', 'admin')
ON DUPLICATE KEY UPDATE role = 'admin', name = '超级管理员';

-- =====================================================
-- 视图: 项目概览视图
-- =====================================================
CREATE OR REPLACE VIEW v_project_overview AS
SELECT 
  p.id,
  p.title,
  p.status,
  p.progress,
  p.project_type,
  p.created_at,
  u.name AS owner_name,
  u.student_id AS owner_student_id,
  t.name AS teacher_name,
  (SELECT COUNT(*) FROM files f WHERE f.project_id = p.id) AS file_count,
  (SELECT COALESCE(SUM(r.amount), 0) FROM reimbursements r WHERE r.project_id = p.id AND r.status = 'paid') AS total_reimbursed
FROM projects p
LEFT JOIN users u ON p.user_id = u.id
LEFT JOIN users t ON p.teacher_id = t.id;

-- =====================================================
-- 完成提示
-- =====================================================
-- 数据库模式创建完成！
-- 请确保在 .env 文件中配置正确的数据库连接信息
