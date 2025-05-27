/**
 * LineRenderer Component - Production Ready with Smoothing Support
 * Renders the main chart line using SVG paths with various curve algorithms
 * Handles smooth curves and gap visualization
 */

import React, { useMemo } from 'react';
import { Path } from 'react-native-svg';
import { ScaledPoint, LineStyle, GapConfig, Gap } from '../utils/types';
import { generatePath, generateGapPath } from '../utils/pathGeneration';
import { detectGaps } from '../utils/gapDetection';

interface LineRendererProps {
  /** Scaled data points ready for SVG rendering */
  scaledData: ScaledPoint[];
  /** Line styling configuration with smoothing options */
  lineStyle: LineStyle;
  /** Gap detection and visualization config */
  gaps?: GapConfig;
}

/**
 * Renders the main chart line with support for:
 * - Smooth line paths with Bézier, Catmull-Rom, and Cardinal curves
 * - Gap visualization for missing data periods
 * - Configurable line styling and smoothing options
 * - Optimized path generation for performance
 */
export const LineRenderer: React.FC<LineRendererProps> = ({
  scaledData,
  lineStyle,
  gaps
}) => {
  // Generate main line path with smoothing support
  const mainPath = useMemo(() => {
    if (scaledData.length === 0) return '';
    
    return generatePath(scaledData, gaps, lineStyle);
  }, [scaledData, gaps, lineStyle]);

  // Detect and generate gap paths if enabled
  const gapPaths = useMemo(() => {
    if (!gaps?.enabled || scaledData.length < 2) return [];

    const detectedGaps = detectGaps(
      scaledData.map(point => point.originalX),
      gaps.threshold
    );

    return detectedGaps.map(gap => ({
      path: generateGapPath(scaledData, gap),
      gap
    }));
  }, [scaledData, gaps]);

  // If no data, render nothing
  if (scaledData.length === 0) {
    return null;
  }

  return (
    <>
      {/* Main chart line with smoothing */}
      <Path
        d={mainPath}
        stroke={lineStyle.color}
        strokeWidth={lineStyle.width}
        strokeOpacity={lineStyle.opacity}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Gap indicators */}
      {gapPaths.map(({ path, gap }, index) => (
        <Path
          key={`gap-${index}`}
          d={path}
          stroke={gaps?.style?.color || lineStyle.color}
          strokeWidth={gaps?.style?.width || lineStyle.width}
          strokeOpacity={0.3}
          strokeDasharray={gaps?.style?.dashArray || "4 4"}
          fill="none"
          strokeLinecap="round"
        />
      ))}
    </>
  );
};

export default LineRenderer;
