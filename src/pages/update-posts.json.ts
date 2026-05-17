import fs from 'fs';
import path from 'path';
import { getSortedPostsList } from '../utils/content-utils';

export const prerender = true;

export async function GET() {
  let changedFiles: string[] = [];

  try {
    // 1. 让 Astro 在编译时直接问 Git：“这次提交到底改了哪些文章？”
    const { execSync } = await import('child_process');
    const stdout = execSync('git diff --name-only HEAD~1 HEAD').toString();
    
    changedFiles = stdout
      .split(/\r?\n/)
      .map(f => f.trim())
      // 严格过滤：只保留 posts 目录下非 talk 的 md 文件
      .filter(f => f.startsWith('src/content/posts/') && f.endsWith('.md') && !f.includes('/posts/talk/'));
  } catch (e) {
    console.error('Git diff failed or running in non-git environment:', e);
  }

  // 如果没有任何文章变动，直接返回空数组
  if (changedFiles.length === 0) {
    return new Response(JSON.stringify([], null, 2), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 2. 拿到全量排序文章（为了获取正确的 slug 和 frontmatter 数据）
  const allPosts = await getSortedPostsList();

  // 3. 精准比对：只有包含在 Git 变动列表里的文章，才放进最终的通知 JSON 里
  const updatedPosts = allPosts
    .filter(post => {
      // post.id 通常是相对于 content 目录的路径，或者直接匹配文件名
      // 我们用最稳妥的末尾匹配：看全量文章的文件名是否在变动路径里
      return changedFiles.some(changeFile => changeFile.includes(post.id));
    })
    .map(post => ({
      title: post.data.title || post.slug,
      description: post.data.description || '',
      published: post.data.published ? post.data.published.toISOString().substring(0, 10) : '',
      // ✨ 你的定制：直接替换成 100% 绝对正确的真实文章详情链接！
      url: `https://afipo.top/posts/${post.slug}/`
    }));

  return new Response(JSON.stringify(updatedPosts, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}

