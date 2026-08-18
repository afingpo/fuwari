#!/usr/bin/env fish

# 定义路径变量
set SRC_DIR "/var/www/web-data"
set DEST_DIR "/var/www/web-dist"

set_color green; echo "[INFO] 开始执行部署脚本 deploy.fish"; set_color normal

set_color cyan; echo "[INFO] [1/5] 进入项目目录: $SRC_DIR"; set_color normal
cd $SRC_DIR
if test $status -ne 0
    set_color red; echo "[ERROR] 无法进入目录 $SRC_DIR。部署被终止"; set_color normal
    exit 1
end

set_color cyan; echo "[INFO] [2/5] 从 Origin 拉取最新代码..."; set_color normal
git fetch --all
and git reset --hard origin/main
if test $status -ne 0
    set_color red; echo "[ERROR] Git 更新失败。部署被终止"; set_color normal
    exit 1
end

set_color cyan; echo "[INFO] [3/5] 安装依赖..."; set_color normal
if not pnpm install
    set_color red; echo "[ERROR] pnpm install 失败。部署被终止"; set_color normal
    exit 1
end

set_color cyan; echo "[INFO] [4/5] 构建 Astro..."; set_color normal
if not pnpm run build
    set_color red; echo "[ERROR] 构建失败。同步被阻止"
    exit 1
end

if not test -d dist; or test -z "(ls -A dist 2>/dev/null)"
    set_color red; echo "[ERROR] dist 目录不存在或为空，阻止同步！"; set_color normal
    exit 1
end

set_color cyan; echo "[INFO] [5/5] 同步静态产物至 Caddy 目录..."; set_color normal
mkdir -p $DEST_DIR
rsync -av --delete dist/ $DEST_DIR/

set_color green; echo "[INFO] 部署 Finished"; set_color normal

