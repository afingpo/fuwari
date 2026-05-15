<script lang="ts">
    import { onMount } from "svelte";
    import { getPostUrlBySlug } from "../utils/url-utils";

    export let sortedPosts: any[] = [];

    // --- 状态管理：初始化时直接读取 URL ---
    const params = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

    let viewMode: 'timeline' | 'grid' = 'timeline';

    // 初始化 filterCategory
    let filterCategory = (() => {
        if (!params) return 'all';
        if (params.get('uncategorized') === 'true') return '未分类';
        const cat = params.get('category');
        return cat ? decodeURIComponent(cat) : 'all';
    })();

    // 初始化 filterTag
    let filterTag = (() => {
        if (!params) return 'all';
        const tag = params.get('tag');
        return tag ? decodeURIComponent(tag) : 'all';
    })();

    let showCatMenu = false;
    let showTagMenu = false;

    // --- 1. 计算分类列表（已移除 pType 逻辑） ---
    $: categories = (() => {
        const cats = [...new Set(sortedPosts.map(p => {
            return p.data?.category || '未分类';
        }))].sort((a, b) => a.localeCompare(b, 'zh-CN'));
        return ['all', ...cats];
    })();

    // --- 2. 第一步筛选：根据分类过滤文章（已移除 pType 逻辑） ---
    $: postsInCategory = sortedPosts.filter(post => {
        const postCat = post.data?.category || '未分类';
        return filterCategory === 'all' || postCat === filterCategory;
    });

    // --- 3. 动态计算标签列表 ---
    $: availableTags = (() => {
        const rawTags = [...new Set(postsInCategory.flatMap(p => {
            const t = p.data?.tags;
            if (Array.isArray(t)) return t.filter(tag => tag && String(tag).trim() !== '');
            if (typeof t === 'string' && t.trim() !== '') return [t.trim()];
            return [];
        }))].sort((a, b) => a.localeCompare(b, 'en'));
        return ['all', ...rawTags];
    })();

    // --- 4. 自动校准：增加保护锁 ---
    $: if (filterTag !== 'all' && availableTags.length > 1) {
        if (!availableTags.includes(filterTag)) {
            filterTag = 'all';
        }
    }

    // --- 5. 第二步筛选：在分类基础上应用标签过滤 ---
    $: filteredPosts = postsInCategory.filter(post => {
        let postTags = post.data?.tags || [];
        if (typeof postTags === 'string') postTags = [postTags];
        return filterTag === 'all' || (Array.isArray(postTags) && postTags.includes(filterTag));
    });

    // --- 6. 同步到地址栏 ---
    $: if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (filterCategory === '未分类') {
            url.searchParams.set('uncategorized', 'true');
            url.searchParams.delete('category');
        } else if (filterCategory !== 'all') {
            url.searchParams.set('category', filterCategory);
            url.searchParams.delete('uncategorized');
        } else {
            url.searchParams.delete('category');
            url.searchParams.delete('uncategorized');
        }

        if (filterTag !== 'all') url.searchParams.set('tag', filterTag);
        else url.searchParams.delete('tag');

        window.history.replaceState({}, '', url.toString());
    }

    // --- 后续逻辑（分组、格式化等） ---
    $: groups = groupPosts(filteredPosts);

    function groupPosts(posts: any[]) {
        const grouped = posts.reduce((acc, post) => {
            const year = new Date(post.data.published).getFullYear();
            if (!acc[year]) acc[year] = [];
            acc[year].push(post);
            return acc;
        }, {} as Record<number, any[]>);

        return Object.keys(grouped).map(year => ({
            year: Number(year),
            posts: grouped[Number(year)]
        })).sort((a, b) => b.year - a.year);
    }

    function formatDate(dateStr: string | Date) {
        const date = new Date(dateStr);
        return `${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    }

    function closeMenus(e: MouseEvent) {
        if (!(e.target as Element).closest('.custom-select-container')) {
            showCatMenu = false;
            showTagMenu = false;
        }
    }
</script>

<svelte:window on:click={closeMenus} />

<div class="mb-6 p-3 card-base flex flex-wrap gap-4 items-center overflow-visible">
    <div class="custom-select-container relative">
        <button
            class="select-trigger flex items-center gap-2 px-4 py-2 text-sm font-bold text-75"
            on:click|stopPropagation={() => { showCatMenu = !showCatMenu; showTagMenu = false; }}
        >
            <span class="opacity-40 text-[10px] uppercase">Category:</span>
            <span>{filterCategory === 'all' ? '全部' : filterCategory}</span>
            <svg class="w-4 h-4 transition-transform {showCatMenu ? 'rotate-180' : ''}" viewBox="0 0 20 20" fill="currentColor"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
        </button>
        {#if showCatMenu}
            <div class="dropdown-menu card-base absolute top-full left-0 mt-2 z-[100] min-w-[160px] py-2 shadow-xl animate-in">
                {#each categories as cat}
                    <button
                        class="w-full text-left px-4 py-2 text-sm hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-colors {filterCategory === cat ? 'text-[var(--primary)] font-bold' : 'text-75'}"
                        on:click={() => { filterCategory = cat; showCatMenu = false; }}
                    >
                        {cat === 'all' ? '显示全部' : cat}
                    </button>
                {/each}
            </div>
        {/if}
    </div>

    <div class="custom-select-container relative">
        <button
            class="select-trigger flex items-center gap-2 px-4 py-2 text-sm font-bold text-75"
            on:click|stopPropagation={() => { showTagMenu = !showTagMenu; showCatMenu = false; }}
        >
            <span class="opacity-40 text-[10px] uppercase">Tag:</span>
            <span>{filterTag === 'all' ? '全部' : `#${filterTag}`}</span>
            <svg class="w-4 h-4 transition-transform {showTagMenu ? 'rotate-180' : ''}" viewBox="0 0 20 20" fill="currentColor"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
        </button>
        {#if showTagMenu}
            <div class="dropdown-menu card-base absolute top-full left-0 mt-2 z-[100] min-w-[160px] py-2 shadow-xl animate-in">
                {#each availableTags as t}
                    <button
                        class="w-full text-left px-4 py-2 text-sm hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-colors {filterTag === t ? 'text-[var(--primary)] font-bold' : 'text-75'}"
                        on:click={() => { filterTag = t; showTagMenu = false; }}
                    >
                        {t === 'all' ? '在该分类下搜索...' : `# ${t}`}
                    </button>
                {/each}
            </div>
        {/if}
    </div>

    <div class="text-xs text-30 font-bold border-l border-black/10 dark:border-white/10 pl-4 py-1 hidden sm:block">
        已筛选出 <span class="text-[var(--primary)] font-mono text-sm">{filteredPosts.length}</span> 篇文章
    </div>

    <div class="ml-auto flex gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
        <button class="p-2 rounded-md transition-all {viewMode === 'timeline' ? 'text-[var(--primary)] bg-[var(--card-bg)] shadow-sm' : 'opacity-30'}" on:click={() => viewMode = 'timeline'}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <button class="p-2 rounded-md transition-all {viewMode === 'grid' ? 'text-[var(--primary)] bg-[var(--card-bg)] shadow-sm' : 'opacity-30'}" on:click={() => viewMode = 'grid'}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        </button>
    </div>
</div>

{#if viewMode === 'timeline'}
    <div class="card-base px-8 py-6">
        {#each groups as group}
            <div class="mb-6 last:mb-0">
                <div class="flex items-center h-10 font-bold text-xl text-75 mb-2">{group.year}</div>
                {#each group.posts as post}
                    <a href={getPostUrlBySlug(post.slug)} class="group flex items-center py-2.5 transition-all border-b border-dashed border-black/5 dark:border-white/5 last:border-none">
                        <span class="w-16 text-sm text-30 font-mono transition group-hover:text-[var(--primary)]">{formatDate(post.data.published)}</span>
                        <span class="text-75 transition group-hover:text-[var(--primary)] group-hover:translate-x-1 truncate">{post.data.title}</span>
                    </a>
                {/each}
            </div>
        {/each}
    </div>
{:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each filteredPosts as post}
            <a href={getPostUrlBySlug(post.slug)} class="card-base p-5 group hover:border-[var(--primary)] border border-transparent transition-all flex flex-col justify-between min-h-[140px]">
                <div>
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-xs text-30 font-mono">{new Date(post.data.published).toISOString().split('T')[0]}</span>
                        <span class="text-[10px] px-2 py-0.5 bg-[var(--primary-light)] text-[var(--primary)] rounded-md font-bold uppercase">
                            {post.data.category || '未分类'}
                        </span>
                    </div>
                    <div class="text-75 font-bold transition group-hover:text-[var(--primary)] text-lg line-clamp-2 mb-2">
                        {post.data.title}
                    </div>
                </div>

                {#if post.data.tags && post.data.tags.length > 0}
                    <div class="flex flex-wrap gap-1.5 mt-auto">
                        {#each post.data.tags.slice(0, 3) as tag} 
                            <span class="text-[9px] opacity-40 bg-black/5 dark:bg-white/5 px-1.5 py-0.5 rounded">#{tag}</span>
                        {/each}
                    </div>
                {/if}
            </a>
        {/each}
    </div>
{/if}


<style>
    .select-trigger { background: rgba(0,0,0,0.03); border-radius: var(--radius-small); transition: all 0.2s; cursor: pointer; }
    :global(.dark) .select-trigger { background: rgba(255,255,255,0.05); }
    .select-trigger:hover { background: rgba(0,0,0,0.06); color: var(--primary); }

    .dropdown-menu { background: var(--card-bg); border: 1px solid rgba(0,0,0,0.05); border-radius: var(--radius-small); max-height: 280px; overflow-y: auto; }
    :global(.dark) .dropdown-menu { border-color: rgba(255,255,255,0.1); }
    .animate-in { animation: fadeIn 0.1s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }

    .text-75 { color: var(--text-color-75); }
    .text-50 { color: var(--text-color-50); }
    .text-30 { color: var(--text-color-30); }

    .dropdown-menu::-webkit-scrollbar { width: 3px; }
    .dropdown-menu::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 10px; }
</style>

