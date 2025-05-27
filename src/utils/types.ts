/**
 * Core type definitions for React Native Lightweight Charting Library
 * Financial data visualization with interactive features
 */

import { StyleProp, ViewStyle, TextStyle } from 'react-native';
import { ReactNode } from 'react';

// ============================================================================
// Core Data Types
// ============================================================================

/**
 * Main data structure for chart input
 * Pre-processed data with no transformation required
 */
export interface ChartData {
  /** X-axis values (timestamps for stock, prices for distribution) */
  x: number[];
  /** Y-axis values (prices for stock, probabilities for distribution) */
  y: number[];
}

/**
 * Internal representation of a data point after scaling
 */
export interface ScaledPoint {
  x: number;
  y: number;
  originalX: number;
  originalY: number;
  index: number;
}

/**
 * Data range for scaling calculations
 */
export interface Range {
  min: number;
  max: number;
}

/**
 * Chart area dimensions after padding
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Padding configuration for chart area
 */
export interface Padding {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

// ============================================================================
// Styling Types
// ============================================================================

/**
 * Line smoothing methods available for chart rendering
 */
export type LineSmoothingMethod = 'none' | 'bezier' | 'catmull-rom' | 'cardinal';

/**
 * Line styling configuration with smoothing options
 */
export interface LineStyle {
  color?: string;
  width?: number;
  opacity?: number;
  /** Line smoothing method - default 'none' for sharp corners */
  smoothing?: LineSmoothingMethod;
  /** Smoothing tension (0-1) - affects curve tightness for splines */
  tension?: number;
}

/**
 * Fill styling for distribution graphs
 */
export interface FillStyle {
  color?: string;
  opacity?: number;
  enabled?: boolean;
}

/**
 * Axis styling configuration
 */
export interface AxisStyle {
  lineColor?: string;
  lineWidth?: number;
  labelStyle?: TextStyle;
  tickLength?: number;
  tickColor?: string;
}

/**
 * Tooltip styling configuration
 */
export interface TooltipStyle {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  fontSize?: number;
  padding?: number;
  shadowColor?: string;
  shadowOpacity?: number;
  shadowRadius?: number;
}

// ============================================================================
// Feature Configuration Types
// ============================================================================

/**
 * Axis configuration
 */
export interface AxisConfig {
  x?: {
    show?: boolean;
    labels?: string[];
    style?: AxisStyle;
  };
  y?: {
    show?: boolean;
    labels?: string[];
    style?: AxisStyle;
  };
}

/**
 * Vertical indicator configuration
 */
export interface VerticalIndicator {
  /** X-axis value where indicator should appear */
  x: number;
  /** Indicator line color */
  color?: string;
  /** Indicator line width */
  width?: number;
  /** Whether line should be dashed */
  dashed?: boolean;
  /** Optional label for the indicator */
  label?: string;
}

/**
 * Interaction configuration
 */
export interface InteractionConfig {
  /** Enable draggable vertical line */
  enabled?: boolean;
  /** Callback when drag position changes */
  onDrag?: (x: number, y: number, index: number) => void;
  /** Callback when drag starts */
  onDragStart?: (x: number, y: number, index: number) => void;
  /** Callback when drag ends */
  onDragEnd?: (x: number, y: number, index: number) => void;
  /** Callback for tap events */
  onTap?: (x: number, y: number, index: number) => void;
  /** Style for the drag line */
  dragLineStyle?: LineStyle;
}

/**
 * Tooltip configuration
 */
export interface TooltipConfig {
  /** Show tooltip during interactions */
  enabled?: boolean;
  /** Tooltip position relative to chart */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Custom tooltip renderer */
  renderer?: (x: number, y: number, index: number) => ReactNode;
  /** Tooltip styling */
  style?: TooltipStyle;
}

/**
 * Gap detection configuration
 */
export interface GapConfig {
  /** Enable gap detection */
  enabled?: boolean;
  /** Threshold multiplier for detecting gaps */
  threshold?: number;
  /** Visual style for gaps */
  style?: {
    color?: string;
    width?: number;
    dashArray?: string;
  };
}

// ============================================================================
// Main Component Props
// ============================================================================

/**
 * Main Chart component props
 * Single flexible component supporting line and distribution modes
 */
export interface ChartProps {
  // Data
  /** Chart data with pre-processed x/y arrays */
  data: ChartData;
  
  // Dimensions
  /** Chart width in pixels */
  width: number;
  /** Chart height in pixels */
  height: number;
  /** Inner padding for chart area */
  padding?: Padding;
  
  // Styling
  /** Container view style */
  style?: StyleProp<ViewStyle>;
  /** Line appearance configuration */
  lineStyle?: LineStyle;
  /** Fill configuration for distribution mode */
  fillStyle?: FillStyle;
  
  // Features
  /** Axis configuration and styling */
  axes?: AxisConfig;
  /** Vertical indicator lines */
  indicators?: VerticalIndicator[];
  /** Interactive drag functionality */
  interaction?: InteractionConfig;
  /** Tooltip configuration */
  tooltip?: TooltipConfig;
  /** Gap detection for missing data */
  gaps?: GapConfig;
  
  // Accessibility
  /** Accessibility label for the chart */
  accessibilityLabel?: string;
}

// ============================================================================
// Internal Hook Types
// ============================================================================

/**
 * Chart dimensions hook return type
 */
export interface UseChartDimensionsReturn {
  chartArea: Rectangle;
  padding: Required<Padding>;
}

/**
 * Data scaling hook return type
 */
export interface UseDataScalingReturn {
  scaledData: ScaledPoint[];
  xRange: Range;
  yRange: Range;
  scaleX: (value: number) => number;
  scaleY: (value: number) => number;
  unscaleX: (coordinate: number) => number;
  unscaleY: (coordinate: number) => number;
}

/**
 * Gesture handling hook return type
 */
export interface UseGestureHandlingReturn {
  dragX: any; // Reanimated SharedValue
  dragY: any; // Reanimated SharedValue
  isActive: any; // Reanimated SharedValue
  gestureHandler: any; // Gesture from react-native-gesture-handler
}

/**
 * Interpolation hook return type
 */
export interface UseInterpolationReturn {
  interpolateAtX: (xPosition: number) => { x: number; y: number; index: number } | null;
  findNearestPoint: (xPosition: number) => ScaledPoint | null;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Data gap representation
 */
export interface Gap {
  startIndex: number;
  endIndex: number;
  startX: number;
  endX: number;
  duration: number;
}

/**
 * Binary search result for interpolation
 */
export interface BinarySearchResult {
  exact?: number;
  lower: number;
  upper: number;
}

/**
 * Default styling constants
 */
export const DEFAULT_STYLES = {
  line: {
    color: '#2563eb',
    width: 2,
    opacity: 1,
    smoothing: 'none' as LineSmoothingMethod,
    tension: 0.3,
  } as LineStyle,
  
  fill: {
    color: '#2563eb',
    opacity: 0.1,
    enabled: false,
  } as FillStyle,
  
  axis: {
    lineColor: '#e5e7eb',
    lineWidth: 1,
    labelStyle: {
      fontSize: 12,
      color: '#6b7280',
    },
    tickLength: 4,
    tickColor: '#e5e7eb',
  } as AxisStyle,
  
  tooltip: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    textColor: '#ffffff',
    borderRadius: 4,
    fontSize: 12,
    padding: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
  } as TooltipStyle,
  
  padding: {
    top: 20,
    right: 20,
    bottom: 40,
    left: 60,
  } as Required<Padding>,
  
  dragLine: {
    color: '#ef4444',
    width: 1,
    opacity: 0.8,
  } as LineStyle,
};

/**
 * Performance constants
 */
export const PERFORMANCE_CONSTANTS = {
  MAX_DATA_POINTS: 50,
  TARGET_FPS: 50,
  GESTURE_REFRESH_RATE: 16, // 60fps = 16ms per frame
  DEFAULT_GAP_THRESHOLD: 2.5, // 2.5x expected interval
} as const;
