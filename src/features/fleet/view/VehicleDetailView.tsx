import { Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';

import { useVehicleDetailViewModel } from '@/features/fleet/viewmodel/useVehicleDetailViewModel';
import { LoadingIndicator } from '@/shared/ui/components/LoadingIndicator';
import { Screen } from '@/shared/ui/components/Screen';
import { SectionTitle } from '@/shared/ui/design-system/atoms/SectionTitle';
import { Colors, Elevation, FontSize, Fonts, Radius, Spacing } from '@/shared/ui/theme';

interface VehicleDetailViewProps {
  vehicleId: string;
}

export const VehicleDetailView = ({ vehicleId }: VehicleDetailViewProps) => {
  const { vehicle, isLoading } = useVehicleDetailViewModel(vehicleId);
  const { t } = useTranslation('fleet');

  const header = (
    <Stack.Screen
      options={{
        headerShown: true,
        title: vehicle ? `${vehicle.make} ${vehicle.model}` : t('detail.title'),
      }}
    />
  );

  if (isLoading || !vehicle) {
    return (
      <>
        {header}
        <Screen>
          <LoadingIndicator />
        </Screen>
      </>
    );
  }

  return (
    <>
      {header}
      <Screen>
        <View style={styles.section}>
          <SectionTitle>{`${vehicle.make} ${vehicle.model}`}</SectionTitle>
          <Text style={styles.row}>{`${t('detail.yearLabel')}: ${vehicle.year}`}</Text>
          <Text style={styles.row}>{`${t('detail.licensePlateLabel')}: ${vehicle.licensePlate}`}</Text>
          <Text style={styles.row}>{`${t('detail.colorLabel')}: ${vehicle.color}`}</Text>
        </View>
      </Screen>
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Radius.md,
    backgroundColor: Colors.light.background,
    ...Elevation.card,
  },
  row: {
    fontFamily: Fonts.ui,
    fontSize: FontSize.body,
    color: Colors.light.text,
  },
});
