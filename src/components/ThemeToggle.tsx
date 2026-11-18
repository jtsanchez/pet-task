import { Pressable, StyleSheet, Text } from 'react-native';
import { PREF_LABEL, ThemePref, useTheme } from '../theme';

interface Props {
  pref: ThemePref;
  onPress: () => void;
}

/** Cycles Auto → Light → Dark. */
export function ThemeToggle({ pref, onPress }: Props) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.chip, { backgroundColor: t.chipBg }, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel={`Appearance: ${pref}. Tap to change.`}
      hitSlop={8}
    >
      <Text style={[styles.text, { color: t.text }]}>{PREF_LABEL[pref]}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 14 },
  pressed: { opacity: 0.7 },
  text: { fontWeight: '700', fontSize: 14 },
});
