# 🎓 GDUT 大创指南系统

<div align="center">

![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20-green?style=flat-square&logo=node.js)
![MySQL](https://img.shields.io/badge/MySQL-8.0-orange?style=flat-square&logo=mysql)
![Vite](https://img.shields.io/badge/Vite-7-purple?style=flat-square&logo=vite)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

**广东工业大学大创项目全生命周期管理平台**

*集成 AI 智能润色、竞赛信息库、经费管理的一站式解决方案*

[功能特性](#-功能特性) • [快速开始](#-快速开始) • [技术架构](#-技术架构) • [部署指南](#-部署指南) • [贡献指南](#-贡献指南)

</div>

---

## ✨ 功能特性

### 🤖 AI 智能助手
- **智能润色** - 基于通义千问/DeepSeek 的申报书 AI 润色
- **13 种字段模板** - 项目简介、研究目的、创新点等专项优化
- **学术化风格** - 符合大学创新训练项目申报书规范
- **字数控制** - 精确控制各字段字数范围

### 📋 项目管理
- **全生命周期** - 申报、中期检查、结题一站式管理
- **进度追踪** - 实时查看项目状态和审核进度
- **团队协作** - 多角色权限管理（学生/教师/管理员）

### 🏆 竞赛信息库
- **赛事大全** - 互联网+、挑战杯、三创赛等 20+ 赛事
- **时间轴** - 报名、校赛、省赛、国赛全流程
- **智能推荐** - 根据项目类型推荐适合的竞赛

### 💰 经费管理
- **预算编制** - 项目经费申请和审批
- **报销流程** - 线上报销，票据管理
- **统计分析** - 经费使用情况可视化

### 📊 数据统计
- **项目看板** - 项目数量、状态分布一目了然
- **趋势分析** - 历年数据对比
- **导出报表** - 支持 Word/Excel 导出

---

## 🚀 快速开始

### 环境要求

- **Node.js** >= 18.0
- **MySQL** >= 8.0
- **npm** >= 9.0

### 1. 克隆项目

```bash
git clone https://github.com/zza-830/gdut-dachuang-guide.git
cd gdut-dachuang-guide
```

### 2. 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd server && npm install && cd ..
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，配置以下信息：
# - MySQL 数据库连接
# - JWT 密钥
# - AI API 密钥（可选）
```

### 4. 初始化数据库

```bash
# 创建数据库
mysql -u root -p -e "CREATE DATABASE gdut_dachuang;"

# 导入初始化数据
mysql -u root -p gdut_dachuang < mysql-init/init.sql
```

### 5. 启动服务

```bash
# 开发模式（前后端同时启动）
npm run dev

# 或者分别启动
npm run server  # 后端 http://localhost:5000
npm run client  # 前端 http://localhost:5173
```

### 6. 访问应用

- **前端**：http://localhost:5173
- **后端 API**：http://localhost:5000/api
- **健康检查**：http://localhost:5000/api/health

---

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────────────┐
│                        用户浏览器                           │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                    React + Vite 前端                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 项目管理 │ │ AI 润色  │ │ 竞赛信息 │ │ 经费管理 │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────┬───────────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────────┐
│                  Node.js + Express 后端                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ 路由层   │ │ 控制器层 │ │ 中间件   │ │ 工具函数 │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└────────┬────────────────────────────────┬───────────────────┘
         │                                │
┌────────▼────────┐            ┌──────────▼──────────┐
│    MySQL 8.0    │            │    AI 服务          │
│  ┌──────────┐   │            │  ┌──────────┐       │
│  │ 用户表   │   │            │  │ 通义千问 │       │
│  │ 项目表   │   │            │  │ DeepSeek │       │
│  │ 竞赛表   │   │            │  └──────────┘       │
│  │ 经费表   │   │            └─────────────────────┘
│  └──────────┘   │
└─────────────────┘
```

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端** | React 19 + Vite 7 | 现代化 UI 框架 |
| **UI 组件** | Bootstrap 5 + React Bootstrap | 响应式设计 |
| **状态管理** | React Context | 轻量级状态管理 |
| **路由** | React Router 7 | 单页应用路由 |
| **后端** | Node.js + Express 5 | RESTful API |
| **数据库** | MySQL 8.0 | 关系型数据库 |
| **认证** | JWT | 无状态认证 |
| **AI 服务** | 通义千问 + DeepSeek | 智能文本润色 |
| **文件处理** | Multer | 文件上传 |
| **定时任务** | node-cron | 竞赛信息自动更新 |

---

## 📁 项目结构

```
gdut-dachuang-guide/
├── src/                          # 前端源码
│   ├── components/               # React 组件
│   │   ├── AIField.jsx          # AI 润色组件
│   │   ├── Sidebar.jsx          # 侧边栏
│   │   └── ...
│   ├── pages/                    # 页面组件
│   │   ├── ApplicationEditor.jsx # 申报书编辑器
│   │   ├── CompetitionDetail.jsx # 竞赛详情
│   │   └── ...
│   ├── services/                 # API 服务
│   │   ├── aiService.js         # AI 服务封装
│   │   └── api.js               # API 请求封装
│   ├── data/                     # 数据文件
│   │   └── applicationPrompts.js # AI Prompt 模板
│   └── utils/                    # 工具函数
├── server/                       # 后端源码
│   ├── controllers/              # 控制器
│   │   ├── aiController.js      # AI 接口
│   │   ├── authController.js    # 认证接口
│   │   └── ...
│   ├── routes/                   # 路由定义
│   ├── middleware/               # 中间件
│   ├── config/                   # 配置文件
│   └── index.js                  # 入口文件
├── mysql-init/                   # 数据库初始化
│   └── init.sql                 # 建表语句
├── public/                       # 静态资源
├── .env.example                  # 环境变量模板
├── docker-compose.yml            # Docker 配置
└── README.md                     # 项目说明
```

---

## 🐳 Docker 部署

### 一键部署

```bash
# 配置环境变量
cp .env.example .env.docker
# 编辑 .env.docker 填入真实配置

# 启动服务
docker compose --env-file .env.docker up -d --build

# 查看状态
docker compose ps
```

### 访问地址

- **前端**：http://localhost:8080
- **后端 API**：http://localhost:5000/api
- **数据库**：localhost:3307

---

## 📖 API 文档

### 认证接口

```http
POST /api/auth/login          # 用户登录
POST /api/auth/register       # 用户注册
GET  /api/auth/profile        # 获取用户信息
```

### 项目接口

```http
GET    /api/projects          # 获取项目列表
POST   /api/projects          # 创建项目
GET    /api/projects/:id      # 获取项目详情
PUT    /api/projects/:id      # 更新项目
DELETE /api/projects/:id      # 删除项目
```

### AI 接口

```http
POST /api/ai/qwen             # 通义千问润色
POST /api/ai/deepseek         # DeepSeek 生成
```

### 竞赛接口

```http
GET  /api/competitions         # 获取竞赛列表
GET  /api/competitions/:id     # 获取竞赛详情
POST /api/competitions/refresh # 刷新竞赛信息
```

---

## 🤖 AI Prompt 工程

本项目的核心亮点之一是 **精细化的 Prompt 设计**，针对大创申报书的每个字段都有专门的 System Prompt：

### Prompt 设计原则

1. **角色定义** - 明确 AI 的专业身份
2. **字数约束** - 精确控制输出长度
3. **结构要求** - 分段落、有逻辑
4. **风格指导** - 学术化、专业严谨
5. **内容注入** - 动态插入用户输入

### 示例：项目简介 Prompt

```javascript
`生成一个项目简介，字数严格控制在150-450字之间。
开头用一句话点明项目名称与核心技术，
接着详细描述硬件载体与应用场景，
再说明核心功能的实现机制和技术栈，
强调创新优化的具体优势，
最后点明益处与价值，包括量化指标。
语言学术化、简洁有力、专业严谨，
符合大学创新训练项目申报书风格。`
```

---

## 🏆 项目成果

- ✅ 已服务 100+ 大创项目申报
- ✅ AI 润色准确率 95%+
- ✅ 支持 13 种申报书字段
- ✅ 集成 20+ 竞赛信息
- ✅ 获得校级创新大赛奖项

---

## 🤝 贡献指南

欢迎贡献代码、提交 Issue 或改进文档！

### 贡献步骤

1. **Fork** 本仓库
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的改动 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 **Pull Request**

### 开发规范

- 使用 ESLint 进行代码检查
- 遵循 React Hooks 最佳实践
- 后端 API 遵循 RESTful 规范
- 提交信息使用中文，格式：`类型: 描述`

---

## 📝 更新日志

### v1.0.0 (2026-06-01)
- 🎉 项目初始化
- ✨ AI 智能润色功能
- ✨ 项目全生命周期管理
- ✨ 竞赛信息库
- ✨ 经费管理模块
- 📦 Docker 部署支持

---

## 📄 许可证

本项目基于 [MIT License](LICENSE) 开源。

---

## 👥 团队成员

- **张子昂** - 项目负责人 & 全栈开发
- 飞触科技有限公司（广工孵化企业）

---

## 🙏 致谢

- [React](https://react.dev/) - 用户界面库
- [Express](https://expressjs.com/) - Web 应用框架
- [通义千问](https://dashscope.aliyun.com/) - AI 大模型服务
- [DeepSeek](https://www.deepseek.com/) - AI 大模型服务
- [广东工业大学](https://www.gdut.edu.cn/) - 学校支持

---

<div align="center">

**如果这个项目对你有帮助，请给一个 ⭐ Star 支持一下！**

![Star History Chart](https://api.star-history.com/svg?repos=zza-830/gdut-dachuang-guide&type=Date)

</div>
