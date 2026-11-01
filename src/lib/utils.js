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
	const date = new Date(cleanTimestamp);
	return isNaN(date.getTime()) ? null : date;
}

export function formatLocalDate(d) {
	if (!d) return '';
	const date = d instanceof Date ? d : new Date(d);
	if (isNaN(date.getTime())) return '';
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}-${month}-${day}`;
}

export function parseDateBoundary(dateInput, isEndOfDay = false) {
	if (!dateInput) return null;
	if (typeof dateInput === 'string') {
		const trimmed = dateInput.trim();
		const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
		if (match) {
			const year = parseInt(match[1], 10);
			const month = parseInt(match[2], 10) - 1;
			const day = parseInt(match[3], 10);
			if (isEndOfDay) {
				return new Date(year, month, day, 23, 59, 59, 999);
			}
			return new Date(year, month, day, 0, 0, 0, 0);
		}
		const parsed = new Date(trimmed);
		if (isNaN(parsed.getTime())) return null;
		if (isEndOfDay) {
			parsed.setHours(23, 59, 59, 999);
		} else {
			parsed.setHours(0, 0, 0, 0);
		}
		return parsed;
	}
	if (dateInput instanceof Date) {
		if (isNaN(dateInput.getTime())) return null;
		const d = new Date(dateInput.getTime());
		if (isEndOfDay) {
			d.setHours(23, 59, 59, 999);
		} else {
			d.setHours(0, 0, 0, 0);
		}
		return d;
	}
	return null;
}

export function isWorkoutInDateRange(workoutDate, dateFilter) {
	if (!workoutDate || !(workoutDate instanceof Date) || isNaN(workoutDate.getTime())) {
		return false;
	}
	if (!dateFilter) return true;
	const startBoundary = parseDateBoundary(dateFilter.start, false);
	const endBoundary = parseDateBoundary(dateFilter.end, true);

	if (startBoundary && workoutDate < startBoundary) {
		return false;
	}
	if (endBoundary && workoutDate > endBoundary) {
		return false;
	}
	return true;
}

export function filterWorkoutsByDate(workouts, dateFilter) {
	if (!workouts || !Array.isArray(workouts)) return [];
	if (!dateFilter || (!dateFilter.start && !dateFilter.end)) {
		return workouts;
	}

	const startBoundary = parseDateBoundary(dateFilter.start, false);
	const endBoundary = parseDateBoundary(dateFilter.end, true);

	if (!startBoundary && !endBoundary) {
		return workouts;
	}

	return workouts.filter((workout) => {
		const workoutDate = parseWorkoutTimestamp(workout['Workout Timestamp']);
		if (!workoutDate) return false;
		if (startBoundary && workoutDate < startBoundary) return false;
		if (endBoundary && workoutDate > endBoundary) return false;
		return true;
	});
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
