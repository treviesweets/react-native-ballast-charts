/**
/**
 * Path Generation Utilities
 * Handles SVG path creation and coordinate transformations with smoothing support
 */

import { ScaledPoint, Gap, GapConfig, PERFORMANCE_CONSTANTS, LineStyle } from './types';
import { detectGaps } from './gapDetection';

// ============================================================================
// Curve Smoothing Utilities
// ============================================================================

/**
 * Calculate control points for cubic Bézier curve between two points
 * Uses neighboring points to determine curvature
 */
function calculateBezierControlPoints(
  prev: ScaledPoint | null,
  current: ScaledPoint,
  next: ScaledPoint,
  following: ScaledPoint | null,
  tension: number = 0.3
): { cp1: { x: number; y: number }, cp2: { x: number; y: number } } {
  
  // Use previous and following points to calculate tangent direction
  const prevPoint = prev || current;
  const followingPoint = following || next;
  
  // Calculate tangent vector
  const tangentX = (followingPoint.x - prevPoint.x) * tension;
  const tangentY = (followingPoint.y - prevPoint.y) * tension;
  
  return {
    cp1: {
      x: current.x + tangentX * 0.3,
      y: current.y + tangentY * 0.3
    },
    cp2: {
      x: next.x - tangentX * 0.3,
      y: next.y - tangentY * 0.3
    }
  };
}

/**
 * Calculate control points for Catmull-Rom spline
 * Converts to cubic Bézier for SVG compatibility
 */
function calculateCatmullRomControlPoints(
  p0: ScaledPoint,
  p1: ScaledPoint,
  p2: ScaledPoint,
  p3: ScaledPoint,
  tension: number = 0.5
): { cp1: { x: number; y: number }, cp2: { x: number; y: number } } {
  
  // Catmull-Rom to Bézier conversion
  const tau = tension;
  
  return {
    cp1: {
      x: p1.x + (p2.x - p0.x) / (6 * tau),
      y: p1.y + (p2.y - p0.y) / (6 * tau)
    },
    cp2: {
      x: p2.x - (p3.x - p1.x) / (6 * tau),
      y: p2.y - (p3.y - p1.y) / (6 * tau)
    }
  };
}

/**
 * Calculate control points for Cardinal spline
 * Similar to Catmull-Rom but with different tension handling
 */
function calculateCardinalControlPoints(
  p0: ScaledPoint,
  p1: ScaledPoint,
  p2: ScaledPoint,
  p3: ScaledPoint,
  tension: number = 0.5
): { cp1: { x: number; y: number }, cp2: { x: number; y: number } } {
  
  const t = tension;
  
  return {
    cp1: {
      x: p1.x + t * (p2.x - p0.x) / 6,
      y: p1.y + t * (p2.y - p0.y) / 6
    },
    cp2: {
      x: p2.x - t * (p3.x - p1.x) / 6,
      y: p2.y - t * (p3.y - p1.y) / 6
    }
  };
}

/**
 * Generate smooth SVG path using specified smoothing method
 */
function generateSmoothPath(
  sortedData: ScaledPoint[],
  gapIndices: Set<number>,
  smoothing: string,
  tension: number
): string {
  let path = `M ${sortedData[0].x} ${sortedData[0].y}`;
  
  for (let i = 1; i < sortedData.length; i++) {
    const current = sortedData[i];
    
    if (gapIndices.has(i - 1)) {
      // Gap detected - move without drawing
      path += ` M ${current.x} ${current.y}`;
      continue;
    }
    
    const prev = sortedData[i - 1];
    
    if (smoothing === 'none') {
      // Standard linear segments
      path += ` L ${current.x} ${current.y}`;
    } else {
      // Calculate control points based on smoothing method
      const prevPrev = i >= 2 ? sortedData[i - 2] : null;
      const next = i < sortedData.length - 1 ? sortedData[i + 1] : null;
      
      let controlPoints;
      
      if (smoothing === 'bezier') {
        controlPoints = calculateBezierControlPoints(prevPrev, prev, current, next, tension);
      } else if (smoothing === 'catmull-rom' && prevPrev && next) {
        controlPoints = calculateCatmullRomControlPoints(prevPrev, prev, current, next, tension);
      } else if (smoothing === 'cardinal' && prevPrev && next) {
        controlPoints = calculateCardinalControlPoints(prevPrev, prev, current, next, tension);
      } else {
        // Fallback to simple bezier for edge cases
        controlPoints = calculateBezierControlPoints(prevPrev, prev, current, next, tension);
      }
      
      // Add cubic Bézier curve
      path += ` C ${controlPoints.cp1.x},${controlPoints.cp1.y} ${controlPoints.cp2.x},${controlPoints.cp2.y} ${current.x},${current.y}`;
    }
  }
  
  return path;
}


/**
/**
 * Generate SVG path string from scaled data points with smoothing support
 * Handles uneven spacing and creates smooth line paths using various curve algorithms
 */
export const generatePath = (
  scaledData: ScaledPoint[],
  gaps?: GapConfig,
  lineStyle?: LineStyle
): string => {
  if (scaledData.length === 0) return '';
  if (scaledData.length === 1) {
    // Single point - draw a small circle
    const point = scaledData[0];
    return `M ${point.x - 1} ${point.y} A 1 1 0 1 0 ${point.x + 1} ${point.y}`;
  }

  // // Debug: Check if fixed width gaps are affecting coordinates
  // if (gaps?.fixedWidthGaps) {
  //   console.log('GeneratePath - Fixed width gaps enabled, first 5 points:', 
  //     scaledData.slice(0, 5).map(p => ({ x: p.x, originalX: p.originalX }))
  //   );
  // }

  // Sort by original X value to ensure proper line direction
  const sortedData = [...scaledData].sort((a, b) => a.originalX - b.originalX);

  // Detect gaps if enabled
  let gapIndices: Set<number> = new Set();
  if (gaps?.enabled) {
    const detectedGaps = detectGaps(
      sortedData.map(point => point.originalX),
      gaps.threshold
    );
    gapIndices = new Set(detectedGaps.map(gap => gap.startIndex));
  }

  // Extract smoothing parameters
  const smoothing = lineStyle?.smoothing || 'none';
  const tension = lineStyle?.tension || 0.3;

  // Generate path based on smoothing method
  if (smoothing === 'none') {
    // Original linear path generation
    let path = '';
    
    for (let i = 0; i < sortedData.length; i++) {
      const point = sortedData[i];
      
      if (i === 0) {
        // Move to first point
        path += `M ${point.x} ${point.y}`;
      } else if (gapIndices.has(i - 1)) {
        // Gap detected - move without drawing
        path += ` M ${point.x} ${point.y}`;
      } else {
        // Line to next point
        path += ` L ${point.x} ${point.y}`;
      }
    }
    
    return path;
  } else {
    // Use smooth path generation
    return generateSmoothPath(sortedData, gapIndices, smoothing, tension);
  }
};

/**
 * Generate path for gap indicators (dashed lines)
 */
export const generateGapPath = (scaledData: ScaledPoint[], gap: Gap): string => {
  if (gap.startIndex >= scaledData.length || gap.endIndex >= scaledData.length) {
    return '';
  }

  const startPoint = scaledData[gap.startIndex];
  const endPoint = scaledData[gap.endIndex];

  return `M ${startPoint.x} ${startPoint.y} L ${endPoint.x} ${endPoint.y}`;
};

/**
 * Generate fill path for distribution charts
 * Creates closed path with area under the line
 */
export const generateFillPath = (
  scaledData: ScaledPoint[],
  chartArea: { x: number; y: number; width: number; height: number }
): string => {
  if (scaledData.length === 0) return '';

  const sortedData = [...scaledData].sort((a, b) => a.originalX - b.originalX);
  const bottomY = chartArea.y + chartArea.height;

  let path = '';

  // Start from bottom-left
  path += `M ${sortedData[0].x} ${bottomY}`;
  
  // Line to first data point
  path += ` L ${sortedData[0].x} ${sortedData[0].y}`;

  // Follow the data line
  for (let i = 1; i < sortedData.length; i++) {
    path += ` L ${sortedData[i].x} ${sortedData[i].y}`;
  }

  // Close the path at bottom-right
  const lastPoint = sortedData[sortedData.length - 1];
  path += ` L ${lastPoint.x} ${bottomY}`;
  path += ` Z`; // Close path

  return path;
};

/**
 * Clamp a value between min and max bounds
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Clamp coordinates to chart bounds
 */
export const clampToChartArea = (
  x: number,
  y: number,
  chartArea: { x: number; y: number; width: number; height: number }
) => {
  return {
    x: clamp(x, chartArea.x, chartArea.x + chartArea.width),
    y: clamp(y, chartArea.y, chartArea.y + chartArea.height)
  };
};
