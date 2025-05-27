/**
 * Validation Utilities - Unit Tests
 * Tests for data validation, dimension validation, and binary search functions
 */

import {
  validateData,
  validateDimensions,
  validateLineStyle,
  validateIndicators,
  binarySearch,
} from '../../src/utils/validation';
import { generateValidData, generateInvalidData } from '../setup';

describe('Validation Utilities', () => {
  describe('validateData', () => {
    it('validates correct data successfully', () => {
      const validData = generateValidData(10);
      expect(() => validateData(validData)).not.toThrow();
    });

    it('throws error for missing data', () => {
      expect(() => validateData(null as any)).toThrow('Chart data is required');
      expect(() => validateData(undefined as any)).toThrow('Chart data is required');
    });

    it('throws error for missing x or y arrays', () => {
      expect(() => validateData({ x: [1, 2], y: undefined } as any)).toThrow(
        'Chart requires both x and y data arrays'
      );
      expect(() => validateData({ x: undefined, y: [1, 2] } as any)).toThrow(
        'Chart requires both x and y data arrays'
      );
    });

    it('throws error for non-array data', () => {
      expect(() => validateData({ x: 'not-array', y: [1, 2] } as any)).toThrow(
        'X and Y data must be arrays'
      );
      expect(() => validateData({ x: [1, 2], y: 'not-array' } as any)).toThrow(
        'X and Y data must be arrays'
      );
    });

    it('throws error for mismatched array lengths', () => {
      expect(() => validateData({ x: [1, 2, 3], y: [1, 2] })).toThrow(
        'X and Y arrays must have the same length. Got x: 3, y: 2'
      );
    });

    it('throws error for empty arrays', () => {
      expect(() => validateData({ x: [], y: [] })).toThrow(
        'Chart requires at least one data point'
      );
    });

    it('throws error for null values', () => {
      expect(() => validateData({ x: [1, null], y: [1, 2] } as any)).toThrow(
        'Data point at index 1 contains null or undefined values'
      );
      expect(() => validateData({ x: [1, 2], y: [1, undefined] } as any)).toThrow(
        'Data point at index 1 contains null or undefined values'
      );
    });

    it('throws error for non-numeric values', () => {
      expect(() => validateData({ x: [1, '2'], y: [1, 2] } as any)).toThrow(
        'Data point at index 1 contains non-numeric values'
      );
      expect(() => validateData({ x: [1, 2], y: [1, 'two'] } as any)).toThrow(
        'Data point at index 1 contains non-numeric values'
      );
    });

    it('throws error for NaN or Infinity values', () => {
      expect(() => validateData({ x: [1, NaN], y: [1, 2] })).toThrow(
        'Data point at index 1 contains invalid values (NaN or Infinity)'
      );
      expect(() => validateData({ x: [1, 2], y: [1, Infinity] })).toThrow(
        'Data point at index 1 contains invalid values (NaN or Infinity)'
      );
      expect(() => validateData({ x: [1, 2], y: [1, -Infinity] })).toThrow(
        'Data point at index 1 contains invalid values (NaN or Infinity)'
      );
    });

    it('warns about identical values', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      validateData({ x: [1, 1, 1], y: [5, 10, 15] });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'All X values are identical. Chart may not display properly.'
      );

      validateData({ x: [1, 2, 3], y: [5, 5, 5] });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'All Y values are identical. Chart will display as a flat line.'
      );

      consoleWarnSpy.mockRestore();
    });

    it('warns about performance limits', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const largeData = generateValidData(2000); // Above performance limit
      
      validateData(largeData);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Performance may be affected above')
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('validateDimensions', () => {
    it('validates correct dimensions successfully', () => {
      expect(() => validateDimensions(300, 200)).not.toThrow();
      expect(() => validateDimensions(50, 50)).not.toThrow();
    });

    it('throws error for non-numeric dimensions', () => {
      expect(() => validateDimensions('300' as any, 200)).toThrow(
        'Width and height must be numbers'
      );
      expect(() => validateDimensions(300, '200' as any)).toThrow(
        'Width and height must be numbers'
      );
    });

    it('throws error for non-finite dimensions', () => {
      expect(() => validateDimensions(NaN, 200)).toThrow(
        'Width and height must be finite numbers'
      );
      expect(() => validateDimensions(300, Infinity)).toThrow(
        'Width and height must be finite numbers'
      );
    });

    it('throws error for non-positive dimensions', () => {
      expect(() => validateDimensions(0, 200)).toThrow(
        'Width and height must be positive numbers'
      );
      expect(() => validateDimensions(300, -100)).toThrow(
        'Width and height must be positive numbers'
      );
    });

    it('warns about very small dimensions', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      
      validateDimensions(30, 40);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Chart dimensions are very small (30x40). Minimum recommended size is 50x50.'
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('validateLineStyle', () => {
    it('validates correct line style successfully', () => {
      expect(() => validateLineStyle({ width: 2, opacity: 0.8, color: '#ff0000' })).not.toThrow();
      expect(() => validateLineStyle(undefined)).not.toThrow();
      expect(() => validateLineStyle(null)).not.toThrow();
    });

    it('throws error for invalid width', () => {
      expect(() => validateLineStyle({ width: 0 })).toThrow(
        'Line width must be a positive number'
      );
      expect(() => validateLineStyle({ width: -1 })).toThrow(
        'Line width must be a positive number'
      );
      expect(() => validateLineStyle({ width: '2' as any })).toThrow(
        'Line width must be a positive number'
      );
    });

    it('throws error for invalid opacity', () => {
      expect(() => validateLineStyle({ opacity: -0.1 })).toThrow(
        'Line opacity must be a number between 0 and 1'
      );
      expect(() => validateLineStyle({ opacity: 1.1 })).toThrow(
        'Line opacity must be a number between 0 and 1'
      );
      expect(() => validateLineStyle({ opacity: '0.5' as any })).toThrow(
        'Line opacity must be a number between 0 and 1'
      );
    });
  });

  describe('validateIndicators', () => {
    const xRange = { min: 0, max: 10 };

    it('validates correct indicators successfully', () => {
      const indicators = [
        { x: 2, color: '#ff0000', width: 2 },
        { x: 8, color: '#00ff00', width: 1 },
      ];
      expect(() => validateIndicators(indicators, xRange)).not.toThrow();
    });

    it('handles undefined or null indicators', () => {
      expect(() => validateIndicators(undefined as any, xRange)).not.toThrow();
      expect(() => validateIndicators(null as any, xRange)).not.toThrow();
    });

    it('handles non-array indicators', () => {
      expect(() => validateIndicators('not-array' as any, xRange)).not.toThrow();
    });

    it('throws error for invalid x values', () => {
      const indicators = [{ x: NaN, color: '#ff0000' }];
      expect(() => validateIndicators(indicators, xRange)).toThrow(
        'Indicator at index 0 has invalid x value'
      );
    });

    it('throws error for invalid width', () => {
      const indicators = [{ x: 5, color: '#ff0000', width: 0 }];
      expect(() => validateIndicators(indicators, xRange)).toThrow(
        'Indicator at index 0 has invalid width'
      );
    });

    it('warns about indicators outside range', () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const indicators = [{ x: 15, color: '#ff0000' }]; // Outside range
      
      validateIndicators(indicators, xRange);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('outside data range')
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('binarySearch', () => {
    const array = [1, 3, 5, 7, 9, 11, 13, 15];
    const getValue = (x: number) => x;

    it('finds exact matches', () => {
      const result = binarySearch(array, 7, getValue);
      expect(result).toEqual({ exact: 3, lower: 3, upper: 3 });
    });

    it('finds position between values', () => {
      const result = binarySearch(array, 6, getValue);
      expect(result).toEqual({ exact: undefined, lower: 2, upper: 3 });
    });

    it('handles target below range', () => {
      const result = binarySearch(array, 0, getValue);
      expect(result).toEqual({ exact: 0, lower: 0, upper: 0 });
    });

    it('handles target above range', () => {
      const result = binarySearch(array, 20, getValue);
      expect(result).toEqual({ exact: 7, lower: 7, upper: 7 });
    });

    it('handles empty array', () => {
      const result = binarySearch([], 5, getValue);
      expect(result).toEqual({ lower: 0, upper: 0 });
    });

    it('handles single element array', () => {
      const result = binarySearch([5], 5, getValue);
      expect(result).toEqual({ exact: 0, lower: 0, upper: 0 });
    });

    it('works with complex objects', () => {
      const complexArray = [
        { id: 1, value: 10 },
        { id: 2, value: 20 },
        { id: 3, value: 30 },
        { id: 4, value: 40 },
      ];
      const getComplexValue = (obj: { value: number }) => obj.value;
      
      const result = binarySearch(complexArray, 25, getComplexValue);
      expect(result).toEqual({ exact: undefined, lower: 1, upper: 2 });
    });
  });
});
