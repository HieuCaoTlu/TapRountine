import React, { useState } from 'react';
import { Habit, HabitType } from '../../types';
import { HABIT_ICONS_LIST, HabitIcon } from '../common/HabitIcon';
import { useHabit } from '../../context/HabitContext';
import { X, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';

interface CreateHabitModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (habitData: Omit<Habit, 'id' | 'createdAt'>) => void;
  initialHabit?: Habit | null;
}

export const CreateHabitModal: React.FC<CreateHabitModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialHabit,
}) => {
  const { deleteHabit } = useHabit();

  const [title, setTitle] = useState(initialHabit?.title || '');
  const [type, setType] = useState<HabitType>(initialHabit?.type || 'one_tap');
  const [targetCount, setTargetCount] = useState<number>(initialHabit?.targetCount || 5);
  const [icon, setIcon] = useState<string>(initialHabit?.icon || 'droplets');
  const [category, setCategory] = useState<string>(initialHabit?.category || 'Sức khỏe');
  const [reminderTime, setReminderTime] = useState<string>(initialHabit?.reminderTime || '');
  const [showIconPicker, setShowIconPicker] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  // Sync state if initialHabit changes
  React.useEffect(() => {
    if (initialHabit) {
      setTitle(initialHabit.title);
      setType(initialHabit.type);
      setTargetCount(initialHabit.targetCount || 5);
      setIcon(initialHabit.icon);
      setCategory(initialHabit.category || 'Sức khỏe');
      setReminderTime(initialHabit.reminderTime || '');
    } else {
      setTitle('');
      setType('one_tap');
      setTargetCount(5);
      setIcon('droplets');
      setCategory('Sức khỏe');
      setReminderTime('');
    }
  }, [initialHabit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      type,
      targetCount: type === 'one_tap' ? 1 : type === 'n_tap' ? Math.max(2, targetCount) : 0,
      icon,
      category,
      reminderTime: reminderTime || undefined,
    });
    onClose();
  };

  const handleDelete = () => {
    if (initialHabit && window.confirm(`Xóa thói quen "${initialHabit.title}"?`)) {
      deleteHabit(initialHabit.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-t-3xl sm:rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-800">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            {initialHabit ? 'Sửa thói quen' : 'Tạo thói quen'}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto custom-scrollbar">
          {/* Dòng 1 ở giữa: 1 hình vuông hiển thị biểu tượng, bấm vào để đổi */}
          <div className="flex flex-col items-center justify-center">
            <button
              type="button"
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="w-18 h-18 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-neutral-900 dark:hover:border-neutral-400 flex flex-col items-center justify-center text-neutral-900 dark:text-white transition-all group"
            >
              <HabitIcon name={icon} className="w-7 h-7 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] text-neutral-400 mt-0.5">Đổi icon</span>
            </button>

            {/* Icon picker grid */}
            {showIconPicker && (
              <div className="mt-3 w-full p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 animate-in fade-in">
                <div className="text-[11px] font-semibold text-neutral-500 mb-2">Chọn biểu tượng:</div>
                <div className="grid grid-cols-6 sm:grid-cols-7 gap-2 max-h-44 overflow-y-auto custom-scrollbar p-1">
                  {HABIT_ICONS_LIST.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setIcon(item.id);
                        setShowIconPicker(false);
                      }}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                        icon === item.id
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                          : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                      }`}
                      title={item.label}
                    >
                      <item.icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tên thói quen */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Tên thói quen
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Uống nước, Đọc sách..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white text-sm"
            />
          </div>

          {/* Chế độ Tab: One Tap, Counter Tab, Streak Tab */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Chế độ Tab
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setType('one_tap')}
                className={`py-2.5 px-3 rounded-xl border text-center font-medium text-xs transition-all ${
                  type === 'one_tap'
                    ? 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                    : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                One Tap
              </button>

              <button
                type="button"
                onClick={() => setType('n_tap')}
                className={`py-2.5 px-3 rounded-xl border text-center font-medium text-xs transition-all ${
                  type === 'n_tap'
                    ? 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                    : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                Counter Tab
              </button>

              <button
                type="button"
                onClick={() => setType('unlimited')}
                className={`py-2.5 px-3 rounded-xl border text-center font-medium text-xs transition-all ${
                  type === 'unlimited'
                    ? 'border-neutral-900 dark:border-white bg-neutral-900 dark:bg-white text-white dark:text-neutral-900'
                    : 'border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300'
                }`}
              >
                Streak Tab
              </button>
            </div>
          </div>

          {/* Số lần mục tiêu nếu là Counter Tab */}
          {type === 'n_tap' && (
            <div>
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Số lần mục tiêu
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTargetCount((prev) => Math.max(2, prev - 1))}
                  className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center font-bold text-base text-neutral-800 dark:text-neutral-200"
                >
                  -
                </button>
                <span className="text-lg font-bold font-mono text-neutral-900 dark:text-white w-12 text-center">
                  {targetCount}
                </span>
                <button
                  type="button"
                  onClick={() => setTargetCount((prev) => Math.min(100, prev + 1))}
                  className="w-10 h-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center font-bold text-base text-neutral-800 dark:text-neutral-200"
                >
                  +
                </button>
                <span className="text-xs text-neutral-400">lần/ngày</span>
              </div>
            </div>
          )}

          {/* PHần danh mục và nhắc nhở để ẩn lại thành tùy chọn nâng cao */}
          <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full text-xs font-semibold text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 py-1"
            >
              <span>Tùy chọn nâng cao</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-2 gap-3 pt-2 animate-in fade-in">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Danh mục
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 focus:outline-none text-xs"
                  >
                    <option value="Sức khỏe">Sức khỏe</option>
                    <option value="Trí tuệ">Trí tuệ</option>
                    <option value="Thể thao">Thể thao</option>
                    <option value="Tâm trí">Tâm trí</option>
                    <option value="Công việc">Công việc</option>
                    <option value="Đời sống">Đời sống</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                    Nhắc nhở
                  </label>
                  <input
                    type="time"
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 focus:outline-none text-xs font-mono"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center gap-2">
            {initialHabit && (
              <button
                type="button"
                onClick={handleDelete}
                className="py-3 px-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 flex items-center justify-center transition-colors"
                title="Xóa thói quen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              className="flex-1 py-3 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold transition-transform active:scale-98"
            >
              {initialHabit ? 'Lưu thay đổi' : 'Tạo thói quen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
