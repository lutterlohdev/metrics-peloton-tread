<script>
	import CsvImporter from '$lib/components/CsvImporter.svelte';
	import { topFiveRunsByLength, dateFilter, averagePaceMetrics } from '$lib/store.js';
	import { parseWorkoutTimestamp } from '$lib/utils.js';
	import { onMount } from 'svelte';
	import OutputOverTimeChart from '$lib/components/OutputOverTimeChart.svelte';
	import InstructorBreakdownChart from '$lib/components/InstructorBreakdownChart.svelte';

	// default to last 3 months
	function formatDate(d) {
		return d.toISOString().slice(0, 10);
	}

	function formatFriendlyDate(timestamp) {
		const date = parseWorkoutTimestamp(timestamp);
		if (!date) return 'Unknown';
		return new Intl.DateTimeFormat('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(date);
	}

	function getDefaultDates() {
		const today = new Date();
		const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());
		return {
			start: formatDate(threeMonthsAgo),
			end: formatDate(today)
		};
	}

	const defaults = getDefaultDates();
	let startDate = defaults.start;
	let endDate = defaults.end;
	let selectedDuration = null;

	function updateFilter() {
		dateFilter.set({
			start: startDate,
			end: endDate
		});
		if (typeof window !== 'undefined') {
			localStorage.setItem(
				'peloton_date_filter',
				JSON.stringify({
					start: startDate,
					end: endDate
				})
			);
		}
	}

	function resetToDefault() {
		startDate = defaults.start;
		endDate = defaults.end;
		updateFilter();
	}

	onMount(() => {
		if (typeof window !== 'undefined') {
			const saved = localStorage.getItem('peloton_date_filter');
			if (saved) {
				try {
					const parsed = JSON.parse(saved);
					startDate = parsed.start;
					endDate = parsed.end;
				} catch (e) {
					console.warn('Failed to parse saved date filter:', e);
				}
			}
		}
		updateFilter();
	});

	$: availableDurations = Object.keys($topFiveRunsByLength).sort(
		(a, b) => parseInt(a) - parseInt(b)
	);
	$: if (selectedDuration === null && availableDurations.length > 0) {
		selectedDuration = availableDurations[0];
	}
	$: selectedRuns = selectedDuration ? $topFiveRunsByLength[selectedDuration] : [];
</script>

<header class="dashboard-header">
	<div class="header-content">
		<div class="logo-area">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="32"
				height="32"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				class="header-icon"
				><path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path
					d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"
				/><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line
					x1="14"
					y1="1"
					x2="14"
					y2="4"
				/></svg
			>
			<h1>Peloton Metrics</h1>
		</div>
		<p class="subtitle">Your workout data, beautifully visualized and completely private.</p>
	</div>
</header>

<div class="dashboard-grid">
	<aside class="sidebar">
		<CsvImporter />

		<div class="glass-panel filter-card">
			<h3>Date Range</h3>
			<div class="filter-controls">
				<label class="input-group">
					<span>Start Date</span>
					<input type="date" bind:value={startDate} on:change={updateFilter} />
				</label>
				<label class="input-group">
					<span>End Date</span>
					<input type="date" bind:value={endDate} on:change={updateFilter} />
				</label>
				<button class="ghost-btn" on:click={resetToDefault}> Reset Dates </button>
			</div>
		</div>

		<div class="glass-panel pace-card">
			<h3>Average Pace</h3>
			<div class="pace-grid">
				{#each Object.entries($averagePaceMetrics) as [length, metrics]}
					<div class="pace-stat">
						<span class="pace-label">{length}m</span>
						<span class="pace-value">{metrics.formatted} <small>/mi</small></span>
					</div>
				{/each}
			</div>
		</div>
	</aside>

	<main class="main-content">
		<div class="chart-container glass-panel">
			<OutputOverTimeChart />
		</div>

		<div class="chart-container glass-panel">
			<InstructorBreakdownChart />
		</div>

		<div class="glass-panel top-runs-card">
			<div class="card-header">
				<h2>Top Runs by Duration</h2>
				<div class="duration-picker">
					{#each availableDurations as duration}
						<button
							class="duration-btn"
							class:active={selectedDuration === duration}
							on:click={() => (selectedDuration = duration)}
						>
							{duration}m
						</button>
					{/each}
				</div>
			</div>

			{#if selectedRuns && selectedRuns.length > 0}
				<div class="run-list">
					{#each selectedRuns as run}
						<div class="run-item">
							<div class="run-main">
								<div class="run-info">
									<strong>{run.Title}</strong>
									<span class="run-date">{formatFriendlyDate(run['Workout Timestamp'])}</span>
								</div>
								<div class="run-metrics">
									<span class="metric-highlight">{run['Total Output']} kJ</span>
								</div>
							</div>
							<div class="run-badges">
								<span class="badge badge-instructor">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="12"
										height="12"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle
											cx="12"
											cy="7"
											r="4"
										/></svg
									>
									{run['Instructor Name']}
								</span>
								<span class="badge">{run['Distance (mi)']} mi</span>
								<span class="badge">{run['Avg. Pace (min/mi)']} /mi</span>
								<span class="badge badge-type">{run.Type}</span>
							</div>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</main>
</div>

<style>
	/* Header */
	.dashboard-header {
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px solid var(--border-color);
	}
	.header-content {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	.logo-area {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: var(--accent-primary);
	}
	.logo-area h1 {
		margin: 0;
		font-size: 2rem;
		letter-spacing: -0.05em;
		background: linear-gradient(135deg, #60a5fa, #3b82f6);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}
	.subtitle {
		margin: 0;
		color: var(--text-muted);
		font-size: 1.1rem;
	}

	/* Layout Grid */
	.dashboard-grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 2rem;
	}
	@media (min-width: 900px) {
		.dashboard-grid {
			grid-template-columns: 320px 1fr;
		}
	}

	/* Sidebar Components */
	.sidebar {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.filter-card,
	.pace-card {
		padding: 1.5rem;
	}
	.filter-card h3,
	.pace-card h3 {
		margin-top: 0;
		margin-bottom: 1.25rem;
		font-size: 1.1rem;
		color: var(--text-primary);
	}
	.filter-controls {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
	}
	.input-group span {
		font-size: 0.85rem;
		color: var(--text-secondary);
		font-weight: 500;
	}
	.ghost-btn {
		margin-top: 0.5rem;
		padding: 0.5rem;
		background: transparent;
		border: 1px solid var(--border-color);
		color: var(--text-secondary);
		border-radius: 6px;
		cursor: pointer;
		transition: all 0.2s;
	}
	.ghost-btn:hover {
		background: rgba(255, 255, 255, 0.05);
		color: var(--text-primary);
	}

	.pace-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.75rem;
	}
	.pace-stat {
		background: rgba(0, 0, 0, 0.2);
		padding: 0.75rem;
		border-radius: 8px;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		border: 1px solid rgba(255, 255, 255, 0.05);
	}
	.pace-label {
		font-size: 0.8rem;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		font-weight: 600;
	}
	.pace-value {
		font-size: 1.1rem;
		font-weight: 600;
		color: var(--accent-success);
	}
	.pace-value small {
		font-size: 0.75em;
		color: var(--text-muted);
	}

	/* Main Content */
	.main-content {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}
	.chart-container {
		padding: 1.5rem;
		min-height: 400px;
	}

	/* Top Runs Section */
	.top-runs-card {
		padding: 1.5rem;
	}
	.card-header {
		display: flex;
		flex-direction: column;
		gap: 1rem;
		margin-bottom: 1.5rem;
	}
	@media (min-width: 600px) {
		.card-header {
			flex-direction: row;
			justify-content: space-between;
			align-items: center;
		}
	}
	.card-header h2 {
		margin: 0;
		font-size: 1.3rem;
	}

	.duration-picker {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
		background: rgba(0, 0, 0, 0.2);
		padding: 0.25rem;
		border-radius: 10px;
	}
	.duration-btn {
		padding: 0.4rem 1rem;
		border: none;
		background: transparent;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9em;
		font-weight: 500;
		color: var(--text-secondary);
		transition: all 0.2s ease;
	}
	.duration-btn:hover {
		color: var(--text-primary);
		background: rgba(255, 255, 255, 0.05);
	}
	.duration-btn.active {
		background: var(--accent-primary);
		color: white;
		box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
	}

	.run-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	.run-item {
		background: rgba(0, 0, 0, 0.15);
		border: 1px solid var(--border-color);
		padding: 1.25rem;
		border-radius: 10px;
		transition:
			transform 0.2s,
			background 0.2s;
	}
	.run-item:hover {
		background: rgba(0, 0, 0, 0.25);
		transform: translateY(-2px);
		border-color: rgba(255, 255, 255, 0.15);
	}
	.run-main {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
		gap: 1rem;
	}
	.run-info {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.run-info strong {
		font-size: 1.1em;
		color: var(--text-primary);
	}
	.run-date {
		font-size: 0.85em;
		color: var(--text-muted);
	}
	.run-metrics {
		text-align: right;
	}
	.metric-highlight {
		font-size: 1.2em;
		font-weight: 700;
		color: var(--accent-success);
	}

	.run-badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.35rem 0.75rem;
		background: rgba(255, 255, 255, 0.08);
		border-radius: 2rem;
		font-size: 0.8em;
		color: var(--text-secondary);
		font-weight: 500;
		border: 1px solid rgba(255, 255, 255, 0.05);
	}
	.badge-instructor {
		background: rgba(59, 130, 246, 0.15);
		color: #93c5fd;
		border-color: rgba(59, 130, 246, 0.2);
	}
	.badge-type {
		background: rgba(139, 92, 246, 0.15);
		color: #c4b5fd;
		border-color: rgba(139, 92, 246, 0.2);
	}
</style>
