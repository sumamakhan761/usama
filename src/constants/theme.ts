import '@/global.css';
import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#16231E',
    textSecondary: '#4D6257',
    textMuted: '#788F84',
    background: '#F7F8F4',
    cardBackground: '#FFFFFF',
    backgroundElement: '#EFF2EC',
    backgroundSelected: '#DEE4D8',
    primary: '#2D6A4F',
    primaryHover: '#22553F',
    primaryLight: '#E3EFE8',
    accent: '#40916C',
    amberLight: '#FEF3C7',
    amberText: '#B45309',
    border: '#E3E8DF',
    cardShadow: 'rgba(20, 35, 28, 0.04)',
  },
  dark: {
    text: '#F1F5F2',
    textSecondary: '#A2B5AB',
    textMuted: '#6D8277',
    background: '#0F1613',
    cardBackground: '#17221D',
    backgroundElement: '#1F2C26',
    backgroundSelected: '#2A3C34',
    primary: '#52B788',
    primaryHover: '#74C69D',
    primaryLight: '#1B3528',
    accent: '#74C69D',
    amberLight: '#382807',
    amberText: '#FBBF24',
    border: '#24342C',
    cardShadow: 'rgba(0, 0, 0, 0.25)',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 48,
  seven: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 60, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
