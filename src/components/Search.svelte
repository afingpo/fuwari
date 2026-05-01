<script lang="ts">
    import I18nKey from "@i18n/i18nKey";
    import { i18n } from "@i18n/translation";
    import Icon from "@iconify/svelte";
    import { url } from "@utils/url-utils.ts";
    import { onMount, tick, onDestroy } from "svelte";
    import type { SearchResult } from "@/global";

    let keyword = "";
    let result: SearchResult[] = [];
    let isSearching = false;
    let pagefindLoaded = false;
    let initialized = false;
    let showPanel = false;
    
    let inputElement: HTMLInputElement;
    let containerElement: HTMLElement;

    const fakeResult: SearchResult[] = [
        {
            url: url("/"),
            meta: { title: "This Is a Fake Search Result" },
            excerpt: "Because the search cannot work in the <mark>dev</mark> environment.",
        },
        {
            url: url("/"),
            meta: { title: "Try npm build && npm preview" },
            excerpt: "To test the real search functionality.",
        },
    ];

    const togglePanel = async () => {
        showPanel = !showPanel;
        if (showPanel) {
            await tick();
            if (containerElement) {
                document.body.appendChild(containerElement);
                document.body.style.overflow = 'hidden'; 
            }
            inputElement?.focus();
        } else {
            document.body.style.overflow = '';
            keyword = "";
            result = [];
        }
    };

    const search = async (q: string): Promise<void> => {
        if (!q) {
            result = [];
            return;
        }
        if (!initialized) return;

        isSearching = true;
        try {
            let searchResults: SearchResult[] = [];
            if (import.meta.env.PROD && pagefindLoaded && window.pagefind) {
                const response = await window.pagefind.search(q);
                searchResults = await Promise.all(response.results.map((item) => item.data()));
            } else if (import.meta.env.DEV) {
                searchResults = fakeResult;
            }
            result = searchResults;
        } catch (error) {
            console.error("Search error:", error);
            result = [];
        } finally {
            isSearching = false;
        }
    };

    onMount(() => {
        const initializeSearch = () => {
            initialized = true;
            pagefindLoaded = typeof window !== "undefined" && !!window.pagefind && typeof window.pagefind.search === "function";
        };

        if (import.meta.env.DEV) {
            initializeSearch();
        } else {
            document.addEventListener("pagefindready", initializeSearch);
            document.addEventListener("pagefindloaderror", initializeSearch);
            setTimeout(() => { if (!initialized) initializeSearch(); }, 2000);
        }
    });

    onDestroy(() => {
        if (containerElement && containerElement.parentNode === document.body) {
            document.body.removeChild(containerElement);
            document.body.style.overflow = '';
        }
    });

    $: if (initialized) {
        search(keyword);
    }
</script>

<button on:click={togglePanel} aria-label="Search" id="search-switch"
        class="btn-plain scale-animation rounded-lg w-11 h-11 active:scale-90 flex items-center justify-center p-0">
    <Icon icon="material-symbols:search" class="text-[1.25rem]"></Icon>
</button>

{#if showPanel}
    <div bind:this={containerElement} class="search-root">
        <div class="search-mask" on:click={togglePanel}></div>

        <div id="search-panel" class="search-panel-body animate-in">
            <div class="flex items-center h-12 px-4 bg-black/[0.04] dark:bg-white/5 
                        border-b-2 border-transparent focus-within:border-[var(--primary)] transition-all">
                <Icon icon="material-symbols:search" class="text-[1.5rem] text-black/30 dark:text-white/30"></Icon>
                <input 
                    bind:this={inputElement}
                    bind:value={keyword}
                    placeholder={i18n(I18nKey.search)}
                    class="flex-1 ml-3 bg-transparent outline-none text-black/70 dark:text-white/80 text-base"
                />
                {#if isSearching}
                    <div class="animate-spin h-5 w-5 border-2 border-[var(--primary)] border-t-transparent rounded-full"></div>
                {/if}
                <button on:click={togglePanel} class="ml-3 p-1 hover:bg-black/10 dark:hover:bg-white/10 transition">
                    <Icon icon="material-symbols:close" class="text-black/40 dark:text-white/40" />
                </button>
            </div>

            <div class="mt-2 overflow-y-auto max-h-[60vh] custom-scrollbar px-1">
                {#if result.length > 0}
                    {#each result as item}
                        <a href={item.url} on:click={togglePanel}
                           class="group block px-4 py-3 mb-1 transition
                                  hover:bg-[var(--btn-plain-bg-hover)] active:bg-[var(--btn-plain-bg-active)]">
                            <div class="flex items-center font-bold text-[var(--deep-text)] group-hover:text-[var(--primary)] transition">
                                {item.meta.title}
                                <Icon icon="material-symbols:chevron-right" class="ml-1 text-lg opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                            </div>
                            <div class="text-sm text-black/50 dark:text-white/40 mt-1 line-clamp-2">
                                {@html item.excerpt}
                            </div>
                        </a>
                    {/each}
                {:else if keyword}
                    <div class="py-10 text-center text-black/30 dark:text-white/30">
                        No results found for "{keyword}"
                    </div>
                {/if}
            </div>
        </div>
    </div>
{/if}

<style>
    .search-root {
        position: fixed;
        inset: 0;
        z-index: 10000;
        display: flex;
        align-items: flex-start;
        justify-content: center;
        padding-top: 5rem;
    }

    .search-mask {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.4);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
    }

    .search-panel-body {
        position: relative;
        width: 90vw;
        max-width: 40rem;
        max-height: 80vh;
        background: var(--card-bg);
        border-radius: 0; /* 👈 彻底直角 */
        padding: 1rem;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        border: 1px solid rgba(255, 255, 255, 0.1);
    }

    /* 滚动条也调得更硬朗一点 */
    .custom-scrollbar::-webkit-scrollbar {
        width: 4px;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: var(--primary);
        border-radius: 0; 
    }

    .animate-in {
        animation: modal-in 0.2s ease-out;
    }
    @keyframes modal-in {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
</style>

