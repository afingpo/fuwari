import { defineCollection, z } from "astro:content";

const postsCollection = defineCollection({
	schema: z.object({
		title: z.string(),
		author: z.array(z.string()).default(["涵哲子"]),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().nullable().default(""),
		/* 新增字段：用于区分普通博文和诗词散文 */
        pType: z.enum(["post", "essay"]).optional().default("post"),
        
        /* 建议增加：干支纪年字段，方便你处理“丙午年”这种逻辑 */
        era: z.string().optional(),
		lang: z.string().optional().default(""),
		comments: z.boolean().optional().default(true),
		series: z.string().optional(),
	


		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});
const specCollection = defineCollection({
	schema: z.object({}),
});
export const collections = {
	posts: postsCollection,
	spec: specCollection,
};
