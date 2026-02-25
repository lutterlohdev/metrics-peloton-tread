<script>
    import { onMount, onDestroy, tick } from 'svelte';
    import { outputOverTime, dateFilter } from '$lib/store.js';

    let canvas;
    let chart = null;
    let ChartCtor = null;
    let chartReady = false;

    // default to last 3 months
    function formatDate(d) {
        return d.toISOString().slice(0, 10);
    }

    const today = new Date();
    const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 3, today.getDate());

    let startDate = formatDate(threeMonthsAgo);
    let endDate = formatDate(today);

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
            // initialize the date filter to the default range
            updateFilter();
            console.info('OutputOverTimeChart: dateFilter initialized', startDate, endDate);
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

    function updateFilter() {
        dateFilter.set({
            start: startDate,
            end: endDate,
        });
    }

    $: data = $outputOverTime ?? { datasets: [] };
    $: console.info('OutputOverTimeChart: reactive data update', data.datasets?.length ?? 0);

    // re-create/update the chart whenever data or readiness changes
    $: if (chartReady && canvas && data) {
        createOrUpdateChart();
    }

    // compute simple trend (first->last) for each dataset: 'up' | 'down' | 'flat'
    $: trends = (data?.datasets || []).map(ds => {
        const pts = ds.data || [];
        if (!pts || pts.length < 2) return { label: ds.label, trend: 'flat' };
        const first = pts[0].y;
        const last = pts[pts.length - 1].y;
        if (last > first) return { label: ds.label, trend: 'up' };
        if (last < first) return { label: ds.label, trend: 'down' };
        return { label: ds.label, trend: 'flat' };
    });

    function createOrUpdateChart() {
        console.info('OutputOverTimeChart: createOrUpdateChart called; canvas?', !!canvas, 'chartReady?', chartReady);
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
            console.info('OutputOverTimeChart: creating new Chart instance, datasets:', data.datasets.length);
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
                text: 'Output Over Time',
            },
        },
        scales: {
            x: {
                type: 'time',
            },
        },
    };
</script>

<div>
    <label for="start-date">Start Date:</label>
    <input type="date" id="start-date" bind:value={startDate} on:change={updateFilter} />
    <label for="end-date">End Date:</label>
    <input type="date" id="end-date" bind:value={endDate} on:change={updateFilter} />
</div>

{#if !chartReady}
    <div style="height: 400px; display:flex; align-items:center; justify-content:center;">
        <p>Loading chart...</p>
    </div>
{:else}
    {#if !data || !data.datasets || data.datasets.length === 0}
        <div style="height: 400px; display:flex; align-items:center; justify-content:center;">
            <p>No data to display. Upload a CSV to see charts.</p>
        </div>
    {:else}
        <div style="height: 400px">
            <canvas bind:this={canvas} style="width:100%; height:100%;"></canvas>
        </div>
            <div style="margin-top: 0.5rem; display:flex; gap:0.75rem; flex-wrap:wrap; align-items:center;">
                {#each trends as t}
                    <div style="display:flex;align-items:center;gap:0.4rem;padding:0.25rem 0.5rem;border-radius:6px;background:#f7f7f7;border:1px solid #eee;">
                        <strong>{t.label}</strong>
                        {#if t.trend === 'up'}
                            <span style="color:green;font-weight:bold;">▲</span>
                        {:else if t.trend === 'down'}
                            <span style="color:#c0392b;font-weight:bold;">▼</span>
                        {:else}
                            <span style="color:#7f8c8d;">—</span>
                        {/if}
                    </div>
                {/each}
            </div>
    {/if}
{/if}
