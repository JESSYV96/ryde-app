import { StyleSheet, Text, View } from 'react-native';

import { Colors, FontSize, Fonts, Radius } from '@/shared/ui/theme';

interface StatusBadgeProps {
  label: string;
  tone: 'neutral' | 'positive' | 'pending';
}

export const StatusBadge = ({ label, tone }: StatusBadgeProps) => {
  return (
    <View style={[styles.badge, toneStyles[tone]]}>
      {tone !== 'neutral' ? <View style={[styles.dot, dotToneStyles[tone]]} /> : null}
      <Text style={[styles.label, labelToneStyles[tone]]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.pill,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontFamily: Fonts.uiBold,
    fontSize: FontSize.meta,
  },
});

const toneStyles = StyleSheet.create({
  neutral: {
    backgroundColor: Colors.light.text,
  },
  positive: {
    backgroundColor: Colors.light.availableSoft,
  },
  pending: {
    backgroundColor: Colors.light.primarySoft,
  },
});

const dotToneStyles = StyleSheet.create({
  positive: {
    backgroundColor: Colors.light.available,
  },
  pending: {
    backgroundColor: Colors.light.primary,
  },
});

const labelToneStyles = StyleSheet.create({
  neutral: {
    color: '#ffffff',
  },
  positive: {
    color: Colors.light.available,
  },
  pending: {
    color: Colors.light.primary,
  },
});
