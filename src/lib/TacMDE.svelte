<script>
	import { onMount } from 'svelte';
	import * as Icons from 'lucide-svelte';

	let {
		value = $bindable(''),
		placeholder = 'Enter markdown specification...',
		rows = 12,
		onsave = () => {}
	} = $props();

	let textareaEl = $state(null);

    
	let history = $state([]);
	let historyIdx = $state(-1);
	let isUndoing = false;
	let lastInputTime = 0;

	function saveSnapshot() {
		if (!textareaEl || isUndoing) return;

		const currentVal = value;
		const cursorPos = textareaEl.selectionStart;

		if (historyIdx >= 0 && history[historyIdx]?.text === currentVal) return;

		if (historyIdx < history.length - 1) {
			history = history.slice(0, historyIdx + 1);
		}

		history.push({ text: currentVal, cursor: cursorPos });

		if (history.length > 50) {
			history.shift();
		} else {
			historyIdx++;
		}
	}


	function handleUndo() {
		if (historyIdx > 0) {
			isUndoing = true;
			historyIdx--;
			const state = history[historyIdx];
			value = state.text;

			setTimeout(() => {
				if (textareaEl) {
					textareaEl.focus();
					textareaEl.setSelectionRange(state.cursor, state.cursor);
				}
				isUndoing = false;
			}, 0);
		}
	}


	function handleRedo() {
		if (historyIdx < history.length - 1) {
			isUndoing = true;
			historyIdx++;
			const state = history[historyIdx];
			value = state.text;

			setTimeout(() => {
				if (textareaEl) {
					textareaEl.focus();
					textareaEl.setSelectionRange(state.cursor, state.cursor);
				}
				isUndoing = false;
			}, 0);
		}
	}

	function handleInput() {
		const now = Date.now();
		if (now - lastInputTime > 1000 || /\s$/.test(value) || history.length === 0) {
			saveSnapshot();
		}
		lastInputTime = now;
	}

	onMount(() => {
		setTimeout(saveSnapshot, 100);
	});


	function insertFormatting(prefix, suffix = '', defaultText = 'text') {
		if (!textareaEl) return;

		saveSnapshot();

		const start = textareaEl.selectionStart;
		const end = textareaEl.selectionEnd;
		const selectedText = value.substring(start, end);
		const replacementText = selectedText || defaultText;

		value = value.substring(0, start) + prefix + replacementText + suffix + value.substring(end);

		setTimeout(() => {
			textareaEl.focus();
			if (selectedText) {
				textareaEl.setSelectionRange(start + prefix.length, end + prefix.length);
			} else {
				textareaEl.setSelectionRange(
					start + prefix.length,
					start + prefix.length + defaultText.length
				);
			}
			saveSnapshot();
		}, 0);
	}

    
	function handleKeyDown(e) {
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
			e.preventDefault();
			const confirmed = confirm(
				'Do you want to save and commit these specifications to the database?'
			);
			if (confirmed) {
				onsave(); 
			}
			return;
		}


		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
			e.preventDefault();
			if (e.shiftKey) {
				handleRedo();
			} else {
				handleUndo();
			}
			return;
		}


		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
			e.preventDefault();
			handleRedo();
			return;
		}


		if (e.key === 'Tab') {
			e.preventDefault();
			insertFormatting('  ', '', '');
			return;
		}


		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
			e.preventDefault();
			insertFormatting('**', '**', 'bold text');
		}
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
			e.preventDefault();
			insertFormatting('*', '*', 'italic text');
		}
		if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			insertFormatting('[', '](https://)', 'link title');
		}
	}


	const toolbarButtons = [
		{ label: 'Undo (Ctrl+Z)', icon: 'Undo2', action: handleUndo, disabled: () => historyIdx <= 0 },
		{
			label: 'Redo (Ctrl+Y)',
			icon: 'Redo2',
			action: handleRedo,
			disabled: () => historyIdx >= history.length - 1
		},
		{ divider: true },
		{
			label: 'Bold (Ctrl+B)',
			icon: 'Bold',
			action: () => insertFormatting('**', '**', 'bold text')
		},
		{
			label: 'Italic (Ctrl+I)',
			icon: 'Italic',
			action: () => insertFormatting('*', '*', 'italic text')
		},
		{
			label: 'Heading 2',
			icon: 'Heading2',
			action: () => insertFormatting('## ', '', 'Section Title')
		},
		{
			label: 'Heading 3',
			icon: 'Heading3',
			action: () => insertFormatting('### ', '', 'Sub Section')
		},
		{ divider: true },
		{ label: 'Bullet List', icon: 'List', action: () => insertFormatting('* ', '', 'List item') },
		{
			label: 'Numbered List',
			icon: 'ListOrdered',
			action: () => insertFormatting('1. ', '', 'First item')
		},
		{
			label: 'Task List',
			icon: 'CheckSquare',
			action: () => insertFormatting('- [ ] ', '', 'Task step')
		},
		{ divider: true },
		{
			label: 'Code Block',
			icon: 'Code',
			action: () => insertFormatting('```\n', '\n```', 'code snippet')
		},
		{
			label: 'Quote Box',
			icon: 'Quote',
			action: () => insertFormatting('> ', '', 'Important note')
		},
		{
			label: 'Insert Link (Ctrl+K)',
			icon: 'Link',
			action: () => insertFormatting('[', '](https://)', 'link title')
		}
	];
</script>

<div
	class="border border-arsenal-border bg-arsenal-surface flex flex-col font-sans select-none shadow-2xs"
>
	<div
		class="flex flex-wrap items-center gap-1 p-1.5 bg-arsenal-bg/80 border-b border-arsenal-border text-arsenal-text"
	>
		<span
			class="text-[9px] font-mono font-bold text-arsenal-muted px-1.5 mr-1 hidden sm:inline uppercase tracking-wider"
		>
			[MD-CORE]
		</span>

		{#each toolbarButtons as btn}
			{#if btn.divider}
				<span class="w-[1px] h-4 bg-arsenal-border/80 mx-1"></span>
			{:else}
				{@const IconComponent = Icons[btn.icon] || Icons.HelpCircle}
				{@const isDisabled = btn.disabled ? btn.disabled() : false}
				<button
					type="button"
					title={btn.label}
					onclick={btn.action}
					disabled={isDisabled}
					class="p-1.5 text-arsenal-text hover:bg-black hover:text-white transition-none rounded-none cursor-pointer border border-transparent hover:border-black disabled:opacity-30 disabled:pointer-events-none"
				>
					<IconComponent class="w-3.5 h-3.5 shrink-0" />
				</button>
			{/if}
		{/each}

		<div
			class="ml-auto flex items-center gap-2 pr-2 font-mono text-[9px] text-arsenal-muted hidden md:flex"
		>
			<span>MEM: {history.length}/50 STEP</span>
			<span class="status-dot-lime !bg-black"></span>
		</div>
	</div>

	<textarea
		bind:this={textareaEl}
		bind:value
		oninput={handleInput}
		onkeydown={handleKeyDown}
		{placeholder}
		{rows}
		class="input-tactical !border-0 font-mono text-xs w-full flex-1 resize-y p-3.5 leading-relaxed !bg-arsenal-surface/40 focus:!bg-white font-medium focus:ring-0 outline-none"
	></textarea>

	<div
		class="px-3 py-1 bg-arsenal-bg/40 border-t border-arsenal-border/60 flex justify-between font-mono text-[9px] text-arsenal-muted"
	>
		<span>LENGTH: {value.length} CHARS // {value.split(/\s+/).filter(Boolean).length} WORDS</span>
		<div class="flex items-center gap-3">
			<span class="text-arsenal-muted">CTRL+S TO COMMIT</span>
		</div>
	</div>
</div>
