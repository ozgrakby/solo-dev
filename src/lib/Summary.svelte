<script>
    import { onMount } from 'svelte';
    import { supabase } from '$lib/supabase.js';
    import { appState } from '$lib/state.svelte.js';
    import { goto } from '$app/navigation';
    import { resolve } from '$app/paths';
    import * as Icons from 'lucide-svelte';

    // =========================================================================
    // 1. REAKTİF STATE'LER (TELEMETRİ SAYAÇLARI)
    // =========================================================================
    let taskStats = $state({ total: 0, active: 0, completed: 0 });
    let milestoneStats = $state({ total: 0, completed: 0 });
    let currentTime = $state('00:00:00');
    let loading = $state(true);

    // =========================================================================
    // 2. SUPABASE VERİ BİRLEŞTİRİCİ (TELEMETRY ENGINE)
    // =========================================================================
    async function fetchTelemetry() {
        if (!appState.project?.id) return;
        
        loading = true;

        // Tasks ve Milestones verilerini paralel (ve süper hızlı) çek
        const [tasksRes, milestonesRes] = await Promise.all([
            supabase.from('tasks').select('status').eq('project_id', appState.project.id),
            supabase.from('milestones').select('status').eq('project_id', appState.project.id)
        ]);

        // Tasks Hesaplamaları (in_progress, active = Çalışıyor | done, completed = Bitti)
        if (tasksRes.data) {
            const tasks = tasksRes.data;
            taskStats = {
                total: tasks.length,
                active: tasks.filter(t => t.status === 'in_progress' || t.status === 'active').length,
                completed: tasks.filter(t => t.status === 'done' || t.status === 'completed').length
            };
        }

        // Milestones Hesaplamaları
        if (milestonesRes.data) {
            const ms = milestonesRes.data;
            milestoneStats = {
                total: ms.length,
                completed: ms.filter(m => m.status === 'completed' || m.status === 'done').length
            };
        }

        loading = false;
    }

    // Saati ve Verileri Başlat
    onMount(() => {
        if (appState.project?.id) {
            fetchTelemetry();
        }

        // Canlı saat sayacı (Endüstriyel Workstation Hissiyatı)
        const timer = setInterval(() => {
            currentTime = new Date().toLocaleTimeString('en-GB', { hour12: false });
        }, 1000);

        return () => clearInterval(timer);
    });

    // Eğer aktif proje arayüzde değişirse verileri anında yeniden hesapla
    $effect(() => {
        if (appState.project?.id) {
            fetchTelemetry();
        }
    });

    // Yönlendirme Fonksiyonu
    function navigateTo(path) {
        goto(resolve(path));
    }
</script>

<!-- ======================================================================= -->
<!-- TAKTİKSEL TELEMETRİ ALT BARI (SUMMARY FOOTER) -->
<!-- ======================================================================= -->
<footer
    class="fixed bottom-0 left-0 right-0 z-50 h-12 bg-arsenal-console text-white px-3 sm:px-6 flex items-center justify-between font-mono text-xs border-t border-zinc-800 select-none shadow-lg"
>
    <!-- 1. SOL BLOK: SİSTEM DURUMU VE CANLI SAAT -->
    <div class="flex items-center gap-2.5 sm:gap-4 shrink-0">
        <div class="flex items-center gap-2">
            <span class="status-dot-lime animate-pulse !bg-arsenal-lime"></span>
            <span class="font-bold tracking-widest uppercase text-arsenal-lime text-[11px] sm:text-xs">
                SYS // ACTIVE
            </span>
        </div>
        
        <span class="text-zinc-600 hidden sm:inline">|</span>
        
        <div class="hidden sm:flex items-center gap-1.5 text-zinc-400 text-[11px]">
            <Icons.Clock class="w-3.5 h-3.5 text-zinc-500 shrink-0" />
            <span>CLOCK: <strong class="text-white font-mono">{currentTime}</strong></span>
        </div>
    </div>

    <!-- 2. ORTA BLOK: İNTERAKTİF TELEMETRİ ROZETLERİ (TIKLA VE GİT!) -->
    {#if appState.project?.id}
        <div class="flex items-center gap-2 sm:gap-3 overflow-x-auto py-1 max-w-[55%] sm:max-w-none">
            
            <!-- A) TASKS ROZETİ (Tıklayınca /tasks sayfasına atar) -->
            <button
                type="button"
                onclick={() => navigateTo('/tasks')}
                title="Click to jump to Kanban Tasks Board"
                class="flex items-center gap-1.5 px-2 py-1 bg-zinc-900 hover:bg-black border border-zinc-700 hover:border-arsenal-lime text-zinc-300 hover:text-white transition-none cursor-pointer group shrink-0"
            >
                <Icons.CheckSquare class="w-3.5 h-3.5 text-arsenal-lime group-hover:scale-110 transition-transform shrink-0" />
                <span class="text-[10px] uppercase tracking-wider font-bold">TASKS:</span>
                
                {#if loading}
                    <span class="text-[10px] animate-pulse text-zinc-500">...</span>
                {:else}
                    <span class="bg-arsenal-lime text-black font-extrabold px-1 text-[10px]">
                        {taskStats.active} ACT
                    </span>
                    <span class="text-zinc-400 text-[10px] hidden md:inline font-semibold">
                        / {taskStats.total} TOT
                    </span>
                {/if}
            </button>

            <!-- B) MILESTONES ROZETİ (Tıklayınca /milestones sayfasına atar) -->
            <button
                type="button"
                onclick={() => navigateTo('/milestones')}
                title="Click to jump to Roadmap Milestones"
                class="flex items-center gap-1.5 px-2 py-1 bg-zinc-900 hover:bg-black border border-zinc-700 hover:border-arsenal-cyan text-zinc-300 hover:text-white transition-none cursor-pointer group shrink-0"
            >
                <Icons.Milestone class="w-3.5 h-3.5 text-arsenal-cyan group-hover:scale-110 transition-transform shrink-0" />
                <span class="text-[10px] uppercase tracking-wider font-bold">ROADMAP:</span>
                
                {#if loading}
                    <span class="text-[10px] animate-pulse text-zinc-500">...</span>
                {:else}
                    <span class="bg-arsenal-cyan text-black font-extrabold px-1 text-[10px]">
                        {milestoneStats.completed}/{milestoneStats.total}
                    </span>
                {/if}
            </button>

        </div>
    {:else}
        <div class="text-[10px] text-zinc-500 italic uppercase">
            [NO PROJECT CONNECTED]
        </div>
    {/if}

    <!-- 3. SAĞ BLOK: PROJE LOGLAMA VE STATÜ -->
    <div class="flex items-center gap-3 shrink-0">
        <div class="text-right hidden sm:block">
            <span class="text-[8px] text-zinc-400 block leading-none uppercase tracking-wider">WORKSPACE</span>
            <span class="text-white font-bold text-xs leading-none uppercase truncate max-w-[100px] inline-block">
                {appState.project?.title || 'STANDBY'}
            </span>
        </div>
        
        <!-- Sadece Görsel Bir Endüstriyel Çelik Rozet (Buton Değil!) -->
        <div class="bg-zinc-800 border border-zinc-600 px-2 py-1 flex items-center gap-1 text-[10px] text-zinc-300 font-bold uppercase select-none">
            <Icons.Database class="w-3 h-3 text-arsenal-lime shrink-0" />
            <span class="hidden md:inline">SYNCED</span>
        </div>
    </div>
</footer>