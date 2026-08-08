import type {
	ProfileConfig,
	SiteConfig,
} from "./types/config";

export const siteConfig: SiteConfig = {
	title: "涵哲子居",
	subtitle: "Afingpo's Blog",
	lang: "zh_CN", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {},
	banner: {
		enable: false,
		src: "", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: false, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		// Leave this array empty to use the default favicon
		{
			src: '/favicon/icon.ico',    // Path of the favicon, relative to the /public directory
			// theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
			sizes: '16x16 32x32 48x48 64x64 128x128',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		},
		{
			src: '/favicon/icon-180.png',
			sizes: '180x180'
		},
		{
			src: '/favicon/icon-192.png',
			sizes: '192x192'
		}
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "/logo.webp", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "涵哲子",
	bio: "天哲地理，共公卿好",
	links: [
		{
			name: "Mail",
			icon: "material-symbols:mail",
			url: "mailto:me@iluc.cn"
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/afingpo"
		},
		{
			name: "Codeberg",
			icon: "simple-icons:codeberg",
			url: "https://codeberg.org/afingpo"
		},
		{
			name: "爱发电",
			icon: "simple-icons:afdian",
			url: "https://www.ifdian.net/a/afipo"
		}
	]
};

