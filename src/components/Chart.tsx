/**
 * Chart Component - Production Ready
 * High-performance interactive financial chart with worklet-safe gesture handling
 * 
 * Features:
 * - Interactive stock charts with draggable crosshair
 * - Worklet-safe gesture handling with precise coordinate lookup
 * - Smooth 60fps performance with React Native Reanimated
 * - Configurable styling and interaction callbacks
 * - Comprehensive error handling and validation
 */

import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg from 'react-native-svg';
import { GestureDetector } from 'react-native-gesture-handler';
import { ChartProps, DEFAULT_STYLES } from '../utils/types';
import { useChartDimensions } from '../hooks/useChartDimensions';
import { useDataScaling } from '../hooks/useDataScaling';
import { useCoordinateLookup } from '../hooks/useCoordinateLookup';
import { useGestureHandling } from '../hooks/useGestureHandling';
import { useInterpolation } from '../hooks/useInterpolation';
import { validateData } from '../utils/validation';
import { LineRenderer } from './LineRenderer';
import { AxisRenderer } from './AxisRenderer';
import { IndicatorRenderer } from './IndicatorRenderer';
import { DragLine } from './DragLine';
import { Tooltip } from './Tooltip';
import { FillRenderer } from './FillRenderer';

// Debug flag - set to false for production
const DEBUG_CHART = false;

/**
 * Main Chart Component
 * 
 * Renders interactive financial charts with the following architecture:
 * 1. Data validation and error handling
 * 2. Chart dimensions and scaling calculations
 * 3. Worklet-safe coordinate lookup system
 * 4. High-performance gesture handling
 * 5. SVG-based chart rendering with optional interactions
 * 
 * @param props - Chart configuration and data
 * @returns Rendered chart component
 */
export const Chart: React.FC<ChartProps> = ({ 
  data, 
  width, 
  height, 
  padding, 
  style, 
  lineStyle, 
  fillStyle, 
  axes, 
  indicators = [], 
  interaction, 
  tooltip, 
  gaps, 
  accessibilityLabel = 'Financial Chart' 
}) => {
  if (DEBUG_CHART) {
    console.log('📊 Chart: Component rendering started');
    console.log('📋 Chart props:', { 
      width, 
      height, 
      dataPoints: data?.x?.length || 0,
      interactionEnabled: interaction?.enabled || false,
      tooltipEnabled: tooltip?.enabled || false,
      hasCallbacks: {
        onDrag: !!interaction?.onDrag,
        onDragStart: !!interaction?.onDragStart,
        onDragEnd: !!interaction?.onDragEnd,
        onTap: !!interaction?.onTap
      }
    });
  }

  // Data validation with memoized error handling
  const validationError = useMemo(() => { 
    if (DEBUG_CHART) {
      console.log('🔍 Chart: Validating data...');
    }
    
    try { 
      validateData(data);
      if (DEBUG_CHART) {
        console.log('✅ Chart: Data validation passed');
      }
      return null; 
    } catch (e) { 
      if (DEBUG_CHART) {
        console.log('❌ Chart: Data validation failed:', e);
      }
      return e as Error; 
    } 
  }, [data]);

  // Core chart calculations
  const { chartArea } = useChartDimensions({ width, height, padding, axes });
  const { scaledData, xRange, yRange, scaleX, scaleY, unscaleX, unscaleY } = useDataScaling({ 
    data, 
    chartArea, 
    gaps 
  });

  if (DEBUG_CHART) {
    console.log('📐 Chart calculations complete:', { 
      chartArea,
      scaledDataLength: scaledData.length,
      xRange: `${xRange.min} to ${xRange.max}`,
      yRange: `${yRange.min} to ${yRange.max}`
    });
  }

  // Worklet-safe coordinate lookup system
  const { lookupTable } = useCoordinateLookup({ 
    data, 
    chartArea, 
    scaledData 
  });

  // High-performance gesture handling
  const { dragX, dragY, isActive, gestureHandler } = useGestureHandling({ 
    lookupTable, 
    enabled: interaction?.enabled ?? false, 
    chartArea,
    onDrag: interaction?.onDrag, 
    onDragStart: interaction?.onDragStart, 
    onDragEnd: interaction?.onDragEnd, 
    onTap: interaction?.onTap 
  });

  // Additional chart utilities
  const { interpolateAtX, findNearestPoint } = useInterpolation({ scaledData, chartArea });
  
  // Memoized style resolution
  const resolvedLineStyle = useMemo(() => ({ 
    ...DEFAULT_STYLES.line, 
    ...lineStyle 
  }), [lineStyle]);
  
  const resolvedFillStyle = useMemo(() => ({ 
    ...DEFAULT_STYLES.fill, 
    ...fillStyle 
  }), [fillStyle]);

  if (DEBUG_CHART) {
    console.log('✅ Chart: All hooks initialized successfully');
  }

  // Error state rendering
  if (validationError) {
    if (DEBUG_CHART) {
      console.log('❌ Chart: Rendering error state');
    }
    
    return (
      <View 
        style={[styles.container, { width, height }, style, styles.errorContainer]} 
        accessibilityLabel={`Chart Error: ${validationError.message}`}
      >
        <View style={styles.errorContent} />
      </View>
    );
  }

  if (DEBUG_CHART) {
    console.log('🎨 Chart: Rendering main chart components');
  }

  // Main chart render
  return (
    <View style={[styles.container, { width, height }, style]} accessibilityLabel={accessibilityLabel}>
      <GestureDetector gesture={gestureHandler}>
        <View style={{ width, height }}>
          <Svg width={width} height={height} style={styles.svg} viewBox={`0 0 ${width} ${height}`}>
            {/* Fill area (rendered first, behind line) */}
            {resolvedFillStyle.enabled && (
              <FillRenderer 
                scaledData={scaledData} 
                chartArea={chartArea} 
                fillStyle={resolvedFillStyle} 
              />
            )}
            
            {/* Main chart line */}
            <LineRenderer 
              scaledData={scaledData} 
              lineStyle={resolvedLineStyle} 
              gaps={gaps} 
            />
            
            {/* Vertical indicator lines */}
            {indicators.length > 0 && (
              <IndicatorRenderer 
                indicators={indicators} 
                chartArea={chartArea} 
                scaleX={scaleX} 
              />
            )}
            
            {/* Chart axes (rendered last, on top) */}
            <AxisRenderer 
              chartArea={chartArea} 
              xRange={xRange} 
              yRange={yRange} 
              axes={axes} 
              scaledData={scaledData}
              data={data} 
            />
          </Svg>
          
          {/* Interactive drag line overlay */}
          {interaction?.enabled && (
            <DragLine 
              dragX={dragX} 
              dragY={dragY} 
              isActive={isActive} 
              chartArea={chartArea} 
              height={height} 
              lineStyle={interaction.dragLineStyle} 
            />
          )}
        </View>
      </GestureDetector>
      
      {/* Tooltip overlay */}
      {tooltip?.enabled && interaction?.enabled && (
        <Tooltip 
          dragX={dragX} 
          dragY={dragY} 
          isActive={isActive} 
          chartArea={chartArea} 
          interpolateAtX={interpolateAtX} 
          unscaleX={unscaleX} 
          unscaleY={unscaleY} 
          config={tooltip} 
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    position: 'relative', 
    backgroundColor: 'transparent' 
  }, 
  svg: { 
    position: 'absolute', 
    top: 0, 
    left: 0 
  }, 
  errorContainer: { 
    backgroundColor: '#fef2f2', 
    borderWidth: 1, 
    borderColor: '#fecaca', 
    borderRadius: 4, 
    justifyContent: 'center', 
    alignItems: 'center' 
  }, 
  errorContent: { 
    padding: 16, 
    alignItems: 'center' 
  }
});

export default Chart;
