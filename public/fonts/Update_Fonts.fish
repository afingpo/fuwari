#!/usr/bin/fish

# 1. 定义输出函数
function c.console -a level detail
	set -l color ""
	set -l title ""
	switch $level
		case error err # short name: "err"
            set color "red"
			set title "Error"
		case info normal # short name: "info"
			set color "normal"
			set title "Info"
		case success ok # short name: "ok"
            set color "green"
			set title "Success"
    end

	set_color $color
	echo "[$title]: $detail"
end

# 2. 环境检查
for tool in curl woff2_compress
    type -q $tool; or c.console err "$tool not found"
end

# 3. 定义下载转换函数
function get_font -a repo file
    c.console info "开始处理 file"
    
    if curl -L -f -# -O "https://github.com/$repo/releases/latest/download/$file"
        c.console ok "成功下载 $file"
		if string match -qv "*.woff2" "$file"
            woff2_compress "$file"; and rm "$file"
			c.console ok "成功转换 $file"
        end
    else
        c.console err "无法下载 $file"
    end
end

# 4. 直接调用
get_font "lxgw/LxgwWenKai-Lite" "LXGWWenKaiLite-Regular.ttf"
get_font "lxgw/LxgwWenkaiTC" "LXGWWenKaiTC-Regular.ttf"

