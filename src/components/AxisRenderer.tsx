/**
 * AxisRenderer Component
 * Renders X and Y axes with automatic label generation and accurate positioning
 * Uses useCoordinateLookup for precise alignment with data points
 */

import React from 'react';
import { G, Line, Text as SvgText } from 'react-native-svg';
import {
  Rectangle,
  AxisConfig,
  ScaledPoint,
  Range,
  DEFAULT_STYLES,
  ChartData
} from '../utils/types';
import { useCoordinateLookup } from '../hooks/useCoordinateLookup';

interface AxisRendererProps {
  chartArea: Rectangle;
  xRange: Range;
  yRange: Range;
  axes?: AxisConfig;
  scaledData: ScaledPoint[];
  data: ChartData;
}

/**
 * Generates date labels for X-axis (start, middle, end)
 */
const generateDateLabels = (data: ChartData, scaledData: ScaledPoint[]): Array<{ label: string; scaledX: number; index: number }> => {
  if (scaledData.length === 0 || data.x.length === 0) return [];
  
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  const startIndex = 0;
  const middleIndex = Math.floor(scaledData.length / 2);
  const endIndex = scaledData.length - 1;
  
  return [
    {
      label: formatDate(data.x[startIndex]),
      scaledX: scaledData[startIndex]?.x || 0,
      index: startIndex
    },
    {
      label: formatDate(data.x[middleIndex]),
      scaledX: scaledData[middleIndex]?.x || 0,  
      index: middleIndex
    },
    {
      label: formatDate(data.x[endIndex]),
      scaledX: scaledData[endIndex].x,
      index: endIndex
    }
  ];
};

/**
 * Generates price labels for Y-axis (lowest, middle, highest)
 */
const generatePriceLabels = (data: ChartData, scaledData: ScaledPoint[]): Array<{ label: string; scaledY: number; value: number }> => {
  if (data.y.length === 0) return [];
  
  const formatPrice = (price: number): string => {
    return `$${price.toFixed(2)}`;
  };
  
  const minPrice = Math.min(...data.y);
  const maxPrice = Math.max(...data.y);
  const middlePrice = (minPrice + maxPrice) / 2;
  
  // Find the scaled Y positions for these price levels
  // We need to use the same scaling logic as the chart
  const minScaledY = Math.max(...scaledData.map(p => p.y)); // Highest Y coord (lowest price)
  const maxScaledY = Math.min(...scaledData.map(p => p.y)); // Lowest Y coord (highest price)
  const middleScaledY = (minScaledY + maxScaledY) / 2;
  
  return [
    {
      label: formatPrice(maxPrice),
      scaledY: maxScaledY,
      value: maxPrice
    },
    {
      label: formatPrice(middlePrice),
      scaledY: middleScaledY,
      value: middlePrice
    },
    {
      label: formatPrice(minPrice),
      scaledY: minScaledY,
      value: minPrice
    }
  ];
};

/**
 * Renders chart axes with automatic label generation and precise positioning
 */
export const AxisRenderer: React.FC<AxisRendererProps> = ({
  chartArea,
  xRange,
  yRange,
  axes,
  scaledData,
  data
}) => {
  if (!axes) return null;

  const { x: xAxis, y: yAxis } = axes;
  const axisStyle = DEFAULT_STYLES.axis;

  // Use coordinate lookup for accurate positioning
  const { lookupTable } = useCoordinateLookup({ 
    data, 
    chartArea, 
    scaledData 
  });

  // Calculate axis positions
  const xAxisY = chartArea.y + chartArea.height;
  const yAxisX = chartArea.x;

  // Generate automatic labels
  const dateLabels = xAxis?.show ? generateDateLabels(data, scaledData) : [];
  const priceLabels = yAxis?.show ? generatePriceLabels(data, scaledData) : [];

  return (
    <G>
      {/* X Axis */}
      {xAxis?.show && (
        <G>
          {/* X axis line */}
          <Line
            x1={chartArea.x}
            y1={xAxisY}
            x2={chartArea.x + chartArea.width}
            y2={xAxisY}
            stroke={xAxis.style?.lineColor || (axisStyle?.lineColor || '#e5e7eb')}
            strokeWidth={xAxis.style?.lineWidth || (axisStyle?.lineWidth || 1)}
          />

          {/* X axis labels - using manual labels if provided, otherwise automatic */}
          {(xAxis.labels || dateLabels).map((labelData, index) => {
            // Handle both manual labels (strings) and automatic labels (objects)
            const label = typeof labelData === 'string' ? labelData : (labelData as any).label;
            const xPosition = typeof labelData === 'string' 
              ? chartArea.x + (index / ((xAxis.labels?.length || 1) - 1)) * chartArea.width
              : (labelData as any).scaledX;

            return (
              <G key={`x-label-${index}`}>
                {/* Tick mark */}
                <Line
                  x1={xPosition}
                  y1={xAxisY}
                  x2={xPosition}
                  y2={xAxisY + (xAxis.style?.tickLength || (axisStyle?.tickLength || 4))}
                  stroke={xAxis.style?.tickColor || (axisStyle?.tickColor || '#e5e7eb')}
                  strokeWidth={1}
                />
                {/* Label text */}
                <SvgText
                  x={xPosition}
                  y={xAxisY + 20}
                  fontSize={xAxis.style?.labelStyle?.fontSize || axisStyle.labelStyle?.fontSize || 12}
                  fill={xAxis.style?.labelStyle?.color || axisStyle.labelStyle?.color || '#6b7280'}
                  textAnchor="middle"
                  alignmentBaseline="central"
                >
                  {label}
                </SvgText>
              </G>
            );
          })}
        </G>
      )}

      {/* Y Axis */}
      {yAxis?.show && (
        <G>
          {/* Y axis line */}
          <Line
            x1={yAxisX}
            y1={chartArea.y}
            x2={yAxisX}
            y2={chartArea.y + chartArea.height}
            stroke={yAxis.style?.lineColor || (axisStyle?.lineColor || '#e5e7eb')}
            strokeWidth={yAxis.style?.lineWidth || (axisStyle?.lineWidth || 1)}
          />

          {/* Y axis labels - using manual labels if provided, otherwise automatic */}
          {(yAxis.labels || priceLabels).map((labelData, index) => {
            // Handle both manual labels (strings) and automatic labels (objects)
            const label = typeof labelData === 'string' ? labelData : (labelData as any).label;
            const yPosition = typeof labelData === 'string'
              ? chartArea.y + chartArea.height - (index / ((yAxis.labels?.length || 1) - 1)) * chartArea.height
              : (labelData as any).scaledY;

            return (
              <G key={`y-label-${index}`}>
                {/* Tick mark */}
                <Line
                  x1={yAxisX - (yAxis.style?.tickLength || (axisStyle?.tickLength || 4))}
                  y1={yPosition}
                  x2={yAxisX}
                  y2={yPosition}
                  stroke={yAxis.style?.tickColor || (axisStyle?.tickColor || '#e5e7eb')}
                  strokeWidth={1}
                />
                {/* Label text */}
                <SvgText
                  x={yAxisX - 10}
                  y={yPosition}
                  fontSize={yAxis.style?.labelStyle?.fontSize || axisStyle.labelStyle?.fontSize || 12}
                  fill={yAxis.style?.labelStyle?.color || axisStyle.labelStyle?.color || '#6b7280'}
                  textAnchor="end"
                  alignmentBaseline="central"
                >
                  {label}
                </SvgText>
              </G>
            );
          })}
        </G>
      )}
    </G>
  );
};

export default AxisRenderer;