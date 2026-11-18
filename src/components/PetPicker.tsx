import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { randomSeed } from '../calico';
import { Species } from '../logic';
import { ColorId, DEFAULT_COLOR, SPECIES_LABEL } from '../palette';
import { Theme, useTheme } from '../theme';
import { Pet } from './Pet';
import { PetCustomizer } from './PetCustomizer';

const SPECIES: Species[] = ['cat', 'dog', 'chick'];

interface Props {
  onAdopt: (species: Species, name: string, color: ColorId, seed: number) => void;
}

/** Two steps: choose a species, then name it and choose a colour. */
export function PetPicker({ onAdopt }: Props) {
  const t = useTheme();
  const styles = useMemo(() => createStyles(t), [t]);
  const [chosen, setChosen] = useState<Species | null>(null);
  const [seed] = useState(randomSeed);

  if (chosen) {
    return (
      <PetCustomizer
        species={chosen}
        initialName=""
        initialColor={DEFAULT_COLOR[chosen]}
        initialSeed={seed}
        title={`Your new ${SPECIES_LABEL[chosen].toLowerCase()}`}
        submitLabel="Adopt"
        onSubmit={(name, color, newSeed) => onAdopt(chosen, name, color, newSeed)}
        onCancel={() => setChosen(null)}
        cancelLabel="Back"
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose your pet</Text>
      <Text style={styles.subtitle}>
        Finish your 3 tasks each day to keep it happy and help it level up.
      </Text>
      <View style={styles.row}>
        {SPECIES.map((species) => (
          <Pressable
            key={species}
            onPress={() => setChosen(species)}
            style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
            accessibilityRole="button"
            accessibilityLabel={`Choose the ${SPECIES_LABEL[species]}`}
          >
            <Pet species={species} mood="happy" size={70} />
            <Text style={styles.label}>{SPECIES_LABEL[species]}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    title: { fontSize: 30, fontWeight: '800', color: t.text, marginBottom: 8 },
    subtitle: { fontSize: 15, color: t.muted, textAlign: 'center', marginBottom: 32, maxWidth: 300 },
    row: { flexDirection: 'row', gap: 10 },
    card: {
      backgroundColor: t.card,
      borderRadius: 20,
      paddingVertical: 14,
      paddingHorizontal: 4,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOpacity: t.shadowOpacity,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: t.dark ? 0 : 3,
    },
    cardPressed: { transform: [{ scale: 0.95 }], backgroundColor: t.pressedCard },
    label: { marginTop: 6, fontSize: 16, fontWeight: '700', color: t.text },
  });
