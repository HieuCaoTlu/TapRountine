import React, { useRef, useState } from 'react';
import { useHabit } from '../../context/HabitContext';
import { exportBackupData, parseBackupFile } from '../../utils/storage';
import { soundEffects, triggerHaptic } from '../../utils/audio';

export const SettingsScreen: React.FC = () => {
  const { habits, logs, settings, updateSettings, restoreData, clearAllData } = useHabit();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleToggleNotifications = async () => {
    triggerHaptic('medium');
    const nextState = !settings.notificationsEnabled;
    if (nextState) {
      try {
        if ('Notification' in window) {
          const perm = await Notification.requestPermission();
          if (perm === 'granted') {
            updateSettings({ notificationsEnabled: true });
            showToast('Đã kích hoạt thông báo nhắc nhở');
          } else {
            // Still allow app internal flag
            updateSettings({ notificationsEnabled: true });
            showToast('Đã bật nhắc nhở trong ứng dụng');
          }
        } else {
          updateSettings({ notificationsEnabled: true });
          showToast('Đã bật nhắc nhở');
        }
      } catch {
        updateSettings({ notificationsEnabled: true });
        showToast('Đã bật nhắc nhở');
      }
    } else {
      updateSettings({ notificationsEnabled: false });
      showToast('Đã tắt thông báo nhắc nhở');
    }
  };

  const handleToggleSound = () => {
    const nextState = !settings.soundEnabled;
    updateSettings({ soundEnabled: nextState });
    if (nextState) {
      soundEffects.playTap();
      triggerHaptic('light');
      showToast('Đã bật âm thanh tab');
    } else {
      showToast('Đã tắt âm thanh');
    }
  };

  const handleToggleVibration = () => {
    const nextState = !settings.vibrationEnabled;
    updateSettings({ vibrationEnabled: nextState });
    if (nextState) {
      triggerHaptic('heavy');
      showToast('Đã bật rung phản hồi cực đã');
    } else {
      showToast('Đã tắt rung');
    }
  };

  const handleToggleDarkMode = () => {
    triggerHaptic('medium');
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: nextTheme });
    showToast(nextTheme === 'dark' ? 'Đã bật chế độ tối' : 'Đã bật chế độ sáng');
  };

  const handleCreateBackup = () => {
    try {
      triggerHaptic('heavy');
      exportBackupData(habits, logs, settings);
      showToast('Đã xuất và tải tệp sao lưu JSON');
    } catch (err) {
      showToast('Lỗi khi xuất sao lưu: ' + (err as Error).message);
    }
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseBackupFile(text);
        if (parsed.habits && Array.isArray(parsed.habits)) {
          triggerHaptic('heavy');
          restoreData(parsed.habits, parsed.logs || [], parsed.settings);
          showToast('Phục hồi dữ liệu thành công!');
        } else {
          showToast('Tệp sao lưu không đúng định dạng!');
        }
      } catch (err) {
        showToast('Lỗi đọc tệp: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClearAll = () => {
    triggerHaptic('heavy');
    if (window.confirm('CẢNH BÁO: Bạn có chắc chắn muốn xóa toàn bộ dữ liệu thói quen và lịch sử tab? Thao tác này không thể hoàn tác.')) {
      clearAllData();
      showToast('Đã xóa sạch toàn bộ dữ liệu');
    }
  };

  return (
    <div className="space-y-4 pb-28">
      {/* Toast Notification */}
      {toast && (
        <div className="p-3.5 rounded-2xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold shadow-xl animate-in fade-in duration-150">
          {toast}
        </div>
      )}

      {/* Header chuẩn: Chiều cao h-11 và font size đồng nhất tuyệt đối với màn hình Tiến độ */}
      <div className="h-11 flex items-center px-1">
        <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
          Cài đặt
        </h2>
      </div>

      {/* Tùy chỉnh thông báo & Âm thanh & Rung */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-4 space-y-4 shadow-2xs">
        <div className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
          Thông báo & Phản hồi
        </div>

        {/* Toggle thông báo */}
        <div className="flex items-center justify-between py-1">
          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Nhắc nhở hàng ngày
          </div>
          <button
            type="button"
            onClick={handleToggleNotifications}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              settings.notificationsEnabled ? 'bg-neutral-900 dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full transition-transform ${
                settings.notificationsEnabled
                  ? 'translate-x-6 bg-white dark:bg-neutral-900'
                  : 'translate-x-0 bg-white dark:bg-neutral-300'
              }`}
            />
          </button>
        </div>

        {/* Giờ nhắc nhở */}
        <div className="flex items-center justify-between py-1 border-t border-neutral-100 dark:border-neutral-800">
          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Thời gian nhắc nhở
          </div>
          <input
            type="time"
            value={settings.notificationTime}
            onChange={(e) => {
              updateSettings({ notificationTime: e.target.value });
              showToast(`Đã đổi giờ nhắc: ${e.target.value}`);
            }}
            className="px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-mono font-medium text-neutral-900 dark:text-white border-none focus:outline-none"
          />
        </div>

        {/* Âm thanh */}
        <div className="flex items-center justify-between py-1 border-t border-neutral-100 dark:border-neutral-800">
          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Âm thanh khi tab
          </div>
          <button
            type="button"
            onClick={handleToggleSound}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              settings.soundEnabled ? 'bg-neutral-900 dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full transition-transform ${
                settings.soundEnabled
                  ? 'translate-x-6 bg-white dark:bg-neutral-900'
                  : 'translate-x-0 bg-white dark:bg-neutral-300'
              }`}
            />
          </button>
        </div>

        {/* Rung phản hồi */}
        <div className="flex items-center justify-between py-1 border-t border-neutral-100 dark:border-neutral-800">
          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Rung phản hồi (Haptic đã tay)
          </div>
          <button
            type="button"
            onClick={handleToggleVibration}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              settings.vibrationEnabled ? 'bg-neutral-900 dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full transition-transform ${
                settings.vibrationEnabled
                  ? 'translate-x-6 bg-white dark:bg-neutral-900'
                  : 'translate-x-0 bg-white dark:bg-neutral-300'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Giao diện Dark mode / Sáng */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-4 space-y-3 shadow-2xs">
        <div className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
          Giao diện
        </div>
        <div className="flex items-center justify-between py-1">
          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
            Chế độ tối (Dark mode)
          </div>
          <button
            type="button"
            onClick={handleToggleDarkMode}
            className={`w-12 h-6 rounded-full transition-colors relative p-0.5 cursor-pointer ${
              settings.theme === 'dark' ? 'bg-neutral-900 dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full transition-transform ${
                settings.theme === 'dark'
                  ? 'translate-x-6 bg-white dark:bg-neutral-900'
                  : 'translate-x-0 bg-white dark:bg-neutral-300'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Phần Dữ liệu: hiển thị đúng 2 tab dọc là tạo sao lưu và phục hồi dữ liệu, xóa dữ liệu */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-4 space-y-3 shadow-2xs">
        <div className="text-[11px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
          Dữ liệu
        </div>

        <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800 text-sm">
          {/* Tạo sao lưu */}
          <button
            type="button"
            onClick={handleCreateBackup}
            className="py-3 text-left font-medium text-neutral-900 dark:text-neutral-100 hover:text-neutral-500 transition-colors cursor-pointer"
          >
            Tạo sao lưu (Xuất file JSON)
          </button>

          {/* Phục hồi dữ liệu */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-3 text-left font-medium text-neutral-900 dark:text-neutral-100 hover:text-neutral-500 transition-colors cursor-pointer"
          >
            Phục hồi dữ liệu (Chọn file JSON)
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleRestoreFile}
            className="hidden"
          />

          {/* Xóa dữ liệu */}
          <button
            type="button"
            onClick={handleClearAll}
            className="py-3 text-left font-semibold text-rose-600 hover:text-rose-700 transition-colors cursor-pointer"
          >
            Xóa sạch dữ liệu (Reset ứng dụng)
          </button>
        </div>
      </div>
    </div>
  );
};
