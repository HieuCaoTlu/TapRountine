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
import { triggerHaptic } from '../../utils/audio';

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
            onClick={() => {
              setActiveTab('widgets');
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'widgets'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200/50 dark:hover:bg-neutral-800'
            }`}
          >
            Widget
          </button>

          <button
            onClick={() => {
              setActiveTab('kotlin_code');
            }}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'kotlin_code'
                ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
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

        {/* Content Body with slide animation on menu change */}
        <div className="flex-1 p-4 overflow-y-auto custom-scrollbar">
          <div key={activeTab} className="animate-menu-slide">
            {children}
          </div>
        </div>

        {/* Floating Menu & Circular Add Button (Rộng hơn 20%, bo tròn hoàn toàn) */}
        <div className="pointer-events-none sticky bottom-5 left-0 right-0 z-40 px-4 flex items-center justify-between gap-3">
          {/* Thanh menu bo tròn nổi bồng bềnh, các nút menu mở rộng 20% (w-[68px]) */}
          <nav
            className="pointer-events-auto bg-white/95 dark:bg-neutral-900/95 backdrop-blur-2xl border border-neutral-200/90 dark:border-neutral-800 shadow-xl rounded-full p-2 flex items-center gap-1.5"
            role="navigation"
            aria-label="Điều hướng chính"
          >
            {/* Menu 1: Thói quen */}
            <button
              onClick={() => {
                setActiveTab('habits');
              }}
              title="Thói quen"
              className={`w-[66px] h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                activeTab === 'habits'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs scale-105'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* Menu 2: Tiến độ */}
            <button
              onClick={() => {
                setActiveTab('stats');
              }}
              title="Tiến độ"
              className={`w-[66px] h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs scale-105'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-5 h-5 stroke-[2.2]" />
            </button>

            {/* Menu 3: Cài đặt */}
            <button
              onClick={() => {
                setActiveTab('settings');
              }}
              title="Cài đặt"
              className={`w-[66px] h-12 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                activeTab === 'settings'
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs scale-105'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Settings className="w-5 h-5 stroke-[2.2]" />
            </button>
          </nav>

          {/* Nút thêm thói quen hình tròn nằm bên phải (rộng và đã tay) */}
          <button
            onClick={() => {
              setEditingHabit(null);
              setIsCreateModalOpen(true);
            }}
            title="Thêm thói quen mới"
            className="pointer-events-auto w-14 h-14 rounded-full bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all shrink-0 cursor-pointer"
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
