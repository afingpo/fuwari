import fs from 'fs';
import path from 'path';
import { getSortedPostsList } from '../utils/content-utils';

export const prerender = true;

export async function GET() {
  // 1. 直接从环境变量里拿 Actions 塞给它的变动文件列表
  const changedFilesEnv = process.env.CHANGED_FILES || '';
  
  // 切割并清理路径，只保留有效文章
  const changedFiles = changedFilesEnv
    .split(/[\s,]+/)
    .map(f => f.trim())
    .filter(f => f.startsWith('src/content/posts/') && f.endsWith('.md') && !f.includes('/posts/talk/'));

  if (changedFiles.length === 0) {
    return new Response(JSON.stringify([], null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 2. 拿到 Astro 里的全量文章
  const allPosts = await getSortedPostsList();

  // 提取变动文件的纯文件名（例如：test）
  const changedBaseNames = changedFiles.map(f => path.basename(f, '.md').toLowerCase());

  // 3. 简单比对文件名，装配 100% 正确的链接
  const updatedPosts = allPosts
    .filter(post => {
      const postIdName = path.basename(post.id || post.slug, '.md').toLowerCase();
      const postSlugName = post.slug.toLowerCase();
      return changedBaseNames.includes(postIdName) || changedBaseNames.includes(postSlugName);
    })
    .map(post => ({
      title: post.data.title || post.slug,
      description: post.data.description || '',
      published: post.data.published ? post.data.published.toISOString().substring(0, 10) : '',
      url: `https://afipo.top/posts/${post.slug}/` // 真实的绝对长链接
    }));

  return new Response(JSON.stringify(updatedPosts, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}

