<script>
    import * as Icons from 'lucide-svelte';
    let { selectedIcon = $bindable('Gamepad2'), label = 'Select Icon' } = $props();

    let search = $state('');

    const allIcons = Object.entries(Icons).filter(([name]) => 
        name !== 'createLucideIcon' && 
        name !== 'Icon' && 
        name !== 'default' &&
        /^[A-Z]/.test(name)
    );

    let filteredIcons = $derived(
        search.trim() === ''
            ? allIcons.slice(0, 42)
            : allIcons.filter(([name]) => name.toLowerCase().includes(search.toLowerCase())).slice(0, 60)
    );
</script>

<div class="space-y-2 font-sans">
    <div class="flex items-center justify-between gap-2">
        <label class="text-label !mb-0">
            {label} (<span class="text-arsenal-text font-bold">{allIcons.length}</span> AVAIL)
        </label>
        <div class="relative">
            <input 
                type="text" 
                bind:value={search} 
                placeholder="SEARCH (e.g., sword, bug)..." 
                class="input-tactical !py-1 !px-2 !w-44 sm:!w-52 uppercase text-[11px]"
            />
            {#if search}
                <button type="button" onclick={() => search = ''} class="absolute right-2 top-1 text-[11px] font-mono font-bold text-arsenal-muted hover:text-black">✕</button>
            {/if}
        </div>
    </div>

    <div class="grid grid-cols-6 sm:grid-cols-7 md:grid-cols-8 gap-1 max-h-36 overflow-y-auto p-1.5 rounded-none bg-arsenal-card border border-arsenal-border">
        {#each filteredIcons as [name, IconComp] (name)}
            <button
                type="button"
                onclick={() => selectedIcon = name}
                title={name}
                class="p-2 rounded-none border transition-none flex items-center justify-center cursor-pointer {selectedIcon === name ? 'bg-arsenal-console border-black text-arsenal-lime font-bold shadow-sm z-10' : 'border-transparent text-arsenal-muted hover:bg-white hover:text-black hover:border-arsenal-border'}"
            >
                <IconComp class="w-4 h-4 shrink-0" />
            </button>
        {:else}
            <div class="col-span-full py-4 text-center text-xs font-mono text-arsenal-muted uppercase">
                [NO ICONS MATCHING "{search}"]
            </div>
        {/each}
    </div>
</div>