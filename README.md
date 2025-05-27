# 📈 React Native Simple Charts

[![npm version](https://badge.fury.io/js/react-native-simple-charts.svg)](https://badge.fury.io/js/react-native-simple-charts)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://badgen.net/badge/built%20with/TypeScript/blue)](https://www.typescriptlang.org/)

As we worked on our app www.get-ballast.com we felt that there was a gap in the market for a **lightweight**, **high-performance**, **interactive** charting library for React Native designed that could display data with varying x and y spacing accurately. Built with TypeScript, optimized for 60fps interactions, and featuring **dynamic padding** for optimal space usage.

## ✨ Features

- 🚀 **High Performance**: 60fps smooth interactions, worklet-safe gesture handling
- 📱 **Mobile Optimized**: Dynamic padding adapts to screen space and axis visibility
- 🎯 **Interactive**: Draggable crosshair with real-time tooltip and callbacks
- 📊 **Flexible**: Single component supports line charts and distribution graphs  
- 🔧 **TypeScript**: Full type safety with excellent IntelliSense support
- 💰 **Financial Focus**: Built for stock prices, time series, and probability distributions
- 🎨 **Customizable**: Comprehensive styling options with sensible defaults
- ⚡ **Zero Config**: Works out of the box, extensive configuration available

## 📱 Demo

```tsx
import { Chart } from 'react-native-simple-charts';

const stockData = {
  x: [1640995200000, 1641081600000, 1641168000000], // timestamps
  y: [150.5, 152.3, 148.7] // prices
};

<Chart
  data={stockData}
  width={350}
  height={200}
  axes={{ x: { show: true }, y: { show: true } }}
  interaction={{ enabled: true }}
/>
```

## 📦 Installation

```bash
npm install react-native-simple-charts
```

### Required Peer Dependencies

```bash
npm install react-native-reanimated react-native-gesture-handler react-native-svg
```

For Expo projects:
```bash
expo install react-native-reanimated react-native-gesture-handler react-native-svg
```

## 🛠 Setup

1. Follow setup guides for peer dependencies:
   - [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation)
   - [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/docs/installation)
   - [React Native SVG](https://github.com/software-mansion/react-native-svg)

2. Wrap your app with `GestureHandlerRootView`:

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Your app content */}
    </GestureHandlerRootView>
  );
}
```

## 📖 API Reference

### Core Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `data` | `ChartData` | ✅ | Chart data with x/y arrays |
| `width` | `number` | ✅ | Chart width in pixels |
| `height` | `number` | ✅ | Chart height in pixels |
| `axes` | `AxisConfig` | ❌ | Axis configuration (enables dynamic padding) |
| `interaction` | `InteractionConfig` | ❌ | Enable drag interactions |
| `lineStyle` | `LineStyle` | ❌ | Line appearance and smoothing |
| `fillStyle` | `FillStyle` | ❌ | Fill area for distributions |
| `padding` | `Padding` | ❌ | Manual padding override (optional) |

### Data Format

```tsx
interface ChartData {
  x: number[];  // X-axis values (timestamps, prices, etc.)
  y: number[];  // Y-axis values (prices, probabilities, etc.)
}
```

**Important Notes:**
- Arrays must have the same length
- No null/undefined values allowed
- Library handles uneven time spacing automatically
- Optimal performance with ≤50 data points

## 🎯 Examples

### Stock Price Chart with Axes

```tsx
import { Chart } from 'react-native-simple-charts';

const StockChart = () => {
  const stockData = {
    x: [1640995200000, 1641081600000, 1641168000000],
    y: [150.5, 152.3, 148.7]
  };

  return (
    <Chart
      data={stockData}
      width={350}
      height={200}
      axes={{
        x: { show: true }, // Dates on X-axis
        y: { show: true }  // Prices on Y-axis
      }}
      lineStyle={{ 
        color: '#2563eb', 
        width: 2,
        smoothing: 'bezier' 
      }}
      interaction={{ 
        enabled: true,
        onDrag: (x, y, index) => {
          console.log(`Price: $${y.toFixed(2)} on ${new Date(x).toLocaleDateString()}`);
        }
      }}
      indicators={[
        { x: 1641168000000, color: '#ef4444', label: 'Event' }
      ]}
    />
  );
};
```

### Distribution Chart (Minimal Padding)

```tsx
const DistributionChart = () => {
  const data = {
    x: [100, 110, 120, 130, 140, 150],
    y: [0.1, 0.3, 0.4, 0.3, 0.2, 0.1]
  };

  return (
    <Chart
      data={data}
      width={350}
      height={200}
      // No axes = automatic minimal padding for maximum space
      lineStyle={{ color: '#10b981' }}
      fillStyle={{ enabled: true, color: '#10b981', opacity: 0.2 }}
      interaction={{ enabled: true }}
    />
  );
};
```

### Interactive Chart with Custom Tooltip

```tsx
const InteractiveChart = () => {
  const [highlightedPoint, setHighlightedPoint] = useState(null);

  return (
    <>
      <Chart
        data={stockData}
        width={350}
        height={200}
        axes={{ x: { show: true }, y: { show: true } }}
        interaction={{
          enabled: true,
          onDrag: (x, y, index) => {
            setHighlightedPoint({
              date: new Date(x).toLocaleDateString(),
              price: `$${y.toFixed(2)}`
            });
          }
        }}
      />
      
      {highlightedPoint && (
        <View style={styles.tooltip}>
          <Text>Date: {highlightedPoint.date}</Text>
          <Text>Price: {highlightedPoint.price}</Text>
        </View>
      )}
    </>
  );
};
```

## 💡 Dynamic Padding System

**Automatic Space Optimization** - Charts automatically adjust padding based on axis visibility:

```tsx
// Axes shown: 60px left, 40px bottom (space for labels)
<Chart axes={{ x: { show: true }, y: { show: true } }} />

// Axes hidden: 20px minimal padding (maximum chart space)
<Chart /> // or axes={{ x: { show: false }, y: { show: false } }}
```

**Space Savings:**
- **Mobile phones**: Up to 16% more chart space when axes are hidden
- **Automatic**: No configuration needed
- **Override**: Manual padding still available when needed

## ⚡ Performance Guidelines

- **Data Points**: Limit to 50 points for optimal 60fps performance
- **Updates**: Use `useMemo` for data transformations  
- **Memory**: Library automatically manages gesture handling on UI thread
- **Smoothing**: Bezier/Catmull-Rom smoothing adds minimal overhead

## 🎨 Customization

### Line Smoothing

```tsx
<Chart
  lineStyle={{
    smoothing: 'bezier',    // 'none' | 'bezier' | 'catmull-rom' | 'cardinal'
    tension: 0.4,           // 0-1, affects curve tightness
    color: '#2563eb',
    width: 2
  }}
/>
```

### Advanced Styling

```tsx
<Chart
  lineStyle={{ color: '#2563eb', width: 3, opacity: 0.8 }}
  fillStyle={{ enabled: true, color: '#2563eb', opacity: 0.1 }}
  padding={{ top: 20, right: 20, bottom: 40, left: 60 }} // Manual override
/>
```

## 🐛 Troubleshooting

**Charts not rendering:**
- Ensure peer dependencies are installed and configured
- Check data format (arrays of same length, no null values)
- Verify chart dimensions are positive numbers

**Gestures not working:**
- Wrap app with `GestureHandlerRootView`
- Enable with `interaction={{ enabled: true }}`
- Check that chart has sufficient size for touch targets

**Performance issues:**
- Limit data points to ≤50 for optimal performance
- Use `useMemo` for expensive data processing
- Avoid frequent data updates (>30fps)

**TypeScript errors:**
- Ensure you're importing types: `import type { ChartData } from 'react-native-simple-charts'`
- Check peer dependency versions match requirements

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 🔗 Links

- [GitHub Repository](https://github.com/yourusername/react-native-simple-charts)
- [NPM Package](https://www.npmjs.com/package/react-native-simple-charts)
- [Issue Tracker](https://github.com/yourusername/react-native-simple-charts/issues)

---

Built with ❤️ for the React Native community