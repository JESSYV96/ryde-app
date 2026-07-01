// Maps a vehicle's free-text color onto a swatch. `color` is user-entered, so an
// unknown value (e.g. "écru") falls back to a neutral swatch and relies on the
// word shown next to it. White carries a border flag so it stays visible on the
// light card background.
export interface ColorSwatch {
  hex: string;
  needsBorder: boolean;
}

const NEUTRAL_SWATCH: ColorSwatch = { hex: '#C2B49C', needsBorder: false };

// Keys are lowercased; both French and English spellings map to the same swatch.
const SWATCHES: Record<string, ColorSwatch> = {
  argent: { hex: '#C0C4C8', needsBorder: false },
  silver: { hex: '#C0C4C8', needsBorder: false },
  gris: { hex: '#8A8D91', needsBorder: false },
  gray: { hex: '#8A8D91', needsBorder: false },
  grey: { hex: '#8A8D91', needsBorder: false },
  noir: { hex: '#1C1C1E', needsBorder: false },
  black: { hex: '#1C1C1E', needsBorder: false },
  blanc: { hex: '#F2F2F2', needsBorder: true },
  white: { hex: '#F2F2F2', needsBorder: true },
  bleu: { hex: '#2E5AAC', needsBorder: false },
  blue: { hex: '#2E5AAC', needsBorder: false },
  rouge: { hex: '#C0392B', needsBorder: false },
  red: { hex: '#C0392B', needsBorder: false },
  vert: { hex: '#27AE60', needsBorder: false },
  green: { hex: '#27AE60', needsBorder: false },
  jaune: { hex: '#E9C46A', needsBorder: false },
  yellow: { hex: '#E9C46A', needsBorder: false },
  orange: { hex: '#E67E22', needsBorder: false },
};

export const colorSwatch = (color: string): ColorSwatch =>
  SWATCHES[color.trim().toLowerCase()] ?? NEUTRAL_SWATCH;
