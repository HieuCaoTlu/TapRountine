import React, { useMemo } from 'react';
import { useHabit } from '../../context/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { Habit } from '../../types';
import { getTodayString } from '../../utils/date';
import { Plus, Check, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { triggerHaptic } from '../../utils/audio';

export const AndroidWidgetsShowcase: React.FC = () => {
  const {
    habits,
    tapHabit,
    getHabitLogForDate,
    setActiveTab,
    setIsCreateModalOpen,
    setEditingHabit,
  } = useHabit();
  const todayStr = getTodayString();

  // Rule: Lọc trạng thái thói quen
  const isHabitFinished = (habit: Habit) => {
    const log = getHabitLogForDate(habit.id, todayStr);
    const count = log?.count || 0;
    const isDone = log?.completed;

    return (
      (habit.type === 'one_tap' && (isDone || count >= 1)) ||
      (habit.type === 'n_tap' && count >= habit.targetCount)
    );
  };

  // Chia thói quen thành các hàng 4 ô trên 1 dòng
  const habitSlots = useMemo(() => {
    return habits.slice(0, 8); // Tối đa 2 hàng x 4 cột = chuẩn 4x2
  }, [habits]);

  const handleWidgetTap = (habit: Habit) => {
    triggerHaptic('heavy');
    tapHabit(habit.id, todayStr);
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Header đồng nhất */}
      <div className="h-11 flex items-center px-1">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Widget màn hình chính
        </h2>
      </div>

      <p className="text-xs text-neutral-500 px-1 -mt-2">
        Chuẩn Android Glance 4x2: Mỗi thói quen là 1 ô trong 4 ở cùng 1 dòng, chạm trực tiếp để tab.
      </p>

      {/* Simulated Android Home Screen Canvas */}
      <div className="p-4 sm:p-5 rounded-[36px] bg-neutral-100 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 space-y-4">
        {/* Android Clock & Date */}
        <div className="text-center pt-1 pb-1">
          <div className="text-4xl font-extrabold font-mono tracking-tight text-neutral-900 dark:text-white">
            08:45
          </div>
          <div className="text-xs text-neutral-500 mt-0.5 font-medium">
            Thứ Hai, 12 Tháng 10
          </div>
        </div>

        {/* WIDGET 4x2 HIỆN ĐẠI: Bo tròn mềm mại, 4 ô thói quen trên 1 dòng */}
        <div className="p-4 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl rounded-[32px] border border-neutral-200/90 dark:border-neutral-800 shadow-xl space-y-3">
          {/* Header của Widget */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-neutral-900 dark:bg-white animate-pulse" />
              <span className="text-xs font-bold text-neutral-900 dark:text-white">
                HabitTap 4x2
              </span>
            </div>
            <button
              onClick={() => setActiveTab('habits')}
              className="text-[11px] font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Mở ứng dụng</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {/* Hàng 1: 4 ô thói quen trong cùng 1 dòng (4 slots per row) */}
          {habits.length === 0 ? (
            <div className="p-6 text-center rounded-2xl bg-neutral-50 dark:bg-neutral-800/50 border border-dashed border-neutral-200 dark:border-neutral-700 space-y-2">
              <p className="text-xs text-neutral-500 font-medium">
                Chưa có thói quen nào. Tạo thói quen để hiển thị trên widget 4x2.
              </p>
              <button
                onClick={() => {
                  setEditingHabit(null);
                  setIsCreateModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold cursor-pointer"
              >
                + Thêm thói quen ngay
              </button>
            </div>
          ) : (
            <div className="space-y-2.5">
              {/* Dòng 1 (4 ô) */}
              <div className="grid grid-cols-4 gap-2">
                {[0, 1, 2, 3].map((index) => {
                  const habit = habitSlots[index];
                  if (!habit) {
                    return (
                      <button
                        key={`empty-${index}`}
                        onClick={() => {
                          setEditingHabit(null);
                          setIsCreateModalOpen(true);
                        }}
                        className="h-24 rounded-2xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 flex flex-col items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:border-neutral-400 transition-all cursor-pointer group"
                      >
                        <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] mt-1 font-medium">Thêm</span>
                      </button>
                    );
                  }

                  const log = getHabitLogForDate(habit.id, todayStr);
                  const count = log?.count || 0;
                  const isDone = isHabitFinished(habit);

                  return (
                    <button
                      key={habit.id}
                      onClick={() => handleWidgetTap(habit)}
                      title={`Chạm để tab: ${habit.title}`}
                      className={`
                        h-24 p-2 rounded-2xl flex flex-col items-center justify-between text-center transition-all cursor-pointer active:scale-95 shadow-2xs border
                        ${
                          isDone
                            ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white'
                            : 'bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-white border-neutral-200/80 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                        }
                      `}
                    >
                      {/* Icon */}
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center transition-transform ${
                          isDone
                            ? 'bg-white/20 dark:bg-neutral-900/20 text-white dark:text-neutral-900'
                            : 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-2xs'
                        }`}
                      >
                        {isDone ? (
                          <Check className="w-4 h-4 stroke-[3]" />
                        ) : (
                          <HabitIcon name={habit.icon} className="w-4 h-4" />
                        )}
                      </div>

                      {/* Tiêu đề ngắn gọn */}
                      <span className="text-[10px] font-semibold truncate w-full px-0.5 leading-tight">
                        {habit.title}
                      </span>

                      {/* Trạng thái / Số lần */}
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                          isDone
                            ? 'bg-white/20 dark:bg-neutral-900/20 text-white dark:text-neutral-900'
                            : 'bg-neutral-200/70 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                        }`}
                      >
                        {isDone
                          ? 'Xong'
                          : habit.type === 'one_tap'
                          ? 'Tab'
                          : `${count}/${habit.targetCount || '∞'}`}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Dòng 2 (Nếu có hơn 4 thói quen, hiển thị dòng thứ 2 hoàn thiện chuẩn 4x2) */}
              {habits.length > 4 && (
                <div className="grid grid-cols-4 gap-2 pt-1 border-t border-neutral-100 dark:border-neutral-800">
                  {[4, 5, 6, 7].map((index) => {
                    const habit = habitSlots[index];
                    if (!habit) return null;

                    const log = getHabitLogForDate(habit.id, todayStr);
                    const count = log?.count || 0;
                    const isDone = isHabitFinished(habit);

                    return (
                      <button
                        key={habit.id}
                        onClick={() => handleWidgetTap(habit)}
                        title={`Chạm để tab: ${habit.title}`}
                        className={`
                          h-24 p-2 rounded-2xl flex flex-col items-center justify-between text-center transition-all cursor-pointer active:scale-95 shadow-2xs border
                          ${
                            isDone
                              ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white'
                              : 'bg-neutral-50 dark:bg-neutral-800/80 text-neutral-900 dark:text-white border-neutral-200/80 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-700'
                          }
                        `}
                      >
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                            isDone
                              ? 'bg-white/20 dark:bg-neutral-900/20 text-white dark:text-neutral-900'
                              : 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white shadow-2xs'
                          }`}
                        >
                          {isDone ? (
                            <Check className="w-4 h-4 stroke-[3]" />
                          ) : (
                            <HabitIcon name={habit.icon} className="w-4 h-4" />
                          )}
                        </div>

                        <span className="text-[10px] font-semibold truncate w-full px-0.5 leading-tight">
                          {habit.title}
                        </span>

                        <span
                          className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full ${
                            isDone
                              ? 'bg-white/20 dark:bg-neutral-900/20 text-white dark:text-neutral-900'
                              : 'bg-neutral-200/70 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'
                          }`}
                        >
                          {isDone
                            ? 'Xong'
                            : habit.type === 'one_tap'
                            ? 'Tab'
                            : `${count}/${habit.targetCount || '∞'}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
