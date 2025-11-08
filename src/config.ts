import type {
	CommentConfig,
	ExpressiveCodeConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

/*export const commentConfig: CommentConfig = {
  twikoo: {
    envId: 'https://twikoo.s1.afingpo.top',
    lang: 'zh-CN',
  },
};*/

export const siteConfig: SiteConfig = {
	title: "涵哲子居",
	subtitle: "Afingpo's Blog",
	lang: "zh_CN", // Language code, e.g. 'en', 'zh_CN', 'ja', etc.
	themeColor: {
		hue: 195, // Default hue for the theme color, from 0 to 360. e.g. red: 0, teal: 200, cyan: 250, pink: 345
		fixed: false, // Hide the theme color picker for visitors
	},
	banner: {
		enable: false,
		src: "assets/images/demo-banner.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
		position: "center", // Equivalent to object-position, only supports 'top', 'center', 'bottom'. 'center' by default
		credit: {
			enable: false, // Display the credit text of the banner image
			text: "", // Credit text to be displayed
			url: "", // (Optional) URL link to the original artwork or artist's page
		},
	},
	toc: {
		enable: true, // Display the table of contents on the right side of the post
		depth: 2, // Maximum heading depth to show in the table, from 1 to 3
	},
	favicon: [
		// Leave this array empty to use the default favicon
		// {
		//   src: '/favicon/icon.png',    // Path of the favicon, relative to the /public directory
		//   theme: 'light',              // (Optional) Either 'light' or 'dark', set only if you have different favicons for light and dark mode
		//   sizes: '32x32',              // (Optional) Size of the favicon, set only if you have favicons of different sizes
		// }
	],
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		// LinkPreset.Bangumi,
		// LinkPreset.Essay,
		LinkPreset.Others,
		LinkPreset.Links,
		LinkPreset.About,
		/*{
			name: "Codeberg",
			url: "https://codeberg.org/afingpo/afingpo-astro-blog", // Internal links should not include the base path, as it is automatically added
			external: true, // Show an external link icon and will open in a new tab
		},*/
		{
			name: "开往",
			url: "https://www.travellings.cn/go.html",
			external: true,
		},
	],
};

export const profileConfig: ProfileConfig = {
	avatar: "assets/images/avatar.png", // Relative to the /src directory. Relative to the /public directory if it starts with '/'
	name: "涵哲子",
	bio: "天哲地理，共公卿好",
	links: [
		{
			name: "Mail",
			icon: "material-symbols:mail",
			url: "mailto:afipo_han@outlook.com"
		},
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/afingpo",
		},
		{
			name: "Codeberg",
			icon: "simple-icons:codeberg",
			url: "https://codeberg.org/afingpo",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	// Note: Some styles (such as background color) are being overridden, see the astro.config.mjs file.
	// Please select a dark theme, as this blog theme currently only supports dark background color
	theme: "github-dark",
};

export const commentConfig: CommentConfig = {
  twikoo: {
    envId: 'https://tw2.s1.afingpo.top',
    //envId: 'https://twikoo.s1.afingpo.top',
    lang: 'zh-CN',
  },
};
