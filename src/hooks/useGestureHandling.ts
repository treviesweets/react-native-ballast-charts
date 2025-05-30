/**
 * useGestureHandling Hook - Production Ready
 * Worklet-safe gesture handling with optimized coordinate lookup
 * High-performance gesture detection for interactive charts
 */

import { useMemo } from 'react';
import { useSharedValue, runOnJS, withSpring } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { UseGestureHandlingReturn } from '../utils/types';
import { CoordinateEntry } from './useCoordinateLookup';

// Debug flag - set to false for production
const DEBUG_GESTURE_HANDLING = false;

interface UseGestureHandlingProps {
  /** Raw lookup table data for worklet-safe access */
  lookupTable: CoordinateEntry[];
  /** Whether gesture handling is enabled */
  enabled: boolean;
  /** Chart area for initial positioning */
  chartArea: { x: number; y: number; width: number; height: number };
  /** Callback when drag position changes */
  onDrag?: (x: number, y: number, index: number) => void;
  /** Callback when drag starts */
  onDragStart?: (x: number, y: number, index: number) => void;
  /** Callback when drag ends */
  onDragEnd?: (x: number, y: number, index: number) => void;
  /** Callback for tap events */
  onTap?: (x: number, y: number, index: number) => void;
}

/**
 * Worklet-safe coordinate lookup using linear search
 * Finds the data point that matches the given gesture X coordinate
 * 
 * @param gestureX - X coordinate from gesture event
 * @param lookupTable - Pre-calculated coordinate lookup table
 * @returns Matching coordinate entry or null
 */
function findCoordinateAtGestureX(gestureX: number, lookupTable: CoordinateEntry[]): CoordinateEntry | null {
  'worklet';
  
  // Linear search through lookup table
  for (let i = 0; i < lookupTable.length; i++) {
    const entry = lookupTable[i];
    if (gestureX >= entry.hitZoneStart && gestureX < entry.hitZoneEnd) {
      return entry;
    }
  }
  
  // Handle edge case: gesture exactly at chart end
  if (lookupTable.length > 0) {
    const lastEntry = lookupTable[lookupTable.length - 1];
    if (gestureX === lastEntry.hitZoneEnd) {
      return lastEntry;
    }
  }
  
  return null;
}


/**
 * High-performance gesture handling hook for interactive charts
 * 
 * Features:
 * - Worklet-safe coordinate lookup for 60fps performance
 * - Support for pan, tap, and drag gestures
 * - Smooth spring animations for visual feedback
 * - Configurable callbacks for all gesture events
 * 
 * @param props - Hook configuration
 * @returns Gesture handler and animated values
 */
export const useGestureHandling = ({
  lookupTable,
  enabled,
  chartArea,
  onDrag,
  onDragStart,
  onDragEnd,
  onTap
}: UseGestureHandlingProps): UseGestureHandlingReturn => {
  
  if (DEBUG_GESTURE_HANDLING) {
    console.log('🤲 useGestureHandling: Starting hook initialization');
    console.log('⚙️ Configuration:', { 
      enabled, 
      chartArea,
      lookupTableEntries: lookupTable.length,
      hasCallbacks: {
        onDrag: !!onDrag,
        onDragStart: !!onDragStart,
        onDragEnd: !!onDragEnd,
        onTap: !!onTap
      }
    });
  }
  
  // Initialize drag position to final data point (most recent)
  const getInitialPosition = () => {
    if (lookupTable.length > 0) {
      const finalEntry = lookupTable[lookupTable.length - 1];
      return { x: finalEntry.scaledX, y: finalEntry.scaledY };
    }
    // Fallback to center if no data
    return { 
      x: chartArea.x + chartArea.width / 2, 
      y: chartArea.y + chartArea.height / 2 
    };
  };
  
  const initialPosition = getInitialPosition();
  
  if (DEBUG_GESTURE_HANDLING) {
    console.log('📍 Initial drag position (final data point):', initialPosition);
  }
  
  const dragX = useSharedValue(initialPosition.x);
  const dragY = useSharedValue(initialPosition.y);
  const isActive = useSharedValue(false);

  /**
   * Worklet-safe event handler with inline coordinate lookup
   * Processes gesture events and fires appropriate callbacks
   */
  const handleEvent = (event: any, callback?: (x: number, y: number, index: number) => void, eventType?: string) => {
    'worklet';
    
    if (!callback) {
      return;
    }
    
    // Find matching coordinate entry
    const foundEntry = findCoordinateAtGestureX(event.x, lookupTable);
    
    if (foundEntry) {
      // Update visual position using scaled coordinates with direct assignment
      dragX.value = foundEntry.scaledX;
      dragY.value = foundEntry.scaledY;
      
      // Fire callback with original data values
      runOnJS(callback)(foundEntry.originalX, foundEntry.originalY, foundEntry.dataIndex);
    }
  };

  // Pan gesture for dragging interactions
  const panGesture = useMemo(() => {
    if (DEBUG_GESTURE_HANDLING) {
      console.log('👆 useGestureHandling: Creating pan gesture, enabled =', enabled);
    }
    
    if (!enabled) {
      return Gesture.Pan().enabled(false);
    }
    
    const gesture = Gesture.Pan()
      .onBegin(e => { 
        'worklet'; 
        isActive.value = true; 
        handleEvent(e, onDragStart, 'dragStart'); 
      })
      .onUpdate(e => { 
        'worklet'; 
        handleEvent(e, onDrag, 'drag'); 
      })
      .onEnd(e => { 
        'worklet';
        isActive.value = false; 
        handleEvent(e, onDragEnd, 'dragEnd'); 
      })
      .minDistance(0)
      .activateAfterLongPress(0);
      
    if (DEBUG_GESTURE_HANDLING) {
      console.log('✅ Pan gesture created');
    }
    return gesture;
  }, [enabled, lookupTable, onDrag, onDragStart, onDragEnd]);

  // Tap gesture for single touch interactions
  const tapGesture = useMemo(() => {
    if (DEBUG_GESTURE_HANDLING) {
      console.log('👆 useGestureHandling: Creating tap gesture, enabled =', enabled);
    }
    
    if (!enabled) {
      return Gesture.Tap().enabled(false);
    }
    
    const gesture = Gesture.Tap()
      .onStart(e => { 
        'worklet'; 
        handleEvent(e, onTap, 'tap'); 
        isActive.value = true; 
        isActive.value = false; 
      })
      .maxDuration(250);
      
    if (DEBUG_GESTURE_HANDLING) {
      console.log('✅ Tap gesture created');
    }
    return gesture;
  }, [enabled, lookupTable, onTap]);

  // Combined gesture handler using Race for mutual exclusion
  const gestureHandler = useMemo(() => {
    if (DEBUG_GESTURE_HANDLING) {
      console.log('🤝 useGestureHandling: Creating combined gesture handler');
    }
    
    const combined = Gesture.Race(panGesture, tapGesture);
    
    if (DEBUG_GESTURE_HANDLING) {
      console.log('✅ Combined gesture handler created');
    }
    return combined;
  }, [panGesture, tapGesture]);

  if (DEBUG_GESTURE_HANDLING) {
    console.log('🎉 useGestureHandling: Hook initialization complete');
  }

  return { dragX, dragY, isActive, gestureHandler };
};
