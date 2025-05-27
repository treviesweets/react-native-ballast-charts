/**
 * React Native Reanimated Mock
 * Provides mock implementations for react-native-reanimated
 */

// Mock shared values
export const useSharedValue = (initial: any) => ({
  value: initial,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  modify: jest.fn(),
});

// Mock animated styles
export const useAnimatedStyle = (callback: () => any) => {
  return callback();
};

// Mock gestures
export const useAnimatedGestureHandler = (handlers: any) => handlers;

// Mock worklets
export const runOnJS = (fn: Function) => fn;
export const runOnUI = (fn: Function) => fn;

// Mock interpolation
export const interpolate = (
  value: number,
  inputRange: number[],
  outputRange: number[],
  extrapolate?: any
) => {
  // Simple linear interpolation for testing
  if (inputRange.length !== outputRange.length) return outputRange[0];
  
  const index = inputRange.findIndex(x => value <= x);
  if (index === -1) return outputRange[outputRange.length - 1];
  if (index === 0) return outputRange[0];
  
  const ratio = (value - inputRange[index - 1]) / (inputRange[index] - inputRange[index - 1]);
  return outputRange[index - 1] + ratio * (outputRange[index] - outputRange[index - 1]);
};

// Mock animated components
export const Animated = {
  View: 'div',
  ScrollView: 'div',
  Text: 'span',
  createAnimatedComponent: (component: any) => component,
};

// Mock timing functions
export const withTiming = (value: any, config?: any) => value;
export const withSpring = (value: any, config?: any) => value;
export const withDecay = (config?: any) => config?.velocity || 0;

// Mock easing
export const Easing = {
  linear: (x: number) => x,
  ease: (x: number) => x,
  quad: (x: number) => x * x,
  cubic: (x: number) => x * x * x,
  bezier: () => (x: number) => x,
  in: (easing: any) => easing,
  out: (easing: any) => easing,
  inOut: (easing: any) => easing,
};

// Mock extrapolation
export const Extrapolate = {
  EXTEND: 'extend',
  CLAMP: 'clamp',
  IDENTITY: 'identity',
};

export default {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  runOnJS,
  runOnUI,
  interpolate,
  Animated,
  withTiming,
  withSpring,
  withDecay,
  Easing,
  Extrapolate,
};
