<script>
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase.js';
	import { appState } from '$lib/state.svelte.js';
	import * as Icons from 'lucide-svelte';
	import TagSelector from '$lib/TagSelector.svelte';
	import { resolve } from '$app/paths';

	let milestones = $state([]);
	let expandedId = $state(null);
	let fetchingDetails = $state(null);
	let detailCache = $state({});

	let loading = $state(false);
	let errorMessage = $state('');
	let isCreating = $state(false);

	let newMilestone = $state({
		title: '',
		description: '',
		status: 'planned',
		tags: [],
		gdd_node_id: null
	});

	let isSubmitting = $state(false);

	onMount(() => {
		if (appState.project?.id) {
			fetchMilestones();
		}
	});

	async function fetchMilestones() {
		loading = true;
		errorMessage = '';
		const { data, error } = await supabase
			.from('milestones')
			.select('*')
			.eq('project_id', appState.project.id)
			.order('created_at', { ascending: false });

		if (error) {
			errorMessage = 'Failed to load milestones: ' + error.message;
		} else {
			milestones = data || [];
		}
		loading = false;
	}

	// KART AÇMA / KAPAMA VE LAZY LOADING
	async function toggleAccordion(milestone) {
		if (expandedId === milestone.id) {
			expandedId = null;
			return;
		}

		expandedId = milestone.id;
		if (detailCache[milestone.id]) return;

		fetchingDetails = milestone.id;

		const [tasks, gddNode] = await Promise.all([
			fetchTasks(milestone.id),
			milestone.gdd_node_id ? fetchGddNode(milestone.gdd_node_id) : Promise.resolve(null)
		]);

		detailCache[milestone.id] = {
			tasks: tasks || [],
			gddNode: gddNode || null
		};

		fetchingDetails = null;
	}

	async function fetchTasks(milestoneId) {
		const { data, error } = await supabase
			.from('tasks')
			.select('id, title, status, priority, checklist, order_index')
			.eq('project_id', appState.project.id)
			.eq('milestone_id', milestoneId)
			.order('order_index', { ascending: true });

		return !error ? data : [];
	}

	async function fetchGddNode(gddNodeId) {
		const { data, error } = await supabase
			.from('gdd_nodes')
			.select('id, title, icon')
			.eq('id', gddNodeId)
			.maybeSingle();

		return !error ? data : null;
	}

	// DÜZELTME 2: Kusursuz Ekleme Fonksiyonu (Description ve Taglar Garanti Altında)
	async function handleAddMilestone(e) {
		e.preventDefault();
		if (!newMilestone.title.trim() || !appState.project?.id) {
			errorMessage = 'Project ID or Title is missing!';
			return;
		}

		isSubmitting = true;
		errorMessage = '';

		const payload = {
			project_id: appState.project.id,
			gdd_node_id: newMilestone.gdd_node_id || null,
			title: newMilestone.title.trim(),
			description: newMilestone.description ? newMilestone.description.trim() : null,
			status: newMilestone.status || 'planned',
			tags: Array.isArray(newMilestone.tags) ? newMilestone.tags : []
		};

		const { data, error } = await supabase.from('milestones').insert([payload]).select();

		if (error) {
			errorMessage = 'Failed to create milestone: ' + error.message;
		} else if (data && data.length > 0) {
			milestones = [data[0], ...milestones];
			newMilestone = { title: '', description: '', status: 'planned', tags: [], gdd_node_id: null };
			isCreating = false;
		}
		isSubmitting = false;
	}

	// DÜZELTME 3: TEMAYA TAM UYGUN CONFIGLER (Keskin Hatlı Workstation Rozetleri)
	const tagBadgeColors = {
		lime: 'badge-console !border-black shadow-2xs',
		slate: 'badge-neutral bg-white !border-black text-black font-bold shadow-2xs',
		red: 'badge-red !border-black font-bold shadow-2xs',
		amber: 'badge-amber !border-black text-black font-bold shadow-2xs',
		yellow: 'badge-amber !border-black text-black font-bold shadow-2xs',
		orange: 'badge-amber !border-black text-black font-bold shadow-2xs',
		green: 'badge-green !border-black font-bold shadow-2xs',
		emerald: 'badge-green !border-black font-bold shadow-2xs',
		cyan: 'badge-cyan !border-black font-bold shadow-2xs',
		blue: 'badge-cyan !border-black font-bold shadow-2xs',
		indigo: 'badge-cyan !border-black font-bold shadow-2xs',
		purple: 'badge-cyan !border-black font-bold shadow-2xs',
		pink: 'badge-cyan !border-black font-bold shadow-2xs'
	};

	const statusConfig = {
		planned: { style: 'badge-neutral bg-white text-black font-mono font-bold', label: 'PLANNED' },
		todo: { style: 'badge-neutral bg-white text-black font-mono font-bold', label: 'TODO' },
		active: { style: 'badge-console !border-black', label: 'ACTIVE // IN PROGRESS' },
		in_progress: { style: 'badge-console !border-black', label: 'IN PROGRESS' },
		completed: {
			style: 'badge-green bg-emerald-600 text-white !border-black font-mono font-bold',
			label: 'COMPLETED'
		},
		done: {
			style: 'badge-green bg-emerald-600 text-white !border-black font-mono font-bold',
			label: 'DONE'
		},
		archived: {
			style: 'badge-neutral !bg-zinc-300 text-zinc-700 font-mono font-bold',
			label: 'ARCHIVED'
		},
		blocked: {
			style: 'badge-red bg-red-600 text-white !border-black font-mono font-bold animate-pulse',
			label: 'BLOCKED // CRITICAL'
		}
	};

	const priorityConfig = {
		low: { style: 'badge-neutral !py-0 !px-1 text-[9px] bg-white', label: 'LOW' },
		medium: { style: 'badge-cyan !py-0 !px-1 text-[9px] !border-black', label: 'NORMAL' },
		normal: { style: 'badge-cyan !py-0 !px-1 text-[9px] !border-black', label: 'NORMAL' },
		high: { style: 'badge-amber !py-0 !px-1 text-[9px] !border-black text-black', label: 'HIGH' },
		urgent: { style: 'priority-must !py-0 !px-1 text-[9px] animate-pulse', label: 'CRITICAL' },
		critical: { style: 'priority-must !py-0 !px-1 text-[9px] animate-pulse', label: 'CRITICAL' }
	};
</script>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans select-none">
	<div
		class="mb-8 border-b border-arsenal-border pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
	>
		<div>
			<div class="flex items-center gap-2 mb-1 font-mono text-xs text-arsenal-muted font-bold">
				<span class="status-dot-lime !bg-black"></span>
				<span>PRODUCTION // ROADMAP TRACKER</span>
			</div>
			<h1
				class="text-2xl sm:text-3xl font-mono font-extrabold tracking-tight uppercase text-arsenal-text"
			>
				MILESTONE DIRECTORY // <span class="underline decoration-2 underline-offset-4"
					>{appState.project?.title || 'UNASSIGNED'}</span
				>
			</h1>
		</div>

		<div class="flex items-center gap-2 font-mono text-xs">
			<span class="badge-neutral bg-white !py-1 font-bold">
				TOTAL MILESTONES: <strong class="text-black ml-1">{milestones.length}</strong>
			</span>
		</div>
	</div>

	{#if errorMessage}
		<div
			class="mb-6 rounded-none bg-red-500/10 border border-arsenal-red p-4 text-xs font-mono text-arsenal-red font-bold"
		>
			[ERROR]: {errorMessage}
		</div>
	{/if}

	{#if loading}
		<div
			class="flex flex-col items-center justify-center py-24 gap-3 font-mono text-xs text-arsenal-muted border border-dashed border-arsenal-border bg-arsenal-surface/40"
		>
			<div
				class="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent"
			></div>
			<span class="animate-pulse uppercase tracking-widest font-bold text-arsenal-text"
				>DOWNLOADING ROADMAP...</span
			>
		</div>
	{:else if milestones.length === 0 && !isCreating}
		<div
			class="rounded-none border border-dashed border-arsenal-border bg-arsenal-surface p-16 text-center font-mono my-4"
		>
			<p class="text-sm font-bold uppercase text-arsenal-text">[NO MILESTONES FOUND IN PROJECT]</p>
			<p class="text-xs mt-1 text-arsenal-muted">
				CLICK "+ ADD ROADMAP MILESTONE" AT THE BOTTOM TO CREATE YOUR FIRST GOAL.
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
			{#each milestones as milestone (milestone.id)}
				{@const statusObj = statusConfig[milestone.status] || statusConfig.planned}

				{#if expandedId === milestone.id}
					{@const details = detailCache[milestone.id]}
					{@const totalTasks = details?.tasks?.length || 0}
					{@const completedTasks =
						details?.tasks?.filter((t) => t.status === 'done' || t.status === 'completed').length ||
						0}
					{@const progressPercent =
						totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}

					<div class="accordion-card-active">
						<div
							class="flex items-start justify-between gap-2 border-b border-arsenal-border/60 pb-3 mb-3"
						>
							<div
								class="flex items-center gap-2.5 font-mono font-bold text-base text-arsenal-text"
							>
								<span class="status-dot-lime !bg-black"></span>
								<span>{milestone.title}</span>
							</div>
							<div class="flex items-center gap-2">
								<span class={statusObj.style}>
									STATUS: {statusObj.label}
								</span>
								<button
									type="button"
									onclick={() => (expandedId = null)}
									class="text-xs font-mono font-bold px-2 py-0.5 bg-black text-white hover:bg-zinc-800 cursor-pointer"
								>
									↑ COLLAPSE
								</button>
							</div>
						</div>

						{#if milestone.tags && Array.isArray(milestone.tags) && milestone.tags.length > 0}
							<div class="flex flex-wrap gap-1.5 mb-3">
								{#each milestone.tags as tag (tag.title || tag)}
									{@const tagColor = typeof tag === 'object' ? tag.color : 'slate'}
									{@const tagTitle = typeof tag === 'object' ? tag.title : tag}
									{@const tagIconName = typeof tag === 'object' ? tag.icon : 'Tag'}
									{@const TagIcon =
										Icons[tagIconName] ||
										Icons[tagIconName?.charAt(0).toUpperCase() + tagIconName?.slice(1)] ||
										Icons.Tag}
									<span
										class="inline-flex items-center gap-1 {tagBadgeColors[tagColor] ||
											tagBadgeColors.slate} !py-0.5 !px-2 !text-[9px] font-mono uppercase border border-black"
									>
										<TagIcon class="w-3 h-3 shrink-0" />
										<span>{tagTitle}</span>
									</span>
								{/each}
							</div>
						{/if}

						<p class="text-xs text-arsenal-muted font-sans line-clamp-3 mb-3 leading-relaxed">
							{milestone.description ||
								'[No technical description provided for this roadmap milestone.]'}
						</p>

						<div class="progress-track">
							<div class="progress-fill" style="width: {progressPercent}%;"></div>
						</div>
						<div
							class="flex items-center justify-between text-[10px] font-mono text-arsenal-muted pt-1"
						>
							<span
								>PROGRESS: {completedTasks} / {totalTasks} TASKS COMPLETED ({progressPercent}%)</span
							>
						</div>

						<div class="tree-wrapper">
							{#if fetchingDetails === milestone.id}
								<div
									class="py-6 text-center font-mono text-xs text-arsenal-muted flex items-center justify-center gap-2"
								>
									<div
										class="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent"
									></div>
									<span class="animate-pulse uppercase">DOWNLOADING MILESTONE DETAILS...</span>
								</div>
							{:else if details}
								{#if details.gddNode}
									<div
										class="text-[10px] font-mono font-bold text-arsenal-cyan uppercase tracking-wider flex items-center gap-1.5"
									>
										<span class="w-2 h-2 rounded-full bg-arsenal-cyan inline-block"></span>
										<span>LINKED DESIGN SPECIFICATION // GDD BLUEPRINT</span>
									</div>
									<div class="tree-wire-cyan !mt-1.5 !mb-4">
										<a
											href={resolve('/gdd/' + details.gddNode.id)}
											class="tree-item !border-arsenal-cyan/40 hover:!border-arsenal-cyan block"
										>
											<div class="flex items-center justify-between">
												<span class="font-bold text-arsenal-cyan">📄 [{details.gddNode.title}]</span
												>
												<span class="text-[10px] text-arsenal-muted hover:text-black font-bold"
													>VIEW MARKDOWN SPECS →</span
												>
											</div>
										</a>
									</div>
								{/if}

								<div
									class="text-[10px] font-mono font-bold text-arsenal-text uppercase tracking-wider flex items-center justify-between"
								>
									<span class="flex items-center gap-1.5">
										<span class="status-dot-lime !bg-black"></span>
										<span>TASKS // KANBAN QUEUE ({totalTasks})</span>
									</span>
									<a
										href={resolve('/tasks?milestone=' + milestone.id)}
										class="underline text-arsenal-muted hover:text-black font-bold">OPEN BOARD →</a
									>
								</div>

								<div class="tree-wire-lime !mt-1.5">
									{#if totalTasks === 0}
										<div
											class="p-3 border border-dashed border-arsenal-border text-center font-mono text-xs text-arsenal-muted uppercase"
										>
											[NO TASKS ASSIGNED TO THIS MILESTONE YET]
										</div>
									{:else}
										{#each details.tasks as task (task.id)}
											{@const priorityObj = priorityConfig[task.priority] || priorityConfig.normal}
											<div class="tree-item">
												<div class="flex items-center gap-2 truncate pr-2">
													<span class={priorityObj.style}>
														{priorityObj.label}
													</span>
													<span class="badge-neutral !py-0 !px-1 text-[9px] uppercase bg-white">
														{task.status}
													</span>
													<span class="font-bold truncate text-arsenal-text">{task.title}</span>
												</div>

												<div
													class="flex items-center gap-3 shrink-0 text-[10px] font-mono text-arsenal-muted"
												>
													{#if task.checklist && Array.isArray(task.checklist) && task.checklist.length > 0}
														<span
															>☑ {task.checklist.filter((c) => c.done).length}/{task.checklist
																.length}</span
														>
													{/if}
													<span class="font-bold text-black">→</span>
												</div>
											</div>
										{/each}
									{/if}
								</div>
							{/if}
						</div>
					</div>
				{:else}
					{@const details = detailCache[milestone.id]}
					{@const totalTasks = details?.tasks?.length || 0}
					{@const completedTasks =
						details?.tasks?.filter((t) => t.status === 'done' || t.status === 'completed').length ||
						0}
					{@const progressPercent =
						totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}
					<button type="button" onclick={() => toggleAccordion(milestone)} class="accordion-card">
						<div
							class="flex items-start justify-between gap-2 border-b border-arsenal-border/60 pb-3 mb-3"
						>
							<div
								class="flex items-center gap-2.5 font-mono font-bold text-base text-arsenal-text"
							>
								<span class="status-dot-lime !bg-black"></span>
								<span>{milestone.title}</span>
							</div>
							<span class={statusObj.style}>
								STATUS: {statusObj.label}
							</span>
						</div>

						{#if milestone.tags && Array.isArray(milestone.tags) && milestone.tags.length > 0}
							<div class="flex flex-wrap gap-1.5 mb-3">
								{#each milestone.tags as tag (tag.title || tag)}
									{@const tagColor = typeof tag === 'object' ? tag.color : 'slate'}
									{@const tagTitle = typeof tag === 'object' ? tag.title : tag}
									{@const tagIconName = typeof tag === 'object' ? tag.icon : 'Tag'}
									{@const TagIcon =
										Icons[tagIconName] ||
										Icons[tagIconName?.charAt(0).toUpperCase() + tagIconName?.slice(1)] ||
										Icons.Tag}
									<span
										class="inline-flex items-center gap-1 {tagBadgeColors[tagColor] ||
											tagBadgeColors.slate} !py-0.5 !px-2 !text-[9px] font-mono uppercase border border-black"
									>
										<TagIcon class="w-3 h-3 shrink-0" />
										<span>{tagTitle}</span>
									</span>
								{/each}
							</div>
						{/if}

						<p class="text-xs text-arsenal-muted font-sans line-clamp-2 mb-3 leading-relaxed">
							{milestone.description ||
								'[No technical description provided for this roadmap milestone.]'}
						</p>

						<div class="progress-track">
							<div class="progress-fill" style="width: {details ? progressPercent : 0}%;"></div>
						</div>
						<div
							class="flex items-center justify-between text-[10px] font-mono text-arsenal-muted pt-1"
						>
							<span>
								{details
									? `PROGRESS: ${completedTasks} / ${totalTasks} TASKS COMPLETED (${progressPercent}%)`
									: '[CLICK TO LOAD DETAILS & TASKS]'}
							</span>
							<span class="font-bold text-black uppercase">EXPAND MILESTONE ↓</span>
						</div>
					</button>
				{/if}
			{/each}
		</div>

		{#if !isCreating}
			<button
				type="button"
				onclick={() => (isCreating = true)}
				class="flex min-h-[140px] w-full flex-col items-center justify-center rounded-none border-2 border-dashed border-arsenal-border bg-arsenal-surface/40 p-6 text-arsenal-muted hover:border-black hover:bg-arsenal-surface hover:text-black transition-none group cursor-pointer mt-4"
			>
				<span class="text-3xl font-mono font-light mb-1 group-hover:scale-125 transition-transform"
					>+</span
				>
				<span class="text-xs font-mono font-bold uppercase tracking-wider"
					>ADD ROADMAP MILESTONE</span
				>
			</button>
		{:else}
			<div
				class="mt-4 p-6 bg-arsenal-surface border border-arsenal-text shadow-sm relative font-sans w-full"
			>
				<div
					class="flex items-center justify-between border-b border-arsenal-border pb-3 mb-4 font-mono font-bold uppercase tracking-wider text-xs md:text-sm text-arsenal-text"
				>
					<span class="flex items-center gap-2">
						<span class="status-dot-lime !bg-black"></span>
						<span>INITIALIZE NEW ROADMAP MILESTONE // SETUP</span>
					</span>
					<button
						type="button"
						onclick={() => (isCreating = false)}
						class="text-xs text-arsenal-muted hover:text-black font-mono uppercase cursor-pointer"
						>✕ CANCEL</button
					>
				</div>

				<form onsubmit={handleAddMilestone} class="space-y-4 font-sans">
					<div class="grid gap-4 sm:grid-cols-12">
						<div class="sm:col-span-8">
							<label class="text-label" for="m-title">MILESTONE TITLE</label>
							<input
								id="m-title"
								type="text"
								bind:value={newMilestone.title}
								placeholder="e.g., ALPHA 0.5 - CORE COMBAT MECHANICS"
								required
								class="input-tactical uppercase font-bold"
							/>
						</div>
						<div class="sm:col-span-4">
							<label class="text-label" for="m-status">INITIAL STATUS</label>
							<select
								id="m-status"
								bind:value={newMilestone.status}
								class="input-tactical font-mono !py-2 uppercase font-bold cursor-pointer"
							>
								<option value="planned">PLANNED</option>
								<option value="active">ACTIVE // IN PROGRESS</option>
								<option value="completed">COMPLETED</option>
							</select>
						</div>
						<div class="sm:col-span-12">
							<label class="text-label" for="m-desc">TARGET OBJECTIVE // DESCRIPTION</label>
							<textarea
								id="m-desc"
								bind:value={newMilestone.description}
								rows="2"
								placeholder="Implement basic attack state machine, hitboxes and enemy stagger reactions..."
								class="input-tactical resize-y"></textarea>
						</div>
					</div>

					<div class="pt-2 border-t border-arsenal-border/60">
						<TagSelector bind:selectedTags={newMilestone.tags} />
					</div>

					<div class="flex items-center justify-end gap-3 pt-4 border-t border-arsenal-border">
						<button type="button" onclick={() => (isCreating = false)} class="btn-primary">
							CANCEL
						</button>
						<button type="submit" disabled={isSubmitting} class="btn-lime disabled:opacity-50">
							{isSubmitting ? 'INITIALIZING...' : '+ CREATE MILESTONE'}
						</button>
					</div>
				</form>
			</div>
		{/if}
	{/if}
</div>
