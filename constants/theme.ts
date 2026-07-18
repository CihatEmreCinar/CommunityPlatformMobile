export const Colors = {
  // Primary scale (teal) - en koyudan en açığa
  primary: '#0D9488',
  primaryDark: '#005049',
  primaryDarker: '#003732',
  primaryDarkest: '#00201D',
  primaryMid: '#29A195',
  primaryLight: '#4CBCAF',
  primaryLighter: '#6BD8CB',
  primaryLightest: '#89F5E7',
  primaryPale: '#B3FFF3',

  primaryContainer: '#B3FFF3',
  onPrimary: '#FFFFFF',
  onPrimaryContainer: '#00201D',

  // Accent artık primary skalasının bir tonu (monochromatic tasarım)
  accent: '#0D9488',
  accentContainer: '#89F5E7',
  onAccent: '#FFFFFF',

  // Surface hierarchy
  surface: '#F7FBFA',
  surfaceContainer: '#ECF5F3',
  surfaceContainerLow: '#F2F8F7',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerHigh: '#E0EEEB',
  surfaceContainerHighest: '#D4E8E4',
  surfaceBright: '#F7FBFA',
  surfaceDim: '#D8E4E1',
  surfaceVariant: '#DCEAE7',
  background: '#F7FBFA',

  // On Surface
  onSurface: '#00201D',
  onSurfaceVariant: '#3F4946',
  onBackground: '#00201D',

  // Secondary (soft teal-gray)
  secondary: '#4A6360',
  secondaryContainer: '#CCE8E3',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#072019',

  // Outline
  outline: '#6F7976',
  outlineVariant: '#BEC9C6',

  // Error (kept neutral red, doesn't clash with teal)
  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  onError: '#FFFFFF',
  onErrorContainer: '#93000A',

  // Inverse
  inverseSurface: '#003732',
  inverseOnSurface: '#B3FFF3',

  // Amber for ratings (contrast renk)
  amber: '#F59E0B',

  // Pure black/white for absolute contrast
  black: '#000000',
  white: '#FFFFFF',
};

export const Typography = {
  display: { fontSize: 32, lineHeight: 40, fontWeight: '700' as const, letterSpacing: -0.64 },
  headlineLgMobile: { fontSize: 28, lineHeight: 36, fontWeight: '700' as const, letterSpacing: -0.28 },
  h1: { fontSize: 24, lineHeight: 32, fontWeight: '700' as const, letterSpacing: -0.24 },
  h1Mobile: { fontSize: 22, lineHeight: 28, fontWeight: '700' as const },
  titleLg: { fontSize: 22, lineHeight: 28, fontWeight: '600' as const },
  h2: { fontSize: 20, lineHeight: 28, fontWeight: '600' as const },
  h3: { fontSize: 18, lineHeight: 24, fontWeight: '600' as const },
  bodyLg: { fontSize: 16, lineHeight: 24, fontWeight: '400' as const },
  bodyMd: { fontSize: 14, lineHeight: 20, fontWeight: '400' as const },
  labelMd: { fontSize: 12, lineHeight: 16, fontWeight: '600' as const, letterSpacing: 0.24 },
  labelSm: { fontSize: 11, lineHeight: 14, fontWeight: '500' as const },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  gutter: 12,
  md: 16,
  lg: 24,
  xl: 32,
  containerMargin: 20,
};

export const Radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const Shadows = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
};