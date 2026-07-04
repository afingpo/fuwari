// src/pages/atom.xml.ts
import rss from "@astrojs/rss";
import { getSortedPosts } from "@utils/content-utils";
import { url } from "@utils/url-utils";
import type { APIContext } from "astro";
import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@/config";

function stripInvalidXmlChars(str: string): string {
    return str.replace(
        // biome-ignore lint/suspicious/noControlCharactersInRegex: https://www.w3.org/TR/xml/#charsets
        /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g,
        "",
    );
}

export async function GET(context: APIContext) {
    const blog = await getSortedPosts();

    return rss({
        title: siteConfig.title,
        description: siteConfig.subtitle || "No description",
        site: context.site ?? "https://iluc.cn",
        customData: `
            <language>${siteConfig.lang}</language>
            <atom:link href="${new URL('atom.xml', context.site || 'https://iluc.cn').href}" rel="self" type="application/rss+xml" />
            <updated>${new Date().toISOString()}</updated>
        `,
        items: blog.map((post) => {
            const rawHtml = post.data.html || "";
            const cleanedHtml = stripInvalidXmlChars(rawHtml);
            const postSlug = post.data.slug || post.id;

            return {
                title: post.data.title,
                author: Array.isArray(post.data.author) ? post.data.author.join(', ') : String(post.data.author || ""),
                pubDate: post.data.published,
                description: post.data.description || "",
                link: url(`/posts/${postSlug}/`),
                content: sanitizeHtml(cleanedHtml, {
                    allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "pre", "code"]),
                    allowedAttributes: {
                        ...sanitizeHtml.defaults.allowedAttributes,
                        'code': ['class', 'style'],
                        'span': ['class', 'style'],
                        'pre': ['class', 'style']
                    }
                }),
            };
        }),
    });
}

