import dayjs from 'dayjs';
import 'dayjs/locale/fr';
import 'dayjs/locale/en';
import durationPlugin from 'dayjs/plugin/duration';
import localizedFormat from 'dayjs/plugin/localizedFormat';

dayjs.extend(localizedFormat);
dayjs.extend(durationPlugin);

export interface DurationParts {
  days: number;
  hours: number;
}

export const formatDate = (iso: string): string => dayjs(iso).format('YYYY-MM-DD');

export const formatDateTime = (iso: string): string => dayjs(iso).format('YYYY-MM-DD HH:mm');

export const formatDisplayDate = (iso: string): string => dayjs(iso).format('LL');

export const formatDisplayDateTime = (iso: string): string => dayjs(iso).format('LLL');

export const nowIso = (): string => dayjs().toISOString();

export const getDurationParts = (startIso: string, endIso: string): DurationParts | null => {
  const totalMinutes = dayjs(endIso).diff(dayjs(startIso), 'minute');
  if (totalMinutes <= 0) {
    return null;
  }
  return { days: Math.floor(totalMinutes / 1440), hours: Math.floor((totalMinutes % 1440) / 60) };
};

export const isEndAfterStart = (startIso: string, endIso: string): boolean => dayjs(endIso).isAfter(dayjs(startIso));
