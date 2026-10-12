import React, { useMemo } from 'react';
import { useHabit } from '../../context/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { Habit } from '../../types';
import { getTodayString } from '../../utils/date';
import { Plus, Check, ArrowRight, CheckCircle2 } from 'lucide-react';

export const AndroidWidgetsShowcase: React.FC = () => {
  const { habits, tapHabit, getHabitLogForDate, setActiveTab } = useHabit();
  const todayStr = getTodayString();

  // Rule: Lọc các thói quen chưa xong. Thói quen nào tab xong rồi thì biến mất khỏi widget!
  const isHabitFinished = (habit: Habit) => {
    const log = getHabitLogForDate(habit.id, todayStr);
    const count = log?.count || 0;
    const isDone = log?.completed;

    return (
      (habit.type === 'one_tap' && (isDone || count >= 1)) ||
      (habit.type === 'n_tap' && count >= habit.targetCount)
    );
  };

  const activeHabits = useMemo(() => {
    return habits.filter((h) => !isHabitFinished(h));
  }, [habits, todayStr, getHabitLogForDate]);

  const primaryHabit = activeHabits[0] || null;
  const primaryLog = primaryHabit ? getHabitLogForDate(primaryHabit.id, todayStr) : null;
  const primaryCount = primaryLog ? primaryLog.count : 0;

  return (
    <div className="space-y-4 pb-28">
      {/* Title */}
      <div className="py-2 px-1">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          Bộ Widget Màn Hình Chính
        </h2>
        <p className="text-xs text-neutral-500 mt-0.5">
          Tương tác và tab nhanh trực tiếp ngay trên widget màn hình chính.
        </p>
      </div>

      {/* Simulated Home Screen Surface */}
      <div className="p-4 sm:p-5 rounded-3xl bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-4">
        {/* Android Clock */}
        <div className="text-center py-2">
          <div className="text-4xl font-extrabold font-mono text-neutral-900 dark:text-white">
            08:30
          </div>
          <div className="text-xs text-neutral-500 mt-0.5">
            Thứ Hai, 12 Tháng 10
          </div>
        </div>

        {/* WIDGET 1: Quick Tap Widget 2x1 (Tab xong là tự biến mất, hiện thói quen tiếp theo) */}
        {primaryHabit ? (
          <div className="p-3.5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center justify-between transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white">
                <HabitIcon name={primaryHabit.icon} className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-neutral-900 dark:text-white">
                  {primaryHabit.title}
                </div>
                <div className="text-[11px] text-neutral-500 font-mono">
                  {primaryHabit.type === 'one_tap'
                    ? 'Chưa hoàn thành'
                    : `${primaryCount} / ${primaryHabit.targetCount || '∞'} lần`}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => tapHabit(primaryHabit.id, todayStr)}
              className="h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tab</span>
            </button>
          </div>
        ) : (
          <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm flex items-center justify-center gap-2 text-xs font-semibold text-neutral-600 dark:text-neutral-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Đã hoàn thành mọi thói quen hôm nay</span>
          </div>
        )}

        {/* WIDGET 2: Multi-Habit Widget 4x2 (Tab xong là tự biến mất khỏi danh sách widget) */}
        <div className="p-3.5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-sm space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-bold text-neutral-900 dark:text-white">
              HabitTap Widget (4x2)
            </span>
            <button
              onClick={() => setActiveTab('habits')}
              className="text-[11px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1"
            >
              <span>Vào app</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {activeHabits.length === 0 ? (
              <div className="p-4 text-center text-xs text-neutral-400">
                Tất cả thói quen đã hoàn thành hôm nay.
              </div>
            ) : (
              activeHabits.slice(0, 3).map((habit) => {
                const log = getHabitLogForDate(habit.id, todayStr);
                const count = log?.count || 0;

                return (
                  <div
                    key={habit.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-white dark:bg-neutral-700 flex items-center justify-center text-neutral-900 dark:text-white">
                        <HabitIcon name={habit.icon} className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-neutral-900 dark:text-white">
                          {habit.title}
                        </div>
                        <div className="text-[10px] text-neutral-400 font-mono">
                          {habit.type === 'one_tap'
                            ? '1-Tap'
                            : `${count}/${habit.targetCount || '∞'} lần`}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => tapHabit(habit.id, todayStr)}
                      className="h-7 px-2.5 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all active:scale-95 bg-neutral-200 dark:bg-neutral-700 text-neutral-900 dark:text-white hover:bg-neutral-300"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Tab</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
