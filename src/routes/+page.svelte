<script>
	import CsvImporter from '$lib/components/CsvImporter.svelte';
	import {
		workoutData,
		topFiveRunsByLength,
		dateFilter,
		averagePaceMetrics,
		averageHeartRateMetrics,
		averageCaloriesMetrics,
		runTypeFilter,
		availableRunTypes,
		topRunsSortMetric
	} from '$lib/store.js';
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
	$: if (
		selectedDuration === null ||
		(availableDurations.length > 0 && !availableDurations.includes(selectedDuration))
	) {
		selectedDuration = availableDurations[0] || null;
	} else if (availableDurations.length === 0) {
		selectedDuration = null;
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
				fill="currentColor"
				class="header-icon"
				><path
					d="M2 15C2 15 2 12 4 12C4.68 12 5.46 11.95 6.28 11.82C7.2 12.54 8.5 13 10 13H10.25L8.56 11.29C8.91 11.18 9.25 11.05 9.59 10.91L11.5 12.82C11.89 12.74 12.25 12.63 12.58 12.5L10.55 10.45C10.85 10.28 11.14 10.11 11.43 9.91L13.5 12C13.8 11.79 14.04 11.56 14.25 11.32L12.22 9.29C12.46 9.07 12.7 8.83 12.92 8.58L14.79 10.45C14.91 10.14 15 9.83 15 9.5C15 8.65 14.55 7.89 13.84 7.28C13.89 7.19 13.95 7.1 14 7L15.53 6.23C16.38 7.17 18.14 7.84 20.25 7.97L20.3 8H21C21 8 22 9 22 12.5C22 13.07 22 13.57 21.96 14H19C17.9 14 16.58 14.26 15.3 14.5C14.12 14.76 12.9 15 12 15H2M21 17C21 17 21.58 17 21.86 15H19C17 15 14 16 12 16H2.28C2.62 16.6 3.26 17 4 17H21Z"
				/></svg
			>
			<h1>Peloton Tread Metrics</h1>
		</div>
		<p class="subtitle">
			Visualize your Peloton Tread workouts privately. All analysis is done safely offline in your
			browser.
		</p>
	</div>
</header>

<div class="dashboard-grid">
	<aside class="sidebar">
		{#if $workoutData.length === 0}
			<CsvImporter />
		{/if}

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
				{#each Object.entries($averagePaceMetrics) as [length, metrics] (length)}
					<div class="pace-stat">
						<span class="pace-label">{length}m</span>
						<span class="pace-value">{metrics.formatted} <small>/mi</small></span>
					</div>
				{/each}
			</div>
		</div>

		<div class="glass-panel pace-card">
			<h3>Average Heart Rate</h3>
			<div class="pace-grid">
				{#each Object.entries($averageHeartRateMetrics) as [length, metrics] (length)}
					<div class="pace-stat">
						<span class="pace-label">{length}m</span>
						<span class="pace-value">{metrics.formatted} <small>bpm</small></span>
					</div>
				{/each}
			</div>
		</div>

		<div class="glass-panel pace-card">
			<h3>Average Calories Burned</h3>
			<div class="pace-grid">
				{#each Object.entries($averageCaloriesMetrics) as [length, metrics] (length)}
					<div class="pace-stat">
						<span class="pace-label">{length}m</span>
						<span class="pace-value">{metrics.formatted} <small>kcal</small></span>
					</div>
				{/each}
			</div>
		</div>
	</aside>

	<main class="main-content">
		<div class="glass-panel top-runs-card">
			<div class="card-header">
				<div class="card-title-row">
					<h2>
						Top Runs by {$topRunsSortMetric === 'Total Output'
							? 'Output'
							: $topRunsSortMetric === 'Distance (mi)'
								? 'Distance'
								: 'Pace'}
					</h2>
					<div class="filter-group">
						<select class="type-filter" bind:value={$topRunsSortMetric}>
							<option value="Total Output">Output</option>
							<option value="Distance (mi)">Distance</option>
							<option value="Avg. Pace (min/mi)">Pace</option>
						</select>
						<select class="type-filter" bind:value={$runTypeFilter}>
							{#each $availableRunTypes as type (type)}
								<option value={type}>{type === 'All' ? 'All Types' : type}</option>
							{/each}
						</select>
					</div>
				</div>
				<div class="duration-picker">
					{#each availableDurations as duration (duration)}
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
					{#each selectedRuns as run (run['Workout Timestamp'])}
						<div class="run-item">
							<div class="run-main">
								<div class="run-info">
									<strong>{run.Title}</strong>
									<span class="run-date">{formatFriendlyDate(run['Workout Timestamp'])}</span>
								</div>
								<div class="run-metrics">
									{#if $topRunsSortMetric === 'Total Output'}
										<span class="metric-highlight">{run['Total Output']} kJ</span>
									{:else if $topRunsSortMetric === 'Distance (mi)'}
										<span class="metric-highlight">{run['Distance (mi)']} mi</span>
									{:else if $topRunsSortMetric === 'Avg. Pace (min/mi)'}
										<span class="metric-highlight">{run['Avg. Pace (min/mi)']} /mi</span>
									{/if}
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

		<div class="chart-container glass-panel">
			<OutputOverTimeChart />
		</div>


		<div class="chart-container glass-panel">
			<InstructorBreakdownChart />
		</div>

		{#if $workoutData.length > 0}
			<CsvImporter />
		{/if}
	</main>
</div>

<footer class="site-footer">
	This app was built by a Peloton enthusiast. It is provided as-is and is not endorsed or sponsored
	in any way by Peloton. This is an open-source project. <a
		href="https://github.com/lutterlohdev/metrics-peloton-tread"
		target="_blank"
		rel="noopener noreferrer">View it on GitHub</a
	>
</footer>

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
		gap: 1.5rem;
		margin-bottom: 1.5rem;
	}
	.card-title-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}
	.filter-group {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		flex-wrap: wrap;
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

	.type-filter {
		background: rgba(0, 0, 0, 0.2);
		border: 1px solid rgba(255, 255, 255, 0.1);
		color: var(--text-primary);
		padding: 0.4rem 1rem;
		border-radius: 6px;
		font-size: 0.9em;
		outline: none;
		cursor: pointer;
	}

	.type-filter:focus {
		border-color: var(--accent-primary);
	}

	.type-filter option {
		background: #1f2937;
		color: #fff;
	}

	/* Footer */
	.site-footer {
		text-align: center;
		padding: 2rem;
		margin-top: 2rem;
		border-top: 1px solid var(--border-color);
		color: var(--text-muted);
		font-size: 0.85rem;
		line-height: 1.5;
	}

	.site-footer a {
		color: var(--accent-primary);
		text-decoration: none;
		transition: color 0.2s;
	}

	.site-footer a:hover {
		color: var(--accent-hover);
		text-decoration: underline;
	}
</style>
