import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, initialData } from './logic';

const KEY = 'todo-pet/v1';

export async function loadData(): Promise<AppData> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return initialData();
    const saved = JSON.parse(raw) as Partial<AppData>;
    const base = initialData();
    // Merge pet fields too, so data saved by older versions gains new fields (name, color).
    return { ...base, ...saved, pet: { ...base.pet, ...saved.pet } };
  } catch {
    return initialData();
  }
}

export async function saveData(data: AppData): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // Storage failures are non-fatal; the next change retries the save.
  }
}

export async function clearData(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
