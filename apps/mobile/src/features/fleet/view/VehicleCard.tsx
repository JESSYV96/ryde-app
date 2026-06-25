import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Vehicle } from '@/features/fleet/model/vehicle.types';
import { StatusBadge } from '@/shared/ui/design-system/atoms/StatusBadge';
import { Colors, Elevation, FontSize, Fonts, Radius, Spacing } from '@/shared/ui/theme';
import { formatPrice } from '@/shared/utils/pricing';

interface VehicleCardProps {
  vehicle: Vehicle;
  isRented: boolean;
  currency: string;
  onPress: () => void;
}

export const VehicleCard = ({ vehicle, isRented, currency, onPress }: VehicleCardProps) => {
  const { t } = useTranslation('fleet');
  const initials = `${vehicle.make.charAt(0)}${vehicle.model.charAt(0)}`.toUpperCase();

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarLabel}>{initials}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{`${vehicle.make} ${vehicle.model}`}</Text>
        <Text style={styles.subtitle}>{`${vehicle.year} • ${vehicle.licensePlate} • ${vehicle.color}`}</Text>
        <Text style={styles.subtitle}>{t('card.dailyRate', { price: formatPrice(vehicle.dailyRate, currency) })}</Text>
      </View>
      <StatusBadge
        label={isRented ? t('status.rented') : t('status.available')}
        tone={isRented ? 'neutral' : 'positive'}
      />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    padding: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.background,
    ...Elevation.card,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Radius.pill,
    backgroundColor: Colors.light.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLabel: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: FontSize.body,
    color: Colors.light.primary,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontFamily: Fonts.uiBold,
    fontSize: FontSize.title,
    color: Colors.light.text,
  },
  subtitle: {
    fontFamily: Fonts.ui,
    fontSize: FontSize.meta,
    color: Colors.light.textSecondary,
  },
});
