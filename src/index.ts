/**
 * React Native Simple Charts Library
 * Main package exports
 */

// Main component
export { Chart as default, Chart } from './components/Chart';

// Individual components (for advanced usage)
export { LineRenderer } from './components/LineRenderer';
export { AxisRenderer } from './components/AxisRenderer';
export { IndicatorRenderer } from './components/IndicatorRenderer';
export { FillRenderer } from './components/FillRenderer';
export { DragLine } from './components/DragLine';
export { Tooltip } from './components/Tooltip';

// Hooks
export { useChartDimensions } from './hooks/useChartDimensions';
export { useDataScaling } from './hooks/useDataScaling';
export { useInterpolation } from './hooks/useInterpolation';
export { useGestureHandling } from './hooks/useGestureHandling';

// Types
export type {
  ChartProps,
  ChartData,
  LineStyle,
  FillStyle,
  AxisConfig,
  VerticalIndicator,
  InteractionConfig,
  TooltipConfig,
  GapConfig,
  ScaledPoint,
  Range,
  Rectangle,
  Padding,
  UseChartDimensionsReturn,
  UseDataScalingReturn,
  UseGestureHandlingReturn,
  UseInterpolationReturn
} from './utils/types';

// Utilities
export { 
  generatePath, 
  generateFillPath, 
  clamp, 
  clampToChartArea 
} from './utils/pathGeneration';
export { detectGaps, calculateExpectedInterval } from './utils/gapDetection';
export { binarySearch, validateData, validateDimensions } from './utils/validation';
export { DEFAULT_STYLES, PERFORMANCE_CONSTANTS } from './utils/types';
