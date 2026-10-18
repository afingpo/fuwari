# 文章修订记录功能

## 功能概述

为博客文章提供「修订」功能，记录文章的大修历史。每篇文章可拥有多个旧版本（v1、v2...），读者可查看修订记录列表和旧版本全文。

## 目录结构

```
src/content/posts/
  文章名/
    index.dj              ← 当前版本（正常加载为文章）
    _revisions/           ← 旧版本目录（下划线前缀，loader 自动跳过）
      v1.dj               ← 第一个旧版本
      v2.dj               ← 第二个旧版本
```

**关键机制**：`src/loaders/djotLoader.ts` 的 `getDjotFiles` 函数会跳过以下划线开头的文件/目录（第15行：`if (file.startsWith('_')) continue;`），因此 `_revisions/` 不会被当作独立文章加载到 posts collection 中。

## 数据结构

### 文章 frontmatter（index.dj）

```yaml
---
title: "文章标题"
published: 2026-07-08
slug: "2026-07-08-00"
description: "文章描述"
author: ["涵哲子"]
tags: ["闲谈"]
category: "杂谈随笔"
revisions:
  - version: 1
    date: 2026-09-25
    note: "修改错别字"
  - version: 2
    date: 2026-10-15
    note: "重写第三章"
---
```

### Schema 定义（src/content.config.ts）

```ts
revisions: z.array(z.object({
    version: z.number(),
    date: z.date(),
    note: z.string().default("")
})).optional().default([])
```

### 旧版本文件（_revisions/v1.dj）

标准 .dj 文件，包含完整 frontmatter + 正文：

```yaml
---
title: "文章标题"
published: 2026-07-08
description: "初版描述"
---

旧版本正文内容...
```

## 涉及文件

### 新增文件

| 文件 | 作用 |
|------|------|
| `src/utils/revision-utils.ts` | 修订功能工具函数 |
| `src/pages/posts/[...slug]/revisions.astro` | 修订记录列表页 |
| `src/pages/posts/[...slug]/revisions/[version].astro` | 旧版本全文页 |

### 修改文件

| 文件 | 改动内容 |
|------|----------|
| `src/content.config.ts` | posts schema 新增 `revisions` 字段 |
| `src/components/PostMeta.astro` | 新增 Props：`revisions`、`revisionUrl`；当 revisions 非空时显示「修订记录 (N)」按钮 |
| `src/pages/posts/[...slug].astro` | 导入 `getRevisionUrl`，传递 `revisions` 和 `revisionUrl` 给 PostMetadata |
| `src/i18n/i18nKey.ts` | 新增 key：`revisionHistory`、`revision`、`revisions`、`version`、`revisionNote`、`currentVersion`、`oldVersion`、`viewDiff`、`viewFullVersion`、`archivedVersion`、`returnToRevisions`、`noRevisions` |
| `src/i18n/languages/zh_CN.ts` | 新增中文翻译 |
| `src/i18n/languages/en.ts` | 新增英文翻译 |

## 页面路由

| 路由 | 页面 | 生成条件 |
|------|------|----------|
| `/posts/{slug}/` | 文章页 | 始终生成 |
| `/posts/{slug}/revisions/` | 修订记录列表 | `revisions` 数组非空时生成 |
| `/posts/{slug}/revisions/{version}/` | 旧版本全文 | 每个 revision 条目生成一个 |

## 工具函数（src/utils/revision-utils.ts）

```ts
// 获取 _revisions 目录路径
getRevisionsDir(entryId: string): string

// 检查是否有 _revisions 目录
hasRevisionsDir(entryId: string): boolean

// 读取所有版本的渲染内容
getRevisionContents(entryId: string, revisions: Revision[]): Promise<RevisionContent[]>

// 读取单个版本的原始文件内容
getRevisionRawContent(entryId: string, version: number): string | null

// 获取修订列表页 URL
getRevisionUrl(slug: string): string
```

## 首次大修操作流程

```bash
# 1. 将当前版本复制为 v1
cp src/content/posts/文章名/index.dj src/content/posts/文章名/_revisions/v1.dj

# 2.（可选）修改 _revisions/v1.dj 的 frontmatter，如添加 description

# 3. 修改 index.dj 正文为新版本内容

# 4. 在 index.dj frontmatter 中添加 revisions 记录
```

```yaml
revisions:
  - version: 1
    date: 2026-09-25
    note: "描述这次大修改了什么"
```

## UI 说明

### 文章页（PostMeta 区域）

当 `revisions.length > 0` 时，在标签后面显示：
```
🕐 修订记录 (1)
```
点击跳转到 `/posts/{slug}/revisions/`。

### 修订记录列表页

- 顶部：标题「修订记录」+ 文章标题
- 返回链接：「← 当前版本」
- 版本列表：每个版本显示 `v1 版本 1    2026-09-25    查看全文 →`，附修订说明
- 无修订时显示「暂无修订记录」

### 旧版本全文页

- 顶部黄色警示 banner（`#FFE500`，直角，铺满卡片顶部）：
  ```
  ⚠ 你正在查看《文章标题》的 v1 归档版本
  ```
- 完整文章渲染（字数、阅读时间、标题、元数据、正文）
- 底部「← 返回修订记录」链接
- **不显示**：License、上/下篇导航、评论

## i18n 翻译

```ts
// 中文
revisionHistory: "修订记录"
revision: "修订"
version: "版本"
viewFullVersion: "查看全文"
archivedVersion: "你正在查看《{title}》的 v{version} 归档版本"
returnToRevisions: "返回修订记录"
noRevisions: "暂无修订记录"

// 英文
revisionHistory: "Revision History"
archivedVersion: "You are viewing the v{version} archived version of «{title}»"
returnToRevisions: "Return to Revision History"
```

`archivedVersion` 支持参数替换，在 `[version].astro` 中使用：
```ts
i18n(I18nKey.archivedVersion)
    .replace("{title}", entry.data.title)
    .replace("{version}", version.toString())
```

## 注意事项

1. **YAML 格式**：`revisions` 数组必须使用 block sequence 格式，不能混合 flow 语法
   ```yaml
   # 正确
   revisions:
     - version: 1
       date: 2026-09-25
       note: "说明"

   # 错误
   revisions: [
       - version: 1
       - date: 2026-09-25
   ]
   ```

2. **版本编号**：`version` 是数字，对应文件名 `v{N}.dj`，从 1 开始递增

3. **静态构建**：所有页面在 `astro build` 时生成，`getStaticPaths` 需遍历所有文章的 revisions 数组

4. **图片路径**：旧版本中的图片引用（如 `![photo](/assets/xxx.webp)`）使用绝对路径，需确保图片存在于 `public/assets/` 目录
