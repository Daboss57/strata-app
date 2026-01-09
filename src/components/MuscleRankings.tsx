import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography } from '../config/theme';
import {
    getRankFromPoints,
    getPointsToNextRank,
    getRankProgress,
    type MuscleId,
    type Rank,
} from '../lib/rankingService';

interface MuscleRankingsProps {
    musclePoints: Record<MuscleId, number>;
    onMusclePress?: (muscle: MuscleId) => void;
}

// Group muscles into categories
const MUSCLE_CATEGORIES: { name: string; icon: string; muscles: MuscleId[] }[] = [
    { name: 'Arms', icon: '💪', muscles: ['biceps', 'triceps', 'forearms'] },
    { name: 'Chest', icon: '🫁', muscles: ['chest'] },
    { name: 'Back', icon: '🔙', muscles: ['back', 'traps'] },
    { name: 'Shoulders', icon: '🦾', muscles: ['shoulders'] },
    { name: 'Core', icon: '🎯', muscles: ['core'] },
    { name: 'Legs', icon: '🦵', muscles: ['quads', 'hamstrings', 'glutes', 'calves'] },
];

export default function MuscleRankings({ musclePoints, onMusclePress }: MuscleRankingsProps) {
    // Get average rank for a category
    const getCategoryRank = (muscles: MuscleId[]): Rank => {
        const totalPoints = muscles.reduce((sum, m) => sum + (musclePoints[m] || 0), 0);
        const avgPoints = Math.round(totalPoints / muscles.length);
        return getRankFromPoints(avgPoints);
    };

    // Get progress for category
    const getCategoryProgress = (muscles: MuscleId[]): number => {
        const totalPoints = muscles.reduce((sum, m) => sum + (musclePoints[m] || 0), 0);
        const avgPoints = Math.round(totalPoints / muscles.length);
        return getRankProgress(avgPoints);
    };

    // Get points to next for category
    const getCategoryPointsToNext = (muscles: MuscleId[]): number => {
        const totalPoints = muscles.reduce((sum, m) => sum + (musclePoints[m] || 0), 0);
        const avgPoints = Math.round(totalPoints / muscles.length);
        return getPointsToNextRank(avgPoints).pointsNeeded;
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Muscle Rankings</Text>
                <TouchableOpacity style={styles.infoButton}>
                    <Text style={styles.infoIcon}>ⓘ</Text>
                </TouchableOpacity>
            </View>

            {MUSCLE_CATEGORIES.map((category) => {
                const rank = getCategoryRank(category.muscles);
                const progress = getCategoryProgress(category.muscles);
                const pointsToNext = getCategoryPointsToNext(category.muscles);

                return (
                    <TouchableOpacity
                        key={category.name}
                        style={styles.rankItem}
                        onPress={() => onMusclePress?.(category.muscles[0])}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: rank.color + '25' }]}>
                            <Text style={styles.categoryIcon}>{category.icon}</Text>
                        </View>

                        <View style={styles.rankInfo}>
                            <View style={styles.nameRow}>
                                <Text style={styles.categoryName}>{category.name}</Text>
                                <Text style={styles.rankIcon}>{rank.icon}</Text>
                            </View>

                            {/* Progress bar */}
                            <View style={styles.progressBarContainer}>
                                <View
                                    style={[
                                        styles.progressBar,
                                        {
                                            width: `${progress * 100}%`,
                                            backgroundColor: rank.color,
                                        }
                                    ]}
                                />
                            </View>

                            <Text style={styles.progressText}>
                                {pointsToNext > 0 ? `${pointsToNext} pts to next rank` : 'Max rank!'}
                            </Text>
                        </View>

                        <View style={[styles.rankBadge, { backgroundColor: rank.color + '30', borderColor: rank.color }]}>
                            <Text style={[styles.rankText, { color: rank.color }]}>
                                {rank.label}
                            </Text>
                        </View>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    title: {
        fontSize: typography.sizes.lg,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    infoButton: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.bgSecondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoIcon: {
        fontSize: 14,
        color: colors.textMuted,
    },
    rankItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.glassBorder,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    categoryIcon: {
        fontSize: 22,
    },
    rankInfo: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
        marginBottom: spacing.xs,
    },
    categoryName: {
        fontSize: typography.sizes.md,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    rankIcon: {
        fontSize: 14,
    },
    progressBarContainer: {
        height: 4,
        backgroundColor: colors.bgSecondary,
        borderRadius: 2,
        marginBottom: spacing.xs,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 2,
    },
    progressText: {
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
    },
    rankBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
        marginLeft: spacing.sm,
        borderWidth: 1,
    },
    rankText: {
        fontSize: typography.sizes.xs,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});
