<script lang="ts">
    import { onMount } from "svelte";
    import I18nKey from "../i18n/i18nKey";
    import { i18n } from "../i18n/translation";
    import { getPostUrlBySlug } from "../utils/url-utils";

    export let sortedPosts: any[] = [];
    
    // 状态管理
    let viewMode: 'timeline' | 'grid' = 'timeline';
    let filterPType: string = 'all'; // all, essay, post...
    let filterCategory: string = 'all';
    let filterTag: string = 'all';

    // 获取所有去重后的分类和标签用于下拉框
    $: categories = ['all', ...new Set(sortedPosts.map(p => p.data.category).filter(Boolean))];
    $: tags = ['all', ...new Set(sortedPosts.flatMap(p => p.data.tags || []).filter(Boolean))];

    // 核心筛选逻辑
    $: filteredPosts = sortedPosts.filter(post => {
        const matchPType = filterPType === 'all' || post.data.pType === filterPType;
        const matchCategory = filterCategory === 'all' || post.data.category === filterCategory;
        const matchTag = filterTag === 'all' || (post.data.tags && post.data.tags.includes(filterTag));
        return matchPType && matchCategory && matchTag;
    });

    // 分组逻辑
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
</script>

<div class="filter-container mb-6 p-4 card-base flex flex-wrap gap-4 items-center">
    <div class="flex bg-black/5 dark:bg-white/5 p-1 custom-rounded">
        <button class="px-4 py-1.5 text-sm transition-all {filterPType === 'all' ? 'selected' : 'opacity-50'}" on:click={() => filterPType = 'all'}>全部</button>
        <button class="px-4 py-1.5 text-sm transition-all {filterPType === 'essay' ? 'selected' : 'opacity-50'}" on:click={() => filterPType = 'essay'}>随笔</button>
    </div>

    <div class="flex items-center gap-2">
        <span class="text-xs opacity-50">分类</span>
        <select bind:value={filterCategory} class="select-custom text-sm py-1.5 px-3">
            {#each categories as cat}
                <option value={cat}>{cat === 'all' ? '全部' : cat}</option>
            {/each}
        </select>
    </div>

    <div class="flex items-center gap-2">
        <span class="text-xs opacity-50">标签</span>
        <select bind:value={filterTag} class="select-custom text-sm py-1.5 px-3">
            {#each tags as t}
                <option value={t}>{t === 'all' ? '全部' : t}</option>
            {/each}
        </select>
    </div>

    <div class="ml-auto flex gap-2">
        <button class="p-2 opacity-50 hover:opacity-100 {viewMode === 'timeline' ? 'text-[var(--primary)] !opacity-100' : ''}" on:click={() => viewMode = 'timeline'}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <button class="p-2 opacity-50 hover:opacity-100 {viewMode === 'grid' ? 'text-[var(--primary)] !opacity-100' : ''}" on:click={() => viewMode = 'grid'}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        </button>
    </div>
</div>

{#if viewMode === 'timeline'}
    <div class="card-base px-8 py-6">
        {#each groups as group}
            <div class="mb-4">
                <div class="flex items-center h-10 font-bold text-xl opacity-80">{group.year}</div>
                {#each group.posts as post}
                    <a href={getPostUrlBySlug(post.slug)} class="flex items-center py-2 hover:text-[var(--primary)] transition-all">
                        <span class="w-16 text-sm opacity-40 font-mono">{formatDate(post.data.published)}</span>
                        <span class="truncate">{post.data.title}</span>
                    </a>
                {/each}
            </div>
        {/each}
    </div>
{:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        {#each filteredPosts as post}
            <a href={getPostUrlBySlug(post.slug)} class="card-base p-5 group hover:border-[var(--primary)] border border-transparent transition-all">
                <div class="text-[var(--primary)] font-bold">{post.data.title}</div>
                <div class="text-xs opacity-40 mt-1">{post.data.category || '未分类'}</div>
            </a>
        {/each}
    </div>
{/if}

<style>
    /* 使用 va.styl 中的圆角变量 */
    .custom-rounded {
        border-radius: var(--radius-medium);
    }
    
    .select-custom {
        background: rgba(0,0,0,0.05);
        border: none;
        border-radius: var(--radius-small);
        outline: none;
        appearance: none;
        cursor: pointer;
    }

    :global(.dark) .select-custom {
        background: rgba(255,255,255,0.05);
        color: white;
    }

    .selected {
        background: white;
        border-radius: var(--radius-small);
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        color: var(--primary);
        font-weight: bold;
    }

    :global(.dark) .selected {
        background: var(--primary);
        color: white;
    }
</style>

