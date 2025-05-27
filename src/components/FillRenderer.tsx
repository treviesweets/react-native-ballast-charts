/**
 * FillRenderer Component
 * Renders fill area under the line for distribution charts
 */

import React from 'react';
import { Path } from 'react-native-svg';
import {
  Rectangle,
  FillStyle,
  ScaledPoint
} from '../utils/types';
import { generateFillPath } from '../utils/pathGeneration';

interface FillRendererProps {
  scaledData: ScaledPoint[];
  chartArea: Rectangle;
  fillStyle: FillStyle;
}

/**
 * Renders fill area under the line for distribution charts
 */
export const FillRenderer: React.FC<FillRendererProps> = ({
  scaledData,
  chartArea,
  fillStyle
}) => {
  if (!fillStyle.enabled || scaledData.length === 0) return null;

  const fillPath = generateFillPath(scaledData, chartArea);

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
