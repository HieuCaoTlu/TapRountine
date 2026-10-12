import React, { useState, useEffect } from 'react';
import { useHabit } from '../../context/HabitContext';
import {
  CheckCircle2,
  BarChart3,
  Settings,
  Plus,
  Wifi,
  BatteryCharging,
} from 'lucide-react';
import { CreateHabitModal } from '../habits/CreateHabitModal';

interface AndroidFrameProps {
  children: React.ReactNode;
}

export const AndroidFrame: React.FC<AndroidFrameProps> = ({ children }) => {
  const {
    activeTab,
    setActiveTab,
    isDarkMode,
    isCreateModalOpen,
    setIsCreateModalOpen,
    editingHabit,
    setEditingHabit,
    addHabit,
    updateHabit,
  } = useHabit();
  const [currentTime, setCurrentTime] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${h}:${m}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`min-h-screen ${
        isDarkMode ? 'dark bg-neutral-950 text-neutral-100' : 'bg-[#F8F9FA] text-neutral-900'
      } transition-colors py-2 sm:py-6 px-2 sm:px-4 flex flex-col items-center justify-start`}
    >
      {/* Top Header bar */}
      <header className="w-full max-w-md mx-auto flex items-center justify-between py-2 px-3 mb-2">
        <h1 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white">
          HabitTap
        </h1>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setActiveTab('widgets')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              activeTab === 'widgets'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800'
            }`}
          >
            Widget
          </button>

          <button
            onClick={() => setActiveTab('kotlin_code')}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
              activeTab === 'kotlin_code'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800'
            }`}
          >
            Mã nguồn
          </button>
        </div>
      </header>

      {/* Main Container / Mobile Device Screen */}
      <main className="w-full max-w-md relative flex-1 flex flex-col bg-white dark:bg-neutral-900 rounded-[36px] shadow-sm border border-neutral-200/80 dark:border-neutral-800 overflow-hidden min-h-[720px]">
        {/* Status Bar */}
        <div className="w-full px-5 pt-3 pb-1 flex items-center justify-between text-xs font-semibold select-none text-neutral-800 dark:text-neutral-200 z-10">
          <span className="font-mono">{currentTime}</span>
          <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 dark:bg-neutral-100" />
          <div className="flex items-center gap-1.5 font-mono text-[11px]">
            <span className="text-[10px] font-bold">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <BatteryCharging className="w-4 h-4" />
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          {children}
        </div>

        {/* Floating Menu & Circular Add Button (Space between về 2 phía) */}
        <div className="pointer-events-none sticky bottom-5 left-0 right-0 z-40 px-5 flex items-center justify-between">
          {/* Thanh menu bo tròn hoàn toàn (rounded-full), chỉ hiển thị icon */}
          <nav
            className="pointer-events-auto bg-white/90 dark:bg-neutral-900/90 backdrop-blur-2xl border border-neutral-200/90 dark:border-neutral-800 shadow-xl rounded-full p-1.5 flex items-center gap-1"
            role="navigation"
            aria-label="Điều hướng chính"
          >
            {/* Menu 1: Thói quen */}
            <button
              onClick={() => setActiveTab('habits')}
              title="Thói quen"
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                activeTab === 'habits'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs scale-105'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Menu 2: Tiến độ */}
            <button
              onClick={() => setActiveTab('stats')}
              title="Tiến độ"
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                activeTab === 'stats'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs scale-105'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-5 h-5 stroke-[2]" />
            </button>

            {/* Menu 3: Cài đặt */}
            <button
              onClick={() => setActiveTab('settings')}
              title="Cài đặt"
              className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                activeTab === 'settings'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs scale-105'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Settings className="w-5 h-5 stroke-[2]" />
            </button>
          </nav>

          {/* Nút thêm thói quen hình tròn nằm bên phải menu nổi, phong cách iPhone */}
          <button
            onClick={() => {
              setEditingHabit(null);
              setIsCreateModalOpen(true);
            }}
            title="Thêm thói quen mới"
            className="pointer-events-auto w-12 h-12 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
        </div>
      </main>

      {/* Global Create / Edit Habit Modal */}
      <CreateHabitModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingHabit(null);
        }}
        initialHabit={editingHabit}
        onSave={(data) => {
          if (editingHabit) {
            updateHabit({ ...editingHabit, ...data });
          } else {
            addHabit(data);
          }
        }}
      />
    </div>
  );
};
