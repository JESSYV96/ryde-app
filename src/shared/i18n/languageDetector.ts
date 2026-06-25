import { getLocales } from 'expo-localization';

import { DEFAULT_LANGUAGE, SUPPORTED_LANGUAGES, type SupportedLanguage } from '@/shared/i18n/supportedLanguages';

export const detectDeviceLanguage = (): SupportedLanguage => {
  const [preferred] = getLocales();
  const code = preferred?.languageCode ?? '';
  return (SUPPORTED_LANGUAGES as readonly string[]).includes(code)
    ? (code as SupportedLanguage)
    : DEFAULT_LANGUAGE;
};
