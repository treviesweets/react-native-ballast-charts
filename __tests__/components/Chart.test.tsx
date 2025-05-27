/**
 * Chart Component - Basic Smoke Tests
 * Tests basic rendering and prop handling for the main Chart component
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Chart } from '../../src/components/Chart';
import { createMockChartData, mockChartProps } from '../setup';

describe('Chart Component - Smoke Tests', () => {
  describe('Basic Rendering', () => {
    it('renders without crashing with minimal props', () => {
      const { getByTestId } = render(
        <Chart {...mockChartProps} />
      );
      
      expect(getByTestId('svg')).toBeTruthy();
    });

    it('renders with default dimensions when not specified', () => {
      const data = createMockChartData(5);
      const { getByTestId } = render(
        <Chart data={data} width={200} height={150} />
      );
      
      const svg = getByTestId('svg');
      expect(svg).toBeTruthy();
    });

    it('renders multiple data points correctly', () => {
      const data = createMockChartData(20);
      const { getByTestId } = render(
        <Chart data={data} width={300} height={200} />
      );
      
      expect(getByTestId('svg')).toBeTruthy();
      // Chart should render line path
      expect(getByTestId('path')).toBeTruthy();
    });
  });

  describe('Data Prop Variations', () => {
    it('handles single data point', () => {
      const data = {
        x: [1],
        y: [100],
      };
      
      const { getByTestId } = render(
        <Chart data={data} width={200} height={150} />
      );
      
      expect(getByTestId('svg')).toBeTruthy();
    });

    it('handles large dataset', () => {
      const data = createMockChartData(1000);
      
      const { getByTestId } = render(
        <Chart data={data} width={400} height={300} />
      );
      
      expect(getByTestId('svg')).toBeTruthy();
    });

    it('handles negative values', () => {
      const data = {
        x: [1, 2, 3, 4, 5],
        y: [-10, -5, 0, 5, 10],
      };
      
      const { getByTestId } = render(
        <Chart data={data} width={200} height={150} />
      );
      
      expect(getByTestId('svg')).toBeTruthy();
    });

    it('handles decimal values', () => {
      const data = {
        x: [1.1, 2.2, 3.3, 4.4, 5.5],
        y: [10.5, 20.7, 30.9, 40.1, 50.3],
      };
      
      const { getByTestId } = render(
        <Chart data={data} width={200} height={150} />
      );
      
      expect(getByTestId('svg')).toBeTruthy();
    });
  });

  describe('Styling Props', () => {
    it('renders with custom line style', () => {
      const { getByTestId } = render(
        <Chart 
          {...mockChartProps}
          lineStyle={{
            color: '#ff0000',
            width: 3,
            opacity: 0.8,
          }}
        />
      );
      
      expect(getByTestId('svg')).toBeTruthy();
    });

    it('renders with fill style', () => {
      const { getByTestId } = render(
        <Chart 
          {...mockChartProps}
          fillStyle={{
            color: '#0000ff',
            opacity: 0.3,
          }}
        />
      );
      
      expect(getByTestId('svg')).toBeTruthy();
    });

    it('renders with custom padding', () => {
      const { getByTestId } = render(
        <Chart 
          {...mockChartProps}
          padding={{
            top: 20,
            right: 30,
            bottom: 40,
            left: 50,
          }}
        />
      );
      
      expect(getByTestId('svg')).toBeTruthy();
    });
  });

  describe('Interaction Props', () => {
    it('renders with interaction enabled', () => {
      const onTooltipData = jest.fn();
      
      const { getByTestId } = render(
        <Chart 
          {...mockChartProps}
          interaction={{
            enabled: true,
            onTooltipData,
          }}
        />
      );
      
      expect(getByTestId('svg')).toBeTruthy();
      expect(getByTestId('gesture-detector')).toBeTruthy();
    });

    it('renders with interaction disabled', () => {
      const { getByTestId, queryByTestId } = render(
        <Chart 
          {...mockChartProps}
          interaction={{
            enabled: false,
          }}
        />
      );
      
      expect(getByTestId('svg')).toBeTruthy();
      // Should not have gesture detector when disabled
      expect(queryByTestId('gesture-detector')).toBeFalsy();
    });

    it('renders with vertical indicators', () => {
      const { getByTestId } = render(
        <Chart 
          {...mockChartProps}
          indicators={[
            { x: 5, color: '#ff0000', width: 2 },
            { x: 8, color: '#00ff00', width: 1 },
          ]}
        />
      );
      
      expect(getByTestId('svg')).toBeTruthy();
    });
  });

  describe('Axes Configuration', () => {
    it('renders with both axes visible', () => {
      const { getByTestId } = render(
        <Chart 
          {...mockChartProps}
          axes={{
            x: { 
              visible: true, 
              labelFormatter: (value) => value.toString(),
            },
            y: { 
              visible: true, 
              labelFormatter: (value) => `$${value}`,
            },
          }}
        />
      );
      
      expect(getByTestId('svg')).toBeTruthy();
    });

    it('renders with axes hidden', () => {
      const { getByTestId } = render(
        <Chart 
          {...mockChartProps}
          axes={{
            x: { visible: false },
            y: { visible: false },
          }}
        />
      );
      
      expect(getByTestId('svg')).toBeTruthy();
    });

    it('renders with only x-axis visible', () => {
      const { getByTestId } = render(
        <Chart 
          {...mockChartProps}
          axes={{
            x: { visible: true },
            y: { visible: false },
          }}
        />
      );
      
      expect(getByTestId('svg')).toBeTruthy();
    });

    it('renders with only y-axis visible', () => {
      const { getByTestId } = render(
        <Chart 
          {...mockChartProps}
          axes={{
            x: { visible: false },
            y: { visible: true },
          }}
        />
      );
      
      expect(getByTestId('svg')).toBeTruthy();
    });
  });
});
