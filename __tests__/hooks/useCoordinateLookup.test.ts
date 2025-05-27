/**
 * useCoordinateLookup Hook - Unit Tests
 * Tests for coordinate system conversion and data point lookup
 */

import { renderHook } from '@testing-library/react-native';
import { useCoordinateLookup } from '../../src/hooks/useCoordinateLookup';
import { createMockChartData } from '../setup';

describe('useCoordinateLookup Hook', () => {
  const mockChartArea = {
    x: 50,
    y: 20,
    width: 300,
    height: 200,
  };

  const mockScaledData = {
    points: [
      { x: 0, y: 100, originalX: 0, originalY: 100 },
      { x: 1, y: 150, originalX: 1, originalY: 150 },
      { x: 2, y: 200, originalX: 2, originalY: 200 },
      { x: 3, y: 120, originalX: 3, originalY: 120 },
      { x: 4, y: 180, originalX: 4, originalY: 180 },
    ],
    xRange: { min: 0, max: 4 },
    yRange: { min: 100, max: 200 },
  };

  describe('Basic Coordinate Conversion', () => {
    it('converts screen coordinates to data coordinates', () => {
      const { result } = renderHook(() =>
        useCoordinateLookup(mockScaledData, mockChartArea)
      );

      // Test coordinate conversion at center of chart
      const centerX = mockChartArea.x + mockChartArea.width / 2; // 200
      const centerY = mockChartArea.y + mockChartArea.height / 2; // 120
      
      const dataCoords = result.current.screenToData(centerX, centerY);
      
      expect(dataCoords.x).toBeCloseTo(2, 1); // Middle of x range (0-4)
      expect(dataCoords.y).toBeCloseTo(150, 5); // Middle of y range (100-200)
    });

    it('converts data coordinates to screen coordinates', () => {
      const { result } = renderHook(() =>
        useCoordinateLookup(mockScaledData, mockChartArea)
      );

      const screenCoords = result.current.dataToScreen(2, 150);
      
      expect(screenCoords.x).toBeCloseTo(200, 1); // Center X
      expect(screenCoords.y).toBeCloseTo(120, 1); // Center Y
    });

    it('handles coordinates at chart boundaries', () => {
      const { result } = renderHook(() =>
        useCoordinateLookup(mockScaledData, mockChartArea)
      );

      // Left edge
      const leftEdge = result.current.screenToData(mockChartArea.x, mockChartArea.y);
      expect(leftEdge.x).toBeCloseTo(0, 1);
      expect(leftEdge.y).toBeCloseTo(200, 5); // Y is inverted

      // Right edge
      const rightEdge = result.current.screenToData(
        mockChartArea.x + mockChartArea.width, 
        mockChartArea.y + mockChartArea.height
      );
      expect(rightEdge.x).toBeCloseTo(4, 1);
      expect(rightEdge.y).toBeCloseTo(100, 5); // Y is inverted
    });
  });

  describe('Data Point Lookup', () => {
    it('finds nearest data point for screen coordinates', () => {
      const { result } = renderHook(() =>
        useCoordinateLookup(mockScaledData, mockChartArea)
      );

      // Screen coordinate close to first data point
      const nearFirstPoint = mockChartArea.x + 10; // Near x=0
      const nearestPoint = result.current.findNearestPoint(nearFirstPoint, mockChartArea.y + 100);
      
      expect(nearestPoint).toEqual({
        point: mockScaledData.points[0],
        index: 0,
        distance: expect.any(Number),
      });
    });

    it('interpolates values between data points', () => {
      const { result } = renderHook(() =>
        useCoordinateLookup(mockScaledData, mockChartArea)
      );

      // Get interpolated value between points 1 and 2
      const midX = mockChartArea.x + (mockChartArea.width * 1.5) / 4; // Between x=1 and x=2
      const interpolated = result.current.interpolateAtX(midX);
      
      expect(interpolated).toBeDefined();
      expect(interpolated!.x).toBeCloseTo(1.5, 1);
      expect(interpolated!.y).toBeCloseTo(175, 5); // Between 150 and 200
    });

    it('returns null for interpolation outside data range', () => {
      const { result } = renderHook(() =>
        useCoordinateLookup(mockScaledData, mockChartArea)
      );

      // Try to interpolate before first point
      const beforeRange = mockChartArea.x - 50;
      const interpolated = result.current.interpolateAtX(beforeRange);
      
      expect(interpolated).toBeNull();
    });

    it('handles exact matches for interpolation', () => {
      const { result } = renderHook(() =>
        useCoordinateLookup(mockScaledData, mockChartArea)
      );

      // Screen coordinate exactly at a data point
      const exactX = mockChartArea.x + (mockChartArea.width * 2) / 4; // Exactly at x=2
      const interpolated = result.current.interpolateAtX(exactX);
      
      expect(interpolated).toBeDefined();
      expect(interpolated!.x).toBeCloseTo(2, 1);
      expect(interpolated!.y).toBeCloseTo(200, 5);
    });
  });

  describe('Worklet Safety', () => {
    it('provides worklet-safe coordinate conversion functions', () => {
      const { result } = renderHook(() =>
        useCoordinateLookup(mockScaledData, mockChartArea)
      );

      // Functions should be marked as worklets for React Native Reanimated
      expect(result.current.screenToData.toString()).toContain('worklet');
      expect(result.current.dataToScreen.toString()).toContain('worklet');
      expect(result.current.findNearestPoint.toString()).toContain('worklet');
    });
  });

  describe('Edge Cases', () => {
    it('handles single data point', () => {
      const singlePointData = {
        points: [{ x: 5, y: 150, originalX: 5, originalY: 150 }],
        xRange: { min: 5, max: 5 },
        yRange: { min: 150, max: 150 },
      };

      const { result } = renderHook(() =>
        useCoordinateLookup(singlePointData, mockChartArea)
      );

      const dataCoords = result.current.screenToData(200, 120);
      expect(dataCoords.x).toBeCloseTo(5, 1);
      expect(dataCoords.y).toBeCloseTo(150, 5);
    });

    it('handles zero-width chart area', () => {
      const zeroWidthArea = { ...mockChartArea, width: 0 };
      
      const { result } = renderHook(() =>
        useCoordinateLookup(mockScaledData, zeroWidthArea)
      );

      const dataCoords = result.current.screenToData(50, 120);
      expect(dataCoords.x).toBe(0); // Should default to min
    });

    it('handles zero-height chart area', () => {
      const zeroHeightArea = { ...mockChartArea, height: 0 };
      
      const { result } = renderHook(() =>
        useCoordinateLookup(mockScaledData, zeroHeightArea)
      );

      const dataCoords = result.current.screenToData(200, 20);
      expect(dataCoords.y).toBe(100); // Should default to min
    });

    it('handles coordinates outside chart area', () => {
      const { result } = renderHook(() =>
        useCoordinateLookup(mockScaledData, mockChartArea)
      );

      // Coordinates way outside chart
      const outsideCoords = result.current.screenToData(1000, -100);
      
      // Should extrapolate based on data range
      expect(outsideCoords.x).toBeGreaterThan(4);
      expect(outsideCoords.y).toBeGreaterThan(200);
    });
  });

  describe('Performance', () => {
    it('updates when scaled data changes', () => {
      const { result, rerender } = renderHook(
        ({ scaledData }) => useCoordinateLookup(scaledData, mockChartArea),
        { initialProps: { scaledData: mockScaledData } }
      );

      const initialResult = result.current;

      // Update with new scaled data
      const newScaledData = {
        ...mockScaledData,
        points: mockScaledData.points.map(p => ({ ...p, y: p.y + 50 })),
        yRange: { min: 150, max: 250 },
      };

      rerender({ scaledData: newScaledData });

      expect(result.current).not.toBe(initialResult);
    });

    it('updates when chart area changes', () => {
      const { result, rerender } = renderHook(
        ({ chartArea }) => useCoordinateLookup(mockScaledData, chartArea),
        { initialProps: { chartArea: mockChartArea } }
      );

      const initialResult = result.current;

      // Update chart area
      const newChartArea = { ...mockChartArea, width: 400 };
      rerender({ chartArea: newChartArea });

      expect(result.current).not.toBe(initialResult);
    });

    it('memoizes result for same inputs', () => {
      const { result, rerender } = renderHook(() =>
        useCoordinateLookup(mockScaledData, mockChartArea)
      );

      const firstResult = result.current;
      rerender();

      expect(result.current).toBe(firstResult);
    });
  });

  describe('Distance Calculations', () => {
    it('calculates correct distance between points', () => {
      const { result } = renderHook(() =>
        useCoordinateLookup(mockScaledData, mockChartArea)
      );

      const screenX = mockChartArea.x + 50;
      const screenY = mockChartArea.y + 50;
      const nearestPoint = result.current.findNearestPoint(screenX, screenY);
      
      expect(nearestPoint.distance).toBeGreaterThan(0);
      expect(typeof nearestPoint.distance).toBe('number');
    });

    it('finds closest point among multiple candidates', () => {
      const { result } = renderHook(() =>
        useCoordinateLookup(mockScaledData, mockChartArea)
      );

      // Coordinate very close to the last point
      const nearLastX = mockChartArea.x + mockChartArea.width - 10;
      const nearLastY = mockChartArea.y + mockChartArea.height - 10;
      const nearestPoint = result.current.findNearestPoint(nearLastX, nearLastY);
      
      expect(nearestPoint.index).toBe(mockScaledData.points.length - 1);
    });
  });

  describe('Interpolation Edge Cases', () => {
    it('handles interpolation with identical x values', () => {
      const identicalXData = {
        points: [
          { x: 2, y: 100, originalX: 2, originalY: 100 },
          { x: 2, y: 150, originalX: 2, originalY: 150 },
          { x: 2, y: 200, originalX: 2, originalY: 200 },
        ],
        xRange: { min: 2, max: 2 },
        yRange: { min: 100, max: 200 },
      };

      const { result } = renderHook(() =>
        useCoordinateLookup(identicalXData, mockChartArea)
      );

      const exactX = mockChartArea.x + mockChartArea.width / 2;
      const interpolated = result.current.interpolateAtX(exactX);
      
      expect(interpolated).toBeDefined();
      expect(interpolated!.x).toBeCloseTo(2, 1);
    });

    it('handles interpolation with unsorted data', () => {
      const unsortedData = {
        points: [
          { x: 3, y: 120, originalX: 3, originalY: 120 },
          { x: 1, y: 150, originalX: 1, originalY: 150 },
          { x: 4, y: 180, originalX: 4, originalY: 180 },
          { x: 0, y: 100, originalX: 0, originalY: 100 },
          { x: 2, y: 200, originalX: 2, originalY: 200 },
        ],
        xRange: { min: 0, max: 4 },
        yRange: { min: 100, max: 200 },
      };

      const { result } = renderHook(() =>
        useCoordinateLookup(unsortedData, mockChartArea)
      );

      const midX = mockChartArea.x + mockChartArea.width / 2;
      const interpolated = result.current.interpolateAtX(midX);
      
      expect(interpolated).toBeDefined();
    });
  });
});
