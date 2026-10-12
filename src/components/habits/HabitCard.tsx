import React, { useRef } from 'react';
import { Habit, HabitLog } from '../../types';
import { HabitIcon } from '../common/HabitIcon';
import { Check, Plus } from 'lucide-react';
import { triggerHaptic } from '../../utils/audio';

interface HabitCardProps {
  habit: Habit;
  log?: HabitLog;
  onTap: () => void;
  onEdit: () => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  log,
  onTap,
  onEdit,
}) => {
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggered = useRef(false);

  const count = log?.count || 0;
  const isCompleted = log?.completed || false;

  // Handle long press to open edit modal
  const handlePointerDown = () => {
    isLongPressTriggered.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggered.current = true;
      triggerHaptic('medium');
      onEdit();
    }, 550);
  };

  const handlePointerUpOrLeave = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUpOrLeave}
      onPointerLeave={handlePointerUpOrLeave}
      onContextMenu={(e) => {
        e.preventDefault();
        onEdit();
      }}
      title="Nhấn giữ để chỉnh sửa hoặc xóa"
      className="relative flex items-center justify-between p-3.5 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-700 transition-all shadow-2xs select-none cursor-pointer active:scale-[0.99]"
    >
      {/* Left: Square Icon + Title + Tap count info */}
      <div className="flex items-center gap-3.5 min-w-0 pointer-events-none">
        {/* Square Icon */}
        <div className="w-11 h-11 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-neutral-900 dark:text-white shrink-0">
          <HabitIcon name={habit.icon} className="w-5 h-5" />
        </div>

        {/* Title & Count */}
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 truncate">
            {habit.title}
          </h3>

          {/* If N-tap (Counter Tab) or Unlimited (Streak Tab), display count below */}
          {habit.type === 'n_tap' && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
              {count} / {habit.targetCount} lần
            </p>
          )}

          {habit.type === 'unlimited' && (
            <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono">
              {count} lần
            </p>
          )}
        </div>
      </div>

      {/* Right: Tab Button (stops propagation so pressing Tab won't trigger card long-press) */}
      <div
        className="shrink-0"
        onPointerDown={(e) => e.stopPropagation()}
        onPointerUp={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onTap();
          }}
          className={`
            h-10 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-95
            ${
              isCompleted
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700'
            }
          `}
        >
          {habit.type === 'one_tap' ? (
            isCompleted ? (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Xong</span>
              </>
            ) : (
              <span>Tab</span>
            )
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Tab</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
