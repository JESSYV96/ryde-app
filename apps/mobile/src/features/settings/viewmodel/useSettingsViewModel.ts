import { useForm } from '@tanstack/react-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import type { SupportedCurrency } from '@/features/settings/model/companySettings.types';
import { SUPPORTED_CURRENCIES } from '@/features/settings/model/companySettings.types';
import type { CompanySettingsRepositoryInterface } from '@/features/settings/repository/CompanySettingsRepository.interface';
import { companySettingsQueryKeys } from '@/features/settings/repository/CompanySettingsRepository.interface';
import { companySettingsRepository } from '@/features/settings/repository/SqliteCompanySettingsRepository';

interface UseSettingsViewModelDeps {
  repository?: CompanySettingsRepositoryInterface;
}

export const useSettingsViewModel = ({ repository = companySettingsRepository }: UseSettingsViewModelDeps = {}) => {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: companySettingsQueryKeys.detail(),
    queryFn: () => repository.getSettings(),
  });

  const updateCurrencyMutation = useMutation({
    mutationFn: (currency: string) => repository.updateCurrency(currency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companySettingsQueryKeys.detail() });
    },
  });

  const form = useForm({
    defaultValues: { currency: settings?.currency ?? 'CAD' } as { currency: SupportedCurrency },
    onSubmit: async ({ value }) => {
      await updateCurrencyMutation.mutateAsync(value.currency);
    },
  });

  return { isLoading, form, currencies: SUPPORTED_CURRENCIES, isSaving: updateCurrencyMutation.isPending };
};

export interface UseSettingsViewModelResult extends ReturnType<typeof useSettingsViewModel> {}
