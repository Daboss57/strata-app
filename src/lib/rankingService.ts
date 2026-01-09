// Game-Style Ranking Service for STRATA
// Ranks: Iron → Bronze → Silver → Gold → Platinum → Diamond → Master → Grandmaster → Champion

export type RankTier =
    | 'iron' | 'bronze' | 'silver' | 'gold'
    | 'platinum' | 'diamond' | 'master' | 'grandmaster' | 'champion';

export type Division = 1 | 2 | 3;

export interface Rank {
    tier: RankTier;
    division: Division | null; // null for Master+
    points: number;
    label: string;
    color: string;
    icon: string;
}

// Point thresholds for each rank tier
const RANK_THRESHOLDS: { tier: RankTier; minPoints: number; maxPoints: number; hasDivisions: boolean }[] = [
    { tier: 'iron', minPoints: 0, maxPoints: 99, hasDivisions: true },
    { tier: 'bronze', minPoints: 100, maxPoints: 299, hasDivisions: true },
    { tier: 'silver', minPoints: 300, maxPoints: 599, hasDivisions: true },
    { tier: 'gold', minPoints: 600, maxPoints: 999, hasDivisions: true },
    { tier: 'platinum', minPoints: 1000, maxPoints: 1499, hasDivisions: true },
    { tier: 'diamond', minPoints: 1500, maxPoints: 2099, hasDivisions: true },
    { tier: 'master', minPoints: 2100, maxPoints: 2499, hasDivisions: false },
    { tier: 'grandmaster', minPoints: 2500, maxPoints: 2999, hasDivisions: false },
    { tier: 'champion', minPoints: 3000, maxPoints: Infinity, hasDivisions: false },
];

// Rank colors matching the gaming aesthetic
export const RANK_COLORS: Record<RankTier, string> = {
    iron: '#5C5C5C',
    bronze: '#CD7F32',
    silver: '#A8A8A8',
    gold: '#FFD700',
    platinum: '#00CED1',
    diamond: '#B9F2FF',
    master: '#9932CC',
    grandmaster: '#FF4444',
    champion: '#FFD700',
};

// Rank icons
export const RANK_ICONS: Record<RankTier, string> = {
    iron: '🔩',
    bronze: '🥉',
    silver: '🥈',
    gold: '🥇',
    platinum: '💎',
    diamond: '💠',
    master: '👑',
    grandmaster: '🔥',
    champion: '⚡',
};

// Get rank from points
export function getRankFromPoints(points: number): Rank {
    // Find the tier
    let tierInfo = RANK_THRESHOLDS[0];
    for (const threshold of RANK_THRESHOLDS) {
        if (points >= threshold.minPoints && points <= threshold.maxPoints) {
            tierInfo = threshold;
            break;
        }
        if (points > threshold.maxPoints) {
            tierInfo = threshold;
        }
    }

    // Calculate division (1 is highest, 3 is lowest within tier)
    let division: Division | null = null;
    if (tierInfo.hasDivisions) {
        const tierRange = tierInfo.maxPoints - tierInfo.minPoints + 1;
        const divisionSize = tierRange / 3;
        const pointsInTier = points - tierInfo.minPoints;

        if (pointsInTier < divisionSize) {
            division = 3;
        } else if (pointsInTier < divisionSize * 2) {
            division = 2;
        } else {
            division = 1;
        }
    }

    const label = division
        ? `${tierInfo.tier.charAt(0).toUpperCase() + tierInfo.tier.slice(1)} ${division}`
        : tierInfo.tier.charAt(0).toUpperCase() + tierInfo.tier.slice(1);

    return {
        tier: tierInfo.tier,
        division,
        points,
        label,
        color: RANK_COLORS[tierInfo.tier],
        icon: RANK_ICONS[tierInfo.tier],
    };
}

// Get points needed for next rank/division
export function getPointsToNextRank(points: number): { pointsNeeded: number; nextRank: Rank } {
    const currentRank = getRankFromPoints(points);

    // Find next threshold
    for (const threshold of RANK_THRESHOLDS) {
        if (currentRank.tier === threshold.tier) {
            if (threshold.hasDivisions && currentRank.division) {
                // Calculate next division threshold
                const tierRange = threshold.maxPoints - threshold.minPoints + 1;
                const divisionSize = Math.floor(tierRange / 3);

                if (currentRank.division === 3) {
                    const nextDivisionPoints = threshold.minPoints + divisionSize;
                    return {
                        pointsNeeded: nextDivisionPoints - points,
                        nextRank: getRankFromPoints(nextDivisionPoints),
                    };
                } else if (currentRank.division === 2) {
                    const nextDivisionPoints = threshold.minPoints + divisionSize * 2;
                    return {
                        pointsNeeded: nextDivisionPoints - points,
                        nextRank: getRankFromPoints(nextDivisionPoints),
                    };
                } else {
                    // Division 1, need to go to next tier
                    const nextTierPoints = threshold.maxPoints + 1;
                    return {
                        pointsNeeded: nextTierPoints - points,
                        nextRank: getRankFromPoints(nextTierPoints),
                    };
                }
            } else {
                // No divisions, go to next tier
                const nextTierPoints = threshold.maxPoints + 1;
                if (nextTierPoints <= 3000) {
                    return {
                        pointsNeeded: nextTierPoints - points,
                        nextRank: getRankFromPoints(nextTierPoints),
                    };
                }
            }
        }
    }

    // Already at max
    return {
        pointsNeeded: 0,
        nextRank: getRankFromPoints(points),
    };
}

// Get progress percentage within current division/tier
export function getRankProgress(points: number): number {
    const currentRank = getRankFromPoints(points);

    for (const threshold of RANK_THRESHOLDS) {
        if (currentRank.tier === threshold.tier) {
            if (threshold.hasDivisions && currentRank.division) {
                const tierRange = threshold.maxPoints - threshold.minPoints + 1;
                const divisionSize = Math.floor(tierRange / 3);
                const divisionStart = threshold.minPoints + divisionSize * (3 - currentRank.division);
                const divisionEnd = divisionStart + divisionSize - 1;
                const progress = (points - divisionStart) / divisionSize;
                return Math.min(1, Math.max(0, progress));
            } else {
                // No divisions
                const tierRange = threshold.maxPoints - threshold.minPoints;
                if (tierRange === Infinity) return 1; // Champion
                const progress = (points - threshold.minPoints) / tierRange;
                return Math.min(1, Math.max(0, progress));
            }
        }
    }

    return 0;
}

// Calculate points gained from a workout set
export function calculateSetPoints(weight: number, reps: number): number {
    // Base points from volume, scaled logarithmically to prevent crazy inflation
    const volume = weight * reps;
    // ~10 points for a set of 135x10, ~20 for 225x10, ~25 for 315x10
    const points = Math.round(Math.log10(volume + 1) * 5);
    return Math.max(1, points); // At least 1 point per set
}

// Check if a rank up occurred
export function checkRankUp(oldPoints: number, newPoints: number): {
    rankedUp: boolean;
    oldRank: Rank;
    newRank: Rank;
} {
    const oldRank = getRankFromPoints(oldPoints);
    const newRank = getRankFromPoints(newPoints);

    const rankedUp = oldRank.tier !== newRank.tier || oldRank.division !== newRank.division;

    return { rankedUp, oldRank, newRank };
}

// Get all muscle groups with their ranks
export type MuscleId =
    | 'chest' | 'shoulders' | 'back' | 'traps'
    | 'biceps' | 'triceps' | 'forearms'
    | 'core' | 'quads' | 'hamstrings' | 'glutes' | 'calves';

export const ALL_MUSCLES: MuscleId[] = [
    'chest', 'shoulders', 'back', 'traps',
    'biceps', 'triceps', 'forearms',
    'core', 'quads', 'hamstrings', 'glutes', 'calves',
];

// Get overall rank from muscle points
export function getOverallRank(musclePoints: Record<string, number>): Rank {
    const values = Object.values(musclePoints);
    if (values.length === 0) return getRankFromPoints(0);

    const avgPoints = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    return getRankFromPoints(avgPoints);
}
