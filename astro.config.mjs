import sitemap from "@astrojs/sitemap";
import svelte from "@astrojs/svelte";
import tailwind from "@astrojs/tailwind";
import swup from "@swup/astro";
import icon from "astro-icon";
import { defineConfig } from "astro/config";

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
                svelte(),
                sitemap(),
        ],
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
