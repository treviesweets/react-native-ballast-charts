/**
 * Chart Dimensions Hook
 * Core calculation logic for chart layout with dynamic padding based on axes visibility
 */

import { useMemo } from 'react';
import {
  Rectangle,
  Padding,
  AxisConfig,
  UseChartDimensionsReturn,
  DEFAULT_STYLES
} from '../utils/types';

interface UseChartDimensionsProps {
  width: number;
  height: number;
  padding?: Padding;
  axes?: AxisConfig;
}

/**
 * Calculate dynamic padding based on axes visibility
 * Provides space for axis labels when shown, minimal padding when hidden
 */
const calculateDynamicPadding = (axes?: AxisConfig): Required<Padding> => {
  const basePadding = DEFAULT_STYLES.padding;
  
  return {
    top: basePadding.top, // Always use default top padding
    right: basePadding.right, // Always use default right padding
    // Dynamic left padding based on Y-axis visibility
    left: axes?.y?.show ? 60 : 20,
    // Dynamic bottom padding based on X-axis visibility  
    bottom: axes?.x?.show ? 40 : 20,
  };
};

/**
 * Calculate chart dimensions and drawable area
 * Handles dynamic padding based on axes configuration and manual overrides
 */
export const useChartDimensions = ({
  width,
  height,
  padding,
  axes
}: UseChartDimensionsProps): UseChartDimensionsReturn => {
  return useMemo(() => {
    // Start with dynamic padding based on axes
    const dynamicPadding = calculateDynamicPadding(axes);
    
    // Merge with manual padding overrides (manual padding takes precedence)
    const resolvedPadding: Required<Padding> = {
      ...dynamicPadding,
      ...padding
    };

    // Calculate drawable chart area
    const chartArea: Rectangle = {
      x: resolvedPadding.left,
      y: resolvedPadding.top,
      width: width - resolvedPadding.left - resolvedPadding.right,
      height: height - resolvedPadding.top - resolvedPadding.bottom
    };

    // Ensure minimum dimensions
    if (chartArea.width <= 0 || chartArea.height <= 0) {
      console.warn('Chart area is too small. Check dimensions and padding.');
    }

    return {
      chartArea,
      padding: resolvedPadding
    };
  }, [width, height, padding, axes]);
};