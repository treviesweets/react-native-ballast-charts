/**
 * Enhanced FillRenderer Component with smooth curve support
 * This fixes the gap between the fill and the line
 */

import React from 'react';
import { Path } from 'react-native-svg';
import {
  Rectangle,
  FillStyle,
  ScaledPoint,
  LineStyle
} from '../utils/types';
import { generatePath } from '../utils/pathGeneration';

interface FillRendererProps {
  scaledData: ScaledPoint[];
  chartArea: Rectangle;
  fillStyle: FillStyle;
  lineStyle?: LineStyle;
}

/**
 * Renders fill area under the line for distribution charts
 * Uses the same smoothing algorithm as the LineRenderer
 */
export const FillRenderer: React.FC<FillRendererProps> = ({
  scaledData,
  chartArea,
  fillStyle,
  lineStyle
}) => {
  if (!fillStyle.enabled || scaledData.length === 0) return null;

  // Use the same line generation algorithm instead of the simple fill path
  let mainPath = generatePath(scaledData, undefined, lineStyle);
  
  // Create the fill area by extending the path to the bottom of the chart
  const bottomY = chartArea.y + chartArea.height;
  
  // Sort data by x-coordinate
  const sortedData = [...scaledData].sort((a, b) => a.originalX - b.originalX);
  
  // Start path and close it at the bottom
  const fillPath = `${mainPath} L ${sortedData[sortedData.length-1].x} ${bottomY} L ${sortedData[0].x} ${bottomY} Z`;

  return (
    <Path
      d={fillPath}
      fill={fillStyle.color}
      fillOpacity={fillStyle.opacity}
      stroke="none"
    />
  );
};

export default FillRenderer;