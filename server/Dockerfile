# ============================================
# Backend Dockerfile - Node.js Express API
# ============================================

FROM node:18-alpine

WORKDIR /app

# 安装依赖（利用 Docker 缓存层）
COPY package.json package-lock.json* ./
RUN npm ci --production --no-audit --no-fund

# 复制应用代码
COPY . .

# 创建上传目录并设置权限
RUN mkdir -p /app/uploads && chown -R node:node /app

# 使用非 root 用户运行
USER node

EXPOSE 5000

ENV NODE_ENV=production

# 健康检查
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "index.js"]
