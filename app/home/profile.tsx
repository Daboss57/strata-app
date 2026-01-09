import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, borderRadius, typography, getTierColor, getTierLabel, getTierPercentile } from '../../src/config/theme';
import { useOnboarding } from '../../src/context/OnboardingContext';
import { getRank } from '../../src/lib/eloService';
import { calculateDOTS } from '../../src/lib/strengthCalculator';
import { getOverallRank, type MuscleId } from '../../src/lib/rankingService';
import BodyGraphDual from '../../src/components/BodyGraphDual';
import MuscleRankings from '../../src/components/MuscleRankings';
import type { LiftType } from '../../src/types';

const { width } = Dimensions.get('window');

// Helper to calculate tier from bodyweight ratio
function calculateTier(liftWeight: number, bodyweight: number, liftType: LiftType, gender: 'male' | 'female'): number {
    const ratio = liftWeight / bodyweight;

    const tiers = gender === 'male'
        ? {
            squat: { 1: 2.83, 2: 2.25, 3: 1.75, 4: 1.25 },
            bench: { 1: 1.95, 2: 1.65, 3: 1.35, 4: 1.00 },
            deadlift: { 1: 3.25, 2: 2.60, 3: 2.00, 4: 1.50 },
        }
        : {
            squat: { 1: 2.26, 2: 1.90, 3: 1.50, 4: 1.00 },
            bench: { 1: 1.35, 2: 1.15, 3: 0.90, 4: 0.65 },
            deadlift: { 1: 2.66, 2: 2.25, 3: 1.75, 4: 1.25 },
        };

    const tierRatios = tiers[liftType];

    if (ratio >= tierRatios[1]) return 1;
    if (ratio >= tierRatios[2]) return 2;
    if (ratio >= tierRatios[3]) return 3;
    if (ratio >= tierRatios[4]) return 4;
    return 5;
}

export default function ProfileScreen() {
    const { data, completeOnboarding, updateData, resetOnboarding } = useOnboarding();

    // Get real data
    const bodyweight = data.bodyweight || 165;
    const gender = data.gender || 'male';
    const squatMax = data.squatMax || 0;
    const benchMax = data.benchMax || 0;
    const deadliftMax = data.deadliftMax || 0;
    const currentElo = data.strataSignal || 1000;

    // Calculate real tiers
    const lifts = useMemo(() => {
        return [
            { type: 'squat' as LiftType, icon: '🦵', weight: squatMax, tier: calculateTier(squatMax, bodyweight, 'squat', gender) },
            { type: 'bench' as LiftType, icon: '💪', weight: benchMax, tier: calculateTier(benchMax, bodyweight, 'bench', gender) },
            { type: 'deadlift' as LiftType, icon: '🏋️', weight: deadliftMax, tier: calculateTier(deadliftMax, bodyweight, 'deadlift', gender) },
        ];
    }, [squatMax, benchMax, deadliftMax, bodyweight, gender]);

    // Overall tier
    const overallTier = useMemo(() => {
        return Math.round(lifts.reduce((sum, l) => sum + l.tier, 0) / 3);
    }, [lifts]);

    // Muscle points from workout history (new ranking system)
    const musclePoints = useMemo(() => {
        const progress = data.muscleProgress || {};
        // Convert muscle progress to points format
        const points: Record<MuscleId, number> = {
            chest: Math.round((progress.chest || 0) * 30), // Scale 0-100 to 0-3000 points
            shoulders: Math.round(((progress.front_delts || 0) + (progress.side_delts || 0) + (progress.rear_delts || 0)) * 10),
            back: Math.round(((progress.lats || 0) + (progress.upper_back || 0) + (progress.lower_back || 0)) * 10),
            traps: Math.round((progress.traps || 0) * 30),
            biceps: Math.round((progress.biceps || 0) * 30),
            triceps: Math.round((progress.triceps || 0) * 30),
            forearms: Math.round((progress.forearms || 0) * 30),
            core: Math.round(((progress.abs || 0) + (progress.obliques || 0)) * 15),
            quads: Math.round((progress.quads || 0) * 30),
            hamstrings: Math.round((progress.hamstrings || 0) * 30),
            glutes: Math.round((progress.glutes || 0) * 30),
            calves: Math.round((progress.calves || 0) * 30),
        };
        return points;
    }, [data.muscleProgress]);

    // Overall rank from muscle points
    const overallRank = useMemo(() => getOverallRank(musclePoints), [musclePoints]);

    // Stats
    const total = squatMax + benchMax + deadliftMax;
    const dotsScore = useMemo(() => calculateDOTS(total, bodyweight, gender), [total, bodyweight, gender]);

    const eloRank = getRank(currentElo);

    const handleRecalibrate = () => {
        updateData({ isOnboarded: false });
        router.replace('/onboarding/biometrics');
    };

    const handleFullReset = () => {
        Alert.alert(
            'Reset All Data',
            'This will completely wipe all your data including workout history, achievements, and settings. Are you sure?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Reset Everything',
                    style: 'destructive',
                    onPress: async () => {
                        await resetOnboarding();
                        router.replace('/onboarding/biometrics');
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.bgPrimary, '#0D1117', colors.bgPrimary]}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.content}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.headerLabel}>YOUR PROFILE</Text>
                        <Text style={styles.headerTitle}>Strength Stats</Text>
                    </View>

                    {/* Profile Card */}
                    <View style={styles.profileCard}>
                        <LinearGradient
                            colors={[getTierColor(overallTier) + '30', colors.bgCard]}
                            style={styles.profileGradient}
                        >
                            <View style={styles.avatarContainer}>
                                <View style={[styles.avatar, { borderColor: getTierColor(overallTier) }]}>
                                    <Text style={styles.avatarText}>
                                        {gender === 'male' ? '♂️' : '♀️'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.profileInfo}>
                                <Text style={styles.profileWeight}>{bodyweight} lbs</Text>
                                <View style={[styles.rankBadge, { backgroundColor: getTierColor(overallTier) + '20' }]}>
                                    <Text style={[styles.rankText, { color: overallRank.color }]}>
                                        {overallRank.icon} {overallRank.label}
                                    </Text>
                                </View>
                                <Text style={styles.percentileText}>Overall Muscle Rank</Text>
                            </View>

                            <View style={styles.eloDisplay}>
                                <Text style={[styles.eloValue, { color: eloRank.color }]}>{currentElo}</Text>
                                <Text style={styles.eloLabel}>{eloRank.name}</Text>
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Ranked Bodygraph */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>RANKED BODYGRAPH</Text>
                    </View>

                    <View style={styles.bodyGraphCard}>
                        <LinearGradient
                            colors={['#1a1a2e', '#16162a']}
                            style={styles.bodyGraphGradient}
                        >
                            <BodyGraphDual
                                musclePoints={musclePoints}
                                width={width - spacing.lg * 2 - spacing.md * 2}
                                height={320}
                            />
                        </LinearGradient>
                    </View>

                    {/* Muscle Rankings */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>MUSCLE RANKINGS</Text>
                    </View>

                    <MuscleRankings musclePoints={musclePoints} />

                    {/* Current Maxes */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>CURRENT MAXES</Text>
                    </View>

                    <View style={styles.maxesContainer}>
                        {lifts.map((lift) => (
                            <View key={lift.type} style={styles.maxCard}>
                                <LinearGradient
                                    colors={[colors.bgCard, colors.bgSecondary]}
                                    style={styles.maxGradient}
                                >
                                    <Text style={styles.maxIcon}>{lift.icon}</Text>
                                    <Text style={styles.maxType}>{lift.type.toUpperCase()}</Text>
                                    <Text style={styles.maxWeight}>{lift.weight} lbs</Text>
                                    <View style={[styles.maxTier, { backgroundColor: getTierColor(lift.tier) + '20' }]}>
                                        <Text style={[styles.maxTierText, { color: getTierColor(lift.tier) }]}>
                                            {getTierLabel(lift.tier)}
                                        </Text>
                                    </View>
                                </LinearGradient>
                            </View>
                        ))}
                    </View>

                    {/* Stats */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>YOUR STATS</Text>
                    </View>

                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{total}</Text>
                            <Text style={styles.statLabel}>POWERLIFTING TOTAL</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{dotsScore.toFixed(1)}</Text>
                            <Text style={styles.statLabel}>DOTS SCORE</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{(total / bodyweight).toFixed(2)}x</Text>
                            <Text style={styles.statLabel}>TOTAL/BW</Text>
                        </View>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionsContainer}>
                        <TouchableOpacity style={styles.actionButton} onPress={handleRecalibrate}>
                            <Text style={styles.actionIcon}>🔄</Text>
                            <Text style={styles.actionText}>Recalibrate Profile</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.actionButton}>
                            <Text style={styles.actionIcon}>⚙️</Text>
                            <Text style={styles.actionText}>Settings</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.actionButton, { borderColor: colors.accentDanger + '40' }]} onPress={handleFullReset}>
                            <Text style={styles.actionIcon}>🗑️</Text>
                            <Text style={[styles.actionText, { color: colors.accentDanger }]}>Reset All Data</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    header: {
        marginBottom: spacing.xl,
    },
    headerLabel: {
        fontSize: typography.sizes.xs,
        fontWeight: '700',
        color: colors.accentPrimary,
        letterSpacing: 2,
    },
    headerTitle: {
        fontSize: typography.sizes.xxl,
        fontWeight: '700',
        color: colors.textPrimary,
        marginTop: spacing.xs,
    },
    profileCard: {
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    profileGradient: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: spacing.md,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.bgSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 3,
    },
    avatarText: {
        fontSize: 36,
    },
    profileInfo: {
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    profileWeight: {
        fontSize: typography.sizes.xl,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    rankBadge: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
    },
    rankText: {
        fontSize: typography.sizes.sm,
        fontWeight: '700',
        letterSpacing: 1,
    },
    percentileText: {
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
        marginTop: spacing.sm,
    },
    eloDisplay: {
        alignItems: 'center',
        backgroundColor: colors.bgSecondary,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: borderRadius.lg,
    },
    eloValue: {
        fontSize: typography.sizes.xxl,
        fontWeight: '900',
    },
    eloLabel: {
        fontSize: typography.sizes.xs,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 1,
        marginTop: spacing.xs,
    },
    sectionHeader: {
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: typography.sizes.xs,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 2,
    },
    maxesContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    maxCard: {
        flex: 1,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    maxGradient: {
        padding: spacing.md,
        alignItems: 'center',
    },
    maxIcon: {
        fontSize: 20,
        marginBottom: spacing.xs,
    },
    maxType: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 1,
        marginBottom: spacing.sm,
    },
    maxWeight: {
        fontSize: typography.sizes.lg,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    maxTier: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    maxTierText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        marginBottom: spacing.xl,
    },
    statCard: {
        width: '48%',
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    statValue: {
        fontSize: typography.sizes.xl,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 1,
        textAlign: 'center',
    },
    actionsContainer: {
        gap: spacing.sm,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    actionIcon: {
        fontSize: 20,
        marginRight: spacing.md,
    },
    actionText: {
        fontSize: typography.sizes.md,
        fontWeight: '600',
        color: colors.textSecondary,
    },
    muscleMapCard: {
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    muscleMapGradient: {
        padding: spacing.lg,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    muscleMapLegend: {
        gap: spacing.sm,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
    },
    legendDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
    },
    legendText: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    bodyGraphCard: {
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        marginBottom: spacing.lg,
        borderWidth: 2,
        borderColor: '#3A3A5A',
    },
    bodyGraphGradient: {
        padding: spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
