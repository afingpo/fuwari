// src/loaders/djotLoader.ts
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { parse, renderHTML } from "@djot/djot";
// 引入刚刚抽离出的可复用内容增强管道
import { highlightCodeBlocks, getReadingTime, extractHeadings } from "./transformers";

function getDjotFiles(dir: string, baseDir = dir): string[] {
    let results: string[] = [];
    if (!fs.existsSync(dir)) return results;

    const list = fs.readdirSync(dir);
    for (const file of list) {
        if (file.startsWith('_')) continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat && stat.isDirectory()) {
            results = results.concat(getDjotFiles(fullPath, baseDir));
        } else if (file.endsWith('.dj')) {
            results.push(path.relative(baseDir, fullPath));
        }
    }
    return results;
}

export const djotLoader = (options: { base: string }) => {
    return {
        name: `djot-loader-${path.basename(options.base)}`,
        load: async (context: any) => {
            context.store.clear();
            const djFiles = getDjotFiles(options.base);

            for (const relativePath of djFiles) {
                const filePath = path.join(options.base, relativePath);
                const fileContent = fs.readFileSync(filePath, "utf-8");
                const { data: rawData, content } = matter(fileContent);

                const id = relativePath.replace(/\.dj$/, "");
                const parsedData = await context.parseData({ id, data: rawData });

                // 核心职能：只负责将源文本转为 HTML 字符串
                const ast = parse(content);
                let html = renderHTML(ast);

                // 统一复用：流式丢给通用处理器做增量加工
                html = await highlightCodeBlocks(html);
                const { words, minutes } = getReadingTime(content);
                const headings = extractHeadings(html);

                context.store.set({
                    id,
                    data: {
                        ...parsedData,
                        html,
                        headings,
                        remarkPluginFrontmatter: { words, minutes }
                    }
                });
            }
        }
    };
};

