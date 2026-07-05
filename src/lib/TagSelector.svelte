<script>
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabase.js';
    import * as Icons from 'lucide-svelte';
    import IconPicker from '$lib/IconPicker.svelte';

    let { selectedTags = $bindable([]) } = $props();
    let availableTags = $state([]);
    let loading = $state(false);
    let isManaging = $state(false);
    let newTag = $state({ title: '', icon: 'Tag', color: 'lime', order_index: 0 });
    let isSubmitting = $state(false);

    const colorPalette = {
        lime:    { name: 'Console Lime', badge: 'badge-console', selected: 'bg-arsenal-lime text-arsenal-console border border-black font-bold shadow-xs', dot: 'bg-arsenal-lime' },
        slate:   { name: 'CAD Gray',     badge: 'badge-neutral', selected: 'bg-black text-white border border-black font-bold shadow-xs', dot: 'bg-zinc-500' },
        red:     { name: 'Critical Red', badge: 'badge-red',     selected: 'bg-red-600 text-white border border-black font-bold shadow-xs', dot: 'bg-red-500' },
        amber:   { name: 'Warning Amber',badge: 'badge-amber',   selected: 'bg-amber-500 text-black border border-black font-bold shadow-xs', dot: 'bg-amber-500' },
        green:   { name: 'Stable Green', badge: 'badge-green',   selected: 'bg-emerald-600 text-white border border-black font-bold shadow-xs', dot: 'bg-emerald-500' },
        cyan:    { name: 'Tech Cyan',    badge: 'badge-cyan',    selected: 'bg-sky-600 text-white border border-black font-bold shadow-xs', dot: 'bg-sky-500' },
        blue:    { name: 'Blue (Legacy)',badge: 'badge-cyan',    selected: 'bg-sky-600 text-white border border-black font-bold shadow-xs', dot: 'bg-sky-500' },
        orange:  { name: 'Orange (Leg)', badge: 'badge-amber',   selected: 'bg-amber-500 text-black border border-black font-bold shadow-xs', dot: 'bg-amber-500' }
    };

    onMount(() => {
        fetchTags();
    });

    async function fetchTags() {
        loading = true;
        const { data, error } = await supabase
            .from('tags')
            .select('*')
            .order('order_index', { ascending: true });
        if (!error && data) {
            availableTags = data;
        }
        loading = false;
    }

    function toggleTag(tag) {
        const exists = selectedTags.some(t => t.title === tag.title);
        if (exists) {
            selectedTags = selectedTags.filter(t => t.title !== tag.title);
        } else {
            selectedTags = [...selectedTags, { title: tag.title, icon: tag.icon, color: tag.color }];
        }
    }

    async function handleCreateTag(e) {
        e.preventDefault();
        if (!newTag.title.trim()) return;

        isSubmitting = true;
        const { data, error } = await supabase
            .from('tags')
            .insert([{
                title: newTag.title.trim(),
                icon: newTag.icon || 'Tag',
                color: newTag.color || 'lime',
                order_index: Number(newTag.order_index) || 0
            }])
            .select();
        if (!error && data) {
            availableTags = [...availableTags, data[0]];
            toggleTag(data[0]);
            newTag = { title: '', icon: 'Tag', color: 'lime', order_index: 0 };
            isManaging = false;
        }
        isSubmitting = false;
    }
</script>

<div class="space-y-1.5 font-sans">
    <div class="flex items-center justify-between">
        <label class="text-label !mb-0">TAGS // LABELS</label>
        <button 
            type="button" 
            onclick={() => isManaging = !isManaging}
            class="text-[11px] font-mono font-bold text-arsenal-text hover:text-black underline cursor-pointer uppercase select-none"
        >
            {isManaging ? '- CLOSE SETUP' : '+ MANAGE / ADD NEW'}
        </button>
    </div>

    {#if loading}
        <div class="text-xs font-mono text-arsenal-muted animate-pulse py-2">LOADING TAGS...</div>
    {:else if availableTags.length === 0 && !isManaging}
        <div class="rounded-none border border-dashed border-arsenal-border p-3 text-center text-xs font-mono text-arsenal-muted uppercase">
            NO TAGS AVAILABLE. CLICK "+ MANAGE" TO CREATE ONE.
        </div>
    {:else}
        <div class="flex flex-wrap gap-1 max-h-28 overflow-y-auto p-1.5 rounded-none bg-arsenal-card border border-arsenal-border">
            {#each availableTags as tag (tag.id || tag.title)}
                {@const isSelected = selectedTags.some(t => t.title === tag.title)}
                {@const TagIcon = Icons[tag.icon] || Icons[tag.icon?.charAt(0).toUpperCase() + tag.icon?.slice(1)] || Icons.Tag}
                <!-- Doğrudan layout.css'teki badge sınıfını basıyoruz: -->
                {@const badgeStyle = isSelected ? (colorPalette[tag.color]?.selected || colorPalette.lime.selected) : (colorPalette[tag.color]?.badge || colorPalette.lime.badge)}
                
                <button
                    type="button"
                    onclick={() => toggleTag(tag)}
                    class="inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-mono font-medium transition-none cursor-pointer border {badgeStyle}"
                >
                    <TagIcon class="w-3.5 h-3.5 shrink-0" />
                    <span>{tag.title}</span>
                    {#if isSelected}<span class="text-[10px] ml-0.5 font-bold">✓</span>{/if}
                </button>
            {/each}
        </div>
    {/if}

    <!-- SATIR İÇİ (INLINE) AÇILAN FORM -->
    {#if isManaging}
        <div class="mt-2 p-3.5 bg-arsenal-surface border border-arsenal-text space-y-3 font-sans shadow-sm">
            <div class="flex items-center justify-between border-b border-arsenal-border pb-2">
                <span class="font-mono text-[11px] font-bold uppercase tracking-wider text-arsenal-text flex items-center gap-1.5">
                    <span class="status-dot-lime !bg-black"></span>
                    NEW TAG // INLINE SETUP
                </span>
                <button type="button" onclick={() => isManaging = false} class="text-[10px] font-mono font-bold text-arsenal-muted hover:text-black uppercase">✕ CANCEL</button>
            </div>

            <form onsubmit={handleCreateTag} class="space-y-3">
                <div class="grid grid-cols-3 gap-2">
                    <div class="col-span-2">
                        <label class="text-label" for="t-title">TAG TITLE</label>
                        <input id="t-title" type="text" bind:value={newTag.title} placeholder="e.g., BUG, UI, NETCODE" required class="input-tactical uppercase !py-1.5" />
                    </div>
                    <div>
                        <label class="text-label" for="t-order">ORDER</label>
                        <input id="t-order" type="number" bind:value={newTag.order_index} placeholder="0" class="input-tactical !py-1.5 font-mono" />
                    </div>
                </div>

                <div>
                    <label class="text-label">
                        COLOR BADGE: <span class="text-black font-mono font-bold uppercase">{colorPalette[newTag.color]?.name || newTag.color}</span>
                    </label>
                    <div class="flex flex-wrap gap-1.5 p-1.5 rounded-none bg-arsenal-card border border-arsenal-border">
                        {#each Object.entries(colorPalette) as [key, col] (key)}
                            <button
                                type="button"
                                onclick={() => newTag.color = key}
                                title={col.name}
                                class="w-5 h-5 rounded-none flex items-center justify-center transition-none {col.dot} {newTag.color === key ? 'ring-2 ring-black scale-110 z-10 shadow-xs' : 'opacity-60 hover:opacity-100'} cursor-pointer"
                            ></button>
                        {/each}
                    </div>
                </div>

                <IconPicker bind:selectedIcon={newTag.icon} label="TAG ICON" />

                <div class="flex justify-end gap-2 pt-2 border-t border-arsenal-border/60">
                    <button type="button" onclick={() => isManaging = false} class="btn-primary !py-1 !px-3">CANCEL</button>
                    <button type="submit" disabled={isSubmitting} class="btn-lime !py-1 !px-4 disabled:opacity-50">+ ADD & SELECT</button>
                </div>
            </form>
        </div>
    {/if}
</div>