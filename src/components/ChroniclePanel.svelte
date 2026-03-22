<script lang="ts">
    export let title = "";
    export let items = [];
    export let mode: "timeline" | "list" = "timeline";

    function formatDate(dateStr: string) {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
    }
</script>

<div class="card-base px-8 py-6 mb-6">
    <h2 class="text-2xl font-bold mb-6 text-[var(--primary)] flex items-center">
        <div class="w-2 h-8 bg-[var(--primary)] rounded-full mr-3"></div>
        {title}
    </h2>

    <div class="space-y-4">
        {#each items as item}
            {#if mode === "timeline"}
                <div class="group flex flex-row items-start min-h-12">
                    <div class="w-[20%] md:w-[15%] text-sm text-right text-50 mt-1 pr-4">
                        {formatDate(item.date)}
                    </div>
                    <div class="relative self-stretch flex flex-col items-center px-4">
                        <div class="w-3 h-3 rounded-full bg-[var(--primary)] z-10 outline outline-4 outline-[var(--card-bg)]"></div>
                        <div class="w-[2px] h-full bg-black/5 dark:bg-white/5 absolute top-3"></div>
                    </div>
                    <div class="flex-1 pb-8">
                        <div class="font-bold text-75 group-hover:text-[var(--primary)] transition">{item.title}</div>
                        <div class="text-sm text-30 mt-1">{item.content}</div>
                    </div>
                </div>
            {:else}
                <a href={item.link} target="_blank" class="block p-4 rounded-lg bg-black/5 dark:bg-white/5 hover:bg-[var(--primary)]/10 transition group">
                    <div class="flex justify-between items-center">
                        <span class="font-bold text-75">{item.title}</span>
                        <span class="text-xs text-30 italic">@{item.author}</span>
                    </div>
                    <p class="text-sm text-50 mt-1">{item.content}</p>
                </a>
            {/if}
        {/each}
    </div>
</div>

