import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getRentalStatus, RentalStatus, type Rental } from '@/features/rental/model/rental.types';
import { StatusBadge } from '@/shared/ui/design-system/atoms/StatusBadge';
import { Colors, Elevation, FontSize, Fonts, Radius, Spacing } from '@/shared/ui/theme';
import { formatDisplayDateTime } from '@/shared/utils/date';

interface RentalCardProps {
  rental: Rental;
  onPress: () => void;
}

const statusLabelKey = {
  [RentalStatus.PendingAcceptance]: 'status.pendingAcceptance',
  [RentalStatus.InProgress]: 'status.inProgress',
  [RentalStatus.Returned]: 'status.returned',
} as const;

const statusTone = {
  [RentalStatus.PendingAcceptance]: 'pending',
  [RentalStatus.InProgress]: 'positive',
  [RentalStatus.Returned]: 'neutral',
} as const;

export const RentalCard = ({ rental, onPress }: RentalCardProps) => {
  const { t } = useTranslation('rental');
  const status = getRentalStatus(rental);
  const initials = `${rental.customer.firstName.charAt(0)}${rental.customer.lastName.charAt(0)}`.toUpperCase();

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarLabel}>{initials}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.name}>{`${rental.customer.firstName} ${rental.customer.lastName}`}</Text>
        <Text style={styles.subtitle}>
          {`${rental.vehicleSnapshot.make} ${rental.vehicleSnapshot.model} — `}
          {t('card.dateRange', {
            startDate: formatDisplayDateTime(rental.startDate),
            endDate: formatDisplayDateTime(rental.endDate),
          })}
        </Text>
      </View>
      <StatusBadge label={t(statusLabelKey[status])} tone={statusTone[status]} />
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
