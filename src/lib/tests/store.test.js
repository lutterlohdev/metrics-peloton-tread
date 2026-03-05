import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import {
    workoutData,
    runningWorkouts,
    topFiveRunsByLength,
    dateFilter,
    outputOverTime,
    avgPaceOverTime,
    instructorBreakdown,
    averagePaceMetrics
} from '../store.js';

describe('store derived values', () => {
    const mockData = [
        {
            'Fitness Discipline': 'Running',
            'Workout Timestamp': '2023-01-01 09:00 (EST)',
            'Length (minutes)': '20',
            'Total Output': '150',
            'Instructor Name': 'Becs Gentry',
            'Distance (mi)': '2.0',
            'Avg. Pace (min/mi)': '10:00',
        },
        {
            'Fitness Discipline': 'Cycling',
            'Workout Timestamp': '2023-01-02 10:00 (EST)',
            'Length (minutes)': '30',
            'Total Output': '250',
        },
        {
            'Fitness Discipline': 'Running',
            'Workout Timestamp': '2023-01-03 08:00 (EST)',
            'Length (minutes)': '20',
            'Total Output': '160',
            'Instructor Name': 'Matt Wilpers',
            'Distance (mi)': '2.5',
            'Avg. Pace (min/mi)': '8:00',
        },
        {
            'Fitness Discipline': 'Running',
            'Workout Timestamp': '2023-01-04 07:00 (EST)',
            'Length (minutes)': '45',
            'Total Output': '350',
            'Instructor Name': 'Becs Gentry',
            'Distance (mi)': '5.0',
            'Avg. Pace (min/mi)': '9:00',
        }
    ];

    beforeEach(() => {
        workoutData.set(mockData);
        dateFilter.set({ start: null, end: null });
    });

    describe('runningWorkouts', () => {
        it('filters only running workouts', () => {
            const runs = get(runningWorkouts);
            expect(runs.length).toBe(3);
            expect(runs.every(r => r['Fitness Discipline'] === 'Running')).toBe(true);
        });
    });

    describe('topFiveRunsByLength', () => {
        it('groups by length and sorts by total output descending', () => {
            const topRuns = get(topFiveRunsByLength);
            expect(topRuns['20']).toBeDefined();
            expect(topRuns['20'].length).toBe(2);
            expect(topRuns['20'][0]['Total Output']).toBe('160'); // Highest output first
            expect(topRuns['20'][1]['Total Output']).toBe('150');
            expect(topRuns['45']).toBeDefined();
            expect(topRuns['45'].length).toBe(1);
        });
    });

    describe('date filters on derivations', () => {
        beforeEach(() => {
            // Filter to include only Jan 1 and Jan 2 (Jan 1 is Running, Jan 2 is Cycling - ignored)
            dateFilter.set({ start: '2022-12-31', end: '2023-01-02' });
        });

        it('outputOverTime respects date filter', () => {
            const { datasets } = get(outputOverTime);
            // Only 20 min run on Jan 1 is in range
            expect(datasets.length).toBe(1);
            expect(datasets[0].label).toBe('20 min');
            expect(datasets[0].data.length).toBe(1);
            expect(datasets[0].data[0].y).toBe(150); // total output
        });

        it('avgPaceOverTime respects date filter', () => {
            const { datasets } = get(avgPaceOverTime);
            expect(datasets.length).toBe(1);
            expect(datasets[0].label).toBe('20 min');
            expect(datasets[0].data.length).toBe(1);
            expect(datasets[0].data[0].y).toBe(10); // 10 min/mi
        });

        it('instructorBreakdown respects date filter', () => {
            const breakdown = get(instructorBreakdown);
            expect(breakdown.labels).toEqual(['Becs Gentry']);
            expect(breakdown.datasets[0].data).toEqual([1]);
        });

        it('averagePaceMetrics respects date filter', () => {
            const metrics = get(averagePaceMetrics);
            expect(metrics['20']).toBeDefined();
            expect(metrics['20'].avgPace).toBe('10.00'); // distance 2.0, time 20 => 10 min/mi
            expect(metrics['20'].formatted).toBe('10:00');
            expect(metrics['45']).toBeUndefined();
        });
    });

    describe('derivations without date filter', () => {
        it('outputOverTime groups by length and sorts by date', () => {
            const { datasets } = get(outputOverTime);
            const dataset20 = datasets.find(d => d.label === '20 min');
            expect(dataset20.data.length).toBe(2);
            expect(dataset20.data[0].y).toBe(150);
            expect(dataset20.data[1].y).toBe(160);
        });

        it('avgPaceOverTime parses paces correctly', () => {
            const { datasets } = get(avgPaceOverTime);
            const dataset20 = datasets.find(d => d.label === '20 min');
            expect(dataset20.data.length).toBe(2);
            expect(dataset20.data[0].y).toBe(10); // 10:00
            expect(dataset20.data[1].y).toBe(8);  // 8:00
        });

        it('instructorBreakdown groups and counts all instructors', () => {
            const breakdown = get(instructorBreakdown);
            expect(breakdown.labels.sort()).toEqual(['Becs Gentry', 'Matt Wilpers']);
            // Becs Gentry has 2, Matt Wilpers has 1
            const becsIndex = breakdown.labels.indexOf('Becs Gentry');
            const mattIndex = breakdown.labels.indexOf('Matt Wilpers');
            expect(breakdown.datasets[0].data[becsIndex]).toBe(2);
            expect(breakdown.datasets[0].data[mattIndex]).toBe(1);
        });

        it('averagePaceMetrics calculates across all workouts in length', () => {
            const metrics = get(averagePaceMetrics);
            // 20 min runs:
            // run 1: dist 2.0, dur 20 => pace 10
            // run 2: dist 2.5, dur 20 => pace 8
            // average pace = (10 + 8) / 2 = 9
            expect(metrics['20']).toBeDefined();
            expect(metrics['20'].avgPace).toBe('9.00');
            expect(metrics['20'].formatted).toBe('9:00');

            // 45 min run:
            // dist 5.0, dur 45 => pace 9
            expect(metrics['45']).toBeDefined();
            expect(metrics['45'].avgPace).toBe('9.00');
            expect(metrics['45'].formatted).toBe('9:00');
        });
    });
});
