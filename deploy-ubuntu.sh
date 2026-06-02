#!/bin/bash
# ============================================
# 大创指南系统 - Ubuntu 部署脚本
# ============================================
# 使用方法:
#   chmod +x deploy-ubuntu.sh
#   sudo ./deploy-ubuntu.sh
# ============================================

set -e

# ---- 配置 ----
PROJECT_NAME="gdut-dachuang-guide"
DEPLOY_DIR="/home/zza/projects/${PROJECT_NAME}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "=========================================="
echo "  大创指南系统 - Ubuntu 部署脚本"
echo "=========================================="
echo ""

# ---- 1. 检查并安装 Docker ----
echo "[1/6] 检查 Docker..."
if ! command -v docker &> /dev/null; then
    echo "  Docker 未安装，正在安装..."
    apt-get update
    apt-get install -y ca-certificates curl gnupg
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo \
      "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
      tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    echo "  Docker 安装完成"
else
    echo "  Docker 已安装: $(docker --version)"
fi

# ---- 2. 创建部署目录 ----
echo "[2/6] 创建部署目录..."
mkdir -p /home/zza/projects
mkdir -p "${DEPLOY_DIR}"
echo "  目录: ${DEPLOY_DIR}"

# ---- 3. 复制项目文件 ----
echo "[3/6] 复制项目文件..."
rsync -av --delete \
    --exclude '.git' \
    --exclude 'node_modules' \
    --exclude 'dist' \
    --exclude 'db_data' \
    --exclude 'uploads_data' \
    "${SCRIPT_DIR}/" "${DEPLOY_DIR}/"
echo "  文件复制完成"

# ---- 4. 配置环境变量 ----
echo "[4/6] 配置环境变量..."
if [ ! -f "${DEPLOY_DIR}/.env.docker" ]; then
    echo "  .env.docker 不存在，从模板创建..."
    cat > "${DEPLOY_DIR}/.env.docker" << 'ENVEOF'
# ============================================
# Docker 部署环境变量
# ============================================

# ---- MySQL 数据库 ----
MYSQL_ROOT_PASSWORD=your_root_password_here
MYSQL_DATABASE=gdut_dachuang
MYSQL_USER=dachuang
MYSQL_PASSWORD=your_db_password_here

# ---- 后端服务 ----
BACKEND_PORT=5000
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d

# ---- 前端映射端口 ----
FRONTEND_PORT=8080

# ---- CORS ----
CORS_ORIGIN=http://YOUR_SERVER_IP:8080

# ---- AI API 密钥 ----
ALIYUN_DASHSCOPE_API_KEY=your_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
ENVEOF
    echo ""
    echo "  !! 请修改 ${DEPLOY_DIR}/.env.docker 中的密码和密钥 !!"
    echo ""
else
    echo "  .env.docker 已存在，跳过"
fi

# 复制 .env 到服务器目录（如果存在）
if [ -f "${SCRIPT_DIR}/.env" ] && [ ! -f "${DEPLOY_DIR}/.env" ]; then
    cp "${SCRIPT_DIR}/.env" "${DEPLOY_DIR}/.env"
    echo "  已复制 .env 文件"
fi

# ---- 5. 构建并启动容器 ----
echo "[5/6] 构建并启动 Docker 容器..."
cd "${DEPLOY_DIR}"
docker compose --env-file .env.docker up -d --build

# ---- 6. 等待服务就绪 ----
echo "[6/6] 等待服务启动..."
sleep 10

echo ""
echo "=========================================="
echo "  部署完成！"
echo "=========================================="
echo ""
echo "  项目路径: ${DEPLOY_DIR}"
echo "  前端地址: http://YOUR_SERVER_IP:8080"
echo "  后端API:  http://YOUR_SERVER_IP:5000/api"
echo ""
echo "  常用命令:"
echo "    查看状态: docker compose ps"
echo "    查看日志: docker compose logs -f"
echo "    停止服务: docker compose down"
echo "    重启服务: docker compose restart"
echo "    重新部署: docker compose up -d --build"
echo ""
