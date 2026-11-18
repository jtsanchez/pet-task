import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Task } from '../logic';
import { Theme, cardStyle, useTheme } from '../theme';

interface Props {
  tasks: Task[];
  onToggle: (index: number) => void;
}

export function TodayTasks({ tasks, onToggle }: Props) {
  const t = useTheme();
  const styles = useMemo(() => createStyles(t), [t]);
  const planned = tasks.map((task, i) => ({ ...task, index: i })).filter((task) => task.text.trim() !== '');

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>Today</Text>
      {planned.length === 0 ? (
        <Text style={styles.empty}>Nothing planned for today. Plan tomorrow&apos;s 3 tasks below!</Text>
      ) : (
        planned.map((task) => (
          <Pressable
            key={task.index}
            onPress={() => onToggle(task.index)}
            style={styles.row}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: task.done }}
          >
            <View style={[styles.box, task.done && styles.boxDone]}>
              {task.done && <Text style={styles.check}>✓</Text>}
            </View>
            <Text style={[styles.text, task.done && styles.textDone]}>{task.text}</Text>
          </Pressable>
        ))
      )}
    </View>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    card: cardStyle(t),
    heading: { fontSize: 20, fontWeight: '800', color: t.text, marginBottom: 10 },
    empty: { color: t.muted, fontSize: 15 },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
    box: {
      width: 28,
      height: 28,
      borderRadius: 8,
      borderWidth: 2,
      borderColor: t.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    boxDone: { backgroundColor: t.success, borderColor: t.success },
    check: { color: '#fff', fontWeight: '900', fontSize: 16 },
    text: { flex: 1, fontSize: 17, color: t.text },
    textDone: { color: t.subtle, textDecorationLine: 'line-through' },
  });
