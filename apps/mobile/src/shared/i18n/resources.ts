import fleetEn from '@/features/fleet/i18n/en.json';
import fleetFr from '@/features/fleet/i18n/fr.json';
import homeEn from '@/features/home/i18n/en.json';
import homeFr from '@/features/home/i18n/fr.json';
import rentalEn from '@/features/rental/i18n/en.json';
import rentalFr from '@/features/rental/i18n/fr.json';
import settingsEn from '@/features/settings/i18n/en.json';
import settingsFr from '@/features/settings/i18n/fr.json';

export const resources = {
  fr: { rental: rentalFr, home: homeFr, fleet: fleetFr, settings: settingsFr },
  en: { rental: rentalEn, home: homeEn, fleet: fleetEn, settings: settingsEn },
} as const;
