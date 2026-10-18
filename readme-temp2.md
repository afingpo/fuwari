# Djot Loader 系统

## 概述

本博客使用 [Djot](https://djot.net/) 作为内容标记语言（替代 Markdown），通过自定义 Astro Content Loader 实现 `.dj` 文件的解析和渲染。

## 文件结构

```
src/
  loaders/
    djotLoader.ts       ← 核心 loader：文件扫描 + 解析 + 渲染
    transformers.ts     ← 内容增强管道：代码高亮 + 字数统计 + 标题提取
  content.config.ts     ← Collection 定义，绑定 loader 和 schema
  content/
    posts/              ← 文章目录（.dj 文件）
    spec/               ← 规格说明目录（.dj 文件）
```

## 核心模块

### 1. djotLoader.ts（src/loaders/djotLoader.ts）

自定义 Astro Content Loader，职责：

1. 递归扫描目录中的 `.dj` 文件
2. 解析 frontmatter（gray-matter）
3. 将 Djot 源文本渲染为 HTML（@djot/djot）
4. 调用 transformers 进行内容增强
5. 存入 Astro content store

#### 文件扫描逻辑

```ts
function getDjotFiles(dir: string, baseDir = dir): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);
    for (const file of list) {
        if (file.startsWith('_')) continue;        // ← 跳过 _ 前缀（如 _revisions/）
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat && stat.isDirectory()) {
            results = results.concat(getDjotFiles(fullPath, baseDir));  // 递归子目录
        } else if (file.endsWith('.dj')) {
            results.push(path.relative(baseDir, fullPath));            // 收集 .dj 文件
        }
    }
    return results;
}
```

**关键行为**：
- 递归扫描所有子目录
- 跳过 `_` 前缀的文件和目录（用于 `_revisions/` 等排除场景）
- 只收集 `.dj` 后缀文件
- 返回相对路径（相对于 base 目录）

#### Loader 导出

```ts
export const djotLoader = (options: { base: string }) => {
    return {
        name: `djot-loader-${path.basename(options.base)}`,
        load: async (context: any) => {
            context.store.clear();
            const djFiles = getDjotFiles(options.base);

            for (const relativePath of djFiles) {
                const filePath = path.join(options.base, relativePath);
                const fileContent = fs.readFileSync(filePath, "utf-8");
                const { data: rawData, content } = matter(fileContent);  // 解析 frontmatter

                const id = relativePath.replace(/\.dj$/, "");           // 生成 ID（去掉 .dj 后缀）
                const parsedData = await context.parseData({ id, data: rawData });

                // Djot → HTML
                const ast = parse(content);
                let html = renderHTML(ast);

                // 内容增强
                html = await highlightCodeBlocks(html);                 // 代码块语法高亮
                const { words, minutes } = getReadingTime(content);     // 字数/阅读时间
                const headings = extractHeadings(html);                 // 标题提取

                context.store.set({
                    id,
                    data: {
                        ...parsedData,      // frontmatter 数据
                        html,               // 渲染后的 HTML
                        headings,           // 标题列表（用于 TOC）
                        remarkPluginFrontmatter: { words, minutes }  // 字数/时间
                    }
                });
            }
        }
    };
};
```

#### 输入/输出

**输入**：`.dj` 文件
```
---
title: "文章标题"
published: 2026-07-08
tags: ["闲谈"]
---

# 正文标题

正文内容...
```

**输出**：存入 content store 的对象
```ts
{
    id: "2026-07-08-00",              // 相对路径去掉 .dj 后缀
    data: {
        title: "文章标题",
        published: Date,
        tags: ["闲谈"],
        // ... 其他 frontmatter 字段
        html: "<h1>正文标题</h1><p>正文内容...</p>",  // 渲染后的 HTML
        headings: [{ depth: 1, slug: "正文标题", text: "正文标题" }],
        remarkPluginFrontmatter: { words: 150, minutes: 1 }
    }
}
```

### 2. transformers.ts（src/loaders/transformers.ts）

可复用的内容增强管道，包含三个独立函数：

#### 2.1 highlightCodeBlocks(html)

使用 Shiki 对 `<pre><code>` 代码块进行语法高亮。

```ts
export async function highlightCodeBlocks(html: string): Promise<string>
```

**处理流程**：
1. 用正则匹配 `<pre><code class="language-xxx">` 块
2. 解码 HTML 实体（`&amp;` → `&`）
3. 调用 Shiki `codeToHtml()` 生成高亮 HTML
4. 替换原始代码块
5. 高亮失败时回退到纯文本（`lang: "txt"`）

**支持语言**：javascript, typescript, html, css, shell, bash, markdown, json, yaml, ini

**主题**：github-dark

**语言别名**：`shellsession` → `shell`

#### 2.2 getReadingTime(text)

计算字数和阅读时间。

```ts
export function getReadingTime(text: string): { words: number; minutes: number }
```

**算法**：
- 中文字：逐字统计（正则 `[\u4e00-\u9fa5]`）
- 英文词：按空格/标点分词（正则 `[a-zA-Z0-9_\u00C0-\u024F]+`）
- 总字数 = 中文字 + 英文词
- 阅读时间 = `Math.max(1, Math.ceil(words / 300))` 分钟（假设每分钟 300 字）

#### 2.3 extractHeadings(html)

从渲染后的 HTML 中提取标题，用于生成目录（TOC）。

```ts
export function extractHeadings(html: string): { depth: number; slug: string; text: string }[]
```

**处理**：
- 正则匹配 `<h1>` ~ `<h6>` 标签
- 提取 `id` 属性作为 slug
- 提取标题文本（去除 HTML 标签）

### 3. content.config.ts（src/content.config.ts）

定义 Astro Content Collection，绑定 loader 和 schema。

```ts
import { djotLoader } from "@/loaders/djotLoader";

const postsCollection = defineCollection({
    loader: djotLoader({ base: './src/content/posts' }),
    schema: z.object({
        title: z.string(),
        author: z.array(z.string()).default(["涵哲子"]),
        published: z.date(),
        updated: z.date().optional(),
        slug: z.string().optional(),
        draft: z.boolean().optional().default(false),
        description: z.string().optional().default(""),
        image: z.string().optional().default(""),
        tags: z.array(z.string()).optional().default([]),
        category: z.string().optional().nullable().default(""),
        sync: z.boolean().default(false),
        lang: z.string().optional().default(""),
        comments: z.boolean().optional().default(true),
        prevTitle: z.string().default(""),
        prevSlug: z.string().default(""),
        nextTitle: z.string().default(""),
        nextSlug: z.string().default(""),
        revisions: z.array(z.object({
            version: z.number(),
            date: z.date(),
            note: z.string().default("")
        })).optional().default([]),
        html: z.string().optional(),
        headings: z.array(z.any()).optional(),
        remarkPluginFrontmatter: z.object({
            words: z.number(),
            minutes: z.number()
        }).optional()
    }),
});

const specCollection = defineCollection({
    loader: djotLoader({ base: './src/content/spec' }),
    schema: z.object({
        title: z.string().optional(),
        description: z.string().optional(),
        html: z.string().optional(),
        headings: z.array(z.any()).optional(),
    }).optional(),
});

export const collections = {
    posts: postsCollection,
    spec: specCollection,
};
```

**两个 Collection**：
- `posts`：博客文章，完整 schema
- `spec`：规格说明，精简 schema

## Djot 语法简介

Djot 是一种轻量级标记语言，语法类似 Markdown 但更简洁。

### Frontmatter

使用 `---` 包裹的 YAML：

```yaml
---
title: "文章标题"
published: 2026-07-08
tags: ["标签1", "标签2"]
category: "分类"
---
```

### 正文语法

| 元素 | 语法 | 示例 |
|------|------|------|
| 标题 | `#` ~ `######` | `## 二级标题` |
| 段落 | 空行分隔 | `第一段\n\n第二段` |
| 粗体 | `*text*` | `*粗体*` |
| 斜体 | `_text_` | `_斜体_` |
| 删除线 | `-text-` | `-删除线-` |
| 链接 | `[text](url)` | `[Google](https://google.com)` |
| 图片 | `![alt](url)` | `![photo](/assets/img.webp)` |
| 行内代码 | `` `code` `` | `` `console.log()` `` |
| 代码块 | ` ```lang ` | 见下方 |
| 引用 | `>` | `> 引用文本` |
| 无序列表 | `-` | `- 列表项` |
| 有序列表 | `1.` | `1. 列表项` |
| 水平线 | `---` | `---` |
| 上标 | `^text^` | `^上标^` |
| 下标 | `~text~` | `~下标~` |
| 脚注 | `[^1]` | `[^1]: 脚注内容` |

### 代码块

````djot
```python
def hello():
    print("Hello, World!")
```
````

### 图片

```djot
![图片描述](/assets/2026-07-08-00-p1.webp)
```

图片路径说明：
- 绝对路径（`/assets/...`）：对应 `public/assets/` 目录
- 相对路径：相对于文章文件所在目录

## 页面中使用

### 获取文章数据

```astro
---
import { getSortedPosts } from "@utils/content-utils";

const blogEntries = await getSortedPosts();
// 或
const posts = await getCollection("posts");
---

{posts.map((post) => (
    <h2>{post.data.title}</h2>
    <div set:html={post.data.html} />
    <p>{post.data.remarkPluginFrontmatter.words} 字</p>
)}
```

### 渲染 HTML

```astro
<Markdown class="mb-6 markdown-content">
    <Fragment set:html={post.data.html} />
</Markdown>
```

`Markdown` 组件（`src/components/misc/Markdown.astro`）提供：
- `prose dark:prose-invert` 排版样式
- `custom-md` 自定义样式类
- 代码块复制按钮功能

### 获取标题（TOC）

```astro
const { headings } = post.data;
// headings: [{ depth: 1, slug: "xxx", text: "xxx" }, ...]
```

## 依赖包

| 包名 | 用途 |
|------|------|
| `@djot/djot` | Djot 解析器 + HTML 渲染器 |
| `gray-matter` | YAML frontmatter 解析 |
| `shiki` | 代码块语法高亮 |

## 配置（astro.config.mjs）

```js
vite: {
    assetsInclude: ["**/*.dj"],  // 将 .dj 文件视为 Vite 资产
}
```

## 数据流

```
.dj 文件
  │
  ├─ getDjotFiles()     扫描目录，收集 .dj 文件路径
  │
  ├─ matter()           解析 frontmatter → { data, content }
  │
  ├─ context.parseData() 验证/转换 frontmatter 数据
  │
  ├─ parse() + renderHTML()  Djot AST → HTML
  │
  ├─ highlightCodeBlocks()   代码块语法高亮
  ├─ getReadingTime()        字数/阅读时间计算
  ├─ extractHeadings()       标题提取
  │
  └─ context.store.set()     存入 Astro content store
```

## 注意事项

1. **ID 生成**：`id = relativePath.replace(/\.dj$/, "")`，如 `posts/2026-07-08-00`
2. **目录排除**：`_` 前缀的文件/目录会被跳过（用于 `_revisions/`）
3. **编码**：文件必须为 UTF-8 编码
4. **frontmatter 必填字段**：`title` 和 `published` 是 posts collection 的必填字段
5. **html/headings 是运行时生成**：不在 .dj 文件中，由 loader 处理后注入
6. **字数统计**：中英文混合统计，300 字/分钟
