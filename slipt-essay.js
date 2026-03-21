import fs from 'fs';
import path from 'path';

const inputFile = 'src/content/spec/essay.md';
const outputDir = 'src/content/posts/essay';

if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
}

const content = fs.readFileSync(inputFile, 'utf8');
const sections = content.split(/\n(?=### )/);

sections.forEach((section, index) => {
    const lines = section.trim().split('\n');
    if (lines.length < 1) return;

    const rawTitle = lines[0].replace('###', '').trim();
    const subTitleMatch = section.match(/>\s*(.*?)\n/);
    const subTitle = subTitleMatch ? subTitleMatch[1].trim() : "";
    const finalTitle = subTitle ? `${rawTitle}：${subTitle}` : rawTitle;

    // 自动判定干支
    let era = "乙巳"; // 默认
    let pubDate = "2025-01-01";
    
    if (section.includes("二五年")) {
        era = "乙巳";
        pubDate = `2025-0${(index % 9) + 1}-01`; 
    } else if (section.includes("二六年")) {
        era = "丙午";
        pubDate = `2026-0${(index % 9) + 1}-01`;
    }

    const frontmatter = `---
title: "${finalTitle}"
published: ${pubDate}
pType: "essay"
era: "${era}"
category: "诗词"
tags: ["旧作", "诗词散文"]
---

`;

    const body = lines.slice(1).join('\n');
    const fileName = `essay-${era}-${index.toString().padStart(2, '0')}.md`;
    
    fs.writeFileSync(path.join(outputDir, fileName), frontmatter + body);
    console.log(`[${era}] 已生成: ${fileName}`);
});

