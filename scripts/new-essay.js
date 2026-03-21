import fs from 'fs';
import path from 'path';

/**
 * 自动生成 Astro 博客文章/散文模板脚本
 * 用法:
 * node scripts/new-post.js "标题"         -> 生成普通文章
 * node scripts/new-post.js "诗名" --essay -> 生成散文/诗词
 */

const args = process.argv.slice(2);
const isEssay = args.includes('--essay');
const rawTitle = args.find(arg => !arg.startsWith('--')) || (isEssay ? '无题' : '新文章');

const now = new Date();
const year = now.getFullYear();
const dateStr = now.toISOString().split('T')[0];

// 自动干支计算逻辑
const getEra = (y) => {
    if (y === 2025) return "乙巳";
    if (y === 2026) return "丙午";
    return "";
};

const targetDir = path.join('src/content/posts', isEssay ? 'essay' : '');

// 确保目录存在
if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
}

// 自动计算序号：避免文件名冲突，按 YYYY-MM-DD-XX.md 格式
const files = fs.readdirSync(targetDir);
const todayFiles = files.filter(f => f.startsWith(dateStr));
// 找到当前最大的序号并 +1
let nextIndex = 0;
if (todayFiles.length > 0) {
    const indices = todayFiles.map(f => {
        const parts = f.split('-');
        const lastPart = parts[parts.length - 1].replace('.md', '');
        return parseInt(lastPart) || 0;
    });
    nextIndex = Math.max(...indices) + 1;
}
const indexStr = nextIndex.toString().padStart(2, '0');
const fileName = `${dateStr}-${indexStr}.md`;
const filePath = path.join(targetDir, fileName);

// 构建 Frontmatter 模板
const template = `---
title: "${rawTitle}"
published: ${dateStr}
pType: "${isEssay ? 'essay' : 'post'}"
era: "${getEra(year)}"
category: "${isEssay ? '诗词' : '杂谈'}"
tags: [${isEssay ? '"诗词散文"' : '"技术"'}]
---

> ${isEssay ? '在此录入诗词...' : '在此开始写作...'}

---

`;

try {
    fs.writeFileSync(filePath, template);
    console.log('\x1b[32m%s\x1b[0m', `✔ 成功创建 ${isEssay ? '散文' : '博文'}: ${filePath}`);
} catch (err) {
    console.error('\x1b[31m%s\x1b[0m', `✘ 创建失败: ${err.message}`);
}
