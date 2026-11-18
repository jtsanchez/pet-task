export type Species = 'cat' | 'dog' | 'chick';
export type Mood = 'happy' | 'sad' | 'neutral';

export interface Task {
  text: string;
  done: boolean;
}

export interface Day {
  tasks: Task[];
}

export interface PetState {
  species: Species | null;
  name: string;
  /** Palette colour id (see palette.ts). */
  color: string;
  /** Seed for patterned coats such as calico. */
  seed: number;
  level: number;
  /** Mood resulting from the most recently reviewed day. */
  mood: Mood;
  /** Last date (YYYY-MM-DD) whose result has been applied. Days after it are still pending. */
  lastEvaluated: string | null;
}

export interface AppData {
  days: Record<string, Day>;
  pet: PetState;
  /** Dev-only clock offset in days, used to test day rollover. */
  devDayOffset: number;
  /** Appearance: follow the phone, or force light/dark. */
  themePref: 'system' | 'light' | 'dark';
}

export const TASKS_PER_DAY = 3;

export function emptyTasks(): Task[] {
  return Array.from({ length: TASKS_PER_DAY }, () => ({ text: '', done: false }));
}

export function initialData(): AppData {
  return {
    days: {},
    pet: { species: null, name: '', color: '', seed: 1, level: 0, mood: 'neutral', lastEvaluated: null },
    devDayOffset: 0,
    themePref: 'system',
  };
}

/** Local-time date key, e.g. "2026-11-18". */
export function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number);
  return dateKey(new Date(y, m - 1, d + n));
}

export function todayKey(data: AppData, now: Date = new Date()): string {
  return addDays(dateKey(now), data.devDayOffset);
}

/** A day succeeds only if all 3 tasks were written and checked. */
export function isDaySuccess(day: Day | undefined): boolean {
  if (!day) return false;
  const tasks = day.tasks.filter((t) => t.text.trim() !== '');
  return tasks.length === TASKS_PER_DAY && tasks.every((t) => t.done);
}

/** Adopt a pet. The adoption day itself is never judged. */
export function adoptPet(
  data: AppData,
  species: Species,
  today: string,
  name: string,
  color: string,
  seed: number,
): AppData {
  return {
    ...data,
    pet: { species, name, color, seed, level: 0, mood: 'neutral', lastEvaluated: today },
  };
}

/** Rename / recolour / re-pattern without touching level or mood. */
export function customizePet(data: AppData, name: string, color: string, seed: number): AppData {
  return { ...data, pet: { ...data.pet, name, color, seed } };
}

/**
 * Applies the result of every unreviewed day strictly before `today`.
 * Success: level +1 and happy. Failure (including nothing planned): sad, level unchanged.
 */
export function evaluateDays(data: AppData, today: string): AppData {
  const { pet } = data;
  if (!pet.species || !pet.lastEvaluated) return data;

  let { level, mood } = pet;
  let day = addDays(pet.lastEvaluated, 1);
  let reviewed = false;
  while (day < today) {
    if (isDaySuccess(data.days[day])) {
      level += 1;
      mood = 'happy';
    } else {
      mood = 'sad';
    }
    reviewed = true;
    day = addDays(day, 1);
  }
  if (!reviewed) return data;

  return { ...data, pet: { ...pet, level, mood, lastEvaluated: addDays(today, -1) } };
}

/**
 * Level shown to the user. Today's completion counts immediately; the midnight review
 * later folds it into `pet.level`, so it is never counted twice.
 */
export function displayLevel(data: AppData, today: string): number {
  return data.pet.level + (isDaySuccess(data.days[today]) ? 1 : 0);
}

/** Today's mood: happy as soon as today's 3 tasks are done, otherwise yesterday's result. */
export function currentMood(data: AppData, today: string): Mood {
  if (isDaySuccess(data.days[today])) return 'happy';
  return data.pet.mood;
}
