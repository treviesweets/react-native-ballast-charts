/**
 * Gap Detection Utilities
 * Identifies missing data periods in time series
 */

import { Gap, PERFORMANCE_CONSTANTS } from './types';

/**
 * Detect gaps in time series data
 * Identifies periods where data is missing based on expected intervals
 */
export const detectGaps = (
  timestamps: number[],
  threshold: number = PERFORMANCE_CONSTANTS.DEFAULT_GAP_THRESHOLD
): Gap[] => {
  if (timestamps.length < 2) return [];

  const gaps: Gap[] = [];
  
  // Calculate expected interval (median of all intervals)
  const intervals = [];
  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(timestamps[i] - timestamps[i - 1]);
  }
  
  intervals.sort((a, b) => a - b);
  const expectedInterval = intervals[Math.floor(intervals.length / 2)];

  // Find gaps
  for (let i = 1; i < timestamps.length; i++) {
    const timeDiff = timestamps[i] - timestamps[i - 1];
    
    if (timeDiff > threshold * expectedInterval) {
      gaps.push({
        startIndex: i - 1,
        endIndex: i,
        startX: timestamps[i - 1],
        endX: timestamps[i],
        duration: timeDiff
      });
    }
  }

  return gaps;
};

/**
 * Calculate expected interval between data points
 * Uses median to avoid outliers affecting the calculation
 */
export const calculateExpectedInterval = (timestamps: number[]): number => {
  if (timestamps.length < 2) return 0;

  const intervals = [];
  for (let i = 1; i < timestamps.length; i++) {
    intervals.push(timestamps[i] - timestamps[i - 1]);
  }

  intervals.sort((a, b) => a - b);
  return intervals[Math.floor(intervals.length / 2)];
};
