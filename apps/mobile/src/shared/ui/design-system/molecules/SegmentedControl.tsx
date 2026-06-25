import { useEffect, useState } from 'react';
import { type LayoutChangeEvent, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { Colors, Elevation, FontSize, Fonts, Radius, Spacing } from '@/shared/ui/theme';

interface SegmentedControlOption<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export const SegmentedControl = <T extends string>({ options, value, onChange }: SegmentedControlProps<T>) => {
  const activeIndex = options.findIndex((option) => option.value === value);
  const [segmentLayouts, setSegmentLayouts] = useState<{ x: number; width: number }[]>([]);
  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);

  const activeLayout = segmentLayouts[activeIndex];

  useEffect(() => {
    if (!activeLayout) {
      return;
    }
    indicatorX.value = withTiming(activeLayout.x, { duration: 200 });
    indicatorWidth.value = withTiming(activeLayout.width, { duration: 200 });
  }, [activeLayout, indicatorX, indicatorWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
    width: indicatorWidth.value,
  }));

  const onSegmentLayout = (index: number) => (event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setSegmentLayouts((previous) => {
      const next = [...previous];
      next[index] = { x, width };
      return next;
    });
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      {options.map((option, index) => {
        const isActive = option.value === value;
        return (
          <Pressable
            key={option.value}
            style={styles.segment}
            onLayout={onSegmentLayout(index)}
            onPress={() => onChange(option.value)}
          >
            <Text style={[styles.label, isActive && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.light.backgroundSelected,
    borderRadius: Radius.pill,
    padding: Spacing.half,
    gap: Spacing.half,
  },
  indicator: {
    position: 'absolute',
    top: Spacing.half,
    bottom: Spacing.half,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.background,
    ...Elevation.card,
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two,
    borderRadius: Radius.pill,
  },
  label: {
    fontFamily: Fonts.uiBold,
    fontSize: FontSize.body,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  labelActive: {
    color: Colors.light.text,
  },
});
