<script lang="ts">
    export let title = "";
    export let items = [];

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

    <div class="space-y-0"> {#each items as item}
            <div class="group flex flex-row items-start min-h-12">
                <div class="w-[20%] md:w-[15%] text-sm text-right text-50 mt-1 pr-4 font-mono">
                    {formatDate(item.date)}
                </div>
                <div class="relative self-stretch flex flex-col items-center px-4">
                    <div class="w-3 h-3 rounded-full bg-[var(--primary)] z-10 outline outline-4 outline-[var(--card-bg)]"></div>
                    <div class="w-[2px] h-full bg-black/5 dark:bg-white/5 absolute top-3"></div>
                </div>
                <div class="flex-1 pb-8">
                    <div class="font-bold text-75 group-hover:text-[var(--primary)] transition">
                        {item.title}
                    </div>
                    <div class="text-sm text-30 mt-1">
                        {item.content}
                    </div>
                </div>
            </div>
        {/each}
    </div>
</div>

