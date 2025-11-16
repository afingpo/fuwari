---
title: 给fuwari添加NMP播放器
published: 2025-11-16
updated: 2025-11-16
tags: [Blog, Astro, Fuwari]
category: "博客搭建"
slug: add-NMP-To-Fuwari
---
上周在逛 Bilibili 的时候，偶然刷到了这个项目，UI 尚可，便尝试一下。
官网：[https://nmp.hypcvgm.top](https://nmp.hypcvgm.top)

![[p1.png]]
## 准备工具

- 一个善良、友好的 AI，在报错时先问问它
- 一个优良的、已经配置好的环境，Windows 建议使用 `Git Bash` 或 `WSL`（文章使用 `Termux` 的 ` Proot-distro Archlinux ` 环境），应有：
	- 已经配置好的 Git 环境
	- `nodejs` + `pnpm` 或 `npm`
	-  一个符合自己使用习惯的 IDE（文章使用自己配置的 `Neovim`）
- NMP 文档：[https://docs.nmp.hypcvgm.top](https://docs.nmp.hypcvgm.top)

:::tip
1. NMP 仅支持网易云歌曲，若有需求可以寻找其它播放器
2. 若想要播放 VIP 歌曲，请在 [NMP文档](https://docs.nmp.hypcvgm.top)  自行配置 api
:::

## Let us go!

:::tip
本文只介绍 `浮动模式`， 这是最常用的模式，会出现在博客四角处，可以缩小/放大
:::
  
---
### 下载 css 与 js 文件（使用 CDN 可以略过）

下载链接： [Github](https://codeload.github.com/numakkiyu/NeteaseMiniPlayer/zip/refs/tags/v2.0.10.1)

下载后解压，拿出 `netease-mini-player-v2.css` 和 `netease-mini-player-v2.js`，放到博客根目录下的该位置：
- `public/NMP/`

### 配置 Components

新建文件 `NMP.astro`：
```astro title="src/components/NMP.astro"
---
---
<!-- NeteaseMiniPlayer -->

<div
  class="netease-mini-player"
  data-playlist-id="${yourOwnPlaylistId}"
  data-embed="false"
  data-position="bottom-left"
  data-lyric="true"
  data-theme="auto">
</div>

<link
  rel="stylesheet"
  href="/NMP/netease-mini-player-v2.css" />
<script is:inline
  src="/NMP/netease-mini-player-v2.js">
</script>
```
请将 `${yourOwnPlaylistId}` 替换为自己的 `歌单id`

:::note
如果使用 CDN，请对文件后半部分进行替换：
```astro title="src/components/NMP.astro" del{1-6} ins{7-12}
<link
  rel="stylesheet"
  href="/NMP/netease-mini-player-v2.css" />
<script is:inline
  src="/NMP/netease-mini-player-v2.js">
</script>
<link
  rel="stylesheet"
  href="https://api.hypcvgm.top/NeteaseMiniPlayer/netease-mini-player-v2.css" />
<script is:inline
  src="https://api.hypcvgm.top/NeteaseMiniPlayer/netease-mini-player-v2.js">
</script>
```
:::

### 配置 Layout

更改文件 `Layout.astro`:
```astro title="src/layouts/Layout.astro" ins{2,25}
---
import NMP from "@components/NMP.astro";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import ConfigCarrier from "@components/ConfigCarrier.astro";
import { profileConfig, siteConfig } from "@/config";---
import NMP from "@components/NMP.astro";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";

import ConfigCarrier from "@components/ConfigCarrier.astro";
import { profileConfig, siteConfig } from "@/config";

...

if (window.swup) {
        setup()
} else {
        document.addEventListener("swup:enable", setup)
}
</script>
<NMP />
```
### 上线测试

```bash
pnpm run dev
```

![[p2.png]]

已经成功配置！
