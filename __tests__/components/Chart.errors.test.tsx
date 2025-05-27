/**
 * Chart Component - Error Handling Tests
 * Tests for error conditions, edge cases, and graceful failure handling
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Chart } from '../../src/components/Chart';
import { generateInvalidData } from '../setup';

describe('Chart Component - Error Handling', () => {
  // Suppress console errors for these tests since we're testing error conditions
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  describe('Invalid Data Handling', () => {
    it('throws error for null data', () => {
      expect(() => {
        render(<Chart data={null as any} width={300} height={200} />);
      }).toThrow('Chart data is required');
    });

    it('throws error for undefined data', () => {
      expect(() => {
        render(<Chart data={undefined as any} width={300} height={200} />);
      }).toThrow('Chart data is required');
    });

    it('throws error for empty data arrays', () => {
      expect(() => {
        render(<Chart data={{ x: [], y: [] }} width={300} height={200} />);
      }).toThrow('Chart requires at least one data point');
    });

    it('throws error for mismatched array lengths', () => {
      expect(() => {
        render(
          <Chart 
            data={{ x: [1, 2, 3], y: [10, 20] }} 
            width={300} 
            height={200} 
          />
        );
      }).toThrow('X and Y arrays must have the same length');
    });

    it('throws error for non-array data', () => {
      expect(() => {
        render(
          <Chart 
            data={{ x: 'not-array', y: [10, 20] } as any} 
            width={300} 
            height={200} 
          />
        );
      }).toThrow('X and Y data must be arrays');
    });

    it('throws error for null values in data', () => {
      expect(() => {
        render(
          <Chart 
            data={{ x: [1, null, 3], y: [10, 20, 30] } as any} 
            width={300} 
            height={200} 
          />
        );
      }).toThrow('contains null or undefined values');
    });

    it('throws error for non-numeric values', () => {
      expect(() => {
        render(
          <Chart 
            data={{ x: [1, 'two', 3], y: [10, 20, 30] } as any} 
            width={300} 
            height={200} 
          />
        );
      }).toThrow('contains non-numeric values');
    });

    it('throws error for NaN values', () => {
      expect(() => {
        render(
          <Chart 
            data={{ x: [1, NaN, 3], y: [10, 20, 30] }} 
            width={300} 
            height={200} 
          />
        );
      }).toThrow('contains invalid values (NaN or Infinity)');
    });

    it('throws error for Infinity values', () => {
      expect(() => {
        render(
          <Chart 
            data={{ x: [1, 2, 3], y: [10, Infinity, 30] }} 
            width={300} 
            height={200} 
          />
        );
      }).toThrow('contains invalid values (NaN or Infinity)');
    });
  });

  describe('Invalid Dimension Handling', () => {
    const validData = { x: [1, 2, 3], y: [10, 20, 30] };

    it('throws error for non-numeric width', () => {
      expect(() => {
        render(<Chart data={validData} width={'300' as any} height={200} />);
      }).toThrow('Width and height must be numbers');
    });

    it('throws error for non-numeric height', () => {
      expect(() => {
        render(<Chart data={validData} width={300} height={'200' as any} />);
      }).toThrow('Width and height must be numbers');
    });

    it('throws error for zero width', () => {
      expect(() => {
        render(<Chart data={validData} width={0} height={200} />);
      }).toThrow('Width and height must be positive numbers');
    });

    it('throws error for negative height', () => {
      expect(() => {
        render(<Chart data={validData} width={300} height={-100} />);
      }).toThrow('Width and height must be positive numbers');
    });

    it('throws error for NaN dimensions', () => {
      expect(() => {
        render(<Chart data={validData} width={NaN} height={200} />);
      }).toThrow('Width and height must be finite numbers');
    });

    it('throws error for Infinity dimensions', () => {
      expect(() => {
        render(<Chart data={validData} width={300} height={Infinity} />);
      }).toThrow('Width and height must be finite numbers');
    });
  });

  describe('Invalid Style Props', () => {
    const validData = { x: [1, 2, 3], y: [10, 20, 30] };

    it('throws error for invalid line width', () => {
      expect(() => {
        render(
          <Chart 
            data={validData} 
            width={300} 
            height={200}
            lineStyle={{ width: 0 }}
          />
        );
      }).toThrow('Line width must be a positive number');
    });

    it('throws error for invalid line opacity', () => {
      expect(() => {
        render(
          <Chart 
            data={validData} 
            width={300} 
            height={200}
            lineStyle={{ opacity: 2 }}
          />
        );
      }).toThrow('Line opacity must be a number between 0 and 1');
    });

    it('throws error for negative line opacity', () => {
      expect(() => {
        render(
          <Chart 
            data={validData} 
            width={300} 
            height={200}
            lineStyle={{ opacity: -0.5 }}
          />
        );
      }).toThrow('Line opacity must be a number between 0 and 1');
    });
  });

  describe('Invalid Indicator Props', () => {
    const validData = { x: [1, 2, 3, 4, 5], y: [10, 20, 30, 40, 50] };

    it('throws error for invalid indicator x value', () => {
      expect(() => {
        render(
          <Chart 
            data={validData} 
            width={300} 
            height={200}
            indicators={[{ x: NaN, color: '#ff0000' }]}
          />
        );
      }).toThrow('Indicator at index 0 has invalid x value');
    });

    it('throws error for invalid indicator width', () => {
      expect(() => {
        render(
          <Chart 
            data={validData} 
            width={300} 
            height={200}
            indicators={[{ x: 3, color: '#ff0000', width: 0 }]}
          />
        );
      }).toThrow('Indicator at index 0 has invalid width');
    });

    it('warns for indicators outside data range', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      render(
        <Chart 
          data={validData} 
          width={300} 
          height={200}
          indicators={[{ x: 10, color: '#ff0000' }]} // Outside range 1-5
        />
      );

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('outside data range')
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Graceful Degradation', () => {
    it('handles very small chart dimensions gracefully', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const validData = { x: [1, 2], y: [10, 20] };

      const { getByTestId } = render(
        <Chart data={validData} width={10} height={10} />
      );

      expect(getByTestId('svg')).toBeTruthy();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('very small')
      );

      consoleWarnSpy.mockRestore();
    });

    it('handles identical data values gracefully', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const identicalData = { x: [1, 1, 1], y: [20, 20, 20] };

      const { getByTestId } = render(
        <Chart data={identicalData} width={300} height={200} />
      );

      expect(getByTestId('svg')).toBeTruthy();
      expect(consoleWarnSpy).toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });

    it('handles large datasets with performance warning', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const largeData = {
        x: Array.from({ length: 2000 }, (_, i) => i),
        y: Array.from({ length: 2000 }, (_, i) => Math.sin(i * 0.01) * 100),
      };

      const { getByTestId } = render(
        <Chart data={largeData} width={400} height={300} />
      );

      expect(getByTestId('svg')).toBeTruthy();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance may be affected')
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Memory and Performance Edge Cases', () => {
    it('handles rapid re-renders without memory leaks', () => {
      const validData = { x: [1, 2, 3], y: [10, 20, 30] };
      const { rerender } = render(
        <Chart data={validData} width={300} height={200} />
      );

      // Simulate rapid re-renders
      for (let i = 0; i < 100; i++) {
        rerender(
          <Chart 
            data={{
              x: validData.x,
              y: validData.y.map(v => v + i),
            }}
            width={300 + i} 
            height={200 + i} 
          />
        );
      }

      // Should not throw or cause memory issues
      expect(true).toBe(true);
    });

    it('handles prop changes that trigger re-calculations', () => {
      const validData = { x: [1, 2, 3, 4, 5], y: [10, 20, 30, 40, 50] };
      const { rerender, getByTestId } = render(
        <Chart data={validData} width={300} height={200} />
      );

      // Change multiple props that affect calculations
      rerender(
        <Chart 
          data={validData}
          width={400}
          height={300}
          padding={{ top: 30, right: 40, bottom: 50, left: 60 }}
          lineStyle={{ color: '#ff0000', width: 3 }}
          axes={{ x: { visible: true }, y: { visible: true } }}
        />
      );

      expect(getByTestId('svg')).toBeTruthy();
    });
  });

  describe('Interaction Error Handling', () => {
    it('handles invalid interaction callbacks gracefully', () => {
      const validData = { x: [1, 2, 3], y: [10, 20, 30] };
      
      // Should not throw even with invalid callback
      const { getByTestId } = render(
        <Chart 
          data={validData} 
          width={300} 
          height={200}
          interaction={{
            enabled: true,
            onTooltipData: 'not-a-function' as any,
          }}
        />
      );

      expect(getByTestId('svg')).toBeTruthy();
    });

    it('handles disabled interaction with gesture detector', () => {
      const validData = { x: [1, 2, 3, 4, 5], y: [10, 20, 30, 40, 50] };
      
      const { getByTestId, queryByTestId } = render(
        <Chart 
          data={validData} 
          width={300} 
          height={200}
          interaction={{ enabled: false }}
        />
      );

      expect(getByTestId('svg')).toBeTruthy();
      expect(queryByTestId('gesture-detector')).toBeFalsy();
    });
  });

  describe('TypeScript Error Prevention', () => {
    it('maintains type safety for data prop', () => {
      const validData = { x: [1, 2, 3], y: [10, 20, 30] };
      
      // This test ensures TypeScript compilation catches type errors
      const { getByTestId } = render(
        <Chart data={validData} width={300} height={200} />
      );

      expect(getByTestId('svg')).toBeTruthy();
    });

    it('maintains type safety for style props', () => {
      const validData = { x: [1, 2, 3], y: [10, 20, 30] };
      
      const { getByTestId } = render(
        <Chart 
          data={validData} 
          width={300} 
          height={200}
          lineStyle={{
            color: '#007AFF',
            width: 2,
            opacity: 0.8,
          }}
          fillStyle={{
            color: '#007AFF',
            opacity: 0.2,
          }}
        />
      );

      expect(getByTestId('svg')).toBeTruthy();
    });
  });

  describe('Boundary Value Testing', () => {
    it('handles minimum valid dimensions', () => {
      const validData = { x: [1, 2], y: [10, 20] };
      
      const { getByTestId } = render(
        <Chart data={validData} width={1} height={1} />
      );

      expect(getByTestId('svg')).toBeTruthy();
    });

    it('handles single data point edge case', () => {
      const singlePoint = { x: [42], y: [100] };
      
      const { getByTestId } = render(
        <Chart data={singlePoint} width={300} height={200} />
      );

      expect(getByTestId('svg')).toBeTruthy();
    });

    it('handles extreme data values', () => {
      const extremeData = {
        x: [-1000000, 0, 1000000],
        y: [-1000000, 0, 1000000],
      };
      
      const { getByTestId } = render(
        <Chart data={extremeData} width={300} height={200} />
      );

      expect(getByTestId('svg')).toBeTruthy();
    });

    it('handles maximum allowed data points with warning', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const maxData = {
        x: Array.from({ length: 1500 }, (_, i) => i), // Just over performance warning threshold
        y: Array.from({ length: 1500 }, (_, i) => i * 2),
      };
      
      const { getByTestId } = render(
        <Chart data={maxData} width={400} height={300} />
      );

      expect(getByTestId('svg')).toBeTruthy();
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance may be affected')
      );

      consoleWarnSpy.mockRestore();
    });
  });
});
