import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { calculateInitialSignal } from '../lib/eloService';
import { WorkoutRecord, updateStreakAfterWorkout, getThisWeekWorkoutCount, getToday } from '../lib/workoutHistory';
import { checkAchievements, UnlockedAchievement } from '../lib/achievements';

interface OnboardingData {
    gender: 'male' | 'female' | null;
    bodyweight: number | null;
    benchMax: number | null;
    squatMax: number | null;
    deadliftMax: number | null;
    pullups: number | null;
    experience: 'beginner' | 'intermediate' | 'advanced' | null;
    experienceLevel: 'never' | 'beginner' | 'intermediate' | 'experienced' | 'advanced' | null;
    goal: 'strength' | 'aesthetics' | 'endurance' | null;
    goals: string[];
    daysPerWeek: number;
    focusAreas: string[];
    isOnboarded: boolean;
    strataSignal: number;
    // Workout history
    workoutHistory: WorkoutRecord[];
    currentStreak: number;
    longestStreak: number;
    lastWorkoutDate: string | null;
    // Achievements
    unlockedAchievements: UnlockedAchievement[];
    totalPRs: number;
    // Muscle progress (0-100 per muscle)
    muscleProgress: Record<string, number>;
    // Exercise history for PRs
    exerciseHistory: Record<string, { maxWeight: number; maxReps: number; lastUsed: string }>;
}

interface OnboardingContextType {
    data: OnboardingData;
    updateData: (updates: Partial<OnboardingData>) => void;
    completeOnboarding: () => void;
    resetOnboarding: () => void;
    addWorkoutRecord: (record: Omit<WorkoutRecord, 'id'>) => void;
    getStreakData: () => { currentStreak: number; longestStreak: number; thisWeekWorkouts: number; weeklyGoal: number };
}

const defaultData: OnboardingData = {
    gender: null,
    bodyweight: null,
    benchMax: null,
    squatMax: null,
    deadliftMax: null,
    pullups: null,
    experience: null,
    experienceLevel: null,
    goal: null,
    goals: [],
    daysPerWeek: 4,
    focusAreas: [],
    isOnboarded: false,
    strataSignal: 1000,
    // Workout history defaults
    workoutHistory: [],
    currentStreak: 0,
    longestStreak: 0,
    lastWorkoutDate: null,
    // Achievements defaults
    unlockedAchievements: [],
    totalPRs: 0,
    // Muscle progress defaults
    muscleProgress: {},
    exerciseHistory: {},
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// DEMO MODE - Set to true for video recording, false for production
const DEMO_MODE = false;

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
    const [data, setData] = useState<OnboardingData>(defaultData);
    const [isLoading, setIsLoading] = useState(true);

    // Load data on mount
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        // Skip AsyncStorage in demo mode - always use demo data
        if (DEMO_MODE) {
            setData(defaultData);
            setIsLoading(false);
            return;
        }

        try {
            const jsonValue = await AsyncStorage.getItem('@strata_user_data');
            if (jsonValue != null) {
                const parsed = JSON.parse(jsonValue);
                // Ensure new fields have defaults
                setData({
                    ...defaultData,
                    ...parsed,
                    workoutHistory: parsed.workoutHistory || [],
                    currentStreak: parsed.currentStreak || 0,
                    longestStreak: parsed.longestStreak || 0,
                    lastWorkoutDate: parsed.lastWorkoutDate || null,
                });
            }
        } catch (e) {
            console.error('Failed to load user data', e);
        } finally {
            setIsLoading(false);
        }
    };

    const saveData = async (newData: OnboardingData) => {
        try {
            const jsonValue = JSON.stringify(newData);
            await AsyncStorage.setItem('@strata_user_data', jsonValue);
        } catch (e) {
            console.error('Failed to save user data', e);
        }
    };

    const updateData = (updates: Partial<OnboardingData>) => {
        setData(prev => {
            const newData = { ...prev, ...updates };

            // Recalculate Signal if Big 3 or BW changes
            if (
                updates.benchMax !== undefined ||
                updates.squatMax !== undefined ||
                updates.deadliftMax !== undefined ||
                updates.bodyweight !== undefined
            ) {
                if (newData.benchMax && newData.squatMax && newData.deadliftMax && newData.bodyweight) {
                    const newSignal = calculateInitialSignal({
                        squat: newData.squatMax,
                        bench: newData.benchMax,
                        deadlift: newData.deadliftMax,
                        bodyweight: newData.bodyweight,
                    });
                    newData.strataSignal = newSignal;
                }
            }

            saveData(newData);
            return newData;
        });
    };

    const addWorkoutRecord = (record: Omit<WorkoutRecord, 'id'>) => {
        setData(prev => {
            const newRecord: WorkoutRecord = {
                ...record,
                id: `workout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            };

            const newHistory = [...prev.workoutHistory, newRecord];
            const newStreak = updateStreakAfterWorkout(prev.lastWorkoutDate, prev.currentStreak);
            const newLongestStreak = Math.max(prev.longestStreak, newStreak);
            const newTotalPRs = prev.totalPRs + record.prsHit.length;

            // Check for newly unlocked achievements
            const currentUnlockedIds = prev.unlockedAchievements.map(a => a.id);
            const newUnlockIds = checkAchievements(currentUnlockedIds, {
                workoutCount: newHistory.length,
                currentStreak: newStreak,
                longestStreak: newLongestStreak,
                totalPRs: newTotalPRs,
                benchMax: prev.benchMax || 0,
                squatMax: prev.squatMax || 0,
                deadliftMax: prev.deadliftMax || 0,
                signal: prev.strataSignal,
            });

            const newUnlockedAchievements = [
                ...prev.unlockedAchievements,
                ...newUnlockIds.map(id => ({
                    id,
                    unlockedAt: new Date().toISOString(),
                })),
            ];

            const newData: OnboardingData = {
                ...prev,
                workoutHistory: newHistory,
                currentStreak: newStreak,
                longestStreak: newLongestStreak,
                lastWorkoutDate: record.date,
                totalPRs: newTotalPRs,
                unlockedAchievements: newUnlockedAchievements,
            };

            saveData(newData);
            return newData;
        });
    };

    const getStreakData = () => {
        return {
            currentStreak: data.currentStreak,
            longestStreak: data.longestStreak,
            thisWeekWorkouts: getThisWeekWorkoutCount(data.workoutHistory),
            weeklyGoal: 4, // Default weekly goal
        };
    };

    const completeOnboarding = () => {
        let finalData = { ...data, isOnboarded: true };

        if (finalData.benchMax && finalData.squatMax && finalData.deadliftMax && finalData.bodyweight) {
            finalData.strataSignal = calculateInitialSignal({
                squat: finalData.squatMax,
                bench: finalData.benchMax,
                deadlift: finalData.deadliftMax,
                bodyweight: finalData.bodyweight,
            });
        }

        setData(finalData);
        saveData(finalData);
    };

    const resetOnboarding = async () => {
        try {
            await AsyncStorage.removeItem('@strata_user_data');
            setData(defaultData);
        } catch (e) {
            console.error('Failed to clear data', e);
        }
    };

    if (isLoading) {
        return null;
    }

    return (
        <OnboardingContext.Provider value={{
            data,
            updateData,
            completeOnboarding,
            resetOnboarding,
            addWorkoutRecord,
            getStreakData,
        }}>
            {children}
        </OnboardingContext.Provider>
    );
}

export function useOnboarding() {
    const context = useContext(OnboardingContext);
    if (context === undefined) {
        throw new Error('useOnboarding must be used within an OnboardingProvider');
    }
    return context;
}
