import { describe, it, expect } from 'vitest';
import {
	groupWorkoutsBy,
	sortWorkoutsBy,
	parseWorkoutTimestamp,
	parsePaceMinutes,
	formatLocalDate,
	parseDateBoundary,
	isWorkoutInDateRange,
	filterWorkoutsByDate
} from '../utils.js';

describe('utils', () => {
	const workouts = [
		{ 'Length (minutes)': 10, 'Total Output': 100 },
		{ 'Length (minutes)': 20, 'Total Output': 150 },
		{ 'Length (minutes)': 10, 'Total Output': 120 },
		{ 'Length (minutes)': 30, 'Total Output': 200 },
		{ 'Length (minutes)': 20, 'Total Output': 180 }
	];

	describe('groupWorkoutsBy', () => {
		it('should group workouts by a given key', () => {
			const grouped = groupWorkoutsBy(workouts, 'Length (minutes)');
			expect(Object.keys(grouped)).toEqual(['10', '20', '30']);
			expect(grouped['10'].length).toBe(2);
			expect(grouped['20'].length).toBe(2);
			expect(grouped['30'].length).toBe(1);
		});
	});

	describe('sortWorkoutsBy', () => {
		it('should sort workouts by a given key in descending order', () => {
			const sorted = sortWorkoutsBy(workouts, 'Total Output');
			expect(sorted[0]['Total Output']).toBe(200);
			expect(sorted[1]['Total Output']).toBe(180);
			expect(sorted[2]['Total Output']).toBe(150);
			expect(sorted[3]['Total Output']).toBe(120);
			expect(sorted[4]['Total Output']).toBe(100);
		});
	});

	describe('parseWorkoutTimestamp', () => {
		it('should parse a workout timestamp string', () => {
			const timestamp = '2020-01-30 09:30 (CST)';
			const date = parseWorkoutTimestamp(timestamp);
			expect(date).toBeInstanceOf(Date);
			expect(date.getFullYear()).toBe(2020);
			expect(date.getMonth()).toBe(0); // January is 0
			expect(date.getDate()).toBe(30);
		});

		it('should handle null input', () => {
			const date = parseWorkoutTimestamp(null);
			expect(date).toBeNull();
		});

		it('should handle invalid input', () => {
			const date = parseWorkoutTimestamp('invalid-date-xyz');
			expect(date).toBeNull();
		});
	});

	describe('parsePaceMinutes', () => {
		it('should convert MM:SS format to decimal minutes', () => {
			expect(parsePaceMinutes('9:30')).toBe(9.5);
			expect(parsePaceMinutes('10:15')).toBe(10.25);
		});

		it('should return null for invalid or missing input', () => {
			expect(parsePaceMinutes(null)).toBeNull();
			expect(parsePaceMinutes('')).toBeNull();
			expect(parsePaceMinutes('930')).toBeNull();
			expect(parsePaceMinutes('aa:bb')).toBeNull();
		});
	});

	describe('formatLocalDate', () => {
		it('should format a Date object as YYYY-MM-DD in local time', () => {
			const date = new Date(2026, 10, 1, 23, 45, 0); // Nov 1, 2026
			expect(formatLocalDate(date)).toBe('2026-11-01');
		});

		it('should handle null or invalid input', () => {
			expect(formatLocalDate(null)).toBe('');
			expect(formatLocalDate(undefined)).toBe('');
			expect(formatLocalDate(new Date('invalid'))).toBe('');
		});
	});

	describe('parseDateBoundary', () => {
		it('should parse start of day as 00:00:00.000 in local time', () => {
			const boundary = parseDateBoundary('2026-11-01', false);
			expect(boundary.getFullYear()).toBe(2026);
			expect(boundary.getMonth()).toBe(10);
			expect(boundary.getDate()).toBe(1);
			expect(boundary.getHours()).toBe(0);
			expect(boundary.getMinutes()).toBe(0);
			expect(boundary.getSeconds()).toBe(0);
			expect(boundary.getMilliseconds()).toBe(0);
		});

		it('should parse end of day as 23:59:59.999 in local time', () => {
			const boundary = parseDateBoundary('2026-11-01', true);
			expect(boundary.getFullYear()).toBe(2026);
			expect(boundary.getMonth()).toBe(10);
			expect(boundary.getDate()).toBe(1);
			expect(boundary.getHours()).toBe(23);
			expect(boundary.getMinutes()).toBe(59);
			expect(boundary.getSeconds()).toBe(59);
			expect(boundary.getMilliseconds()).toBe(999);
		});

		it('should handle null and invalid values', () => {
			expect(parseDateBoundary(null)).toBeNull();
			expect(parseDateBoundary('')).toBeNull();
			expect(parseDateBoundary('invalid')).toBeNull();
		});
	});

	describe('filterWorkoutsByDate and isWorkoutInDateRange', () => {
		const sampleWorkouts = [
			{ 'Workout Timestamp': '2026-11-01 00:01 (EST)', Title: 'Midnight Run' },
			{ 'Workout Timestamp': '2026-11-01 08:30 (EST)', Title: 'Morning Run' },
			{ 'Workout Timestamp': '2026-11-01 23:59 (EST)', Title: 'Late Night Run' },
			{ 'Workout Timestamp': '2026-10-31 23:59 (EST)', Title: 'Yesterday Run' },
			{ 'Workout Timestamp': '2026-11-02 00:01 (EST)', Title: 'Tomorrow Run' }
		];

		it('includes runs occurring throughout the end date (current day)', () => {
			const filtered = filterWorkoutsByDate(sampleWorkouts, {
				start: '2026-11-01',
				end: '2026-11-01'
			});
			expect(filtered.length).toBe(3);
			expect(filtered.map((w) => w.Title)).toEqual([
				'Midnight Run',
				'Morning Run',
				'Late Night Run'
			]);
		});

		it('correctly handles multi-day date range including boundaries', () => {
			const filtered = filterWorkoutsByDate(sampleWorkouts, {
				start: '2026-10-31',
				end: '2026-11-01'
			});
			expect(filtered.length).toBe(4);
			expect(filtered.some((w) => w.Title === 'Tomorrow Run')).toBe(false);
		});

		it('checks single workout dates accurately with isWorkoutInDateRange', () => {
			const workoutDate = new Date(2026, 10, 1, 14, 0);
			expect(isWorkoutInDateRange(workoutDate, { start: '2026-11-01', end: '2026-11-01' })).toBe(
				true
			);
			expect(isWorkoutInDateRange(workoutDate, { start: '2026-11-02', end: '2026-11-02' })).toBe(
				false
			);
			expect(isWorkoutInDateRange(null, { start: '2026-11-01', end: '2026-11-01' })).toBe(false);
		});

		it('returns all workouts when dateFilter is empty or null', () => {
			expect(filterWorkoutsByDate(sampleWorkouts, null).length).toBe(5);
			expect(filterWorkoutsByDate(sampleWorkouts, { start: null, end: null }).length).toBe(5);
		});

		it('handles open-ended filters (only start or only end)', () => {
			const onlyStart = filterWorkoutsByDate(sampleWorkouts, {
				start: '2026-11-01',
				end: null
			});
			expect(onlyStart.length).toBe(4); // 3 on Nov 1 + 1 on Nov 2

			const onlyEnd = filterWorkoutsByDate(sampleWorkouts, {
				start: null,
				end: '2026-11-01'
			});
			expect(onlyEnd.length).toBe(4); // 1 on Oct 31 + 3 on Nov 1
		});
	});
});
