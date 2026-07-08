<script>
	import './layout.css';

	import { onMount } from 'svelte';
	import * as Icons from 'lucide-svelte';
	import { supabase } from '$lib/supabase.js';
	import { appState } from '$lib/state.svelte.js';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Login from '$lib/Login.svelte';
	import Project from '$lib/Project.svelte';
	import Summary from '$lib/Summary.svelte';

	let { children } = $props();

	let NavIcon = $derived(
		Icons[appState.project?.icon] ||
			Icons[appState.project?.icon?.charAt(0).toUpperCase() + appState.project?.icon?.slice(1)] ||
			Icons.Gamepad2
	);

	onMount(() => {
		supabase.auth.getSession().then(({ data }) => {
			appState.session = data.session;

			const savedProject = localStorage.getItem('active_project');
			if (savedProject) {
				appState.project = JSON.parse(savedProject);
			}

			appState.loading = false;
		});

		const {
			data: { subscription }
		} = supabase.auth.onAuthStateChange((_event, _session) => {
			appState.session = _session;
			appState.loading = false;
		});

		return () => subscription.unsubscribe();
	});

	async function handleLogout() {
		await supabase.auth.signOut();
		appState.project = null;
		localStorage.removeItem('active_project');
	}

	function handleButtonClick() {
		goto(resolve('/'));
	}
</script>

{#if appState.loading}
	<div
		class="flex min-h-screen items-center justify-center bg-arsenal-bg text-arsenal-text font-mono"
	>
		<div
			class="flex flex-col items-center gap-4 bg-arsenal-surface p-8 border border-arsenal-border rounded-none min-w-[300px]"
		>
			<div class="flex items-center gap-3">
				<span class="status-dot-lime !bg-black animate-ping"></span>
				<span class="text-xs font-bold uppercase tracking-widest">Panel Loading...</span>
			</div>
			<div class="w-full bg-arsenal-card h-1.5 overflow-hidden">
				<div class="bg-black h-full w-1/2 animate-pulse"></div>
			</div>
			<span class="text-[10px] text-arsenal-muted tracking-widest uppercase"
				>SYS_REF // SOLO DEV PANEL</span
			>
		</div>
	</div>
{:else if !appState.session}
	<Login />
{:else if !appState.project}
	<Project
		onSelectProject={(selected) => {
			appState.project = selected;
			localStorage.setItem('active_project', JSON.stringify(selected));
		}}
	/>
{:else}
	<div
		class="min-h-screen flex flex-col bg-arsenal-bg text-arsenal-text font-sans antialiased selection:bg-arsenal-console selection:text-arsenal-lime"
	>
		<!-- ======================================================================= -->
		<!-- MOBİL VE MASAÜSTÜNE TAM UYUMLU ESNEK NAVBAR (min-h-14 & flex-wrap) -->
		<!-- ======================================================================= -->
		<header
			class="sticky top-0 z-50 flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-arsenal-border bg-arsenal-surface px-3 py-2 sm:px-6 select-none shadow-2xs"
		>
			<!-- 1. SOL: LOGO VE ANA SAYFA BUTONU -->
			<button
				onclick={() => handleButtonClick()}
				class="flex items-center gap-2 font-mono shrink-0 cursor-pointer"
			>
				<div
					class="flex items-center gap-1.5 font-bold tracking-tight text-sm sm:text-base uppercase hover:text-arsenal-border-focus"
				>
					<span>SOLO DEV</span>
					<!-- Mobilde "PANEL" yazısını gizle ki yer açılsın -->
					<span class="text-xs font-normal text-arsenal-muted hidden sm:inline">PANEL</span>
				</div>
			</button>

			<!-- 2. ORTA: AKTİF PROJE ROZETİ VE SWITCH BUTONU -->
			<div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
				<div
					class="flex items-center gap-1.5 bg-arsenal-card px-2 sm:px-3 py-1 text-xs font-mono font-bold text-arsenal-text border border-arsenal-border max-w-[140px] sm:max-w-none"
				>
					<NavIcon class="w-3.5 h-3.5 text-black shrink-0" />
					<span class="tracking-wider uppercase truncate">{appState.project?.title}</span>
					<span
						class="text-[10px] text-arsenal-muted border-l border-arsenal-border pl-1.5 shrink-0"
					>
						{appState.project.version || 'v0.1'}
					</span>
				</div>

				<!-- İŞTE SENİN İSTEDİĞİN O SWITCH BUTONU (LUCIDE İKONLU!) -->
				<button
					onclick={() => {
						appState.project = null;
						localStorage.removeItem('active_project');
					}}
					title="Switch Project"
					class="btn-primary !py-1 !px-2 sm:!px-2.5 text-[10px] flex items-center gap-1 cursor-pointer shrink-0 font-bold"
				>
					<Icons.FolderGit2 class="w-3 h-3 text-arsenal-muted shrink-0" />
					<span>SWITCH</span>
				</button>
			</div>

			<!-- 3. SAĞ: KULLANICI ADI (SADECE BÜYÜK EKRANDA) VE LOGOUT -->
			<div class="flex items-center gap-3 text-xs font-mono shrink-0">
				<div class="hidden md:block text-right">
					<span class="font-bold truncate max-w-[120px] inline-block text-arsenal-muted"
						>{appState.session.user.email?.split('@')[0].toUpperCase()}</span
					>
				</div>

				<button
					onclick={handleLogout}
					title="Terminate Session // System Logout"
					class="btn-primary !py-1 !px-2.5 sm:!px-3 text-[10px] cursor-pointer font-bold shrink-0 flex items-center gap-1.5 !border-arsenal-border hover:!border-red-600 hover:!bg-red-600 hover:!text-white transition-none group"
				>
					<Icons.LogOut class="w-3 h-3 text-arsenal-muted group-hover:text-white shrink-0" />
					<span>LOGOUT</span>
				</button>
			</div>
		</header>

		<main class="flex-1 w-full pb-16">
			{@render children()}
		</main>

		<Summary />
	</div>
{/if}
