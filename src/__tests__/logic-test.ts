import { describe, expect, it } from '@jest/globals';
import {
  AppData,
  Day,
  addDays,
  adoptPet,
  currentMood,
  customizePet,
  dateKey,
  displayLevel,
  evaluateDays,
  initialData,
  isDaySuccess,
} from '../logic';

const ADOPT = '2026-11-18';

function day(doneCount: number, written = 3): Day {
  return {
    tasks: [0, 1, 2].map((i) => ({ text: i < written ? `task ${i}` : '', done: i < doneCount })),
  };
}

function adopted(days: Record<string, Day> = {}): AppData {
  return { ...adoptPet(initialData(), 'cat', ADOPT, 'Mochi', 'orange', 42), days };
}

describe('customizePet', () => {
  it('changes name and colour but keeps progress', () => {
    const before = { ...adopted(), pet: { ...adopted().pet, level: 5, mood: 'happy' as const } };
    const after = customizePet(before, 'Biscuit', 'calico', 7);
    expect(after.pet).toMatchObject({ name: 'Biscuit', color: 'calico', seed: 7, level: 5, mood: 'happy', species: 'cat' });
  });
});

describe('dates', () => {
  it('formats local date keys and crosses month/year boundaries', () => {
    expect(dateKey(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('isDaySuccess', () => {
  it('needs all 3 tasks written and done', () => {
    expect(isDaySuccess(day(3))).toBe(true);
    expect(isDaySuccess(day(2))).toBe(false);
    expect(isDaySuccess(day(2, 2))).toBe(false);
    expect(isDaySuccess(undefined)).toBe(false);
  });
});

describe('evaluateDays', () => {
  it('is neutral on adoption day and does not judge it', () => {
    const data = adopted();
    expect(evaluateDays(data, ADOPT)).toBe(data);
    expect(currentMood(data, ADOPT)).toBe('neutral');
  });

  it('levels up when all 3 tasks are done', () => {
    const d1 = addDays(ADOPT, 1);
    const result = evaluateDays(adopted({ [d1]: day(3) }), addDays(ADOPT, 2));
    expect(result.pet.level).toBe(1);
    expect(result.pet.mood).toBe('happy');
    expect(result.pet.lastEvaluated).toBe(d1);
  });

  it('is sad and keeps its level when only 2 of 3 are done', () => {
    const d1 = addDays(ADOPT, 1);
    const d2 = addDays(ADOPT, 2);
    const result = evaluateDays(adopted({ [d1]: day(3), [d2]: day(2) }), addDays(ADOPT, 3));
    expect(result.pet.level).toBe(1);
    expect(result.pet.mood).toBe('sad');
  });

  it('counts a day with nothing planned as a miss', () => {
    const result = evaluateDays(adopted(), addDays(ADOPT, 2));
    expect(result.pet.level).toBe(0);
    expect(result.pet.mood).toBe('sad');
  });

  it('levels up again after a missed day (no streak reset)', () => {
    const d1 = addDays(ADOPT, 1);
    const d3 = addDays(ADOPT, 3);
    const result = evaluateDays(adopted({ [d1]: day(3), [d3]: day(3) }), addDays(ADOPT, 4));
    expect(result.pet.level).toBe(2);
    expect(result.pet.mood).toBe('happy');
  });

  it('reviews several days at once and is idempotent', () => {
    const today = addDays(ADOPT, 6);
    const once = evaluateDays(adopted({ [addDays(ADOPT, 2)]: day(3) }), today);
    expect(once.pet.level).toBe(1);
    expect(once.pet.mood).toBe('sad');
    expect(evaluateDays(once, today)).toBe(once);
  });
});

describe('displayLevel', () => {
  it('levels up immediately and is not double-counted after midnight', () => {
    const d1 = addDays(ADOPT, 1);
    const data = adopted({ [d1]: day(3) });
    expect(displayLevel(data, d1)).toBe(1);
    const nextDay = evaluateDays(data, addDays(ADOPT, 2));
    expect(displayLevel(nextDay, addDays(ADOPT, 2))).toBe(1);
  });

  it('drops back if a task is unchecked before midnight', () => {
    const d1 = addDays(ADOPT, 1);
    expect(displayLevel(adopted({ [d1]: day(2) }), d1)).toBe(0);
  });
});

describe('currentMood', () => {
  it('turns happy as soon as today is complete', () => {
    const today = addDays(ADOPT, 1);
    const data = evaluateDays(adopted({ [today]: day(3) }), today);
    expect(currentMood(data, today)).toBe('happy');
  });
});
