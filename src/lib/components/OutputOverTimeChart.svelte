<script>
	import { onMount, onDestroy, tick } from 'svelte';
	import { outputOverTime } from '$lib/store.js';

	let canvas;
	let chart = null;
	let ChartCtor = null;
	let chartReady = false;

	onMount(async () => {
		try {
			console.info('OutputOverTimeChart: onMount start');
			// Use the auto bundle to ensure built-in registration of components
			await import('chart.js/auto');
			console.info('OutputOverTimeChart: imported chart.js/auto');
			const ChartModule = await import('chart.js');
			console.info('OutputOverTimeChart: imported chart.js');
			// defensively obtain the Chart constructor
			ChartCtor = ChartModule.Chart ?? ChartModule.default ?? ChartModule;

			// import the date adapter via its package entrypoint
			await import('chartjs-adapter-date-fns');
			console.info('OutputOverTimeChart: imported adapter');

			chartReady = true;
			console.info('OutputOverTimeChart: chartReady=true');
			// wait for DOM bindings (canvas) before creating chart
			await tick();
			console.info('OutputOverTimeChart: after tick, canvas bound?', !!canvas);
			createOrUpdateChart();
		} catch (err) {
			console.error('Failed to load Chart.js or adapter:', err);
		}
	});

	onDestroy(() => {
		if (chart) {
			chart.destroy();
			chart = null;
		}
	});

	$: data = $outputOverTime ?? { datasets: [] };
	$: console.info('OutputOverTimeChart: reactive data update', data.datasets?.length ?? 0);

	// re-create/update the chart whenever data or readiness changes
	$: if (chartReady && canvas && data) {
		createOrUpdateChart();
	}

	// compute simple trend (first->last) for each dataset: 'up' | 'down' | 'flat'
	// note: for output, 'up' is better (increasing output), 'down' is worse (decreasing)
	$: trends = (data?.datasets || []).map((ds) => {
		const pts = ds.data || [];
		if (!pts || pts.length < 2) return { label: ds.label, trend: 'flat' };
		const first = pts[0].y;
		const last = pts[pts.length - 1].y;
		if (last > first) return { label: ds.label, trend: 'up' };
		if (last < first) return { label: ds.label, trend: 'down' };
		return { label: ds.label, trend: 'flat' };
	});

	function createOrUpdateChart() {
		console.info(
			'OutputOverTimeChart: createOrUpdateChart called; canvas?',
			!!canvas,
			'chartReady?',
			chartReady
		);
		if (!canvas) return;
		if (!data || !data.datasets || data.datasets.length === 0) {
			if (chart) {
				chart.destroy();
				chart = null;
			}
			return;
		}

		const ctx = canvas.getContext('2d');
		if (chart) {
			chart.data = { datasets: data.datasets };
			chart.options = options;
			chart.update();
		} else {
			if (!ChartCtor) return;
			console.info(
				'OutputOverTimeChart: creating new Chart instance, datasets:',
				data.datasets.length
			);
			chart = new ChartCtor(ctx, {
				type: 'line',
				data: { datasets: data.datasets },
				options
			});
		}
	}

	const options = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			title: {
				display: true,
				text: 'Output Over Time',
				color: '#f8fafc',
				font: { size: 16, weight: '600', family: "'Inter', sans-serif" }
			},
			legend: {
				labels: { color: '#e2e8f0', font: { family: "'Inter', sans-serif" } }
			}
		},
		scales: {
			x: {
				type: 'time',
				grid: { color: 'rgba(255, 255, 255, 0.1)' },
				ticks: { color: '#94a3b8', font: { family: "'Inter', sans-serif" } }
			},
			y: {
				grid: { color: 'rgba(255, 255, 255, 0.1)' },
				ticks: { color: '#94a3b8', font: { family: "'Inter', sans-serif" } }
			}
		}
	};
</script>

{#if !chartReady}
	<div
		style="height: 80vh; display:flex; align-items:center; justify-content:center; color: var(--text-secondary);"
	>
		<p>Loading chart...</p>
	</div>
{:else if !data || !data.datasets || data.datasets.length === 0}
	<div
		style="height: 80vh; display:flex; align-items:center; justify-content:center; color: var(--text-secondary);"
	>
		<p>No data to display. Upload a CSV to see charts.</p>
	</div>
{:else}
	<div style="height: 80vh">
		<canvas bind:this={canvas} style="width:100%; height:100%;"></canvas>
	</div>
	<div
		style="margin-top: 1.5rem; display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center; justify-content:center;"
	>
		{#each trends as t}
			<div
				style="display:flex;align-items:center;gap:0.4rem;padding:0.4rem 0.8rem;border-radius:2rem;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);"
			>
				<strong style="color:var(--text-primary); font-size:0.9rem;">{t.label}</strong>
				{#if t.trend === 'up'}
					<span style="color:var(--accent-success);font-weight:600;font-size:0.9rem;"
						>▲ <small>improving</small></span
					>
				{:else if t.trend === 'down'}
					<span style="color:var(--accent-danger);font-weight:600;font-size:0.9rem;"
						>▼ <small>declining</small></span
					>
				{:else}
					<span style="color:var(--text-muted);font-size:0.9rem;">— <small>flat</small></span>
				{/if}
			</div>
		{/each}
	</div>
{/if}
