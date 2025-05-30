/**
 * Tooltip Component
 * Displays data values during drag interactions
 * Positioned absolutely with customizable location and styling
 */

import React, { ReactNode, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  SharedValue,
  withTiming,
  runOnJS,
  useAnimatedReaction
} from 'react-native-reanimated';
import {
  Rectangle,
  TooltipConfig,
  DEFAULT_STYLES
} from '../utils/types';

interface TooltipProps {
  /** Animated X position from drag */
  dragX: SharedValue<number>;
  /** Animated Y position from drag */
  dragY: SharedValue<number>;
  /** Whether drag is active */
  isActive: SharedValue<boolean>;
  /** Chart drawable area */
  chartArea: Rectangle;
  /** Function to interpolate values at X position */
  interpolateAtX: (x: number) => { x: number; y: number; index: number } | null;
  /** Convert screen X to data X */
  unscaleX: (coordinate: number) => number;
  /** Convert screen Y to data Y */
  unscaleY: (coordinate: number) => number;
  /** Tooltip configuration */
  config: TooltipConfig;
}

/**
 * Tooltip component that displays current values during interactions
 * Features:
 * - Configurable positioning (corners)
 * - Custom renderer support
 * - Smooth fade animations
 * - Automatic value formatting
 */
export const Tooltip: React.FC<TooltipProps> = ({
  dragX,
  dragY,
  isActive,
  chartArea,
  interpolateAtX,
  unscaleX,
  unscaleY,
  config
}) => {
  // Current tooltip values
  const [currentData, setCurrentData] = useState<{
    x: number;
    y: number;
    index: number;
  } | null>(null);

  // Update tooltip data when drag position changes
  useAnimatedReaction(
    () => {
      return {
        dragX: dragX.value,
        isActive: isActive.value
      };
    },
    ({ dragX: currentDragX, isActive: currentIsActive }) => {
      if (currentIsActive) {
        const interpolated = interpolateAtX(currentDragX);
        if (interpolated) {
          runOnJS(setCurrentData)(interpolated);
        }
      }
    },
    [interpolateAtX] // ✅ Add dependency array for proper cleanup
  );

  // Merge styles with defaults
  const resolvedStyle = {
    ...DEFAULT_STYLES.tooltip,
    ...config.style
  };

  // Calculate tooltip position based on config
  const getTooltipPosition = () => {
    const position = config.position || 'top-right';
    const padding = 16;

    switch (position) {
      case 'top-left':
        return { top: chartArea.y + padding, left: chartArea.x + padding };
      case 'top-right':
        return { top: chartArea.y + padding, right: padding };
      case 'bottom-left':
        return { bottom: padding, left: chartArea.x + padding };
      case 'bottom-right':
        return { bottom: padding, right: padding };
      default:
        return { top: chartArea.y + padding, right: padding };
    }
  };

  // Animated tooltip styles
  const tooltipAnimatedStyle = useAnimatedStyle(() => {
    const opacity = isActive.value 
      ? withTiming(1, { duration: 200 })
      : withTiming(0, { duration: 300 });

    const scale = isActive.value 
      ? withTiming(1, { duration: 200 })
      : withTiming(0.95, { duration: 300 });

    return {
      opacity,
      transform: [{ scale }]
    };
  });

  // Format values for display
  const formatValue = (value: number, isTime: boolean = false): string => {
    if (isTime) {
      // Assume timestamp - format as date/time
      if (value > 1000000000000) { // milliseconds
        return new Date(value).toLocaleString();
      } else if (value > 1000000000) { // seconds
        return new Date(value * 1000).toLocaleString();
      } else {
        return value.toFixed(2);
      }
    } else {
      // Format as number with appropriate precision
      if (Math.abs(value) >= 1000000) {
        return (value / 1000000).toFixed(1) + 'M';
      } else if (Math.abs(value) >= 1000) {
        return (value / 1000).toFixed(1) + 'K';
      } else if (value % 1 === 0) {
        return value.toString();
      } else {
        return value.toFixed(2);
      }
    }
  };

  // Render tooltip content
  const renderContent = (): ReactNode => {
    if (!currentData) return null;

    // Use custom renderer if provided
    if (config.renderer) {
      return config.renderer(currentData.x, currentData.y, currentData.index);
    }

    // Default renderer
    return (
      <View style={styles.defaultContent}>
        <Text style={[styles.defaultText, { color: resolvedStyle.textColor }]}>
          X: {formatValue(currentData.x, true)}
        </Text>
        <Text style={[styles.defaultText, { color: resolvedStyle.textColor }]}>
          Y: {formatValue(currentData.y)}
        </Text>
      </View>
    );
  };

  const tooltipPosition = getTooltipPosition();

  return (
    <Animated.View
      style={[
        styles.tooltip,
        tooltipPosition,
        {
          backgroundColor: resolvedStyle.backgroundColor,
          borderColor: resolvedStyle.borderColor,
          borderWidth: resolvedStyle.borderWidth || 0,
          borderRadius: resolvedStyle.borderRadius,
          padding: resolvedStyle.padding,
          shadowColor: resolvedStyle.shadowColor,
          shadowOpacity: resolvedStyle.shadowOpacity,
          shadowRadius: resolvedStyle.shadowRadius,
          shadowOffset: { width: 0, height: 2 },
          elevation: 4, // Android shadow
        },
        tooltipAnimatedStyle
      ]}
      pointerEvents="none"
    >
      {renderContent()}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tooltip: {
    position: 'absolute',
    zIndex: 20,
    minWidth: 80,
  },
  defaultContent: {
    gap: 4,
  },
  defaultText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default Tooltip;
