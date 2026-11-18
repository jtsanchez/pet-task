import { createContext, useContext } from 'react';

export type ThemePref = 'system' | 'light' | 'dark';

export interface Theme {
  dark: boolean;
  bg: string;
  card: string;
  text: string;
  muted: string;
  subtle: string;
  placeholder: string;
  inputBg: string;
  border: string;
  success: string;
  successText: string;
  /** Strong button / badge background and its text. */
  primaryBg: string;
  primaryText: string;
  chipBg: string;
  pressedCard: string;
  ring: string;
  petShadow: string;
  shadowOpacity: number;
}

export const LIGHT: Theme = {
  dark: false,
  bg: '#FFF8EE',
  card: '#FFFFFF',
  text: '#2D2A32',
  muted: '#6B6475',
  subtle: '#A39DAD',
  placeholder: '#B5AFBF',
  inputBg: '#F6F3F9',
  border: '#C9C2D3',
  success: '#7BC67E',
  successText: '#4E9F50',
  primaryBg: '#2D2A32',
  primaryText: '#FFD93D',
  chipBg: '#ECE6F2',
  pressedCard: '#FFF6E5',
  ring: '#2D2A32',
  petShadow: 'rgba(0,0,0,0.08)',
  shadowOpacity: 0.07,
};

export const DARK: Theme = {
  dark: true,
  bg: '#18171D',
  card: '#25232C',
  text: '#F2EFF6',
  muted: '#B3ACBE',
  subtle: '#8A8396',
  placeholder: '#6F687B',
  inputBg: '#312E3A',
  border: '#4A4555',
  success: '#6DBF70',
  successText: '#8FD992',
  primaryBg: '#FFD93D',
  primaryText: '#2D2A32',
  chipBg: '#312E3A',
  pressedCard: '#332F3D',
  ring: '#FFD93D',
  petShadow: 'rgba(0,0,0,0.45)',
  shadowOpacity: 0.3,
};

export function resolveTheme(pref: ThemePref, system: string | null | undefined): Theme {
  if (pref === 'light') return LIGHT;
  if (pref === 'dark') return DARK;
  return system === 'dark' ? DARK : LIGHT;
}

export const NEXT_PREF: Record<ThemePref, ThemePref> = { system: 'light', light: 'dark', dark: 'system' };
export const PREF_LABEL: Record<ThemePref, string> = { system: '🌓 Auto', light: '☀️ Light', dark: '🌙 Dark' };

export const ThemeContext = createContext<Theme>(LIGHT);

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

export function cardStyle(t: Theme) {
  return {
    backgroundColor: t.card,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: t.shadowOpacity,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: t.dark ? 0 : 2,
  } as const;
}
