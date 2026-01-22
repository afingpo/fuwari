import {
	AUTO_MODE,
	DARK_MODE,
	DEFAULT_THEME,
	LIGHT_MODE,
} from "@constants/constants.ts";
import { expressiveCodeConfig } from "@/config";
import type { LIGHT_DARK_MODE } from "@/types/config";

export function getDefaultHue(): number {
	const fallback = "250";
	const configCarrier = document.getElementById("config-carrier");
	return Number.parseInt(configCarrier?.dataset.hue || fallback, 10);
}

export function getHue(): number {
	const stored = localStorage.getItem("hue");
	return stored ? Number.parseInt(stored, 10) : getDefaultHue();
}

export function setHue(hue: number): void {
	localStorage.setItem("hue", String(hue));
	const r = document.querySelector(":root") as HTMLElement;
	if (!r) {
		return;
	}
	r.style.setProperty("--hue", String(hue));
}

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

	// Set the theme for Expressive Code
	document.documentElement.setAttribute(
		"data-theme",
		expressiveCodeConfig.theme,
	);
}

export function setTheme(theme: LIGHT_DARK_MODE): void {
	localStorage.setItem("theme", theme);
	applyThemeToDocument(theme);
	syncNMPTheme();
}

export function getStoredTheme(): LIGHT_DARK_MODE {
	return (localStorage.getItem("theme") as LIGHT_DARK_MODE) || DEFAULT_THEME;
}

// 在文件尾部加上
export function syncNMPTheme() {
	const isDark = document.documentElement.classList.contains('dark');
	// NMP 的根节点（你实际渲染出来的是 <nmp-player> 或它内部第一个 div）
	const nmpRoot = document.querySelector('nmp-player');
	if (!nmpRoot) return;
	// 方式 1：直接改自定义属性（保险，无需 NMP 暴露 API）
	nmpRoot.style.setProperty('--nmp-bg',        isDark ? '#1e1e1e' : '#ffffff');
	nmpRoot.style.setProperty('--nmp-text',      isDark ? '#e5e5e5' : '#222222');
	nmpRoot.style.setProperty('--nmp-primary',   isDark ? '#4dabf7' : '#0066cc');
	// 方式 2：如果 NMP 官方支持 theme 属性
	// (nmpRoot as any).theme = isDark ? 'dark' : 'light';
}

