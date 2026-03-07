import { writable, derived } from 'svelte/store';
import { groupWorkoutsBy, sortWorkoutsBy, parseWorkoutTimestamp, parsePaceMinutes } from './utils';

// Create a writable store that persists to localStorage
function createPersistentStore(key, initialValue) {
	const storedData = typeof window !== 'undefined' && localStorage.getItem(key);
	const data = storedData ? JSON.parse(storedData) : initialValue;
	const store = writable(data);

	if (typeof window !== 'undefined') {
		store.subscribe((value) => {
			localStorage.setItem(key, JSON.stringify(value));
		});
	}

	return store;
}

export const workoutData = createPersistentStore('peloton_workout_data', []);

export const runningWorkouts = derived(workoutData, ($workoutData) =>
	$workoutData.filter((workout) => workout['Fitness Discipline'] === 'Running')
);

const validRunLengths = [5, 10, 15, 20, 30, 45, 60, 90, 120];

export const dateFilter = writable({
	start: null,
	end: null
});

export const runTypeFilter = writable('All');

export const availableRunTypes = derived(runningWorkouts, ($runningWorkouts) => {
	const types = new Set($runningWorkouts.map((w) => w.Type).filter(Boolean));
	return ['All', ...Array.from(types).sort()];
});

export const topFiveRunsByLength = derived(
	[runningWorkouts, dateFilter, runTypeFilter],
	([$runningWorkouts, $dateFilter, $runTypeFilter]) => {
		let filteredWorkouts = $runningWorkouts;

		if ($dateFilter.start && $dateFilter.end) {
			const startDate = new Date($dateFilter.start);
			const endDate = new Date($dateFilter.end);

			filteredWorkouts = filteredWorkouts.filter((workout) => {
				const workoutDate = parseWorkoutTimestamp(workout['Workout Timestamp']);
				return workoutDate >= startDate && workoutDate <= endDate;
			});
		}

		if ($runTypeFilter !== 'All') {
			filteredWorkouts = filteredWorkouts.filter((workout) => workout.Type === $runTypeFilter);
		}

		const groupedByLength = groupWorkoutsBy(filteredWorkouts, 'Length (minutes)');
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

			filteredWorkouts = $runningWorkouts.filter((workout) => {
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
					.map((workout) => {
						const ts = parseWorkoutTimestamp(workout['Workout Timestamp']);
						const output = parseInt(workout['Total Output']);
						if (!ts || Number.isNaN(output)) {
							return null;
						}
						return {
							x: ts.getTime(),
							y: output
						};
					})
					.filter((p) => p !== null)
					.sort((a, b) => a.x - b.x);

				if (points.length > 0) {
					datasets.push({
						label: `${length} min`,
						data: points,
						borderColor: color,
						backgroundColor: color
					});
				}
			}
		}
		return { datasets };
	}
);

export const avgPaceOverTime = derived(
	[runningWorkouts, dateFilter],
	([$runningWorkouts, $dateFilter]) => {
		let filteredWorkouts = $runningWorkouts;

		if ($dateFilter.start && $dateFilter.end) {
			const startDate = new Date($dateFilter.start);
			const endDate = new Date($dateFilter.end);

			filteredWorkouts = $runningWorkouts.filter((workout) => {
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
					.map((workout) => {
						const ts = parseWorkoutTimestamp(workout['Workout Timestamp']);
						const pace = parsePaceMinutes(workout['Avg. Pace (min/mi)']);
						if (!ts || pace === null) {
							return null;
						}
						return {
							x: ts.getTime(),
							y: pace
						};
					})
					.filter((p) => p !== null)
					.sort((a, b) => a.x - b.x);

				if (points.length > 0) {
					datasets.push({
						label: `${length} min`,
						data: points,
						borderColor: color,
						backgroundColor: color
					});
				}
			}
		}
		return { datasets };
	}
);

export const instructorBreakdown = derived(
	[runningWorkouts, dateFilter],
	([$runningWorkouts, $dateFilter]) => {
		let filteredWorkouts = $runningWorkouts;

		if ($dateFilter.start && $dateFilter.end) {
			const startDate = new Date($dateFilter.start);
			const endDate = new Date($dateFilter.end);

			filteredWorkouts = $runningWorkouts.filter((workout) => {
				const workoutDate = parseWorkoutTimestamp(workout['Workout Timestamp']);
				return workoutDate >= startDate && workoutDate <= endDate;
			});
		}

		// count workouts by instructor
		const instructorCounts = {};
		filteredWorkouts.forEach((workout) => {
			const instructor = workout['Instructor Name'] || 'Unknown';
			instructorCounts[instructor] = (instructorCounts[instructor] || 0) + 1;
		});

		// convert to arrays for chart
		const labels = Object.keys(instructorCounts);
		const data = Object.values(instructorCounts);

		// generate distinct colors for each instructor
		const backgroundColor = labels.map(() => {
			const hue = Math.random() * 360;
			const saturation = 60 + Math.random() * 20;
			const lightness = 50 + Math.random() * 20;
			return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
		});

		return {
			labels,
			datasets: [
				{
					label: 'Classes by Instructor',
					data,
					backgroundColor,
					borderColor: '#fff',
					borderWidth: 2
				}
			]
		};
	}
);
export const averagePaceMetrics = derived(
	[runningWorkouts, dateFilter],
	([$runningWorkouts, $dateFilter]) => {
		let filteredWorkouts = $runningWorkouts;

		if ($dateFilter.start && $dateFilter.end) {
			const startDate = new Date($dateFilter.start);
			const endDate = new Date($dateFilter.end);

			filteredWorkouts = $runningWorkouts.filter((workout) => {
				const workoutDate = parseWorkoutTimestamp(workout['Workout Timestamp']);
				return workoutDate >= startDate && workoutDate <= endDate;
			});
		}

		const groupedByLength = groupWorkoutsBy(filteredWorkouts, 'Length (minutes)');

		const metrics = {};
		for (const length in groupedByLength) {
			if (validRunLengths.includes(parseInt(length))) {
				const workouts = groupedByLength[length];

				// Calculate average pace from distance and duration for each workout
				const paces = workouts
					.map((w) => {
						const distance = parseFloat(w['Distance (mi)']);
						const duration = parseInt(w['Length (minutes)'], 10);
						if (!distance || !duration || distance === 0) return null;
						return duration / distance; // minutes per mile
					})
					.filter((p) => p !== null);

				if (paces.length > 0) {
					const avgPace = paces.reduce((a, b) => a + b, 0) / paces.length;
					const minutes = Math.floor(avgPace);
					const seconds = Math.round((avgPace - minutes) * 60);
					metrics[length] = {
						avgPace: avgPace.toFixed(2),
						formatted: `${minutes}:${seconds.toString().padStart(2, '0')}`
					};
				}
			}
		}

		return metrics;
	}
);
