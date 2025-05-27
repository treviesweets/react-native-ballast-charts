/**
 * IndicatorRenderer Component
 * Renders vertical indicator lines at specified X values
 */

import React from 'react';
import { G, Line, Text as SvgText } from 'react-native-svg';
import {
  Rectangle,
  VerticalIndicator
} from '../utils/types';

interface IndicatorRendererProps {
  indicators: VerticalIndicator[];
  chartArea: Rectangle;
  scaleX: (value: number) => number;
}

/**
 * Renders vertical indicator lines at specified X values
 */
export const IndicatorRenderer: React.FC<IndicatorRendererProps> = ({
  indicators,
  chartArea,
  scaleX
}) => {
  if (indicators.length === 0) return null;

  return (
    <G>
      {indicators.map((indicator, index) => {
        const xPosition = scaleX(indicator.x);
        
        // Skip if indicator is outside chart bounds
        if (xPosition < chartArea.x || xPosition > chartArea.x + chartArea.width) {
          return null;
        }

        return (
          <G key={`indicator-${index}`}>
            {/* Indicator line */}
            <Line
              x1={xPosition}
              y1={chartArea.y}
              x2={xPosition}
              y2={chartArea.y + chartArea.height}
              stroke={indicator.color || '#e5e7eb'}
              strokeWidth={indicator.width || 1}
              strokeDasharray={indicator.dashed ? "4 4" : undefined}
              opacity={0.7}
            />
            
            {/* Optional label */}
            {indicator.label && (
              <SvgText
                x={xPosition + 4}
                y={chartArea.y + 12}
                fontSize={10}
                fill={indicator.color || '#6b7280'}
                textAnchor="start"
              >
                {indicator.label}
              </SvgText>
            )}
          </G>
        );
      })}
    </G>
  );
};

export default IndicatorRenderer;
