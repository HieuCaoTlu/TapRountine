import React from 'react';
import { useHabit } from '../../context/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { Habit, HabitLog } from '../../types';
import { generate52WeeksHeatmap, calculateStreaks } from '../../utils/date';
import { Edit2, Trash2 } from 'lucide-react';

interface MiniRoutineCardProps {
  habit: Habit;
  logs: HabitLog[];
  onEdit: () => void;
  onDelete: () => void;
}

const MiniRoutineCard: React.FC<MiniRoutineCardProps> = ({
  habit,
  logs,
  onEdit,
  onDelete,
}) => {
  // 14 weeks mini heatmap (compact & clean)
  const weeksData = generate52WeeksHeatmap(14);

  // Map of logs for this habit
  const habitLogsMap = new Map<string, HabitLog>();
  logs.filter((l) => l.habitId === habit.id).forEach((l) => habitLogsMap.set(l.date, l));

  // Calculate streak and total taps
  const completedDates = new Set<string>();
  let totalTaps = 0;
  habitLogsMap.forEach((l, dateStr) => {
    totalTaps += l.count;
    if (l.completed || l.count > 0) completedDates.add(dateStr);
  });
  const { currentStreak } = calculateStreaks(completedDates);

  // Hiển thị số bên tay phải kèm giá trị Ngày, riêng habit counter và unlimited thì đếm số lần thay vì ngày
  const isCountBased = habit.type === 'n_tap' || habit.type === 'unlimited';
  const displayValue = isCountBased ? totalTaps : completedDates.size;
  const unitLabel = isCountBased ? 'Lần' : 'Ngày';

  return (
    <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 space-y-3 shadow-2xs hover:border-neutral-400 dark:hover:border-neutral-700 transition-all">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white shrink-0">
            <HabitIcon name={habit.icon} className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight">
              {habit.title}
            </h4>
            <div className="text-xs text-neutral-500 font-normal mt-0.5">
              {isCountBased
                ? (habit.type === 'n_tap' ? `Mục tiêu ${habit.targetCount} lần/ngày` : 'Không giới hạn')
                : `Chuỗi ${currentStreak} ngày liên tiếp`}
            </div>
          </div>
        </div>

        {/* Số bên tay phải kèm giá trị Ngày / Lần & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="text-right flex items-baseline gap-1">
            <span className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white font-mono">
              {displayValue}
            </span>
            <span className="text-xs font-semibold text-neutral-500">
              {unitLabel}
            </span>
          </div>

          <div className="flex items-center gap-0.5 border-l border-neutral-200/60 dark:border-neutral-800 pl-2">
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="Chỉnh sửa thói quen"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
              title="Xóa thói quen"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Mini Heatmap: Gọn gàng, nhỏ nhắn */}
      <div className="overflow-x-auto custom-scrollbar pt-1 pb-1">
        <div className="flex gap-1 min-w-fit">
          {weeksData.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1">
              {week.days.map((day, dIdx) => {
                if (!day || day.isFuture) {
                  return (
                    <div
                      key={dIdx}
                      className="w-[14px] h-[14px] sm:w-[16px] sm:h-[16px] rounded-[3px] bg-neutral-100 dark:bg-neutral-800/40 opacity-40"
                    />
                  );
                }

                const log = habitLogsMap.get(day.date);
                const count = log?.count || 0;
                const isCompleted = log?.completed || false;

                // Color cell intensity theo chuẩn GitHub
                let bgClass = 'bg-neutral-100 dark:bg-neutral-800';
                if (isCountBased) {
                  if (count >= 8) bgClass = 'bg-neutral-900 dark:bg-white';
                  else if (count >= 5) bgClass = 'bg-neutral-800 dark:bg-neutral-200';
                  else if (count >= 2) bgClass = 'bg-neutral-500 dark:bg-neutral-400';
                  else if (count === 1) bgClass = 'bg-neutral-300 dark:bg-neutral-600';
                } else {
                  if (isCompleted || count > 0) {
                    bgClass = 'bg-neutral-900 dark:bg-white';
                  }
                }

                return (
                  <div
                    key={dIdx}
                    title={`${day.date}: ${count} ${isCountBased ? 'lần' : 'ngày'}`}
                    className={`
                      w-[14px] h-[14px] sm:w-[16px] sm:h-[16px] rounded-[3px] select-none transition-all
                      ${bgClass}
                    `}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const StatsScreen: React.FC = () => {
  const { habits, logs, deleteHabit, setEditingHabit, setIsCreateModalOpen } = useHabit();

  return (
    <div className="space-y-4 pb-28">
      {/* Title đơn giản đúng 1 chữ: Tiến độ, chiều cao h-11 chuẩn đồng nhất */}
      <div className="h-11 flex items-center px-1">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Tiến độ
        </h2>
      </div>

      {/* Mỗi thói quen có 1 màn hình routine thu nhỏ riêng */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
            <p className="text-xs text-neutral-500">Chưa có thói quen nào để hiển thị tiến độ.</p>
          </div>
        ) : (
          habits.map((habit) => (
            <MiniRoutineCard
              key={habit.id}
              habit={habit}
              logs={logs}
              onEdit={() => {
                setEditingHabit(habit);
                setIsCreateModalOpen(true);
              }}
              onDelete={() => {
                if (window.confirm(`Xóa thói quen "${habit.title}"?`)) {
                  deleteHabit(habit.id);
                }
              }}
            />
          ))
        )}
      </div>
    </div>
  );
};
