// Workout Generation Service for STRATA
// Uses pre-made workout templates - no external API calls

export interface Exercise {
    name: string;
    sets: number;
    reps: string; // e.g. "5" or "8-12"
    rpe?: number;
    rest?: string;
    notes?: string;
    isWarmup?: boolean;
}

export interface GeneratedWorkout {
    title: string;
    focus: string;
    duration: string;
    exercises: Exercise[];
    tips: string[];
}

export interface UserProfile {
    gender: 'male' | 'female';
    bodyweight: number;
    squatMax: number;
    benchMax: number;
    deadliftMax: number;
    weakestLift: 'squat' | 'bench' | 'deadlift';
    tier: number;
    goal?: 'strength' | 'hypertrophy' | 'powerbuilding';
}

// Generate workout using pre-made templates
export async function generateWorkout(
    profile: UserProfile,
    workoutType: 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'full' | 'powerlifting'
): Promise<GeneratedWorkout> {
    return getWorkoutTemplate(workoutType, profile);
}

// Pre-made workout templates
function getWorkoutTemplate(workoutType: string, profile: UserProfile): GeneratedWorkout {
    const workouts: Record<string, GeneratedWorkout> = {
        push: {
            title: 'Push Power',
            focus: 'Chest, Shoulders, Triceps',
            duration: '50 min',
            exercises: [
                { name: 'Bench Press', sets: 4, reps: '5', rpe: 8, notes: `Work up to ${Math.round(profile.benchMax * 0.85)} lbs` },
                { name: 'Overhead Press', sets: 3, reps: '8', rpe: 7 },
                { name: 'Incline Dumbbell Press', sets: 3, reps: '10', rpe: 7 },
                { name: 'Lateral Raises', sets: 3, reps: '12-15', rpe: 8 },
                { name: 'Tricep Pushdowns', sets: 3, reps: '12', rpe: 7 },
                { name: 'Overhead Tricep Extension', sets: 2, reps: '15', rpe: 7 },
            ],
            tips: ['Focus on chest stretch at bottom', 'Control the eccentric'],
        },
        pull: {
            title: 'Pull Power',
            focus: 'Back, Biceps, Rear Delts',
            duration: '50 min',
            exercises: [
                { name: 'Deadlift', sets: 4, reps: '5', rpe: 8, notes: `Work up to ${Math.round(profile.deadliftMax * 0.85)} lbs` },
                { name: 'Barbell Rows', sets: 4, reps: '8', rpe: 7 },
                { name: 'Lat Pulldowns', sets: 3, reps: '10', rpe: 7 },
                { name: 'Face Pulls', sets: 3, reps: '15', rpe: 7 },
                { name: 'Barbell Curls', sets: 3, reps: '10', rpe: 7 },
                { name: 'Hammer Curls', sets: 2, reps: '12', rpe: 7 },
            ],
            tips: ['Engage lats before pulling', 'Squeeze at contraction'],
        },
        legs: {
            title: 'Leg Day',
            focus: 'Quads, Hamstrings, Glutes',
            duration: '55 min',
            exercises: [
                { name: 'Squat', sets: 4, reps: '5', rpe: 8, notes: `Work up to ${Math.round(profile.squatMax * 0.85)} lbs` },
                { name: 'Romanian Deadlift', sets: 3, reps: '8', rpe: 7 },
                { name: 'Leg Press', sets: 3, reps: '10', rpe: 8 },
                { name: 'Walking Lunges', sets: 3, reps: '12 each', rpe: 7 },
                { name: 'Leg Curls', sets: 3, reps: '12', rpe: 7 },
                { name: 'Calf Raises', sets: 4, reps: '15', rpe: 8 },
            ],
            tips: ['Brace core on squats', 'Full depth ROM'],
        },
        powerlifting: {
            title: 'Big 3 Focus',
            focus: 'Squat, Bench, Deadlift',
            duration: '75 min',
            exercises: [
                { name: 'Squat', sets: 5, reps: '3', rpe: 8, notes: `Target: ${Math.round(profile.squatMax * 0.85)} lbs` },
                { name: 'Bench Press', sets: 5, reps: '3', rpe: 8, notes: `Target: ${Math.round(profile.benchMax * 0.85)} lbs` },
                { name: 'Deadlift', sets: 4, reps: '3', rpe: 8, notes: `Target: ${Math.round(profile.deadliftMax * 0.85)} lbs` },
                { name: 'Paused Squat', sets: 2, reps: '5', rpe: 6, notes: '2 sec pause at bottom' },
                { name: 'Close Grip Bench', sets: 3, reps: '8', rpe: 7 },
                { name: 'Barbell Rows', sets: 3, reps: '8', rpe: 7 },
            ],
            tips: ['Long rest between main lifts (3-5 min)', 'Focus on technique'],
        },
        upper: {
            title: 'Upper Body',
            focus: 'Chest, Back, Arms',
            duration: '55 min',
            exercises: [
                { name: 'Bench Press', sets: 4, reps: '5', rpe: 8 },
                { name: 'Barbell Rows', sets: 4, reps: '8', rpe: 7 },
                { name: 'Overhead Press', sets: 3, reps: '8', rpe: 7 },
                { name: 'Pull-ups', sets: 3, reps: 'AMRAP', rpe: 8 },
                { name: 'Dumbbell Curls', sets: 3, reps: '12', rpe: 7 },
                { name: 'Tricep Dips', sets: 3, reps: '12', rpe: 7 },
            ],
            tips: ['Superset antagonist movements for efficiency'],
        },
        lower: {
            title: 'Lower Body',
            focus: 'Legs & Core',
            duration: '50 min',
            exercises: [
                { name: 'Squat', sets: 4, reps: '5', rpe: 8 },
                { name: 'Romanian Deadlift', sets: 4, reps: '8', rpe: 7 },
                { name: 'Bulgarian Split Squats', sets: 3, reps: '10 each', rpe: 7 },
                { name: 'Leg Curls', sets: 3, reps: '12', rpe: 7 },
                { name: 'Calf Raises', sets: 4, reps: '15', rpe: 8 },
                { name: 'Hanging Leg Raises', sets: 3, reps: '12', rpe: 7 },
            ],
            tips: ['Focus on the eccentric phase'],
        },
        full: {
            title: 'Full Body',
            focus: 'Total Body Strength',
            duration: '60 min',
            exercises: [
                { name: 'Squat', sets: 3, reps: '5', rpe: 8 },
                { name: 'Bench Press', sets: 3, reps: '5', rpe: 8 },
                { name: 'Barbell Rows', sets: 3, reps: '8', rpe: 7 },
                { name: 'Overhead Press', sets: 3, reps: '8', rpe: 7 },
                { name: 'Romanian Deadlift', sets: 3, reps: '8', rpe: 7 },
                { name: 'Pull-ups', sets: 3, reps: 'AMRAP', rpe: 8 },
            ],
            tips: ['Keep rest moderate (2 min) for efficiency'],
        },
    };

    return workouts[workoutType] || workouts.full;
}

// Generate warm-up sets based on working weight
export function generateWarmupSets(workingWeight: number): { weight: number; reps: number }[] {
    if (workingWeight <= 95) {
        return [
            { weight: 45, reps: 10 },
            { weight: Math.round(workingWeight * 0.7), reps: 5 },
        ];
    }

    return [
        { weight: 45, reps: 10 },
        { weight: Math.round(workingWeight * 0.5), reps: 5 },
        { weight: Math.round(workingWeight * 0.7), reps: 3 },
        { weight: Math.round(workingWeight * 0.85), reps: 2 },
    ];
}
