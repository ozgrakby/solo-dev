<script>
  import { appState } from '$lib/state.svelte.js';
  import { resolve } from '$app/paths';
  import { Milestone, Kanban, FileText, GitCommit, GitBranch, Activity, Terminal, ArrowUpRight } from 'lucide-svelte';
</script>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans select-none">
  
  <div class="mb-8 border-b border-arsenal-border pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
    <div>
      <div class="flex items-center gap-2 mb-1 font-mono text-xs text-arsenal-muted font-bold">
        <span class="status-dot-lime !bg-black"></span>
        <h1 class="text-2xl sm:text-3xl font-mono font-extrabold tracking-tight uppercase text-arsenal-text">
          PROJECT DASHBOARD // <span class="underline decoration-2 underline-offset-4">{appState.project?.title || 'UNASSIGNED'}</span>
        </h1>
      </div>
    </div>

    <div class="flex items-center gap-2 font-mono text-xs">
      <span class="badge-neutral bg-white !py-1">
        STATUS: <strong class="text-black ml-1">ACTIVE PROJECT</strong>
      </span>
    </div>
  </div>

  <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
    
    <a href={resolve('/milestones')} class="general-card-interactive !p-5 flex flex-col justify-between group min-h-[160px]">
      <div>
        <div class="flex items-start justify-between gap-2 border-b border-arsenal-border/60 pb-3 mb-3">
          <div class="flex h-9 w-9 items-center justify-center bg-arsenal-console text-white group-hover:text-arsenal-lime transition-none border border-black shrink-0">
            <Milestone class="w-5 h-5" />
          </div>
          <span class="font-mono text-xs font-bold text-arsenal-muted group-hover:text-black flex items-center gap-0.5">
            <ArrowUpRight class="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        </div>
        <h3 class="font-mono font-bold text-base text-arsenal-text uppercase tracking-wide group-hover:underline">Milestones</h3>
        <p class="mt-1.5 text-xs text-arsenal-muted leading-relaxed font-sans">Horizontal scrolling columns, target roadmaps and sprint goals.</p>
      </div>
      <div class="mt-4 pt-2 border-t border-arsenal-border/40 text-[10px] font-mono text-arsenal-muted flex justify-between uppercase">
        <span>ROADMAP TRACKER</span>
        <span class="font-bold text-black">OPEN →</span>
      </div>
    </a>

    <a href={resolve('/tasks')} class="general-card-interactive !p-5 flex flex-col justify-between group min-h-[160px]">
      <div>
        <div class="flex items-start justify-between gap-2 border-b border-arsenal-border/60 pb-3 mb-3">
          <div class="flex h-9 w-9 items-center justify-center bg-arsenal-console text-white group-hover:text-arsenal-lime transition-none border border-black shrink-0">
            <Kanban class="w-5 h-5" />
          </div>
          <span class="font-mono text-xs font-bold text-arsenal-muted group-hover:text-black flex items-center gap-0.5">
            <ArrowUpRight class="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        </div>
        <h3 class="font-mono font-bold text-base text-arsenal-text uppercase tracking-wide group-hover:underline">Tasks (Kanban)</h3>
        <p class="mt-1.5 text-xs text-arsenal-muted leading-relaxed font-sans">Icebox, Backlog, In Progress and Done board with orphan alerts.</p>
      </div>
      <div class="mt-4 pt-2 border-t border-arsenal-border/40 text-[10px] font-mono text-arsenal-muted flex justify-between uppercase">
        <span>TASK BOARD</span>
        <span class="font-bold text-black">OPEN →</span>
      </div>
    </a>

    <a href={resolve('/gdd')} class="general-card-interactive !p-5 flex flex-col justify-between group min-h-[160px]">
      <div>
        <div class="flex items-start justify-between gap-2 border-b border-arsenal-border/60 pb-3 mb-3">
          <div class="flex h-9 w-9 items-center justify-center bg-arsenal-console text-white group-hover:text-arsenal-lime transition-none border border-black shrink-0">
            <FileText class="w-5 h-5" />
          </div>
          <span class="font-mono text-xs font-bold text-arsenal-muted group-hover:text-black flex items-center gap-0.5">
            <ArrowUpRight class="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        </div>
        <h3 class="font-mono font-bold text-base text-arsenal-text uppercase tracking-wide group-hover:underline">GDD Notes</h3>
        <p class="mt-1.5 text-xs text-arsenal-muted leading-relaxed font-sans">Markdown rendered game design document tree and references.</p>
      </div>
      <div class="mt-4 pt-2 border-t border-arsenal-border/40 text-[10px] font-mono text-arsenal-muted flex justify-between uppercase">
        <span>DESIGN DOCS</span>
        <span class="font-bold text-black">OPEN →</span>
      </div>
    </a>

    <a href={resolve('/version-logs')} class="general-card-interactive !p-5 flex flex-col justify-between group min-h-[160px]">
      <div>
        <div class="flex items-start justify-between gap-2 border-b border-arsenal-border/60 pb-3 mb-3">
          <div class="flex h-9 w-9 items-center justify-center bg-arsenal-console text-white group-hover:text-arsenal-lime transition-none border border-black shrink-0">
            <GitCommit class="w-5 h-5" />
          </div>
          <span class="font-mono text-xs font-bold text-arsenal-muted group-hover:text-black flex items-center gap-0.5">
            <ArrowUpRight class="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        </div>
        <h3 class="font-mono font-bold text-base text-arsenal-text uppercase tracking-wide group-hover:underline">Version Logs</h3>
        <p class="mt-1.5 text-xs text-arsenal-muted leading-relaxed font-sans">Timeline devlog, release history and update notes.</p>
      </div>
      <div class="mt-4 pt-2 border-t border-arsenal-border/40 text-[10px] font-mono text-arsenal-muted flex justify-between uppercase">
        <span>TIMELINE & LOGS</span>
        <span class="font-bold text-black">OPEN →</span>
      </div>
    </a>

  </div>

  <div class="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
    
    <div class="general-card !p-5 lg:col-span-2 flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between border-b border-arsenal-border pb-3 mb-4">
          <h3 class="text-xs font-mono font-bold uppercase tracking-wider text-arsenal-text flex items-center gap-2">
            <span class="status-dot-lime animate-pulse"></span>
            <span>ACTIVE IN-PROGRESS TASKS // LIVE MIRROR</span>
          </h3>
          <span class="badge-neutral !py-0.5 bg-white font-mono text-[10px]">SYNCED</span>
        </div>
        
        <div class="border border-dashed border-arsenal-border bg-arsenal-bg/50 p-8 text-center font-mono my-2">
          <div class="flex justify-center mb-2 text-arsenal-muted">
            <Activity class="w-6 h-6 animate-pulse" />
          </div>
          <p class="text-xs font-bold uppercase text-arsenal-text">[NO ACTIVE TASKS DETECTED IN TELEMETRY]</p>
          <p class="text-[11px] mt-1 text-arsenal-muted font-sans max-w-md mx-auto">
            Moving a card to "In Progress" on the Kanban board will automatically mirror it directly here for rapid execution.
          </p>
        </div>
      </div>
      <div class="mt-4 pt-2 border-t border-arsenal-border/40 text-[10px] font-mono text-arsenal-muted flex justify-between">
        <span>TARGET: PRODUCTION QUEUE</span>
        <span>REFRESH RATE: LIVE</span>
      </div>
    </div>

    <div class="general-card !p-5 flex flex-col justify-between">
      <div>
        <div class="flex items-center justify-between border-b border-arsenal-border pb-3 mb-4">
          <h3 class="text-xs font-mono font-bold uppercase tracking-wider text-arsenal-text flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-black inline-block"></span>
            <span>DESIGN FOCUS</span>
          </h3>
          <span class="badge-neutral !py-0.5 bg-white font-mono text-[10px]">GDD LINK</span>
        </div>

        <div class="border border-dashed border-arsenal-border bg-arsenal-bg/50 p-8 text-center font-mono my-2 flex flex-col items-center justify-center min-h-[140px]">
          <div class="flex justify-center mb-2 text-arsenal-muted">
            <Terminal class="w-6 h-6" />
          </div>
          <p class="text-xs font-bold uppercase text-arsenal-text">[NO GDD FOCUS LINKED]</p>
          <p class="text-[11px] mt-1 text-arsenal-muted font-sans">
            Latest GDD mechanics or current task design document links will appear here.
          </p>
        </div>
      </div>
      <div class="mt-4 pt-2 border-t border-arsenal-border/40 text-[10px] font-mono text-arsenal-muted flex justify-between">
        <span>DOC TYPE: MARKDOWN</span>
        <span>INDEX: ACTIVE</span>
      </div>
    </div>

  </div>

  <div class="mt-4 general-card !p-4 bg-arsenal-surface/60 border-dashed border-arsenal-border opacity-70 hover:opacity-100 transition-none">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3.5">
        <div class="flex h-10 w-10 items-center justify-center bg-black text-white shrink-0 font-mono font-bold">
          <GitBranch class="w-5 h-5 text-arsenal-lime" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h4 class="text-xs font-mono font-bold uppercase tracking-wider text-arsenal-text">GITHUB COMMIT HISTORY // TELEMETRY INTEGRATION</h4>
            <span class="text-[9px] font-mono bg-black text-white px-1.5 py-0.2">PLANNED</span>
          </div>
          <p class="text-[11px] text-arsenal-muted font-sans mt-0.5">
            Connect your repository to track recent commits, branch activity, and code velocity directly within this dashboard.
          </p>
        </div>
      </div>
      <div class="shrink-0">
        <span class="badge-neutral !bg-transparent !border-arsenal-muted text-arsenal-muted font-mono !text-[10px]">
          [MODULE OFFLINE // COMING SOON]
        </span>
      </div>
    </div>
  </div>

</div>