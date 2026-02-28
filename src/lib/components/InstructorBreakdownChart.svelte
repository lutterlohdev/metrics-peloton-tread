<script>
    import { onMount, onDestroy, tick } from 'svelte';
    import { instructorBreakdown } from '$lib/store.js';

    let canvas;
    let chart = null;
    let ChartCtor = null;
    let chartReady = false;

    onMount(async () => {
        try {
            console.info('InstructorBreakdownChart: onMount start');
            // Use the auto bundle to ensure built-in registration of components
            await import('chart.js/auto');
            console.info('InstructorBreakdownChart: imported chart.js/auto');
            const ChartModule = await import('chart.js');
            console.info('InstructorBreakdownChart: imported chart.js');
            // defensively obtain the Chart constructor
            ChartCtor = ChartModule.Chart ?? ChartModule.default ?? ChartModule;

            chartReady = true;
            console.info('InstructorBreakdownChart: chartReady=true');
            // wait for DOM bindings (canvas) before creating chart
            await tick();
            console.info('InstructorBreakdownChart: after tick, canvas bound?', !!canvas);
            createOrUpdateChart();
        } catch (err) {
            console.error('Failed to load Chart.js:', err);
        }
    });

    onDestroy(() => {
        if (chart) {
            chart.destroy();
            chart = null;
        }
    });

    $: data = $instructorBreakdown ?? { labels: [], datasets: [] };
    $: console.info('InstructorBreakdownChart: reactive data update', data.labels?.length ?? 0);

    // re-create/update the chart whenever data or readiness changes
    $: if (chartReady && canvas && data) {
        createOrUpdateChart();
    }

    function createOrUpdateChart() {
        console.info('InstructorBreakdownChart: createOrUpdateChart called; canvas?', !!canvas, 'chartReady?', chartReady);
        if (!canvas) return;
        if (!data || !data.datasets || data.datasets.length === 0 || !data.labels || data.labels.length === 0) {
            if (chart) {
                chart.destroy();
                chart = null;
            }
            return;
        }

        const ctx = canvas.getContext('2d');
        if (chart) {
            chart.data = { labels: data.labels, datasets: data.datasets };
            chart.options = options;
            chart.update();
        } else {
            if (!ChartCtor) return;
            console.info('InstructorBreakdownChart: creating new Chart instance, instructors:', data.labels.length);
            chart = new ChartCtor(ctx, {
                type: 'doughnut',
                data: { labels: data.labels, datasets: data.datasets },
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
                text: 'Classes by Instructor (within selected date range)',
            },
            legend: {
                position: 'bottom',
                labels: {
                    padding: 15,
                    font: {
                        size: 12,
                    },
                },
            },
        },
    };
</script>

{#if !chartReady}
    <div style="height: 50vh; display:flex; align-items:center; justify-content:center;">
        <p>Loading chart...</p>
    </div>
{:else}
    {#if !data || !data.datasets || data.datasets.length === 0 || !data.labels || data.labels.length === 0}
        <div style="height: 50vh; display:flex; align-items:center; justify-content:center;">
            <p>No data to display. Upload a CSV to see charts.</p>
        </div>
    {:else}
        <div style="height: 50vh">
            <canvas bind:this={canvas} style="width:100%; height:100%;"></canvas>
        </div>
    {/if}
{/if}
