---
published: 2025-06-29
title: Hexo博客搭建之从入门到入土
slug: "hexo-blog-bluiding"
tags: [Hexo]
category: "Hexo"
series: "博客搭建"
---

## 前言

大概是上个月，在看国光大佬的[Termux 高级终端安装使用配置教程](https://www.sqlsec.com/2018/05/termux.html)得时候，其中有一段是这么说的：

> Hexo 是一个用 Nodejs 编写的快速、简洁且高效的博客框架。Hexo 使用 Markdown 解析文章，在几秒内，即可利用靓丽的主题生成静态网页。*另外大家看到国光我的博客就是使用 Hexo 搭建的哦*。

这时就有了搭建博客的想法。当然，为了在Android端操作，容器就是[Termux](https://github.com/termux/termux-app)

## 环境准备

- npm (或pnpm)
- node.js
- termux  
  注：`termux`的作用是模拟Linux环境，所以Linux/mac端操作基本大同小异；Win端需酌情替换命令（WSL也可）。

## 安装环境 (已有可略过)

注：仅展示Termux上的命令，请酌情替换

- 安装node.js

```bash
pkg install nodejs
```

- 安装pnpm

```bash
pkg install pnpm
```

- 验证安装

```bash
node -v
npm -v

# pnpm -v
```

- 安装Hexo

```bash
npm i -g hexo-cli
```

注：`npm i`为`npm install`简写

## 初始化Hexo项目

```bash
# 创建博客项目
hexo init my-blog

# 进入项目目录
cd my-blog

# 安装依赖
npm install
```

注：这里的`my-blog`仅作为演示，你可以替换为你喜欢的名字

## 启动本地服务器

```bash
hexo s
```

浏览器访问 `http://localhost:4000` 预览

## 常用命令速查

| 命令              | 功能     | 简写        |
|-------------------|---------|------------|
| `hexo server`     | 启动服务器 | `hexo s`   |
| `hexo generate`   | 生成静态文件 | `hexo g`   |
| `hexo deploy`     | 部署     | `hexo d`   |
| `hexo clean`      | 清除缓存 | `hexo cl`  |
| `hexo new "标题"` | 新建文章 | `hexo n`   |

- 常用命令组合
```bash
hexo cl && hexo g && hexo s
hexo cl && hexo g && hexo d
```

## 创建新文章

```bash
hexo new "我的第一篇博客"
```

文件位置：`source/_posts/我的第一篇博客.md`

## 更换主题（Butterfly示例）

1. 安装主题：
```bash
npm i hexo-theme-butterfly --save
```

2. 修改主配置（`_config.yml`）：
```yaml
theme: butterfly
```

3. 配置主题：
   - 复制一份配置文件到主目录下，改名为`_config.butterfly.yml`
   - 详见Butterfly主题官网：[Butterfly](https://butterfly.js.org)

## 部署到GitHub Pages

1. 安装部署插件：

```bash
npm install hexo-deployer-git --save
```

2. 配置（`_config.yml`）：

```yaml
deploy:
  type: git
  repo: git@github.com:<user.name>/<user.repo>.git
  branch: main
```

注：请替换`<user.name>`为您的用户名，`<user.repo>`为您用来存放页面文件的仓库

3. 生成并部署：

```bash
hexo cl && hexo g && hexo d
```

## 备份策略
```bash
# 初始化Git仓库
git init

# 设置本地默认分支名
git branch -m "main"

# 添加所有文件
git add .

# 提交更改
git commit -m "博客备份"

# 推送到远程仓库
git remote add origin git@github.com:<user.name>/<user.repo>.git
git push -u origin main
```

注：请替换`<user.name>`为您的用户名，`<user.repo>`为您用来存放备份文件的仓库

## 完成配置

最终主要目录结构：
```
.
├── _config.yml
├── _config.butterfly.yml
├── package.json
├── source/
│   └── _posts/
│       ├── 我的第一篇博客.md     # Markdown文件
│       └── 我的第一篇博客/       # 同名资源文件夹
│           └── cover.jpg       # 文章封面
└── themes/
    └── butterfly/
```

注：在新版本，您更常见会遇到主题文件在`node_modules`下的情况。如果你想要自定义主题文件、修改主题，请自行复制到`themes`目录下

## 维护命令
```bash
# 日常更新流程
hexo cl && hexo g && hexo d

# 新建文章
hexo new "文章标题"

# 本地调试
hexo cl && hexo g && hexo s
```

## 部署到Netlify/Vercel（推荐）

### Netlify部署步骤：
1. 将代码推送到GitHub仓库
2. 登录 [Netlify](https://app.netlify.com)
3. 选择 "New site from Git" > GitHub
4. 配置构建设置：
   - **构建命令:** `hexo generate`
   - **发布目录:** `public`
5. 点击 "Deploy site"

### Vercel部署步骤：
1. 登录 [Vercel](https://vercel.com)
2. 点击 "Add New Project"
3. 导入GitHub仓库
4. 配置：
   - **框架预设:** Hexo
   - **输出目录:** public
5. 点击 "Deploy"

## 后记

Netlify和Vercel都提供了比GitHub Page更好的页面加载速度和操作体验。对于域名，您可以寻找免费域名（如.us.kg、.dpdns.org等）或到付费平台购买专业域名。希望您能有一个愉快的博客搭建体验。
