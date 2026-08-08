import {
	AUTO_MODE,
	DARK_MODE,
	DEFAULT_THEME,
	LIGHT_MODE,
} from "@constants/constants.ts";
import type { LIGHT_DARK_MODE } from "@/types/config";

export function applyThemeToDocument(theme: LIGHT_DARK_MODE) {
	switch (theme) {
		case LIGHT_MODE:
			document.documentElement.classList.remove("dark");
			break;
		case DARK_MODE:
			document.documentElement.classList.add("dark");
			break;
		case AUTO_MODE:
			if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
				document.documentElement.classList.add("dark");
			} else {
				document.documentElement.classList.remove("dark");
			}
			break;
	}
}

export function setTheme(theme: LIGHT_DARK_MODE): void {
	localStorage.setItem("theme", theme);
	applyThemeToDocument(theme);
}

export function getStoredTheme(): LIGHT_DARK_MODE {
	return (localStorage.getItem("theme") as LIGHT_DARK_MODE) || DEFAULT_THEME;
}

export function getLanguage(): string {
    // 检查是否在浏览器环境，防止 SSR 构建报错
    if (typeof localStorage !== 'undefined') {
        return localStorage.getItem("language") || "zh_CN";
    }
    return "zh_CN";
}

export function setLanguage(lang: string): void {
    if (typeof localStorage !== 'undefined') {
        localStorage.setItem("language", lang);
    }
}

