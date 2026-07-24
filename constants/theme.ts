export const Colors = {
  // Primary scale (teal) - en koyudan en açığa — DEĞİŞMEDİ
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

  accent: '#0D9488',
  accentContainer: '#89F5E7',
  onAccent: '#FFFFFF',

  // Surface hierarchy — kırık beyaz temele geçildi (lüks/pastel yön)
  surface: '#FDFCFA',
  surfaceContainer: '#F3F1EC',
  surfaceContainerLow: '#F8F6F2',
  surfaceContainerLowest: '#FFFFFF',
  surfaceContainerHigh: '#ECE9E2',
  surfaceContainerHighest: '#E4E1D9',
  surfaceBright: '#FDFCFA',
  surfaceDim: '#E4E1DA',
  surfaceVariant: '#EDEBE6',
  background: '#FDFCFA',

  onSurface: '#00201D',
  onSurfaceVariant: '#5B6A67',
  onBackground: '#00201D',

  secondary: '#4A6360',
  secondaryContainer: '#CCE8E3',
  onSecondary: '#FFFFFF',
  onSecondaryContainer: '#072019',

  outline: '#8A9895',
  outlineVariant: '#BEC9C6',

  error: '#BA1A1A',
  errorContainer: '#FFDAD6',
  onError: '#FFFFFF',
  onErrorContainer: '#93000A',

  inverseSurface: '#003732',
  inverseOnSurface: '#B3FFF3',

  amber: '#F59E0B',

  // Beğeni (kalp) ikonlarının kırmızısı — nötr error kırmızısından (#BA1A1A) ayrı,
  // canlı "like" tonu. Sadece beğeni/kalp göstergelerinde kullanılır.
  like: '#EF4444',

  black: '#000000',
  white: '#FFFFFF',

  // Renkli/görsel arka planların üstünde kullanılan buzlu cam (frost) beyaz overlay
  // varyantları — hero rozetleri, mascot, bento kartları vb.
  glassOverlay: {
    soft: 'rgba(255,255,255,0.5)',
    medium: 'rgba(255,255,255,0.55)',
    strong: 'rgba(255,255,255,0.6)',
    border: 'rgba(255,255,255,0.7)',
  },
};

// Kart hiyerarşisi + kategori renklendirmesi için pastel sistem.
// Hero = solid doygun ton (primaryLighter zaten bu iş için var).
// Tint = %6-10 opasiteli, border'sız, ikincil/aktivite kartları için.
export const Pastel = {
  teal: {
    hero: Colors.primaryLighter,       // #6BD8CB
    heroText: Colors.primaryDarker,    // #003732
    tint: 'rgba(13,148,136,0.08)',
    tintStrong: 'rgba(13,148,136,0.14)',
    text: '#00524A',
    textSub: '#3F7F79',
  },
  coral: {
    hero: '#FFB4A8',
    heroText: '#5C1F12',
    tint: 'rgba(255,107,91,0.08)',
    tintStrong: 'rgba(255,107,91,0.14)',
    text: '#8A2E1E',
    textSub: '#B5654F',
  },
  purple: {
    hero: '#D6C7FA',
    heroText: '#2E1065',
    tint: 'rgba(139,92,246,0.08)',
    tintStrong: 'rgba(139,92,246,0.14)',
    text: '#4A2E8A',
    textSub: '#7B62B0',
  },
  amber: {
    hero: '#FBDA9E',
    heroText: '#4A2E05',
    tint: 'rgba(245,158,11,0.08)',
    tintStrong: 'rgba(245,158,11,0.14)',
    text: '#7A4A05',
    textSub: '#A9791F',
  },
};

// İki fontlu, tutarlı sistem — "karışık font" sorununu ortadan kaldırır:
// Başlıklar: Lora (serif). Gövde/etiket/buton metni: Plus Jakarta Sans (soft, yuvarlak sans-serif).
// İkisi de app/_layout.tsx içinde useFonts ile yüklenir; sistem fontuna hiçbir yerde düşülmez.
export const Fonts = {
  serifBold: 'Lora_700Bold',
  serifSemibold: 'Lora_600SemiBold',
  serifMedium: 'Lora_500Medium',
  sansRegular: 'PlusJakartaSans_400Regular',
  sansMedium: 'PlusJakartaSans_500Medium',
  sansSemibold: 'PlusJakartaSans_600SemiBold',
  sansBold: 'PlusJakartaSans_700Bold',
};

export const Typography = {
  display: { fontSize: 32, lineHeight: 40, fontFamily: Fonts.sansBold, letterSpacing: -0.64 },
  headlineLgMobile: { fontSize: 28, lineHeight: 36, fontFamily: Fonts.sansBold, letterSpacing: -0.28 },
  h1: { fontSize: 24, lineHeight: 32, fontFamily: Fonts.sansBold, letterSpacing: -0.24 },
  h1Mobile: { fontSize: 22, lineHeight: 28, fontFamily: Fonts.sansBold },
  titleLg: { fontSize: 22, lineHeight: 28, fontFamily: Fonts.sansSemibold },
  h2: { fontSize: 20, lineHeight: 28, fontFamily: Fonts.sansSemibold },
  h3: { fontSize: 18, lineHeight: 24, fontFamily: Fonts.sansSemibold },
  bodyLg: { fontSize: 16, lineHeight: 24, fontFamily: Fonts.sansRegular },
  bodyMd: { fontSize: 14, lineHeight: 20, fontFamily: Fonts.sansRegular },
  // bodyMd ile labelSm arası küçük gövde metni — birçok yerde elle yapılan
  // "...bodyMd, fontSize: 13" override'ının yerini alır.
  bodySm: { fontSize: 13, lineHeight: 18, fontFamily: Fonts.sansRegular },
  labelMd: { fontSize: 12, lineHeight: 16, fontFamily: Fonts.sansSemibold, letterSpacing: 0.24 },
  // labelMd'nin 13px'lik hafif büyük varyantı — "...labelMd, fontSize: 13" override'ları için.
  labelSmMd: { fontSize: 13, lineHeight: 16, fontFamily: Fonts.sansSemibold, letterSpacing: 0.24 },
  labelSm: { fontSize: 11, lineHeight: 14, fontFamily: Fonts.sansMedium },
  // Serif başlık varyantları — kart/ekran başlıklarında Typography.h yerine bunlar kullanılır.
  serifTitleLg: { fontSize: 22, lineHeight: 28, fontFamily: Fonts.serifSemibold },
  serifTitle: { fontSize: 19, lineHeight: 25, fontFamily: Fonts.serifSemibold },
  serifHeading: { fontSize: 26, lineHeight: 32, fontFamily: Fonts.serifBold, letterSpacing: -0.3 },
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
  xxl: 20,
  xxxl: 24,
  full: 9999,
};

// Lüks/pastel yönde gölge kullanılmıyor — flat yüzeyler. Geriye dönük uyumluluk
// için export ediliyor ama değerleri sıfırlandı; yeni kod bunları kullanmamalı.
export const Shadows = {
  card: { shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
  sm: { shadowColor: 'transparent', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0, shadowRadius: 0, elevation: 0 },
};
