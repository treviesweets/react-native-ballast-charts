/**
 * Data Scaling Hook
 * Core calculation logic for coordinate transformations
 */

import { useMemo } from 'react';
import {
  ChartData,
  Rectangle,
  Range,
  ScaledPoint,
  UseDataScalingReturn,
  GapConfig
} from '../utils/types';

interface UseDataScalingProps {
  data: ChartData;
  chartArea: Rectangle;
  gaps?: GapConfig;
}

/**
 * Scale data from data space to view space coordinates
 * Handles uneven time spacing and provides transformation functions
 */
export const useDataScaling = ({
  data,
  chartArea,
  gaps
}: UseDataScalingProps): UseDataScalingReturn => {
  return useMemo(() => {
    const { x: xData, y: yData } = data;

    // Calculate data ranges
    const xRange: Range = {
      min: Math.min(...xData),
      max: Math.max(...xData)
    };

    const yRange: Range = {
      min: Math.min(...yData),
      max: Math.max(...yData)
    };

    // Add padding to Y range for better visualization
    const yPadding = (yRange.max - yRange.min) * 0.05; // 5% padding
    yRange.min -= yPadding;
    yRange.max += yPadding;

    // Scaling functions
    const scaleX = (value: number): number => {
      const xSpan = xRange.max - xRange.min;
      if (xSpan === 0) return chartArea.x + chartArea.width / 2;
      
      return chartArea.x + ((value - xRange.min) / xSpan) * chartArea.width;
    };

    const scaleY = (value: number): number => {
      const ySpan = yRange.max - yRange.min;
      if (ySpan === 0) return chartArea.y + chartArea.height / 2;
      
      // Invert Y axis (SVG coordinates start from top)
      return chartArea.y + chartArea.height - ((value - yRange.min) / ySpan) * chartArea.height;
    };

    // Inverse scaling functions
    const unscaleX = (coordinate: number): number => {
      const xSpan = xRange.max - xRange.min;
      if (xSpan === 0) return xRange.min;
      
      return xRange.min + ((coordinate - chartArea.x) / chartArea.width) * xSpan;
    };

    const unscaleY = (coordinate: number): number => {
      const ySpan = yRange.max - yRange.min;
      if (ySpan === 0) return yRange.min;
      
      // Invert Y axis
      return yRange.min + ((chartArea.y + chartArea.height - coordinate) / chartArea.height) * ySpan;
    };

    // Transform all data points to scaled coordinates
    const scaledData: ScaledPoint[] = xData.map((x, index) => ({
      x: scaleX(x),
      y: scaleY(yData[index]),
      originalX: x,
      originalY: yData[index],
      index
    }));

    return {
      scaledData,
      xRange,
      yRange,
      scaleX,
      scaleY,
      unscaleX,
      unscaleY
    };
  }, [data, chartArea, gaps]);
};
