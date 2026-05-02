<script lang="ts">
    import { onMount } from "svelte";
    import I18nKey from "../i18n/i18nKey";
    import { i18n } from "../i18n/translation";
    import { getPostUrlBySlug } from "../utils/url-utils";

    export let sortedPosts: any[] = [];

    // --- 状态管理 ---
    let viewMode: 'timeline' | 'grid' = 'timeline';
    let filterPType: string = 'all'; // all, essay...
    let filterCategory: string = 'all';
    let filterTag: string = 'all';

    // --- 响应式数据提取（冗余强化版） ---
    
    // 提取分类：将 undefined 统一处理为“未分类”
    $: categories = ['all', ...new Set(sortedPosts.map(p => p.data?.category || '未分类'))].sort();

    // 提取标签：支持数组和单字符串，过滤空值并去重
    $: tags = ['all', ...new Set(sortedPosts.flatMap(p => {
        const t = p.data?.tags;
        if (Array.isArray(t)) return t.filter(tag => tag && String(tag).trim() !== '');
        if (typeof t === 'string' && t.trim() !== '') return [t.trim()];
        return [];
    }))].sort();

    // --- 核心筛选逻辑 ---
    $: filteredPosts = sortedPosts.filter(post => {
        // 1. 类型过滤
        const matchPType = filterPType === 'all' || post.data?.pType === filterPType;
        
        // 2. 分类过滤 (处理未分类冗余)
        const postCat = post.data?.category || '未分类';
        const matchCategory = filterCategory === 'all' || postCat === filterCategory;
        
        // 3. 标签过滤 (深度防御)
        let postTags = post.data?.tags || [];
        if (typeof postTags === 'string') postTags = [postTags];
        const matchTag = filterTag === 'all' || (Array.isArray(postTags) && postTags.includes(filterTag));
        
        return matchPType && matchCategory && matchTag;
    });

    // --- 联动重置逻辑 ---
    // 当切换文章大类（如从全部切到随笔）时，重置分类和标签筛选，防止因为条件冲突导致“加载不出”
    function handlePTypeChange(type: string) {
        filterPType = type;
        filterCategory = 'all';
        filterTag = 'all';
    }

    // --- 分组与格式化 ---
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
    <div class="flex bg-black/5 dark:bg-white/5 p-1 custom-rounded-m">
        <button 
            class="px-4 py-1.5 text-sm transition-all {filterPType === 'all' ? 'selected' : 'opacity-50 hover:opacity-100'}" 
            on:click={() => handlePTypeChange('all')}>全部</button>
        <button 
            class="px-4 py-1.5 text-sm transition-all {filterPType === 'essay' ? 'selected' : 'opacity-50 hover:opacity-100'}" 
            on:click={() => handlePTypeChange('essay')}>随笔</button>
    </div>

    <div class="flex items-center gap-2">
        <span class="text-[10px] uppercase tracking-wider opacity-40 font-bold">Category</span>
        <select bind:value={filterCategory} class="select-custom text-sm py-1.5 px-3 custom-rounded-s">
            {#each categories as cat}
                <option value={cat}>{cat === 'all' ? '全部分类' : cat}</option>
            {/each}
        </select>
    </div>

    <div class="flex items-center gap-2">
        <span class="text-[10px] uppercase tracking-wider opacity-40 font-bold">Tag</span>
        <select bind:value={filterTag} class="select-custom text-sm py-1.5 px-3 custom-rounded-s">
            {#each tags as t}
                <option value={t}>{t === 'all' ? '全部标签' : t}</option>
            {/each}
        </select>
    </div>

    <div class="ml-auto flex gap-1">
        <button 
            class="p-2 custom-rounded-s transition-all {viewMode === 'timeline' ? 'text-[var(--primary)] bg-black/5 dark:bg-white/10' : 'opacity-30 hover:opacity-100'}" 
            on:click={() => viewMode = 'timeline'}
            title="时间轴模式">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
        <button 
            class="p-2 custom-rounded-s transition-all {viewMode === 'grid' ? 'text-[var(--primary)] bg-black/5 dark:bg-white/10' : 'opacity-30 hover:opacity-100'}" 
            on:click={() => viewMode = 'grid'}
            title="网格模式">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
        </button>
    </div>
</div>

{#if viewMode === 'timeline'}
    <div class="card-base px-8 py-6">
        {#if groups.length === 0}
            <div class="py-10 text-center opacity-30">没有找到匹配的文章</div>
        {/if}
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
        {#if filteredPosts.length === 0}
            <div class="col-span-full card-base py-10 text-center opacity-30">没有找到匹配的文章</div>
        {/if}
        {#each filteredPosts as post}
            <a href={getPostUrlBySlug(post.slug)} class="card-base p-5 group hover:border-[var(--primary)] border border-transparent transition-all flex flex-col justify-between min-h-[120px]">
                <div>
                    <div class="flex items-center gap-2 mb-2">
                        {#if post.data.era}
                            <span class="text-[10px] text-[var(--primary)] font-bold border border-[var(--primary)] px-1.5 py-0.5 custom-rounded-s">{post.data.era}</span>
                        {/if}
                        <span class="text-xs text-30 font-mono">{new Date(post.data.published).toISOString().split('T')[0]}</span>
                    </div>
                    <div class="text-75 font-bold transition group-hover:text-[var(--primary)] text-lg leading-snug">
                        {post.data.title}
                    </div>
                </div>
                <div class="text-[10px] text-50 mt-4 flex items-center gap-2 uppercase tracking-widest font-bold">
                    <span class="bg-black/5 dark:bg-white/5 px-2 py-1 custom-rounded-s">{post.data.category || '未分类'}</span>
                </div>
            </a>
        {/each}
    </div>
{/if}

<style>
    /* 圆角同步 va.styl */
    .custom-rounded-m { border-radius: var(--radius-medium); }
    .custom-rounded-s { border-radius: var(--radius-small); }
    
    .select-custom {
        background: rgba(0,0,0,0.05);
        border: 1px solid transparent;
        outline: none;
        appearance: none;
        cursor: pointer;
        transition: all 0.2s;
        font-weight: 500;
    }

    .select-custom:hover {
        background: rgba(0,0,0,0.08);
        border-color: var(--primary);
    }

    :global(.dark) .select-custom {
        background: rgba(255,255,255,0.05);
        color: var(--text-color-75);
    }

    .selected {
        background: white;
        border-radius: var(--radius-small);
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        color: var(--primary);
        font-weight: bold;
    }

    :global(.dark) .selected {
        background: var(--primary);
        color: white;
    }

    /* 颜色类名补丁 */
    .text-75 { color: var(--text-color-75); }
    .text-50 { color: var(--text-color-50); }
    .text-30 { color: var(--text-color-30); }
</style>


