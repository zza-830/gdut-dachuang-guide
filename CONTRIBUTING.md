# 贡献指南

感谢你对 GDUT 大创指南系统的关注！我们欢迎任何形式的贡献。

## 🤝 如何贡献

### 提交 Issue

- **Bug 报告**：请详细描述问题、复现步骤和环境信息
- **功能建议**：请说明使用场景和期望效果
- **文档改进**：请指出具体位置和改进内容

### 提交 Pull Request

1. **Fork** 本仓库到你的 GitHub
2. **克隆** 你的 Fork 到本地
   ```bash
   git clone https://github.com/你的用户名/gdut-dachuang-guide.git
   ```
3. **创建特性分支**
   ```bash
   git checkout -b feature/你的特性名称
   ```
4. **提交改动**
   ```bash
   git commit -m "feat: 添加某某功能"
   ```
5. **推送分支**
   ```bash
   git push origin feature/你的特性名称
   ```
6. **创建 Pull Request** 到本仓库的 `master` 分支

## 📝 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

- **feat**: 新功能
- **fix**: Bug 修复
- **docs**: 文档更新
- **style**: 代码格式（不影响功能）
- **refactor**: 重构（不是新功能也不是修复）
- **perf**: 性能优化
- **test**: 测试相关
- **chore**: 构建/工具相关

### 示例

```
feat(AI): 添加 DeepSeek 模型支持

- 新增 DeepSeek API 调用逻辑
- 支持流式响应
- 更新环境变量配置

Closes #123
```

## 🏗️ 开发环境

### 环境要求

- Node.js >= 18.0
- MySQL >= 8.0
- npm >= 9.0

### 本地开发

```bash
# 克隆项目
git clone https://github.com/zza-830/gdut-dachuang-guide.git
cd gdut-dachuang-guide

# 安装依赖
npm install
cd server && npm install && cd ..

# 配置环境变量
cp .env.example .env
# 编辑 .env 填入配置

# 初始化数据库
mysql -u root -p -e "CREATE DATABASE gdut_dachuang;"
mysql -u root -p gdut_dachuang < mysql-init/init.sql

# 启动开发服务器
npm run dev
```

### 代码规范

- 使用 ESLint 进行代码检查
- 遵循 React Hooks 最佳实践
- 后端 API 遵循 RESTful 规范
- 组件使用函数式组件 + Hooks

### 测试

```bash
# 运行前端测试
npm test

# 运行后端测试
cd server && npm test
```

## 📚 相关文档

- [项目说明](README.md)
- [部署指南](DEPLOY.md)
- [API 文档](README.md#-api-文档)

## 🎯 需要帮助的方向

- 🌍 国际化支持（i18n）
- 📱 移动端适配
- 🧪 单元测试覆盖
- 📊 数据可视化增强
- 🤖 AI Prompt 优化
- 📖 文档完善

## ❓ 有问题？

如有任何问题，欢迎通过以下方式联系：

- 提交 [Issue](https://github.com/zza-830/gdut-dachuang-guide/issues)
- 发送邮件至 1691498165@qq.com

## 🙏 致谢

感谢所有贡献者的付出！

---

**再次感谢你的贡献！** 🎉
