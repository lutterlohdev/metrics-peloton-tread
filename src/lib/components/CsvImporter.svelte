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
				const cleaned = results.data.filter((row) =>
					Object.values(row).some(
						(v) => v !== null && v !== undefined && v.toString().trim() !== ''
					)
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

	workoutData.subscribe((value) => {
		dataCount = value.length;
		if (value.length > 0) {
			console.log('All workout data from store:', value);
		}
	});

	runningWorkouts.subscribe((value) => {
		if (value.length > 0) {
			console.log('Running workouts from derived store:', value);
		}
	});
</script>

<div class="glass-panel importer-card">
	<div class="header">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline
				points="17 8 12 3 7 8"
			/><line x1="12" y1="3" x2="12" y2="15" /></svg
		>
		<h3>Import Workout Data</h3>
	</div>

	<div class="upload-area">
		<label for="csv-importer" class="primary-btn">
			Select CSV File
			<input
				type="file"
				id="csv-importer"
				accept=".csv"
				on:change={handleFileSelect}
				style="display: none;"
			/>
		</label>
		<p class="status-text" class:has-data={dataCount > 0}>
			{dataCount > 0
				? `✅ ${dataCount} workouts loaded`
				: 'No data loaded yet. Export from Peloton and upload here.'}
		</p>
	</div>

	{#if dataCount > 0}
		<div class="action-footer">
			<button on:click={clearData} class="danger-btn"> Clear Data </button>
			<label for="csv-importer-replace" class="secondary-btn">
				Replace Data
				<input
					type="file"
					id="csv-importer-replace"
					accept=".csv"
					on:change={handleFileSelect}
					style="display: none;"
				/>
			</label>
		</div>
	{/if}
</div>

<style>
	.importer-card {
		padding: 1.5rem;
		margin-bottom: 2rem;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}
	.header {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		color: var(--text-primary);
	}
	.header h3 {
		margin: 0;
		font-weight: 600;
		font-size: 1.25rem;
	}
	.header svg {
		color: var(--accent-primary);
	}
	.upload-area {
		display: flex;
		align-items: center;
		gap: 1.5rem;
		padding: 1.5rem;
		border: 2px dashed var(--border-color);
		border-radius: var(--border-radius-base);
		background: rgba(0, 0, 0, 0.2);
		transition: border-color 0.2s;
		flex-wrap: wrap;
	}
	.upload-area:hover {
		border-color: var(--accent-hover);
	}
	.primary-btn {
		background: var(--accent-primary);
		color: white;
		padding: 0.75rem 1.5rem;
		border-radius: 8px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
		display: inline-block;
		border: none;
	}
	.primary-btn:hover {
		background: var(--accent-hover);
		transform: translateY(-1px);
		box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
	}
	.status-text {
		margin: 0;
		font-size: 0.95rem;
		color: var(--text-muted);
	}
	.status-text.has-data {
		color: var(--accent-success);
		font-weight: 500;
	}
	.action-footer {
		display: flex;
		gap: 1rem;
		padding-top: 1rem;
		border-top: 1px solid var(--border-color);
	}
	.danger-btn,
	.secondary-btn {
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-size: 0.9rem;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s;
		border: 1px solid transparent;
		display: inline-block;
	}
	.danger-btn {
		background: rgba(239, 68, 68, 0.1);
		color: var(--accent-danger);
		border-color: rgba(239, 68, 68, 0.2);
	}
	.danger-btn:hover {
		background: var(--accent-danger);
		color: white;
	}
	.secondary-btn {
		background: rgba(255, 255, 255, 0.05);
		color: var(--text-secondary);
		border-color: var(--border-color);
	}
	.secondary-btn:hover {
		background: rgba(255, 255, 255, 0.1);
		color: var(--text-primary);
	}

	@media (max-width: 768px) {
		.header {
			justify-content: center;
		}
		.upload-area {
			flex-direction: column;
			justify-content: center;
			text-align: center;
			gap: 1rem;
		}
		.action-footer {
			justify-content: center;
			flex-wrap: wrap;
		}
	}
</style>
