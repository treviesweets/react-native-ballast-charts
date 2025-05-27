/**
 * React Native SVG Mock
 * Provides mock implementations for react-native-svg components
 */

import React from 'react';

// Mock SVG components
export const Svg = ({ children, ...props }: any) => 
  React.createElement('div', { ...props, 'data-testid': 'svg' }, children);

export const Path = (props: any) => 
  React.createElement('div', { ...props, 'data-testid': 'path' });

export const Line = (props: any) => 
  React.createElement('div', { ...props, 'data-testid': 'line' });

export const Text = ({ children, ...props }: any) => 
  React.createElement('div', { ...props, 'data-testid': 'text' }, children);

export const G = ({ children, ...props }: any) => 
  React.createElement('div', { ...props, 'data-testid': 'group' }, children);

export const Defs = ({ children, ...props }: any) => 
  React.createElement('div', { ...props, 'data-testid': 'defs' }, children);

export const LinearGradient = ({ children, ...props }: any) => 
  React.createElement('div', { ...props, 'data-testid': 'linear-gradient' }, children);

export const Stop = (props: any) => 
  React.createElement('div', { ...props, 'data-testid': 'stop' });

export const Circle = (props: any) => 
  React.createElement('div', { ...props, 'data-testid': 'circle' });

export const Rect = (props: any) => 
  React.createElement('div', { ...props, 'data-testid': 'rect' });

export default Svg;
