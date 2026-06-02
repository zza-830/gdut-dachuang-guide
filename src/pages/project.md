 GDUT 大创指南系统 — 项目概述

> 文档版本：v1.0  
> 生成日期：2026-02-26  
> 项目名称：gdut-dachuang-guide  
> 项目版本：0.0.0

---

 1. 项目简介

GDUT 大创指南系统（GDUT DaChuang Guide）是面向广东工业大学大学生创新创业训练计划（大创）的一站式管理与指导平台。系统覆盖大创项目从立项申请到结题验收的完整生命周期，集成 AI 辅助写作、经费管理、竞赛信息聚合等功能，旨在降低学生参与大创项目的门槛，提升项目管理效率。

---

 2. 核心功能模块

| 模块 | 功能描述 |
|------|----------|
| 首页 | 倒计时提醒（中期检查/大创申报/结题填报）、快捷入口导航 |
| 我的项目 | 项目 CRUD、项目仪表盘（时间线、经费、团队、资料归档、操作日志） |
| 大创指南 | 全流程指引（流程图）、立项准备、申报书填写指导、相关竞赛、中期检查、结题验收 |
| 竞赛信息 | 国家级/省级/校级竞赛列表与详情页 |
| AI 双创智填 | 基于 DeepSeek V3 与 Qwen3 大模型的智能文档生成（申报书、中期报告、结题报告、专利文档） |
| 文档编辑器 | 申报书编辑器（13 字段）、中期报告编辑器（5 字段）、结题报告编辑器（7 字段）、专利编辑器 |
| 经费管理 | 经费总额设置、支出记录、报销申请、报销表单模板下载 |
| 管理后台 | 管理员审核、用户管理、操作日志审计 |
| 用户系统 | JWT 认证登录、个人设置、头像管理 |

---

 3. 技术栈详情

 3.1 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.x | 核心 UI 框架（SPA 单页应用） |
| Vite | 7.x | 构建工具与开发服务器（HMR 热更新） |
| React Router DOM | 7.x | 客户端路由管理 |
| React-Bootstrap | 2.x | UI 组件库（基于 Bootstrap 5） |
| Bootstrap | 5.x | CSS 框架 |
| Axios | 1.x | HTTP 请求客户端 |
| Chart.js + react-chartjs-2 | 4.x / 5.x | 数据可视化图表 |
| React Icons | 5.x | 图标库（Font Awesome 等） |
| docx | 9.x | 前端生成 Word 文档（.docx） |
| file-saver | 2.x | 浏览器端文件下载 |
| React Markdown + rehype-raw | 10.x / 7.x | Markdown 渲染（支持 HTML） |
| ReactFlow | 11.x | 流程图/节点图可视化 |
| Fuse.js | 7.x | 前端模糊搜索 |
| react-beautiful-dnd | 13.x | 拖拽排序 |
| react-dropzone | 14.x | 文件拖拽上传 |
| yet-another-react-lightbox | 3.x | 图片灯箱预览 |

 3.2 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | ≥ 18.x | 运行时环境 |
| Express | 5.x | Web 框架（RESTful API） |
| MySQL | 8.0（兼容 5.7） | 关系型数据库 |
| mysql2 | 3.x | MySQL 驱动（Promise 接口 + 连接池） |
| jsonwebtoken (JWT) | 9.x | 用户认证令牌 |
| bcryptjs | 3.x | 密码哈希加密 |
| multer | 2.x | 文件上传中间件 |
| cors | 2.x | 跨域资源共享 |
| dotenv | 17.x | 环境变量管理 |

 3.3 开发工具链

| 工具 | 版本 | 用途 |
|------|------|------|
| ESLint | 9.x | 代码质量检查 |
| eslint-plugin-react-hooks | 7.x | React Hooks 规则检查 |
| eslint-plugin-react-refresh | 0.4.x | React Fast Refresh 兼容 |
| Nodemon | 3.x | 后端开发热重载 |
| Concurrently | 9.x | 同时启动前后端开发服务器 |

 3.4 部署技术栈

| 技术 | 用途 |
|------|------|
| Docker + Docker Compose | 容器化部署（前端 Nginx + 后端 Node.js + MySQL） |
| Nginx | 反向代理 + 静态文件托管 |
| PM2（推荐） | Node.js 进程守护（非 Docker 部署时使用） |

 3.5 外部服务

| 服务 | 说明 |
|------|------|
| 阿里云 DashScope API | AI 润色功能（Qwen 模型），前端直连 `dashscope.aliyuncs.com:443` |
| DeepSeek API | AI 文档生成（DeepSeek V3 模型） |

---

 4. 项目目录结构

```
gdut-dachuang-guide/
├── index.html                     入口 HTML
├── package.json                   前端依赖配置
├── vite.config.js                 Vite 构建配置（代理 /api → localhost:5000）
├── docker-compose.yml             Docker 编排文件
├── Dockerfile                     前端 Docker 镜像
├── .env.development               开发环境变量
├── .env.docker                    Docker 环境变量
├── start-dev.bat                  Windows 一键启动脚本
│
├── src/                           前端源码
│   ├── main.jsx                   React 入口
│   ├── App.jsx                    路由配置 + 布局（侧边栏 + 认证守卫）
│   ├── App.css                    全局应用样式
│   ├── index.css                  设计系统变量 + 响应式样式
│   │
│   ├── components/                公共组件
│   │   ├── Sidebar.jsx            侧边栏导航（桌面固定 + 移动端 Offcanvas）
│   │   ├── Footer.jsx             底部栏
│   │   ├── CommonButton.jsx       统一按钮组件
│   │   ├── AIField.jsx            AI 润色字段组件
│   │   ├── AISection.jsx          AI 区块组件
│   │   ├── ErrorBoundary.jsx      错误边界
│   │   ├── ExpenseModal.jsx       支出管理弹窗
│   │   ├── LoginModal.jsx         登录弹窗
│   │   ├── PageTransition.jsx     页面过渡动画
│   │   ├── Toast.jsx              全局提示组件
│   │   └── UserSettingsModal.jsx  用户设置弹窗
│   │
│   ├── pages/                     页面组件
│   │   ├── Home.jsx               首页（倒计时 + 功能卡片）
│   │   ├── Login.jsx              登录页
│   │   ├── MyProjects.jsx         我的项目列表
│   │   ├── ProjectDashboard.jsx   项目仪表盘（时间线/经费/团队/归档/日志）
│   │   ├── ProjectEdit.jsx        项目编辑
│   │   ├── ProjectConclusion.jsx  项目结题
│   │   ├── ProjectReimburse.jsx   项目报销
│   │   ├── ApplicationEditor.jsx  申报书编辑器（13 字段）
│   │   ├── MidtermEditor.jsx      中期报告编辑器（5 字段）
│   │   ├── FinalEditor.jsx        结题报告编辑器（7 字段）
│   │   ├── PatentEditor.jsx       专利编辑器
│   │   ├── AICreation.jsx         AI 双创智填页面
│   │   ├── Competitions.jsx       竞赛列表
│   │   ├── CompetitionDetail.jsx  竞赛详情
│   │   ├── Reimbursements.jsx     报销指引
│   │   ├── Resources.jsx          资源页
│   │   ├── Tools.jsx              工具页
│   │   ├── AdminDashboard.jsx     管理后台
│   │   ├── AuditLog.jsx           操作日志
│   │   └── guide/                 大创指南子页面
│   │       ├── ProcessGuide.jsx           全流程指引（ReactFlow 流程图）
│   │       ├── GuidePreparation.jsx       立项准备
│   │       ├── GuideApplicationForm.jsx   申报书填写指导
│   │       ├── GuideRelatedCompetitions.jsx  相关竞赛
│   │       ├── GuideMidterm.jsx           中期检查
│   │       └── GuideConclusion.jsx        结题验收
│   │
│   ├── context/
│   │   └── AuthContext.jsx        认证上下文（JWT Token 管理）
│   │
│   ├── services/
│   │   ├── api.js                 Axios 实例（拦截器 + Token 注入）
│   │   └── aiService.js           AI 服务调用（DashScope / DeepSeek）
│   │
│   ├── data/
│   │   ├── applicationPrompts.js  申报书 AI 提示词
│   │   └── reportPrompts.js       报告 AI 提示词
│   │
│   └── utils/
│       └── exportToWord.js        Word 文档导出工具
│
├── server/                        后端源码
│   ├── index.js                   Express 入口（端口 5000）
│   ├── package.json               后端依赖配置
│   ├── database.sql               数据库表结构
│   ├── Dockerfile                 后端 Docker 镜像
│   ├── .env                       后端环境变量（需手动创建）
│   │
│   ├── config/
│   │   └── db.js                  MySQL 连接池配置
│   │
│   ├── controllers/               业务逻辑控制器
│   │   ├── authController.js      认证（注册/登录/Token 刷新）
│   │   ├── projectController.js   项目 CRUD + 团队 + 经费
│   │   ├── fileController.js      文件上传/下载/删除
│   │   ├── expenseController.js   支出记录管理
│   │   ├── competitionController.js       竞赛信息
│   │   ├── guideCompetitionController.js  指南竞赛
│   │   ├── adminController.js     管理员操作
│   │   └── logController.js       操作日志
│   │
│   ├── routes/                    API 路由
│   │   ├── index.js               路由汇总
│   │   ├── auth.js                /api/auth/
│   │   ├── projects.js            /api/projects/
│   │   ├── files.js               /api/files/
│   │   ├── expenses.js            /api/expenses/
│   │   ├── competitions.js        /api/competitions/
│   │   ├── guideCompetitions.js   /api/guide-competitions/
│   │   ├── admin.js               /api/admin/
│   │   └── logs.js                /api/logs/
│   │
│   ├── middleware/
│   │   ├── auth.js                JWT 认证中间件
│   │   └── errorHandler.js        全局错误处理
│   │
│   ├── migrations/
│   │   └── seed_competitions.sql  竞赛初始数据
│   │
│   ├── uploads/                   用户上传文件存储
│   └── utils/
│       └── auditLog.js            审计日志工具
│
├── public/                        静态资源
│   ├── files/                     下载文件（模板、指南文档）
│   ├── images/                    图片资源
│   └── templates/                 Word 模板文件
│
├── nginx/
│   └── default.conf               Nginx 反向代理配置
│
├── mysql-init/
│   └── gdut_dachuang.sql          Docker MySQL 初始化脚本
│
└── docs/                          项目文档
    ├── project-overview.md        本文档
    ├── platform-technical-report.md  平台技术报告
    └── sitemap.md                 功能架构图
```

---

 5. 安装与运行

 5.1 环境要求

| 组件 | 最低版本 |
|------|----------|
| Node.js | v18.x |
| npm | v9+ |
| MySQL | 5.7（推荐 8.0） |

 5.2 方式一：本地开发运行

```bash
 1. 克隆项目
git clone <repo-url>
cd gdut-dachuang-guide

 2. 安装前端依赖
npm install

 3. 安装后端依赖
cd server
npm install
cd ..

 4. 配置数据库
    创建 MySQL 数据库
mysql -u root -p -e "CREATE DATABASE gdut_dachuang CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    导入表结构
mysql -u root -p gdut_dachuang < server/database.sql
    导入竞赛初始数据
mysql -u root -p gdut_dachuang < server/migrations/seed_competitions.sql

 5. 配置后端环境变量
    创建 server/.env 文件，内容如下：
```

server/.env 配置项：

```ini
PORT=5000
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=<你的数据库密码>
DB_NAME=gdut_dachuang
JWT_SECRET=<随机生成的密钥字符串>
JWT_EXPIRES_IN=7d
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173
```

```bash
 6. 一键启动前后端（Windows 可直接双击 start-dev.bat）
npm run dev

 前端运行在: http://localhost:5173
 后端运行在: http://localhost:5000
```

启动后的访问方式：
- 浏览器打开 `http://localhost:5173`
- Vite 开发服务器会自动将 `/api/` 和 `/uploads/` 请求代理到后端 `http://localhost:5000`

 5.3 方式二：Docker 一键部署

```bash
 1. 配置环境变量
    编辑 .env.docker 文件，填写数据库密码、JWT 密钥等

 2. 构建并启动所有服务
docker-compose --env-file .env.docker up -d --build

 3. 访问
    前端: http://localhost:8080
    后端 API: http://localhost:5000

 停止服务
docker-compose down

 重置数据库（删除数据卷）
docker-compose down -v
```

Docker 服务组成：

| 服务 | 容器名 | 端口映射 | 说明 |
|------|--------|----------|------|
| db | dachuang_mysql | 3307:3306 | MySQL 8.0 数据库 |
| backend | dachuang_backend | 5000:5000 | Node.js Express API |
| frontend | dachuang_frontend | 8080:80 | Nginx + React 静态文件 |

 5.4 方式三：生产环境部署（Nginx + PM2）

详见 [平台技术报告](./platform-technical-report.md) 第 5 节。

简要步骤：
1. 构建前端：`npm run build`（产出 `dist/` 目录）
2. 将 `dist/` 部署到 Nginx 静态目录
3. 使用 PM2 启动后端：`pm2 start server/index.js --name dachuang-api`
4. 配置 Nginx 反向代理 `/api/` → `http://127.0.0.1:5000`

---

 6. API 路由概览

所有 API 路由前缀为 `/api`。

| 路由前缀 | 说明 | 认证要求 |
|----------|------|----------|
| `/api/auth/register` | 用户注册 | 否 |
| `/api/auth/login` | 用户登录 | 否 |
| `/api/auth/me` | 获取当前用户信息 | 是 |
| `/api/projects` | 项目 CRUD、团队管理、经费管理 | 是 |
| `/api/files/:projectId` | 文件上传/下载/删除 | 是 |
| `/api/expenses/:projectId` | 支出记录管理 | 是 |
| `/api/competitions` | 竞赛信息查询 | 是 |
| `/api/guide-competitions` | 指南竞赛信息 | 是 |
| `/api/logs/:projectId` | 操作日志查询/写入 | 是 |
| `/api/admin` | 管理员操作（用户管理等） | 是（管理员） |

---

 7. 使用方式

 7.1 用户注册与登录

1. 访问系统首页，未登录用户会自动跳转到 `/login` 登录页
2. 支持注册新账号（姓名 + 学号 + 密码）
3. 登录后 JWT Token 存储在浏览器 localStorage，有效期 7 天

 7.2 项目管理流程

1. 创建项目：在「我的项目」页面点击「新建项目」，填写项目名称、时间、负责人等信息
2. 项目仪表盘：点击项目卡片进入仪表盘，查看：
   - 项目时间线（立项 → 审批 → 中期检查 → 结题填报 → 结题）
   - 经费概况（总额设置、支出记录、报销申请）
   - 团队成员管理（添加/编辑/删除成员、角色分配）
   - 资料归档（文件上传/下载/分类管理）
   - 操作日志
3. 文档编辑：进入 AI 智能填报，选择申报书/中期报告/结题报告进行编辑
4. AI 润色：每个文本字段右上角有 AI 润色按钮，一键生成/优化内容
5. 导出 Word：编辑完成后可导出为 .docx 格式文件

 7.3 大创指南

- 「全流程指引」提供可视化流程图（基于 ReactFlow）
- 各阶段指南页面提供详细的操作说明和注意事项

 7.4 竞赛信息

- 浏览国家级、省级、校级竞赛列表
- 查看竞赛详情（时间、要求、报名方式等）

 7.5 AI 双创智填

- 独立的 AI 创作页面，支持自由输入主题生成文档内容
- 集成 DeepSeek V3 与 Qwen3 模型

 7.6 管理后台

- 管理员角色可访问 `/admin` 后台管理页面
- 功能包括：用户管理、项目审核、系统日志查看

---

 8. 网络架构

```
┌─────────────────────────────────────────────────────────────┐
│                      用户浏览器                              │
└──────────┬──────────────────────────────┬───────────────────┘
           │ HTTP                          │ HTTPS (出站)
           ▼                              ▼
┌─────────────────────┐      ┌──────────────────────────────┐
│   Nginx / Vite Dev   │      │  阿里云 DashScope API         │
│   (反向代理 + 静态)   │      │  dashscope.aliyuncs.com:443  │
│   开发: 5173          │      │  (AI 润色，前端直连)           │
│   生产: 80            │      └──────────────────────────────┘
└──────┬──────────────┘
       │  /api/  → proxy_pass
       ▼
┌─────────────────────┐
│   Node.js Backend    │
│   Express            │
│   Port: 5000         │
└──────────┬──────────┘
           │ TCP :3306
           ▼
┌─────────────────────┐
│      MySQL 8.0       │
│   gdut_dachuang      │
└─────────────────────┘
```

---

 9. 安全注意事项

1. JWT_SECRET 必须使用随机强密钥，不要使用默认值
2. AI API Key 当前硬编码于前端代码中（`src/services/aiService.js`），建议迁移至后端
3. MySQL 生产环境应创建专用数据库用户，限制权限
4. `server/.env` 文件不应提交到版本控制（已在 `.gitignore` 中排除）
5. 生产环境不暴露 5000（后端）和 3306（数据库）端口至外部网络
6. 定期备份数据库与 `server/uploads/` 目录

---

 10. 相关文档

| 文档 | 路径 | 说明 |
|------|------|------|
| 平台技术报告 | `docs/platform-technical-report.md` | 详细部署指南、网络拓扑、安全建议 |
| 功能架构图 | `docs/sitemap.md` | Mermaid 流程图 + 层级说明 |
| Docker 部署说明 | `README_DOCKER.md` | Docker Compose 部署指南 |
| 数据库结构 | `server/database.sql` | 完整表结构定义 |

---

文档结束
