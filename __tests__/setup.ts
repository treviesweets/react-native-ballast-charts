/**
 * Jest Test Setup
 * Global test configuration for React Native Simple Charts
 */

import 'react-native-gesture-handler/jestSetup';

// Mock react-native modules that aren't available in Jest environment
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Global test utilities
global.console = {
  ...console,
  // Suppress console.warn for expected warnings in tests
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock Dimensions API
const mockDimensions = {
  get: jest.fn(() => ({
    width: 375,
    height: 812,
    scale: 3,
    fontScale: 1,
  })),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

jest.mock('react-native/Libraries/Utilities/Dimensions', () => mockDimensions);

// Mock Platform API
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'ios',
  select: jest.fn((options) => options.ios),
}));

// Silence the warning: Animated: `useNativeDriver` is not supported
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');

// Mock console methods for cleaner test output
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return;
    }
    originalError.call(console, ...args);
  };

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('deprecated') || args[0].includes('componentWillReceiveProps'))
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

// Test helper functions
export const createMockChartData = (length = 10) => ({
  x: Array.from({ length }, (_, i) => i),
  y: Array.from({ length }, (_, i) => Math.sin(i * 0.1) * 100 + 100),
});

export const createMockStockData = (length = 50) => ({
  x: Array.from({ length }, (_, i) => Date.now() + i * 86400000), // Daily timestamps
  y: Array.from({ length }, (_, i) => 100 + Math.random() * 50 + i * 0.5), // Trending stock prices
});

export const mockChartProps = {
  data: createMockChartData(),
  width: 300,
  height: 200,
};

export const mockStockChartProps = {
  data: createMockStockData(),
  width: 350,
  height: 250,
  interaction: {
    enabled: true,
    onTooltipData: jest.fn(),
  },
};

// Test data generators
export const generateValidData = (points = 10) => ({
  x: Array.from({ length: points }, (_, i) => i * 10),
  y: Array.from({ length: points }, (_, i) => Math.random() * 100),
});

export const generateInvalidData = () => [
  { x: [], y: [] }, // Empty arrays
  { x: [1, 2], y: [1] }, // Mismatched lengths
  { x: [1, null], y: [1, 2] }, // Null values
  { x: [1, NaN], y: [1, 2] }, // NaN values
  { x: [1, Infinity], y: [1, 2] }, // Infinity values
  { x: ['a', 'b'], y: [1, 2] }, // Non-numeric values
];

// Mock data generators for updated API
export const createMockScaledPoints = (length = 10) => {
  return Array.from({ length }, (_, i) => ({
    x: i * 50,
    y: 100 + Math.sin(i * 0.1) * 50,
    originalX: i * 10,
    originalY: 100 + Math.sin(i * 0.1) * 50,
    index: i,
  }));
};

export const createMockRectangle = () => ({
  x: 20,
  y: 10,
  width: 300,
  height: 200,
});

export const createMockLineStyle = (smoothing: 'none' | 'bezier' | 'catmull-rom' | 'cardinal' = 'none') => ({
  smoothing,
  color: '#007AFF',
  width: 2,
  opacity: 1,
});

export const createMockGapConfig = (enabled = true) => ({
  enabled,
  threshold: 2.5,
  fixedWidthGaps: false,
  fixedWidth: 40,
});
