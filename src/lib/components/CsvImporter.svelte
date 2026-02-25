<script>
    import Papa from 'papaparse';
    import { workoutData, runningWorkouts } from '$lib/store.js';

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

    workoutData.subscribe(value => {
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

<div>
    <label for="csv-importer">Import Peloton Workout CSV:</label>
    <input type="file" id="csv-importer" accept=".csv" on:change={handleFileSelect} />
</div>
