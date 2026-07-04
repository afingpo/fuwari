// src/loaders/transformers.ts
import { createHighlighter } from "shiki";

let highlighter: any = null;

async function ensureHighlighter() {
    if (!highlighter) {
        highlighter = await createHighlighter({
            themes: ["github-dark"],
            langs: ["javascript", "typescript", "html", "css", "shell", "bash", "markdown", "json", "yaml", "ini"],
        });
    }
}

// 1. 可复用的高亮核心逻辑
export async function highlightCodeBlocks(html: string): Promise<string> {
    const regex = /<pre\b[^>]*><code\s+class="language-([^"]+)">([\s\S]*?)<\/code><\/pre>/gi;
    let match;
    let processedHtml = html;
    const replacements: { target: string; result: string }[] = [];

    await ensureHighlighter();

    while ((match = regex.exec(html)) !== null) {
        const fullMatch = match[0];
        let lang = match[1].toLowerCase();
        if (lang === 'shellsession') lang = 'shell';
        
        let code = match[2]
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .replace(/&#39;/g, "'");

        code = code.replace(/^[\r\n\s]+/, "").replace(/[\r\n\s]+$/, "");

        try {
            const blockHtml = highlighter.codeToHtml(code, {
                lang: lang,
                theme: "github-dark",
            });
            replacements.push({ target: fullMatch, result: blockHtml });
        } catch (e) {
            try {
                const fallbackHtml = highlighter.codeToHtml(code, { lang: "txt", theme: "github-dark" });
                replacements.push({ target: fullMatch, result: fallbackHtml });
            } catch {
                replacements.push({ target: fullMatch, result: fullMatch });
            }
        }
    }

    for (const item of replacements) {
        processedHtml = processedHtml.replace(item.target, item.result);
    }
    return processedHtml;
}

// 2. 可复用的阅读时间计算
export function getReadingTime(text: string) {
    if (!text) return { words: 0, minutes: 0 };
    const cleanText = text.trim();
    const chineseWords = (cleanText.match(/[\u4e00-\u9fa5]/g) || []).length;
    const englishWords = (cleanText.match(/[a-zA-Z0-9_\u00C0-\u024F]+/g) || []).length;
    const words = chineseWords + englishWords;
    const minutes = Math.max(1, Math.ceil(words / 300));
    return { words, minutes };
}

// 3. 可复用的标题提取器
export function extractHeadings(html: string) {
    const headings = [];
    const regex = /<h([1-6])\b[^>]* id="([^"]+)"[^>]*>([\s\S]*?)<\/h\1>/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
        headings.push({
            depth: parseInt(match[1]),
            slug: match[2],
            text: match[3].replace(/<\/?[^>]+(>|$)/g, "")
        });
    }
    return headings;
}

