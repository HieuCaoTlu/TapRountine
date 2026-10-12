export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateToLocal(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

export function formatVietnameseFullDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
  const dayName = days[date.getDay()];
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${dayName}, ngày ${day} tháng ${month}, ${year}`;
}

export function formatDayShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  return days[date.getDay()];
}

export function getDaysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Builds a 52-week calendar grid ending on the current week (or Saturday/Sunday).
 * Returns array of 7 rows (Mon to Sun) with 52 columns each, or 52 week columns.
 */
export interface HeatmapDay {
  date: string;
  dayOfWeek: number; // 0 for Mon ... 6 for Sun
  month: number;
  dayOfMonth: number;
  isToday: boolean;
  isFuture: boolean;
}

export interface HeatmapWeek {
  weekNumber: number;
  days: (HeatmapDay | null)[];
}

export function generate52WeeksHeatmap(weeksCount = 52): HeatmapWeek[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // We want the last week to end on the current week's Sunday
  // Sunday is day 0 in JS Date, let's treat Monday as 0, Sunday as 6
  const currentDayOfWeek = (today.getDay() + 6) % 7; // 0=Mon, 6=Sun

  // End date is Sunday of current week
  const endDate = new Date(today);
  endDate.setDate(today.getDate() + (6 - currentDayOfWeek));

  const totalDays = weeksCount * 7;
  const startDate = new Date(endDate);
  startDate.setDate(endDate.getDate() - totalDays + 1);

  const weeks: HeatmapWeek[] = [];
  let currentWeek: (HeatmapDay | null)[] = [];
  const iterDate = new Date(startDate);

  for (let i = 0; i < totalDays; i++) {
    const year = iterDate.getFullYear();
    const month = String(iterDate.getMonth() + 1).padStart(2, '0');
    const day = String(iterDate.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    
    const dayOfWeek = (iterDate.getDay() + 6) % 7; // 0=Mon, 6=Sun
    const isToday = iterDate.getTime() === today.getTime();
    const isFuture = iterDate.getTime() > today.getTime();

    currentWeek.push({
      date: dateStr,
      dayOfWeek,
      month: iterDate.getMonth(),
      dayOfMonth: iterDate.getDate(),
      isToday,
      isFuture,
    });

    if (currentWeek.length === 7) {
      weeks.push({
        weekNumber: weeks.length,
        days: [...currentWeek],
      });
      currentWeek = [];
    }

    iterDate.setDate(iterDate.getDate() + 1);
  }

  return weeks;
}

/**
 * Calculates current streak and longest streak from date-mapped completion statuses.
 */
export function calculateStreaks(completedDatesSet: Set<string>): { currentStreak: number; longestStreak: number } {
  if (completedDatesSet.size === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const todayStr = getTodayString();
  const yesterdayStr = getDaysAgo(1);

  // Current streak
  let currentStreak = 0;
  let checkDate = new Date();
  
  // Check if today or yesterday was completed
  if (!completedDatesSet.has(todayStr) && !completedDatesSet.has(yesterdayStr)) {
    currentStreak = 0;
  } else {
    // If not completed today, start checking from yesterday
    if (!completedDatesSet.has(todayStr)) {
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    while (true) {
      const year = checkDate.getFullYear();
      const month = String(checkDate.getMonth() + 1).padStart(2, '0');
      const day = String(checkDate.getDate()).padStart(2, '0');
      const str = `${year}-${month}-${day}`;
      
      if (completedDatesSet.has(str)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
  }

  // Longest streak
  const sortedDates = Array.from(completedDatesSet).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dStr of sortedDates) {
    const curDate = new Date(dStr + 'T00:00:00');
    if (!prevDate) {
      tempStreak = 1;
    } else {
      const diffTime = curDate.getTime() - prevDate.getTime();
      const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
      if (diffDays === 1) {
        tempStreak++;
      } else if (diffDays > 1) {
        tempStreak = 1;
      }
    }
    if (tempStreak > longestStreak) {
      longestStreak = tempStreak;
    }
    prevDate = curDate;
  }

  return { currentStreak, longestStreak: Math.max(longestStreak, currentStreak) };
}
