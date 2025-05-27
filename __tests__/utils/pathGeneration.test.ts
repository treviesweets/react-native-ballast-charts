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

describe('Path Generation Utilities', () => {
  const mockPoints = [
    { x: 0, y: 100 },
    { x: 50, y: 150 },
    { x: 100, y: 120 },
    { x: 150, y: 180 },
    { x: 200, y: 140 },
  ];

  const mockChartArea = {
    x: 20,
    y: 10,
    width: 300,
    height: 200,
  };

  describe('generatePath', () => {
    it('generates basic line path from points', () => {
      const path = generatePath(mockPoints, { smooth: false });
      
      expect(path).toMatch(/^M/); // Should start with Move command
      expect(path).toContain('L'); // Should contain Line commands
      expect(path).not.toContain('C'); // Should not contain Curve commands when smooth=false
    });

    it('generates smooth curved path when smoothing enabled', () => {
      const path = generatePath(mockPoints, { smooth: true });
      
      expect(path).toMatch(/^M/); // Should start with Move command
      expect(path).toContain('C'); // Should contain Curve commands
    });

    it('handles single point', () => {
      const singlePoint = [{ x: 50, y: 100 }];
      const path = generatePath(singlePoint, { smooth: false });
      
      expect(path).toMatch(/^M\s*50\s*,?\s*100/); // Should just move to the point
      expect(path).not.toContain('L'); // No line commands for single point
    });

    it('handles two points', () => {
      const twoPoints = [
        { x: 0, y: 100 },
        { x: 50, y: 150 },
      ];
      const path = generatePath(twoPoints, { smooth: false });
      
      expect(path).toMatch(/^M/); // Move to first point
      expect(path).toContain('L'); // Line to second point
      expect(path).not.toContain('C'); // No curves for just two points
    });

    it('handles empty points array', () => {
      const path = generatePath([], { smooth: false });
      expect(path).toBe(''); // Should return empty string
    });

    it('applies smoothing factor correctly', () => {
      const smoothPath1 = generatePath(mockPoints, { smooth: true, smoothingFactor: 0.1 });
      const smoothPath2 = generatePath(mockPoints, { smooth: true, smoothingFactor: 0.5 });
      
      expect(smoothPath1).not.toBe(smoothPath2);
      expect(smoothPath1).toContain('C');
      expect(smoothPath2).toContain('C');
    });

    it('handles negative coordinates', () => {
      const negativePoints = [
        { x: -50, y: -100 },
        { x: 0, y: 50 },
        { x: 50, y: -25 },
      ];
      const path = generatePath(negativePoints, { smooth: false });
      
      expect(path).toMatch(/^M\s*-50/); // Should handle negative x
      expect(path).toContain('-100'); // Should handle negative y
    });

    it('handles decimal coordinates', () => {
      const decimalPoints = [
        { x: 10.5, y: 100.7 },
        { x: 50.3, y: 150.9 },
        { x: 100.1, y: 120.4 },
      ];
      const path = generatePath(decimalPoints, { smooth: false });
      
      expect(path).toContain('10.5');
      expect(path).toContain('100.7');
    });
  });

  describe('generateFillPath', () => {
    it('generates fill path from line path', () => {
      const linePath = generatePath(mockPoints, { smooth: false });
      const fillPath = generateFillPath(linePath, mockPoints, mockChartArea);
      
      expect(fillPath).toContain(linePath); // Should include the original line path
      expect(fillPath).toContain('L'); // Should have additional line commands
      expect(fillPath).toContain('Z'); // Should close the path
    });

    it('creates fill area to bottom of chart', () => {
      const linePath = generatePath(mockPoints, { smooth: false });
      const fillPath = generateFillPath(linePath, mockPoints, mockChartArea);
      
      const chartBottom = mockChartArea.y + mockChartArea.height;
      expect(fillPath).toContain(chartBottom.toString());
    });

    it('handles empty line path', () => {
      const fillPath = generateFillPath('', [], mockChartArea);
      expect(fillPath).toBe('');
    });

    it('handles single point fill', () => {
      const singlePoint = [{ x: 50, y: 100 }];
      const linePath = generatePath(singlePoint, { smooth: false });
      const fillPath = generateFillPath(linePath, singlePoint, mockChartArea);
      
      expect(fillPath).toContain('Z'); // Should still close the path
    });

    it('handles smooth curves in fill path', () => {
      const smoothLinePath = generatePath(mockPoints, { smooth: true });
      const fillPath = generateFillPath(smoothLinePath, mockPoints, mockChartArea);
      
      expect(fillPath).toContain(smoothLinePath);
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

    it('handles inverted min/max', () => {
      expect(clamp(5, 10, 0)).toBe(5); // Should handle gracefully
    });
  });

  describe('clampToChartArea', () => {
    it('clamps point to chart area', () => {
      const point = { x: 50, y: 100 };
      const clampedPoint = clampToChartArea(point, mockChartArea);
      
      expect(clampedPoint).toEqual(point); // Point is within area
    });

    it('clamps point outside left boundary', () => {
      const point = { x: -10, y: 100 };
      const clampedPoint = clampToChartArea(point, mockChartArea);
      
      expect(clampedPoint.x).toBe(mockChartArea.x);
      expect(clampedPoint.y).toBe(100);
    });

    it('clamps point outside right boundary', () => {
      const point = { x: 400, y: 100 };
      const clampedPoint = clampToChartArea(point, mockChartArea);
      
      expect(clampedPoint.x).toBe(mockChartArea.x + mockChartArea.width);
      expect(clampedPoint.y).toBe(100);
    });

    it('clamps point outside top boundary', () => {
      const point = { x: 50, y: -10 };
      const clampedPoint = clampToChartArea(point, mockChartArea);
      
      expect(clampedPoint.x).toBe(50);
      expect(clampedPoint.y).toBe(mockChartArea.y);
    });

    it('clamps point outside bottom boundary', () => {
      const point = { x: 50, y: 300 };
      const clampedPoint = clampToChartArea(point, mockChartArea);
      
      expect(clampedPoint.x).toBe(50);
      expect(clampedPoint.y).toBe(mockChartArea.y + mockChartArea.height);
    });

    it('clamps point outside multiple boundaries', () => {
      const point = { x: -50, y: 300 };
      const clampedPoint = clampToChartArea(point, mockChartArea);
      
      expect(clampedPoint.x).toBe(mockChartArea.x);
      expect(clampedPoint.y).toBe(mockChartArea.y + mockChartArea.height);
    });

    it('handles decimal coordinates', () => {
      const point = { x: 25.7, y: 150.3 };
      const clampedPoint = clampToChartArea(point, mockChartArea);
      
      expect(clampedPoint.x).toBe(25.7);
      expect(clampedPoint.y).toBe(150.3);
    });

    it('does not mutate original point', () => {
      const originalPoint = { x: -10, y: 100 };
      const clampedPoint = clampToChartArea(originalPoint, mockChartArea);
      
      expect(originalPoint.x).toBe(-10); // Original unchanged
      expect(clampedPoint.x).toBe(mockChartArea.x); // Clamped version changed
    });
  });

  describe('Performance and Edge Cases', () => {
    it('handles very large datasets efficiently', () => {
      const largeDataset = Array.from({ length: 1000 }, (_, i) => ({
        x: i,
        y: Math.sin(i * 0.01) * 100 + 100,
      }));

      const startTime = Date.now();
      const path = generatePath(largeDataset, { smooth: false });
      const endTime = Date.now();

      expect(path).toBeTruthy();
      expect(endTime - startTime).toBeLessThan(100); // Should complete quickly
    });

    it('handles extreme coordinate values', () => {
      const extremePoints = [
        { x: -1000000, y: 1000000 },
        { x: 0, y: 0 },
        { x: 1000000, y: -1000000 },
      ];
      const path = generatePath(extremePoints, { smooth: false });
      
      expect(path).toBeTruthy();
      expect(path).toContain('-1000000');
      expect(path).toContain('1000000');
    });

    it('handles duplicate points', () => {
      const duplicatePoints = [
        { x: 50, y: 100 },
        { x: 50, y: 100 },
        { x: 50, y: 100 },
        { x: 100, y: 150 },
      ];
      const path = generatePath(duplicatePoints, { smooth: false });
      
      expect(path).toBeTruthy();
      expect(path).toMatch(/^M/);
    });

    it('handles points with NaN coordinates gracefully', () => {
      const nanPoints = [
        { x: 0, y: 100 },
        { x: NaN, y: 150 },
        { x: 100, y: NaN },
        { x: 150, y: 200 },
      ];
      
      // Should not throw, but may produce invalid path
      expect(() => generatePath(nanPoints, { smooth: false })).not.toThrow();
    });

    it('maintains path precision for small values', () => {
      const smallPoints = [
        { x: 0.001, y: 0.002 },
        { x: 0.003, y: 0.004 },
        { x: 0.005, y: 0.006 },
      ];
      const path = generatePath(smallPoints, { smooth: false });
      
      expect(path).toContain('0.001');
      expect(path).toContain('0.002');
    });
  });
});
