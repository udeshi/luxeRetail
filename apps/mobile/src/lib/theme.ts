/**
 * Same brand values as libs/shared/ui/src/styles/theme.css (Tailwind can't
 * reach into React Native's StyleSheet, so the palette is duplicated here
 * rather than shared code — see ARCHITECTURE.md "Mobile styling" for why
 * NativeWind is a documented future extension rather than wired up now).
 */
export const colors = {
  brand50: '#eef4f1',
  brand100: '#d3e3db',
  brand200: '#a8c7b8',
  brand400: '#578a75',
  brand600: '#2c5747',
  brand700: '#1f4436',
  brand800: '#163229',
  brand900: '#0f251e',
  surface: '#f7f7fb',
  white: '#ffffff',
  red: '#dc2626',
} as const;
