<script lang="ts">
    import { onMount } from "svelte";
    import I18nKey from "../i18n/i18nKey";
    import { i18n } from "../i18n/translation";
    import { getPostUrlBySlug } from "../utils/url-utils";

    export let sortedPosts: any[] = [];

    // --- 状态管理 ---
    let viewMode: 'timeline' | 'grid' = 'timeline';
    let filterCategory: string = 'all';
    let filterTag: string = 'all';

    // 控制自定义下拉框的显隐
    let showCatMenu = false;
    let showTagMenu = false;

    // --- 数据提取 (逻辑同步你之前的冗余处理) ---
    $: categories = ['all', ...new Set(sortedPosts.map(p => {
        if (p.data?.pType === 'essay' && !p.data?.category) return '随笔';
        return p.data?.category || '未分类';
    }))].sort();

    $: tags = ['all', ...new Set(sortedPosts.flatMap(p => {
        const t = p.data?.tags;
        if (Array.isArray(t)) return t.filter(tag => tag && String(tag).trim() !== '');
        if (typeof t === 'string' && t.trim() !== '') return [t.trim()];
        return [];
    }))].sort();

    // --- 筛选逻辑 ---
    $: filteredPosts = sortedPosts.filter(post => {
        const postCat = (post.data?.pType === 'essay' && !post.data?.category) ? '随笔' : (post.data?.category || '未分类');
        const matchCategory = filterCategory === 'all' || postCat === filterCategory;
        
        let postTags = post.data?.tags || [];
        if (typeof postTags === 'string') postTags = [postTags];
        const matchTag = filterTag === 'all' || (Array.isArray(postTags) && postTags.includes(filterTag));
        
        return matchCategory && matchTag;
    });

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

    // 点击外部关闭下拉框
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
                {#each tags as t}
                    <button 
                        class="w-full text-left px-4 py-2 text-sm hover:bg-[var(--primary-light)] hover:text-[var(--primary)] transition-colors {filterTag === t ? 'text-[var(--primary)] font-bold' : 'text-75'}"
                        on:click={() => { filterTag = t; showTagMenu = false; }}
                    >
                        {t === 'all' ? '显示全部' : `# ${t}`}
                    </button>
                {/each}
            </div>
        {/if}
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
    <div class="card-base px-8 py-6 onload-animation">
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
        {#if groups.length === 0}
            <div class="py-12 text-center text-30">没有找到相关文章</div>
        {/if}
    </div>
{:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 onload-animation">
        {#each filteredPosts as post}
            <a href={getPostUrlBySlug(post.slug)} class="card-base p-5 group hover:border-[var(--primary)] border border-transparent transition-all min-h-[110px] flex flex-col justify-between">
                <div>
                    <div class="flex items-center gap-2 mb-2">
                        {#if post.data.era}
                            <span class="text-[10px] text-[var(--primary)] font-bold border border-[var(--primary)] px-1.5 py-0.5 rounded-sm">{post.data.era}</span>
                        {/if}
                        <span class="text-xs text-30 font-mono">{new Date(post.data.published).toISOString().split('T')[0]}</span>
                    </div>
                    <div class="text-75 font-bold transition group-hover:text-[var(--primary)] text-lg line-clamp-2">
                        {post.data.title}
                    </div>
                </div>
                <div class="text-[10px] text-50 mt-4 uppercase tracking-widest font-bold">
                    <span class="bg-black/5 dark:bg-white/5 px-2 py-1 rounded-md">{post.data.category || '未分类'}</span>
                </div>
            </a>
        {/each}
        {#if filteredPosts.length === 0}
            <div class="col-span-full card-base py-12 text-center text-30">没有找到相关文章</div>
        {/if}
    </div>
{/if}

<style>
    .select-trigger {
        background: rgba(0,0,0,0.03);
        border-radius: var(--radius-small);
        transition: all 0.2s;
    }
    :global(.dark) .select-trigger {
        background: rgba(255,255,255,0.05);
    }
    .select-trigger:hover {
        background: rgba(0,0,0,0.06);
        color: var(--primary);
    }
    :global(.dark) .select-trigger:hover {
        background: rgba(255,255,255,0.1);
    }

    .dropdown-menu {
        background: var(--card-bg);
        border: 1px solid rgba(0,0,0,0.05);
        border-radius: var(--radius-small);
        max-height: 300px;
        overflow-y: auto;
    }
    :global(.dark) .dropdown-menu {
        border-color: rgba(255,255,255,0.1);
    }

    .animate-in {
        animation: fadeIn 0.15s ease-out;
    }

    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-4px); }
        to { opacity: 1; transform: translateY(0); }
    }

    /* 统一 Fuwari 颜色变量 */
    .text-75 { color: var(--text-color-75); }
    .text-50 { color: var(--text-color-50); }
    .text-30 { color: var(--text-color-30); }

    /* 滚动条美化 */
    .dropdown-menu::-webkit-scrollbar { width: 4px; }
    .dropdown-menu::-webkit-scrollbar-thumb { background: var(--primary); border-radius: 10px; }
</style>

