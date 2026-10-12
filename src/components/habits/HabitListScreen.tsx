import React, { useState, useMemo } from 'react';
import { useHabit } from '../../context/HabitContext';
import { HabitCard } from './HabitCard';
import { Habit } from '../../types';
import { getTodayString, formatDateToLocal } from '../../utils/date';
import { triggerHaptic } from '../../utils/audio';
import { ChevronLeft, ChevronRight, Eye, EyeOff } from 'lucide-react';

export const HabitListScreen: React.FC = () => {
  const {
    habits,
    selectedDate,
    setSelectedDate,
    tapHabit,
    getHabitLogForDate,
    setEditingHabit,
    setIsCreateModalOpen,
  } = useHabit();

  const [viewMode, setViewMode] = useState<'all' | 'grouped'>('all');
  const [showCompleted, setShowCompleted] = useState(false);

  const todayStr = getTodayString();
  const isToday = selectedDate === todayStr;

  const handlePrevDay = () => {
    triggerHaptic('light');
    const cur = new Date(selectedDate + 'T00:00:00');
    cur.setDate(cur.getDate() - 1);
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  const handleNextDay = () => {
    triggerHaptic('light');
    const cur = new Date(selectedDate + 'T00:00:00');
    cur.setDate(cur.getDate() + 1);
    const y = cur.getFullYear();
    const m = String(cur.getMonth() + 1).padStart(2, '0');
    const d = String(cur.getDate()).padStart(2, '0');
    setSelectedDate(`${y}-${m}-${d}`);
  };

  // Rule:
  // - One Tap: đã tab xong thì ẩn
  // - Counter Tab (N-Tap): count đủ số lần (count >= targetCount) thì trên màn hình thói quen cũng tự biến mất!
  const { activeHabits, completedHabits } = useMemo(() => {
    const active: Habit[] = [];
    const completed: Habit[] = [];

    habits.forEach((habit) => {
      const log = getHabitLogForDate(habit.id, selectedDate);
      const count = log?.count || 0;
      const isDone = log?.completed;

      const isFinished =
        (habit.type === 'one_tap' && (isDone || count >= 1)) ||
        (habit.type === 'n_tap' && count >= habit.targetCount);

      if (isFinished) {
        completed.push(habit);
      } else {
        active.push(habit);
      }
    });

    return { activeHabits: active, completedHabits: completed };
  }, [habits, selectedDate, getHabitLogForDate]);

  // Grouping by categories if viewMode === 'grouped'
  const groupedCategories = useMemo(() => {
    if (viewMode !== 'grouped') return [];
    const map = new Map<string, Habit[]>();

    activeHabits.forEach((h) => {
      const cat = h.category || 'Khác';
      const list = map.get(cat) || [];
      list.push(h);
      map.set(cat, list);
    });

    return Array.from(map.entries());
  }, [viewMode, activeHabits]);

  return (
    <div className="space-y-4 pb-28">
      {/* Date Navigation: Navigation 2 bên, ở giữa ghi đúng Hôm nay hoặc ngày cụ thể */}
      <div className="flex items-center justify-between py-1 px-1">
        <button
          onClick={handlePrevDay}
          className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Ngày trước"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => {
            triggerHaptic('light');
            setSelectedDate(todayStr);
          }}
          className="text-base font-bold text-neutral-900 dark:text-neutral-100 hover:opacity-80 transition-opacity cursor-pointer"
        >
          {isToday ? 'Hôm nay' : formatDateToLocal(selectedDate)}
        </button>

        <button
          onClick={handleNextDay}
          className="w-9 h-9 rounded-full flex items-center justify-center text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          title="Ngày sau"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Sub-header: View Mode Switcher (Tất cả vs Theo danh mục) - Mượt mà không giật khựng */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="relative flex items-center p-1 bg-neutral-200/70 dark:bg-neutral-800 rounded-full text-xs font-semibold select-none">
          <button
            onClick={() => {
              triggerHaptic('light');
              setViewMode('all');
            }}
            className={`relative z-10 px-3.5 py-1.5 rounded-full transition-colors duration-150 cursor-pointer ${
              viewMode === 'all'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-bold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium'
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => {
              triggerHaptic('light');
              setViewMode('grouped');
            }}
            className={`relative z-10 px-3.5 py-1.5 rounded-full transition-colors duration-150 cursor-pointer ${
              viewMode === 'grouped'
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-bold'
                : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white font-medium'
            }`}
          >
            Theo danh mục
          </button>
        </div>
      </div>

      {/* Habit Cards Feed - Chuyển động mượt mà không khựng */}
      <div className="transition-opacity duration-150">
        {viewMode === 'all' ? (
          <div className="space-y-2.5">
            {activeHabits.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
                <p className="text-xs text-neutral-500">
                  {completedHabits.length > 0
                    ? 'Tuyệt vời! Bạn đã hoàn thành tất cả thói quen cho hôm nay.'
                    : 'Chưa có thói quen nào. Bấm nút "+" ở dưới để tạo mới.'}
                </p>
              </div>
            ) : (
              activeHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  log={getHabitLogForDate(habit.id, selectedDate)}
                  onTap={() => tapHabit(habit.id, selectedDate)}
                  onEdit={() => {
                    setEditingHabit(habit);
                    setIsCreateModalOpen(true);
                  }}
                />
              ))
            )}
          </div>
        ) : (
          /* Grouped by Categories */
          <div className="space-y-4">
            {groupedCategories.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
                <p className="text-xs text-neutral-500">Không có thói quen nào cần hoàn thành.</p>
              </div>
            ) : (
              groupedCategories.map(([category, list]) => (
                <div key={category} className="space-y-2">
                  <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider px-1">
                    {category}
                  </div>
                  <div className="space-y-2.5">
                    {list.map((habit) => (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        log={getHabitLogForDate(habit.id, selectedDate)}
                        onTap={() => tapHabit(habit.id, selectedDate)}
                        onEdit={() => {
                          setEditingHabit(habit);
                          setIsCreateModalOpen(true);
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Nút "Xem đã hoàn thành" căn giữa và cho mờ mờ */}
      {completedHabits.length > 0 && (
        <div className="pt-3 flex flex-col items-center justify-center">
          <button
            onClick={() => {
              triggerHaptic('light');
              setShowCompleted(!showCompleted);
            }}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 py-1 px-3 transition-opacity opacity-50 hover:opacity-90 cursor-pointer"
          >
            {showCompleted ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>Đã hoàn thành ({completedHabits.length})</span>
          </button>

          {showCompleted && (
            <div className="w-full space-y-2.5 mt-3 opacity-60 hover:opacity-100 transition-opacity">
              {completedHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  log={getHabitLogForDate(habit.id, selectedDate)}
                  onTap={() => tapHabit(habit.id, selectedDate)}
                  onEdit={() => {
                    setEditingHabit(habit);
                    setIsCreateModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
