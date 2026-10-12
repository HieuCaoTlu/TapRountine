/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { HabitProvider, useHabit } from './context/HabitContext';
import { AndroidFrame } from './components/android/AndroidFrame';
import { HabitListScreen } from './components/habits/HabitListScreen';
import { StatsScreen } from './components/stats/StatsScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { AndroidWidgetsShowcase } from './components/widgets/AndroidWidgetsShowcase';
import { KotlinCodeViewer } from './components/kotlin/KotlinCodeViewer';

const AppContent: React.FC = () => {
  const { activeTab } = useHabit();

  return (
    <AndroidFrame>
      {activeTab === 'habits' && <HabitListScreen />}
      {activeTab === 'stats' && <StatsScreen />}
      {activeTab === 'settings' && <SettingsScreen />}
      {activeTab === 'widgets' && <AndroidWidgetsShowcase />}
      {activeTab === 'kotlin_code' && <KotlinCodeViewer />}
    </AndroidFrame>
  );
};

export default function App() {
  return (
    <HabitProvider>
      <AppContent />
    </HabitProvider>
  );
}
