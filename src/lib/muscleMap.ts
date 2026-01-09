// Exercise-to-Muscle Mapping
// Maps each exercise to the muscles it works with a contribution factor (0-1)

export type MuscleId =
    | 'chest' | 'front_delts' | 'side_delts' | 'rear_delts'
    | 'lats' | 'upper_back' | 'lower_back' | 'traps'
    | 'biceps' | 'triceps' | 'forearms'
    | 'quads' | 'hamstrings' | 'glutes' | 'calves'
    | 'abs' | 'obliques';

export interface MuscleContribution {
    [muscleId: string]: number; // 0-1 contribution factor
}

// Complete exercise → muscle mapping
export const EXERCISE_MUSCLE_MAP: Record<string, MuscleContribution> = {
    // CHEST
    'Bench Press': { chest: 1.0, triceps: 0.6, front_delts: 0.4 },
    'Incline Bench Press': { chest: 0.9, front_delts: 0.6, triceps: 0.5 },
    'Decline Bench Press': { chest: 1.0, triceps: 0.5, front_delts: 0.3 },
    'Dumbbell Bench Press': { chest: 1.0, triceps: 0.5, front_delts: 0.4 },
    'Incline Dumbbell Press': { chest: 0.9, front_delts: 0.6, triceps: 0.5 },
    'Dumbbell Fly': { chest: 1.0, front_delts: 0.3 },
    'Cable Fly': { chest: 1.0, front_delts: 0.2 },
    'Push Ups': { chest: 0.9, triceps: 0.6, front_delts: 0.4 },
    'Chest Dips': { chest: 0.9, triceps: 0.7, front_delts: 0.4 },

    // BACK
    'Deadlift': { lower_back: 1.0, glutes: 0.8, hamstrings: 0.8, traps: 0.5, lats: 0.4 },
    'Barbell Row': { lats: 1.0, upper_back: 0.8, biceps: 0.6, rear_delts: 0.5 },
    'Dumbbell Row': { lats: 1.0, upper_back: 0.7, biceps: 0.5, rear_delts: 0.4 },
    'Lat Pulldown': { lats: 1.0, biceps: 0.6, upper_back: 0.5, rear_delts: 0.3 },
    'Pull Ups': { lats: 1.0, biceps: 0.7, upper_back: 0.6, rear_delts: 0.3 },
    'Chin Ups': { lats: 0.9, biceps: 0.9, upper_back: 0.5 },
    'Seated Cable Row': { lats: 0.9, upper_back: 0.8, biceps: 0.5, rear_delts: 0.4 },
    'T-Bar Row': { lats: 1.0, upper_back: 0.8, biceps: 0.5 },
    'Face Pulls': { rear_delts: 1.0, upper_back: 0.6, traps: 0.4 },

    // SHOULDERS
    'Overhead Press': { front_delts: 1.0, side_delts: 0.6, triceps: 0.5 },
    'Military Press': { front_delts: 1.0, side_delts: 0.6, triceps: 0.5 },
    'Dumbbell Shoulder Press': { front_delts: 1.0, side_delts: 0.7, triceps: 0.5 },
    'Arnold Press': { front_delts: 0.9, side_delts: 0.8, triceps: 0.4 },
    'Lateral Raise': { side_delts: 1.0, traps: 0.3 },
    'Front Raise': { front_delts: 1.0 },
    'Rear Delt Fly': { rear_delts: 1.0, upper_back: 0.3 },
    'Upright Row': { side_delts: 0.8, traps: 0.8, front_delts: 0.4 },

    // ARMS
    'Barbell Curl': { biceps: 1.0, forearms: 0.4 },
    'Dumbbell Curl': { biceps: 1.0, forearms: 0.3 },
    'Hammer Curl': { biceps: 0.9, forearms: 0.6 },
    'Preacher Curl': { biceps: 1.0 },
    'Concentration Curl': { biceps: 1.0 },
    'Cable Curl': { biceps: 1.0, forearms: 0.3 },
    'Tricep Pushdown': { triceps: 1.0 },
    'Skull Crushers': { triceps: 1.0 },
    'Overhead Tricep Extension': { triceps: 1.0 },
    'Tricep Dips': { triceps: 1.0, chest: 0.3 },
    'Close Grip Bench': { triceps: 0.9, chest: 0.6 },
    'Diamond Push Ups': { triceps: 0.9, chest: 0.5 },

    // LEGS
    'Squat': { quads: 1.0, glutes: 0.8, hamstrings: 0.5, lower_back: 0.4 },
    'Back Squat': { quads: 1.0, glutes: 0.8, hamstrings: 0.5, lower_back: 0.4 },
    'Front Squat': { quads: 1.0, glutes: 0.6, abs: 0.5 },
    'Leg Press': { quads: 1.0, glutes: 0.6, hamstrings: 0.4 },
    'Hack Squat': { quads: 1.0, glutes: 0.5 },
    'Lunges': { quads: 0.9, glutes: 0.8, hamstrings: 0.5 },
    'Bulgarian Split Squat': { quads: 1.0, glutes: 0.9, hamstrings: 0.4 },
    'Leg Extension': { quads: 1.0 },
    'Leg Curl': { hamstrings: 1.0 },
    'Romanian Deadlift': { hamstrings: 1.0, glutes: 0.9, lower_back: 0.6 },
    'Stiff Leg Deadlift': { hamstrings: 1.0, glutes: 0.8, lower_back: 0.5 },
    'Hip Thrust': { glutes: 1.0, hamstrings: 0.5 },
    'Glute Bridge': { glutes: 1.0, hamstrings: 0.4 },
    'Calf Raise': { calves: 1.0 },
    'Seated Calf Raise': { calves: 1.0 },

    // CORE
    'Plank': { abs: 0.9, obliques: 0.5 },
    'Crunches': { abs: 1.0 },
    'Sit Ups': { abs: 0.9, hip_flexors: 0.5 },
    'Leg Raises': { abs: 1.0, hip_flexors: 0.6 },
    'Hanging Leg Raises': { abs: 1.0, forearms: 0.3 },
    'Russian Twists': { obliques: 1.0, abs: 0.5 },
    'Cable Woodchops': { obliques: 1.0, abs: 0.5 },
    'Ab Wheel Rollout': { abs: 1.0, lats: 0.3 },
};

// Get muscles worked by an exercise (with fallback for unknown exercises)
export function getExerciseMuscles(exerciseName: string): MuscleContribution {
    // Try exact match
    if (EXERCISE_MUSCLE_MAP[exerciseName]) {
        return EXERCISE_MUSCLE_MAP[exerciseName];
    }

    // Try case-insensitive match
    const lowerName = exerciseName.toLowerCase();
    for (const [name, muscles] of Object.entries(EXERCISE_MUSCLE_MAP)) {
        if (name.toLowerCase() === lowerName) {
            return muscles;
        }
    }

    // Try partial match
    for (const [name, muscles] of Object.entries(EXERCISE_MUSCLE_MAP)) {
        if (lowerName.includes(name.toLowerCase()) || name.toLowerCase().includes(lowerName)) {
            return muscles;
        }
    }

    // Default: guess based on keywords
    if (lowerName.includes('bench') || lowerName.includes('chest') || lowerName.includes('push')) {
        return { chest: 0.8, triceps: 0.5, front_delts: 0.4 };
    }
    if (lowerName.includes('row') || lowerName.includes('pull') || lowerName.includes('back')) {
        return { lats: 0.8, biceps: 0.5, upper_back: 0.5 };
    }
    if (lowerName.includes('squat') || lowerName.includes('leg') || lowerName.includes('quad')) {
        return { quads: 0.8, glutes: 0.5 };
    }
    if (lowerName.includes('curl') || lowerName.includes('bicep')) {
        return { biceps: 1.0 };
    }
    if (lowerName.includes('tricep') || lowerName.includes('pushdown') || lowerName.includes('skull')) {
        return { triceps: 1.0 };
    }
    if (lowerName.includes('shoulder') || lowerName.includes('press') || lowerName.includes('delt')) {
        return { front_delts: 0.7, side_delts: 0.6 };
    }

    return {}; // Unknown exercise
}

// Calculate volume score for a set
export function calculateSetVolume(weight: number, reps: number): number {
    // Volume = weight * reps (simplified tonnage)
    return weight * reps;
}

// Update muscle progress based on workout data
export function updateMuscleProgress(
    currentProgress: Record<string, number>,
    exercises: { name: string; sets: { weight: number; reps: number }[] }[]
): Record<string, number> {
    const muscleVolume: Record<string, number> = {};

    // Calculate volume contribution per muscle
    for (const exercise of exercises) {
        const muscles = getExerciseMuscles(exercise.name);

        for (const set of exercise.sets) {
            const setVolume = calculateSetVolume(set.weight, set.reps);

            for (const [muscle, contribution] of Object.entries(muscles)) {
                muscleVolume[muscle] = (muscleVolume[muscle] || 0) + (setVolume * contribution);
            }
        }
    }

    // Convert volume to progress points (logarithmic scale)
    const newProgress = { ...currentProgress };
    for (const [muscle, volume] of Object.entries(muscleVolume)) {
        const volumePoints = Math.log10(volume + 1) * 5; // Log scale, 5 points per order of magnitude
        const currentLevel = newProgress[muscle] || 0;
        // Slow progression: gain diminishes as level increases
        const gain = volumePoints / (1 + currentLevel / 50);
        newProgress[muscle] = Math.min(100, currentLevel + gain);
    }

    return newProgress;
}

// Get overall muscle balance score
export function getMuscleBalance(progress: Record<string, number>): {
    score: number;
    weakest: string[];
    strongest: string[];
} {
    const values = Object.values(progress);
    if (values.length === 0) {
        return { score: 0, weakest: [], strongest: [] };
    }

    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    const sorted = Object.entries(progress).sort((a, b) => a[1] - b[1]);

    return {
        score: Math.round(avg),
        weakest: sorted.slice(0, 3).map(([m]) => m),
        strongest: sorted.slice(-3).reverse().map(([m]) => m),
    };
}

// Legacy function: Get muscle tiers from Big 3 lifts for MuscleMapSVG
// Maps squat/bench/deadlift tiers to body part tiers
export function getMuscleTiersFromBig3(
    squatTier: number,
    benchTier: number,
    deadliftTier: number
): Record<string, number> {
    return {
        // Upper body - mostly bench
        chest: benchTier,
        frontDelt: benchTier,
        sideDelt: Math.round((benchTier + squatTier) / 2), // OHP carryover
        rearDelt: deadliftTier,
        biceps: deadliftTier, // Row carryover
        triceps: benchTier,
        forearms: Math.round((deadliftTier + benchTier) / 2),

        // Back - mostly deadlift
        lats: deadliftTier,
        upperBack: deadliftTier,
        lowerBack: deadliftTier,
        traps: deadliftTier,

        // Lower body - mostly squat
        quads: squatTier,
        hamstrings: Math.round((squatTier + deadliftTier) / 2),
        glutes: Math.round((squatTier + deadliftTier) / 2),
        calves: squatTier,

        // Core - all three contribute
        abs: Math.round((squatTier + deadliftTier) / 2),
        obliques: Math.round((squatTier + deadliftTier) / 2),
    };
}

// Muscle group type for the body graph components
export type MuscleGroup =
    | 'chest' | 'shoulders' | 'back' | 'traps' | 'biceps' | 'triceps' | 'forearms'
    | 'core' | 'quads' | 'hamstrings' | 'glutes' | 'calves';

// Mapping from detailed muscle IDs to muscle groups
const MUSCLE_ID_TO_GROUP: Record<string, MuscleGroup> = {
    chest: 'chest',
    front_delts: 'shoulders',
    side_delts: 'shoulders',
    rear_delts: 'shoulders',
    lats: 'back',
    upper_back: 'back',
    lower_back: 'back',
    traps: 'traps',
    biceps: 'biceps',
    triceps: 'triceps',
    forearms: 'forearms',
    quads: 'quads',
    hamstrings: 'hamstrings',
    glutes: 'glutes',
    calves: 'calves',
    abs: 'core',
    obliques: 'core',
};

// Convert muscle progress (0-100 scale) to tiers (1-5 scale)
// Lower tier = better (1 = elite, 5 = untrained)
export function convertProgressToTiers(progress: Record<string, number>): Record<MuscleGroup, number> {
    const groupProgress: Record<MuscleGroup, number[]> = {
        chest: [], shoulders: [], back: [], traps: [], biceps: [], triceps: [],
        forearms: [], core: [], quads: [], hamstrings: [], glutes: [], calves: [],
    };

    // Group the progress values by muscle group
    for (const [muscleId, value] of Object.entries(progress)) {
        const group = MUSCLE_ID_TO_GROUP[muscleId];
        if (group) {
            groupProgress[group].push(value);
        }
    }

    // Convert progress to tiers
    const tiers: Record<MuscleGroup, number> = {} as Record<MuscleGroup, number>;
    for (const group of Object.keys(groupProgress) as MuscleGroup[]) {
        const values = groupProgress[group];
        if (values.length === 0) {
            tiers[group] = 5; // Untrained
        } else {
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            // Convert 0-100 to tier 5-1 (inverted: higher progress = lower tier number)
            // 0-10 = tier 5, 10-30 = tier 4, 30-50 = tier 3, 50-75 = tier 2, 75+ = tier 1
            if (avg >= 75) tiers[group] = 1;
            else if (avg >= 50) tiers[group] = 2;
            else if (avg >= 30) tiers[group] = 3;
            else if (avg >= 10) tiers[group] = 4;
            else tiers[group] = 5;
        }
    }

    return tiers;
}

// Combined function that merges Big3 tiers with workout progress
export function getCombinedMuscleTiers(
    muscleProgress: Record<string, number>,
    squatTier: number,
    benchTier: number,
    deadliftTier: number
): Record<MuscleGroup, number> {
    // Start with Big 3 baseline
    const big3Tiers = getMuscleTiersFromBig3(squatTier, benchTier, deadliftTier);

    // Get workout-based progress tiers
    const progressTiers = convertProgressToTiers(muscleProgress);

    // Combine: use the better (lower) tier from either source
    const combined: Record<MuscleGroup, number> = {} as Record<MuscleGroup, number>;
    for (const group of Object.keys(progressTiers) as MuscleGroup[]) {
        const big3Value = big3Tiers[group] ?? big3Tiers[group.toLowerCase()] ?? 5;
        const progressValue = progressTiers[group];
        combined[group] = Math.min(big3Value, progressValue);
    }

    return combined;
}

