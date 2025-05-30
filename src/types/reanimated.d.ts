/**
 * Extended type definitions for react-native-reanimated to fix TypeScript errors
 */

import 'react-native-reanimated';

declare module 'react-native-reanimated' {
  // Override the DefaultStyle interface to accept any transform type
  interface DefaultStyle {
    transform?: any[];
    opacity?: number;
    backgroundColor?: string;
    width?: number;
    height?: number;
    top?: number;
    left?: number;
    right?: number;
    bottom?: number;
    margin?: number;
    marginTop?: number;
    marginRight?: number;
    marginBottom?: number;
    marginLeft?: number;
    padding?: number;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    paddingLeft?: number;
    borderWidth?: number;
    borderTopWidth?: number;
    borderRightWidth?: number;
    borderBottomWidth?: number;
    borderLeftWidth?: number;
    borderRadius?: number;
    borderTopLeftRadius?: number;
    borderTopRightRadius?: number;
    borderBottomRightRadius?: number;
    borderBottomLeftRadius?: number;
    position?: 'absolute' | 'relative';
    zIndex?: number;
    [key: string]: any;
  }
}