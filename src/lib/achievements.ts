// Achievements System
// Defines all unlockable badges and their conditions

export interface Achievement {
    id: string;
    name: string;
    icon: string;
    description: string;
    category: 'streak' | 'pr' | 'milestone' | 'strength';
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UnlockedAchievement {
    id: string;
    unlockedAt: string; // ISO date
}

// All available achievements
export const ACHIEVEMENTS: Achievement[] = [
    // Streak achievements
    { id: 'first_workout', name: 'First Steps', icon: '👟', description: 'Complete your first workout', category: 'milestone', rarity: 'common' },
    { id: 'streak_3', name: 'Building Momentum', icon: '🔥', description: 'Achieve a 3-day streak', category: 'streak', rarity: 'common' },
    { id: 'streak_7', name: 'On Fire', icon: '🔥', description: 'Achieve a 7-day streak', category: 'streak', rarity: 'rare' },
    { id: 'streak_14', name: 'Unstoppable', icon: '💥', description: 'Achieve a 14-day streak', category: 'streak', rarity: 'epic' },
    { id: 'streak_30', name: 'Iron Will', icon: '⚡', description: 'Achieve a 30-day streak', category: 'streak', rarity: 'legendary' },

    // PR achievements
    { id: 'pr_first', name: 'PR Hunter', icon: '🏆', description: 'Hit your first personal record', category: 'pr', rarity: 'common' },
    { id: 'pr_5', name: 'Record Setter', icon: '📈', description: 'Hit 5 personal records', category: 'pr', rarity: 'rare' },
    { id: 'pr_10', name: 'Record Breaker', icon: '💎', description: 'Hit 10 personal records', category: 'pr', rarity: 'epic' },
    { id: 'pr_25', name: 'PR Machine', icon: '🤖', description: 'Hit 25 personal records', category: 'pr', rarity: 'legendary' },

    // Strength milestones
    { id: 'bench_135', name: '1 Plate Bench', icon: '🛡️', description: 'Bench press 135 lbs', category: 'strength', rarity: 'common' },
    { id: 'bench_225', name: '2 Plate Club', icon: '⚔️', description: 'Bench press 225 lbs', category: 'strength', rarity: 'rare' },
    { id: 'bench_315', name: '3 Plate Bench', icon: '🗡️', description: 'Bench press 315 lbs', category: 'strength', rarity: 'epic' },
    { id: 'squat_225', name: '2 Plate Squat', icon: '🦵', description: 'Squat 225 lbs', category: 'strength', rarity: 'common' },
    { id: 'squat_315', name: '3 Plate Club', icon: '🔱', description: 'Squat 315 lbs', category: 'strength', rarity: 'rare' },
    { id: 'squat_405', name: '4 Plate Squat', icon: '👑', description: 'Squat 405 lbs', category: 'strength', rarity: 'epic' },
    { id: 'deadlift_315', name: '3 Plate Pull', icon: '🏋️', description: 'Deadlift 315 lbs', category: 'strength', rarity: 'common' },
    { id: 'deadlift_405', name: '4 Plate Club', icon: '💀', description: 'Deadlift 405 lbs', category: 'strength', rarity: 'rare' },
    { id: 'deadlift_495', name: '5 Plate Pull', icon: '🐉', description: 'Deadlift 495 lbs', category: 'strength', rarity: 'epic' },

    // Signal milestones
    { id: 'signal_1200', name: 'Operator', icon: '📶', description: 'Reach 1200 Signal', category: 'milestone', rarity: 'common' },
    { id: 'signal_1500', name: 'Vanguard', icon: '🚀', description: 'Reach 1500 Signal', category: 'milestone', rarity: 'rare' },
    { id: 'signal_2000', name: 'Elite Status', icon: '💫', description: 'Reach 2000 Signal', category: 'milestone', rarity: 'epic' },
    { id: 'signal_2500', name: 'Apex Predator', icon: '🦅', description: 'Reach 2500 Signal', category: 'milestone', rarity: 'legendary' },

    // Workout count
    { id: 'workouts_10', name: 'Getting Started', icon: '🎯', description: 'Complete 10 workouts', category: 'milestone', rarity: 'common' },
    { id: 'workouts_25', name: 'Dedicated', icon: '💪', description: 'Complete 25 workouts', category: 'milestone', rarity: 'rare' },
    { id: 'workouts_50', name: 'Gym Rat', icon: '🐀', description: 'Complete 50 workouts', category: 'milestone', rarity: 'epic' },
    { id: 'workouts_100', name: 'Century', icon: '💯', description: 'Complete 100 workouts', category: 'milestone', rarity: 'legendary' },
];

// Get rarity color
export function getRarityColor(rarity: Achievement['rarity']): string {
    switch (rarity) {
        case 'common': return '#9CA3AF';
        case 'rare': return '#3B82F6';
        case 'epic': return '#A855F7';
        case 'legendary': return '#FFD700';
    }
}

// Check which achievements should be unlocked
export function checkAchievements(
    currentlyUnlocked: string[],
    stats: {
        workoutCount: number;
        currentStreak: number;
        longestStreak: number;
        totalPRs: number;
        benchMax: number;
        squatMax: number;
        deadliftMax: number;
        signal: number;
    }
): string[] {
    const newUnlocks: string[] = [];

    const check = (id: string, condition: boolean) => {
        if (condition && !currentlyUnlocked.includes(id)) {
            newUnlocks.push(id);
        }
    };

    // Workout count
    check('first_workout', stats.workoutCount >= 1);
    check('workouts_10', stats.workoutCount >= 10);
    check('workouts_25', stats.workoutCount >= 25);
    check('workouts_50', stats.workoutCount >= 50);
    check('workouts_100', stats.workoutCount >= 100);

    // Streaks (use longest streak)
    check('streak_3', stats.longestStreak >= 3);
    check('streak_7', stats.longestStreak >= 7);
    check('streak_14', stats.longestStreak >= 14);
    check('streak_30', stats.longestStreak >= 30);

    // PRs
    check('pr_first', stats.totalPRs >= 1);
    check('pr_5', stats.totalPRs >= 5);
    check('pr_10', stats.totalPRs >= 10);
    check('pr_25', stats.totalPRs >= 25);

    // Bench milestones
    check('bench_135', stats.benchMax >= 135);
    check('bench_225', stats.benchMax >= 225);
    check('bench_315', stats.benchMax >= 315);

    // Squat milestones
    check('squat_225', stats.squatMax >= 225);
    check('squat_315', stats.squatMax >= 315);
    check('squat_405', stats.squatMax >= 405);

    // Deadlift milestones
    check('deadlift_315', stats.deadliftMax >= 315);
    check('deadlift_405', stats.deadliftMax >= 405);
    check('deadlift_495', stats.deadliftMax >= 495);

    // Signal milestones
    check('signal_1200', stats.signal >= 1200);
    check('signal_1500', stats.signal >= 1500);
    check('signal_2000', stats.signal >= 2000);
    check('signal_2500', stats.signal >= 2500);

    return newUnlocks;
}

// Get achievement by ID
export function getAchievement(id: string): Achievement | undefined {
    return ACHIEVEMENTS.find(a => a.id === id);
}
