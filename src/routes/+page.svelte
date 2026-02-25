<script>
	import CsvImporter from '$lib/components/CsvImporter.svelte';
	import { topFiveRunsByLength } from '$lib/store.js';
	import { onMount } from 'svelte';
    import OutputOverTimeChart from '$lib/components/OutputOverTimeChart.svelte';

</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>

<CsvImporter />

<OutputOverTimeChart />

<div class="card-container">
    {#each Object.entries($topFiveRunsByLength) as [length, runs]}
        <div class="card">
            <h2>{length} Minute Runs</h2>
            <ul>
                {#each runs as run}
                    <li>
                        <strong>Total Output:</strong> {run['Total Output']}<br />
                        <strong>Class:</strong> {run.Title}<br />
                        <strong>Instructor:</strong> {run['Instructor Name']}
                    </li>
                {/each}
            </ul>
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

    ul {
        list-style-type: none;
        padding: 0;
    }

    li {
        margin-bottom: 0.5rem;
        border-bottom: 1px solid #eee;
        padding-bottom: 0.5rem;
    }
</style>
