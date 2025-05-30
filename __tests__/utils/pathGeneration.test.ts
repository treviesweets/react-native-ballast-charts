/**
 * Path Generation Utilities - Unit Tests
 * Tests for SVG path generation, smoothing, and utility functions
 */

import {
  generatePath,
  generateFillPath,
  clamp,
  clampToChartArea,
} from '../../src/utils/pathGeneration';
import type { ScaledPoint, Rectangle, LineStyle, GapConfig } from '../../src/utils/types';

describe('Path Generation Utilities', () => {
  // Create proper ScaledPoint mock data
  const createMockScaledPoints = (count = 5): ScaledPoint[] => {
    return Array.from({ length: count }, (_, i) => ({
      x: i * 50,
      y: 100 + Math.sin(i) * 50,
      originalX: i * 10,
      originalY: 100 + Math.sin(i) * 50,
      index: i,
    }));
  };

  const mockScaledPoints = createMockScaledPoints();

  const mockChartArea: Rectangle = {
    x: 20,
    y: 10,
    width: 300,
    height: 200,
  };

  describe('generatePath', () => {
    it('generates basic line path from points', () => {
      const lineStyle: LineStyle = { smoothing: 'none' };
      const path = generatePath(mockScaledPoints, undefined, lineStyle);
      
      expect(path).toMatch(/^M/); // Should start with Move command
      expect(path).toContain('L'); // Should contain Line commands
      expect(path).not.toContain('C'); // Should not contain Curve commands when smoothing=none
    });

    it('generates smooth curved path when smoothing enabled', () => {
      const lineStyle: LineStyle = { smoothing: 'bezier' };
      const path = generatePath(mockScaledPoints, undefined, lineStyle);
      
      expect(path).toMatch(/^M/); // Should start with Move command
      expect(path).toContain('C'); // Should contain Curve commands for bezier smoothing
    });

    it('handles single point', () => {
      const singlePoint: ScaledPoint[] = [{
        x: 50,
        y: 100,
        originalX: 50,
        originalY: 100,
        index: 0,
      }];
      const lineStyle: LineStyle = { smoothing: 'none' };
      const path = generatePath(singlePoint, undefined, lineStyle);
      
      expect(path).toMatch(/^M/); // Should start with Move command
      expect(path).toContain('A'); // Should contain Arc for single point circle
      expect(path).not.toContain('L'); // No line commands for single point
    });

    it('handles two points', () => {
      const twoPoints = createMockScaledPoints(2);
      const lineStyle: LineStyle = { smoothing: 'none' };
      const path = generatePath(twoPoints, undefined, lineStyle);
      
      expect(path).toMatch(/^M/); // Move to first point
      expect(path).toContain('L'); // Line to second point
      expect(path).not.toContain('C'); // No curves for linear path
    });

    it('handles empty points array', () => {
      const lineStyle: LineStyle = { smoothing: 'none' };
      const path = generatePath([], undefined, lineStyle);
      
      expect(path).toBe(''); // Empty string for no points
    });

    it('applies different smoothing methods correctly', () => {
      const bezierPath = generatePath(mockScaledPoints, undefined, { smoothing: 'bezier' });
      const catmullPath = generatePath(mockScaledPoints, undefined, { smoothing: 'catmull-rom' });
      const cardinalPath = generatePath(mockScaledPoints, undefined, { smoothing: 'cardinal' });
      
      expect(bezierPath).not.toBe(catmullPath);
      expect(catmullPath).not.toBe(cardinalPath);
      expect(bezierPath).toContain('C');
      expect(catmullPath).toContain('C');
      expect(cardinalPath).toContain('C');
    });

    it('handles gaps when enabled', () => {
      const gaps: GapConfig = { enabled: true, threshold: 2.0 };
      const lineStyle: LineStyle = { smoothing: 'none' };
      
      // Create points with a large gap
      const pointsWithGap: ScaledPoint[] = [
        { x: 0, y: 100, originalX: 0, originalY: 100, index: 0 },
        { x: 50, y: 150, originalX: 10, originalY: 150, index: 1 },
        { x: 100, y: 120, originalX: 100, originalY: 120, index: 2 }, // Large gap in originalX
      ];
      
      const path = generatePath(pointsWithGap, gaps, lineStyle);
      
      expect(path).toMatch(/^M/);
      expect(path).toContain('L');
      // Should handle gaps appropriately
    });

    it('handles negative coordinates', () => {
      const negativePoints: ScaledPoint[] = [
        { x: -50, y: -100, originalX: -50, originalY: -100, index: 0 },
        { x: 0, y: 0, originalX: 0, originalY: 0, index: 1 },
        { x: 50, y: 100, originalX: 50, originalY: 100, index: 2 },
      ];
      const lineStyle: LineStyle = { smoothing: 'none' };
      const path = generatePath(negativePoints, undefined, lineStyle);
      
      expect(path).toMatch(/^M/);
      expect(path).toContain('L');
      expect(path).toContain('-'); // Should contain negative coordinates
    });

    it('handles decimal coordinates', () => {
      const decimalPoints: ScaledPoint[] = [
        { x: 10.5, y: 100.7, originalX: 10.5, originalY: 100.7, index: 0 },
        { x: 50.3, y: 150.9, originalX: 50.3, originalY: 150.9, index: 1 },
        { x: 100.1, y: 120.4, originalX: 100.1, originalY: 120.4, index: 2 },
      ];
      const lineStyle: LineStyle = { smoothing: 'none' };
      const path = generatePath(decimalPoints, undefined, lineStyle);
      
      expect(path).toContain('10.5');
      expect(path).toContain('100.7');
    });
  });

  describe('generateFillPath', () => {
    it('generates fill path from line path', () => {
      const lineStyle: LineStyle = { smoothing: 'none' };
      const linePath = generatePath(mockScaledPoints, undefined, lineStyle);
      const fillPath = generateFillPath(linePath, mockScaledPoints, mockChartArea);
      
      expect(fillPath).toContain('L'); // Should have line commands
      expect(fillPath).toContain('Z'); // Should close the path
    });

    it('creates fill area to bottom of chart', () => {
      const lineStyle: LineStyle = { smoothing: 'none' };
      const linePath = generatePath(mockScaledPoints, undefined, lineStyle);
      const fillPath = generateFillPath(linePath, mockScaledPoints, mockChartArea);
      
      expect(fillPath).toContain('Z'); // Should close the path
    });

    it('handles empty line path', () => {
      const fillPath = generateFillPath('', [], mockChartArea);
      expect(fillPath).toBe(''); // Should return empty string
    });

    it('handles single point fill', () => {
      const singlePoint: ScaledPoint[] = [{
        x: 50,
        y: 100,
        originalX: 50,
        originalY: 100,
        index: 0,
      }];
      const lineStyle: LineStyle = { smoothing: 'none' };
      const linePath = generatePath(singlePoint, undefined, lineStyle);
      const fillPath = generateFillPath(linePath, singlePoint, mockChartArea);
      
      expect(typeof fillPath).toBe('string');
    });

    it('handles smooth curves in fill path', () => {
      const lineStyle: LineStyle = { smoothing: 'bezier' };
      const smoothLinePath = generatePath(mockScaledPoints, undefined, lineStyle);
      const fillPath = generateFillPath(smoothLinePath, mockScaledPoints, mockChartArea);
      
      expect(fillPath).toContain('Z');
    });
  });

  describe('clamp', () => {
    it('clamps value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5); // Within range
      expect(clamp(-5, 0, 10)).toBe(0); // Below range
      expect(clamp(15, 0, 10)).toBe(10); // Above range
    });

    it('handles edge values', () => {
      expect(clamp(0, 0, 10)).toBe(0); // At minimum
      expect(clamp(10, 0, 10)).toBe(10); // At maximum
    });

    it('handles decimal values', () => {
      expect(clamp(5.7, 0, 10)).toBe(5.7);
      expect(clamp(-2.3, 0, 10)).toBe(0);
      expect(clamp(12.8, 0, 10)).toBe(10);
    });

    it('handles negative ranges', () => {
      expect(clamp(-5, -10, -1)).toBe(-5);
      expect(clamp(-15, -10, -1)).toBe(-10);
      expect(clamp(5, -10, -1)).toBe(-1);
    });

    it('handles inverted min/max gracefully', () => {
      // When min > max, clamp should handle it gracefully
      // The implementation should probably swap them or handle consistently
      const result = clamp(5, 10, 0);
      expect(typeof result).toBe('number');
    });
  });

  describe('clampToChartArea', () => {
    it('clamps point to chart area', () => {
      const clampedPoint = clampToChartArea(50, 100, mockChartArea);
      
      expect(clampedPoint.x).toBe(50); // Point is within area
      expect(clampedPoint.y).toBe(100);
    });

    it('clamps point outside left boundary', () => {
      const clampedPoint = clampToChartArea(-10, 100, mockChartArea);
      
      expect(clampedPoint.x).toBe(mockChartArea.x);
      expect(clampedPoint.y).toBe(100);
    });

    it('clamps point outside right boundary', () => {
      const clampedPoint = clampToChartArea(400, 100, mockChartArea);
      
      expect(clampedPoint.x).toBe(mockChartArea.x + mockChartArea.width);
      expect(clampedPoint.y).toBe(100);
    });

    it('clamps point outside top boundary', () => {
      const clampedPoint = clampToChartArea(50, -10, mockChartArea);
      
      expect(clampedPoint.x).toBe(50);
      expect(clampedPoint.y).toBe(mockChartArea.y);
    });

    it('clamps point outside bottom boundary', () => {
      const clampedPoint = clampToChartArea(50, 300, mockChartArea);
      
      expect(clampedPoint.x).toBe(50);
      expect(clampedPoint.y).toBe(mockChartArea.y + mockChartArea.height);
    });

    it('clamps point outside multiple boundaries', () => {
      const clampedPoint = clampToChartArea(-50, 300, mockChartArea);
      
      expect(clampedPoint.x).toBe(mockChartArea.x);
      expect(clampedPoint.y).toBe(mockChartArea.y + mockChartArea.height);
    });

    it('handles decimal coordinates', () => {
      const clampedPoint = clampToChartArea(25.7, 150.3, mockChartArea);
      
      expect(clampedPoint.x).toBe(25.7);
      expect(clampedPoint.y).toBe(150.3);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('handles very large datasets efficiently', () => {
      const largeDataset: ScaledPoint[] = Array.from({ length: 1000 }, (_, i) => ({
        x: i,
        y: Math.sin(i * 0.01) * 100 + 100,
        originalX: i,
        originalY: Math.sin(i * 0.01) * 100 + 100,
        index: i,
      }));

      const startTime = Date.now();
      const lineStyle: LineStyle = { smoothing: 'none' };
      const path = generatePath(largeDataset, undefined, lineStyle);
      const endTime = Date.now();

      expect(path).toBeTruthy();
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
    });

    it('handles extreme coordinate values', () => {
      const extremePoints: ScaledPoint[] = [
        { x: -1000000, y: 1000000, originalX: -1000000, originalY: 1000000, index: 0 },
        { x: 0, y: 0, originalX: 0, originalY: 0, index: 1 },
        { x: 1000000, y: -1000000, originalX: 1000000, originalY: -1000000, index: 2 },
      ];
      const lineStyle: LineStyle = { smoothing: 'none' };
      const path = generatePath(extremePoints, undefined, lineStyle);
      
      expect(path).toBeTruthy();
      expect(path).toContain('-1000000');
      expect(path).toContain('1000000');
    });

    it('handles duplicate points', () => {
      const duplicatePoints: ScaledPoint[] = [
        { x: 50, y: 100, originalX: 50, originalY: 100, index: 0 },
        { x: 50, y: 100, originalX: 50, originalY: 100, index: 1 },
        { x: 50, y: 100, originalX: 50, originalY: 100, index: 2 },
        { x: 100, y: 150, originalX: 100, originalY: 150, index: 3 },
      ];
      const lineStyle: LineStyle = { smoothing: 'none' };
      const path = generatePath(duplicatePoints, undefined, lineStyle);
      
      expect(path).toBeTruthy();
      expect(path).toMatch(/^M/);
    });

    it('maintains path precision for small values', () => {
      const smallPoints: ScaledPoint[] = [
        { x: 0.001, y: 0.002, originalX: 0.001, originalY: 0.002, index: 0 },
        { x: 0.003, y: 0.004, originalX: 0.003, originalY: 0.004, index: 1 },
        { x: 0.005, y: 0.006, originalX: 0.005, originalY: 0.006, index: 2 },
      ];
      const lineStyle: LineStyle = { smoothing: 'none' };
      const path = generatePath(smallPoints, undefined, lineStyle);
      
      expect(path).toContain('0.001');
      expect(path).toContain('0.002');
    });
  });
});
