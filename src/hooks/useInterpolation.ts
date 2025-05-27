/**
 * Interpolation Hook
 * Utilities for finding values at specific x positions
 */

import { useMemo } from 'react';
import {
  Rectangle,
  ScaledPoint,
  UseInterpolationReturn
} from '../utils/types';

interface UseInterpolationProps {
  scaledData: ScaledPoint[];
  chartArea: Rectangle;
}

/**
 * Interpolation utilities for finding values at specific x positions
 * Used for drag interactions and tooltip positioning
 */
export const useInterpolation = ({
  scaledData,
  chartArea
}: UseInterpolationProps): UseInterpolationReturn => {
  return useMemo(() => {
    /**
     * Binary search to find data points around a given x position
     */
    const binarySearch = (xPosition: number) => {
      let left = 0;
      let right = scaledData.length - 1;

      // Handle edge cases
      if (scaledData.length === 0) return null;
      if (xPosition <= scaledData[0].x) return { exact: 0, lower: 0, upper: 0 };
      if (xPosition >= scaledData[right].x) return { exact: right, lower: right, upper: right };

      while (left <= right) {
        const mid = Math.floor((left + right) / 2);
        const point = scaledData[mid];

        if (Math.abs(point.x - xPosition) < 0.5) {
          return { exact: mid, lower: mid, upper: mid };
        }

        if (point.x < xPosition) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      return {
        exact: undefined,
        lower: Math.max(0, right),
        upper: Math.min(scaledData.length - 1, left)
      };
    };

    /**
     * Interpolate Y value at specific X position
     */
    const interpolateAtX = (xPosition: number) => {
      const result = binarySearch(xPosition);
      if (!result) return null;

      if (result.exact !== undefined) {
        const point = scaledData[result.exact];
        return {
          x: point.originalX,
          y: point.originalY,
          index: point.index
        };
      }

      // Linear interpolation between two points
      const p1 = scaledData[result.lower];
      const p2 = scaledData[result.upper];

      if (p1 === p2) {
        return {
          x: p1.originalX,
          y: p1.originalY,
          index: p1.index
        };
      }

      const ratio = (xPosition - p1.x) / (p2.x - p1.x);
      const interpolatedY = p1.originalY + (p2.originalY - p1.originalY) * ratio;
      const interpolatedX = p1.originalX + (p2.originalX - p1.originalX) * ratio;

      return {
        x: interpolatedX,
        y: interpolatedY,
        index: ratio < 0.5 ? p1.index : p2.index
      };
    };

    /**
     * Find the nearest data point to a given x position
     */
    const findNearestPoint = (xPosition: number): ScaledPoint | null => {
      if (scaledData.length === 0) return null;

      let nearestPoint = scaledData[0];
      let minDistance = Math.abs(nearestPoint.x - xPosition);

      for (let i = 1; i < scaledData.length; i++) {
        const distance = Math.abs(scaledData[i].x - xPosition);
        if (distance < minDistance) {
          minDistance = distance;
          nearestPoint = scaledData[i];
        }
      }

      return nearestPoint;
    };

    return {
      interpolateAtX,
      findNearestPoint
    };
  }, [scaledData, chartArea]);
};
