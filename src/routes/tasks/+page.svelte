<script>
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase.js';
	import { appState } from '$lib/state.svelte.js';
	import Tasks from '$lib/Tasks.svelte';

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
</script>

{#if appState.loading}
	<div class="flex min-h-screen items-center justify-center bg-slate-950 text-white font-sans">
		<div class="flex flex-col items-center gap-3">
			<div
				class="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"
			></div>
			<p class="text-sm text-slate-400 animate-pulse">Loading Dev Panel...</p>
		</div>
	</div>
{:else}
	<Tasks />
{/if}