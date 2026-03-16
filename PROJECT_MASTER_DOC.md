# PROJECT_MASTER_DOC — GDUT 大创指南系统

> **文档版本**: v1.0 | **生成日期**: 2026-03-06 | **适用分支**: main  
> **文档用途**: 项目全局参考 · 进度追踪 · AI 上下文恢复  
> ⚠️ 本文档从代码库自动提取，如有变更请同步更新。

---

## 目录

1. [项目全局概述 (Project Overview)](#1-项目全局概述)
2. [系统功能模块与子页面 (Modules & Pages)](#2-系统功能模块与子页面)
3. [前后端 API 路由清单 (API & Routing)](#3-前后端-api-路由清单)
4. [数据库核心设计 (Database Schema)](#4-数据库核心设计)
5. [核心业务逻辑与代码约定 (Business Logic & Conventions)](#5-核心业务逻辑与代码约定)
6. [当前开发进度与待办事项 (Current Progress & TODOs)](#6-当前开发进度与待办事项)

---

## 1. 项目全局概述

### 1.1 项目名称与业务背景

**GDUT 大创指南系统**（广东工业大学大学生创新创业训练计划指南平台）

本系统是面向广东工业大学在校学生的大创项目全生命周期管理平台，涵盖：
- 📋 **立项指导**：提供完整的大创申报流程引导（准备→申请→中期→结题）
- 📁 **项目管理**：在线管理项目团队、经费、文件、进度
- 🏆 **竞赛信息**：维护全校学科竞赛数据库，自动动态计算赛事状态
- 🤖 **AI 辅助**：集成通义千问（Qwen）和 DeepSeek，辅助填写申请书、中期报告、结题报告
- 💰 **报销管理**：记录项目支出，管理发票文件
- 🔍 **操作审计**：全系统操作留痕，支持日志查询

---

### 1.2 核心技术栈

#### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| **React** | ^19.2.0 | 核心 UI 框架 |
| **Vite** | ^7.2.4 | 构建工具 & 开发服务器 |
| **React Router DOM** | ^7.11.0 | 客户端路由 |
| **React Bootstrap** | ^2.10.10 | UI 组件库 |
| **Bootstrap** | ^5.3.8 | CSS 样式框架 |
| **Axios** | ^1.13.5 | HTTP 客户端 |
| **React Icons** | ^5.5.0 | 图标库（FA 系列） |
| **React Markdown** | ^10.1.0 | Markdown 渲染 |
| **Chart.js / react-chartjs-2** | ^4.5.1 / ^5.3.1 | 数据图表 |
| **docx** | ^9.5.1 | Word 文件生成（导出申请书） |
| **file-saver** | ^2.0.5 | 浏览器文件下载 |
| **reactflow** | ^11.11.4 | 流程图渲染（大创流程地图） |
| **Fuse.js** | ^7.1.0 | 模糊搜索 |
| **react-beautiful-dnd** | ^13.1.1 | 拖拽排序 |

#### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| **Node.js** | - | 运行时 |
| **Express** | ^5.2.1 | Web 框架 |
| **MySQL2** | ^3.16.3 | 数据库驱动 |
| **jsonwebtoken** | ^9.0.3 | JWT 认证 |
| **bcryptjs** | ^3.0.3 | 密码加密 |
| **multer** | ^2.0.2 | 文件上传处理 |
| **node-cron** | ^4.2.1 | 定时任务（竞赛跨年滚动） |
| **Axios** | ^1.13.5 | 代理调用 AI 接口 |
| **cors** | ^2.8.6 | 跨域控制 |
| **dotenv** | ^17.2.4 | 环境变量 |
| **nodemon** | ^3.1.11 | 开发热重载 |

#### 数据库 & 基础设施

| 技术 | 版本 | 用途 |
|------|------|------|
| **MySQL** | 8.0 | 主数据库 |
| **Docker / Docker Compose** | - | 容器化部署 |
| **Nginx** | - | 反向代理 + 前端静态文件托管 |

#### 外部 AI 服务

| 服务 | 模型 | 接入方式 | 环境变量 |
|------|------|----------|---------|
| 阿里云通义千问 | `qwen-plus` | 后端代理，KEY 存服务端 | `ALIYUN_DASHSCOPE_API_KEY` |
| DeepSeek | `deepseek-chat` | 后端代理，KEY 存服务端 | `DEEPSEEK_API_KEY` |

---

### 1.3 启动与部署命令

#### 本地开发环境

```bash
# 前提：MySQL 已启动，server/.env 已配置

# 一键启动前后端（推荐）
npm run dev
# 等价于：
#   前端: vite → http://localhost:5173
#   后端: cd server && nodemon index.js → http://localhost:5000

# 仅启动后端
cd server && npm run dev

# 仅启动前端
npm run client

# Windows 一键启动脚本
start-dev.bat
```

#### 开发环境端口

| 服务 | 端口 | 说明 |
|------|------|------|
| 前端 (Vite) | `5173` | Vite dev server，代理 `/api` → 5000 |
| 后端 (Express) | `5000` | REST API 服务 |
| MySQL | `3306` | 数据库（本地直连） |

#### 生产 Docker 部署

```bash
# 首次部署（含数据库初始化）
docker-compose --env-file .env.docker up -d --build

# 重建并更新
docker-compose --env-file .env.docker up -d --build --force-recreate

# 重置数据库（危险！）
docker-compose down -v
```

#### Docker 服务端口

| 服务 | 容器名 | 外部端口 | 说明 |
|------|--------|---------|------|
| MySQL | `dachuang_mysql` | `3307:3306` | 数据库 |
| 后端 | `dachuang_backend` | `5000:5000` | API |
| 前端 | `dachuang_frontend` | `8080:80` | Nginx + React |

#### 关键环境变量

**`server/.env`（后端）**:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=gdut_dachuang
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
NODE_ENV=development
ALIYUN_DASHSCOPE_API_KEY=sk-xxx
DEEPSEEK_API_KEY=sk-xxx
```

**`.env.development`（前端开发）**:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 2. 系统功能模块与子页面

### 2.1 页面路由总览

> 所有路由（除 `/login`）均受 `<RequireAuth>` 保护，未登录自动跳转至 `/login`。

| 路由路径 | 对应组件文件 | 页面标题 | 权限 |
|---------|-------------|---------|------|
| `/login` | `src/pages/Login.jsx` | 登录 / 注册 | 公开 |
| `/` | `src/pages/Home.jsx` | 首页 | 需登录 |
| `/guide` | `src/pages/guide/GuidePreparation.jsx` | 立项准备 | 需登录 |
| `/guide/preparation` | `src/pages/guide/GuidePreparation.jsx` | 立项准备 | 需登录 |
| `/guide/application-form` | `src/pages/guide/GuideApplicationForm.jsx` | 申请表填写指南 | 需登录 |
| `/guide/related-competitions` | `src/pages/guide/GuideRelatedCompetitions.jsx` | 相关竞赛 | 需登录 |
| `/guide/midterm` | `src/pages/guide/GuideMidterm.jsx` | 中期检查指南 | 需登录 |
| `/guide/conclusion` | `src/pages/guide/GuideConclusion.jsx` | 结题指南 | 需登录 |
| `/guide/process-map` | `src/pages/guide/ProcessGuide.jsx` | 全流程指引图 | 需登录 |
| `/competitions` | `src/pages/Competitions.jsx` | 竞赛信息 | 需登录 |
| `/competitions/:id` | `src/pages/CompetitionDetail.jsx` | 竞赛详情 | 需登录 |
| `/reimbursements` | `src/pages/Reimbursements.jsx` | 报销指南 | 需登录 |
| `/resources` | `src/pages/Resources.jsx` | 资源下载 | 需登录 |
| `/tools` | `src/pages/Tools.jsx` | 实用工具 | 需登录 |
| `/ai-creation` | `src/pages/AICreation.jsx` | AI 双创智填 | 需登录 |
| `/my-projects` | `src/pages/MyProjects.jsx` | 我的项目 | 需登录 |
| `/project/:id` | `src/pages/ProjectDashboard.jsx` | 项目工作台 | 需登录 |
| `/project/:id/edit` | `src/pages/ProjectEdit.jsx` | 项目编辑 | 需登录 |
| `/project/:id/edit/application` | `src/pages/ApplicationEditor.jsx` | 申请书编辑器 | 需登录 |
| `/project/:id/edit/midterm` | `src/pages/MidtermEditor.jsx` | 中期报告编辑器 | 需登录 |
| `/project/:id/edit/conclusion` | `src/pages/ProjectConclusion.jsx` | 结题报告编辑器 | 需登录 |
| `/project/:id/edit/final` | `src/pages/FinalEditor.jsx` | 终期报告编辑器 | 需登录 |
| `/project/:id/reimburse` | `src/pages/ProjectReimburse.jsx` | 项目报销 | 需登录 |
| `/project/:id/logs` | `src/pages/AuditLog.jsx` | 项目操作日志 | 需登录 |
| `/application-editor` | `src/pages/ApplicationEditor.jsx` | 申请书独立入口 | 需登录 |
| `/midterm-editor` | `src/pages/MidtermEditor.jsx` | 中期报告独立入口 | 需登录 |
| `/final-editor` | `src/pages/FinalEditor.jsx` | 终期报告独立入口 | 需登录 |
| `/patent-editor` | `src/pages/PatentEditor.jsx` | 专利申请辅助 | 需登录 |
| `/admin` | `src/pages/AdminDashboard.jsx` | 后台用户管理 | 需登录 + Admin |
| `/admin/competition-review` | `src/pages/CompetitionReview.jsx` | 赛事时间审核 | 需登录 + Admin |

---

### 2.2 各模块功能详情

#### 🔐 登录注册 (`/login`)

- 支持**学号 / 用户名 + 密码**登录
- 支持新用户注册（student_id, name, email, phone, department, major, grade）
- 登录后 JWT Token 存入 `localStorage('token')`，用户信息缓存至 `localStorage('auth_user')`
- 登录成功后重定向至来源页（`location.state.from`）或默认 `/`
- **AuthContext** (`src/context/AuthContext.jsx`) 全局管理认证状态，启动时后台静默验证 Token 有效性

#### 🏠 首页 (`/`)

- 欢迎界面，展示系统功能入口快捷卡片
- 组件文件：`src/pages/Home.jsx`

#### 📚 大创指南 (`/guide/*`)

侧边栏菜单「大创指南」下有三个子项，展开后显示：

| 路径 | 内容 |
|------|------|
| `/guide/process-map` | 全流程指引（ReactFlow 流程图，可视化大创全周期） |
| `/guide/preparation` | 立项准备（资格、选题、团队、材料清单） |
| `/guide/application-form` | 申请表填写指南（逐字段说明） |
| `/guide/related-competitions` | 相关竞赛（调用 `/api/guide-competitions` 展示可关联的竞赛） |
| `/guide/midterm` | 中期检查指南 |
| `/guide/conclusion` | 结题指南 |

#### 🏆 竞赛信息 (`/competitions`)

- 竞赛列表页：分类侧边栏（5 大类）+ 搜索框 + 分页表格
- 竞赛状态实时计算（不存储于 DB，由 SQL CASE 表达式动态生成）
- 状态徽章颜色：进行中（绿）、未开始（蓝）、已结束（灰）
- `/competitions/:id`：竞赛详情（Markdown 渲染、官网链接、参赛方式）
- `/admin/competition-review`（Admin）：赛事时间核对界面（针对定时任务自动滚动后的 `needs_review=1` 记录）

#### 📁 我的项目 (`/my-projects`)

- 卡片式项目列表，每张卡片显示项目名称、角色（队长/成员）、状态徽章
- **编辑模式**：点击「编辑」按钮进入，卡片名称变为 inline input，失焦/回车自动调用 `PATCH /api/projects/:id/name`
- **新建项目**：点击「新建」卡片弹窗，填写名称（必填）、项目时间（必填）、描述、负责人、电话
- **删除项目**：编辑模式下卡片右上角出现红色 ✕ 按钮，确认后调用 `DELETE /api/projects/:id`

#### 🗂️ 项目工作台 (`/project/:id`)

- 项目总览：成员列表、经费概览、进度展示
- 子功能入口：申请书、中期报告、结题报告、文件管理、经费记录、操作日志

#### ✍️ 文档编辑器系列

各编辑器均集成 **AI 辅助润色**（`AIField` / `AISection` 组件），点击 AI 按钮调用 `src/services/aiService.js` → 后端 `/api/ai/qwen`

| 编辑器 | 路径 | 数据字段 |
|--------|------|---------|
| 申请书编辑器 | `/project/:id/edit/application` | `projects.application_data` (JSON) |
| 中期报告编辑器 | `/project/:id/edit/midterm` | `projects.midterm_data` (JSON) |
| 结题报告编辑器 | `/project/:id/edit/conclusion` | `projects.conclusion_data` (JSON) |
| 终期报告编辑器 | `/project/:id/edit/final` | 独立 JSON 字段 |
| 专利申请辅助 | `/patent-editor` | 本地状态（不持久化到 DB） |

所有编辑器支持**导出为 Word（.docx）**（`src/utils/exportToWord.js`，使用 `docx` + `file-saver` 库）

#### 🤖 AI 双创智填 (`/ai-creation`)

- 独立 AI 创作页面，用户输入草稿 → 选择文档类型 → AI 生成优化内容
- 支持通义千问（Qwen）和 DeepSeek 两种模型
- 系统 Prompt 从 `src/data/applicationPrompts.js` 和 `src/data/reportPrompts.js` 按字段类型动态选取

#### 💰 经费与报销 (`/project/:id/reimburse`)

- 支出记录 CRUD（支持上传发票附件，PDF/图片）
- 文件上传至 `server/uploads/invoices/`，最大 10MB
- 组件 `src/components/ExpenseModal.jsx` 处理新增/编辑弹窗

#### 🛡️ 后台管理 (`/admin`)

- 查看所有注册用户列表（含角色、学号、注册时间）
- 删除指定用户（仅 Admin 可操作）
- 进入入口：侧边栏底部（仅当 `user.role === 'admin'` 时显示）

#### 📋 审计日志 (`/project/:id/logs`)

- 查看指定项目的所有操作记录（create_project、add_member、update_funding、rename_project 等）
- Admin 可批量删除或清空项目日志

---

## 3. 前后端 API 路由清单

### 3.1 API 基础规范

- **Base URL（开发）**: `http://localhost:5000/api`
- **Base URL（生产）**: `/api`（Nginx 反代）
- **认证方式**: `Authorization: Bearer <JWT_TOKEN>`
- **Token 存储**: `localStorage('token')`
- **请求超时**: 30 秒（Axios 配置）
- **文件上传上限**: 10MB（一般文件）/ 2MB（头像）

### 3.2 完整 API 接口树

#### 🔑 认证模块 `/api/auth`

| 方法 | 路径 | 权限 | 功能描述 |
|------|------|------|---------|
| `POST` | `/auth/register` | 公开 | 用户注册（student_id, password, name, email 等） |
| `POST` | `/auth/login` | 公开 | 用户登录，返回 `{ user, token }` |
| `GET` | `/auth/profile` | 需登录 | 获取当前用户信息（含 Token 验证刷新） |
| `PUT` | `/auth/profile` | 需登录 | 更新用户资料（name, email, phone, department 等） |
| `PUT` | `/auth/password` | 需登录 | 修改密码 |
| `POST` | `/auth/avatar` | 需登录 | 上传头像（multipart/form-data, 最大 2MB） |

#### 📁 项目模块 `/api/projects`

| 方法 | 路径 | 权限 | 功能描述 |
|------|------|------|---------|
| `GET` | `/projects` | 需登录 | 获取当前用户的项目列表 |
| `POST` | `/projects` | 需登录 | 创建新项目（title, duration, description） |
| `GET` | `/projects/:id` | 需登录 | 获取单个项目详情（含动态刷新成员姓名） |
| `PATCH` | `/projects/:id/funding` | 需登录 | 更新项目经费总额（0 ~ 20000 元） |
| `PATCH` | `/projects/:id/team` | 需登录 | 更新团队成员 JSON，自动记录增减日志 |
| `PATCH` | `/projects/:id/name` | 需登录 | 重命名项目（仅项目 owner 可操作） |
| `DELETE` | `/projects/:id` | 需登录 | 删除项目（仅项目 owner 可操作） |

#### 💰 经费模块 `/api/expenses`

| 方法 | 路径 | 权限 | 功能描述 |
|------|------|------|---------|
| `GET` | `/expenses/:projectId` | 需登录 | 获取项目支出列表及汇总 |
| `POST` | `/expenses/:projectId` | 需登录 | 新增支出记录（含发票文件上传） |
| `PUT` | `/expenses/:expenseId` | 需登录 | 更新支出记录（含发票替换） |
| `DELETE` | `/expenses/:expenseId` | 需登录 | 删除支出记录 |

#### 📄 文件模块 `/api/files`

| 方法 | 路径 | 权限 | 功能描述 |
|------|------|------|---------|
| `GET` | `/files/:projectId` | 需登录 | 获取项目文件列表 |
| `POST` | `/files/:projectId/upload` | 需登录 | 上传文件（白名单: pdf/doc/docx/xls/xlsx/ppt/pptx/jpg/png/gif/webp/zip/rar/7z/txt/csv） |
| `GET` | `/files/download/:fileId` | 需登录 | 下载文件 |
| `PUT` | `/files/:fileId/rename` | 需登录 | 重命名文件 |
| `DELETE` | `/files/:fileId` | 需登录 | 删除文件 |

> 安全机制：黑名单拒绝 `.js/.py/.sh/.exe/.php/.svg` 等可执行文件；白名单仅允许已知安全格式。

#### 🏆 竞赛模块 `/api/competitions`

| 方法 | 路径 | 权限 | 功能描述 |
|------|------|------|---------|
| `GET` | `/competitions` | 公开 | 竞赛列表（支持 `category`/`level`/`status`/`search` 参数过滤，返回动态状态） |
| `GET` | `/competitions/:id` | 公开 | 竞赛详情（含动态状态） |
| `GET` | `/competitions/review/list` | Admin | 获取 `needs_review=1` 的待审核竞赛列表 |
| `PUT` | `/competitions/:id/review` | Admin | 提交时间核对（更新 start_time/end_time，清零 needs_review） |

#### 📚 指南竞赛模块 `/api/guide-competitions`

| 方法 | 路径 | 权限 | 功能描述 |
|------|------|------|---------|
| `GET` | `/guide-competitions` | 需登录 | 获取指南页相关竞赛列表 |
| `GET` | `/guide-competitions/:id` | 需登录 | 获取指南竞赛详情 |

#### 🤖 AI 模块 `/api/ai`

| 方法 | 路径 | 权限 | 功能描述 |
|------|------|------|---------|
| `POST` | `/ai/qwen` | 需登录 | 通义千问文本润色（Body: `{ text, sectionKey, systemPrompt }`） |
| `POST` | `/ai/deepseek` | 需登录 | DeepSeek 内容生成（Body: `{ text, systemPrompt }`） |

> AI Key 安全机制：`ALIYUN_DASHSCOPE_API_KEY` 和 `DEEPSEEK_API_KEY` 仅存于后端 `server/.env`，前端零接触。

#### 🛡️ 管理员模块 `/api/admin`

| 方法 | 路径 | 权限 | 功能描述 |
|------|------|------|---------|
| `GET` | `/admin/users` | Admin | 获取所有用户列表 |
| `DELETE` | `/admin/users/:id` | Admin | 删除指定用户 |

#### 📋 审计日志模块 `/api/logs`

| 方法 | 路径 | 权限 | 功能描述 |
|------|------|------|---------|
| `GET` | `/logs/:projectId` | 需登录 | 获取指定项目的操作日志 |
| `POST` | `/logs` | 需登录 | 手动创建日志条目 |
| `DELETE` | `/logs/batch` | Admin | 批量删除日志 |
| `DELETE` | `/logs/clear/:projectId` | Admin | 清空项目所有日志 |
| `DELETE` | `/logs/:id` | Admin | 删除单条日志 |

#### 🏥 健康检查

| 方法 | 路径 | 权限 | 功能描述 |
|------|------|------|---------|
| `GET` | `/health` | 公开 | 后端健康检查，返回 `{ status: "ok" }` |

---

### 3.3 前端 Axios 配置 (`src/services/api.js`)

```js
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',  // 生产：相对路径（Nginx 反代）
  timeout: 30000
});

// 请求拦截器：自动将 localStorage('token') 附加到 Authorization 头
// 响应拦截器：非 auth 接口的 401，自动清除 token（RequireAuth 检测到 user=null 后自动跳转 /login）
```

---

## 4. 数据库核心设计

### 4.1 数据库概览

- **数据库名称**: `gdut_dachuang`
- **字符集**: `utf8mb4 / utf8mb4_unicode_ci`
- **初始化脚本**: `server/database.sql`（主库）+ `server/migrations/seed_competitions.sql`（竞赛表）
- **Docker 自动初始化**: `mysql-init/` 目录下的 SQL 在 mysql:8.0 容器首次启动时自动执行

---

### 4.2 数据表详情

#### 表 1: `users` — 用户表

```sql
CREATE TABLE users (
  id          INT          PRIMARY KEY AUTO_INCREMENT,
  student_id  VARCHAR(20)  UNIQUE COMMENT '学号/工号',
  username    VARCHAR(50)  UNIQUE COMMENT '自定义用户名',
  password    VARCHAR(255) NOT NULL COMMENT 'bcrypt 加密密码',
  name        VARCHAR(50)  NOT NULL COMMENT '真实姓名',
  email       VARCHAR(100) COMMENT '邮箱',
  phone       VARCHAR(20)  COMMENT '联系电话',
  role        ENUM('student','teacher','admin') DEFAULT 'student',
  avatar      VARCHAR(255) COMMENT '头像路径',
  department  VARCHAR(100) COMMENT '学院/部门',
  major       VARCHAR(100) COMMENT '专业',
  grade       VARCHAR(20)  COMMENT '年级',
  is_active   TINYINT(1)   DEFAULT 1,
  last_login  TIMESTAMP    NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**默认管理员账户**（初始化脚本内置）:
- student_id: `000000`，username: `test123`，password: `admin123`，role: `admin`

---

#### 表 2: `projects` — 项目表

```sql
CREATE TABLE projects (
  id              INT      PRIMARY KEY AUTO_INCREMENT,
  user_id         INT      NOT NULL REFERENCES users(id),  -- 项目负责人
  title           VARCHAR(200) NOT NULL,                   -- 项目名称
  project_type    ENUM('national','provincial','school') DEFAULT 'school',
  status          ENUM('draft','pending','approved','in_progress','midterm','concluded','rejected') DEFAULT 'draft',
  progress        INT DEFAULT 0,                           -- 0-100%
  description     TEXT,
  budget          DECIMAL(10,2) DEFAULT 0.00,              -- 项目总经费
  spent_budget    DECIMAL(10,2) DEFAULT 0.00,              -- 已使用经费
  teacher_id      INT REFERENCES users(id),                -- 指导教师
  team_members    TEXT,                                    -- JSON 数组（见下）
  application_data JSON,                                   -- 申请书表单数据
  midterm_data    JSON,                                    -- 中期报告数据
  conclusion_data JSON,                                    -- 结题报告数据
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**`team_members` JSON 结构**（每个成员对象）:
```json
{
  "id": 1,
  "name": "张三",
  "role": "captain",
  "studentId": "2021123456",
  "email": "zhangsan@example.com",
  "phone": "13812345678",
  "className": "",
  "lab": ""
}
```

**前端状态映射**（`getProjects` 控制器中）:
```
DB status       → 前端 status
draft / pending / rejected → 'pending'（待审核，黄色）
approved / in_progress / midterm → 'active'（进行中，蓝色）
concluded → 'completed'（已结题，绿色）
```

---

#### 表 3: `files` — 文件表

```sql
CREATE TABLE files (
  id           INT         PRIMARY KEY AUTO_INCREMENT,
  project_id   INT         NOT NULL REFERENCES projects(id),
  user_id      INT         NOT NULL REFERENCES users(id),
  filename     VARCHAR(255) NOT NULL,                     -- 原始文件名
  filepath     VARCHAR(500) NOT NULL,                     -- 存储相对路径
  file_type    ENUM('application','midterm','conclusion','reimbursement','attachment','other'),
  file_size    INT DEFAULT 0,                             -- 字节数
  mime_type    VARCHAR(100),
  is_public    TINYINT(1) DEFAULT 0,
  download_count INT DEFAULT 0,
  uploaded_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

> 物理存储路径：`server/uploads/projects/project_{projectId}_{timestamp}_{random}{ext}`

---

#### 表 4: `audit_logs` — 审计日志表

```sql
CREATE TABLE audit_logs (
  id          INT         PRIMARY KEY AUTO_INCREMENT,
  user_id     INT         REFERENCES users(id),
  user_name   VARCHAR(50) COMMENT '冗余存储-防止用户删除后丢失姓名',
  action      VARCHAR(100) NOT NULL,   -- 操作类型（见下）
  entity_type VARCHAR(50),             -- 'project' / 'user' / 'file'
  entity_id   INT,
  details     TEXT,                    -- JSON 字符串，存具体变更数据
  ip_address  VARCHAR(45),
  user_agent  VARCHAR(255),
  timestamp   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**`action` 枚举值**（`server/utils/auditLog.js` 中记录）:

| action | 触发时机 |
|--------|---------|
| `create_project` | 创建项目 |
| `rename_project` | 重命名项目（含旧名/新名） |
| `update_funding` | 修改经费（含旧值/新值） |
| `add_member` | 新增团队成员 |
| `remove_member` | 移除团队成员 |
| `update_team` | 团队无增减但信息变化 |

---

#### 表 5: `reimbursements` — 报销记录表

```sql
CREATE TABLE reimbursements (
  id              INT         PRIMARY KEY AUTO_INCREMENT,
  project_id      INT         NOT NULL REFERENCES projects(id),
  user_id         INT         NOT NULL REFERENCES users(id),
  amount          DECIMAL(10,2) NOT NULL,
  category        ENUM('material','travel','service','equipment','other'),
  description     TEXT,
  status          ENUM('pending','approved','rejected','paid') DEFAULT 'pending',
  receipt_files   JSON,
  reviewer_id     INT         REFERENCES users(id),
  review_comment  TEXT,
  reviewed_at     TIMESTAMP NULL,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

#### 表 6: `expenses` — 支出记录表

```sql
CREATE TABLE expenses (
  id           INT         PRIMARY KEY AUTO_INCREMENT,
  project_id   INT         NOT NULL REFERENCES projects(id),
  item_name    VARCHAR(200) NOT NULL,  -- 支出项目名称
  amount       DECIMAL(10,2) NOT NULL,
  expense_date DATE NOT NULL,
  location     VARCHAR(200),           -- 支出地点
  invoice_path VARCHAR(500),           -- 发票文件路径（server/uploads/invoices/）
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

#### 表 7: `competitions` — 竞赛表 ⭐

> **注意**：此表通过 `server/migrations/seed_competitions.sql` 独立创建，**不在主 `database.sql` 中**。

```sql
CREATE TABLE competitions (
  id               INT          PRIMARY KEY AUTO_INCREMENT,
  name             VARCHAR(500) NOT NULL,
  organizer        TEXT,
  level            VARCHAR(50)  COMMENT 'National / Provincial / 一级 / 二级',
  status           VARCHAR(50)  COMMENT '兜底状态（仅当时间字段为空时使用）',
  description      LONGTEXT     COMMENT '支持 Markdown',
  deadline         VARCHAR(50)  COMMENT '人类可读截止日期',
  entry_method     TEXT,
  official_website VARCHAR(500),
  participants     VARCHAR(200),
  category         VARCHAR(200) COMMENT '英文分类标签，前端映射中文大类',
  timeline         TEXT,
  -- ★ 动态状态核心字段 ★
  start_time       DATE         COMMENT '赛事开始时间',
  end_time         DATE         COMMENT '赛事结束时间',
  needs_review     TINYINT(1)   DEFAULT 0 COMMENT '定时任务滚动后置1，管理员核对后清零',
  created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

---

### 4.3 表关联关系

```
users (1) ──────────< projects (N)         [user_id → users.id，级联删除]
users (1) ──────────< projects (N)         [teacher_id → users.id，置 NULL]
projects (1) ───────< files (N)            [project_id → projects.id，级联删除]
projects (1) ───────< audit_logs (N)       [entity_id 软关联]
projects (1) ───────< reimbursements (N)   [project_id → projects.id，级联删除]
projects (1) ───────< expenses (N)         [project_id → projects.id，级联删除]
users (1) ──────────< audit_logs (N)       [user_id → users.id，置 NULL]
```

---

### 4.4 数据库视图

**`v_project_overview`** — 项目概览视图（SQL 定义在 `server/database.sql`）:
- 联结 `projects`、`users`（负责人）、`users`（指导教师）
- 计算 `file_count`（文件数）和 `total_reimbursed`（已报销总额）

---

## 5. 核心业务逻辑与代码约定

### 5.1 认证与权限控制（JWT）

**机制**: Bearer Token（JWT）

| 中间件 | 文件 | 说明 |
|--------|------|------|
| `authenticate` | `server/middleware/auth.js` | 验证 `Authorization: Bearer <token>`，解码后挂载 `req.user = { id, student_id, role }` |
| `isAdmin` | `server/middleware/auth.js` | 检查 `req.user.role === 'admin'` |
| `isTeacherOrAdmin` | `server/middleware/auth.js` | 检查角色为 `teacher` 或 `admin` |
| `optionalAuth` | `server/middleware/auth.js` | Token 有则验证，无则放行（供公开兼私有接口使用） |
| `authorize(...roles)` | `server/middleware/auth.js` | 通用角色白名单中间件工厂函数 |

**前端 `RequireAuth` 组件**（`src/App.jsx`）:
- 读取 `AuthContext.user`，若为 null 则 `<Navigate to="/login">` 并记录 `location.state.from`
- 读取 `AuthContext.loading`，加载中显示 spinner，避免闪现登录页

**Token 刷新策略**: 无主动刷新，Token 过期（401）时清除 localStorage，由 `RequireAuth` 捕获并跳转登录页。

---

### 5.2 竞赛动态状态计算（核心特性）

⚠️ **竞赛状态不存储于数据库**，每次查询时由 SQL `CASE` 表达式实时计算：

```sql
-- DYNAMIC_STATUS_EXPR（来自 server/controllers/competitionController.js）
CASE
  WHEN start_time IS NULL OR end_time IS NULL THEN status
  WHEN NOW() < start_time                     THEN '未开始'
  WHEN NOW() <= end_time                      THEN '进行中'
  WHEN NOW() < DATE_ADD(end_time, INTERVAL 2 MONTH) THEN '已结束'
  ELSE status
END AS computed_status
```

**状态流转**:
```
新录入（start_time > NOW） → 未开始
start_time ≤ NOW ≤ end_time → 进行中
end_time < NOW < end_time+2月 → 已结束
NOW ≥ end_time+2月 → Cron Job 触发，日期滚入下一年
```

---

### 5.3 竞赛跨年自动滚动（Cron Job）

**文件**: `server/jobs/competitionRollover.js`  
**触发**: 每天凌晨 02:00（`cron.schedule('0 2 * * *', rolloverCompetitions)`）  
**注册**: `server/index.js` 中 `registerRolloverJob()` 在 DB 连接成功后调用

**执行逻辑**:
1. 查询 `end_time < NOW() - INTERVAL 2 MONTH` 的所有竞赛
2. `start_time = DATE_ADD(start_time, INTERVAL 1 YEAR)`
3. `end_time = DATE_ADD(end_time, INTERVAL 1 YEAR)`
4. `needs_review = 1`（通知管理员核对）
5. 打印日志：`本次滚动了 N 条记录`

**管理员审核**: 登录后台 `→ 赛事时间审核` (`/admin/competition-review`) 查看 `needs_review=1` 的列表，编辑确认后调用 `PUT /api/competitions/:id/review` 将 `needs_review` 清零。

---

### 5.4 AI 服务调用链

```
用户点击「AI 润色」
    ↓
前端 src/services/aiService.js → polishText(userDraft, sectionKey)
    ↓ 根据 sectionKey 从 applicationPrompts.js / reportPrompts.js 选取 systemPrompt
    ↓
api.post('/ai/qwen', { text, sectionKey, systemPrompt })
    ↓
后端 server/controllers/aiController.js → polishWithQwen()
    ↓ 从 process.env.ALIYUN_DASHSCOPE_API_KEY 读取密钥
    ↓
Axios → https://dashscope.aliyuncs.com → model: qwen-plus
    ↓
返回润色后文本 → 前端展示
```

**错误回退策略**（`aiService.js`）:
- 401 → 直接抛出「请先登录」，不回退 mock
- 其他错误 → 回退 mock 响应（`USE_MOCK = false` 时，降级提示 + mock 模板）

**Prompt 文件**:
- `src/data/applicationPrompts.js` — 申请书各字段的 system prompt
- `src/data/reportPrompts.js` — 中期报告（`MIDTERM_PROMPTS`）和终期报告（`FINAL_PROMPTS`）的 system prompt

---

### 5.5 文件上传安全策略

**后端 `server/routes/files.js`** 中使用 Multer 双重过滤：

```js
// 黑名单（优先级更高）：直接拒绝可执行/脚本文件
DANGEROUS_EXTENSIONS = ['.js', '.py', '.sh', '.exe', '.php', '.svg', ...]

// 白名单：只允许已知安全类型
ALLOWED_EXTENSIONS = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
                      '.jpg', '.png', '.gif', '.webp', '.zip', '.rar', '.7z', '.txt', '.csv']

// 文件大小限制：10MB（项目文件）/ 2MB（头像）/ 10MB（发票）
```

---

### 5.6 项目重命名逻辑（`MyProjects.jsx`）

这是一个较复杂的 UX 实现，需特别关注：

1. 进入编辑模式时，将所有项目 name 复制到 `editingNames` 状态对象 `{ [id]: string }`
2. Input `onChange` 更新 `editingNames`（本地）
3. Input `onBlur` → `doRename(id)` → `PATCH /api/projects/:id/name`（若名称未变则跳过）
4. Input `onKeyDown`：Enter → blur；Escape → 还原并 blur
5. 点击「完成」按钮前设置 `completingRef.current = true`（`useRef`），防止「完成」触发的 blur 重复发请求
6. 「完成」按钮 `onClick` → 批量 `Promise.allSettled` → 退出编辑模式

---

### 5.7 全局状态管理

本项目**不使用** Redux / Zustand 等全局状态库，仅用：

| 状态 | 管理方式 |
|------|---------|
| 用户认证状态 | `AuthContext`（React Context）+ `localStorage` |
| Toast 通知 | `src/components/Toast.jsx` 中的 `showToast(type, message)` 工具函数 |
| 路由状态 | React Router DOM v7 |
| 页面过渡动画 | `src/components/PageTransition.jsx`（包裹在 `AppLayout` 中） |

---

### 5.8 侧边栏导航结构

侧边栏组件：`src/components/Sidebar.jsx`

**导航菜单项**（按顺序）:
1. 🏠 首页 → `/`
2. 📁 我的项目 → `/my-projects`
3. 📚 大创指南（折叠组）
   - 全流程指引 → `/guide/process-map`
   - 立项准备 → `/guide/preparation`
   - 相关竞赛 → `/guide/related-competitions`
4. 🏆 竞赛信息 → `/competitions`
5. 🤖 AI 双创智填 → `/ai-creation`
6. （仅 Admin 可见）🛡️ 后台管理 → `/admin`
7. （仅 Admin 可见）📋 赛事时间审核 → `/admin/competition-review`

底部：用户头像 + 姓名 + 学号，点击弹出「个人设置 / 退出登录」下拉菜单。

---

### 5.9 CORS 配置策略

- **开发环境**: 允许 `localhost` 的任意端口
- **生产环境**: 仅允许 `process.env.CORS_ORIGIN`（`,` 分隔的域名白名单）
- **同源部署**（Nginx 反代）: `origin` 为空被直接放行，无需配置白名单

---

### 5.10 服务器启动时自动迁移

`server/index.js` 中 `ensureTables()` 函数在每次启动时运行：
- 自动创建 `audit_logs`、`expenses` 表（若不存在）
- 检测 `audit_logs` / `expenses` / `competitions` 缺失列，自动 `ALTER TABLE ADD COLUMN`
- 目的：支持增量部署，无需手动运行迁移脚本

---

## 6. 当前开发进度与待办事项

### 6.1 已完成并可正常运行的模块

| 模块 | 状态 | 说明 |
|------|------|------|
| 用户注册 / 登录 | ✅ 完成 | JWT 认证，密码 bcrypt 加密 |
| 用户资料编辑 | ✅ 完成 | 包含头像上传 |
| 项目 CRUD | ✅ 完成 | 创建/列表/详情/删除 |
| 项目重命名 | ✅ 完成 | 编辑模式下 inline input，自动保存 |
| 团队成员管理 | ✅ 完成 | JSON 存储，差异对比审计日志 |
| 经费管理 | ✅ 完成 | 支出记录 CRUD + 发票上传 |
| 文件上传 / 下载 | ✅ 完成 | 双重安全过滤，10MB 限制 |
| 审计日志 | ✅ 完成 | 项目操作全留痕 |
| 竞赛信息展示 | ✅ 完成 | 动态状态计算，分类筛选 |
| 竞赛跨年 Cron Job | ✅ 完成 | 每日凌晨 2 点自动滚动 |
| 赛事时间审核 | ✅ 完成 | Admin 核对界面 |
| AI 润色（Qwen） | ✅ 完成 | 后端代理，Key 安全 |
| AI 生成（DeepSeek） | ✅ 完成 | 后端代理，Key 安全 |
| 申请书编辑器 | ✅ 完成 | 含 AI 辅助，Word 导出 |
| 中期报告编辑器 | ✅ 完成 | 含 AI 辅助 |
| 结题报告编辑器 | ✅ 完成 | 含 AI 辅助 |
| 大创指南页系列 | ✅ 完成 | 全流程图、立项准备等 |
| 后台用户管理 | ✅ 完成 | 查看/删除用户 |
| Docker 容器化部署 | ✅ 完成 | 三服务 compose 配置 |
| 移动端响应式布局 | ✅ 完成 | Offcanvas 侧边栏 |

---

### 6.2 已知 Bug 与缺陷

| # | 问题描述 | 影响范围 | 优先级 |
|---|---------|---------|-------|
| 1 | `competitions` 表未合并进主 `database.sql`，Docker 首次部署需手动执行 `seed_competitions.sql` | 新环境初始化 | 🔴 High |
| 2 | 编辑模式下，点击「完成」时若有多个项目名称同时在编辑，并发 `PATCH` 请求无法保证执行顺序 | MyProjects 重命名 | 🟡 Medium |
| 3 | 竞赛 `start_time`/`end_time` 为 `DATE` 类型，不支持小时级精度 | 竞赛时间精度 | 🟡 Medium |
| 4 | 路由 `GET /competitions/review/list` 与 `GET /competitions/:id` 存在潜在冲突（已通过注册顺序规避，脆弱） | 后端路由 | 🟡 Medium |
| 5 | 竞赛分类 `CATEGORY_GROUPS` 映射表硬编码于前端 `Competitions.jsx`，新类别需重新部署前端 | 可维护性 | 🟢 Low |
| 6 | `reimbursements` 表（审批流）已建表但前端无对应管理界面，仅有 `expenses` 表被实际使用 | 报销模块 | 🟡 Medium |
| 7 | `PatentEditor` (`/patent-editor`) 不持久化数据到数据库，刷新即丢失 | 专利编辑 | 🟡 Medium |
| 8 | Cron Job 执行不记录历史，无法追溯某竞赛被滚动了几次 | 可追溯性 | 🟢 Low |

---

### 6.3 计划中的功能 (TODOs)

#### 🔴 优先级 High

- [ ] **将 `competitions` 表并入 `mysql-init/gdut_dachuang.sql`**，确保 `docker-compose up` 一键完成完整初始化
- [ ] **竞赛后台 CRUD**：在 AdminDashboard 下新增竞赛管理页（新增、编辑、删除竞赛条目），目前所有竞赛数据依赖 SQL 种子文件导入
- [ ] **`/project/:id/edit` 页面完善**：补全编辑入口与数据持久化逻辑

#### 🟡 优先级 Medium

- [ ] **报销审批流**：打通 `reimbursements` 表与前端，实现申请 → 审核 → 付款完整工作流
- [ ] **滚动历史日志**：在 `audit_logs` 表记录每次跨年滚动事件（`竞赛ID → 旧时间 → 新时间`）
- [ ] **`needs_review` 批量核对**：`CompetitionReview` 页面增加「全部确认」按钮
- [ ] **Token 自动续期**：在 Token 快过期时静默刷新，避免用户操作中途失效

#### 🟢 优先级 Low

- [ ] **竞赛类别后端化**：将 `CATEGORY_GROUPS` 移至数据库，通过 API 动态获取
- [ ] **竞赛状态前端筛选联动**：列表页增加状态下拉筛选，传递 `?status=进行中` 参数
- [ ] **竞赛收藏功能**：用户收藏感兴趣的竞赛，首页快速访问
- [ ] **专利编辑数据持久化**：`PatentEditor` 数据存入数据库
- [ ] **邮件通知**：定时任务滚动后向 Admin 发送待审核提醒

---

### 6.4 文件目录结构速查

```
gdut-dachuang-guide/
├── src/
│   ├── App.jsx                    # 路由总配置 + RequireAuth + AppLayout
│   ├── main.jsx                   # React 入口
│   ├── components/
│   │   ├── Sidebar.jsx            # 左侧导航栏（含用户资料下拉）
│   │   ├── AIField.jsx            # AI 辅助文本输入组件
│   │   ├── AISection.jsx          # AI 辅助区块组件
│   │   ├── CommonButton.jsx       # 统一按钮组件
│   │   ├── ErrorBoundary.jsx      # React 错误边界
│   │   ├── ExpenseModal.jsx       # 经费新增/编辑弹窗
│   │   ├── LoginModal.jsx         # 登录弹窗（内嵌式）
│   │   ├── PageTransition.jsx     # 页面切换过渡动画
│   │   ├── Toast.jsx              # 全局 Toast 通知 + showToast()
│   │   ├── UserSettingsModal.jsx  # 个人设置弹窗
│   │   └── Footer.jsx             # 页脚
│   ├── context/
│   │   └── AuthContext.jsx        # 全局认证上下文
│   ├── data/
│   │   ├── applicationPrompts.js  # 申请书各字段 AI system prompt
│   │   └── reportPrompts.js       # 中期/终期报告 AI system prompt
│   ├── pages/
│   │   ├── Home.jsx               # 首页
│   │   ├── Login.jsx              # 登录/注册页
│   │   ├── MyProjects.jsx         # 我的项目（卡片列表）
│   │   ├── ProjectDashboard.jsx   # 项目工作台
│   │   ├── ProjectEdit.jsx        # 项目编辑
│   │   ├── ApplicationEditor.jsx  # 申请书编辑器
│   │   ├── MidtermEditor.jsx      # 中期报告编辑器
│   │   ├── FinalEditor.jsx        # 终期报告编辑器
│   │   ├── PatentEditor.jsx       # 专利申请辅助
│   │   ├── ProjectConclusion.jsx  # 结题报告编辑器
│   │   ├── ProjectReimburse.jsx   # 项目报销
│   │   ├── Competitions.jsx       # 竞赛列表
│   │   ├── CompetitionDetail.jsx  # 竞赛详情
│   │   ├── CompetitionReview.jsx  # 赛事时间审核（Admin）
│   │   ├── AICreation.jsx         # AI 双创智填
│   │   ├── AdminDashboard.jsx     # 后台用户管理（Admin）
│   │   ├── AuditLog.jsx           # 审计日志查看
│   │   ├── Reimbursements.jsx     # 报销指南页
│   │   ├── Resources.jsx          # 资源下载页
│   │   ├── Tools.jsx              # 实用工具页
│   │   └── guide/
│   │       ├── ProcessGuide.jsx           # 全流程指引图
│   │       ├── GuidePreparation.jsx       # 立项准备
│   │       ├── GuideApplicationForm.jsx   # 申请表指南
│   │       ├── GuideRelatedCompetitions.jsx # 相关竞赛
│   │       ├── GuideMidterm.jsx           # 中期检查指南
│   │       └── GuideConclusion.jsx        # 结题指南
│   ├── services/
│   │   ├── api.js                 # Axios 实例（拦截器、baseURL 配置）
│   │   └── aiService.js           # AI 调用封装（polishText, generateDeepSeekContent）
│   └── utils/
│       └── exportToWord.js        # Word（.docx）导出工具
├── server/
│   ├── index.js                   # 服务器入口 + ensureTables() 自动迁移
│   ├── config/
│   │   └── db.js                  # MySQL 连接池配置
│   ├── routes/
│   │   ├── index.js               # 路由总线（/api 挂载点）
│   │   ├── auth.js                # /api/auth/*
│   │   ├── projects.js            # /api/projects/*
│   │   ├── expenses.js            # /api/expenses/*
│   │   ├── files.js               # /api/files/*
│   │   ├── competitions.js        # /api/competitions/*
│   │   ├── guideCompetitions.js   # /api/guide-competitions/*
│   │   ├── admin.js               # /api/admin/*
│   │   ├── ai.js                  # /api/ai/*
│   │   └── logs.js                # /api/logs/*
│   ├── controllers/
│   │   ├── authController.js      # 注册/登录/Profile/头像
│   │   ├── projectController.js   # 项目 CRUD + 重命名 + 团队
│   │   ├── expenseController.js   # 支出 CRUD
│   │   ├── fileController.js      # 文件上传/下载/删除
│   │   ├── competitionController.js # 竞赛查询 + 动态状态 + 审核
│   │   ├── guideCompetitionController.js # 指南竞赛
│   │   ├── adminController.js     # 用户管理（Admin）
│   │   ├── aiController.js        # Qwen + DeepSeek 代理
│   │   └── logController.js       # 审计日志 CRUD
│   ├── middleware/
│   │   ├── auth.js                # authenticate / isAdmin / optionalAuth
│   │   └── errorHandler.js        # 全局错误处理 + 404
│   ├── jobs/
│   │   └── competitionRollover.js # 竞赛跨年 Cron Job（每日 02:00）
│   ├── utils/
│   │   └── auditLog.js            # logAudit() 工具函数
│   ├── migrations/
│   │   └── seed_competitions.sql  # 竞赛表及种子数据（独立迁移）
│   ├── scripts/
│   │   └── seedCompetitionTimes.js # 手动运行：初始化竞赛时间数据
│   └── database.sql               # 主数据库建表脚本（users/projects/files/logs/reimbursements/expenses）
├── mysql-init/
│   └── gdut_dachuang.sql          # Docker 自动初始化 SQL
├── nginx/
│   └── default.conf               # Nginx 反代配置
├── public/
│   └── files/
│       ├── guide.docx             # 大创指南文档
│       ├── reimbursements/        # 报销相关表格模板
│       └── templates/             # 申请表模板等
├── docker-compose.yml             # 三服务容器编排
├── Dockerfile                     # 前端镜像（Vite build + Nginx）
├── vite.config.js                 # Vite 配置（dev proxy: /api → 5000）
├── package.json                   # 前端依赖 + npm scripts
├── start-dev.bat                  # Windows 一键启动脚本
├── COMPETITION_MODULE_DOC.md      # 竞赛模块专项文档（详细）
└── PROJECT_MASTER_DOC.md          # 本文档
```

---

*文档由 AI 辅助从代码库提取生成 | 如有模块变更请同步更新本文档*
