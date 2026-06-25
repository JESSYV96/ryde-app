import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { VehicleCard } from '@/features/fleet/view/VehicleCard';
import { useVehicleListViewModel } from '@/features/fleet/viewmodel/useVehicleListViewModel';
import { EmptyState } from '@/shared/ui/components/EmptyState';
import { LoadingIndicator } from '@/shared/ui/components/LoadingIndicator';
import { Screen } from '@/shared/ui/components/Screen';
import { Logo } from '@/shared/ui/design-system/atoms/Logo';
import { Spacing } from '@/shared/ui/theme';

export const VehicleListView = () => {
  const { t } = useTranslation('fleet');
  const { vehicles, isLoading, onSelectVehicle } = useVehicleListViewModel();

  return (
    <Screen>
      <Tabs.Screen options={{ headerShown: true, headerTitle: () => <Logo label={t('tabName')} size={24} /> }} />
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <View style={styles.section}>
          {vehicles.length > 0 ? (
            <View style={styles.cardList}>
              {vehicles.map(({ vehicle, isRented }) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  isRented={isRented}
                  onPress={() => onSelectVehicle(vehicle.id)}
                />
              ))}
            </View>
          ) : (
            <EmptyState message={t('list.empty')} />
          )}
        </View>
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
  },
  cardList: {
    gap: Spacing.two,
  },
});
