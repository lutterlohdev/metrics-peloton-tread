import { writable, derived } from 'svelte/store';
import { groupWorkoutsBy, sortWorkoutsBy, parseWorkoutTimestamp } from './utils';

export const workoutData = writable([]);

export const runningWorkouts = derived(
    workoutData,
    $workoutData => $workoutData.filter(workout => workout['Fitness Discipline'] === 'Running')
);

const validRunLengths = [5, 10, 15, 20, 30, 45, 60, 90, 120];

export const topFiveRunsByLength = derived(
    runningWorkouts,
    $runningWorkouts => {
        const groupedByLength = groupWorkoutsBy($runningWorkouts, 'Length (minutes)');
        const topRuns = {};

        for (const length in groupedByLength) {
            if (validRunLengths.includes(parseInt(length))) {
                const sorted = sortWorkoutsBy(groupedByLength[length], 'Total Output');
                topRuns[length] = sorted.slice(0, 5);
            }
        }

        return topRuns;
    }
);

export const dateFilter = writable({
    start: null,
    end: null,
});

function getRandomColor() {
    const r = Math.floor(Math.random() * 255);
    const g = Math.floor(Math.random() * 255);
    const b = Math.floor(Math.random() * 255);
    return `rgba(${r}, ${g}, ${b}, 0.5)`;
}


export const outputOverTime = derived(
    [runningWorkouts, dateFilter],
    ([$runningWorkouts, $dateFilter]) => {
        let filteredWorkouts = $runningWorkouts;

        if ($dateFilter.start && $dateFilter.end) {
            const startDate = new Date($dateFilter.start);
            const endDate = new Date($dateFilter.end);

            filteredWorkouts = $runningWorkouts.filter(workout => {
                const workoutDate = parseWorkoutTimestamp(workout['Workout Timestamp']);
                return workoutDate >= startDate && workoutDate <= endDate;
            });
        }

        const groupedByLength = groupWorkoutsBy(filteredWorkouts, 'Length (minutes)');

        const datasets = [];
        for (const length in groupedByLength) {
            if (validRunLengths.includes(parseInt(length))) {
                const workouts = groupedByLength[length];
                const color = getRandomColor();
                    const points = workouts
                        .map(workout => {
                            const ts = parseWorkoutTimestamp(workout['Workout Timestamp']);
                            const output = parseInt(workout['Total Output']);
                            if (!ts || Number.isNaN(output)) {
                                return null;
                            }
                            return {
                                x: ts.getTime(),
                                y: output,
                            };
                        })
                        .filter(p => p !== null)
                        .sort((a, b) => a.x - b.x);

                    if (points.length > 0) {
                        datasets.push({
                            label: `${length} min`,
                            data: points,
                            borderColor: color,
                            backgroundColor: color,
                        });
                    }
            }
        }
        return { datasets };
    }
);
