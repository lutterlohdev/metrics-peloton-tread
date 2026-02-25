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
  return [...workouts].sort((a, b) => b[key] - a[key]);
}

export function parseWorkoutTimestamp(timestamp) {
  if (!timestamp) {
    return null;
  }
  // Remove timezone in parentheses, e.g. " (CST)"
  const cleanTimestamp = timestamp.replace(/ \(.+\)$/, '');
  return new Date(cleanTimestamp);
}
