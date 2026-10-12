import { Habit, HabitLog, AppSettings } from '../types';
import { getTodayString } from './date';

const STORAGE_KEY_HABITS = 'habittap_habits_v4';
const STORAGE_KEY_LOGS = 'habittap_logs_v4';
const STORAGE_KEY_SETTINGS = 'habittap_settings_v4';

// Xóa sạch hoàn toàn các mock data từ các phiên bản trước
try {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('habittap_habits_v1');
    localStorage.removeItem('habittap_habits_v2');
    localStorage.removeItem('habittap_habits_v3');
    localStorage.removeItem('habittap_logs_v1');
    localStorage.removeItem('habittap_logs_v2');
    localStorage.removeItem('habittap_logs_v3');
  }
} catch {
  // Ignore
}

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  soundEnabled: true,
  vibrationEnabled: true,
  notificationsEnabled: false,
  notificationTime: '20:00',
};

// Không có bất kỳ dữ liệu mẫu nào, hoàn toàn trắng sạch
export const INITIAL_HABITS: Habit[] = [];

export function generateInitialLogs(): HabitLog[] {
  return [];
}

export function loadStoredHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HABITS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn(err);
  }
  return INITIAL_HABITS;
}

export function saveStoredHabits(habits: Habit[]) {
  try {
    localStorage.setItem(STORAGE_KEY_HABITS, JSON.stringify(habits));
  } catch (err) {
    console.error(err);
  }
}

export function loadStoredLogs(): HabitLog[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn(err);
  }
  return [];
}

export function saveStoredLogs(logs: HabitLog[]) {
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  } catch (err) {
    console.error(err);
  }
}

export function loadStoredSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
    if (raw) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn(err);
  }
  return DEFAULT_SETTINGS;
}

export function saveStoredSettings(settings: AppSettings) {
  try {
    localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
  } catch (err) {
    console.error(err);
  }
}

export function exportBackupData(habits: Habit[], logs: HabitLog[], settings: AppSettings) {
  const data = {
    version: '3.0.0',
    exportDate: new Date().toISOString(),
    habits,
    logs,
    settings,
  };

  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `habittap_backup_${getTodayString()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function parseBackupFile(jsonString: string): {
  habits?: Habit[];
  logs?: HabitLog[];
  settings?: AppSettings;
} {
  const parsed = JSON.parse(jsonString);
  return {
    habits: parsed.habits,
    logs: parsed.logs,
    settings: parsed.settings,
  };
}
