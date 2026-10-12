import React, { useState, useEffect } from 'react';
import { Habit, HabitType } from '../../types';
import { HABIT_ICONS_LIST, HabitIcon } from '../common/HabitIcon';
import { useHabit } from '../../context/HabitContext';
import { X, ChevronDown, ChevronUp, Trash2, Check } from 'lucide-react';
import { triggerHaptic } from '../../utils/audio';

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

  const [title, setTitle] = useState('');
  const [type, setType] = useState<HabitType>('one_tap');
  const [targetCount, setTargetCount] = useState<number>(5);
  const [icon, setIcon] = useState<string>('droplets');
  const [category, setCategory] = useState<string>('Sức khỏe');
  const [reminderTime, setReminderTime] = useState<string>('');
  const [showIconPicker, setShowIconPicker] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);

  useEffect(() => {
    if (initialHabit) {
      setTitle(initialHabit.title);
      setType(initialHabit.type);
      setTargetCount(initialHabit.targetCount || 5);
      setIcon(initialHabit.icon || 'droplets');
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
    setShowIconPicker(false);
    setShowAdvanced(false);
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
    if (!initialHabit) return;
    if (window.confirm(`Bạn có chắc chắn muốn xóa thói quen "${initialHabit.title}"?`)) {
      deleteHabit(initialHabit.id);
      onClose();
    }
  };

  const selectedIconObj = HABIT_ICONS_LIST.find((item) => item.id === icon) || HABIT_ICONS_LIST[0];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-t-[32px] sm:rounded-[32px] border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-5 border-b border-neutral-100 dark:border-neutral-800 shrink-0">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            {initialHabit ? 'Sửa thói quen' : 'Tạo thói quen mới'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto custom-scrollbar flex-1">
          {/* Biểu tượng Vector Thật (34+ icon phong phú) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                Biểu tượng thói quen: <span className="font-bold text-neutral-900 dark:text-white">{selectedIconObj.label}</span>
              </label>
              <span className="text-[11px] text-neutral-400">Chọn 1 trong 35 icon</span>
            </div>

            {/* Khay chọn biểu tượng Vector Thật dạng lưới cuộn mượt */}
            <div className="p-2.5 rounded-2xl bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700">
              <div className="grid grid-cols-7 gap-2 max-h-44 overflow-y-auto custom-scrollbar p-1">
                {HABIT_ICONS_LIST.map((item) => {
                  const isSelected = icon === item.id;
                  const IconComponent = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIcon(item.id);
                      }}
                      className={`h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-md ring-2 ring-neutral-900 dark:ring-white scale-105'
                          : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-600'
                      }`}
                      title={item.label}
                    >
                      <IconComponent className="w-5 h-5 stroke-[2]" />
                    </button>
                  );
                })}
              </div>
            </div>
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
              placeholder="VD: Uống nước, Đọc sách, Tập gym..."
              className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-white text-sm"
            />
          </div>

          {/* Chế độ Tab: One Tap, Counter Tab, Streak Tab (Màu app tối giản monochrome, không dùng màu hệ thống) */}
          <div>
            <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
              Chế độ Tab
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  setType('one_tap');
                }}
                className={`py-2.5 px-2 rounded-xl text-center font-bold text-xs transition-all cursor-pointer border ${
                  type === 'one_tap'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200/80 dark:border-neutral-700 hover:bg-neutral-200/80 dark:hover:bg-neutral-700'
                }`}
              >
                One Tap
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  setType('n_tap');
                }}
                className={`py-2.5 px-2 rounded-xl text-center font-bold text-xs transition-all cursor-pointer border ${
                  type === 'n_tap'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200/80 dark:border-neutral-700 hover:bg-neutral-200/80 dark:hover:bg-neutral-700'
                }`}
              >
                Counter Tab
              </button>

              <button
                type="button"
                onClick={() => {
                  triggerHaptic('medium');
                  setType('unlimited');
                }}
                className={`py-2.5 px-2 rounded-xl text-center font-bold text-xs transition-all cursor-pointer border ${
                  type === 'unlimited'
                    ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-xs'
                    : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200/80 dark:border-neutral-700 hover:bg-neutral-200/80 dark:hover:bg-neutral-700'
                }`}
              >
                Streak Tab
              </button>
            </div>
          </div>

          {/* Số lần mục tiêu nếu là Counter Tab */}
          {type === 'n_tap' && (
            <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-200/60 dark:border-neutral-700">
              <label className="block text-xs font-semibold text-neutral-700 dark:text-neutral-300 mb-1.5">
                Số lần mục tiêu trong ngày
              </label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setTargetCount((prev) => Math.max(2, prev - 1));
                  }}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 flex items-center justify-center font-bold text-base text-neutral-900 dark:text-white cursor-pointer active:scale-95"
                >
                  -
                </button>
                <span className="text-lg font-bold font-mono text-neutral-900 dark:text-white w-12 text-center">
                  {targetCount}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setTargetCount((prev) => Math.min(100, prev + 1));
                  }}
                  className="w-10 h-10 rounded-xl bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 flex items-center justify-center font-bold text-base text-neutral-900 dark:text-white cursor-pointer active:scale-95"
                >
                  +
                </button>
                <span className="text-xs text-neutral-400 font-medium">lần/ngày</span>
              </div>
            </div>
          )}

          {/* Tùy chọn nâng cao (Danh mục & Giờ nhắc nhở) */}
          <div className="pt-1 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setShowAdvanced(!showAdvanced);
              }}
              className="flex items-center justify-between w-full text-xs font-semibold text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-200 py-1 cursor-pointer"
            >
              <span>Tùy chọn nâng cao (Danh mục & Nhắc nhở)</span>
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-2 gap-3 pt-2 animate-in fade-in duration-150">
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

          {/* Action Buttons: Nút XÓA thói quen rõ ràng và Nút Lưu */}
          <div className="pt-3 flex flex-col sm:flex-row items-center gap-2.5">
            {initialHabit && (
              <button
                type="button"
                onClick={handleDelete}
                className="w-full sm:w-auto py-3 px-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center gap-2 text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                <Trash2 className="w-4 h-4" />
                <span>Xóa thói quen</span>
              </button>
            )}
            <button
              type="submit"
              className="w-full flex-1 py-3 px-5 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-bold transition-transform active:scale-98 cursor-pointer shadow-sm text-center"
            >
              {initialHabit ? 'Lưu thay đổi' : 'Tạo thói quen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
