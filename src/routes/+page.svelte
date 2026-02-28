<script>
	import CsvImporter from '$lib/components/CsvImporter.svelte';
	import { topFiveRunsByLength, dateFilter } from '$lib/store.js';
	import { parseWorkoutTimestamp } from '$lib/utils.js';
	import { onMount } from 'svelte';
    import OutputOverTimeChart from '$lib/components/OutputOverTimeChart.svelte';
    import AvgPaceOverTimeChart from '$lib/components/AvgPaceOverTimeChart.svelte';
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
			day: 'numeric',
		}).format(date);
	}

	const today = new Date();
	const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());

	let startDate = formatDate(threeMonthsAgo);
	let endDate = formatDate(today);
	let selectedDuration = null;

	function updateFilter() {
		dateFilter.set({
			start: startDate,
			end: endDate,
		});
	}

	onMount(() => {
		updateFilter();
	});

	$: availableDurations = Object.keys($topFiveRunsByLength).sort((a, b) => parseInt(a) - parseInt(b));
	$: if (selectedDuration === null && availableDurations.length > 0) {
		selectedDuration = availableDurations[0];
	}
	$: selectedRuns = selectedDuration ? $topFiveRunsByLength[selectedDuration] : [];

</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<CsvImporter />

<div style="margin-bottom: 1rem; padding: 1rem; background: #f9f9f9; border-radius: 8px; border: 1px solid #ddd;">
	<label for="page-start-date" style="margin-right: 1rem;">
		<strong>Start Date:</strong>
		<input type="date" id="page-start-date" bind:value={startDate} on:change={updateFilter} />
	</label>
	<label for="page-end-date">
		<strong>End Date:</strong>
		<input type="date" id="page-end-date" bind:value={endDate} on:change={updateFilter} />
	</label>
</div>

<OutputOverTimeChart />

<AvgPaceOverTimeChart />

<InstructorBreakdownChart />

<h2 style="margin-top: 2rem; margin-bottom: 1rem;">Top 5 Runs</h2>

<div class="duration-picker">
    {#each availableDurations as duration}
        <button
            class="duration-btn"
            class:active={selectedDuration === duration}
            on:click={() => (selectedDuration = duration)}
        >
            {duration} min
        </button>
    {/each}
</div>

{#if selectedRuns && selectedRuns.length > 0}
    <div class="runs-container">
        <div class="run-list">
            {#each selectedRuns as run}
                <div class="run-item">
                    <div class="run-header">
                        <div>
                            <strong>{run.Title}</strong>
                            <span class="run-output">{run['Total Output']} kJ</span>
                        </div>
                        <span class="run-date">{formatFriendlyDate(run['Workout Timestamp'])}</span>
                    </div>
                    <div class="run-badges">
                        <span class="badge">{run['Instructor Name']}</span>
                        <span class="badge">{run['Distance (mi)']} mi</span>
                        <span class="badge">{parseFloat(run['Avg. Pace (min/mi)']).toFixed(2)} min/mi</span>
                        <span class="badge">{run.Type}</span>
                    </div>
                </div>
            {/each}
        </div>
    </div>
{/if}

<style>
    .duration-picker {
        display: flex;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
        flex-wrap: wrap;
    }

    .duration-btn {
        padding: 0.5rem 1rem;
        border: 2px solid #e0e0e0;
        background: white;
        border-radius: 0.5rem;
        cursor: pointer;
        font-size: 0.9em;
        font-weight: 500;
        color: #7f8c8d;
        transition: all 0.2s ease;
    }

    .duration-btn:hover {
        border-color: #3498db;
        color: #3498db;
    }

    .duration-btn.active {
        background: #3498db;
        border-color: #3498db;
        color: white;
    }

    .runs-container {
        background: #f9f9f9;
        border-radius: 8px;
        padding: 1.5rem;
    }

    .card-container {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
        margin-top: 1rem;
    }

    .card {
        border: 1px solid #ccc;
        border-radius: 8px;
        padding: 1rem;
        min-width: 400px;
        flex-grow: 1;
        flex-basis: 0;
    }

    .run-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .run-item {
        border-bottom: 1px solid #eee;
        padding-bottom: 1rem;
    }

    .run-item:last-child {
        border-bottom: none;
        padding-bottom: 0;
    }

    .run-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 0.75rem;
        gap: 1rem;
    }

    .run-header strong {
        font-size: 0.95em;
        color: #2c3e50;
        display: block;
        margin-bottom: 0.3rem;
    }

    .run-output {
        font-size: 0.85em;
        font-weight: 600;
        color: #27ae60;
        display: block;
    }

    .run-date {
        font-size: 0.85em;
        color: #7f8c8d;
        white-space: nowrap;
        flex-shrink: 0;
    }

    .run-badges {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
    }

    .badge {
        display: inline-block;
        padding: 0.35rem 0.75rem;
        background: #ecf0f1;
        border-radius: 1rem;
        font-size: 0.8em;
        color: #34495e;
        font-weight: 500;
    }
</style>
