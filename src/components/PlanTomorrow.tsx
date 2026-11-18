import { useMemo } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Task } from '../logic';
import { Theme, cardStyle, useTheme } from '../theme';

interface Props {
  tasks: Task[];
  onChange: (index: number, text: string) => void;
}

export function PlanTomorrow({ tasks, onChange }: Props) {
  const t = useTheme();
  const styles = useMemo(() => createStyles(t), [t]);
  const filled = tasks.filter((task) => task.text.trim() !== '').length;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.heading}>Plan tomorrow</Text>
        <Text style={[styles.count, filled === 3 && styles.countDone]}>{filled}/3</Text>
      </View>
      {tasks.map((task, i) => (
        <TextInput
          key={i}
          value={task.text}
          onChangeText={(text) => onChange(i, text)}
          placeholder={`Task ${i + 1}`}
          placeholderTextColor={t.placeholder}
          keyboardAppearance={t.dark ? 'dark' : 'light'}
          style={styles.input}
          maxLength={80}
          returnKeyType="done"
        />
      ))}
    </View>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    card: cardStyle(t),
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    heading: { fontSize: 20, fontWeight: '800', color: t.text },
    count: { fontSize: 15, fontWeight: '700', color: t.subtle },
    countDone: { color: t.success },
    input: {
      backgroundColor: t.inputBg,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: t.text,
      marginBottom: 8,
    },
  });
