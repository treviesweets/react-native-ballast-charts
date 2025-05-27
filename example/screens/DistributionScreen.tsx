/**
 * DistributionScreen Component - Price Probability Distribution Demo
 * Demonstrates probability distribution visualization with target price adjustment
 * 
 * Features:
 * - Normal distribution curve centered on target price
 * - Vertical indicators for current and target prices
 * - Interactive target price slider
 * - Smooth curve rendering with fill under curve
 * - Real-time probability calculations
 */

import React, { useState, useMemo, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  SafeAreaView, 
  Dimensions, 
  Text, 
  TouchableOpacity,
  ScrollView
} from 'react-native';

// Import chart library
import { Chart } from '../chart-wrapper';

// Import distribution utilities
import { 
  generateDistributionData, 
  generateStartingPrices, 
  getTargetPriceRange, 
  getProbabilityAtPrice 
} from '../utils/distributionData';

/**
 * Distribution Screen Component
 * 
 * Shows probability distribution of price outcomes centered on a target price.
 * Allows users to adjust the target price and see how the distribution shifts.
 * Includes vertical indicators for current price (fixed) and target price (adjustable).
 * 
 * @returns Rendered distribution demo screen
 */
export const DistributionScreen: React.FC = () => {
  // Device and screen information
  const { width: screenWidth } = Dimensions.get('window');
  const chartWidth = screenWidth * 0.9;
  const chartHeight = 350;

  // Initialize prices
  const { currentPrice, initialTargetPrice } = generateStartingPrices();
  const [targetPrice, setTargetPrice] = useState<number>(initialTargetPrice);
  
  // State for drag interaction
  const [draggedPrice, setDraggedPrice] = useState<number>(currentPrice);
  const [draggedProbability, setDraggedProbability] = useState<number>(0);
  
  // Calculate slider range
  const priceRange = getTargetPriceRange(currentPrice);
  
  // Target price options for buttons (easier than slider for demo)
  const targetPriceOptions = useMemo(() => {
    const options = [];
    for (let multiplier = 0.5; multiplier <= 2.0; multiplier += 0.25) {
      options.push(Math.round(currentPrice * multiplier));
    }
    return options;
  }, [currentPrice]);

  // Generate distribution data based on current target price
  const distributionData = useMemo(() => {
    return generateDistributionData(targetPrice, currentPrice, 50);
  }, [targetPrice, currentPrice]);

  // Calculate probability at current price
  const currentPriceProbability = useMemo(() => {
    return getProbabilityAtPrice(currentPrice, distributionData);
  }, [currentPrice, distributionData]);

  // Initialize dragged probability when distribution data changes
  useEffect(() => {
    const initialProbability = getProbabilityAtPrice(draggedPrice, distributionData);
    setDraggedProbability(initialProbability);
  }, [draggedPrice, distributionData]);

  /**
   * Chart drag interaction handlers
   * Show probability at any point on the distribution curve
   */
  const handleDrag = (x: number, y: number, index: number) => {
    setDraggedPrice(x);
    const probability = getProbabilityAtPrice(x, distributionData);
    setDraggedProbability(probability);
  };

  const handleDragStart = (x: number, y: number, index: number) => {
    setDraggedPrice(x);
    const probability = getProbabilityAtPrice(x, distributionData);
    setDraggedProbability(probability);
  };

  const handleDragEnd = (x: number, y: number, index: number) => {
    // Keep the final position when drag ends
    setDraggedPrice(x);
    const probability = getProbabilityAtPrice(x, distributionData);
    setDraggedProbability(probability);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Price Distribution Analysis</Text>
        <Text style={styles.subtitle}>Adjust target price to see probability distribution shift</Text>
        
        {/* Chart Container */}
        <View style={styles.chartContainer}>
          <Chart
            data={distributionData}
            width={chartWidth}
            height={chartHeight}
            lineStyle={{
              color: '#8b5cf6',
              width: 2,
              opacity: 1,
              smoothing: 'bezier',
              tension: 0.4
            }}
            fillStyle={{
              enabled: true,
              color: '#8b5cf6',
              opacity: 0.15
            }}
            indicators={[
              {
                x: currentPrice,
                color: '#ef4444',
                width: 2,
                label: 'Current',
                dashed: false
              },
              {
                x: targetPrice,
                color: '#22c55e',
                width: 2,
                label: 'Target',
                dashed: true
              }
            ]}
            interaction={{
              enabled: true,
              onDrag: handleDrag,
              onDragStart: handleDragStart,
              onDragEnd: handleDragEnd,
              dragLineStyle: {
                color: '#f59e0b',
                width: 2,
                opacity: 0.8
              }
            }}
            accessibilityLabel="Price Probability Distribution Chart"
          />
        </View>

        {/* Price Information */}
        <View style={styles.priceInfoContainer}>
          <View style={styles.priceInfoRow}>
            <View style={styles.priceInfo}>
              <Text style={styles.priceLabel}>Current Price</Text>
              <Text style={[styles.priceValue, styles.currentPrice]}>
                ${currentPrice.toFixed(2)}
              </Text>
              <Text style={styles.probabilityText}>
                Fixed: {(currentPriceProbability * 100).toFixed(1)}%
              </Text>
            </View>
            
            <View style={styles.priceInfo}>
              <Text style={styles.priceLabel}>Dragged Price</Text>
              <Text style={[styles.priceValue, styles.draggedPrice]}>
                ${draggedPrice.toFixed(2)}
              </Text>
              <Text style={styles.probabilityText}>
                Drag: {(draggedProbability * 100).toFixed(1)}%
              </Text>
            </View>
            
            <View style={styles.priceInfo}>
              <Text style={styles.priceLabel}>Target Price</Text>
              <Text style={[styles.priceValue, styles.targetPrice]}>
                ${targetPrice.toFixed(2)}
              </Text>
              <Text style={styles.probabilityText}>
                Peak: 100%
              </Text>
            </View>
          </View>
        </View>

        {/* Target Price Controls */}
        <View style={styles.controlsContainer}>
          <Text style={styles.controlsTitle}>Adjust Target Price</Text>
          <View style={styles.buttonGrid}>
            {targetPriceOptions.map((price) => (
              <TouchableOpacity
                key={price}
                style={[
                  styles.priceButton,
                  Math.abs(targetPrice - price) < 0.5 && styles.priceButtonActive
                ]}
                onPress={() => setTargetPrice(price)}
                accessibilityLabel={`Set target price to $${price}`}
              >
                <Text style={[
                  styles.priceButtonText,
                  Math.abs(targetPrice - price) < 0.5 && styles.priceButtonTextActive
                ]}>
                  ${price}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.rangeLabels}>
            <Text style={styles.rangeLabelText}>50% of current</Text>
            <Text style={styles.rangeLabelText}>200% of current</Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>How This Works:</Text>
          <Text style={styles.instructionsText}>
            • Red line shows current price (${currentPrice}) - fixed{'\n'}
            • Orange crosshair shows dragged price - interactive{'\n'}
            • Green dashed line shows target price - adjustable{'\n'}
            • Curve shows probability distribution of future prices{'\n'}
            • Drag anywhere on chart to see probability at that price{'\n'}
            • Tap buttons above to shift the entire distribution
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
  priceInfoContainer: {
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
  priceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  priceInfo: {
    alignItems: 'center',
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  priceValue: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  currentPrice: {
    color: '#ef4444',
  },
  draggedPrice: {
    color: '#f59e0b',
  },
  targetPrice: {
    color: '#22c55e',
  },
  probabilityText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
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
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    padding: 8,
    margin: 2,
    minWidth: '18%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  priceButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#8b5cf6',
  },
  priceButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  priceButtonTextActive: {
    color: '#8b5cf6',
  },
  rangeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  rangeLabelText: {
    fontSize: 12,
    color: '#6b7280',
  },
  instructionsContainer: {
    width: '100%',
    backgroundColor: '#fef3e2',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#fed7aa',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9a3412',
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    color: '#c2410c',
    lineHeight: 20,
  },
});

export default DistributionScreen;
