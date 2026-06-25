import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Rect } from 'react-native-svg';

import { Colors, Fonts, Spacing } from '@/shared/ui/theme';

interface LogoProps {
  label?: string;
  size?: number;
  dark?: boolean;
}

const ICON_VIEWBOX = 56;
const WORDMARK_SCALE = 0.82;
const WORDMARK_LETTER_SPACING = 4;

export const Logo = ({ label = 'RYDE', size = 40, dark = false }: LogoProps) => {
  const textColor = dark ? Colors.dark.text : Colors.light.text;
  const fontSize = Math.round(size * WORDMARK_SCALE);

  return (
    <View style={styles.row}>
      <Svg viewBox={`0 0 ${ICON_VIEWBOX} ${ICON_VIEWBOX}`} width={size} height={size}>
        <Circle cx={28} cy={28} r={22} stroke={Colors.light.primary} strokeWidth={5.5} fill="none" />
        <Rect x={5} y={25} width={15} height={6} rx={2} fill={Colors.light.primary} />
        <Rect x={36} y={25} width={15} height={6} rx={2} fill={Colors.light.primary} />
        <Rect x={25} y={36} width={6} height={14} rx={2} fill={Colors.light.primary} />
        <Circle cx={28} cy={28} r={8} fill={Colors.light.primary} />
      </Svg>
      <Text style={[styles.wordmark, { color: textColor, fontSize, letterSpacing: WORDMARK_LETTER_SPACING }]}>
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  wordmark: {
    fontFamily: Fonts.logo,
  },
});
