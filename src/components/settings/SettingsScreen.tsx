import React, { useRef, useState } from 'react';
import { useHabit } from '../../context/HabitContext';
import { exportBackupData, parseBackupFile } from '../../utils/storage';

export const SettingsScreen: React.FC = () => {
  const { habits, logs, settings, updateSettings, restoreData, clearAllData } = useHabit();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleCreateBackup = () => {
    exportBackupData(habits, logs, settings);
    showToast('Đã tạo và tải tệp sao lưu dữ liệu');
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
          restoreData(parsed.habits, parsed.logs || [], parsed.settings);
          showToast('Phục hồi dữ liệu thành công');
        } else {
          alert('Tệp dữ liệu không hợp lệ');
        }
      } catch (err) {
        alert('Lỗi khi đọc tệp: ' + (err as Error).message);
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Toast Notification */}
      {toast && (
        <div className="p-3 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 text-xs font-semibold animate-in fade-in">
          {toast}
        </div>
      )}

      {/* Đúng 1 title đơn giản: Cài đặt */}
      <div className="py-2 px-1">
        <h2 className="text-lg font-bold text-neutral-900 dark:text-white">
          Cài đặt
        </h2>
      </div>

      {/* Tùy chỉnh thông báo & Âm thanh (không icon như yêu cầu: "Bỏ icon ở trong các settings") */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-4 space-y-4">
        <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
          Thông báo & Phản hồi
        </div>

        {/* Toggle thông báo */}
        <div className="flex items-center justify-between py-1">
          <div>
            <div className="text-sm font-medium text-neutral-950 dark:text-neutral-100">
              Nhắc nhở hàng ngày
            </div>
          </div>
          <button
            type="button"
            onClick={() => updateSettings({ notificationsEnabled: !settings.notificationsEnabled })}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.notificationsEnabled ? 'bg-neutral-900 dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full transition-transform ${
                settings.notificationsEnabled
                  ? 'translate-x-5 bg-white dark:bg-neutral-900'
                  : 'translate-x-0 bg-white dark:bg-neutral-300'
              }`}
            />
          </button>
        </div>

        {/* Giờ nhắc nhở */}
        <div className="flex items-center justify-between py-1 border-t border-neutral-100 dark:border-neutral-800">
          <div className="text-sm font-medium text-neutral-950 dark:text-neutral-100">
            Thời gian nhắc nhở
          </div>
          <input
            type="time"
            value={settings.notificationTime}
            onChange={(e) => updateSettings({ notificationTime: e.target.value })}
            className="px-2.5 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-xs font-mono font-medium text-neutral-900 dark:text-white border-none focus:outline-none"
          />
        </div>

        {/* Âm thanh */}
        <div className="flex items-center justify-between py-1 border-t border-neutral-100 dark:border-neutral-800">
          <div className="text-sm font-medium text-neutral-950 dark:text-neutral-100">
            Âm thanh khi tab
          </div>
          <button
            type="button"
            onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.soundEnabled ? 'bg-neutral-900 dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full transition-transform ${
                settings.soundEnabled
                  ? 'translate-x-5 bg-white dark:bg-neutral-900'
                  : 'translate-x-0 bg-white dark:bg-neutral-300'
              }`}
            />
          </button>
        </div>

        {/* Rung */}
        <div className="flex items-center justify-between py-1 border-t border-neutral-100 dark:border-neutral-800">
          <div className="text-sm font-medium text-neutral-950 dark:text-neutral-100">
            Rung phản hồi
          </div>
          <button
            type="button"
            onClick={() => updateSettings({ vibrationEnabled: !settings.vibrationEnabled })}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.vibrationEnabled ? 'bg-neutral-900 dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full transition-transform ${
                settings.vibrationEnabled
                  ? 'translate-x-5 bg-white dark:bg-neutral-900'
                  : 'translate-x-0 bg-white dark:bg-neutral-300'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Giao diện Dark mode / Sáng */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-4 space-y-3">
        <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
          Giao diện
        </div>
        <div className="flex items-center justify-between py-1">
          <div className="text-sm font-medium text-neutral-950 dark:text-neutral-100">
            Chế độ tối (Dark mode)
          </div>
          <button
            type="button"
            onClick={() => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' })}
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              settings.theme === 'dark' ? 'bg-neutral-900 dark:bg-white' : 'bg-neutral-200 dark:bg-neutral-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full transition-transform ${
                settings.theme === 'dark'
                  ? 'translate-x-5 bg-white dark:bg-neutral-900'
                  : 'translate-x-0 bg-white dark:bg-neutral-300'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Cài đặt ứng dụng vào điện thoại & Mã nguồn */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-4 space-y-3">
        <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
          Cài đặt & Mã nguồn
        </div>

        <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800 text-sm">
          <button
            type="button"
            onClick={() => {
              // Trigger PWA install or show instructions
              const deferredPrompt = (window as unknown as { deferredPrompt?: { prompt: () => void } }).deferredPrompt;
              if (deferredPrompt) {
                deferredPrompt.prompt();
              } else {
                showToast('Mở menu 3 chấm trên Chrome/Safari và chọn "Cài đặt ứng dụng"');
              }
            }}
            className="py-3 text-left font-medium text-neutral-900 dark:text-neutral-100 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            Cài đặt ứng dụng lên điện thoại (Màn hình chính)
          </button>
        </div>
      </div>

      {/* Phần Dữ liệu: 2 tab dọc là tạo sao lưu và phục hồi dữ liệu, xóa dữ liệu */}
      <div className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 p-4 space-y-3">
        <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
          Dữ liệu
        </div>

        <div className="flex flex-col divide-y divide-neutral-100 dark:divide-neutral-800 text-sm">
          {/* Tạo sao lưu */}
          <button
            type="button"
            onClick={handleCreateBackup}
            className="py-3 text-left font-medium text-neutral-900 dark:text-neutral-100 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            Tạo sao lưu
          </button>

          {/* Phục hồi dữ liệu */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="py-3 text-left font-medium text-neutral-900 dark:text-neutral-100 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            Phục hồi dữ liệu
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
            onClick={() => {
              if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ dữ liệu thói quen?')) {
                clearAllData();
                showToast('Đã xóa dữ liệu');
              }
            }}
            className="py-3 text-left font-medium text-rose-600 hover:text-rose-700 transition-colors"
          >
            Xóa dữ liệu
          </button>
        </div>
      </div>
    </div>
  );
};
