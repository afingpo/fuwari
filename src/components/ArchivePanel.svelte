<script lang="ts">
    import { onMount } from "svelte";
    import I18nKey from "../i18n/i18nKey";
    import { i18n } from "../i18n/translation";
    import { getPostUrlBySlug } from "../utils/url-utils";

    export let sortedPosts: any[] = []; // 传入所有文章

    // 状态管理
    let viewMode: 'timeline' | 'grid' = 'timeline'; 
    let filterType: 'all' | 'essay' = 'all';
    let groups: any[] = [];

    // 响应式过滤逻辑：当 filterType 或 sortedPosts 改变时自动运行
    $: filteredPosts = sortedPosts.filter(post => {
        if (filterType === 'all') return true;
        return post.data.pType === 'essay';
    });

    // 响应式分组逻辑：基于过滤后的结果重新按年份分组
    $: {
        const grouped = filteredPosts.reduce((acc, post) => {
            const date = new Date(post.data.published);
            const year = date.getFullYear();
            if (!acc[year]) acc[year] = [];
            acc[year].push(post);
            return acc;
        }, {} as Record<number, any[]>);

        groups = Object.keys(grouped).map(year => ({
            year: Number(year),
            posts: grouped[Number(year)].sort((a, b) => 
                new Date(b.data.published).getTime() - new Date(a.data.published).getTime()
            )
        })).sort((a, b) => b.year - a.year);
    }

    function formatDate(dateStr: string | Date) {
        const date = new Date(dateStr);
        return `${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;
    }
</script>

<div class="flex flex-col md:flex-row gap-4 mb-4 items-center justify-between">
    <div class="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl w-full md:w-auto">
        <button 
            class="flex-1 md:flex-none px-6 py-2 rounded-lg transition-all {filterType === 'all' ? 'bg-white dark:bg-zinc-700 shadow-sm font-bold text-[var(--primary)]' : 'opacity-50'}"
            on:click={() => filterType = 'all'}>
            全部内容
        </button>
        <button 
            class="flex-1 md:flex-none px-6 py-2 rounded-lg transition-all {filterType === 'essay' ? 'bg-white dark:bg-zinc-700 shadow-sm font-bold text-[var(--primary)]' : 'opacity-50'}"
            on:click={() => filterType = 'essay'}>
            诗文随笔
        </button>
    </div>

    <div class="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
        <button 
            class="px-4 py-2 rounded-lg transition-all {viewMode === 'timeline' ? 'bg-white dark:bg-zinc-700 text-[var(--primary)] shadow-sm' : 'opacity-40'}"
            on:click={() => viewMode = 'timeline'}>
            时间轴
        </button>
        <button 
            class="px-4 py-2 rounded-lg transition-all {viewMode === 'grid' ? 'bg-white dark:bg-zinc-700 text-[var(--primary)] shadow-sm' : 'opacity-40'}"
            on:click={() => viewMode = 'grid'}>
            网格
        </button>
    </div>
</div>

{#if viewMode === 'timeline'}
    <div class="card-base px-8 py-6 onload-animation">
        {#each groups as group}
            <div>
                <div class="flex flex-row w-full items-center h-[3.75rem]">
                    <div class="w-[15%] md:w-[10%] transition text-2xl font-bold text-right text-75">{group.year}</div>
                    <div class="w-[15%] md:w-[10%]">
                        <div class="h-3 w-3 bg-none rounded-full outline outline-[var(--primary)] mx-auto -outline-offset-[2px] z-50 outline-3"></div>
                    </div>
                    <div class="w-[70%] md:w-[80%] transition text-left text-50">
                        {group.posts.length} {i18n(group.posts.length === 1 ? I18nKey.postCount : I18nKey.postsCount)}
                    </div>
                </div>
                {#each group.posts as post}
                    <a href={getPostUrlBySlug(post.slug)} class="group btn-plain !block h-10 w-full rounded-lg">
                        <div class="flex flex-row justify-start items-center h-full">
                            <div class="w-[15%] md:w-[10%] transition text-sm text-right text-50">{formatDate(post.data.published)}</div>
                            <div class="w-[15%] md:w-[10%] relative h-full flex items-center">
                                <div class="transition-all mx-auto w-1 h-1 rounded group-hover:h-5 bg-[oklch(0.5_0.05_var(--hue))] group-hover:bg-[var(--primary)] outline outline-4 z-50 outline-[var(--card-bg)]"></div>
                            </div>
                            <div class="w-[70%] md:max-w-[65%] md:w-[65%] text-left font-bold group-hover:translate-x-1 transition-all group-hover:text-[var(--primary)] text-75 pr-8 truncate">
                                {post.data.title}
                            </div>
                        </div>
                    </a>
                {/each}
            </div>
        {/each}
    </div>
{:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 onload-animation">
        {#each filteredPosts as post}
            <a href={getPostUrlBySlug(post.slug)} class="card-base p-5 flex flex-col justify-center group hover:border-[var(--primary)] border border-transparent transition-all">
                <div class="flex items-center gap-2 mb-2">
                    {#if post.data.era}
                        <span class="text-[10px] text-[var(--primary)] font-bold border border-[var(--primary)] px-1 rounded-sm">{post.data.era}</span>
                    {/if}
                    <span class="text-xs opacity-40 font-mono">{new Date(post.data.published).toISOString().split('T')[0]}</span>
                </div>
                <div class="font-bold text-lg group-hover:text-[var(--primary)] transition-colors flex items-center">
                    {post.data.title}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg>
                </div>
                {#if post.data.description}
                    <p class="text-sm opacity-60 mt-2 line-clamp-1">{post.data.description}</p>
                {/if}
            </a>
        {/each}
    </div>
{/if}

