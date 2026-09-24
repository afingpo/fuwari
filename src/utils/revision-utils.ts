import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { parse, renderHTML } from "@djot/djot";
import { highlightCodeBlocks, getReadingTime, extractHeadings } from "../loaders/transformers";

export interface Revision {
        version: number;
        date: Date;
        note: string;
}

export interface RevisionContent {
        version: number;
        date: Date;
        note: string;
        title: string;
        description: string;
        html: string;
        headings: { depth: number; slug: string; text: string }[];
        words: number;
        minutes: number;
}

/**
 * Get the revisions directory path for a given entry
 */
export function getRevisionsDir(entryId: string): string {
        const postDir = path.dirname(path.join("src/content/posts", entryId));
        return path.join(postDir, "_revisions");
}

/**
 * Check if a post has a _revisions directory
 */
export function hasRevisionsDir(entryId: string): boolean {
        const revisionsDir = getRevisionsDir(entryId);
        return fs.existsSync(revisionsDir);
}

/**
 * Read all revision files from _revisions directory
 */
export async function getRevisionContents(entryId: string, revisions: Revision[]): Promise<RevisionContent[]> {
        const revisionsDir = getRevisionsDir(entryId);
        if (!fs.existsSync(revisionsDir)) return [];

        const contents: RevisionContent[] = [];

        for (const rev of revisions) {
                const filePath = path.join(revisionsDir, `v${rev.version}.dj`);
                if (!fs.existsSync(filePath)) continue;

                const fileContent = fs.readFileSync(filePath, "utf-8");
                const { data: rawData, content } = matter(fileContent);

                const ast = parse(content);
                let html = renderHTML(ast);
                html = await highlightCodeBlocks(html);
                const { words, minutes } = getReadingTime(content);
                const headings = extractHeadings(html);

                contents.push({
                        version: rev.version,
                        date: rev.date,
                        note: rev.note,
                        title: rawData.title || "",
                        description: rawData.description || "",
                        html,
                        headings,
                        words,
                        minutes
                });
        }

        return contents.sort((a, b) => a.version - b.version);
}

/**
 * Read a single revision file's raw content
 */
export function getRevisionRawContent(entryId: string, version: number): string | null {
        const revisionsDir = getRevisionsDir(entryId);
        const filePath = path.join(revisionsDir, `v${version}.dj`);
        if (!fs.existsSync(filePath)) return null;
        return fs.readFileSync(filePath, "utf-8");
}

/**
 * Get the revision URL for a post
 */
export function getRevisionUrl(slug: string): string {
        return `/posts/${slug}/revisions/`;
}
