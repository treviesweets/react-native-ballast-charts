/**
 * Chart Component - Snapshot Tests
 * Snapshot tests for Chart component with different configurations
 */

import React from 'react';
import { render } from '@testing-library/react-native';
import { Chart } from '../../src/components/Chart';
import { createMockChartData, createMockStockData } from '../setup';

describe('Chart Component - Snapshots', () => {
  it('matches snapshot with minimal props', () => {
    const data = createMockChartData(5);
    const { toJSON } = render(
      <Chart data={data} width={200} height={150} />
    );
    
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot with line styling', () => {
    const data = createMockChartData(10);
    const { toJSON } = render(
      <Chart 
        data={data} 
        width={300} 
        height={200}
        lineStyle={{
          color: '#007AFF',
          width: 2,
          opacity: 1,
        }}
      />
    );
    
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot with fill styling', () => {
    const data = createMockChartData(8);
    const { toJSON } = render(
      <Chart 
        data={data} 
        width={250} 
        height={180}
        fillStyle={{
          color: '#34C759',
          opacity: 0.2,
        }}
      />
    );
    
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot with both line and fill', () => {
    const data = createMockStockData(15);
    const { toJSON } = render(
      <Chart 
        data={data} 
        width={350} 
        height={220}
        lineStyle={{
          color: '#FF3B30',
          width: 2.5,
          opacity: 0.9,
        }}
        fillStyle={{
          color: '#FF3B30',
          opacity: 0.15,
        }}
      />
    );
    
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot with custom padding', () => {
    const data = createMockChartData(12);
    const { toJSON } = render(
      <Chart 
        data={data} 
        width={280} 
        height={190}
        padding={{
          top: 25,
          right: 35,
          bottom: 45,
          left: 55,
        }}
      />
    );
    
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot with axes configuration', () => {
    const data = createMockStockData(20);
    const { toJSON } = render(
      <Chart 
        data={data} 
        width={400} 
        height={250}
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
      />
    );
    
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot with vertical indicators', () => {
    const data = createMockChartData(15);
    const { toJSON } = render(
      <Chart 
        data={data} 
        width={320} 
        height={200}
        indicators={[
          { x: 3, color: '#FF9500', width: 2 },
          { x: 8, color: '#5856D6', width: 1.5 },
          { x: 12, color: '#AF52DE', width: 3 },
        ]}
      />
    );
    
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot with interaction enabled', () => {
    const data = createMockStockData(25);
    const onTooltipData = jest.fn();
    
    const { toJSON } = render(
      <Chart 
        data={data} 
        width={380} 
        height={240}
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
    
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot with complex configuration', () => {
    const data = createMockStockData(30);
    const { toJSON } = render(
      <Chart 
        data={data} 
        width={450} 
        height={280}
        lineStyle={{
          color: '#007AFF',
          width: 2,
          opacity: 1,
        }}
        fillStyle={{
          color: '#007AFF',
          opacity: 0.1,
        }}
        padding={{
          top: 20,
          right: 40,
          bottom: 50,
          left: 60,
        }}
        axes={{
          x: {
            visible: true,
            labelFormatter: (value) => new Date(value).toLocaleDateString(),
          },
          y: {
            visible: true,
            labelFormatter: (value) => `$${value.toFixed(0)}`,
          },
        }}
        indicators={[
          { x: data.x[5], color: '#FF3B30', width: 2 },
          { x: data.x[15], color: '#34C759', width: 1.5 },
        ]}
        interaction={{
          enabled: true,
          onTooltipData: jest.fn(),
        }}
      />
    );
    
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot with edge case data', () => {
    const data = {
      x: [1],
      y: [100],
    };
    
    const { toJSON } = render(
      <Chart data={data} width={200} height={150} />
    );
    
    expect(toJSON()).toMatchSnapshot();
  });

  it('matches snapshot with negative values', () => {
    const data = {
      x: [-5, -3, -1, 1, 3, 5],
      y: [-20, -10, 0, 10, 20, 30],
    };
    
    const { toJSON } = render(
      <Chart data={data} width={250} height={180} />
    );
    
    expect(toJSON()).toMatchSnapshot();
  });
});
