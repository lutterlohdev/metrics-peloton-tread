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

	function updateFilter() {
		dateFilter.set({
			start: startDate,
			end: endDate,
		});
	}

	onMount(() => {
		updateFilter();
	});

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

<h2 style="margin-top: 2rem; margin-bottom: 1rem;">Top 5 Runs by Duration</h2>

<div class="card-container">
    {#each Object.entries($topFiveRunsByLength) as [length, runs]}
        <div class="card">
            <h2>{length} Minute Runs</h2>
            <div class="run-list">
                {#each runs as run}
                    <div class="run-item">
                        <div class="run-header">
                            <strong>{run.Title}</strong>
                            <span class="run-output">{run['Total Output']} kJ</span>
                            <span class="run-date">{formatFriendlyDate(run['Workout Timestamp'])}</span>
                        </div>
                        <div class="run-details">
                            <div class="detail-row">
                                <span class="label">Instructor:</span>
                                <span class="value">{run['Instructor Name']}</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Total Output:</span>
                                <span class="value">{run['Total Output']} kJ</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Distance:</span>
                                <span class="value">{run['Distance (mi)']} mi</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Avg Pace:</span>
                                <span class="value">{parseFloat(run['Avg. Pace (min/mi)']).toFixed(2)} min/mi</span>
                            </div>
                            <div class="detail-row">
                                <span class="label">Type:</span>
                                <span class="value">{run.Type}</span>
                            </div>
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    {/each}
</div>

<style>
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
        align-items: center;
        margin-bottom: 0.5rem;
    }

    .run-header strong {
        flex: 1;
        font-size: 0.95em;
    }

    .run-output {
        font-size: 0.9em;
        font-weight: 600;
        color: #27ae60;
        margin: 0 0.75rem;
        white-space: nowrap;
    }

    .run-date {
        font-size: 0.85em;
        color: #7f8c8d;
        white-space: nowrap;
        margin-left: 0.5rem;
    }

    .run-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
        font-size: 0.9em;
    }

    .detail-row {
        display: flex;
        flex-direction: column;
    }

    .label {
        font-weight: 600;
        color: #34495e;
        font-size: 0.85em;
    }

    .value {
        color: #2c3e50;
        margin-top: 0.1rem;
    }
</style>
