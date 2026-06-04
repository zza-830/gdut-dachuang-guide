# 更新日志

本项目的所有重要更改都将记录在此文件。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### 计划
- 移动端适配
- 国际化支持
- 数据导出功能增强

## [1.0.0] - 2026-06-01

### 新增
- ✨ **AI 智能润色** - 基于通义千问/DeepSeek 的申报书 AI 润色功能
  - 13 种字段专项 Prompt 模板
  - 学术化风格优化
  - 字数精确控制
- 📋 **项目管理** - 大创项目全生命周期管理
  - 项目申报、中期检查、结题
  - 进度追踪和状态管理
  - 多角色权限（学生/教师/管理员）
- 🏆 **竞赛信息库** - 20+ 赛事信息
  - 互联网+、挑战杯、三创赛等
  - 时间轴展示
  - 赛事详情和报名指引
- 💰 **经费管理** - 项目经费申请和审批
  - 预算编制
  - 报销流程
  - 统计分析
- 👤 **用户系统** - 完整的用户认证和授权
  - JWT 认证
  - 角色权限管理
  - 个人信息管理
- 📊 **数据统计** - 项目和经费数据可视化
  - 项目看板
  - 趋势分析
  - 报表导出
- 🐳 **Docker 支持** - 一键部署
  - docker-compose 配置
  - 环境变量管理
  - 数据库初始化

### 技术栈
- 前端：React 19 + Vite 7 + Bootstrap 5
- 后端：Node.js 20 + Express 5
- 数据库：MySQL 8.0
- AI：通义千问 + DeepSeek

---

## 版本说明

### 版本号规则

- **主版本号 (MAJOR)**: 不兼容的 API 变更
- **次版本号 (MINOR)**: 向下兼容的功能性新增
- **修订号 (PATCH)**: 向下兼容的问题修正

### 变更类型

- **新增 (Added)**: 新功能
- **变更 (Changed)**: 现有功能的变更
- **弃用 (Deprecated)**: 即将移除的功能
- **移除 (Removed)**: 已移除的功能
- **修复 (Fixed)**: Bug 修复
- **安全 (Security)**: 安全相关的变更

---

## 链接

- [GitHub Releases](https://github.com/zza-830/gdut-dachuang-guide/releases)
- [提交历史](https://github.com/zza-830/gdut-dachuang-guide/commits/master)
