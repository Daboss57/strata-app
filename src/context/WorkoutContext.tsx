import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import type { Exercise, GeneratedWorkout } from '../lib/geminiService';

export interface LoggedSet {
    weight: number;
    reps: number;
    rpe?: number;
    isPR?: boolean;
    timestamp: Date;
}

export interface LoggedExercise {
    name: string;
    sets: LoggedSet[];
}

export interface WorkoutSession {
    id: string;
    date: Date;
    title: string;
    focus: string;
    exercises: LoggedExercise[];
    duration?: number;
    completed: boolean;
    prsHit: string[]; // Track which exercises had PRs
}

export interface ExercisePR {
    name: string;
    weight: number;
    reps: number;
    estimated1RM: number;
    date: Date;
}

export interface LastSessionData {
    [exerciseName: string]: {
        weight: number;
        reps: number;
    };
}

// Callback for when a Big 3 PR is hit
export type OnBig3PRCallback = (lift: 'squat' | 'bench' | 'deadlift', new1RM: number) => void;

interface WorkoutContextType {
    currentWorkout: GeneratedWorkout | null;
    setCurrentWorkout: (workout: GeneratedWorkout | null) => void;
    activeSession: WorkoutSession | null;
    startSession: (workout: GeneratedWorkout) => void;
    endSession: () => WorkoutSession | null;
    logSet: (exerciseName: string, set: Omit<LoggedSet, 'isPR' | 'timestamp'>) => { isPR: boolean; estimated1RM: number };
    workoutHistory: WorkoutSession[];
    personalRecords: Record<string, ExercisePR>;
    lastSessionData: LastSessionData;
    sessionPRs: string[]; // PRs hit in current session
    setOnBig3PR: (callback: OnBig3PRCallback) => void;
}

const WorkoutContext = createContext<WorkoutContextType | undefined>(undefined);

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Estimate 1RM using Brzycki formula
function estimate1RM(weight: number, reps: number): number {
    if (reps === 1) return weight;
    if (reps > 12) reps = 12; // Cap at 12 for accuracy
    return Math.round(weight * (36 / (37 - reps)));
}

// Map exercise names to Big 3 lifts
function getBig3Type(exerciseName: string): 'squat' | 'bench' | 'deadlift' | null {
    const name = exerciseName.toLowerCase();
    if (name.includes('squat') && !name.includes('split') && !name.includes('bulgarian') && !name.includes('hack')) {
        return 'squat';
    }
    if ((name.includes('bench') && name.includes('press')) || name === 'bench press' || name === 'bench') {
        return 'bench';
    }
    if (name.includes('deadlift') && !name.includes('romanian') && !name.includes('rdl') && !name.includes('stiff')) {
        return 'deadlift';
    }
    return null;
}

export function WorkoutProvider({ children }: { children: ReactNode }) {
    const [currentWorkout, setCurrentWorkout] = useState<GeneratedWorkout | null>(null);
    const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
    const [workoutHistory, setWorkoutHistory] = useState<WorkoutSession[]>([]);
    const [personalRecords, setPersonalRecords] = useState<Record<string, ExercisePR>>({});
    const [lastSessionData, setLastSessionData] = useState<LastSessionData>({});
    const [sessionPRs, setSessionPRs] = useState<string[]>([]);
    const [onBig3PRCallback, setOnBig3PRCallback] = useState<OnBig3PRCallback | null>(null);

    const setOnBig3PR = useCallback((callback: OnBig3PRCallback) => {
        setOnBig3PRCallback(() => callback);
    }, []);

    const startSession = useCallback((workout: GeneratedWorkout) => {
        const session: WorkoutSession = {
            id: generateId(),
            date: new Date(),
            title: workout.title,
            focus: workout.focus,
            exercises: workout.exercises.map(ex => ({
                name: ex.name,
                sets: [],
            })),
            completed: false,
            prsHit: [],
        };
        setActiveSession(session);
        setCurrentWorkout(workout);
        setSessionPRs([]);
    }, []);

    const endSession = useCallback((): WorkoutSession | null => {
        if (!activeSession) return null;

        const completedSession: WorkoutSession = {
            ...activeSession,
            completed: true,
            duration: Math.round((Date.now() - activeSession.date.getTime()) / 60000),
            prsHit: sessionPRs,
        };

        setWorkoutHistory(prev => [completedSession, ...prev]);

        // Update last session data for ghost stats
        const newLastData: LastSessionData = {};
        activeSession.exercises.forEach(ex => {
            if (ex.sets.length > 0) {
                // Use the heaviest set as ghost data
                const heaviestSet = ex.sets.reduce((best, set) =>
                    estimate1RM(set.weight, set.reps) > estimate1RM(best.weight, best.reps) ? set : best
                );
                newLastData[ex.name] = {
                    weight: heaviestSet.weight,
                    reps: heaviestSet.reps,
                };
            }
        });
        setLastSessionData(prev => ({ ...prev, ...newLastData }));

        setActiveSession(null);
        setCurrentWorkout(null);
        setSessionPRs([]);

        return completedSession;
    }, [activeSession, sessionPRs]);

    const logSet = useCallback((
        exerciseName: string,
        set: Omit<LoggedSet, 'isPR' | 'timestamp'>
    ): { isPR: boolean; estimated1RM: number } => {
        const estimated1RM = estimate1RM(set.weight, set.reps);
        const currentPR = personalRecords[exerciseName];

        // Check if this is a PR (beats previous estimated 1RM)
        const isPR = !currentPR || estimated1RM > currentPR.estimated1RM;

        const newSet: LoggedSet = {
            ...set,
            isPR,
            timestamp: new Date(),
        };

        // Update active session
        setActiveSession(prev => {
            if (!prev) return null;
            return {
                ...prev,
                exercises: prev.exercises.map(ex =>
                    ex.name === exerciseName
                        ? { ...ex, sets: [...ex.sets, newSet] }
                        : ex
                ),
            };
        });

        // If PR, update records and notify
        if (isPR) {
            const newPR: ExercisePR = {
                name: exerciseName,
                weight: set.weight,
                reps: set.reps,
                estimated1RM,
                date: new Date(),
            };

            setPersonalRecords(prev => ({
                ...prev,
                [exerciseName]: newPR,
            }));

            setSessionPRs(prev =>
                prev.includes(exerciseName) ? prev : [...prev, exerciseName]
            );

            // Check if this is a Big 3 lift and notify
            const big3Type = getBig3Type(exerciseName);
            if (big3Type && onBig3PRCallback) {
                onBig3PRCallback(big3Type, estimated1RM);
            }
        }

        return { isPR, estimated1RM };
    }, [personalRecords, onBig3PRCallback]);

    return (
        <WorkoutContext.Provider value={{
            currentWorkout,
            setCurrentWorkout,
            activeSession,
            startSession,
            endSession,
            logSet,
            workoutHistory,
            personalRecords,
            lastSessionData,
            sessionPRs,
            setOnBig3PR,
        }}>
            {children}
        </WorkoutContext.Provider>
    );
}

export function useWorkout() {
    const context = useContext(WorkoutContext);
    if (!context) {
        throw new Error('useWorkout must be used within WorkoutProvider');
    }
    return context;
}
