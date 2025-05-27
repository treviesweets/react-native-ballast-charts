/**
 * useChartDimensions Hook - Unit Tests
 * Tests for dynamic padding calculation and chart area dimensions
 */

import { renderHook } from '@testing-library/react-native';
import { useChartDimensions } from '../../src/hooks/useChartDimensions';

describe('useChartDimensions Hook', () => {
  describe('Basic Dimensions', () => {
    it('calculates basic chart area with default padding', () => {
      const { result } = renderHook(() =>
        useChartDimensions({
          width: 300,
          height: 200,
        })
      );

      expect(result.current).toEqual({
        chartArea: {
          x: 20, // Default left padding
          y: 10, // Default top padding
          width: 260, // 300 - 20 (left) - 20 (right)
          height: 170, // 200 - 10 (top) - 20 (bottom)
        },
        padding: {
          top: 10,
          right: 20,
          bottom: 20,
          left: 20,
        },
      });
    });

    it('calculates chart area with custom padding', () => {
      const { result } = renderHook(() =>
        useChartDimensions({
          width: 400,
          height: 300,
          padding: {
            top: 25,
            right: 35,
            bottom: 45,
            left: 55,
          },
        })
      );

      expect(result.current).toEqual({
        chartArea: {
          x: 55,
          y: 25,
          width: 310, // 400 - 55 - 35
          height: 230, // 300 - 25 - 45
        },
        padding: {
          top: 25,
          right: 35,
          bottom: 45,
          left: 55,
        },
      });
    });

    it('calculates chart area with partial custom padding', () => {
      const { result } = renderHook(() =>
        useChartDimensions({
          width: 350,
          height: 250,
          padding: {
            top: 15,
            left: 30,
          },
        })
      );

      expect(result.current).toEqual({
        chartArea: {
          x: 30,
          y: 15,
          width: 300, // 350 - 30 - 20 (default right)
          height: 215, // 250 - 15 - 20 (default bottom)
        },
        padding: {
          top: 15,
          right: 20, // Default
          bottom: 20, // Default
          left: 30,
        },
      });
    });
  });

  describe('Dynamic Padding Based on Axes', () => {
    it('calculates minimal padding when both axes are hidden', () => {
      const { result } = renderHook(() =>
        useChartDimensions({
          width: 300,
          height: 200,
          axes: {
            x: { visible: false },
            y: { visible: false },
          },
        })
      );

      expect(result.current.padding).toEqual({
        top: 10, // Always use default top
        right: 20, // Always use default right
        bottom: 5, // Minimal for hidden x-axis
        left: 5, // Minimal for hidden y-axis
      });
    });

    it('calculates expanded padding when both axes are visible', () => {
      const { result } = renderHook(() =>
        useChartDimensions({
          width: 300,
          height: 200,
          axes: {
            x: { visible: true },
            y: { visible: true },
          },
        })
      );

      expect(result.current.padding).toEqual({
        top: 10, // Always use default top
        right: 20, // Always use default right
        bottom: 35, // Space for x-axis labels
        left: 50, // Space for y-axis labels
      });
    });

    it('calculates padding when only x-axis is visible', () => {
      const { result } = renderHook(() =>
        useChartDimensions({
          width: 300,
          height: 200,
          axes: {
            x: { visible: true },
            y: { visible: false },
          },
        })
      );

      expect(result.current.padding).toEqual({
        top: 10,
        right: 20,
        bottom: 35, // Space for x-axis
        left: 5, // Minimal for hidden y-axis
      });
    });

    it('calculates padding when only y-axis is visible', () => {
      const { result } = renderHook(() =>
        useChartDimensions({
          width: 300,
          height: 200,
          axes: {
            x: { visible: false },
            y: { visible: true },
          },
        })
      );

      expect(result.current.padding).toEqual({
        top: 10,
        right: 20,
        bottom: 5, // Minimal for hidden x-axis
        left: 50, // Space for y-axis
      });
    });

    it('respects custom padding over dynamic calculation', () => {
      const { result } = renderHook(() =>
        useChartDimensions({
          width: 300,
          height: 200,
          padding: {
            top: 30,
            right: 40,
            bottom: 50,
            left: 60,
          },
          axes: {
            x: { visible: true },
            y: { visible: true },
          },
        })
      );

      // Custom padding should override dynamic calculation
      expect(result.current.padding).toEqual({
        top: 30,
        right: 40,
        bottom: 50,
        left: 60,
      });
    });
  });

  describe('Chart Area Calculations', () => {
    it('ensures chart area is never negative', () => {
      const { result } = renderHook(() =>
        useChartDimensions({
          width: 50, // Very small width
          height: 30, // Very small height
          padding: {
            top: 20,
            right: 20,
            bottom: 20,
            left: 20,
          },
        })
      );

      // Chart area should be at least 1x1
      expect(result.current.chartArea.width).toBeGreaterThanOrEqual(1);
      expect(result.current.chartArea.height).toBeGreaterThanOrEqual(1);
    });

    it('handles zero dimensions gracefully', () => {
      const { result } = renderHook(() =>
        useChartDimensions({
          width: 0,
          height: 0,
        })
      );

      expect(result.current.chartArea.width).toBeGreaterThanOrEqual(1);
      expect(result.current.chartArea.height).toBeGreaterThanOrEqual(1);
    });

    it('recalculates when dimensions change', () => {
      const { result, rerender } = renderHook(
        ({ width, height }) => useChartDimensions({ width, height }),
        {
          initialProps: { width: 300, height: 200 },
        }
      );

      const initialResult = result.current;

      // Change dimensions
      rerender({ width: 400, height: 300 });

      expect(result.current.chartArea.width).toBe(360); // 400 - 40
      expect(result.current.chartArea.height).toBe(270); // 300 - 30
      expect(result.current).not.toEqual(initialResult);
    });

    it('recalculates when axes configuration changes', () => {
      const { result, rerender } = renderHook(
        ({ axes }) => useChartDimensions({ width: 300, height: 200, axes }),
        {
          initialProps: { 
            axes: { x: { visible: false }, y: { visible: false } } 
          },
        }
      );

      const initialPadding = result.current.padding;

      // Show both axes
      rerender({ 
        axes: { x: { visible: true }, y: { visible: true } } 
      });

      expect(result.current.padding.bottom).toBeGreaterThan(initialPadding.bottom);
      expect(result.current.padding.left).toBeGreaterThan(initialPadding.left);
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined axes configuration', () => {
      const { result } = renderHook(() =>
        useChartDimensions({
          width: 300,
          height: 200,
          axes: undefined,
        })
      );

      // Should use default padding when axes is undefined
      expect(result.current.padding).toEqual({
        top: 10,
        right: 20,
        bottom: 20,
        left: 20,
      });
    });

    it('handles partial axes configuration', () => {
      const { result } = renderHook(() =>
        useChartDimensions({
          width: 300,
          height: 200,
          axes: {
            x: { visible: true },
            // y is undefined
          },
        })
      );

      expect(result.current.padding.bottom).toBe(35); // X-axis visible
      expect(result.current.padding.left).toBe(20); // Y-axis uses default
    });

    it('handles very large dimensions', () => {
      const { result } = renderHook(() =>
        useChartDimensions({
          width: 5000,
          height: 3000,
        })
      );

      expect(result.current.chartArea.width).toBe(4960); // 5000 - 40
      expect(result.current.chartArea.height).toBe(2970); // 3000 - 30
    });

    it('memoizes result for same inputs', () => {
      const { result, rerender } = renderHook(() =>
        useChartDimensions({
          width: 300,
          height: 200,
          padding: { top: 10, right: 20, bottom: 20, left: 20 },
        })
      );

      const firstResult = result.current;
      
      // Re-render with same props
      rerender();
      
      expect(result.current).toBe(firstResult); // Should be the same object reference
    });
  });
});
