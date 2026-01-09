// TypeScript type definitions for STRATA

export type Gender = 'male' | 'female';
export type LiftType = 'squat' | 'bench' | 'deadlift';

export interface User {
    id: string;
    email: string | null;
    display_name: string | null;
    gender: Gender | null;
    bodyweight: number | null;
    height: number | null;
    strength_elo: number;
    onboarding_completed: boolean;
    created_at: string;
    updated_at: string;
}

export interface StrengthStandard {
    id: number;
    gender: Gender;
    bodyweight_class: number;
    lift_type: LiftType;
    tier_5_cutoff: number;
    tier_4_cutoff: number;
    tier_3_cutoff: number;
    tier_2_cutoff: number;
    tier_1_cutoff: number;
}

export interface UserLift {
    id: number;
    user_id: string;
    lift_type: LiftType;
    weight: number;
    dots_score: number | null;
    tier: number | null;
    is_pr: boolean;
    recorded_at: string;
}

export interface Workout {
    id: number;
    user_id: string;
    started_at: string;
    completed_at: string | null;
    total_volume: number | null;
    elo_change: number;
    notes: string | null;
}

export interface WorkoutSet {
    id: number;
    workout_id: number;
    exercise_name: string;
    set_number: number;
    weight: number;
    reps: number;
    rpe: number | null;
    is_pr: boolean;
    created_at: string;
}

export interface StrengthProfile {
    squat: {
        weight: number;
        tier: number;
        dotsScore: number;
    };
    bench: {
        weight: number;
        tier: number;
        dotsScore: number;
    };
    deadlift: {
        weight: number;
        tier: number;
        dotsScore: number;
    };
    total: number;
    totalDots: number;
    strongestLift: LiftType;
    weakestLift: LiftType;
    overallTier: number;
}

export interface OnboardingData {
    gender: Gender;
    bodyweight: number;
    height: number;
    knowsMaxes: boolean;
    squatMax: number | null;
    benchMax: number | null;
    deadliftMax: number | null;
    // If they don't know maxes, use rep-based input
    squatWeight?: number;
    squatReps?: number;
    benchWeight?: number;
    benchReps?: number;
    deadliftWeight?: number;
    deadliftReps?: number;
}
