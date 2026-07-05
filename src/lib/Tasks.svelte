<script>
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase.js';
	import { appState } from '$lib/state.svelte.js';
	import * as Icons from 'lucide-svelte';
	import TagSelector from '$lib/TagSelector.svelte';

	let tasks = $state([]);
	let milestones = $state([]);

	let filterMilestone = $state('all');
	let filterPriority = $state('all');
	let searchQuery = $state('');

	let filteredTasks = $derived(
		tasks.filter((task) => {
			const matchMilestone =
				filterMilestone === 'all' ||
				(filterMilestone === 'general' && task.milestone_id === null) ||
				task.milestone_id === filterMilestone;

			const matchPriority = filterPriority === 'all' || task.priority === filterPriority;
			const matchSearch =
				searchQuery.trim() === '' ||
				task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				(task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

			return matchMilestone && matchPriority && matchSearch;
		})
	);

	let columns = $derived([
		{
			id: 'icebox',
			config: statusConfig.icebox,
			title: '01 // ICEBOX',
			items: filteredTasks.filter((t) => t.status === 'icebox' || t.status === 'planned')
		},
		{
			id: 'backlog',
			config: statusConfig.backlog,
			title: '02 // BACKLOG',
			items: filteredTasks.filter((t) => t.status === 'backlog' || t.status === 'todo')
		},
		{
			id: 'in_progress',
			config: statusConfig.in_progress,
			title: '03 // IN_PROGRESS',
			items: filteredTasks.filter((t) => t.status === 'in_progress' || t.status === 'active')
		},
		{
			id: 'done',
			config: statusConfig.done,
			title: '04 // DONE',
			items: filteredTasks.filter((t) => t.status === 'done' || t.status === 'completed')
		}
	]);

	let loading = $state(false);
	let errorMessage = $state('');
	let isCreating = $state(false);

	let newTask = $state({
		title: '',
		description: '',
		status: 'icebox',
		priority: 'could',
		milestone_id: 'general',
		tags: [],
		checklist: [],
		gdd_node_id: null
	});

	let newChecklistItem = $state('');
	let isSubmitting = $state(false);

	onMount(() => {
		if (appState.project?.id) {
			fetchTasks();
			fetchMilestones();
		}
	});

	async function fetchTasks() {
		loading = true;
		errorMessage = '';
		const { data, error } = await supabase
			.from('tasks')
			.select('*, milestone:milestones(title)')
			.eq('project_id', appState.project.id)
			.order('order_index', { ascending: true });

		if (error) {
			errorMessage = 'Failed to load tasks: ' + error.message;
		} else {
			tasks = data || [];
		}
		loading = false;
	}

	async function fetchMilestones() {
		const { data, error } = await supabase
			.from('milestones')
			.select('id, title')
			.eq('project_id', appState.project.id)
			.order('created_at', { ascending: false });

		if (!error && data) {
			milestones = data;
		}
	}

	function addChecklistItem() {
		if (!newChecklistItem.trim()) return;
		newTask.checklist = [...newTask.checklist, { title: newChecklistItem.trim(), done: false }];
		newChecklistItem = '';
	}

	function removeChecklistItem(index) {
		newTask.checklist = newTask.checklist.filter((_, idx) => idx !== index);
	}

	async function toggleChecklist(task, itemIndex) {
		const updatedChecklist = task.checklist.map((item, idx) => {
			if (idx === itemIndex) {
				return { ...item, done: !item.done };
			}
			return item;
		});

		task.checklist = updatedChecklist;

		await supabase.from('tasks').update({ checklist: updatedChecklist }).eq('id', task.id);
	}

	async function advanceTask(task) {
		const statusOrder = ['icebox', 'backlog', 'in_progress', 'done'];
		const currentIndex = statusOrder.indexOf(task.status);
		if (currentIndex === -1 || currentIndex === statusOrder.length - 1) return;

		const nextStatus = statusOrder[currentIndex + 1];
		task.status = nextStatus;

		await supabase.from('tasks').update({ status: nextStatus }).eq('id', task.id);
	}

	async function handleAddTask(e) {
		e.preventDefault();
		if (!newTask.title.trim() || !appState.project?.id) return;

		isSubmitting = true;
		errorMessage = '';

		const payload = {
			project_id: appState.project.id,
			milestone_id: newTask.milestone_id === 'general' ? null : newTask.milestone_id,
			gdd_node_id: newTask.gdd_node_id || null,
			title: newTask.title.trim(),
			description: newTask.description ? newTask.description.trim() : null,
			status: newTask.status || 'icebox',
			priority: newTask.priority || 'could',
			tags: Array.isArray(newTask.tags) ? newTask.tags : [],
			checklist: Array.isArray(newTask.checklist) ? newTask.checklist : [],
			order_index: tasks.length + 1
		};

		const { data, error } = await supabase
			.from('tasks')
			.insert([payload])
			.select('*, milestone:milestones(title)');

		if (error) {
			errorMessage = 'Failed to create task: ' + error.message;
		} else if (data && data.length > 0) {
			tasks = [...tasks, data[0]];
			newTask = {
				title: '',
				description: '',
				status: 'icebox',
				priority: 'could',
				milestone_id: 'general',
				tags: [],
				checklist: [],
				gdd_node_id: null
			};
			isCreating = false;
		}
		isSubmitting = false;
	}

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
		icebox: {
			label: '01 // ICEBOX',
			short: 'ICEBOX',
			style: 'badge-neutral bg-white text-black font-bold !border-black',
			dot: '!bg-zinc-400',
			border: 'border-l-4 border-l-zinc-500',
			symbol: ''
		},
		planned: {
			label: '01 // PLANNED',
			short: 'PLANNED',
			style: 'badge-neutral bg-white text-black font-bold !border-black',
			dot: '!bg-zinc-400',
			border: 'border-l-4 border-l-zinc-500',
			symbol: ''
		},
		backlog: {
			label: '02 // BACKLOG',
			short: 'BACKLOG',
			style: 'badge-amber !border-black text-black font-bold',
			dot: '!bg-amber-500',
			border: 'border-l-4 border-l-amber-500',
			symbol: ''
		},
		todo: {
			label: '02 // TODO',
			short: 'TODO',
			style: 'badge-amber !border-black text-black font-bold',
			dot: '!bg-amber-500',
			border: 'border-l-4 border-l-amber-500',
			symbol: ''
		},
		in_progress: {
			label: '03 // IN PROGRESS',
			short: 'IN_PROGRESS',
			style: 'badge-console !border-black text-arsenal-lime',
			dot: '!bg-black',
			border: 'border-l-4 border-l-black',
			symbol: ''
		},
		active: {
			label: '03 // ACTIVE',
			short: 'ACTIVE',
			style: 'badge-console !border-black text-arsenal-lime',
			dot: '!bg-black',
			border: 'border-l-4 border-l-black',
			symbol: ''
		},
		done: {
			label: '04 // DONE',
			short: 'DONE',
			style: 'badge-green bg-emerald-600 text-white !border-black font-bold',
			dot: '!bg-emerald-500',
			border: 'border-l-4 border-l-emerald-600',
			symbol: ''
		},
		completed: {
			label: '04 // COMPLETED',
			short: 'COMPLETED',
			style: 'badge-green bg-emerald-600 text-white !border-black font-bold',
			dot: '!bg-emerald-500',
			border: 'border-l-4 border-l-emerald-600',
			symbol: ''
		}
	};

	const priorityConfig = {
		must: {
			label: 'MUST // CRITICAL',
			short: 'MUST',
			style: 'priority-must !py-0 !px-1 text-[9px] animate-pulse',
			symbol: ''
		},
		urgent: {
			label: 'MUST // CRITICAL',
			short: 'MUST',
			style: 'priority-must !py-0 !px-1 text-[9px] animate-pulse',
			symbol: ''
		},
		critical: {
			label: 'MUST // CRITICAL',
			short: 'MUST',
			style: 'priority-must !py-0 !px-1 text-[9px] animate-pulse',
			symbol: ''
		},
		should: {
			label: 'SHOULD // HIGH',
			short: 'SHOULD',
			style: 'badge-amber !py-0 !px-1 text-[9px] !border-black text-black font-bold',
			symbol: ''
		},
		high: {
			label: 'SHOULD // HIGH',
			short: 'SHOULD',
			style: 'badge-amber !py-0 !px-1 text-[9px] !border-black text-black font-bold',
			symbol: ''
		},
		could: {
			label: 'COULD // NORMAL',
			short: 'COULD',
			style: 'badge-cyan !py-0 !px-1 text-[9px] !border-black text-black font-bold',
			symbol: ''
		},
		normal: {
			label: 'COULD // NORMAL',
			short: 'COULD',
			style: 'badge-cyan !py-0 !px-1 text-[9px] !border-black text-black font-bold',
			symbol: ''
		},
		medium: {
			label: 'COULD // NORMAL',
			short: 'COULD',
			style: 'badge-cyan !py-0 !px-1 text-[9px] !border-black text-black font-bold',
			symbol: ''
		},
		wont: {
			label: 'WONT // LOW',
			short: 'WONT',
			style: 'priority-wont !py-0 !px-1 text-[9px]',
			symbol: ''
		},
		low: {
			label: 'WONT // LOW',
			short: 'WONT',
			style: 'priority-wont !py-0 !px-1 text-[9px]',
			symbol: ''
		}
	};
</script>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans select-none">
	<div
		class="mb-8 border-b border-arsenal-border pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
	>
		<div>
			<div class="flex items-center gap-2 mb-1 font-mono text-xs text-arsenal-muted font-bold">
				<span class="status-dot-lime !bg-black"></span>
				<span>PRODUCTION // KANBAN BOARD</span>
			</div>
			<h1
				class="text-2xl sm:text-3xl font-mono font-extrabold tracking-tight uppercase text-arsenal-text"
			>
				MILESTONE DIRECTORY // <span class="underline decoration-2 underline-offset-4"
					>{appState.project?.title || 'UNASSIGNED'}</span
				>
			</h1>
		</div>

		<div class="flex items-center gap-3 font-mono text-xs shrink-0">
			<span class="badge-neutral bg-white !py-1 font-bold hidden sm:inline-flex items-center gap-1">
				<span>TOTAL TASKS:</span>
				<strong class="text-black ml-0.5">{tasks.length || 0}</strong>
			</span>

			<button
				type="button"
				onclick={() => (isCreating = !isCreating)}
				class="btn-lime !py-1.5 !px-3.5 text-xs flex items-center gap-1.5 shadow-2xs font-bold cursor-pointer"
			>
				<span class="text-base leading-none font-bold">{isCreating ? '-' : '+'}</span>
				<span class="tracking-wider uppercase">{isCreating ? 'CLOSE SETUP' : 'NEW TASK'}</span>
			</button>
		</div>
	</div>

	<div
		class="mb-6 p-3 bg-arsenal-surface border border-arsenal-border flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 font-mono text-xs shadow-2xs select-none"
	>
		<div class="flex flex-wrap items-center gap-2 flex-1">
			<span class="text-arsenal-muted font-bold flex items-center gap-1">
				<span class="status-dot-lime !bg-black"></span>
				<span>FILTER:</span>
			</span>

			<div class="relative min-w-[180px] sm:w-52">
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="SEARCH TASKS..."
					class="input-tactical !py-1 !px-2.5 uppercase !text-[11px] font-bold"
				/>
				{#if searchQuery}
					<button
						type="button"
						onclick={() => (searchQuery = '')}
						class="absolute right-2 top-1 text-[10px] text-arsenal-muted hover:text-black font-bold"
						>✕</button
					>
				{/if}
			</div>

			<select
				bind:value={filterMilestone}
				class="input-tactical !py-1 !px-2 !w-auto uppercase !text-[11px] font-bold cursor-pointer"
			>
				<option value="all">ALL MILESTONES // DIRECTORY</option>
				<option value="general">[GENERAL / UNASSIGNED TASKS]</option>
				{#each milestones as ms (ms.id)}
					<option value={ms.id}>MS: {ms.title}</option>
				{/each}
			</select>
		</div>

		<div
			class="flex items-center justify-end gap-2 border-t sm:border-t-0 border-arsenal-border/60 pt-2 sm:pt-0"
		>
			<span class="text-arsenal-muted font-bold hidden md:inline">PRIORITY:</span>

			<select
				bind:value={filterPriority}
				class="input-tactical !py-1 !px-2 !w-auto uppercase !text-[11px] font-bold cursor-pointer"
			>
				<option value="all">ALL PRIORITIES</option>
				<option value="must" class="text-red-600 font-bold">MUST // CRITICAL</option>
				<option value="should" class="text-amber-600 font-bold">SHOULD // HIGH</option>
				<option value="could" class="text-sky-600 font-bold">COULD // NORMAL</option>
				<option value="wont" class="text-zinc-500 font-bold">WONT // LOW</option>
			</select>

			{#if filterMilestone !== 'all' || filterPriority !== 'all' || searchQuery !== ''}
				<button
					type="button"
					onclick={() => {
						filterMilestone = 'all';
						filterPriority = 'all';
						searchQuery = '';
					}}
					class="btn-primary !py-1 !px-2 !text-[10px] text-red-600 hover:!bg-red-50 hover:!border-red-600 font-bold"
					title="Clear All Filters"
				>
					✕ RESET
				</button>
			{/if}
		</div>
	</div>

	{#if errorMessage}
		<div
			class="mb-6 rounded-none bg-red-500/10 border border-arsenal-red p-4 text-xs font-mono text-arsenal-red font-bold"
		>
			[ERROR]: {errorMessage}
		</div>
	{/if}

	{#if isCreating}
		<div
			class="mb-8 p-6 bg-arsenal-surface border border-arsenal-text shadow-sm relative font-sans w-full"
		>
			<div
				class="flex items-center justify-between border-b border-arsenal-border pb-3 mb-4 font-mono font-bold uppercase tracking-wider text-xs md:text-sm text-arsenal-text"
			>
				<span class="flex items-center gap-2">
					<span class="status-dot-lime !bg-black"></span>
					<span>INITIALIZE NEW OPERATIONAL TASK // SETUP</span>
				</span>
				<button
					type="button"
					onclick={() => (isCreating = false)}
					class="text-xs text-arsenal-muted hover:text-black font-mono uppercase cursor-pointer"
					>✕ CANCEL</button
				>
			</div>

			<form onsubmit={handleAddTask} class="space-y-4 font-sans">
				<div class="grid gap-4 sm:grid-cols-12">
					<div class="sm:col-span-6">
						<label class="text-label" for="t-title">TASK TITLE // OBJECTIVE</label>
						<input
							id="t-title"
							type="text"
							bind:value={newTask.title}
							placeholder="e.g., IMPLEMENT HITSTOP AND SCREEN SHAKE ON CRITICAL HIT"
							required
							class="input-tactical uppercase font-bold"
						/>
					</div>
					<div class="sm:col-span-3">
						<label class="text-label" for="t-status">INITIAL COLUMN // STATUS</label>
						<select
							id="t-status"
							bind:value={newTask.status}
							class="input-tactical font-mono !py-2 uppercase font-bold cursor-pointer"
						>
							<option value="icebox">01 // ICEBOX</option>
							<option value="backlog">02 // BACKLOG</option>
							<option value="in_progress">03 // IN PROGRESS</option>
							<option value="done">04 // DONE</option>
						</select>
					</div>
					<div class="sm:col-span-3">
						<label class="text-label" for="t-priority">PRIORITY // MOSCOW</label>
						<select
							id="t-priority"
							bind:value={newTask.priority}
							class="input-tactical font-mono !py-2 uppercase font-bold cursor-pointer"
						>
							<option value="must" class="text-red-600 font-bold">MUST // CRITICAL</option>
							<option value="should" class="text-amber-600 font-bold">SHOULD // HIGH</option>
							<option value="could" class="text-sky-600 font-bold">COULD // NORMAL</option>
							<option value="wont" class="text-zinc-500 font-bold">WONT // LOW</option>
						</select>
					</div>
					<div class="sm:col-span-4">
						<label class="text-label" for="t-ms">ASSIGN TO MILESTONE // ROADMAP</label>
						<select
							id="t-ms"
							bind:value={newTask.milestone_id}
							class="input-tactical font-mono !py-2 uppercase font-bold cursor-pointer"
						>
							<option value="general">[GENERAL / UNASSIGNED TASK]</option>
							{#each milestones as ms (ms.id)}
								<option value={ms.id}>MS: {ms.title}</option>
							{/each}
						</select>
					</div>
					<div class="sm:col-span-8">
						<label class="text-label" for="t-desc">TECHNICAL DESCRIPTION // LOGLINE</label>
						<input
							id="t-desc"
							type="text"
							bind:value={newTask.description}
							placeholder="Add camera shake impulse (0.2s duration) when enemy HP drops below zero..."
							class="input-tactical"
						/>
					</div>
				</div>

				<div class="pt-3 border-t border-arsenal-border/60">
					<label class="text-label"
						>SUB-TASKS // CHECKLIST BUILDER ({newTask.checklist.length})</label
					>
					<div class="flex gap-2 max-w-xl mb-2">
						<input
							type="text"
							bind:value={newChecklistItem}
							placeholder="e.g., Create shake asset in Unity Cinemachine..."
							class="input-tactical !py-1 text-xs"
							onkeydown={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault();
									addChecklistItem();
								}
							}}
						/>
						<button
							type="button"
							onclick={addChecklistItem}
							class="btn-primary !py-1 !px-3 font-bold shrink-0">+ ADD STEP</button
						>
					</div>

					{#if newTask.checklist.length > 0}
						<div class="flex flex-wrap gap-1.5 p-2 bg-arsenal-card border border-arsenal-border">
							{#each newTask.checklist as item, idx (idx)}
								<div
									class="inline-flex items-center gap-1.5 px-2 py-1 bg-white border border-arsenal-border text-xs font-mono"
								>
									<span class="w-1.5 h-1.5 rounded-full bg-black"></span>
									<span class="font-bold uppercase">{item.title}</span>
									<button
										type="button"
										onclick={() => removeChecklistItem(idx)}
										class="text-red-600 hover:text-black font-bold ml-1">✕</button
									>
								</div>
							{/each}
						</div>
					{/if}
				</div>

				<div class="pt-2 border-t border-arsenal-border/60">
					<TagSelector bind:selectedTags={newTask.tags} />
				</div>

				<div class="flex items-center justify-end gap-3 pt-4 border-t border-arsenal-border">
					<button type="button" onclick={() => (isCreating = false)} class="btn-primary">
						CANCEL
					</button>
					<button type="submit" disabled={isSubmitting} class="btn-lime disabled:opacity-50">
						{isSubmitting ? 'INITIALIZING...' : '+ CREATE TASK'}
					</button>
				</div>
			</form>
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
				>DOWNLOADING KANBAN BOARD...</span
			>
		</div>
	{:else}
		<div class="kanban-board">
			{#each columns as col (col.id)}
				<div class="kanban-col">
					<div class="kanban-col-header {col.config.border} pl-2 bg-arsenal-bg/40 !pb-2 !mb-3">
						<span class="flex items-center gap-1.5">
							<span class="status-dot-lime {col.config.dot}"></span>
							<span class="font-bold">{col.title}</span>
						</span>
						<span class="{col.config.style} !py-0.5 !px-2 shadow-2xs">{col.items.length}</span>
					</div>

					<div class="kanban-col-body">
						{#if col.items.length === 0}
							<div
								class="py-12 text-center font-mono text-[10px] text-arsenal-muted uppercase border border-dashed border-arsenal-border/60"
							>
								[EMPTY COLUMN]
							</div>
						{:else}
							{#each col.items as task (task.id)}
								{@const prio = priorityConfig[task.priority] || priorityConfig.could}
								<div class="kanban-card group">
									<div class="flex items-center justify-between gap-1 mb-2 font-mono text-[9px]">
										<span class={prio.style} title={prio.label}>
											{prio.symbol}
											{prio.short}
										</span>
										<span class="text-arsenal-muted truncate font-bold" title="Assigned Milestone">
											{task.milestone?.title || 'GENERAL'}
										</span>
									</div>

									<h4
										class="font-bold text-xs text-arsenal-text group-hover:text-black mb-2 leading-snug"
									>
										{task.title}
									</h4>

									<p
										class="font-bold text-xs text-arsenal-muted group-hover:text-black mb-2 leading-snug"
									>
										{task.description}
									</p>

									{#if task.tags && Array.isArray(task.tags) && task.tags.length > 0}
										<div class="flex flex-wrap gap-1 mb-2">
											{#each task.tags as tag (tag.id)}
												{@const tagColor = typeof tag === 'object' ? tag.color : 'slate'}
												{@const tagTitle = typeof tag === 'object' ? tag.title : tag}
												{@const tagIconName = typeof tag === 'object' ? tag.icon : 'Tag'}
												{@const TagIcon =
													Icons[tagIconName] ||
													Icons[tagIconName?.charAt(0).toUpperCase() + tagIconName?.slice(1)] ||
													Icons.Tag}
												<span
													class="inline-flex items-center gap-1 {tagBadgeColors[tagColor] ||
														tagBadgeColors.slate} !py-0 !px-1.5 !text-[8px] font-mono uppercase border border-black"
												>
													<TagIcon class="w-2.5 h-2.5 shrink-0" />
													<span>{tagTitle}</span>
												</span>
											{/each}
										</div>
									{/if}

									{#if task.checklist && Array.isArray(task.checklist) && task.checklist.length > 0}
										<div
											class="space-y-1 my-2.5 py-2 border-y border-arsenal-border/40 font-mono text-[10px]"
										>
											{#each task.checklist as item, idx (idx)}
												<label
													class="flex items-start gap-2 cursor-pointer hover:text-black select-none"
												>
													<input
														type="checkbox"
														checked={item.done}
														onchange={() => toggleChecklist(task, idx)}
														class="mt-0.5 rounded-none border-black text-black focus:ring-0 cursor-pointer"
													/>
													<span
														class="{item.done
															? 'line-through text-arsenal-muted'
															: 'font-semibold text-arsenal-text'} leading-tight"
													>
														{item.title}
													</span>
												</label>
											{/each}
										</div>
									{/if}

									<div
										class="flex items-center justify-between text-[10px] font-mono text-arsenal-muted pt-1 border-t border-arsenal-border/30"
									>
										{#if task.checklist && Array.isArray(task.checklist) && task.checklist.length > 0}
											<span
												>☑ {task.checklist.filter((c) => c.done).length}/{task.checklist
													.length}</span
											>
										{/if}

										{#if task.status !== 'done' && task.status !== 'completed'}
											<button
												type="button"
												onclick={() => advanceTask(task)}
												class="ml-auto bg-arsenal-console text-white hover:bg-arsenal-lime hover:text-black px-2 py-0.5 font-bold uppercase tracking-wider text-[9px] transition-none cursor-pointer border border-black shadow-2xs"
												title="Advance to next column"
											>
												ADVANCE →
											</button>
										{:else}
											<span class="ml-auto badge-green !py-0 !px-1.5 text-[8px] font-bold uppercase"
												>COMPLETED</span
											>
										{/if}
									</div>
								</div>
							{/each}
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
