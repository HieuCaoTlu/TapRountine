export type HabitType = 'one_tap' | 'n_tap' | 'unlimited';

export interface Habit {
  id: string;
  title: string;
  type: HabitType;
  targetCount: number; // 1 for one_tap, N for n_tap (Counter Tab), 0 for unlimited (Streak Tab)
  icon: string;
  category: string;
  createdAt: string; // YYYY-MM-DD
  reminderTime?: string; // HH:mm
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  count: number;
  completed: boolean;
  lastTappedAt: string; // ISO
}

export interface AppSettings {
  theme: 'light' | 'dark';
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  notificationsEnabled: boolean;
  notificationTime: string; // HH:mm
}

export type ActiveTab = 'habits' | 'stats' | 'settings' | 'widgets' | 'kotlin_code';
