/**
 * STRATA Strength Calculator
 * 
 * Implements:
 * - DOTS Formula (IPF standard for comparing across bodyweights)
 * - Brzycki Formula (Estimate 1RM from submaximal sets)
 * - Tier classification based on strength standards
 */

// DOTS Coefficients from official IPF documentation
const DOTS_COEFFICIENTS = {
    male: {
        a: -307.75076,
        b: 24.0900756,
        c: -0.1918759221,
        d: 0.0007391293,
        e: -0.0000010930,
    },
    female: {
        a: -57.96288,
        b: 13.6175032,
        c: -0.1126655495,
        d: 0.0005158568,
        e: -0.0000010706,
    },
};

export type Gender = 'male' | 'female';
export type LiftType = 'squat' | 'bench' | 'deadlift';

export interface TierResult {
    tier: number;
    label: string;
    percentile: number;
    dotsScore: number;
}

export interface StrengthStandard {
    tier_1_cutoff: number;
    tier_2_cutoff: number;
    tier_3_cutoff: number;
    tier_4_cutoff: number;
    tier_5_cutoff: number;
}

/**
 * Calculate DOTS score for a lift
 * DOTS = liftWeight * (500 / denominator)
 * 
 * @param liftWeight - Weight lifted in lbs
 * @param bodyweight - Bodyweight in lbs (will be converted to kg internally)
 * @param gender - 'male' or 'female'
 * @returns DOTS score
 */
export function calculateDOTS(
    liftWeight: number,
    bodyweight: number,
    gender: Gender
): number {
    // Convert lbs to kg (DOTS uses kg)
    const bwKg = bodyweight * 0.453592;
    const liftKg = liftWeight * 0.453592;

    const coeffs = DOTS_COEFFICIENTS[gender];

    const denominator =
        coeffs.a +
        coeffs.b * bwKg +
        coeffs.c * Math.pow(bwKg, 2) +
        coeffs.d * Math.pow(bwKg, 3) +
        coeffs.e * Math.pow(bwKg, 4);

    return liftKg * (500 / denominator);
}

/**
 * Estimate 1RM using Brzycki formula
 * Most accurate for 2-10 reps
 * 
 * @param weight - Weight lifted
 * @param reps - Number of reps performed
 * @returns Estimated 1RM
 */
export function estimate1RM(weight: number, reps: number): number {
    if (reps <= 0) return 0;
    if (reps === 1) return weight;

    // Cap at 12 reps - formula becomes less accurate above this
    const effectiveReps = Math.min(reps, 12);

    // Brzycki: 1RM = Weight ÷ (1.0278 – 0.0278 × Reps)
    return Math.round(weight / (1.0278 - 0.0278 * effectiveReps));
}

/**
 * Get tier classification based on lift weight and standards
 * 
 * @param liftWeight - Weight lifted (1RM)
 * @param standards - Tier cutoffs from database
 * @returns Tier info (1-5)
 */
export function getTierFromWeight(
    liftWeight: number,
    standards: StrengthStandard
): { tier: number; label: string; percentile: number } {
    if (liftWeight >= standards.tier_1_cutoff) {
        return { tier: 1, label: 'APEX', percentile: 95 };
    }
    if (liftWeight >= standards.tier_2_cutoff) {
        return { tier: 2, label: 'ELITE', percentile: 85 };
    }
    if (liftWeight >= standards.tier_3_cutoff) {
        return { tier: 3, label: 'ADVANCED', percentile: 65 };
    }
    if (liftWeight >= standards.tier_4_cutoff) {
        return { tier: 4, label: 'INTERMEDIATE', percentile: 40 };
    }
    return { tier: 5, label: 'NOVICE', percentile: 20 };
}

/**
 * Calculate progress percentage to next tier
 */
export function getProgressToNextTier(
    liftWeight: number,
    currentTier: number,
    standards: StrengthStandard
): number {
    if (currentTier === 1) return 100; // Already at apex

    const tierKey = `tier_${currentTier}_cutoff` as keyof StrengthStandard;
    const nextTierKey = `tier_${currentTier - 1}_cutoff` as keyof StrengthStandard;

    const currentCutoff = standards[tierKey];
    const nextCutoff = standards[nextTierKey];

    if (liftWeight <= currentCutoff) return 0;

    const range = nextCutoff - currentCutoff;
    const progress = liftWeight - currentCutoff;

    return Math.min(100, Math.round((progress / range) * 100));
}

/**
 * Round to nearest plate-friendly weight
 */
export function roundToNearestPlate(weight: number): number {
    return Math.round(weight / 5) * 5;
}

/**
 * Format weight for display
 */
export function formatWeight(weight: number): string {
    const rounded = roundToNearestPlate(weight);
    return `${rounded} lbs`;
}
