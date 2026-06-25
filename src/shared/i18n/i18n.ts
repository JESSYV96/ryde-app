import dayjs from 'dayjs';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { detectDeviceLanguage } from '@/shared/i18n/languageDetector';
import { resources } from '@/shared/i18n/resources';
import { DEFAULT_LANGUAGE } from '@/shared/i18n/supportedLanguages';

i18n.use(initReactI18next).init({
  resources,
  lng: detectDeviceLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  defaultNS: 'rental',
  interpolation: { escapeValue: false },
  returnNull: false,
});

dayjs.locale(i18n.language);
i18n.on('languageChanged', (language) => dayjs.locale(language));

export default i18n;
