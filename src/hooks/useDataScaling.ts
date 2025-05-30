/**
 * Data Scaling Hook
 * Core calculation logic for coordinate transformations
 */

import { useMemo } from 'react';
import { detectGaps } from '../utils/gapDetection';
import {
  ChartData,
  Rectangle,
  Range,
  ScaledPoint,
  UseDataScalingReturn,
  GapConfig,
  Gap
} from '../utils/types';

interface UseDataScalingProps {
  data: ChartData;
  yRange?: Range;
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
  gaps,
  yRange: yRangeOverride
}: UseDataScalingProps): UseDataScalingReturn => {
  return useMemo(() => {
    const { x: xData, y: yData } = data;

    // // DEBUG: Print raw input data when fixed width gaps are enabled
    // if (gaps?.enabled && gaps?.fixedWidthGaps) {
    //   console.log('RAW INPUT DATA:');
    //   console.log('xData (timestamps):', xData);
    //   console.log('yData (prices):', yData);
    //   console.log('chartArea:', chartArea);
    //   console.log('gaps config:', gaps);
    // }

    // Calculate data ranges
    const xRange: Range = {
      min: Math.min(...xData),
      max: Math.max(...xData)
    };
    
    // Use provided yRange override or calculate from data
    let yRange: Range;
    if (yRangeOverride) {
      yRange = { ...yRangeOverride };
    } else {
      yRange = {
        min: Math.min(...yData),
        max: Math.max(...yData)
      };
      
      // Add padding to Y range for better visualization (only when auto-calculated)
      const yPadding = (yRange.max - yRange.min) * 0.05; // 5% padding
      yRange.min -= yPadding;
      yRange.max += yPadding;
    }

    // Detect gaps if fixed width gaps are enabled
    // Detect gaps if fixed width gaps are enabled
    let detectedGaps: Gap[] = [];
    if (gaps?.enabled && gaps?.fixedWidthGaps) {
      detectedGaps = detectGaps(xData, gaps.threshold);
      // console.log(`Fixed width gaps enabled: ${detectedGaps.length} gaps detected`, detectedGaps);
    }

    // Calculate scaling with fixed width gaps
    const createScalingFunctions = () => {
      if (!gaps?.fixedWidthGaps || detectedGaps.length === 0) {
        // Standard linear scaling
        const scaleX = (value: number): number => {
          const xSpan = xRange.max - xRange.min;
          if (xSpan === 0) return chartArea.x + chartArea.width / 2;
          
          return chartArea.x + ((value - xRange.min) / xSpan) * chartArea.width;
        };

        const unscaleX = (coordinate: number): number => {
          const xSpan = xRange.max - xRange.min;
          if (xSpan === 0) return xRange.min;
          
          return xRange.min + ((coordinate - chartArea.x) / chartArea.width) * xSpan;
        };

        return { scaleX, unscaleX };
      }

      // Fixed width gap scaling
      const fixedGapWidth = gaps.fixedWidth || 40;
      const totalGapVisualWidth = detectedGaps.length * fixedGapWidth;
      const dataWidth = chartArea.width - totalGapVisualWidth;
      
      // Calculate total data time span (excluding gap durations)
      let totalDataTimeSpan = 0;
      
      for (let i = 0; i <= detectedGaps.length; i++) {
        if (i === 0) {
          // First segment: from data start to first gap start (or end if no gaps)
          const segmentEnd = detectedGaps.length > 0 ? detectedGaps[0].startX : xRange.max;
          totalDataTimeSpan += (segmentEnd - xRange.min);
        } else if (i === detectedGaps.length) {
          // Final segment: from last gap end to data end
          const segmentStart = detectedGaps[i - 1].endX;
          totalDataTimeSpan += (xRange.max - segmentStart);
        } else {
          // Middle segments: from previous gap end to current gap start
          const segmentStart = detectedGaps[i - 1].endX;
          const segmentEnd = detectedGaps[i].startX;
          totalDataTimeSpan += (segmentEnd - segmentStart);
        }
      }
      
      // Calculate consistent time-to-pixel ratio across all segments
      const timeToPixelRatio = dataWidth / totalDataTimeSpan;
      
      // console.log(`Fixed width scaling: ${detectedGaps.length} gaps, ${fixedGapWidth}px each, dataWidth: ${dataWidth}, totalWidth: ${chartArea.width}`);
      // console.log(`Total data time span: ${totalDataTimeSpan}, time-to-pixel ratio: ${timeToPixelRatio}`);

      const scaleX = (value: number): number => {
        if (totalDataTimeSpan === 0) return chartArea.x + chartArea.width / 2;

        // Find which segment this value belongs to and calculate position
        let cumulativePixels = 0;
        let cumulativeGaps = 0;
        
        // Check each segment
        for (let i = 0; i <= detectedGaps.length; i++) {
          let segmentStart: number;
          let segmentEnd: number;
          
          if (i === 0) {
            // First segment: from data start to first gap start (or end if no gaps)
            segmentStart = xRange.min;
            segmentEnd = detectedGaps.length > 0 ? detectedGaps[0].startX : xRange.max;
          } else if (i === detectedGaps.length) {
            // Final segment: from last gap end to data end
            segmentStart = detectedGaps[i - 1].endX;
            segmentEnd = xRange.max;
          } else {
            // Middle segments: from previous gap end to current gap start
            segmentStart = detectedGaps[i - 1].endX;
            segmentEnd = detectedGaps[i].startX;
          }
          
          if (value >= segmentStart && value <= segmentEnd) {
            // Value is in this segment - calculate position within segment
            const segmentPosition = (value - segmentStart) * timeToPixelRatio;
            return chartArea.x + cumulativePixels + segmentPosition + (cumulativeGaps * fixedGapWidth);
          }
          
          // Add this segment's width to cumulative total
          const segmentTimeSpan = segmentEnd - segmentStart;
          cumulativePixels += segmentTimeSpan * timeToPixelRatio;
          
          // Add gap after this segment (except for the last segment)
          if (i < detectedGaps.length) {
            cumulativeGaps++;
          }
        }
        
        // Fallback (shouldn't reach here)
        // console.warn('Value not found in any segment:', value, 'xRange:', xRange);
        return chartArea.x;
      };

      const unscaleX = (coordinate: number): number => {
        if (totalDataTimeSpan === 0) return xRange.min;

        // Remove chart area offset
        const relativeCoord = coordinate - chartArea.x;
        
        // Find which segment this coordinate falls in
        let cumulativePixels = 0;
        let cumulativeGaps = 0;
        
        // Check each segment
        for (let i = 0; i <= detectedGaps.length; i++) {
          let segmentStart: number;
          let segmentEnd: number;
          
          if (i === 0) {
            segmentStart = xRange.min;
            segmentEnd = detectedGaps.length > 0 ? detectedGaps[0].startX : xRange.max;
          } else if (i === detectedGaps.length) {
            segmentStart = detectedGaps[i - 1].endX;
            segmentEnd = xRange.max;
          } else {
            segmentStart = detectedGaps[i - 1].endX;
            segmentEnd = detectedGaps[i].startX;
          }
          
          const segmentTimeSpan = segmentEnd - segmentStart;
          const segmentPixelWidth = segmentTimeSpan * timeToPixelRatio;
          const segmentStartPixel = cumulativePixels + (cumulativeGaps * fixedGapWidth);
          const segmentEndPixel = segmentStartPixel + segmentPixelWidth;
          
          if (relativeCoord >= segmentStartPixel && relativeCoord <= segmentEndPixel) {
            // Coordinate is in this segment
            const positionInSegment = relativeCoord - segmentStartPixel;
            const timeInSegment = positionInSegment / timeToPixelRatio;
            return segmentStart + timeInSegment;
          }
          
          // Add this segment's width
          cumulativePixels += segmentPixelWidth;
          
          // Check if coordinate is in the gap after this segment
          if (i < detectedGaps.length) {
            const gapStartPixel = segmentEndPixel;
            const gapEndPixel = gapStartPixel + fixedGapWidth;
            
            if (relativeCoord >= gapStartPixel && relativeCoord <= gapEndPixel) {
              // Coordinate is within the gap - return gap start time
              return segmentEnd;
            }
            
            cumulativeGaps++;
          }
        }
        
        // Fallback
        // console.warn('Coordinate not found in any segment:', relativeCoord);
        return xRange.min;
      };

      return { scaleX, unscaleX };
    };

    const { scaleX, unscaleX } = createScalingFunctions();

    // Standard Y scaling (unchanged)
    const scaleY = (value: number): number => {
      const ySpan = yRange.max - yRange.min;
      if (ySpan === 0) return chartArea.y + chartArea.height / 2;
      
      // Invert Y axis (SVG coordinates start from top)
      return chartArea.y + chartArea.height - ((value - yRange.min) / ySpan) * chartArea.height;
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

    // // DEBUG: Print scaled X coordinates when fixed width gaps are enabled
    // if (gaps?.enabled && gaps?.fixedWidthGaps) {
    //   console.log('SCALED X COORDINATES:');
    //   console.log('First 10 points:', scaledData.slice(0, 10).map(p => ({ originalX: p.originalX, scaledX: p.x })));
    //   console.log('Last 10 points:', scaledData.slice(-10).map(p => ({ originalX: p.originalX, scaledX: p.x })));
    //   console.log('Points around detected gaps:');
    //   detectedGaps.forEach((gap, gapIndex) => {
    //     console.log(`Gap ${gapIndex + 1} (${gap.startX} to ${gap.endX}):`);
    //     const beforeGap = scaledData.find(p => p.originalX === gap.startX);
    //     const afterGap = scaledData.find(p => p.originalX === gap.endX);
    //     console.log(`  Before gap (${gap.startX}): x=${beforeGap?.x}`);
    //     console.log(`  After gap (${gap.endX}): x=${afterGap?.x}`);
    //     if (beforeGap && afterGap) {
    //       console.log(`  Visual gap width: ${afterGap.x - beforeGap.x}px`);
    //     }
    //   });
    // }

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
;
