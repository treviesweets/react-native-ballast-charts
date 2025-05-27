# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-01-XX

### Added
- 🎉 **Initial Release** - High-performance interactive charts for React Native
- 📊 **Chart Component** - Single flexible component for line charts and distributions
- 🎯 **Interactive Gestures** - Draggable crosshair with real-time callbacks
- 📱 **Dynamic Padding System** - Automatic space optimization based on axis visibility
- 🔧 **TypeScript Support** - Full type safety with comprehensive interfaces
- ⚡ **Performance Optimization** - 60fps worklet-safe gesture handling
- 🎨 **Line Smoothing** - Multiple algorithms: Bezier, Catmull-Rom, Cardinal
- 📈 **Axis Rendering** - Automatic label generation for dates and prices  
- 🎛️ **Styling System** - Comprehensive customization options
- 📍 **Vertical Indicators** - Add markers and events to charts
- 🌊 **Fill Areas** - Support for distribution curves with transparent fills
- 📱 **Mobile Optimized** - Responsive design for various screen sizes

### Features
- **Chart Types**: Line charts, distribution graphs
- **Interactions**: Drag gestures, tap events, crosshair tooltip
- **Axes**: Automatic X/Y axis labels with dynamic padding
- **Smoothing**: None, Bezier, Catmull-Rom, Cardinal splines
- **Styling**: Line colors, widths, fills, indicators
- **Performance**: Up to 50 data points at 60fps
- **Data Format**: Simple x/y arrays, timestamps and numeric values

### Technical Details
- **Dependencies**: React Native, Reanimated, Gesture Handler, SVG
- **Architecture**: Hook-based, worklet-safe, TypeScript-first
- **Bundle Size**: Lightweight, tree-shakeable exports
- **Platform Support**: iOS, Android, Expo compatible

### Examples Included
- **Stock Chart**: Interactive price chart with date/price axes
- **Distribution Chart**: Probability distribution with minimal padding
- **Real-time Updates**: Dynamic data with smooth animations
- **Custom Styling**: Advanced customization examples

---

## Development Notes

### Breaking Changes
- N/A (Initial release)

### Migration Guide
- N/A (Initial release)

### Deprecations  
- N/A (Initial release)

### Internal Changes
- Initial architecture with coordinate lookup system
- Dynamic padding algorithm for space optimization
- Worklet-safe gesture handling implementation
- SVG path generation with multiple smoothing algorithms

---

*For detailed migration guides and breaking changes, see [MIGRATION.md](MIGRATION.md)*