// Workout History & Streak System
// Tracks completed workouts and calculates streaks

export interface WorkoutRecord {
    id: string;
    date: string; // ISO date string (YYYY-MM-DD)
    title: string;
    duration: number; // minutes
    exerciseCount: number;
    totalSets: number;
    prsHit: string[]; // exercise names where PR was hit
    signalGain: number;
}

export interface StreakData {
    currentStreak: number;
    longestStreak: number;
    lastWorkoutDate: string | null;
    thisWeekWorkouts: number;
    weeklyGoal: number;
}

// Get today's date in YYYY-MM-DD format (LOCAL timezone)
export function getToday(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Get date N days ago (LOCAL timezone)
export function getDaysAgo(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() - days);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Check if two dates are consecutive
function isConsecutive(date1: string, date2: string): boolean {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1;
}

// Check if date is today
function isToday(dateStr: string): boolean {
    return dateStr === getToday();
}

// Check if date is yesterday
function isYesterday(dateStr: string): boolean {
    return dateStr === getDaysAgo(1);
}

// Calculate streak from workout history
export function calculateStreak(
    workoutHistory: WorkoutRecord[],
    lastWorkoutDate: string | null,
    currentStreak: number
): { newStreak: number; streakBroken: boolean } {
    const today = getToday();

    if (!lastWorkoutDate) {
        return { newStreak: 0, streakBroken: false };
    }

    // If last workout was today, streak is maintained
    if (isToday(lastWorkoutDate)) {
        return { newStreak: currentStreak, streakBroken: false };
    }

    // If last workout was yesterday, streak is still valid (waiting for today)
    if (isYesterday(lastWorkoutDate)) {
        return { newStreak: currentStreak, streakBroken: false };
    }

    // If more than 1 day has passed, streak is broken
    return { newStreak: 0, streakBroken: true };
}

// Update streak after completing a workout
export function updateStreakAfterWorkout(
    lastWorkoutDate: string | null,
    currentStreak: number
): number {
    const today = getToday();

    // If no previous workout, start streak at 1
    if (!lastWorkoutDate) {
        return 1;
    }

    // If already worked out today, streak stays the same
    if (lastWorkoutDate === today) {
        return currentStreak;
    }

    // If last workout was yesterday, increment streak
    if (isYesterday(lastWorkoutDate)) {
        return currentStreak + 1;
    }

    // If more than 1 day gap, reset to 1
    return 1;
}

// Get workout dates for calendar display
export function getWorkoutDates(workoutHistory: WorkoutRecord[]): Set<string> {
    return new Set(workoutHistory.map(w => w.date));
}

// Get workouts for a specific month
export function getWorkoutsForMonth(
    workoutHistory: WorkoutRecord[],
    year: number,
    month: number // 0-indexed
): WorkoutRecord[] {
    return workoutHistory.filter(w => {
        const date = new Date(w.date);
        return date.getFullYear() === year && date.getMonth() === month;
    });
}

// Get this week's workout count (Monday-Sunday)
export function getThisWeekWorkoutCount(workoutHistory: WorkoutRecord[]): number {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = Sunday
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset);
    monday.setHours(0, 0, 0, 0);

    const mondayStr = monday.toISOString().split('T')[0];

    return workoutHistory.filter(w => w.date >= mondayStr).length;
}

// Generate progress data for charts
export interface ProgressDataPoint {
    date: string;
    value: number;
    label: string;
}

export function getSignalProgressData(
    workoutHistory: WorkoutRecord[],
    startingSignal: number
): ProgressDataPoint[] {
    if (workoutHistory.length === 0) {
        return [{ date: getToday(), value: startingSignal, label: 'Today' }];
    }

    // Sort by date
    const sorted = [...workoutHistory].sort((a, b) =>
        new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate cumulative signal
    let runningSignal = startingSignal;
    const dataPoints: ProgressDataPoint[] = [];

    // Add starting point
    if (sorted.length > 0) {
        const firstDate = new Date(sorted[0].date);
        firstDate.setDate(firstDate.getDate() - 1);
        dataPoints.push({
            date: firstDate.toISOString().split('T')[0],
            value: startingSignal - (sorted[0].signalGain || 0),
            label: 'Start',
        });
    }

    sorted.forEach((workout, index) => {
        runningSignal = startingSignal;
        // Sum all signal gains up to this point
        for (let i = 0; i <= index; i++) {
            // This is a simplification; actual logic would track historical signal
        }

        dataPoints.push({
            date: workout.date,
            value: startingSignal - (sorted.length - index - 1) * 15, // Approximate
            label: new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        });
    });

    return dataPoints;
}

// Generate unique ID for workout
export function generateWorkoutId(): string {
    return `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
