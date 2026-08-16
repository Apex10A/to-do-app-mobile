import '@/global.css';

import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Brand palette
// ---------------------------------------------------------------------------
export const Brand = {
  championBlue: '#151130',   // primary background / dark base
  lavenderTonic: '#c8befa',  // primary accent / lavender highlight
  lavenderLight: '#e4d9fd',  // lighter tint for subtle backgrounds
  lavenderDark: '#9b86e8',   // deeper shade for pressed states
  white: '#ffffff',
  offWhite: '#f2effe',
} as const;

// ---------------------------------------------------------------------------
// Light / dark semantic tokens
// ---------------------------------------------------------------------------
export const Colors = {
  light: {
    text: Brand.championBlue,
    textSecondary: '#5a5375',
    background: Brand.offWhite,
    backgroundElement: '#ffffff',
    backgroundSelected: Brand.lavenderLight,
    accent: Brand.lavenderTonic,
    accentDark: Brand.lavenderDark,
    accentText: Brand.championBlue,
    border: '#ddd6f8',
    error: '#e05b5b',
    success: '#4caf7d',
  },
  dark: {
    text: Brand.lavenderLight,
    textSecondary: Brand.lavenderTonic,
    background: Brand.championBlue,
    backgroundElement: '#1e1a3a',
    backgroundSelected: '#2a2550',
    accent: Brand.lavenderTonic,
    accentDark: Brand.lavenderDark,
    accentText: Brand.championBlue,
    border: '#2d2856',
    error: '#f07070',
    success: '#5fbf8a',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// ---------------------------------------------------------------------------
// Typography — Clash Grotesk
// The family names below are what React Native uses at runtime.
// On iOS the name comes from inside the font file; on Android it's the
// filename stem. Both match "ClashGrotesk-*" for this font family.
// ---------------------------------------------------------------------------
export const Fonts = {
  extralight: 'ClashGrotesk-Extralight',
  light:      'ClashGrotesk-Light',
  regular:    'ClashGrotesk-Regular',
  medium:     'ClashGrotesk-Medium',
  semibold:   'ClashGrotesk-Semibold',
  bold:       'ClashGrotesk-Bold',
  variable:   'ClashGrotesk-Variable',
} as const;

/** Convenience map passed to useFonts() in the root layout */
export const FontAssets = {
  'ClashGrotesk-Extralight': require('../../assets/fonts/ClashGrotesk-Extralight.ttf'),
  'ClashGrotesk-Light':      require('../../assets/fonts/ClashGrotesk-Light.ttf'),
  'ClashGrotesk-Regular':    require('../../assets/fonts/ClashGrotesk-Regular.ttf'),
  'ClashGrotesk-Medium':     require('../../assets/fonts/ClashGrotesk-Medium.ttf'),
  'ClashGrotesk-Semibold':   require('../../assets/fonts/ClashGrotesk-Semibold.ttf'),
  'ClashGrotesk-Bold':       require('../../assets/fonts/ClashGrotesk-Bold.ttf'),
  'ClashGrotesk-Variable':   require('../../assets/fonts/ClashGrotesk-Variable.ttf'),
} as const;

// ---------------------------------------------------------------------------
// Spacing scale (4 pt base)
// ---------------------------------------------------------------------------
export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

// ---------------------------------------------------------------------------
// Border radius
// ---------------------------------------------------------------------------
export const Radius = {
  sm: 8,
  md: 14,
  lg: 20,
  full: 999,
} as const;

// ---------------------------------------------------------------------------
// Misc
// ---------------------------------------------------------------------------
export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
