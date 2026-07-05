<script>
	import { onMount } from 'svelte';
	import * as Icons from 'lucide-svelte';
	import IconPicker from '$lib/IconPicker.svelte';
	import { supabase } from '$lib/supabase.js';

	let { onSelectProject } = $props();

	let projects = $state([]);
	let loading = $state(false);
	let errorMessage = $state('');
	let isCreating = $state(false);

	let newProject = $state({
		title: '',
		description: '',
		version: '0.1.0',
		icon: 'gamepad'
	});
	let isSubmitting = $state(false);

	onMount(() => {
		fetchProjects();
	});

	async function fetchProjects() {
		loading = true;
		errorMessage = '';
		const { data, error } = await supabase
			.from('projects')
			.select('*')
			.order('created_at', { ascending: false });
		if (error) {
			errorMessage = 'Failed to load projects: ' + error.message;
		} else {
			projects = data;
		}
		loading = false;
	}

	async function handleAddProject(e) {
		e.preventDefault();
		if (!newProject.title.trim()) return;

		isSubmitting = true;
		errorMessage = '';
		const { data, error } = await supabase
			.from('projects')
			.insert([
				{
					title: newProject.title,
					description: newProject.description,
					version: newProject.version,
					icon: newProject.icon
				}
			])
			.select();
		if (error) {
			errorMessage = 'Failed to create project: ' + error.message;
		} else if (data) {
			projects = [data[0], ...projects];
			newProject = { title: '', description: '', version: '0.1.0', icon: 'gamepad' };
			isCreating = false;
		}
		isSubmitting = false;
	}
</script>

<div class="min-h-screen w-full bg-arsenal-bg text-arsenal-text font-sans antialiased py-10 px-4 sm:px-6 lg:px-8 select-none">
	<div class="mx-auto max-w-6xl">
		
		<div class="mb-8 border-b border-arsenal-border pb-4">
			<div class="flex items-center gap-2 mb-1 font-mono text-xs text-arsenal-muted font-bold">
				<span class="status-dot-lime !bg-black"></span>
				<span>PRODUCTION // DIRECTORY</span>
			</div>
			<h1 class="text-2xl sm:text-3xl font-mono font-extrabold tracking-tight uppercase text-arsenal-text">
				SELECT PROJECT
			</h1>
		</div>

		{#if errorMessage}
			<div class="mb-6 rounded-none bg-red-500/10 border border-arsenal-red p-4 text-xs font-mono text-arsenal-red font-bold">
				[ERROR]: {errorMessage}
			</div>
		{/if}

		{#if loading}
			<div class="flex flex-col items-center justify-center py-20 gap-3 font-mono text-xs text-arsenal-muted">
				<div class="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent"></div>
				<span class="animate-pulse uppercase tracking-widest">SCANNING PROJECTS...</span>
			</div>
		{:else}
			
			{#if projects.length === 0 && !isCreating}
				<div class="mb-6 rounded-none border border-dashed border-arsenal-border bg-arsenal-surface p-8 text-center font-mono">
					<p class="text-xs font-bold uppercase text-arsenal-text">[NO PROJECTS FOUND IN DIRECTORY]</p>
					<p class="text-[11px] mt-1 text-arsenal-muted">USE THE ACTION CARD BELOW TO INITIALIZE YOUR FIRST GAME.</p>
				</div>
			{/if}

			<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
				
				{#each projects as project (project.id)}
					{@const CardIcon = Icons[project.icon] || Icons[project.icon?.charAt(0).toUpperCase() + project.icon?.slice(1)] || Icons.Gamepad2}

					<button
						onclick={() => onSelectProject && onSelectProject(project)}
						class="general-card-interactive !p-5 flex flex-col justify-between text-left group min-h-[160px] relative"
					>
						<div>
							<div class="flex items-start justify-between gap-2 border-b border-arsenal-border/60 pb-3 mb-3">
								<div class="flex items-center gap-2.5 font-mono font-bold text-base text-arsenal-text group-hover:text-black">
									<CardIcon class="w-5 h-5 text-black shrink-0" />
									<span class="truncate uppercase">{project.title}</span>
								</div>

								<span class="badge-neutral !text-[10px] !px-1.5 !py-0.5 bg-white font-mono">
									{project.version || 'v0.1.0'}
								</span>
							</div>

							<p class="line-clamp-2 text-xs text-arsenal-muted font-sans leading-relaxed">
								{project.description || '[No project logline provided in directory.]'}
							</p>
						</div>

						<div class="mt-6 flex items-center justify-between border-t border-arsenal-border/60 pt-3 text-[10px] font-mono text-arsenal-muted">
							<span>
								INIT: {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase()}
							</span>
							<span class="font-bold text-black group-hover:underline">
								OPEN PROJECT →
							</span>
						</div>
					</button>
				{/each}

				{#if !isCreating}
					<button
						onclick={() => (isCreating = true)}
						class="flex min-h-[160px] flex-col items-center justify-center rounded-none border-2 border-dashed border-arsenal-border bg-arsenal-surface/50 p-6 text-arsenal-muted hover:border-black hover:bg-arsenal-surface hover:text-black transition-none group cursor-pointer"
					>
						<span class="text-3xl font-mono font-light mb-1 group-hover:scale-125 transition-transform">+</span>
						<span class="text-xs font-mono font-bold uppercase tracking-wider">ADD PROJECT</span>
					</button>
				{:else}
					<div class="col-span-full p-6 bg-arsenal-surface border border-arsenal-text shadow-sm relative font-sans">
						<div class="flex items-center justify-between border-b border-arsenal-border pb-3 mb-4 font-mono font-bold uppercase tracking-wider text-xs md:text-sm text-arsenal-text">
							<span class="flex items-center gap-2">
								<span class="status-dot-lime !bg-black"></span>
								<span>INITIALIZE NEW GAME PROJECT // SETUP</span>
							</span>
							<button onclick={() => (isCreating = false)} class="text-xs text-arsenal-muted hover:text-black font-mono uppercase">✕ CANCEL</button>
						</div>

						<form onsubmit={handleAddProject} class="space-y-4 font-sans">
							<div class="grid gap-4 sm:grid-cols-12">
								<div class="sm:col-span-6">
									<label class="text-label" for="title">PROJECT TITLE</label>
									<input
										id="title"
										type="text"
										bind:value={newProject.title}
										placeholder="e.g., CYBER KATANA // PROJECT ZERO"
										required
										class="input-tactical uppercase font-bold"
									/>
								</div>
								<div class="sm:col-span-2">
									<label class="text-label" for="version">TARGET VERSION</label>
									<input
										id="version"
										type="text"
										bind:value={newProject.version}
										placeholder="v0.1.0"
										class="input-tactical font-mono"
									/>
								</div>
								<div class="sm:col-span-4">
									<label class="text-label" for="desc">SHORT DESCRIPTION // LOGLINE</label>
									<input
										id="desc"
										type="text"
										bind:value={newProject.description}
										placeholder="2D Action Roguelite with neon aesthetics..."
										class="input-tactical"
									/>
								</div>
							</div>

							<div class="pt-2 border-t border-arsenal-border">
								<IconPicker bind:selectedIcon={newProject.icon} label="SELECT PROJECT IDENTIFIER ICON" />
							</div>

							<div class="flex items-center justify-end gap-3 pt-4 border-t border-arsenal-border">
								<button type="button" onclick={() => (isCreating = false)} class="btn-primary">
									CANCEL
								</button>
								<button type="submit" disabled={isSubmitting} class="btn-lime disabled:opacity-50">
									{isSubmitting ? 'INITIALIZING...' : '+ EXECUTE & CREATE'}
								</button>
							</div>
						</form>
					</div>
				{/if}

			</div>
		{/if}
	</div>
</div>