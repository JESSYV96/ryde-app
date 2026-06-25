import { useTranslation } from 'react-i18next';

import { getDurationParts } from '@/shared/utils/date';

export const useRentalDurationLabel = (startIso: string | null, endIso: string | null): string | null => {
  const { t } = useTranslation('rental');

  if (!startIso || !endIso) {
    return null;
  }

  const parts = getDurationParts(startIso, endIso);
  if (!parts) {
    return null;
  }

  const segments = [
    parts.days > 0 ? t('duration.days', { count: parts.days }) : null,
    parts.hours > 0 || parts.days === 0 ? t('duration.hours', { count: parts.hours }) : null,
  ].filter((segment): segment is string => segment !== null);

  return segments.join(', ');
};
