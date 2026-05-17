import { getSortedPostsList } from '../utils/content-utils';

export const prerender = true;

export async function GET() {
  const allPosts = await getSortedPostsList();

  // 只取最近更新/发布的 5 篇文章，防止列表过长
  const recentPosts = allPosts.slice(0, 5).map(post => ({
    title: post.data.title || post.slug,
    description: post.data.description || '',
    published: post.data.published ? post.data.published.toISOString().substring(0, 10) : '',
    // 这里的 slug 是 100% 正确的
    url: `https://afipo.top/posts/${post.slug}/`
  }));

  return new Response(JSON.stringify(recentPosts, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}

