import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { shareAsync } from 'expo-sharing';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { getRentalStatus, PaymentStatus, type Payment } from '@/features/rental/model/rental.types';
import type { RentalRepositoryInterface } from '@/features/rental/repository/RentalRepository.interface';
import { rentalQueryKeys } from '@/features/rental/repository/RentalRepository.interface';
import { rentalRepository } from '@/features/rental/repository/SqliteRentalRepository';
import { buildPaidPushContent } from '@/features/rental/services/payment/paidPushContent';
import { createAndSendPaymentLink, getPaymentLinkStatus } from '@/features/rental/services/payment/paymentLinkService';
import { companySettingsQueryKeys } from '@/features/settings/repository/CompanySettingsRepository.interface';
import { companySettingsRepository } from '@/features/settings/repository/SqliteCompanySettingsRepository';

interface UseRentalDetailViewModelDeps {
  repository?: RentalRepositoryInterface;
}

export const useRentalDetailViewModel = (
  rentalId: string,
  { repository = rentalRepository }: UseRentalDetailViewModelDeps = {}
) => {
  const queryClient = useQueryClient();
  const { t } = useTranslation('rental');

  const { data: rental, isLoading } = useQuery({
    queryKey: rentalQueryKeys.detail(rentalId),
    queryFn: () => repository.getById(rentalId),
  });

  const { data: companySettings } = useQuery({
    queryKey: companySettingsQueryKeys.detail(),
    queryFn: () => companySettingsRepository.getSettings(),
  });
  const currency = companySettings?.currency ?? 'CAD';

  const status = rental ? getRentalStatus(rental) : null;

  const payments = rental?.payments;
  const pendingPayments = useMemo(
    () => payments?.filter((payment) => payment.status === PaymentStatus.Pending) ?? [],
    [payments]
  );

  const paymentStatusQueries = useQueries({
    queries: pendingPayments.map((payment) => ({
      queryKey: ['payment-link-status', payment.stripeSessionId],
      queryFn: () => getPaymentLinkStatus(payment.stripeSessionId),
      refetchInterval: 5000,
    })),
  });

  const markPaymentPaidMutation = useMutation({
    mutationFn: ({ paymentId, paidAt }: { paymentId: string; paidAt: string }) =>
      repository.markPaymentPaid(paymentId, paidAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rentalQueryKeys.detail(rentalId) });
    },
  });

  useEffect(() => {
    paymentStatusQueries.forEach((query, index) => {
      const payment = pendingPayments[index];
      if (payment && query.data?.status === 'complete') {
        markPaymentPaidMutation.mutate({ paymentId: payment.id, paidAt: query.data.paidAt ?? new Date().toISOString() });
      }
    });
  }, [paymentStatusQueries, pendingPayments, markPaymentPaidMutation]);

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

  const resendPaymentLinkMutation = useMutation({
    mutationFn: async (payment: Payment) => {
      if (!rental) {
        return;
      }
      const { currency } = await companySettingsRepository.getSettings();
      const { stripeSessionId, paymentUrl, emailSent } = await createAndSendPaymentLink({
        rentalId,
        kind: payment.kind,
        amount: payment.amount,
        currency,
        customerEmail: rental.customer.email,
        customerName: `${rental.customer.firstName} ${rental.customer.lastName}`,
        vehicleLabel: `${rental.vehicleSnapshot.make} ${rental.vehicleSnapshot.model}`,
        ...buildPaidPushContent(t, {
          customerName: `${rental.customer.firstName} ${rental.customer.lastName}`,
          amount: payment.amount,
          currency,
        }),
      });
      await repository.addPayment(rentalId, {
        kind: payment.kind,
        amount: payment.amount,
        currency,
        status: PaymentStatus.Pending,
        stripeSessionId,
        paymentUrl,
        emailSent,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rentalQueryKeys.detail(rentalId) });
    },
  });

  const onResendPaymentLink = (payment: Payment) => {
    resendPaymentLinkMutation.mutate(payment);
  };

  return {
    rental,
    status,
    currency,
    isLoading,
    onShareQuotePdf,
    onShareReturnReportPdf,
    onStartCheckout,
    onProceedToAcceptance,
    onResendPaymentLink,
    isResendingPaymentLink: resendPaymentLinkMutation.isPending,
  };
};

export interface UseRentalDetailViewModelResult extends ReturnType<typeof useRentalDetailViewModel> { }
