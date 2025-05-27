/**
 * StockScreen Component - Interactive Stock Chart Demo
 * Demonstrates smooth line rendering with various curve algorithms
 * 
 * Features:
 * - Interactive smoothing type buttons (None, Bézier, Catmull-Rom, Cardinal)
 * - Tension buttons for curve adjustments
 * - Synthetic 30-day stock data generation
 * - Interactive gesture handling with crosshair
 * - Clean UI with proper styling and accessibility
 */

import React, { useState, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  Dimensions, 
  Text, 
  TouchableOpacity,
  ScrollView,
  PixelRatio
} from 'react-native';

// Import chart library
import { Chart } from '../chart-wrapper';
import { LineSmoothingMethod } from '../chart-wrapper/utils/types';

// Import synthetic data generator
import { generateSyntheticStockData } from '../utils/stockData';

// Debug flag - set to false for production
const DEBUG_APP = false;

/**
 * Stock Screen Component
 * 
 * Displays interactive stock chart with synthetic 30-day data and smoothing controls.
 * Demonstrates the chart library's capabilities including various smoothing algorithms,
 * real-time tension adjustment, smooth crosshair animations, and responsive design.
 * 
 * @returns Rendered stock chart demo screen
 */
export const StockScreen: React.FC = () => {
  // Device and screen information
  const { width: screenWidth } = Dimensions.get('window');
  const chartWidth = screenWidth * 0.9; // 90% of screen width
  const chartHeight = 350; // Reduced height to make room for controls

  // State for smoothing controls
  const [smoothingMethod, setSmoothingMethod] = useState<LineSmoothingMethod>('none');
  const [tension, setTension] = useState<number>(0.3);
  // State for highlighted data point
  const [highlightedPoint, setHighlightedPoint] = useState<{
    date: string;
    price: string;
    isActive: boolean;
  }>({ date: '', price: '', isActive: false });

  // State for axis visibility (to test dynamic padding)
  const [showXAxis, setShowXAxis] = useState(true);
  const [showYAxis, setShowYAxis] = useState(true);


  // Smoothing options for buttons
  const smoothingOptions: { method: LineSmoothingMethod; label: string; description: string }[] = [
    { method: 'none', label: 'None', description: 'Sharp corners' },
    { method: 'bezier', label: 'Bézier', description: 'Smooth curves' },
    { method: 'catmull-rom', label: 'Catmull-Rom', description: 'Scientific smooth' },
    { method: 'cardinal', label: 'Cardinal', description: 'Tension-based' },
  ];

  if (DEBUG_APP) {
    console.log('🚀 STOCK SCREEN: Component loaded');
    console.log('📱 DEVICE INFO:', {
      pixelRatio: PixelRatio.get(),
      fontScale: PixelRatio.getFontScale(),
      screenWidth,
      chartDimensions: { width: chartWidth, height: chartHeight }
    });
  }

  // Generate synthetic stock data (memoized for performance)
  const stockData = useMemo(() => {
    if (DEBUG_APP) {
      console.log('📊 Generating synthetic stock data...');
    }
    
    const data = generateSyntheticStockData();
    
    if (DEBUG_APP) {
      console.log('✅ Stock data generated:', {
        xLength: data.x.length,
        yLength: data.y.length,
        dateRange: data.x.length > 0 ? {
          start: new Date(data.x[0]).toLocaleDateString(),
          end: new Date(data.x[data.x.length - 1]).toLocaleDateString()
        } : null,
        priceRange: data.y.length > 0 ? {
          min: Math.min(...data.y).toFixed(2),
          max: Math.max(...data.y).toFixed(2)
        } : null
      });
    }
    
    return data;
  }, []);

  /**
   * Chart interaction handlers
   * These callbacks demonstrate real-time data access during user interactions
   */
  
  const handleDrag = (x: number, y: number, index: number) => {
    const formattedDate = new Date(x).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    const formattedPrice = `$${y.toFixed(2)}`;
    
    setHighlightedPoint({
      date: formattedDate,
      price: formattedPrice,
      isActive: true
    });
    
    if (DEBUG_APP) {
      console.log(`📊 Chart Drag - Date: ${formattedDate}, Price: ${formattedPrice}, Index: ${index}`);
    }
  };

  const handleDragStart = (x: number, y: number, index: number) => {
    const formattedDate = new Date(x).toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    const formattedPrice = `$${y.toFixed(2)}`;
    
    setHighlightedPoint({
      date: formattedDate,
      price: formattedPrice,
      isActive: true
    });
    
    if (DEBUG_APP) {
      console.log(`▶️ Chart Drag Start - Date: ${formattedDate}, Price: ${formattedPrice}`);
    }
  };

  const handleDragEnd = (x: number, y: number, index: number) => {
    // Keep the highlighted point visible but mark as inactive
    setHighlightedPoint(prev => ({ ...prev, isActive: false }));
    
    if (DEBUG_APP) {
      console.log(`⏸️ Chart Drag End - Date: ${new Date(x).toLocaleDateString()}, Price: $${y.toFixed(2)}`);
    }
  };

  if (DEBUG_APP) {
    console.log('🎨 StockScreen: Rendering with smoothing:', smoothingMethod, 'tension:', tension);
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Interactive Stock Chart</Text>
        <Text style={styles.subtitle}>Try different smoothing algorithms and drag to explore</Text>
        
        {/* Chart Container */}
        <View style={styles.chartContainer}>
          <Chart
            data={stockData}
            width={chartWidth}
            height={chartHeight}
            lineStyle={{
              color: '#2563eb',
              width: 2,
              opacity: 1,
              smoothing: smoothingMethod,
              tension: tension
            }}
            interaction={{
              enabled: true,
              onDrag: handleDrag,
              onDragStart: handleDragStart,
              onDragEnd: handleDragEnd
            }}
            axes={{
              x: { show: showXAxis },
              y: { show: showYAxis }
            }}
            accessibilityLabel="Interactive Stock Price Chart with Smoothing"
          />
        </View>

        {/* Highlighted Data Display */}
        {highlightedPoint.date && highlightedPoint.price && (
          <View style={[
            styles.highlightedDataContainer,
            highlightedPoint.isActive && styles.highlightedDataActive
          ]}>
            <View style={styles.highlightedDataRow}>
              <Text style={styles.highlightedDataLabel}>📅 Date:</Text>
              <Text style={styles.highlightedDataValue}>{highlightedPoint.date}</Text>
            </View>
            <View style={styles.highlightedDataRow}>
              <Text style={styles.highlightedDataLabel}>💰 Price:</Text>
              <Text style={[styles.highlightedDataValue, styles.highlightedDataPrice]}>
                {highlightedPoint.price}
              </Text>
            </View>
            <Text style={styles.highlightedDataHint}>
              {highlightedPoint.isActive ? '🔄 Drag to explore different values' : '👆 Tap and drag on chart to update'}
            </Text>
          </View>
        )}


        {/* Smoothing Controls */}
        <View style={styles.controlsContainer}>
          <Text style={styles.controlsTitle}>Smoothing Method</Text>
          <View style={styles.buttonRow}>
            {smoothingOptions.map((option) => (
              <TouchableOpacity
                key={option.method}
                style={[
                  styles.smoothingButton,
                  smoothingMethod === option.method && styles.smoothingButtonActive
                ]}
                onPress={() => setSmoothingMethod(option.method)}
                accessibilityLabel={`Set smoothing to ${option.label}`}
              >
                <Text style={[
                  styles.smoothingButtonText,
                  smoothingMethod === option.method && styles.smoothingButtonTextActive
                ]}>
                  {option.label}
                </Text>
                <Text style={[
                  styles.smoothingButtonDescription,
                  smoothingMethod === option.method && styles.smoothingButtonDescriptionActive
                ]}>
                  {option.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          {/* Tension Controls */}
          {smoothingMethod !== 'none' && (
            <View style={styles.tensionContainer}>
              <Text style={styles.tensionLabel}>
                Tension: {tension.toFixed(2)}
              </Text>
              <View style={styles.tensionButtons}>
                {[0.1, 0.3, 0.5, 0.7, 1.0].map((value) => (
                  <TouchableOpacity
                    key={value}
                    style={[
                      styles.tensionButton,
                      Math.abs(tension - value) < 0.05 && styles.tensionButtonActive
                    ]}
                    onPress={() => setTension(value)}
                    accessibilityLabel={`Set tension to ${value}`}
                  >
                    <Text style={[
                      styles.tensionButtonText,
                      Math.abs(tension - value) < 0.05 && styles.tensionButtonTextActive
                    ]}>
                      {value.toFixed(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={styles.tensionLabels}>
                <Text style={styles.tensionLabelText}>Tight</Text>
                <Text style={styles.tensionLabelText}>Loose</Text>
              </View>
            </View>
          )}
        </View>

        {/* Axis Toggle Controls - Test Dynamic Padding */}
        <View style={styles.controlsContainer}>
          <Text style={styles.controlsTitle}>Axis Controls (Dynamic Padding Test)</Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[
                styles.smoothingButton,
                showXAxis && styles.smoothingButtonActive
              ]}
              onPress={() => setShowXAxis(!showXAxis)}
              accessibilityLabel="Toggle X-axis visibility"
            >
              <Text style={[
                styles.smoothingButtonText,
                showXAxis && styles.smoothingButtonTextActive
              ]}>
                X-Axis
              </Text>
              <Text style={[
                styles.smoothingButtonDescription,
                showXAxis && styles.smoothingButtonDescriptionActive
              ]}>
                {showXAxis ? 'Shown (40px)' : 'Hidden (20px)'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.smoothingButton,
                showYAxis && styles.smoothingButtonActive
              ]}
              onPress={() => setShowYAxis(!showYAxis)}
              accessibilityLabel="Toggle Y-axis visibility"
            >
              <Text style={[
                styles.smoothingButtonText,
                showYAxis && styles.smoothingButtonTextActive
              ]}>
                Y-Axis
              </Text>
              <Text style={[
                styles.smoothingButtonDescription,
                showYAxis && styles.smoothingButtonDescriptionActive
              ]}>
                {showYAxis ? 'Shown (60px)' : 'Hidden (20px)'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>


        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How to Use:</Text>
          <Text style={styles.instructionsText}>
            • Tap buttons above to change smoothing method{'\n'}
            • Adjust tension buttons for curve tightness{'\n'}
            • Drag on chart to see crosshair interaction{'\n'}
            • Compare different algorithms with same data
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  controlsContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  controlsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  smoothingButton: {
    flex: 1,
    minWidth: '48%',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 12,
    margin: 2,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  smoothingButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  smoothingButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  smoothingButtonTextActive: {
    color: '#2563eb',
  },
  smoothingButtonDescription: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  smoothingButtonDescriptionActive: {
    color: '#3b82f6',
  },
  tensionContainer: {
    marginTop: 12,
  },
  tensionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
    marginBottom: 12,
  },
  tensionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tensionButton: {
    flex: 1,
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 8,
    margin: 2,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  tensionButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#2563eb',
  },
  tensionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  tensionButtonTextActive: {
    color: '#2563eb',
  },
  tensionLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  tensionLabelText: {
    fontSize: 12,
    color: '#6b7280',
  },
  instructionsContainer: {
    width: '100%',
    backgroundColor: '#f0f9ff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0c4a6e',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#075985',
    lineHeight: 20,
  },
  highlightedDataContainer: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#f3f4f6',
  },
  highlightedDataActive: {
    borderColor: '#2563eb',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    backgroundColor: '#fefffe',
  },
  highlightedDataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  highlightedDataLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6b7280',
    flex: 1,
  },
  highlightedDataValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'right',
    flex: 2,
  },
  highlightedDataPrice: {
    color: '#059669',
    fontSize: 18,
    fontWeight: '700',
  },
  highlightedDataHint: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
    fontStyle: 'italic',
  },
});

export default StockScreen;
