import { Tabs } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { DashboardTab, useDashboardViewModel } from '@/features/home/viewmodel/useDashboardViewModel';
import { RentalCard } from '@/features/rental/view/RentalCard';
import { EmptyState } from '@/shared/ui/components/EmptyState';
import { LoadingIndicator } from '@/shared/ui/components/LoadingIndicator';
import { Screen } from '@/shared/ui/components/Screen';
import { FloatingActionButton } from '@/shared/ui/design-system/atoms/FloatingActionButton';
import { Logo } from '@/shared/ui/design-system/atoms/Logo';
import { SegmentedControl } from '@/shared/ui/design-system/molecules/SegmentedControl';
import { Spacing } from '@/shared/ui/theme';

const emptyMessageKey = {
  [DashboardTab.PendingAcceptance]: 'emptyPendingAcceptance',
  [DashboardTab.InProgress]: 'emptyInProgress',
  [DashboardTab.Past]: 'emptyPast',
} as const;

export const HomeView = () => {
  const { t } = useTranslation('home');
  const { selectedTab, onSelectTab, visibleRentals, isLoading, onCreateNew, onSelectRental } =
    useDashboardViewModel();

  return (
    <Screen floating={<FloatingActionButton onPress={onCreateNew} />}>
      <Tabs.Screen options={{ headerShown: true, headerTitle: () => <Logo label={t('tabName')} size={24} /> }} />
      <SegmentedControl
        value={selectedTab}
        onChange={onSelectTab}
        options={[
          { value: DashboardTab.PendingAcceptance, label: t('pendingAcceptanceSectionTitle') },
          { value: DashboardTab.InProgress, label: t('inProgressSectionTitle') },
          { value: DashboardTab.Past, label: t('pastSectionTitle') },
        ]}
      />

      {isLoading ? (
        <LoadingIndicator />
      ) : visibleRentals.length > 0 ? (
        <View style={styles.cardList}>
          {visibleRentals.map((rental) => (
            <RentalCard key={rental.id} rental={rental} onPress={() => onSelectRental(rental.id)} />
          ))}
        </View>
      ) : (
        <EmptyState message={t(emptyMessageKey[selectedTab])} />
      )}
    </Screen>
  );
};

const styles = StyleSheet.create({
  cardList: {
    gap: Spacing.two,
  },
});
