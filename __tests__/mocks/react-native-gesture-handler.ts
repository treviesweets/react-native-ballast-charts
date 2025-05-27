/**
 * React Native Gesture Handler Mock
 * Provides mock implementations for react-native-gesture-handler
 */

import React from 'react';

// Mock GestureDetector
export const GestureDetector = ({ children, gesture, ...props }: any) =>
  React.createElement('div', { 
    ...props, 
    'data-testid': 'gesture-detector',
    'data-gesture': gesture ? 'enabled' : 'disabled',
  }, children);

// Mock PanGestureHandler
export const PanGestureHandler = ({ children, ...props }: any) =>
  React.createElement('div', { ...props, 'data-testid': 'pan-gesture-handler' }, children);

// Mock gesture creation
export const Gesture = {
  Pan: () => ({
    onStart: jest.fn().mockReturnThis(),
    onUpdate: jest.fn().mockReturnThis(),
    onEnd: jest.fn().mockReturnThis(),
    onFinalize: jest.fn().mockReturnThis(),
    enabled: jest.fn().mockReturnThis(),
    minDistance: jest.fn().mockReturnThis(),
    activeOffsetX: jest.fn().mockReturnThis(),
    activeOffsetY: jest.fn().mockReturnThis(),
    failOffsetX: jest.fn().mockReturnThis(),
    failOffsetY: jest.fn().mockReturnThis(),
    simultaneousWithExternalGesture: jest.fn().mockReturnThis(),
  }),
  Tap: () => ({
    onStart: jest.fn().mockReturnThis(),
    onEnd: jest.fn().mockReturnThis(),
    numberOfTaps: jest.fn().mockReturnThis(),
    maxDuration: jest.fn().mockReturnThis(),
    enabled: jest.fn().mockReturnThis(),
  }),
  Pinch: () => ({
    onStart: jest.fn().mockReturnThis(),
    onUpdate: jest.fn().mockReturnThis(),
    onEnd: jest.fn().mockReturnThis(),
    enabled: jest.fn().mockReturnThis(),
  }),
};

// Mock gesture states
export const State = {
  UNDETERMINED: 0,
  FAILED: 1,
  BEGAN: 2,
  CANCELLED: 3,
  ACTIVE: 4,
  END: 5,
};

// Mock gesture handler root
export const GestureHandlerRootView = ({ children, ...props }: any) =>
  React.createElement('div', { ...props, 'data-testid': 'gesture-handler-root' }, children);

// Mock directions
export const Directions = {
  RIGHT: 1,
  LEFT: 2,
  UP: 4,
  DOWN: 8,
};

export default {
  GestureDetector,
  PanGestureHandler,
  Gesture,
  State,
  GestureHandlerRootView,
  Directions,
};
