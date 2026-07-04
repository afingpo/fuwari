// src/content/config.ts
import { defineCollection, z } from "astro:content";
import { djotLoader } from "../loaders/djotLoader";

const postsCollection = defineCollection({
        loader: djotLoader({ base: './src/content/posts' }),
        schema: z.object({
                title: z.string(),
                author: z.array(z.string()).default(["涵哲子"]),
                published: z.date(),
                updated: z.date().optional(),
                slug: z.string().optional(),
                draft: z.boolean().optional().default(false),
                description: z.string().optional().default(""),
                image: z.string().optional().default(""),
                tags: z.array(z.string()).optional().default([]),
                category: z.string().optional().nullable().default(""),
                sync: z.boolean().default(false),
                lang: z.string().optional().default(""),
                comments: z.boolean().optional().default(true),
                prevTitle: z.string().default(""),
                prevSlug: z.string().default(""),
                nextTitle: z.string().default(""),
                nextSlug: z.string().default(""),
                html: z.string().optional(),
                headings: z.array(z.any()).optional(),
                remarkPluginFrontmatter: z.object({
                    words: z.number(),
                    minutes: z.number()
                }).optional()
        }),
});

const specCollection = defineCollection({
        loader: djotLoader({ base: './src/content/spec' }),
        schema: z.object({
                title: z.string().optional(),
                description: z.string().optional(),
                html: z.string().optional(),
                headings: z.array(z.any()).optional(),
        }).optional(),
});

export const collections = {
        collections: postsCollection,
        posts: postsCollection,
        spec: specCollection,
};

