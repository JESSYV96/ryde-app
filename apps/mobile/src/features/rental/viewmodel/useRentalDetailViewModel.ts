import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { shareAsync } from 'expo-sharing';

import { getRentalStatus } from '@/features/rental/model/rental.types';
import type { RentalRepositoryInterface } from '@/features/rental/repository/RentalRepository.interface';
import { rentalQueryKeys } from '@/features/rental/repository/RentalRepository.interface';
import { rentalRepository } from '@/features/rental/repository/SqliteRentalRepository';

interface UseRentalDetailViewModelDeps {
  repository?: RentalRepositoryInterface;
}

export const useRentalDetailViewModel = (
  rentalId: string,
  { repository = rentalRepository }: UseRentalDetailViewModelDeps = {}
) => {
  const { data: rental, isLoading } = useQuery({
    queryKey: rentalQueryKeys.detail(rentalId),
    queryFn: () => repository.getById(rentalId),
  });

  const status = rental ? getRentalStatus(rental) : null;

  const onShareQuotePdf = () => {
    if (rental?.quotePdfUri) {
      shareAsync(rental.quotePdfUri);
    }
  };

  const onShareReturnReportPdf = () => {
    if (rental?.returnReportPdfUri) {
      shareAsync(rental.returnReportPdfUri);
    }
  };

  const onStartCheckout = () => {
    router.push({ pathname: '/rentals/[id]/return', params: { id: rentalId } });
  };

  const onProceedToAcceptance = () => {
    router.push({ pathname: '/rentals/[id]/accept-quote', params: { id: rentalId } });
  };

  return {
    rental,
    status,
    isLoading,
    onShareQuotePdf,
    onShareReturnReportPdf,
    onStartCheckout,
    onProceedToAcceptance,
  };
};

export interface UseRentalDetailViewModelResult extends ReturnType<typeof useRentalDetailViewModel> {}
