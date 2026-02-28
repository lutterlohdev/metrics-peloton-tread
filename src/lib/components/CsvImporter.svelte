<script>
    import Papa from 'papaparse';
    import { workoutData, runningWorkouts } from '$lib/store.js';

    let dataCount = 0;

    function handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        Papa.parse(file, {
            header: true,
            complete: (results) => {
                const cleaned = results.data.filter(row =>
                    Object.values(row).some(v => v !== null && v !== undefined && v.toString().trim() !== '')
                );
                workoutData.set(cleaned);
                console.log('CSV data stored (cleaned):', cleaned);
            },
            error: (error) => {
                console.error('Error parsing CSV:', error);
            }
        });
    }

    function clearData() {
        if (confirm('Are you sure you want to clear all workout data? This cannot be undone.')) {
            workoutData.set([]);
            console.log('Workout data cleared');
        }
    }

    workoutData.subscribe(value => {
        dataCount = value.length;
        if (value.length > 0) {
            console.log('All workout data from store:', value);
        }
    });

    runningWorkouts.subscribe(value => {
        if (value.length > 0) {
            console.log('Running workouts from derived store:', value);
        }
    });
</script>

<div style="padding: 1rem; background: #f9f9f9; border-radius: 8px; border: 1px solid #ddd; margin-bottom: 1rem;">
    <div style="margin-bottom: 1rem;">
        <label for="csv-importer" style="display: block; margin-bottom: 0.5rem;"><strong>Import Peloton Workout CSV:</strong></label>
        <input type="file" id="csv-importer" accept=".csv" on:change={handleFileSelect} />
        <p style="margin: 0.5rem 0 0 0; font-size: 0.9em; color: #666;">
            {dataCount > 0 ? `${dataCount} workouts loaded` : 'No data loaded yet'}
        </p>
    </div>

    {#if dataCount > 0}
        <div style="display: flex; gap: 0.5rem;">
            <button on:click={clearData} style="padding: 0.5rem 1rem; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em;">
                Clear Data
            </button>
            <label for="csv-importer-replace" style="padding: 0.5rem 1rem; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 0.9em; display: inline-block;">
                Replace Data
            </label>
            <input type="file" id="csv-importer-replace" accept=".csv" on:change={handleFileSelect} style="display: none;" />
        </div>
    {/if}
</div>
