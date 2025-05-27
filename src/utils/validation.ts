/**
 * Data Validation Utilities
 * Validates chart data input and throws descriptive errors
 */

import { ChartData, PERFORMANCE_CONSTANTS } from './types';

/**
 * Validate chart data input
 * Ensures data is properly formatted and within performance limits
 */
export const validateData = (data: ChartData): void => {
  // Check if data object exists
  if (!data) {
    throw new Error('Chart data is required');
  }

  // Check if x and y arrays exist
  if (!data.x || !data.y) {
    throw new Error('Chart requires both x and y data arrays');
  }

  // Check if arrays are actually arrays
  if (!Array.isArray(data.x) || !Array.isArray(data.y)) {
    throw new Error('X and Y data must be arrays');
  }

  // Check array lengths match
  if (data.x.length !== data.y.length) {
    throw new Error(`X and Y arrays must have the same length. Got x: ${data.x.length}, y: ${data.y.length}`);
  }

  // Check minimum data points
  if (data.x.length === 0) {
    throw new Error('Chart requires at least one data point');
  }

  // Check performance limits
  if (data.x.length > PERFORMANCE_CONSTANTS.MAX_DATA_POINTS) {
    console.warn(
      `Chart has ${data.x.length} data points. Performance may be affected above ${PERFORMANCE_CONSTANTS.MAX_DATA_POINTS} points.`
    );
  }

  // Validate individual data points
  for (let i = 0; i < data.x.length; i++) {
    const x = data.x[i];
    const y = data.y[i];

    // Check for null/undefined values
    if (x == null || y == null) {
      throw new Error(`Data point at index ${i} contains null or undefined values`);
    }

    // Check for non-numeric values
    if (typeof x !== 'number' || typeof y !== 'number') {
      throw new Error(`Data point at index ${i} contains non-numeric values`);
    }

    // Check for NaN or Infinity
    if (!isFinite(x) || !isFinite(y)) {
      throw new Error(`Data point at index ${i} contains invalid values (NaN or Infinity)`);
    }
  }

  // Check for reasonable data ranges
  const xRange = Math.max(...data.x) - Math.min(...data.x);
  const yRange = Math.max(...data.y) - Math.min(...data.y);

  if (xRange === 0 && data.x.length > 1) {
    console.warn('All X values are identical. Chart may not display properly.');
  }

  if (yRange === 0 && data.y.length > 1) {
    console.warn('All Y values are identical. Chart will display as a flat line.');
  }
};

/**
 * Validate chart dimensions
 */
export const validateDimensions = (width: number, height: number): void => {
  if (typeof width !== 'number' || typeof height !== 'number') {
    throw new Error('Width and height must be numbers');
  }

  if (!isFinite(width) || !isFinite(height)) {
    throw new Error('Width and height must be finite numbers');
  }

  if (width <= 0 || height <= 0) {
    throw new Error('Width and height must be positive numbers');
  }

  if (width < 50 || height < 50) {
    console.warn(`Chart dimensions are very small (${width}x${height}). Minimum recommended size is 50x50.`);
  }
};

/**
 * Validate styling props
 */
export const validateLineStyle = (lineStyle: any): void => {
  if (!lineStyle) return;

  if (lineStyle.width !== undefined) {
    if (typeof lineStyle.width !== 'number' || lineStyle.width <= 0) {
      throw new Error('Line width must be a positive number');
    }
  }

  if (lineStyle.opacity !== undefined) {
    if (typeof lineStyle.opacity !== 'number' || lineStyle.opacity < 0 || lineStyle.opacity > 1) {
      throw new Error('Line opacity must be a number between 0 and 1');
    }
  }
};

/**
 * Validate indicator configurations
 */
export const validateIndicators = (indicators: any[], xRange: { min: number; max: number }): void => {
  if (!indicators || !Array.isArray(indicators)) return;

  indicators.forEach((indicator, index) => {
    if (typeof indicator.x !== 'number' || !isFinite(indicator.x)) {
      throw new Error(`Indicator at index ${index} has invalid x value`);
    }

    if (indicator.x < xRange.min || indicator.x > xRange.max) {
      console.warn(`Indicator at index ${index} (x=${indicator.x}) is outside data range (${xRange.min}-${xRange.max})`);
    }

    if (indicator.width !== undefined) {
      if (typeof indicator.width !== 'number' || indicator.width <= 0) {
        throw new Error(`Indicator at index ${index} has invalid width`);
      }
    }
  });
};

/**
 * Binary search for finding data points around a specific value
 * Used for interpolation and nearest point calculations
 */
export const binarySearch = <T>(
  array: T[],
  target: number,
  getValue: (item: T) => number
): { exact?: number; lower: number; upper: number } => {
  let left = 0;
  let right = array.length - 1;

  // Handle edge cases
  if (array.length === 0) {
    return { lower: 0, upper: 0 };
  }

  const firstValue = getValue(array[0]);
  const lastValue = getValue(array[right]);

  if (target <= firstValue) {
    return { exact: 0, lower: 0, upper: 0 };
  }
  if (target >= lastValue) {
    return { exact: right, lower: right, upper: right };
  }

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    const midValue = getValue(array[mid]);

    if (Math.abs(midValue - target) < Number.EPSILON) {
      return { exact: mid, lower: mid, upper: mid };
    }

    if (midValue < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  return {
    exact: undefined,
    lower: Math.max(0, right),
    upper: Math.min(array.length - 1, left)
  };
};
