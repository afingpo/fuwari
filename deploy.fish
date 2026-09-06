#!/usr/bin/env fish

mkdir -p logs
# 1. 动态生成日志
set LOG_FILE "logs/deploy_"(date +'%Y-%m-%d_%H-%M-%S')".log"

# 2. 定义内部部署逻辑
function _do_deploy
    set SRC_DIR "/var/www/web-data"
    set DEST_DIR "/var/www/web-dist"

    set_color green; echo "[INFO] 开始执行部署脚本 deploy.fish"; set_color normal

    set_color cyan; echo "[INFO] [1/5] 进入项目目录: $SRC_DIR"; set_color normal
    cd $SRC_DIR
    if test $status -ne 0
        set_color red; echo "[ERROR] 无法进入目录 $SRC_DIR。部署被终止"; set_color normal
        return 1
    end

    set_color cyan; echo "[INFO] [2/5] 从 Origin 拉取最新代码..."; set_color normal
    git fetch --all
    and git reset --hard origin/main
    if test $status -ne 0
        set_color red; echo "[ERROR] Git 更新失败。部署被终止"; set_color normal
        return 1
    end

    set_color cyan; echo "[INFO] [3/5] 安装依赖..."; set_color normal
    if not NO_UPDATE_CHECK=1 pnpm install --frozen-lockfile --prefer-offline
        set_color red; echo "[ERROR] pnpm install 失败。部署被终止"; set_color normal
        return 1
    end

        set_color cyan; echo "[INFO] [4/5] 构建 Astro..."; set_color normal
    if not UV_THREADPOOL_SIZE=2 NODE_OPTIONS="--max-old-space-size=1536" pnpm run build
        set_color red; echo "[ERROR] 构建失败。同步被阻止"; set_color normal
        return 1
    end

    # 修复：使用 count 计算文件数量，防止参数展开导致语法崩溃
    if not test -d dist; or test (count dist/*) -eq 0
        set_color red; echo "[ERROR] dist 目录不存在或为空，阻止同步！"; set_color normal
        return 1
    end
    
    set_color cyan; echo "[INFO] [5/5] 同步静态产物至 Caddy 目录..."; set_color normal
    mkdir -p $DEST_DIR
    rsync -av --delete dist/ $DEST_DIR/

    set_color green; echo "[INFO] 部署 Finished"; set_color normal
end

# 3. 执行函数，同时写入日志与终端输出，并透传 _do_deploy 的退出码
_do_deploy 2>&1 | tee -a $LOG_FILE
exit $pipestatus[1]

