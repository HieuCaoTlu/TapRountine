import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import confetti from 'canvas-confetti';
import { Habit, HabitLog, AppSettings, ActiveTab } from '../types';
import {
  loadStoredHabits,
  saveStoredHabits,
  loadStoredLogs,
  saveStoredLogs,
  loadStoredSettings,
  saveStoredSettings,
  generateInitialLogs,
  INITIAL_HABITS,
  DEFAULT_SETTINGS,
} from '../utils/storage';
import { getTodayString } from '../utils/date';
import { soundEffects, triggerHaptic } from '../utils/audio';

interface HabitContextType {
  habits: Habit[];
  logs: HabitLog[];
  settings: AppSettings;
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isDarkMode: boolean;

  // Actions
  tapHabit: (habitId: string, date?: string) => void;
  decrementHabit: (habitId: string, date?: string) => void;
  resetHabitDay: (habitId: string, date?: string) => void;
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt'>) => void;
  updateHabit: (habit: Habit) => void;
  deleteHabit: (habitId: string) => void;
  updateSettings: (partial: Partial<AppSettings>) => void;

  // Data management
  loadSampleData: () => void;
  restoreData: (habits: Habit[], logs: HabitLog[], settings?: AppSettings) => void;
  clearAllData: () => void;

  // Computed state
  getHabitLogForDate: (habitId: string, date?: string) => HabitLog | undefined;

  // Modal State
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
  editingHabit: Habit | null;
  setEditingHabit: (habit: Habit | null) => void;
}

const HabitContext = createContext<HabitContextType | undefined>(undefined);

export const HabitProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [habits, setHabits] = useState<Habit[]>(loadStoredHabits);
  const [logs, setLogs] = useState<HabitLog[]>(loadStoredLogs);
  const [settings, setSettings] = useState<AppSettings>(loadStoredSettings);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [activeTab, setActiveTab] = useState<ActiveTab>('habits');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  useEffect(() => {
    saveStoredHabits(habits);
  }, [habits]);

  useEffect(() => {
    saveStoredLogs(logs);
  }, [logs]);

  useEffect(() => {
    saveStoredSettings(settings);
  }, [settings]);

  // Dark mode handler
  const isDarkMode = useMemo(() => {
    return settings.theme === 'dark';
  }, [settings.theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDarkMode]);

  const getHabitLogForDate = (habitId: string, date = selectedDate): HabitLog | undefined => {
    return logs.find((l) => l.habitId === habitId && l.date === date);
  };

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
        ticks: 150,
        disableForReducedMotion: true,
      });
    } catch {
      // Fallback
    }
  };

  // Primary action: Tap habit
  const tapHabit = (habitId: string, date = selectedDate) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    if (settings.soundEnabled) soundEffects.playTap();
    // Phản hồi rung CHỈ thực hiện khi bấm tap hoàn thành 1 habit

    setLogs((prevLogs) => {
      const existingLogIndex = prevLogs.findIndex((l) => l.habitId === habitId && l.date === date);
      const nowIso = new Date().toISOString();

      if (existingLogIndex === -1) {
        const isCompleted = habit.type === 'one_tap' ? true : (habit.type === 'n_tap' ? 1 >= habit.targetCount : true);

        if (isCompleted) {
          if (settings.soundEnabled) soundEffects.playComplete();
          if (settings.vibrationEnabled) triggerHaptic('success');
          triggerCelebration();
        }

        const newLog: HabitLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          habitId,
          date,
          count: 1,
          completed: isCompleted,
          lastTappedAt: nowIso,
        };
        return [...prevLogs, newLog];
      }

      const currentLog = prevLogs[existingLogIndex];
      let newCount = currentLog.count + 1;
      let newCompleted = currentLog.completed;

      if (habit.type === 'one_tap') {
        if (currentLog.count >= 1) {
          newCount = 0;
          newCompleted = false;
        } else {
          newCount = 1;
          newCompleted = true;
          if (settings.soundEnabled) soundEffects.playComplete();
          if (settings.vibrationEnabled) triggerHaptic('success');
          triggerCelebration();
        }
      } else if (habit.type === 'n_tap') {
        const wasCompletedBefore = currentLog.completed;
        newCompleted = newCount >= habit.targetCount;
        if (!wasCompletedBefore && newCompleted) {
          if (settings.soundEnabled) soundEffects.playComplete();
          if (settings.vibrationEnabled) triggerHaptic('success');
          triggerCelebration();
        }
      } else {
        const wasCompletedBefore = currentLog.completed;
        newCompleted = newCount > 0;
        if (!wasCompletedBefore && newCompleted) {
          if (settings.soundEnabled) soundEffects.playComplete();
          if (settings.vibrationEnabled) triggerHaptic('success');
          triggerCelebration();
        }
      }

      const updatedLog: HabitLog = {
        ...currentLog,
        count: newCount,
        completed: newCompleted,
        lastTappedAt: nowIso,
      };

      const next = [...prevLogs];
      next[existingLogIndex] = updatedLog;
      return next;
    });
  };

  const decrementHabit = (habitId: string, date = selectedDate) => {
    const habit = habits.find((h) => h.id === habitId);
    if (!habit) return;

    if (settings.soundEnabled) soundEffects.playUndo();

    setLogs((prevLogs) => {
      const index = prevLogs.findIndex((l) => l.habitId === habitId && l.date === date);
      if (index === -1) return prevLogs;

      const cur = prevLogs[index];
      if (cur.count <= 0) return prevLogs;

      const newCount = cur.count - 1;
      let newCompleted = false;
      if (habit.type === 'one_tap') {
        newCompleted = newCount >= 1;
      } else if (habit.type === 'n_tap') {
        newCompleted = newCount >= habit.targetCount;
      } else {
        newCompleted = newCount > 0;
      }

      const updated: HabitLog = {
        ...cur,
        count: newCount,
        completed: newCompleted,
        lastTappedAt: new Date().toISOString(),
      };

      const next = [...prevLogs];
      next[index] = updated;
      return next;
    });
  };

  const resetHabitDay = (habitId: string, date = selectedDate) => {
    setLogs((prev: HabitLog[]) => prev.filter((l) => !(l.habitId === habitId && l.date === date)));
  };

  const addHabit = (habitData: Omit<Habit, 'id' | 'createdAt'>) => {
    const newHabit: Habit = {
      ...habitData,
      id: `habit-${Date.now()}`,
      createdAt: getTodayString(),
    };
    setHabits((prev) => [newHabit, ...prev]);
    if (settings.soundEnabled) soundEffects.playComplete();
  };

  const updateHabit = (habit: Habit) => {
    setHabits((prev) => prev.map((h) => (h.id === habit.id ? habit : h)));
  };

  const deleteHabit = (habitId: string) => {
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    setLogs((prev) => prev.filter((l) => l.habitId !== habitId));
  };

  const updateSettings = (partial: Partial<AppSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const loadSampleData = () => {
    setHabits(INITIAL_HABITS);
    setLogs(generateInitialLogs());
    setSettings(DEFAULT_SETTINGS);
  };

  const restoreData = (newHabits: Habit[], newLogs: HabitLog[], newSettings?: AppSettings) => {
    if (Array.isArray(newHabits)) setHabits(newHabits);
    if (Array.isArray(newLogs)) setLogs(newLogs);
    if (newSettings) setSettings(newSettings);
  };

  const clearAllData = () => {
    setHabits([]);
    setLogs([]);
  };

  return (
    <HabitContext.Provider
      value={{
        habits,
        logs,
        settings,
        selectedDate,
        setSelectedDate,
        activeTab,
        setActiveTab,
        isDarkMode,
        tapHabit,
        decrementHabit,
        resetHabitDay,
        addHabit,
        updateHabit,
        deleteHabit,
        updateSettings,
        loadSampleData,
        restoreData,
        clearAllData,
        getHabitLogForDate,
        isCreateModalOpen,
        setIsCreateModalOpen,
        editingHabit,
        setEditingHabit,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
};

export const useHabit = () => {
  const context = useContext(HabitContext);
  if (!context) throw new Error('useHabit must be used within HabitProvider');
  return context;
};
