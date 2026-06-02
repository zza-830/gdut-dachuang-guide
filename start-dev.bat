@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo   GDUT 大创指南 - Docker 一键启动
echo ========================================
echo.

cd /d "%~dp0"

:: 标记是否需要恢复代理
set PROXY_DISABLED=0

:: ---- 步骤 0: 检查 Docker 是否运行 ----
echo [0/5] 检查 Docker 是否运行...
docker info >nul 2>&1
if errorlevel 1 (
    echo    [错误] Docker 未运行！请先启动 Docker Desktop。
    pause
    exit /b 1
)
echo    Docker 运行正常
echo.

:: ---- 步骤 0.5: 检查系统代理 ----
echo [0.5/5] 检查系统代理设置...
set PROXY_ENABLED=0
for /f "tokens=3" %%a in ('reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyEnable 2^>nul ^| findstr ProxyEnable') do (
    if "%%a"=="0x1" set PROXY_ENABLED=1
)

if "!PROXY_ENABLED!"=="1" (
    :: 获取代理地址
    for /f "tokens=3" %%a in ('reg query "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyServer 2^>nul ^| findstr ProxyServer') do set PROXY_ADDR=%%a
    echo    检测到系统代理: !PROXY_ADDR!

    :: 用 curl 快速测试代理连通性
    curl --proxy "http://!PROXY_ADDR!" --connect-timeout 3 -s -o nul https://www.baidu.com >nul 2>&1
    if !errorlevel! equ 0 (
        echo    代理可用，继续使用代理
    ) else (
        echo    [警告] 代理 !PROXY_ADDR! 不可达
        echo    临时关闭系统代理以允许 Docker 拉取镜像...
        reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /f >nul 2>&1
        set PROXY_DISABLED=1
        echo    系统代理已临时关闭
        ping -n 4 127.0.0.1 >nul 2>&1
    )
) else (
    echo    未启用系统代理
)
echo.

:: ---- 步骤 1: 检查 .env 文件 ----
echo [1/5] 检查环境变量配置...
if not exist ".env" (
    if exist ".env.docker" (
        echo    .env 不存在，从 .env.docker 复制...
        copy /Y ".env.docker" ".env" >nul
    ) else (
        echo    [错误] 未找到 .env 或 .env.docker 文件！
        goto restore_proxy
    )
)
echo    .env 配置就绪
echo.

:: ---- 步骤 2: 停止旧容器 ----
echo [2/5] 停止旧容器...
docker compose down >nul 2>&1
echo    旧容器已清理
echo.

:: ---- 步骤 3: 构建并启动所有服务 ----
echo [3/5] 构建并启动 Docker 服务...

:: 先启动数据库（单独启动，避免 backend/frontend 构建期间 db 反复重启）
docker compose up -d db
if errorlevel 1 (
    echo.
    echo    [错误] 数据库启动失败！
    goto restore_proxy
)

:: 强制重新构建前后端镜像（--no-cache 确保代码修改一定生效）
echo    重新构建前后端镜像（这需要约 1~3 分钟）...
docker compose build --no-cache backend frontend
if errorlevel 1 (
    echo.
    echo    [错误] 镜像构建失败！
    goto restore_proxy
)

:: 启动前后端容器
docker compose up -d backend frontend
if errorlevel 1 (
    echo.
    echo    [错误] 容器启动失败！
    goto restore_proxy
)
echo    容器已启动
echo.

:: ---- 步骤 4: 等待数据库就绪 ----
echo [4/5] 等待数据库就绪...
set MAX_WAIT=300
set WAITED=0

:wait_db
if !WAITED! geq !MAX_WAIT! (
    echo    [错误] 数据库在 !MAX_WAIT! 秒内未就绪
    echo    请手动运行 docker logs dachuang_mysql 查看日志
    goto restore_proxy
)

:: 用 docker exec 直接测试数据库连接（比 inspect 健康状态更可靠）
docker exec dachuang_mysql mysqladmin ping -uroot -proot --silent >nul 2>&1
if !errorlevel! equ 0 (
    echo    数据库已就绪（等待了 !WAITED! 秒）
    goto db_ready
)

:: 每 5 秒检查一次
ping -n 6 127.0.0.1 >nul 2>&1
set /a WAITED+=5
echo    等待数据库启动中... (!WAITED!s / !MAX_WAIT!s)
goto wait_db

:db_ready
echo.

:: ---- 步骤 4.5: 重启后端确保数据库连接 ----
echo    重启后端以确保数据库连接...
docker restart dachuang_backend >nul 2>&1

:: 等待后端就绪
set WAITED=0
set MAX_WAIT_BE=120

:wait_backend
if !WAITED! geq !MAX_WAIT_BE! (
    echo    [警告] 后端未在 !MAX_WAIT_BE! 秒内就绪，仍尝试打开页面...
    goto open_browser
)

:: 用 curl 测试后端 API 是否响应
curl -s -o nul -w "" http://localhost:5000/api/health >nul 2>&1
if !errorlevel! equ 0 (
    echo    后端已就绪（等待了 !WAITED! 秒）
    goto open_browser
)

ping -n 6 127.0.0.1 >nul 2>&1
set /a WAITED+=5
echo    等待后端启动中... (!WAITED!s / !MAX_WAIT_BE!s)
goto wait_backend

:open_browser
echo.

:: ---- 步骤 5: 打开浏览器 ----
echo [5/5] 所有服务已就绪，打开浏览器...
echo.
echo ========================================
echo   前端页面 - http://localhost:8080
echo   后端 API - http://localhost:5000/api
echo   数据库   - localhost:3307
echo ========================================
echo.
echo   查看日志 - docker compose logs -f
echo   停止服务 - docker compose down
echo ========================================
echo.

:: 尝试用无痕模式打开，避免浏览器缓存旧版 JS
:: 优先 Chrome → Edge → 系统默认浏览器
set OPENED=0

if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles%\Google\Chrome\Application\chrome.exe" --incognito "http://localhost:8080"
    set OPENED=1
)
if "!OPENED!"=="0" if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" (
    start "" "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" --incognito "http://localhost:8080"
    set OPENED=1
)
if "!OPENED!"=="0" if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" (
    start "" "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" --inprivate "http://localhost:8080"
    set OPENED=1
)
if "!OPENED!"=="0" (
    echo    [提示] 未找到 Chrome/Edge，使用系统默认浏览器打开
    echo    请手动按 Ctrl+Shift+R 强制刷新以清除缓存
    start http://localhost:8080
)

echo 启动完成！
goto restore_proxy

:: ---- 恢复代理设置 ----
:restore_proxy
if "!PROXY_DISABLED!"=="1" (
    echo.
    echo    恢复系统代理设置...
    reg add "HKCU\Software\Microsoft\Windows\CurrentVersion\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /f >nul 2>&1
    echo    系统代理已恢复
)
pause
