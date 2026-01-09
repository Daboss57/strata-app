// Gemini AI Service for STRATA
// Uses gemini-flash-latest for workout generation

const GEMINI_API_KEY = 'AIzaSyBy6kD8wF98tt8Caid6hb_KYxYHeC8vyxU';
const GEMINI_MODEL = 'gemini-2.0-flash';
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

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

export async function generateWorkout(
    profile: UserProfile,
    workoutType: 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'full' | 'powerlifting'
): Promise<GeneratedWorkout> {
    // Use pre-made workouts directly - no API calls needed
    // This saves API usage and provides instant workout generation
    return getFallbackWorkout(workoutType, profile);
}

function buildWorkoutPrompt(profile: UserProfile, workoutType: string): string {
    const tierNames = ['Apex', 'Elite', 'Advanced', 'Intermediate', 'Novice'];
    const tierName = tierNames[profile.tier - 1] || 'Intermediate';

    return `You are a strength coach creating a workout for a ${profile.gender} lifter.

ATHLETE PROFILE:
- Bodyweight: ${profile.bodyweight} lbs
- Squat 1RM: ${profile.squatMax} lbs (${(profile.squatMax / profile.bodyweight).toFixed(2)}x BW)
- Bench 1RM: ${profile.benchMax} lbs (${(profile.benchMax / profile.bodyweight).toFixed(2)}x BW)
- Deadlift 1RM: ${profile.deadliftMax} lbs (${(profile.deadliftMax / profile.bodyweight).toFixed(2)}x BW)
- Strength Level: ${tierName} (Tier ${profile.tier})
- Weakest Lift: ${profile.weakestLift}
- Goal: ${profile.goal || 'strength'}

Create a ${workoutType.toUpperCase()} workout with these requirements:
1. ${profile.tier >= 4 ? 'Focus on building foundational strength with moderate volume' : 'Include progressive overload with appropriate intensity'}
2. Include 5-7 exercises total
3. Address the weakness (${profile.weakestLift}) with accessory work
4. Use appropriate working weights based on their maxes

RESPOND IN THIS EXACT JSON FORMAT:
{
  "title": "Workout name",
  "focus": "Primary focus area",
  "duration": "45-60 min",
  "exercises": [
    {"name": "Exercise Name", "sets": 4, "reps": "5", "rpe": 8, "notes": "Optional tip"},
    ...
  ],
  "tips": ["Tip 1", "Tip 2"]
}

Only output valid JSON, no other text.`;
}

function parseWorkoutResponse(text: string, workoutType: string): GeneratedWorkout | null {
    try {
        // Try to extract JSON from the response
        // Remove markdown code blocks if present
        let cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        const jsonMatch = cleanText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);

            // Validate that we have exercises
            if (parsed.exercises && Array.isArray(parsed.exercises) && parsed.exercises.length > 0) {
                return {
                    title: parsed.title || `${workoutType.charAt(0).toUpperCase() + workoutType.slice(1)} Day`,
                    focus: parsed.focus || workoutType,
                    duration: parsed.duration || '45-60 min',
                    exercises: parsed.exercises.map((ex: any) => ({
                        name: ex.name || 'Unknown Exercise',
                        sets: ex.sets || 3,
                        reps: String(ex.reps || '10'),
                        rpe: ex.rpe,
                        notes: ex.notes,
                    })),
                    tips: parsed.tips || [],
                };
            }
        }
    } catch (e) {
        console.log('Using fallback workout (parse failed)');
    }

    // Return null to indicate fallback needed
    return null;
}

function getFallbackWorkout(workoutType: string, profile: UserProfile): GeneratedWorkout {
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

// Post-workout report interfaces
export interface WorkoutReportData {
    workoutTitle: string;
    duration: number; // minutes
    exercises: {
        name: string;
        sets: { weight: number; reps: number; completed: boolean }[];
        isPR?: boolean;
    }[];
    musclesWorked: Record<string, number>; // muscle: volume
    prsHit: string[];
    signalGain: number;
}

export interface PostWorkoutReport {
    summary: string;
    muscleAnalysis: { muscle: string; status: 'excellent' | 'good' | 'needs_more'; note: string }[];
    improvements: string[];
    areasToImprove: string[];
    recovery: {
        soreness: string;
        nutrition: string;
        sleep: string;
        nextWorkout: string;
    };
    motivation: string;
}

// Generate AI post-workout report
export async function generatePostWorkoutReport(
    workoutData: WorkoutReportData,
    userProfile: { experienceLevel?: string; goals?: string[]; focusAreas?: string[] }
): Promise<PostWorkoutReport> {
    const prompt = `You are a supportive AI fitness coach. Analyze this workout and provide feedback.

WORKOUT DATA:
- Title: ${workoutData.workoutTitle}
- Duration: ${workoutData.duration} minutes
- Exercises: ${workoutData.exercises.map(e =>
        `${e.name} (${e.sets.filter(s => s.completed).length} sets completed${e.isPR ? ', PR!' : ''})`
    ).join(', ')}
- PRs Hit: ${workoutData.prsHit.length > 0 ? workoutData.prsHit.join(', ') : 'None'}
- Signal Gain: +${workoutData.signalGain}

USER PROFILE:
- Experience: ${userProfile.experienceLevel || 'Unknown'}
- Goals: ${userProfile.goals?.join(', ') || 'General fitness'}
- Focus Areas: ${userProfile.focusAreas?.join(', ') || 'Balanced'}

Respond with ONLY valid JSON in this exact format:
{
    "summary": "1-2 sentence encouraging summary of the workout",
    "muscleAnalysis": [
        { "muscle": "muscle name", "status": "excellent|good|needs_more", "note": "brief note" }
    ],
    "improvements": ["What the user did well or improved on"],
    "areasToImprove": ["Constructive suggestions for next time"],
    "recovery": {
        "soreness": "Expected soreness level and where",
        "nutrition": "Post-workout nutrition tip",
        "sleep": "Recovery/sleep recommendation",
        "nextWorkout": "Suggestion for next session"
    },
    "motivation": "One inspiring closing thought"
}`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.8, maxOutputTokens: 1024 }
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

        // Extract JSON
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found');
        }

        return JSON.parse(jsonMatch[0]) as PostWorkoutReport;
    } catch (error) {
        console.error('Post-workout report error:', error);
        // Return default report
        return getDefaultPostWorkoutReport(workoutData);
    }
}

// Fallback report when AI fails
function getDefaultPostWorkoutReport(data: WorkoutReportData): PostWorkoutReport {
    const prsText = data.prsHit.length > 0
        ? `Crushed ${data.prsHit.length} PR${data.prsHit.length > 1 ? 's' : ''}!`
        : '';

    return {
        summary: `Great ${data.workoutTitle}! ${data.exercises.length} exercises completed in ${data.duration} minutes. ${prsText}`,
        muscleAnalysis: Object.entries(data.musclesWorked).slice(0, 4).map(([muscle, volume]) => ({
            muscle,
            status: volume > 5000 ? 'excellent' : volume > 2000 ? 'good' : 'needs_more',
            note: volume > 5000 ? 'Great volume!' : volume > 2000 ? 'Solid work' : 'Could add more sets next time'
        })),
        improvements: [
            'Completed your planned workout',
            data.prsHit.length > 0 ? `Set ${data.prsHit.length} new PR(s)!` : 'Maintained consistent effort',
        ].filter(Boolean),
        areasToImprove: [
            'Consider progressive overload next session',
            'Track rest times for better recovery'
        ],
        recovery: {
            soreness: 'Expect moderate DOMS in 24-48 hours',
            nutrition: 'Consume protein within 2 hours post-workout',
            sleep: 'Aim for 7-9 hours tonight for optimal recovery',
            nextWorkout: 'Consider training a different muscle group tomorrow'
        },
        motivation: "Every rep counts. You're building a stronger version of yourself! 💪"
    };
}
