/**
 * DragLine Component - Production Ready
 * High-performance visual interaction component for chart crosshair
 * 
 * Features:
 * - Smooth 60fps animations using Reanimated 2
 * - Vertical line spanning chart height with crosshair dot
 * - Configurable styling and opacity transitions
 * - Pure visual component with no gesture detection
 * - Optimized for worklet-safe coordinate positioning
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  SharedValue,
  withTiming
} from 'react-native-reanimated';
import { Rectangle, LineStyle, DEFAULT_STYLES } from '../utils/types';

// Debug flag - set to false for production
const DEBUG_DRAG_LINE = false;

interface DragLineProps {
  /** Animated X position from gesture handler */
  dragX: SharedValue<number>;
  /** Animated Y position from gesture handler */
  dragY: SharedValue<number>;
  /** Whether drag interaction is active */
  isActive: SharedValue<boolean>;
  /** Chart drawable area */
  chartArea: Rectangle;
  /** Total chart height */
  height: number;
  /** Optional custom line styling */
  lineStyle?: LineStyle;
}

/**
 * Visual drag line component with smooth animations
 * 
 * Renders interactive crosshair consisting of:
 * - Vertical line spanning the full chart height
 * - Crosshair dot positioned at data intersection point
 * - Smooth opacity and scale transitions based on interaction state
 * 
 * Performance optimizations:
 * - Uses worklet-based animations for 60fps performance
 * - Minimal re-renders with SharedValue positioning
 * - Optimized shadow and elevation effects
 * 
 * @param props - Component configuration
 * @returns Animated drag line and crosshair dot
 */
export const DragLine: React.FC<DragLineProps> = ({
  dragX,
  dragY,
  isActive,
  chartArea,
  height,
  lineStyle
}) => {
  if (DEBUG_DRAG_LINE) {
    console.log('🎯 DragLine: Component rendering with props:', {
      chartArea,
      height,
      hasCustomStyle: !!lineStyle
    });
  }

  // Merge with default styles
  const resolvedStyle = {
    ...DEFAULT_STYLES.dragLine,
    ...lineStyle
  };

  if (DEBUG_DRAG_LINE) {
    console.log('🎨 DragLine: Resolved style:', resolvedStyle);
  }

  /**
   * Animated styles for the vertical line
   * Handles opacity transitions based on interaction state
   */
  const lineAnimatedStyle = useAnimatedStyle(() => {
    const opacity = isActive.value 
      ? resolvedStyle.opacity ?? 0.8
      : withTiming(0.4, { duration: 200 });

    return {
      transform: [{ translateX: dragX.value }] as any,
      opacity,
      backgroundColor: resolvedStyle.color,
      width: resolvedStyle.width,
    };
  });

  /**
   * Animated styles for the crosshair dot
   * Handles scale and opacity transitions with smooth animations
   */
  const dotAnimatedStyle = useAnimatedStyle(() => {
    const scale = isActive.value 
      ? withTiming(1.2, { duration: 150 })
      : withTiming(1, { duration: 150 });

    const opacity = isActive.value 
      ? 1
      : withTiming(0.6, { duration: 200 });

    return {
      transform: [
        { translateX: dragX.value - 4 }, // Center the 8px dot
        { translateY: dragY.value - 4 },
        { scale }
      ] as any,
      opacity,
      backgroundColor: resolvedStyle.color,
    };
  });

  if (DEBUG_DRAG_LINE) {
    console.log('✅ DragLine: Animation styles configured, rendering components');
  }

  return (
    <>
      {/* Vertical line spanning chart height */}
      <Animated.View
        style={[
          styles.verticalLine,
          {
            top: chartArea.y,
            height: chartArea.height,
          },
          lineAnimatedStyle
        ]}
        pointerEvents="none"
      />

      {/* Crosshair dot at data point intersection */}
      <Animated.View
        style={[styles.crosshairDot, dotAnimatedStyle]}
        pointerEvents="none"
      />
    </>
  );
};

const styles = StyleSheet.create({
  verticalLine: {
    position: 'absolute',
    left: 0,
    zIndex: 10,
  },
  crosshairDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    zIndex: 11,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2, // Android shadow
  },
});

export default DragLine;