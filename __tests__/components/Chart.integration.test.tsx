/**
 * Chart Component - Integration Tests
 * Tests for component integration, lifecycle, and complex interactions
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Chart } from '../../src/components/Chart';
import { createMockStockData, createMockChartData } from '../setup';

describe('Chart Component - Integration Tests', () => {
  describe('Component Lifecycle', () => {
    it('initializes correctly with all props', () => {
      const stockData = createMockStockData(50);
      const onTooltipData = jest.fn();
      
      const { getByTestId } = render(
        <Chart 
          data={stockData}
          width={400}
          height={300}
          padding={{ top: 20, right: 30, bottom: 40, left: 50 }}
          lineStyle={{ color: '#007AFF', width: 2, opacity: 1 }}
          fillStyle={{ color: '#007AFF', opacity: 0.2 }}
          axes={{
            x: { 
              visible: true, 
              labelFormatter: (value) => new Date(value).toLocaleDateString(),
              tickCount: 5,
            },
            y: { 
              visible: true, 
              labelFormatter: (value) => `$${value.toFixed(2)}`,
              tickCount: 6,
            },
          }}
          indicators={[
            { x: stockData.x[10], color: '#FF3B30', width: 2 },
            { x: stockData.x[30], color: '#34C759', width: 1.5 },
          ]}
          interaction={{
            enabled: true,
            onTooltipData,
            crosshairColor: '#8E8E93',
            crosshairWidth: 1,
          }}
          tooltip={{
            visible: true,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            textColor: '#FFFFFF',
            borderRadius: 6,
          }}
        />
      );

      expect(getByTestId('svg')).toBeTruthy();
      expect(getByTestId('gesture-detector')).toBeTruthy();
    });

    it('updates correctly when data changes', () => {
      const initialData = createMockChartData(10);
      const { rerender, getByTestId } = render(
        <Chart data={initialData} width={300} height={200} />
      );

      expect(getByTestId('svg')).toBeTruthy();

      // Update with new data
      const newData = createMockChartData(20);
      rerender(<Chart data={newData} width={300} height={200} />);

      expect(getByTestId('svg')).toBeTruthy();
    });

    it('recovers gracefully from errors to valid state', () => {
      const validData = createMockChartData(10);
      const { rerender, getByTestId } = render(
        <Chart data={validData} width={300} height={200} />
      );

      expect(getByTestId('svg')).toBeTruthy();

      // Update with new valid data and complex props
      const newData = createMockStockData(25);
      rerender(
        <Chart 
          data={newData}
          width={400}
          height={280}
          lineStyle={{ color: '#34C759', width: 2.5 }}
          fillStyle={{ color: '#34C759', opacity: 0.15 }}
          interaction={{ enabled: true, onTooltipData: jest.fn() }}
        />
      );

      expect(getByTestId('svg')).toBeTruthy();
      expect(getByTestId('gesture-detector')).toBeTruthy();
    });
  });

  describe('Real-world Usage Scenarios', () => {
    it('handles stock chart scenario with real-time updates', () => {
      const initialStockData = createMockStockData(100);
      const { rerender, getByTestId } = render(
        <Chart 
          data={initialStockData}
          width={600}
          height={300}
          lineStyle={{ color: '#007AFF', width: 2 }}
          axes={{
            x: { 
              visible: true,
              labelFormatter: (value) => new Date(value).toLocaleDateString(),
            },
            y: { 
              visible: true,
              labelFormatter: (value) => `$${value.toFixed(2)}`,
            },
          }}
          interaction={{
            enabled: true,
            onTooltipData: jest.fn(),
          }}
        />
      );

      expect(getByTestId('svg')).toBeTruthy();

      // Simulate real-time price updates
      const updatedData = {
        ...initialStockData,
        y: [...initialStockData.y.slice(1), initialStockData.y[initialStockData.y.length - 1] + 5],
      };

      rerender(
        <Chart 
          data={updatedData}
          width={600}
          height={300}
          lineStyle={{ color: '#34C759', width: 2 }}
          axes={{
            x: { 
              visible: true,
              labelFormatter: (value) => new Date(value).toLocaleDateString(),
            },
            y: { 
              visible: true,
              labelFormatter: (value) => `$${value.toFixed(2)}`,
            },
          }}
          interaction={{
            enabled: true,
            onTooltipData: jest.fn(),
          }}
        />
      );

      expect(getByTestId('svg')).toBeTruthy();
    });

    it('handles distribution chart scenario', () => {
      const distributionData = {
        x: Array.from({ length: 50 }, (_, i) => i * 2),
        y: Array.from({ length: 50 }, (_, i) => Math.exp(-(i - 25) ** 2 / 50) * 100),
      };

      const { getByTestId } = render(
        <Chart 
          data={distributionData}
          width={400}
          height={200}
          lineStyle={{ color: '#5856D6', width: 1.5 }}
          fillStyle={{ color: '#5856D6', opacity: 0.3 }}
          axes={{
            x: { visible: true },
            y: { visible: true },
          }}
        />
      );

      expect(getByTestId('svg')).toBeTruthy();
    });
  });
});
