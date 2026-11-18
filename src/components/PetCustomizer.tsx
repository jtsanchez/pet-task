import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { calicoPattern, randomSeed } from '../calico';
import { Species } from '../logic';
import { ColorId, PALETTE, SPECIES_LABEL, colorsFor } from '../palette';
import { Theme, useTheme } from '../theme';
import { CoatPatches, Pet } from './Pet';

interface Props {
  species: Species;
  initialName: string;
  initialColor: ColorId;
  initialSeed: number;
  title: string;
  submitLabel: string;
  onSubmit: (name: string, color: ColorId, seed: number) => void;
  onCancel: () => void;
  cancelLabel?: string;
}

export const MAX_NAME_LENGTH = 16;
const SWATCH = 36;
/** Fixed seed so the calico swatch always looks the same. */
const SWATCH_SEED = 11;

export function PetCustomizer({
  species,
  initialName,
  initialColor,
  initialSeed,
  title,
  submitLabel,
  onSubmit,
  onCancel,
  cancelLabel = 'Cancel',
}: Props) {
  const t = useTheme();
  const styles = useMemo(() => createStyles(t), [t]);
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState<ColorId>(initialColor);
  const [seed, setSeed] = useState(initialSeed);
  const finalName = name.trim() || SPECIES_LABEL[species];
  const patterned = !!PALETTE[color].patches;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>{title}</Text>

      <Pet species={species} mood="happy" color={color} seed={seed} size={140} />

      <Text style={styles.label}>Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={`Name your ${SPECIES_LABEL[species].toLowerCase()}`}
        placeholderTextColor={t.placeholder}
        keyboardAppearance={t.dark ? 'dark' : 'light'}
        maxLength={MAX_NAME_LENGTH}
        style={styles.input}
        returnKeyType="done"
        autoCapitalize="words"
      />

      <Text style={styles.label}>Colour</Text>
      <View style={styles.swatches}>
        {colorsFor(species).map((id) => {
          const p = PALETTE[id].patches;
          return (
            <Pressable
              key={id}
              onPress={() => setColor(id)}
              accessibilityRole="radio"
              accessibilityLabel={PALETTE[id].label}
              accessibilityState={{ selected: color === id }}
              style={[styles.swatchRing, color === id && styles.swatchRingSelected]}
            >
              <View style={[styles.swatch, { backgroundColor: PALETTE[id].body }]}>
                {p && <CoatPatches pattern={calicoPattern(SWATCH_SEED, p[0], p[1])} size={SWATCH} />}
              </View>
            </Pressable>
          );
        })}
      </View>
      <View style={styles.colorRow}>
        <Text style={styles.colorName}>{PALETTE[color].label}</Text>
        {patterned && (
          <Pressable
            onPress={() => setSeed(randomSeed())}
            style={({ pressed }) => [styles.shuffle, pressed && styles.pressed]}
            accessibilityRole="button"
          >
            <Text style={styles.shuffleText}>🎲 Shuffle pattern</Text>
          </Pressable>
        )}
      </View>

      <Pressable
        onPress={() => onSubmit(finalName, color, seed)}
        style={({ pressed }) => [styles.primary, pressed && styles.pressed]}
        accessibilityRole="button"
      >
        <Text style={styles.primaryText}>{submitLabel}</Text>
      </Pressable>
      <Pressable onPress={onCancel} style={styles.secondary} accessibilityRole="button">
        <Text style={styles.secondaryText}>{cancelLabel}</Text>
      </Pressable>
    </ScrollView>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flexGrow: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 12, paddingBottom: 40, paddingHorizontal: 20 },
    title: { fontSize: 28, fontWeight: '800', color: t.text, marginBottom: 8 },
    label: { alignSelf: 'stretch', fontSize: 15, fontWeight: '700', color: t.muted, marginTop: 20, marginBottom: 8 },
    input: {
      alignSelf: 'stretch',
      backgroundColor: t.card,
      borderRadius: 14,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 18,
      color: t.text,
    },
    swatches: { alignSelf: 'stretch', flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
    swatchRing: { padding: 3, borderRadius: 24, borderWidth: 3, borderColor: 'transparent' },
    swatchRingSelected: { borderColor: t.ring },
    swatch: { width: SWATCH, height: SWATCH, borderRadius: SWATCH / 2, borderWidth: 1, borderColor: 'rgba(0,0,0,0.08)', overflow: 'hidden' },
    colorRow: { alignSelf: 'stretch', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 6, minHeight: 36 },
    colorName: { color: t.muted },
    shuffle: { backgroundColor: t.chipBg, paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12 },
    shuffleText: { color: t.text, fontWeight: '700' },
    primary: {
      alignSelf: 'stretch',
      marginTop: 28,
      backgroundColor: t.primaryBg,
      paddingVertical: 16,
      borderRadius: 16,
      alignItems: 'center',
    },
    pressed: { opacity: 0.8 },
    primaryText: { color: t.primaryText, fontSize: 18, fontWeight: '800' },
    secondary: { marginTop: 12, padding: 10 },
    secondaryText: { color: t.muted, fontSize: 16, fontWeight: '600' },
  });
