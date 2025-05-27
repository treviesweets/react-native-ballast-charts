/**
 * useCoordinateLookup Hook - Production Ready
 * Pre-calculates coordinate lookup table for worklet-safe gesture handling
 * Optimized for performance with configurable debug logging
 */

import { useMemo } from 'react';
import { ChartData, Rectangle, ScaledPoint } from '../utils/types';

// Debug flag - set to false for production
const DEBUG_COORDINATE_LOOKUP = false;

/**
 * Single entry in the coordinate lookup table
 * Contains all coordinate systems needed for gesture handling
 */
export interface CoordinateEntry {
  /** Index in original data array */
  dataIndex: number;
  /** Original X value (timestamp, etc.) */
  originalX: number;
  /** Original Y value (price, etc.) */
  originalY: number;
  /** Scaled X coordinate for visual positioning */
  scaledX: number;
  /** Scaled Y coordinate for visual positioning */
  scaledY: number;
  /** Left boundary of hit zone (inclusive) */
  hitZoneStart: number;
  /** Right boundary of hit zone (exclusive) */
  hitZoneEnd: number;
}

export interface UseCoordinateLookupProps {
  /** Chart data with x and y arrays */
  data: ChartData;
  /** Chart drawable area after padding */
  chartArea: Rectangle;
  /** Scaled data points from useDataScaling */
  scaledData: ScaledPoint[];
}

export interface UseCoordinateLookupReturn {
  /** Complete lookup table with hit zones - for worklet access */
  lookupTable: CoordinateEntry[];
  /** Deprecated function - kept for compatibility */
  findPointAtGestureX: (gestureX: number) => CoordinateEntry | null;
}

/**
 * Calculates midpoint hit zones for data points
 * Each point's hit zone extends to the midpoint with adjacent points
 * 
 * @param scaledXPositions - Array of scaled X coordinates
 * @param chartArea - Chart drawable area rectangle
 * @returns Array of hit zone boundaries
 */
function calculateHitZones(
  scaledXPositions: number[], 
  chartArea: Rectangle
): Array<{ start: number; end: number }> {
  
  if (DEBUG_COORDINATE_LOOKUP) {
    console.log('🧮 calculateHitZones: Starting calculation');
    console.log('📊 Input:', { positions: scaledXPositions.length, chartArea });
  }
  
  const zones = [];
  
  for (let i = 0; i < scaledXPositions.length; i++) {
    const currentX = scaledXPositions[i];
    
    // Start of hit zone
    const startX = i === 0 
      ? chartArea.x  // First point starts at chart area edge
      : (scaledXPositions[i - 1] + currentX) / 2;  // Midpoint with previous point
    
    // End of hit zone  
    const endX = i === scaledXPositions.length - 1
      ? chartArea.x + chartArea.width  // Last point ends at chart area edge
      : (currentX + scaledXPositions[i + 1]) / 2;  // Midpoint with next point
      
    zones.push({ start: startX, end: endX });
    
    // Debug logging for first few zones only
    if (DEBUG_COORDINATE_LOOKUP && i < 3) {
      console.log(`🎯 Zone ${i}: ${startX.toFixed(1)} to ${endX.toFixed(1)} (point at ${currentX.toFixed(1)})`);
    }
  }
  
  if (DEBUG_COORDINATE_LOOKUP) {
    console.log('✅ calculateHitZones: Complete');
  }
  
  return zones;
}

/**
 * Pre-calculates coordinate lookup table for worklet-safe access
 * 
 * Performance optimizations:
 * - Memoized calculation prevents unnecessary recalculations
 * - Hit zones calculated once during initialization
 * - Linear search optimized for worklet environment
 * 
 * @param props - Hook configuration
 * @returns Lookup table and deprecated compatibility function
 */
export const useCoordinateLookup = ({
  data,
  chartArea,
  scaledData
}: UseCoordinateLookupProps): UseCoordinateLookupReturn => {
  
  if (DEBUG_COORDINATE_LOOKUP) {
    console.log('🔍 useCoordinateLookup: Starting hook initialization');
    console.log('📊 Input data:', { 
      dataXLength: data.x?.length || 0, 
      dataYLength: data.y?.length || 0,
      scaledDataLength: scaledData?.length || 0,
      chartArea: chartArea 
    });
  }
  
  // Generate lookup table with hit zones
  const lookupTable = useMemo(() => {
    if (DEBUG_COORDINATE_LOOKUP) {
      console.log('🏗️ useCoordinateLookup: Building lookup table...');
    }
    
    // Early return for empty data
    if (!scaledData.length || !data.x.length || !data.y.length) {
      if (DEBUG_COORDINATE_LOOKUP) {
        console.log('⚠️ useCoordinateLookup: Empty data, returning empty table');
      }
      return [];
    }
    
    // Extract scaled X positions for hit zone calculation
    const scaledXPositions = scaledData.map(point => point.x);
    
    if (DEBUG_COORDINATE_LOOKUP) {
      console.log('📍 Scaled X positions:', {
        first5: scaledXPositions.slice(0, 5),
        total: scaledXPositions.length
      });
    }
    
    // Calculate midpoint hit zones
    const hitZones = calculateHitZones(scaledXPositions, chartArea);
    
    // Build complete lookup table
    const table: CoordinateEntry[] = scaledData.map((scaledPoint, index) => ({
      dataIndex: index,
      originalX: scaledPoint.originalX,
      originalY: scaledPoint.originalY,
      scaledX: scaledPoint.x,
      scaledY: scaledPoint.y,
      hitZoneStart: hitZones[index].start,
      hitZoneEnd: hitZones[index].end,
    }));
    
    if (DEBUG_COORDINATE_LOOKUP) {
      console.log('✅ useCoordinateLookup: Lookup table created');
      console.log('📋 Table summary:', {
        entries: table.length,
        firstEntry: table[0] ? {
          dataIndex: table[0].dataIndex,
          hitZone: `${table[0].hitZoneStart.toFixed(1)}-${table[0].hitZoneEnd.toFixed(1)}`,
          scaledX: table[0].scaledX.toFixed(1)
        } : null,
        lastEntry: table[table.length - 1] ? {
          dataIndex: table[table.length - 1].dataIndex,
          hitZone: `${table[table.length - 1].hitZoneStart.toFixed(1)}-${table[table.length - 1].hitZoneEnd.toFixed(1)}`,
          scaledX: table[table.length - 1].scaledX.toFixed(1)
        } : null,
        chartAreaRange: `${chartArea.x} to ${chartArea.x + chartArea.width}`
      });
    }
    
    return table;
  }, [data, chartArea, scaledData]);
  
  if (DEBUG_COORDINATE_LOOKUP) {
    console.log('🎉 useCoordinateLookup: Hook initialization complete');
  }
  
  return {
    lookupTable,
    // Deprecated function - kept for compatibility, not used in worklet version
    findPointAtGestureX: () => null
  };
};
