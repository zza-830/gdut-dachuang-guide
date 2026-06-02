# 大创指南系统 - Ubuntu 部署指南

## 前置条件

- Ubuntu 20.04+ 服务器
- 至少 2GB 内存
- 开放端口: 8080 (前端), 5000 (后端API), 3307 (MySQL)

## 快速部署

### 1. 传输项目到服务器

```bash
# 在本地执行，将项目推送到服务器
scp -r D:/Users/projects/gdut-dachuang-guide zza@YOUR_SERVER_IP:/home/zza/projects/
```

### 2. SSH 登录服务器

```bash
ssh zza@YOUR_SERVER_IP
cd /home/zza/projects/gdut-dachuang-guide
```

### 3. 执行部署脚本

```bash
chmod +x deploy-ubuntu.sh
sudo ./deploy-ubuntu.sh
```

### 4. 修改环境变量

```bash
nano /home/zza/projects/gdut-dachuang-guide/.env.docker
```

修改以下配置:
- `MYSQL_ROOT_PASSWORD`: MySQL root 密码
- `MYSQL_PASSWORD`: 数据库用户密码
- `JWT_SECRET`: JWT 签名密钥
- `CORS_ORIGIN`: 改为 `http://YOUR_SERVER_IP:8080`
- `ALIYUN_DASHSCOPE_API_KEY`: 你的阿里云 API 密钥

### 5. 重启服务使配置生效

```bash
cd /home/zza/projects/gdut-dachuang-guide
docker compose --env-file .env.docker down
docker compose --env-file .env.docker up -d --build
```

## 访问地址

- 前端: `http://YOUR_SERVER_IP:8080`
- 后端API: `http://YOUR_SERVER_IP:5000/api`
- 数据库: `YOUR_SERVER_IP:3307`

## 常用命令

```bash
cd /home/zza/projects/gdut-dachuang-guide

# 查看容器状态
docker compose ps

# 查看日志
docker compose logs -f

# 查看特定服务日志
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f db

# 停止服务
docker compose down

# 重启服务
docker compose restart

# 重新构建并部署
docker compose --env-file .env.docker up -d --build

# 进入容器调试
docker exec -it dachuang_backend sh
docker exec -it dachuang_mysql bash

# 数据库重置（删除数据卷）
docker compose down -v
docker compose --env-file .env.docker up -d --build
```

## 防火墙配置

```bash
# 开放端口
sudo ufw allow 8080/tcp
sudo ufw allow 5000/tcp
sudo ufw allow 3307/tcp
sudo ufw reload
```

## 数据备份

```bash
# 备份数据库
docker exec dachuang_mysql mysqldump -u root -p gdut_dachuang > backup_$(date +%Y%m%d).sql

# 备份上传文件
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz /var/lib/docker/volumes/gdut-dachuang-guide_uploads_data/_data
```

## 故障排查

```bash
# 检查容器状态
docker compose ps

# 检查容器日志
docker compose logs --tail=100

# 检查端口占用
sudo netstat -tlnp | grep -E '8080|5000|3307'

# 检查磁盘空间
df -h

# 检查内存使用
free -h
```
