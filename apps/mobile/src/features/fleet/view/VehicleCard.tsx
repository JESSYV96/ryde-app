import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Vehicle } from '@/features/fleet/model/vehicle.types';
import { VehicleTypeIcon } from '@/features/fleet/view/VehicleTypeIcon';
import { colorSwatch } from '@/features/fleet/view/vehicleColorSwatch';
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
  const primaryPhoto = vehicle.photos.find((photo) => photo.isPrimary) ?? vehicle.photos[0];
  const swatch = colorSwatch(vehicle.color);

  return (
    <Pressable style={styles.card} onPress={onPress}>
      {primaryPhoto ? (
        <Image source={{ uri: primaryPhoto.uri }} style={styles.thumbnail} contentFit="cover" />
      ) : (
        <View style={[styles.thumbnail, styles.placeholder]}>
          <VehicleTypeIcon type={vehicle.type} size={32} color={Colors.light.primary} />
        </View>
      )}

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <View style={styles.nameGroup}>
            <VehicleTypeIcon type={vehicle.type} />
            <Text style={styles.name} numberOfLines={1}>{`${vehicle.make} ${vehicle.model}`}</Text>
          </View>
          <View style={styles.status}>
            <View style={[styles.statusDot, isRented ? styles.statusDotRented : styles.statusDotAvailable]} />
            <Text style={[styles.statusLabel, isRented ? styles.statusLabelRented : styles.statusLabelAvailable]}>
              {isRented ? t('status.rented') : t('status.available')}
            </Text>
          </View>
        </View>

        <View style={styles.colorRow}>
          <View style={[styles.swatch, { backgroundColor: swatch.hex }, swatch.needsBorder && styles.swatchBordered]} />
          <Text style={styles.meta}>{`${vehicle.color} · ${vehicle.year}`}</Text>
        </View>

        <Text style={styles.price}>{t('card.dailyRate', { price: formatPrice(vehicle.dailyRate, currency) })}</Text>

        <Text style={styles.plate}>{vehicle.licensePlate}</Text>
      </View>
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
  thumbnail: {
    width: 88,
    height: 88,
    borderRadius: Radius.md,
  },
  placeholder: {
    backgroundColor: Colors.light.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: Spacing.half,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  nameGroup: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  name: {
    flexShrink: 1,
    fontFamily: Fonts.uiBold,
    fontSize: FontSize.title,
    color: Colors.light.text,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotAvailable: {
    backgroundColor: Colors.light.available,
  },
  statusDotRented: {
    backgroundColor: Colors.light.textSecondary,
  },
  statusLabel: {
    fontFamily: Fonts.uiBold,
    fontSize: FontSize.meta,
  },
  statusLabelAvailable: {
    color: Colors.light.available,
  },
  statusLabelRented: {
    color: Colors.light.textSecondary,
  },
  colorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  swatchBordered: {
    borderWidth: 1,
    borderColor: Colors.light.backgroundSelected,
  },
  meta: {
    fontFamily: Fonts.ui,
    fontSize: FontSize.meta,
    color: Colors.light.textSecondary,
  },
  price: {
    fontFamily: Fonts.uiExtraBold,
    fontSize: FontSize.subhead,
    color: Colors.light.primary,
  },
  plate: {
    fontFamily: Fonts.ui,
    fontSize: FontSize.meta,
    color: Colors.light.textSecondary,
    opacity: 0.7,
  },
});
