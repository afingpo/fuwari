---
title: 'Font Test'
published: 1988-01-01 # YYYY-MM-DD
# updated:  
author: [""]
slug: ""
tag: [""]
category: ""
---

> By _Gemini_

这份 Markdown 测试文档专门针对你刚才配置的 **IBM Plex Sans** (英数)、**Noto Sans SC** (中文)、**Maple Mono** (代码连字) 以及 **Nerd Font** (图标) 进行了全方位的覆盖。
你可以直接将其粘贴到你的博客 .md 或 .mdx 文件中进行预览。
# 字体排版系统最终测试 (Typography Test)
## 1. 多语言混排测试 (Multi-language fallback)
测试 body 字体链对不同字符集的处理：
 * **English (IBM Plex Sans):** The quick brown fox jumps over the lazy dog. 0123456789.
 * **中文简体 (Noto Sans SC):** 每一个不曾起舞的日子，都是对生命的辜负。
 * **日本語 (Klee One / Noto):** ソフトウェア開発は、芸術と科学の融合です。
 * **한국어 (System Fallback):** 안녕하세요, 새로운 폰트 시스템을 테스트 중입니다.
## 2. 样式与权重测试 (Weight & Styles)
测试 bold 和 italic 是否调用了对应的 .woff2 文件：
 * **加粗测试 (Bold):** **这是加粗的中文字体**，以及 **Bold English with IBM Plex.**
 * **斜体测试 (Italic):** *Italicized English text looks sharp*，以及 *中文斜体测试（通常由浏览器倾斜渲染）*。
 * **组合测试:** ***Bold and Italicized text for maximum emphasis.***
## 3. 代码连字与等宽测试 (Code & Ligatures)
测试 Maple Mono 的连字效果（检查符号是否合并）：
```typescript
// Ligatures Test: 检查符号是否合并成特殊的形状
const testLigatures = () => {
    if (1 != 0 && 2 >= 1) {
        console.log("Success -> Result");
        return a === b ? true : false; // 检查 === 和 =>
    }
}

/* Comment Test: 这里的注释应该是斜体的 Maple Mono
   TODO: 检查中英文混排在代码框内的对齐情况
*/

```
## 4. 图标补全测试 (Nerd Font Symbols)
测试 SymbolsNerdFont 是否能正确兜底显示图标：
 * **系统图标:**  (Arch Linux),  (Windows),  (macOS)
 * **编程图标:**  (C++),  (Java),  (TypeScript),  (Lua)
 * **文件夹与状态:**  (Folder),  (Git),  (Terminal)
## 5. 综合排版压力测试
**[2026-05-10]** 在 Termux 环境下使用 fish 脚本处理了 woff2 字体压缩。**IBM Plex Sans** 的切角在 h2 标题下表现得非常犀利，配合 LXGW WenKai 的人文感，整体排版呈现出一种“技术杂志”的呼吸感。
### 💡 检查指南：
 1. **代码框**: 检查 != 是否变成了一个带斜杠的不等号，-> 是否变成了单箭头。
 2. **图标**: 确认上面的 Arch 图标（）是否显示正常。如果显示为方框，说明 SymbolsNerdFont 没挂载成功。
 3. **对齐**: 在代码框内输入连续的 iiii 和 WWWW，确认它们是否严格等宽。


---
