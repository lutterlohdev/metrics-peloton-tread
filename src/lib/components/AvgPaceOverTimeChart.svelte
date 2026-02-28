<script>
    import { onMount, onDestroy, tick } from 'svelte';
    import { avgPaceOverTime } from '$lib/store.js';

    let canvas;
    let chart = null;
    let ChartCtor = null;
    let chartReady = false;

    onMount(async () => {
        try {
            console.info('AvgPaceOverTimeChart: onMount start');
            // Use the auto bundle to ensure built-in registration of components
            await import('chart.js/auto');
            console.info('AvgPaceOverTimeChart: imported chart.js/auto');
            const ChartModule = await import('chart.js');
            console.info('AvgPaceOverTimeChart: imported chart.js');
            // defensively obtain the Chart constructor
            ChartCtor = ChartModule.Chart ?? ChartModule.default ?? ChartModule;

            // import the date adapter via its package entrypoint
            await import('chartjs-adapter-date-fns');
            console.info('AvgPaceOverTimeChart: imported adapter');

            chartReady = true;
            console.info('AvgPaceOverTimeChart: chartReady=true');
            // wait for DOM bindings (canvas) before creating chart
            await tick();
            console.info('AvgPaceOverTimeChart: after tick, canvas bound?', !!canvas);
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

    $: data = $avgPaceOverTime ?? { datasets: [] };
    $: console.info('AvgPaceOverTimeChart: reactive data update', data.datasets?.length ?? 0);

    // re-create/update the chart whenever data or readiness changes
    $: if (chartReady && canvas && data) {
        createOrUpdateChart();
    }

    // compute simple trend (first->last) for each dataset: 'up' | 'down' | 'flat'
    // note: for pace, 'down' is better (faster), 'up' is worse (slower)
    $: trends = (data?.datasets || []).map(ds => {
        const pts = ds.data || [];
        if (!pts || pts.length < 2) return { label: ds.label, trend: 'flat' };
        const first = pts[0].y;
        const last = pts[pts.length - 1].y;
        if (last > first) return { label: ds.label, trend: 'up' };
        if (last < first) return { label: ds.label, trend: 'down' };
        return { label: ds.label, trend: 'flat' };
    });

    // compute average pace for each dataset within the selected date range
    $: averagePaces = (data?.datasets || []).map(ds => {
        const pts = ds.data || [];
        if (!pts || pts.length === 0) return { label: ds.label, avgPace: null };
        const sum = pts.reduce((acc, p) => acc + p.y, 0);
        const avg = sum / pts.length;
        return { label: ds.label, avgPace: avg.toFixed(2) };
    });

    function createOrUpdateChart() {
        console.info('AvgPaceOverTimeChart: createOrUpdateChart called; canvas?', !!canvas, 'chartReady?', chartReady);
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
            console.info('AvgPaceOverTimeChart: creating new Chart instance, datasets:', data.datasets.length);
            chart = new ChartCtor(ctx, {
                type: 'line',
                data: { datasets: data.datasets },
                options,
            });
        }
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Average Pace Over Time (min/mi)',
            },
        },
        scales: {
            x: {
                type: 'time',
            },
            y: {
                beginAtZero: false,
                ticks: {
                    callback: function(value) {
                        return value.toFixed(2);
                    },
                    stepSize: 0.5,
                },
            },
        },
    };
</script>

{#if !chartReady}
    <div style="height: 80vh; display:flex; align-items:center; justify-content:center;">
        <p>Loading chart...</p>
    </div>
{:else}
    {#if !data || !data.datasets || data.datasets.length === 0}
        <div style="height: 80vh; display:flex; align-items:center; justify-content:center;">
            <p>No data to display. Upload a CSV to see charts.</p>
        </div>
    {:else}
        <div style="height: 80vh">
            <canvas bind:this={canvas} style="width:100%; height:100%;"></canvas>
        </div>
            <div style="margin-top: 0.5rem; display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center;">
                {#each trends as t}
                    <div style="display:flex;align-items:center;gap:0.4rem;padding:0.25rem 0.5rem;border-radius:6px;background:#f7f7f7;border:1px solid #eee;">
                        <strong>{t.label}</strong>
                        {#if t.trend === 'up'}
                            <span style="color:#c0392b;font-weight:bold;">▲ (slower)</span>
                        {:else if t.trend === 'down'}
                            <span style="color:green;font-weight:bold;">▼ (faster)</span>
                        {:else}
                            <span style="color:#7f8c8d;">— (flat)</span>
                        {/if}
                    </div>
                {/each}
            </div>

            <div style="margin-top: 1rem; padding:1rem; background:#f9f9f9; border-radius:8px; border:1px solid #ddd;">
                <h3 style="margin-top:0;">Average Pace (within selected date range)</h3>
                <div style="display:flex; gap:1rem; flex-wrap:wrap;">
                    {#each averagePaces as ap}
                        {#if ap.avgPace !== null}
                            <div style="padding:0.5rem 1rem; background:white; border-radius:6px; border:1px solid #ccc;">
                                <strong>{ap.label}</strong>: <span style="font-size:1.1em; color:#2c3e50;">{ap.avgPace} min/mi</span>
                            </div>
                        {/if}
                    {/each}
                </div>
            </div>
    {/if}
{/if}
