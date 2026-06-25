import { useState } from 'react';
import { type GestureResponderEvent, type LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Fonts, Radius } from '@/shared/ui/theme';

interface SliderFieldProps {
  value: number;
  onChangeValue: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  valueLabel?: (value: number) => string;
  testID?: string;
}

/**
 * @expo/ui's Slider only supports dragging the thumb — there's no native
 * primitive (Slider/Progress/Gauge/ProgressView) that lets a tap anywhere on
 * the track jump straight to that value, so this is a plain RN responder-based
 * bar instead.
 */
export const SliderField = ({
  value,
  onChangeValue,
  min = 0,
  max = 100,
  step = 1,
  valueLabel,
  testID,
}: SliderFieldProps) => {
  const [trackWidth, setTrackWidth] = useState(0);

  const handleLayout = (event: LayoutChangeEvent) => {
    setTrackWidth(event.nativeEvent.layout.width);
  };

  const updateFromLocationX = (locationX: number) => {
    if (trackWidth === 0) return;
    const ratio = Math.min(Math.max(locationX / trackWidth, 0), 1);
    const rawValue = min + ratio * (max - min);
    const steppedValue = Math.round(rawValue / step) * step;
    onChangeValue(Math.min(Math.max(steppedValue, min), max));
  };

  const handleResponderEvent = (event: GestureResponderEvent) => {
    updateFromLocationX(event.nativeEvent.locationX);
  };

  const fillPercentage = ((value - min) / (max - min)) * 100;

  return (
    <View style={styles.container} testID={testID}>
      <View
        style={styles.track}
        onLayout={handleLayout}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleResponderEvent}
        onResponderMove={handleResponderEvent}
      >
        <View style={[styles.fill, { width: `${fillPercentage}%` }]} />
      </View>
      <Text style={styles.value}>{valueLabel ? valueLabel(value) : `${Math.round(value)}`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  track: {
    height: 36,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.backgroundSelected,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.primary,
  },
  value: {
    textAlign: 'right',
    fontFamily: Fonts.ui,
    fontSize: FontSize.meta,
    color: Colors.light.textSecondary,
  },
});
