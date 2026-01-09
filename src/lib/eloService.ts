
export const RANK_TIERS = [
    { name: 'INITIAL', min: 0, color: '#888888' },
    { name: 'OPERATOR', min: 1000, color: '#4ADE80' },
    { name: 'VANGUARD', min: 1500, color: '#3B82F6' },
    { name: 'ELITE', min: 2000, color: '#A855F7' },
    { name: 'APEX', min: 2500, color: '#F43F5E' },
    { name: 'STRATA', min: 3000, color: '#FFD700' },
];

export function getRank(signal: number) {
    for (let i = RANK_TIERS.length - 1; i >= 0; i--) {
        if (signal >= RANK_TIERS[i].min) {
            return RANK_TIERS[i];
        }
    }
    return RANK_TIERS[0];
}

interface CalculateSignalProps {
    squat: number;
    bench: number;
    deadlift: number;
    bodyweight: number;
}

// Calculate initial signal based on Wilks-like score
export function calculateInitialSignal({ squat, bench, deadlift, bodyweight }: CalculateSignalProps): number {
    const total = squat + bench + deadlift;

    // Basic strength coefficient (simplified Wilks)
    // Base 1000 is for a "decent" lifter (roughly 1.5x BW total)
    // Scaled so 1000 lbs total @ 180 lbs BW -> ~1800 Signal

    if (bodyweight <= 0) return 1000;

    const ratio = total / bodyweight;

    // Baseline: 1000 Signal = 2.0x bodyweight total (Beginner/Intermediate boundary)
    // 1500 Signal = 3.0x bodyweight total (Intermediate/Advanced)
    // 2000 Signal = 4.0x bodyweight total (Advanced/Elite)

    const baseSignal = Math.round(ratio * 500);

    // Ensure minimum start
    return Math.max(800, baseSignal);
}

interface WorkoutPerformance {
    completed: boolean;
    prsHit: number;
    volume: number; // Unused for now but good for future
    difficulty: number; // 1-10 rating from user
}

export function calculateNewSignal(currentSignal: number, performance: WorkoutPerformance): number {
    let change = 0;

    // Completion bonus
    if (performance.completed) {
        change += 10;
    }

    // PR Bonus (Big boost for breaking plateaus)
    change += (performance.prsHit * 25);

    // Difficulty multiplier
    // If the workout was hard (RPE 8-10 average), award more points
    if (performance.difficulty >= 8) {
        change += 5;
    }

    // Diminishing returns for high signals to prevent runaway scores
    // At 3000+, it's harder to gain points
    if (currentSignal > 2500) {
        change = Math.floor(change * 0.5);
    } else if (currentSignal > 2000) {
        change = Math.floor(change * 0.75);
    }

    return currentSignal + change;
}
