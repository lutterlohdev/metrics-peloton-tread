import { describe, it, expect } from 'vitest';
import { groupWorkoutsBy, sortWorkoutsBy, parseWorkoutTimestamp, parsePaceMinutes } from '../utils.js';

describe('utils', () => {
  const workouts = [
    { 'Length (minutes)': 10, 'Total Output': 100 },
    { 'Length (minutes)': 20, 'Total Output': 150 },
    { 'Length (minutes)': 10, 'Total Output': 120 },
    { 'Length (minutes)': 30, 'Total Output': 200 },
    { 'Length (minutes)': 20, 'Total Output': 180 },
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
});

