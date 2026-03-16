# ============================================
# Frontend Dockerfile - Multi-stage Build
# Stage 1: Build React with Vite
# Stage 2: Serve static files with Nginx
# ============================================

# ---------- Stage 1: Build ----------
FROM node:18-alpine AS builder

WORKDIR /app

# 安装依赖（利用 Docker 缓存层）
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund --legacy-peer-deps

# 复制源码并构建
COPY index.html vite.config.js eslint.config.js ./
COPY public/ ./public/
COPY src/ ./src/

# 构建生产版本（不设置 VITE_API_URL，默认使用相对路径 /api）
RUN npm run build

# ---------- Stage 2: Serve ----------
FROM nginx:alpine

# 移除默认配置
RUN rm /etc/nginx/conf.d/default.conf

# 复制自定义 Nginx 配置
COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# 从构建阶段复制静态文件
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
