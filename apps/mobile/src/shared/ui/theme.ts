/**
 * Design tokens for the "Dash" theme (fleet management for independent rental
 * businesses). Accent is burnt orange; typography is Space Grotesk (display)
 * + Nunito Sans (UI), loaded via `useFonts` in the root layout.
 */

const warmNeutral = {
  50: '#FAF7F2',
  100: '#F5F0E8',
  200: '#EAE2D5',
  300: '#DDD2BC',
  400: '#C2B49C',
  500: '#A69679',
  600: '#8A7860',
  700: '#6B5D49',
  800: '#4A4036',
  900: '#2E2820',
  950: '#15120C',
} as const;

export const Colors = {
  light: {
    text: warmNeutral[950],
    background: warmNeutral[50],
    backgroundElement: warmNeutral[100],
    backgroundSelected: warmNeutral[200],
    textSecondary: warmNeutral[600],
    primary: '#D4622B',
    primarySoft: '#FBEADF',
    available: '#2E9E6B',
    availableSoft: '#E3F4EC',
    overdue: '#E5484D',
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    primary: '#D4622B',
    primarySoft: '#3A2014',
    available: '#4CC38A',
    availableSoft: '#1C3326',
    overdue: '#FF6369',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
} as const;

export const FontSize = {
  display: 44,
  heading: 24,
  subhead: 17,
  title: 16,
  body: 14,
  meta: 13,
} as const;

export const FontWeight = {
  display: '700',
  heading: '700',
  subhead: '600',
  title: '800',
  body: '400',
  meta: '700',
} as const;

/**
 * One key per weight that's actually loaded via `useFonts` — React Native
 * does not synthesize weights for custom fonts, so never pair these
 * `fontFamily` values with a redundant `fontWeight` (it silently falls back
 * to the system font on Android instead of erroring).
 */
export const Fonts = {
  display: 'SpaceGrotesk_700Bold',
  displaySemiBold: 'SpaceGrotesk_600SemiBold',
  ui: 'NunitoSans_400Regular',
  uiBold: 'NunitoSans_700Bold',
  uiExtraBold: 'NunitoSans_800ExtraBold',
  logo: 'Orbitron_700Bold',
} as const;

export const Elevation = {
  flat: {},
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  float: {
    shadowColor: '#D4622B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
} as const;

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const MaxContentWidth = 800;
