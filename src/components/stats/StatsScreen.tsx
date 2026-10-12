import React from 'react';
import { useHabit } from '../../context/HabitContext';
import { HabitIcon } from '../common/HabitIcon';
import { Habit, HabitLog } from '../../types';
import { calculateStreaks } from '../../utils/date';
import { Edit2, Trash2 } from 'lucide-react';

interface RoutineProgressCardProps {
  habit: Habit;
  logs: HabitLog[];
  onEdit: () => void;
  onDelete: () => void;
}

const RoutineProgressCard: React.FC<RoutineProgressCardProps> = ({
  habit,
  logs,
  onEdit,
  onDelete,
}) => {
  // Map of logs for this habit
  const habitLogsMap = new Map<string, HabitLog>();
  logs.filter((l) => l.habitId === habit.id).forEach((l) => habitLogsMap.set(l.date, l));

  // Calculate streak and total taps / completed days
  const completedDates = new Set<string>();
  let totalTaps = 0;
  habitLogsMap.forEach((l, dateStr) => {
    totalTaps += l.count;
    if (l.completed || l.count > 0) completedDates.add(dateStr);
  });
  const { currentStreak } = calculateStreaks(completedDates);

  // Bỏ hoàn toàn heatmap: Chỉ hiển thị số bên tay phải kèm giá trị Ngày, riêng counter & unlimited thì đếm số lần thay vì ngày
  const isCountBased = habit.type === 'n_tap' || habit.type === 'unlimited';
  const displayValue = isCountBased ? totalTaps : completedDates.size;
  const unitLabel = isCountBased ? 'Lần' : 'Ngày';

  return (
    <div className="p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-2xs hover:border-neutral-400 dark:hover:border-neutral-700 transition-all flex items-center justify-between">
      {/* Left: Icon & Title & Info */}
      <div className="flex items-center gap-3 min-w-0 pr-3">
        <div className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white shrink-0">
          <HabitIcon name={habit.icon} className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <h4 className="text-sm font-bold text-neutral-900 dark:text-white leading-tight truncate">
            {habit.title}
          </h4>
          <div className="text-xs text-neutral-500 font-normal mt-0.5 truncate">
            {isCountBased
              ? (habit.type === 'n_tap' ? `Mục tiêu ${habit.targetCount} lần/ngày` : 'Không giới hạn')
              : `Chuỗi ${currentStreak} ngày liên tiếp`}
          </div>
        </div>
      </div>

      {/* Right: Chỉ hiển thị số bên tay phải kèm giá trị Ngày hoặc Lần & nút Thao tác */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right flex items-baseline gap-1">
          <span className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white font-mono">
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
  );
};

export const StatsScreen: React.FC = () => {
  const { habits, logs, deleteHabit, setEditingHabit, setIsCreateModalOpen } = useHabit();

  return (
    <div className="space-y-4 pb-28">
      {/* Title đơn giản đúng 1 chữ: Tiến độ */}
      <div className="h-11 flex items-center px-1">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Tiến độ
        </h2>
      </div>

      {/* Danh sách tiến độ các thói quen */}
      <div className="space-y-2.5">
        {habits.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-neutral-900 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-800">
            <p className="text-xs text-neutral-500">Chưa có thói quen nào để hiển thị tiến độ.</p>
          </div>
        ) : (
          habits.map((habit) => (
            <RoutineProgressCard
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
