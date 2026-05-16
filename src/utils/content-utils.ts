import { type CollectionEntry, getCollection } from "astro:content";
import I18nKey from "@i18n/i18nKey";
import { i18n } from "@i18n/translation";
import { getCategoryUrl } from "@utils/url-utils.ts";

// Retrieve posts and sort them by publication date
// src/utils/content-utils.ts

async function getRawSortedPosts() {
    const allBlogPosts = await getCollection("posts", ({ data }) => {
        return import.meta.env.PROD ? data.draft !== true : true;
    });

    // 1. 严格升序排序，确保自动生成的 TT 编号稳定
    const entriesForCalc = [...allBlogPosts].sort((a, b) => {
        const dateA = a.data.published.getTime();
        const dateB = b.data.published.getTime();
        if (dateA !== dateB) return dateA - dateB;
        return a.id.localeCompare(b.id);
    });

    const dailyCount: Record<string, number> = {};
    const slugMap = new Map();

    entriesForCalc.forEach((entry) => {
        // 如果文章在 frontmatter 里自己写了 slug，直接用写好的，不参与自动计算
        if (entry.data.slug) {
            slugMap.set(entry.id, entry.data.slug);
            return;
        }

        // 否则，自动计算时间加 TT 编号
        const date = entry.data.published;
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

        if (dailyCount[dateStr] === undefined) dailyCount[dateStr] = 0;
        else dailyCount[dateStr]++;
        const tt = String(dailyCount[dateStr]).padStart(2, '0');
        const generatedId = `${dateStr}-${tt}`;

        // 保留目录前缀（比如 essay/）
        const pathParts = entry.slug.split('/');
        pathParts.pop();
        const prefix = pathParts.length > 0 ? pathParts.join('/') + '/' : '';

        slugMap.set(entry.id, `${prefix}${generatedId}`);
    });

    // 帮助函数：根据 sync 状态动态决定排序时间基准
    const getSortDate = (entry: any) => {
        if (entry.data.sync === true) {
            return entry.data.updated ? entry.data.updated.getTime() : entry.data.published.getTime();
        }
        return entry.data.published.getTime();
    };

    // 2. 最终返回时，绝对不要去污染覆盖原生的 post.slug 属性，仅修正 data 内部的引用
    return allBlogPosts.map(post => {
        const finalSlug = slugMap.get(post.id) || post.slug;
        return {
            ...post,
            slug: finalSlug, // 确保这个对外暴露的 slug 完美对应
            data: { ...post.data, slug: finalSlug }
        };
    }).sort((a, b) => getSortDate(b) - getSortDate(a));
}


export async function getSortedPosts() {
        const sorted = await getRawSortedPosts();

        for (let i = 1; i < sorted.length; i++) {
                sorted[i].data.nextSlug = sorted[i - 1].slug;
                sorted[i].data.nextTitle = sorted[i - 1].data.title;
        }
        for (let i = 0; i < sorted.length - 1; i++) {
                sorted[i].data.prevSlug = sorted[i + 1].slug;
                sorted[i].data.prevTitle = sorted[i + 1].data.title;
        }

        return sorted;
}
export type PostForList = {
        slug: string;
        data: CollectionEntry<"posts">["data"];
};
export async function getSortedPostsList(): Promise<PostForList[]> {
        const sortedFullPosts = await getRawSortedPosts();

        // delete post.body
        const sortedPostsList = sortedFullPosts.map((post) => ({
                slug: post.slug,
                data: post.data,
        }));

        return sortedPostsList;
}
export type Tag = {
        name: string;
        count: number;
};

export async function getTagList(): Promise<Tag[]> {
        const allBlogPosts = await getCollection<"posts">("posts", ({ data }) => {
                return import.meta.env.PROD ? data.draft !== true : true;
        });

        const countMap: { [key: string]: number } = {};
        allBlogPosts.forEach((post: { data: { tags: string[] } }) => {
                post.data.tags.forEach((tag: string) => {
                        if (!countMap[tag]) countMap[tag] = 0;
                        countMap[tag]++;
                });
        });

        // sort tags
        const keys: string[] = Object.keys(countMap).sort((a, b) => {
                return a.toLowerCase().localeCompare(b.toLowerCase());
        });

        return keys.map((key) => ({ name: key, count: countMap[key] }));
}

export type Category = {
        name: string;
        count: number;
        url: string;
};

export async function getCategoryList(): Promise<Category[]> {
        const allBlogPosts = await getCollection("posts", ({ data }) => {
                return import.meta.env.PROD ? data.draft !== true : true;
        });
        const count: { [key: string]: number } = {};
        allBlogPosts.forEach((post: { data: { category: string | null } }) => {
                if (!post.data.category) {
                        const ucKey = i18n(I18nKey.uncategorized);
                        count[ucKey] = count[ucKey] ? count[ucKey] + 1 : 1;
                        return;
                }

                const categoryName =
                        typeof post.data.category === "string"
                                ? post.data.category.trim()
                                : String(post.data.category).trim();

                count[categoryName] = count[categoryName] ? count[categoryName] + 1 : 1;
        });

        const lst = Object.keys(count).sort((a, b) => {
                return a.toLowerCase().localeCompare(b.toLowerCase());
        });

        const ret: Category[] = [];
        for (const c of lst) {
                ret.push({
                        name: c,
                        count: count[c],
                        url: getCategoryUrl(c),
                });
        }
        return ret;
}

