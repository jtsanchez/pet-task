import { setAudioModeAsync, useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  AppState,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { LevelBadge, LevelUpBanner } from './src/components/LevelUpBanner';
import { Pet } from './src/components/Pet';
import { PetCustomizer } from './src/components/PetCustomizer';
import { PetPicker } from './src/components/PetPicker';
import { PlanTomorrow } from './src/components/PlanTomorrow';
import { ThemeToggle } from './src/components/ThemeToggle';
import { TodayTasks } from './src/components/TodayTasks';
import {
  AppData,
  Day,
  addDays,
  adoptPet,
  currentMood,
  customizePet,
  displayLevel,
  emptyTasks,
  evaluateDays,
  initialData,
  isDaySuccess,
  todayKey,
} from './src/logic';
import { SPECIES_LABEL, resolveColor } from './src/palette';
import { clearData, loadData, saveData } from './src/storage';
import { NEXT_PREF, Theme, ThemeContext, resolveTheme } from './src/theme';

const IS_WEB = Platform.OS === 'web';

/**
 * Testing tools (skip day, reset). Shown in development, and in the public web demo
 * (built with EXPO_PUBLIC_DEMO=1) so visitors can try a level-up without waiting a day.
 * Never shown in store builds.
 */
const IS_DEMO = process.env.EXPO_PUBLIC_DEMO === '1';
const SHOW_TOOLS = __DEV__ || IS_DEMO;

const MOOD_TEXT = {
  happy: 'Feeling happy! 💛',
  sad: 'Feeling sad… finish your 3 tasks to cheer them up.',
  neutral: 'Settling in. Plan your first 3 tasks!',
};

export default function App() {
  const [data, setData] = useState<AppData | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [celebrateKey, setCelebrateKey] = useState(0);
  const [editingPet, setEditingPet] = useState(false);
  const loaded = useRef(false);
  const levelUpSound = useAudioPlayer(require('./assets/sounds/levelup.wav'));
  const systemScheme = useColorScheme();
  const theme = resolveTheme(data?.themePref ?? 'system', systemScheme);
  const styles = useMemo(() => createStyles(theme), [theme]);

  // On the web, colour the page around the phone-width column to match the theme.
  useEffect(() => {
    if (IS_WEB && typeof document !== 'undefined') document.body.style.backgroundColor = theme.bg;
  }, [theme.bg]);

  // Sound effects respect the iPhone silent switch.
  useEffect(() => {
    setAudioModeAsync({ playsInSilentMode: false }).catch(() => {});
  }, []);

  const celebrateLevelUp = useCallback(() => {
    setCelebrateKey((k) => k + 1);
    // seekTo is async: wait for the rewind to finish before playing, otherwise
    // every play after the first starts at the end of the clip and is silent.
    (async () => {
      try {
        levelUpSound.pause();
        await levelUpSound.seekTo(0);
        levelUpSound.play();
      } catch {
        // Sound is a nice-to-have; ignore playback errors.
      }
    })();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  }, [levelUpSound]);

  // Load saved data once.
  useEffect(() => {
    loadData().then((d) => {
      loaded.current = true;
      setData(d);
    });
  }, []);

  // Persist every change after the initial load.
  useEffect(() => {
    if (loaded.current && data) saveData(data);
  }, [data]);

  // Refresh the clock when the app returns to the foreground so a new day is noticed.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setNow(new Date());
    });
    return () => sub.remove();
  }, []);

  const today = data ? todayKey(data, now) : '';

  // Review any days that ended since the last review.
  useEffect(() => {
    if (!data || !today) return;
    const next = evaluateDays(data, today);
    if (next !== data) setData(next);
  }, [data, today]);

  const updateDay = useCallback((key: string, fn: (day: Day) => Day) => {
    setData((d) => {
      if (!d) return d;
      const day = d.days[key] ?? { tasks: emptyTasks() };
      return { ...d, days: { ...d.days, [key]: fn(day) } };
    });
  }, []);

  const statusBar = <StatusBar style={theme.dark ? 'light' : 'dark'} />;

  if (!data) {
    return (
      <View style={[styles.screen, styles.center]}>
        {statusBar}
        <ActivityIndicator color={theme.muted} />
      </View>
    );
  }

  const { pet } = data;

  const cycleTheme = () => setData({ ...data, themePref: NEXT_PREF[data.themePref] });
  const themeToggle = <ThemeToggle pref={data.themePref} onPress={cycleTheme} />;
  // Top bar with the theme toggle for screens other than the main one.
  const topBar = <View style={styles.topBar}>{themeToggle}</View>;

  if (!pet.species) {
    return (
      <ThemeContext.Provider value={theme}>
        <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {statusBar}
          {topBar}
          <PetPicker
            onAdopt={(species, name, color, seed) => setData(adoptPet(data, species, today, name, color, seed))}
          />
        </KeyboardAvoidingView>
      </ThemeContext.Provider>
    );
  }

  const color = resolveColor(pet.color, pet.species);
  const name = pet.name || SPECIES_LABEL[pet.species];

  if (editingPet) {
    return (
      <ThemeContext.Provider value={theme}>
        <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {statusBar}
          {topBar}
          <PetCustomizer
            species={pet.species}
            initialName={name}
            initialColor={color}
            initialSeed={pet.seed}
            title={`Edit ${name}`}
            submitLabel="Save"
            onSubmit={(newName, newColor, newSeed) => {
              setData(customizePet(data, newName, newColor, newSeed));
              setEditingPet(false);
            }}
            onCancel={() => setEditingPet(false)}
          />
        </KeyboardAvoidingView>
      </ThemeContext.Provider>
    );
  }

  const tomorrow = addDays(today, 1);
  const todayTasks = data.days[today]?.tasks ?? emptyTasks();
  const tomorrowTasks = data.days[tomorrow]?.tasks ?? emptyTasks();
  const todayDone = isDaySuccess(data.days[today]);
  const mood = currentMood(data, today);
  const level = displayLevel(data, today);

  const toggleTask = (index: number) => {
    const willComplete =
      !todayDone &&
      isDaySuccess({ tasks: todayTasks.map((t, i) => (i === index ? { ...t, done: !t.done } : t)) });
    updateDay(today, (day) => ({
      tasks: day.tasks.map((t, i) => (i === index ? { ...t, done: !t.done } : t)),
    }));
    if (willComplete) celebrateLevelUp();
  };

  const editTomorrow = (index: number, text: string) =>
    updateDay(tomorrow, (day) => ({
      tasks: day.tasks.map((t, i) => (i === index ? { ...t, text } : t)),
    }));

  const confirmReset = () => {
    const message = `${name} at Lv ${level} will be reset. All tasks and progress will be lost.`;
    const reset = async () => {
      await clearData();
      setData({ ...initialData(), themePref: data.themePref });
    };
    // React Native's Alert has no buttons on the web, so use the browser's confirm dialog there.
    if (IS_WEB) {
      if (window.confirm(`Are you sure?\n\n${message}`)) reset();
      return;
    }
    Alert.alert('Are you sure?', message, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: reset },
    ]);
  };

  return (
    <ThemeContext.Provider value={theme}>
      <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {statusBar}
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.petArea}>
            <View style={styles.headerRow}>
              {themeToggle}
              <LevelBadge level={level} triggerKey={celebrateKey} />
            </View>
            <Pet species={pet.species} mood={mood} color={color} seed={pet.seed} celebrateKey={celebrateKey} />
            <Pressable
              onPress={() => setEditingPet(true)}
              style={styles.nameButton}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${name}'s name and colour`}
            >
              <Text style={styles.petName}>{name}</Text>
              <Text style={styles.editIcon}>✎</Text>
            </Pressable>
            <Text style={styles.moodText}>{MOOD_TEXT[mood]}</Text>
            {todayDone && <Text style={styles.fed}>Fed! 🎉 All 3 done today.</Text>}
            <LevelUpBanner level={level} triggerKey={celebrateKey} />
          </View>

          <TodayTasks tasks={todayTasks} onToggle={toggleTask} />
          <PlanTomorrow tasks={tomorrowTasks} onChange={editTomorrow} />

          {SHOW_TOOLS && (
            <View style={styles.devRow}>
              {IS_DEMO && <Text style={styles.devInfo}>Demo tools: try a whole week in a minute</Text>}
              <Pressable
                onPress={() => setData({ ...data, devDayOffset: data.devDayOffset + 1 })}
                style={styles.devButton}
              >
                <Text style={styles.devText}>⏭ Skip to next day</Text>
              </Pressable>
              <Pressable onPress={confirmReset} style={styles.devButton}>
                <Text style={styles.devText}>↺ Reset app</Text>
              </Pressable>
              {__DEV__ && <Text style={styles.devInfo}>dev · today = {today}</Text>}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemeContext.Provider>
  );
}

const createStyles = (t: Theme) =>
  StyleSheet.create({
    // On the web, keep a phone-width column centred on wide screens.
    screen: IS_WEB
      ? { flex: 1, backgroundColor: t.bg, width: '100%', maxWidth: 480, alignSelf: 'center' }
      : { flex: 1, backgroundColor: t.bg },
    center: { justifyContent: 'center', alignItems: 'center' },
    content: { paddingTop: IS_WEB ? 24 : 64, paddingHorizontal: 16, paddingBottom: 40 },
    petArea: { alignItems: 'center', marginBottom: 20 },
    headerRow: { alignSelf: 'stretch', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    topBar: { paddingTop: IS_WEB ? 16 : 56, paddingHorizontal: 16, alignItems: 'flex-end' },
    nameButton: { flexDirection: 'row', alignItems: 'center', marginTop: 8, paddingHorizontal: 12, paddingVertical: 4 },
    petName: { fontSize: 24, fontWeight: '800', color: t.text },
    editIcon: { marginLeft: 6, fontSize: 18, color: t.subtle },
    moodText: { marginTop: 4, fontSize: 17, fontWeight: '600', color: t.text, textAlign: 'center' },
    fed: { marginTop: 6, fontSize: 15, fontWeight: '700', color: t.successText },
    devRow: { alignItems: 'center', gap: 8, marginTop: 8 },
    devButton: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 10, backgroundColor: t.chipBg },
    devText: { color: t.muted, fontWeight: '600' },
    devInfo: { color: t.placeholder, fontSize: 12 },
  });
