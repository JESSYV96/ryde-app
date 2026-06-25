import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';

import { getRentalStatus, RentalStatus } from '@/features/rental/model/rental.types';
import type { RentalRepositoryInterface } from '@/features/rental/repository/RentalRepository.interface';
import { rentalQueryKeys } from '@/features/rental/repository/RentalRepository.interface';
import { rentalRepository } from '@/features/rental/repository/SqliteRentalRepository';

export const DashboardTab = {
  PendingAcceptance: 'pendingAcceptance',
  InProgress: 'inProgress',
  Past: 'past',
} as const;

export type DashboardTab = (typeof DashboardTab)[keyof typeof DashboardTab];

interface UseDashboardViewModelDeps {
  repository?: RentalRepositoryInterface;
}

export const useDashboardViewModel = ({ repository = rentalRepository }: UseDashboardViewModelDeps = {}) => {
  const [selectedTab, setSelectedTab] = useState<DashboardTab>(DashboardTab.InProgress);

  const {
    data: rentals,
    isLoading,
  } = useQuery({
    queryKey: rentalQueryKeys.all(),
    queryFn: () => repository.getAll(),
  });

  const pendingAcceptanceRentals = (rentals ?? []).filter(
    (rental) => getRentalStatus(rental) === RentalStatus.PendingAcceptance
  );
  const inProgressRentals = (rentals ?? []).filter(
    (rental) => getRentalStatus(rental) === RentalStatus.InProgress
  );
  const pastRentals = (rentals ?? []).filter((rental) => getRentalStatus(rental) === RentalStatus.Returned);
  const visibleRentalsByTab = {
    [DashboardTab.PendingAcceptance]: pendingAcceptanceRentals,
    [DashboardTab.InProgress]: inProgressRentals,
    [DashboardTab.Past]: pastRentals,
  } as const;
  const visibleRentals = visibleRentalsByTab[selectedTab];

  const onCreateNew = () => {
    router.push('/rentals/new/customer');
  };

  const onSelectRental = (id: string) => {
    router.push({ pathname: '/rentals/[id]', params: { id } });
  };

  return { selectedTab, onSelectTab: setSelectedTab, visibleRentals, isLoading, onCreateNew, onSelectRental };
};

export interface UseDashboardViewModelResult extends ReturnType<typeof useDashboardViewModel> {}
