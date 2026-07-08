<script>
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabase.js';
	import { appState } from '$lib/state.svelte.js';
	import { marked } from 'marked';
	import * as Icons from 'lucide-svelte';
	import TacMDE from '$lib/TacMDE.svelte';
	import IconPicker from '$lib/IconPicker.svelte';

	// =========================================================================
	// 1. REAKTİF STATE'LER (SVELTE 5 RUNES)
	// =========================================================================
	let gddNodes = $state([]);
	let loading = $state(false);
	let errorMessage = $state('');
	let editingNodeId = $state(null);
	let isMobileTocOpen = $state(false);

	// Yeni Bölüm Ekleme Formu İçin State'ler
	let isCreating = $state(false);
	let isSubmitting = $state(false);
	let newTitle = $state('');
	let selectedIcon = $state('FileText'); // Düzeltme: Artık bind:selectedIcon ile IconPicker'a akıyor
	let selectedParentId = $state(null);

	// Root (Kök) Düğümü Otomatik Bul (parent_id'si null olan)
	let rootNode = $derived(gddNodes.find((n) => n.parent_id === null));

	// Düz listeyi İçindekiler (TOC) menüsü için hiyerarşik ağaca (Tree) çeviren motor
	let treeNodes = $derived.by(() => {
		if (!rootNode) return [];

		const buildChildren = (parentId) => {
			return gddNodes
				.filter((n) => n.parent_id === parentId)
				.sort((a, b) => a.order_index - b.order_index)
				.map((node) => ({
					...node,
					children: buildChildren(node.id)
				}));
		};

		return [{ ...rootNode, children: buildChildren(rootNode.id) }];
	});

	// =========================================================================
	// 2. SUPABASE İŞ MANTIĞI VE ALGORİTMALAR (BUSINESS LOGIC)
	// =========================================================================
	onMount(() => {
		if (appState.project?.id) {
			fetchGddNodes();
		}
	});

	// A) VERİLERİ ÇEK VE ROOT KONTROLÜ YAP
	async function fetchGddNodes() {
		loading = true;
		errorMessage = '';

		const { data, error } = await supabase
			.from('gdd_nodes')
			.select('*')
			.eq('project_id', appState.project.id)
			.order('order_index', { ascending: true });

		if (error) {
			errorMessage = 'Veriler çekilemedi: ' + error.message;
			loading = false;
			return;
		}

		gddNodes = data || [];

		// EĞER ROOT (KÖK) DÜĞÜM YOKSA: Otomatik olarak proje adıyla oluştur!
		const existingRoot = gddNodes.find((n) => n.parent_id === null);
		if (!existingRoot && appState.project?.id) {
			await initializeRootNode();
		}

		loading = false;
	}

	// B) OTOMATİK ROOT (KÖK) OLUŞTURUCU
	async function initializeRootNode() {
		const title = appState.project?.title || 'MASTER PROJECT GDD';
		const rootPayload = {
			project_id: appState.project.id,
			parent_id: null,
			title: title,
			icon: 'BookOpen',
			content: `# ${title} // MASTER GDD\n\nWelcome to the master game design document. Add sections below.`,
			order_index: 0
		};

		const { data, error } = await supabase
			.from('gdd_nodes')
			.insert([rootPayload])
			.select()
			.single();
		if (data && !error) {
			gddNodes = [data, ...gddNodes];
		}
	}

	// C) YENİ DÜĞÜM (YA DA ALT DÜĞÜM) EKLE
	async function handleCreate(e) {
		e.preventDefault();
		if (!newTitle.trim() || !appState.project?.id) return;

		isSubmitting = true;
		const targetParentId = selectedParentId || rootNode?.id || null;

		// Kardeşlerin order_index değerine bakıp bir sonrakini ver
		const siblings = gddNodes.filter((n) => n.parent_id === targetParentId);
		const nextOrder =
			siblings.length > 0 ? Math.max(...siblings.map((s) => s.order_index || 0)) + 1 : 1;

		const payload = {
			project_id: appState.project.id,
			parent_id: targetParentId,
			title: newTitle.trim(),
			icon: selectedIcon || 'FileText',
			content: `# ${newTitle.trim()}\n\nWrite technical specifications here...`,
			order_index: nextOrder
		};

		const { data, error } = await supabase.from('gdd_nodes').insert([payload]).select().single();

		if (error) {
			alert('[ERROR]: Bölüm oluşturulamadı -> ' + error.message);
		} else if (data) {
			gddNodes = [...gddNodes, data];
			// Formu sıfırla ve kapat
			newTitle = '';
			selectedIcon = 'FileText';
			selectedParentId = null;
			isCreating = false;
			setTimeout(() => scrollToNode(data.id), 200);
		}
		isSubmitting = false;
	}

	// D) DÜĞÜM GÜNCELLE (TacMDE içinden veya Save butonundan tetiklenir)
	async function saveNode(node) {
		const { error } = await supabase
			.from('gdd_nodes')
			.update({
				content: node.content,
				title: node.title,
				icon: node.icon,
				updated_at: new Date().toISOString()
			})
			.eq('id', node.id);

		if (error) {
			alert('[ERROR]: Değişiklikler kaydedilemedi -> ' + error.message);
		} else {
			editingNodeId = null; // Başarılıysa şık okuma moduna dön
		}
	}

	// E) DÜĞÜM SİL
	async function deleteNode(nodeId) {
		if (nodeId === rootNode?.id) {
			alert('[WARNING]: Ana Root (Kök) dokümanı silemezsiniz!');
			return;
		}

		if (!confirm('Bu GDD bölümünü silmek istediğinize emin misiniz?')) return;

		const { error } = await supabase.from('gdd_nodes').delete().eq('id', nodeId);
		if (error) {
			alert('[ERROR]: Silinemedi -> ' + error.message);
		} else {
			gddNodes = gddNodes.filter((n) => n.id !== nodeId && n.parent_id !== nodeId);
		}
	}

	// F) SCROLL VE PARLAMA MOTORU
	function scrollToNode(id) {
		isMobileTocOpen = false;
		const element = document.getElementById('node-' + id);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
			element.classList.add('!border-black', 'bg-arsenal-lime/10');
			setTimeout(() => element.classList.remove('!border-black', 'bg-arsenal-lime/10'), 1500);
		}
	}
</script>

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 font-sans select-none">
	<div
		class="mb-8 border-b border-arsenal-border pb-4 flex flex-col sm:flex-row sm:items-end justify-between gap-4"
	>
		<div>
			<div class="flex items-center gap-2 mb-1 font-mono text-xs text-arsenal-muted font-bold">
				<span class="status-dot-lime !bg-black"></span>
				<span>PRODUCTION // GAME DESIGN DOCUMENT</span>
			</div>
			<h1
				class="text-2xl sm:text-3xl font-mono font-extrabold tracking-tight uppercase text-arsenal-text"
			>
				GDD // <span class="underline decoration-2 underline-offset-4"
					>{appState.project?.title || 'UNASSIGNED'}</span
				>
			</h1>
		</div>

		<div class="flex items-center gap-3 font-mono text-xs shrink-0">
			<span
				class="badge-neutral bg-white !py-1 font-bold hidden sm:inline-flex items-center gap-1 border border-black"
			>
				<span>TOTAL NODES:</span>
				<strong class="text-black ml-0.5">{gddNodes.length}</strong>
			</span>

			<button
				type="button"
				onclick={() => (isCreating = !isCreating)}
				class="btn-lime !py-1.5 !px-3.5 text-xs flex items-center gap-1.5 shadow-2xs font-bold cursor-pointer"
			>
				{#if isCreating}
					<Icons.Minus class="w-4 h-4 shrink-0" />
				{:else}
					<Icons.Plus class="w-4 h-4 shrink-0" />
				{/if}
				<span class="tracking-wider uppercase">{isCreating ? 'CLOSE SETUP' : 'NEW SECTION'}</span>
			</button>
		</div>
	</div>

	{#if errorMessage}
		<div
			class="mb-6 bg-red-500/10 border border-arsenal-red p-4 text-xs font-mono text-arsenal-red font-bold"
		>
			[ERROR]: {errorMessage}
		</div>
	{/if}

	{#if isCreating}
		<div
			class="mb-8 p-6 bg-arsenal-surface border-2 border-black shadow-md font-sans animate-in fade-in duration-200"
		>
			<div
				class="flex justify-between border-b border-arsenal-border pb-2 mb-4 font-mono font-bold text-xs"
			>
				<span class="text-arsenal-lime !bg-black px-2 py-0.5">INITIALIZE NEW GDD NODE // SETUP</span
				>
				<button
					onclick={() => (isCreating = false)}
					class="text-arsenal-muted hover:text-black font-bold cursor-pointer"
				>
					<Icons.X class="w-4 h-4" />
				</button>
			</div>

			<form onsubmit={handleCreate} class="space-y-4 font-mono text-xs">
				<div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
					<div class="md:col-span-7">
						<label class="text-label" for="n-title">SECTION TITLE // HEADING</label>
						<input
							id="n-title"
							type="text"
							bind:value={newTitle}
							placeholder="e.g., WEAPON BALLISTICS"
							required
							class="input-tactical w-full uppercase font-bold"
						/>
					</div>

					<div class="md:col-span-5">
						<label class="text-label" for="n-parent">PARENT SECTION // BRANCH</label>
						<select
							id="n-parent"
							bind:value={selectedParentId}
							class="input-tactical w-full font-bold uppercase cursor-pointer"
						>
							<option value={null}>[ROOT] (Main Branch)</option>
							{#each gddNodes.filter((n) => n.id !== rootNode?.id) as node}
								<option value={node.id}>── {node.title}</option>
							{/each}
						</select>
					</div>
				</div>

				<IconPicker bind:selectedIcon label="SECTION SYMBOL // ICON" />

				<div class="flex justify-end gap-2 pt-2 border-t border-arsenal-border/60">
					<button type="button" onclick={() => (isCreating = false)} class="btn-primary !px-4"
						>CANCEL</button
					>
					<button
						type="submit"
						disabled={isSubmitting}
						class="btn-lime !px-6 font-bold disabled:opacity-50 flex items-center gap-1.5"
					>
						<Icons.Plus class="w-4 h-4 shrink-0" />
						<span>CREATE & INSERT NODE</span>
					</button>
				</div>
			</form>
		</div>
	{/if}

	<div class="block lg:hidden mb-6">
		<button
			type="button"
			onclick={() => (isMobileTocOpen = !isMobileTocOpen)}
			class="w-full bg-arsenal-surface border border-arsenal-border p-3 flex items-center justify-between font-mono font-bold text-xs text-arsenal-text shadow-2xs cursor-pointer hover:border-black"
		>
			<span class="flex items-center gap-2">
				<Icons.ListTree class="w-4 h-4 shrink-0 text-black" />
				<span>INDEX // TABLE OF CONTENTS ({gddNodes.length})</span>
			</span>
			<span class="bg-black text-white px-2 py-0.5 text-[10px] uppercase">
				{isMobileTocOpen ? 'COLLAPSE' : 'EXPAND'}
			</span>
		</button>

		{#if isMobileTocOpen}
			<div
				class="mt-2 bg-white border border-arsenal-border p-3 max-h-60 overflow-y-auto space-y-1 shadow-md font-mono text-xs"
			>
				{#each gddNodes as node, idx}
					{@const NodeIcon =
						Icons[node.icon] ||
						Icons[node.icon?.charAt(0).toUpperCase() + node.icon?.slice(1)] ||
						Icons.FileText}
					<button
						type="button"
						onclick={() => scrollToNode(node.id)}
						class="w-full text-left p-2 hover:bg-arsenal-surface flex items-center justify-between border-b border-arsenal-border/40 last:border-0"
					>
						<span class="font-bold truncate text-arsenal-text flex items-center gap-1.5">
							<NodeIcon class="w-3.5 h-3.5 text-arsenal-muted shrink-0" />
							<span class="text-arsenal-muted mr-1">#{idx + 1}</span>
							{node.title}
						</span>
					</button>
				{/each}
			</div>
		{/if}
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
		<div
			class="hidden lg:block lg:col-span-3 sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto border border-arsenal-border bg-arsenal-surface p-4 shadow-2xs select-none"
		>
			<div
				class="flex items-center justify-between border-b border-arsenal-border pb-2.5 mb-3 font-mono text-xs font-bold text-arsenal-text uppercase tracking-wider"
			>
				<span class="flex items-center gap-1.5">
					<span class="status-dot-lime !bg-black"></span>
					<span>DIRECTORY // TOC</span>
				</span>
				<span class="badge-neutral bg-white !py-0 !px-1.5 text-[10px]">{gddNodes.length}</span>
			</div>

			<div class="space-y-1 font-mono text-xs">
				{#if treeNodes.length === 0}
					<div class="py-6 text-center text-arsenal-muted text-[10px] italic">
						No GDD sections defined.
					</div>
				{:else}
					{#each treeNodes as root}
						{@const RootIcon =
							Icons[root.icon] ||
							Icons[root.icon?.charAt(0).toUpperCase() + root.icon?.slice(1)] ||
							Icons.BookOpen}

						<button
							type="button"
							onclick={() => scrollToNode(root.id)}
							class="w-full text-left p-1.5 bg-black text-white font-bold flex items-center gap-2 border border-black hover:bg-arsenal-lime hover:text-black transition-none cursor-pointer"
						>
							<RootIcon class="w-4 h-4 shrink-0" />
							<span class="truncate uppercase">{root.title}</span>
						</button>

						{#if root.children && root.children.length > 0}
							<div class="pl-2 space-y-1 mt-1 border-l-2 border-arsenal-border ml-2">
								{#each root.children as child, idx}
									{@const ChildIcon =
										Icons[child.icon] ||
										Icons[child.icon?.charAt(0).toUpperCase() + child.icon?.slice(1)] ||
										Icons.FileText}

									<button
										type="button"
										onclick={() => scrollToNode(child.id)}
										class="w-full text-left p-1.5 hover:bg-white hover:text-black flex items-center justify-between group cursor-pointer border border-transparent hover:border-black"
									>
										<span
											class="flex items-center gap-1.5 truncate text-arsenal-text group-hover:font-bold"
										>
											<ChildIcon
												class="w-3.5 h-3.5 text-arsenal-muted group-hover:text-black shrink-0"
											/>
											<span class="truncate">#{idx + 1}. {child.title}</span>
										</span>
									</button>

									{#if child.children && child.children.length > 0}
										<div class="pl-4 space-y-0.5 border-l border-arsenal-border/60 ml-2">
											{#each child.children as subChild}
												{@const SubIcon =
													Icons[subChild.icon] ||
													Icons[subChild.icon?.charAt(0).toUpperCase() + subChild.icon?.slice(1)] ||
													Icons.CornerDownRight}
												<button
													type="button"
													onclick={() => scrollToNode(subChild.id)}
													class="w-full text-left p-1 text-[11px] hover:text-black flex items-center gap-1.5 text-arsenal-muted hover:font-bold truncate cursor-pointer"
												>
													<SubIcon class="w-3 h-3 shrink-0" />
													<span class="truncate">{subChild.title}</span>
												</button>
											{/each}
										</div>
									{/if}
								{/each}
							</div>
						{/if}
					{/each}
				{/if}
			</div>

			<div
				class="mt-4 pt-3 border-t border-arsenal-border/60 font-mono text-[9px] text-arsenal-muted text-center"
			>
				<span>CLICK TO JUMP // FAST NAV</span>
			</div>
		</div>

		<div class="col-span-1 lg:col-span-9 space-y-6 min-w-0">
			{#if loading}
				<div
					class="flex flex-col items-center justify-center py-24 gap-3 font-mono text-xs text-arsenal-muted border border-dashed border-arsenal-border bg-arsenal-surface/40"
				>
					<div
						class="h-6 w-6 animate-spin rounded-full border-2 border-black border-t-transparent"
					></div>
					<span class="animate-pulse uppercase tracking-widest font-bold text-arsenal-text"
						>DOWNLOADING GDD TELEMETRY...</span
					>
				</div>
			{:else if gddNodes.length === 0}
				<div
					class="border border-dashed border-arsenal-border bg-arsenal-surface p-16 text-center font-mono"
				>
					<p class="text-sm font-bold uppercase text-arsenal-text">
						[NO GDD SECTIONS FOUND IN WORKSPACE]
					</p>
					<p class="text-xs mt-1 text-arsenal-muted">INITIALIZING ROOT NODE... PLEASE WAIT.</p>
				</div>
			{:else}
				{#each gddNodes as node, idx (node.id)}
					{@const NodeIcon =
						Icons[node.icon] ||
						Icons[node.icon?.charAt(0).toUpperCase() + node.icon?.slice(1)] ||
						Icons.FileText}

					<div id="node-{node.id}" class="transition-all duration-300 scroll-mt-28">
						{#if editingNodeId === node.id}
							<div class="border-2 border-black bg-arsenal-surface p-4 shadow-md">
								<div
									class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-arsenal-border pb-3 mb-4 font-mono text-xs"
								>
									<div class="flex items-center gap-2 font-bold text-arsenal-text">
										<span class="status-dot-lime !bg-black"></span>
										<span class="uppercase text-sm flex items-center gap-1.5">
											<NodeIcon class="w-4 h-4 text-black shrink-0" />
											<span>EDITING // {node.title}</span>
										</span>
									</div>

									<div class="flex items-center gap-2 shrink-0">
										<div class="w-36">
											<IconPicker bind:selectedIcon={node.icon} />
										</div>

										<button
											onclick={() => (editingNodeId = null)}
											class="btn-primary !py-1 !px-3 font-bold text-[10px] flex items-center gap-1"
										>
											<Icons.X class="w-3.5 h-3.5 shrink-0" />
											<span>CANCEL</span>
										</button>
										<button
											onclick={() => saveNode(node)}
											class="btn-lime !py-1 !px-4 font-bold text-[10px] shadow-2xs flex items-center gap-1"
										>
											<Icons.Save class="w-3.5 h-3.5 shrink-0" />
											<span>SAVE & CLOSE</span>
										</button>
									</div>
								</div>

								<div class="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[420px]">
									<div
										class="bg-white border border-arsenal-border p-4 overflow-y-auto max-h-[550px]"
									>
										<div
											class="text-[9px] font-mono font-bold text-arsenal-muted border-b pb-1 mb-3 uppercase tracking-wider flex justify-between"
										>
											<span>[LIVE RENDER PREVIEW]</span>
											<span>READ-ONLY</span>
										</div>
										<div class="prose-arsenal text-xs text-arsenal-text leading-relaxed">
											{@html marked.parse(node.content || '*Start typing to preview...*')}
										</div>
									</div>

									<div class="flex flex-col h-full">
										<div
											class="text-[9px] font-mono font-bold text-arsenal-muted border-b border-arsenal-border pb-1 mb-1 uppercase tracking-wider flex justify-between"
										>
											<span>[TACTICAL MARKDOWN WORKSTATION]</span>
											<span>CTRL+S TO COMMIT</span>
										</div>
										<TacMDE
											bind:value={node.content}
											onsave={() => saveNode(node)}
											placeholder="# Enter section specs..."
											rows={16}
										/>
									</div>
								</div>
							</div>
						{:else}
							<div
								class="border border-arsenal-border bg-arsenal-card p-5 hover:border-black transition-none group relative select-none shadow-2xs"
							>
								<div
									class="flex items-start sm:items-center justify-between gap-2 border-b border-arsenal-border/60 pb-3 mb-4"
								>
									<h2
										class="font-mono font-bold text-base sm:text-lg text-arsenal-text flex items-center gap-2"
									>
										<span class="text-xs bg-black text-white font-mono px-1.5 py-0.5"
											>#{idx + 1}</span
										>
										<NodeIcon class="w-4 h-4 text-arsenal-muted group-hover:text-black shrink-0" />
										<span>{node.title}</span>
									</h2>

									<div class="flex items-center gap-1.5 shrink-0">
										<button
											type="button"
											onclick={() => (editingNodeId = node.id)}
											class="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-black text-white hover:bg-arsenal-lime hover:text-black font-mono font-bold text-[10px] px-3 py-1 uppercase cursor-pointer shadow-2xs flex items-center gap-1"
										>
											<Icons.Settings class="w-3.5 h-3.5 shrink-0" />
											<span>EDIT</span>
										</button>

										{#if node.parent_id !== null}
											<button
												type="button"
												title="Delete section"
												onclick={() => deleteNode(node.id)}
												class="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity bg-red-600 text-white hover:bg-red-700 font-mono font-bold text-[10px] px-2 py-1 uppercase cursor-pointer shadow-2xs"
											>
												<Icons.Trash2 class="w-3.5 h-3.5 shrink-0" />
											</button>
										{/if}
									</div>
								</div>

								<div
									class="prose-arsenal text-xs text-arsenal-muted leading-relaxed font-sans pl-1"
								>
									{@html marked.parse(
										node.content || '*No technical specifications detailed yet.*'
									)}
								</div>
							</div>
						{/if}
					</div>
				{/each}
			{/if}
		</div>
	</div>
</div>
