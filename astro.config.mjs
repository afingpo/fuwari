import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import swup from "@swup/astro";
import expressiveCode from "astro-expressive-code";
import icon from "astro-icon";
import { defineConfig } from "astro/config";
import { expressiveCodeConfig } from "./src/config.ts";
import { pluginLanguageBadge } from "./src/plugins/expressive-code/language-badge.ts";
import { pluginCustomCopyButton } from "./src/plugins/expressive-code/custom-copy-button.js";

export default defineConfig({
        site: "https://iluc.cn/",
        base: "/",
        trailingSlash: "always",
        integrations: [
                tailwind({
                        nesting: true,
                }),
                swup({
                        theme: false,
                        animationClass: "transition-swup-",
                        containers: ["main", "#toc"],
                        smoothScrolling: true,
                        cache: true,
                        preload: true,
                        accessibility: true,
                        updateHead: true,
                        updateBodyClass: false,
                        globalInstance: true,
                }),
                icon({
                        collection: {
                                'fa6-brands': () => import('@iconify-json/fa6-brands/icons.json'),
                                'fa6-regular': () => import('@iconify-json/fa6-regular/icons.json'),
                                'fa6-solid': () => import('@iconify-json/fa6-solid/icons.json'),
                                'local': () => import('./src/icons/index.js'),
                                'material-symbols': () => import('@iconify-json/material-symbols/icons.json'),
                        },
                }),
                expressiveCode({
                        themes: [expressiveCodeConfig.theme, expressiveCodeConfig.theme],
                        plugins: [
                                pluginCollapsibleSections(),
                                pluginLineNumbers(),
                                pluginLanguageBadge(),
                                pluginCustomCopyButton()
                        ],
                        defaultProps: {
                                wrap: true,
                                overridesByLang: {
                                        'shellsession': {
                                                showLineNumbers: false,
                                        },
                                },
                        },
                        styleOverrides: {
                                codeBackground: "var(--codeblock-bg)",
                                borderRadius: "0.75rem",
                                borderColor: "none",
                                codeFontSize: "0.875rem",
                                codeFontFamily: "'JetBrains Mono Variable', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
                                codeLineHeight: "1.5rem",
                                frames: {
                                        editorBackground: "var(--codeblock-bg)",
                                        terminalBackground: "var(--codeblock-bg)",
                                        terminalTitlebarBackground: "var(--codeblock-topbar-bg)",
                                        editorTabBarBackground: "var(--codeblock-topbar-bg)",
                                        editorActiveTabBackground: "none",
                                        editorActiveTabIndicatorBottomColor: "var(--primary)",
                                        editorActiveTabIndicatorTopColor: "none",
                                        editorTabBarBorderBottomColor: "var(--codeblock-topbar-bg)",
                                        terminalTitlebarBorderBottomColor: "none"
                                },
                                textMarkers: {
                                        delHue: 0,
                                        insHue: 180,
                                        markHue: 250
                                }
                        },
                        frames: {
                                showCopyToClipboardButton: false,
                        }
                }),
                svelte(),
                sitemap(),
        ],
        // 第三人称说明：已将不用的 markdown.remarkPlugins 和 rehypePlugins 附属全部安全移除
        vite: {
                assetsInclude: ["**/*.dj"],
                build: {
                        cssMinify: 'esbuild',
                        rollupOptions: {
                                onwarn(warning, warn) {
                                        if (
                                                warning.message.includes("is dynamically imported by") &&
                                                warning.message.includes("but also statically imported by")
                                        ) {
                                                return;
                                        }
                                        warn(warning);
                                },
                        },
                },
        },
});

