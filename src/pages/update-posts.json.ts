import fs from 'fs';
import path from 'path';
import { getSortedPostsList } from '../utils/content-utils';

export const prerender = true;

export async function GET() {
  let changedFiles: string[] = [];

  try {
    const { execSync } = await import('child_process');
    // 💡 优化 1：使用 HEAD~1...HEAD 确保更稳定的比对范围
    const stdout = execSync('git diff --name-only HEAD~1 HEAD').toString();
    
    changedFiles = stdout
      .split(/\r?\n/)
      .map(f => f.trim())
      // 💡 优化 2：放宽过滤限制，只要包含 posts 且是 md 结尾，且不是 talk 就算
      .filter(f => f.toLowerCase().includes('posts/') && f.endsWith('.md') && !f.toLowerCase().includes('/talk/'));
      
    console.log('=== Git Changed Files ===', changedFiles);
  } catch (e) {
    console.error('Git diff failed:', e);
  }

  if (changedFiles.length === 0) {
    return new Response(JSON.stringify([], null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 获取 Astro 里的全量文章
  const allPosts = await getSortedPostsList();

  // 提取 Git 变动文件的纯文件名（去掉路径和扩展名），例如 src/content/posts/test.md -> test
  const changedBaseNames = changedFiles.map(f => path.basename(f, '.md').toLowerCase());

  // ✨ 优化 3：采用最稳妥的“纯文件名”比对法，彻底解决 Astro 5.x 的 id 乱配问题
  const updatedPosts = allPosts
    .filter(post => {
      // 拿到 Astro 文章的实际文件名或 id
      const postIdName = path.basename(post.id || post.slug, '.md').toLowerCase();
      const postSlugName = post.slug.toLowerCase();
      
      // 只要 Git 修改的文件名命中了 Astro 的 id 或者 slug，就代表这篇文章更新了！
      return changedBaseNames.includes(postIdName) || changedBaseNames.includes(postSlugName);
    })
    .map(post => ({
      title: post.data.title || post.slug,
      description: post.data.description || '',
      published: post.data.published ? post.data.published.toISOString().substring(0, 10) : '',
      url: `https://afipo.top/posts/${post.slug}/`
    }));

  console.log('=== Matched Updated Posts ===', updatedPosts);

  return new Response(JSON.stringify(updatedPosts, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}

