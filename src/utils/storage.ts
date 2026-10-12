import { Habit, HabitLog, AppSettings } from '../types';
import { getTodayString } from './date';

const STORAGE_KEY_HABITS = 'habittap_habits_v2';
const STORAGE_KEY_LOGS = 'habittap_logs_v2';
const STORAGE_KEY_SETTINGS = 'habittap_settings_v2';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  soundEnabled: true,
  vibrationEnabled: true,
  notificationsEnabled: false,
  notificationTime: '20:00',
};

export const INITIAL_HABITS: Habit[] = [
  {
    id: 'habit-1',
    title: 'Uống nước',
    type: 'n_tap',
    targetCount: 8,
    icon: 'droplets',
    category: 'Sức khỏe',
    createdAt: '2026-08-01',
    reminderTime: '08:00',
  },
  {
    id: 'habit-2',
    title: 'Đọc sách',
    type: 'one_tap',
    targetCount: 1,
    icon: 'book-open',
    category: 'Trí tuệ',
    createdAt: '2026-08-01',
    reminderTime: '21:00',
  },
  {
    id: 'habit-3',
    title: 'Tập thể dục',
    type: 'n_tap',
    targetCount: 5,
    icon: 'dumbbell',
    category: 'Thể thao',
    createdAt: '2026-08-01',
    reminderTime: '06:30',
  },
  {
    id: 'habit-4',
    title: 'Biết ơn mỗi ngày',
    type: 'unlimited',
    targetCount: 0,
    icon: 'heart',
    category: 'Tâm trí',
    createdAt: '2026-08-01',
  },
  {
    id: 'habit-5',
    title: 'Ngủ trước 23h',
    type: 'one_tap',
    targetCount: 1,
    icon: 'moon',
    category: 'Sức khỏe',
    createdAt: '2026-08-01',
  },
];

export function generateInitialLogs(): HabitLog[] {
  const logs: HabitLog[] = [];
  const today = new Date();

  // Generate logs for last 45 days
  for (let i = 45; i >= 0; i--) {
    const curDate = new Date(today);
    curDate.setDate(today.getDate() - i);
    const year = curDate.getFullYear();
    const month = String(curDate.getMonth() + 1).padStart(2, '0');
    const day = String(curDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;

    const seed = (curDate.getDate() * 17 + curDate.getMonth() * 31) % 100;

    // Habit 1: Water (N-tap target 8)
    if (seed > 20) {
      const cnt = seed > 60 ? 8 : (seed > 35 ? 6 : 4);
      logs.push({
        id: `log-1-${dateStr}`,
        habitId: 'habit-1',
        date: dateStr,
        count: i === 0 ? 4 : cnt,
        completed: (i === 0 ? 4 : cnt) >= 8,
        lastTappedAt: new Date().toISOString(),
      });
    }

    // Habit 2: Reading (One-tap)
    if (seed > 30 && i !== 0) { // i === 0 is not completed today so user can tap!
      logs.push({
        id: `log-2-${dateStr}`,
        habitId: 'habit-2',
        date: dateStr,
        count: 1,
        completed: true,
        lastTappedAt: new Date().toISOString(),
      });
    }

    // Habit 3: Pushups
    if (seed % 3 !== 0) {
      const cnt = seed % 4 === 0 ? 5 : 3;
      logs.push({
        id: `log-3-${dateStr}`,
        habitId: 'habit-3',
        date: dateStr,
        count: cnt,
        completed: cnt >= 5,
        lastTappedAt: new Date().toISOString(),
      });
    }

    // Habit 4: Gratitude (Unlimited)
    if (seed > 40) {
      const cnt = 1 + (seed % 6);
      logs.push({
        id: `log-4-${dateStr}`,
        habitId: 'habit-4',
        date: dateStr,
        count: i === 0 ? 2 : cnt,
        completed: true,
        lastTappedAt: new Date().toISOString(),
      });
    }
  }

  return logs;
}

export function loadStoredHabits(): Habit[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HABITS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
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
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn(err);
  }
  return generateInitialLogs();
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
    version: '2.0.0',
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
