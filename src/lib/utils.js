export function groupWorkoutsBy(workouts, key) {
	return workouts.reduce((acc, workout) => {
		const group = workout[key];
		if (!acc[group]) {
			acc[group] = [];
		}
		acc[group].push(workout);
		return acc;
	}, {});
}

export function sortWorkoutsBy(workouts, key) {
	return [...workouts].sort((a, b) => {
		if (key === 'Avg. Pace (min/mi)') {
			const paceA = parsePaceMinutes(a[key]) || 999;
			const paceB = parsePaceMinutes(b[key]) || 999;
			return paceA - paceB; // Ascending: fastest first
		}

		const valA = parseFloat(a[key]) || 0;
		const valB = parseFloat(b[key]) || 0;
		return valB - valA; // Descending: highest first
	});
}

export function parseWorkoutTimestamp(timestamp) {
	if (!timestamp) {
		return null;
	}
	// Remove timezone in parentheses, e.g. " (CST)"
	const cleanTimestamp = timestamp.replace(/ \(.+\)$/, '');
	return new Date(cleanTimestamp);
}
export function parsePaceMinutes(paceStr) {
	if (!paceStr) {
		return null;
	}
	// Convert MM:SS format to decimal minutes
	const parts = paceStr.split(':');
	if (parts.length !== 2) {
		return null;
	}
	const minutes = parseInt(parts[0], 10);
	const seconds = parseInt(parts[1], 10);
	if (isNaN(minutes) || isNaN(seconds)) {
		return null;
	}
	return minutes + seconds / 60;
}
