/**
 * Custom type declarations for react-native-svg components to fix TypeScript errors
 * This helps bridge the gap between the React component model and the SVG component model
 */

import React from 'react';
import { ColorValue } from 'react-native';
import 'react-native-svg';

declare module 'react-native-svg' {
  // Extend the G component to be a valid JSX element
  export interface GProps {
    children?: React.ReactNode;
  }

  export class G extends React.Component<GProps> {}

  // Extend the Line component
  export interface LineProps {
    x1?: number | string;
    y1?: number | string;
    x2?: number | string;
    y2?: number | string;
    stroke?: string | ColorValue;
    strokeWidth?: number;
    strokeOpacity?: number;
    strokeLinecap?: string;
    strokeDasharray?: string | number[];
  }

  export class Line extends React.Component<LineProps> {}

  // Extend the Text component
  export interface TextProps {
    x?: number | string;
    y?: number | string;
    dx?: number | string;
    dy?: number | string;
    fill?: string | ColorValue;
    fontSize?: number | string;
    fontWeight?: string | number;
    textAnchor?: string;
    alignmentBaseline?: string;
    children?: React.ReactNode;
  }

  export class Text extends React.Component<TextProps> {}

  // Extend the Path component
  export interface PathProps {
    d?: string;
    fill?: string | ColorValue;
    fillOpacity?: number;
    stroke?: string | ColorValue;
    strokeWidth?: number;
    strokeOpacity?: number;
    strokeLinecap?: string;
    strokeLinejoin?: string;
    strokeDasharray?: string | number[];
  }

  export class Path extends React.Component<PathProps> {}

  // Extend the Svg component
  export interface SvgProps {
    width?: number | string;
    height?: number | string;
    viewBox?: string;
    preserveAspectRatio?: string;
    style?: any;
    children?: React.ReactNode;
  }

  export default class Svg extends React.Component<SvgProps> {}
}

// Fix for Reanimated transform types
declare module 'react-native-reanimated' {
  interface DefaultStyle {
    transform?: any;
  }
}
