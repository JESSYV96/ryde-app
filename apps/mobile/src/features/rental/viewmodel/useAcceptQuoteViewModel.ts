import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import type { RefObject } from 'react';
import { useState } from 'react';

import { createAndSendPaymentLink } from '@/features/payment/services/paymentLinkService';
import { PaymentKind, PaymentStatus } from '@/features/rental/model/rental.types';
import type { RentalRepositoryInterface } from '@/features/rental/repository/RentalRepository.interface';
import { rentalQueryKeys } from '@/features/rental/repository/RentalRepository.interface';
import { rentalRepository } from '@/features/rental/repository/SqliteRentalRepository';
import { saveSignature } from '@/features/rental/services/photoStorageService';
import { companySettingsRepository } from '@/features/settings/repository/SqliteCompanySettingsRepository';
import type { SignaturePadRef } from '@/shared/ui/design-system/atoms/SignaturePad';

interface UseAcceptQuoteViewModelDeps {
  repository?: RentalRepositoryInterface;
}

export const useAcceptQuoteViewModel = (
  rentalId: string,
  { repository = rentalRepository }: UseAcceptQuoteViewModelDeps = {}
) => {
  const queryClient = useQueryClient();
  const [hasSignature, setHasSignature] = useState(false);

  const { data: rental, isLoading } = useQuery({
    queryKey: rentalQueryKeys.detail(rentalId),
    queryFn: () => repository.getById(rentalId),
  });

  const acceptMutation = useMutation({
    mutationFn: async (signaturePadRef: RefObject<SignaturePadRef | null>) => {
      const base64Png = await signaturePadRef.current?.exportAsPng();
      if (!base64Png) {
        throw new Error('Missing signature export');
      }
      const signatureUri = saveSignature({ base64Png, rentalId });
      const accepted = await repository.acceptQuote(rentalId, { signatureUri });

      try {
        const { currency } = await companySettingsRepository.getSettings();
        const { stripeSessionId, paymentUrl } = await createAndSendPaymentLink({
          rentalId,
          kind: PaymentKind.Quote,
          amount: accepted.totalPrice,
          currency,
          customerEmail: accepted.customer.email,
          customerName: `${accepted.customer.firstName} ${accepted.customer.lastName}`,
          vehicleLabel: `${accepted.vehicleSnapshot.make} ${accepted.vehicleSnapshot.model}`,
        });
        await repository.addPayment(rentalId, {
          kind: PaymentKind.Quote,
          amount: accepted.totalPrice,
          currency,
          status: PaymentStatus.Pending,
          stripeSessionId,
          paymentUrl,
        });
      } catch (error) {
        console.warn('Failed to send the quote payment link', error);
      }

      return accepted;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rentalQueryKeys.detail(rentalId) });
      queryClient.invalidateQueries({ queryKey: rentalQueryKeys.all() });
      router.replace({ pathname: '/rentals/[id]', params: { id: rentalId } });
    },
  });

  const onAccept = (signaturePadRef: RefObject<SignaturePadRef | null>) => {
    acceptMutation.mutate(signaturePadRef);
  };

  return {
    rental,
    isLoading,
    hasSignature,
    onSignatureChange: setHasSignature,
    onAccept,
    isAccepting: acceptMutation.isPending,
  };
};

export interface UseAcceptQuoteViewModelResult extends ReturnType<typeof useAcceptQuoteViewModel> {}
