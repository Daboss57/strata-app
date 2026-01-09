import React, { useRef, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, getTierColor, getTierLabel, getTierPercentile } from '../../src/config/theme';
import { useOnboarding } from '../../src/context/OnboardingContext';
import { getRank } from '../../src/lib/eloService';
import { calculateDOTS } from '../../src/lib/strengthCalculator';
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

export default function DashboardScreen() {
    const { data } = useOnboarding();
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Get real data from context
    const bodyweight = data.bodyweight || 165;
    const gender = data.gender || 'male';
    const squatMax = data.squatMax || 0;
    const benchMax = data.benchMax || 0;
    const deadliftMax = data.deadliftMax || 0;
    const strataSignal = data.strataSignal || 1000;

    // Calculate real tiers
    const lifts = useMemo(() => {
        const squatTier = calculateTier(squatMax, bodyweight, 'squat', gender);
        const benchTier = calculateTier(benchMax, bodyweight, 'bench', gender);
        const deadliftTier = calculateTier(deadliftMax, bodyweight, 'deadlift', gender);

        return [
            { type: 'squat' as LiftType, weight: squatMax, tier: squatTier },
            { type: 'bench' as LiftType, weight: benchMax, tier: benchTier },
            { type: 'deadlift' as LiftType, weight: deadliftMax, tier: deadliftTier },
        ];
    }, [squatMax, benchMax, deadliftMax, bodyweight, gender]);

    // Calculate overall tier (average of all lifts)
    const overallTier = useMemo(() => {
        return Math.round(lifts.reduce((sum, l) => sum + l.tier, 0) / 3);
    }, [lifts]);

    // Calculate total and DOTS
    const total = squatMax + benchMax + deadliftMax;
    const dotsScore = useMemo(() => {
        return calculateDOTS(total, bodyweight, gender);
    }, [total, bodyweight, gender]);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
        }).start();

        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.02,
                    duration: 1500,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1500,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const signalRank = getRank(strataSignal);
    const tierColor = getTierColor(overallTier);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.bgPrimary, '#0D1117', colors.bgPrimary]}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <Animated.ScrollView
                    style={[styles.scrollView, { opacity: fadeAnim }]}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.scrollContent}
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.greeting}>STRENGTH DASHBOARD</Text>
                            <Text style={styles.name}>
                                {gender === 'male' ? '♂' : '♀'} {bodyweight} lbs
                            </Text>
                        </View>
                        <View style={styles.eloContainer}>
                            <Text style={[styles.eloValue, { color: signalRank.color }]}>{strataSignal}</Text>
                            <Text style={styles.eloLabel}>SIGNAL</Text>
                        </View>
                    </View>

                    {/* Signal / Rank Card */}
                    <Animated.View style={[styles.tierCard, { transform: [{ scale: pulseAnim }], borderColor: signalRank.color }]}>
                        <LinearGradient
                            colors={[signalRank.color + '20', colors.bgCard]}
                            style={styles.tierCardGradient}
                        >
                            <View style={styles.tierCardContent}>
                                <Text style={styles.tierCardLabel}>STRATA RANK</Text>
                                <View style={styles.tierDisplay}>
                                    <Text style={[styles.tierName, { color: signalRank.color }]}>
                                        {signalRank.name}
                                    </Text>
                                </View>
                                <View style={styles.progressBarContainer}>
                                    <View style={[styles.progressBar, { width: `${Math.min(100, (strataSignal / 3000) * 100)}%`, backgroundColor: signalRank.color }]} />
                                </View>
                                <View style={styles.tierMeta}>
                                    <Text style={styles.tierMetaText}>Global Percentile: {getTierPercentile(overallTier)}</Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </Animated.View>

                    {/* Your Lifts */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>YOUR LIFTS</Text>
                        <Text style={styles.sectionSubtitle}>Based on your input</Text>
                    </View>

                    <View style={styles.stockTicker}>
                        {lifts.map((lift) => (
                            <View key={lift.type} style={styles.stockCard}>
                                <LinearGradient
                                    colors={[colors.bgCard, colors.bgSecondary]}
                                    style={styles.stockGradient}
                                >
                                    <View style={styles.stockHeader}>
                                        <Text style={styles.stockIcon}>
                                            {lift.type === 'squat' ? '🦵' : lift.type === 'bench' ? '💪' : '🏋️'}
                                        </Text>
                                        <Text style={styles.stockSymbol}>{lift.type.slice(0, 3).toUpperCase()}</Text>
                                    </View>
                                    <Text style={styles.stockValue}>{lift.weight}</Text>
                                    <Text style={styles.stockUnit}>lbs</Text>
                                    <View style={[styles.stockTier, { backgroundColor: getTierColor(lift.tier) + '20' }]}>
                                        <Text style={[styles.stockTierText, { color: getTierColor(lift.tier) }]}>
                                            {getTierLabel(lift.tier)}
                                        </Text>
                                    </View>
                                </LinearGradient>
                            </View>
                        ))}
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>QUICK STATS</Text>
                    </View>

                    <View style={styles.statsGrid}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{total}</Text>
                            <Text style={styles.statLabel}>TOTAL (LBS)</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{dotsScore.toFixed(1)}</Text>
                            <Text style={styles.statLabel}>DOTS SCORE</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{(squatMax / bodyweight).toFixed(2)}x</Text>
                            <Text style={styles.statLabel}>SQUAT/BW</Text>
                        </View>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{(benchMax / bodyweight).toFixed(2)}x</Text>
                            <Text style={styles.statLabel}>BENCH/BW</Text>
                        </View>
                    </View>
                </Animated.ScrollView>
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
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    greeting: {
        fontSize: typography.sizes.xs,
        fontWeight: '700',
        color: colors.accentPrimary,
        letterSpacing: 2,
    },
    name: {
        fontSize: typography.sizes.lg,
        fontWeight: '700',
        color: colors.textPrimary,
        marginTop: spacing.xs,
    },
    eloContainer: {
        alignItems: 'center',
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    eloValue: {
        fontSize: typography.sizes.xl,
        fontWeight: '900',
    },
    eloLabel: {
        fontSize: typography.sizes.xs,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 1,
    },
    tierCard: {
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        marginBottom: spacing.lg,
        borderWidth: 1,
    },
    tierCardGradient: {
        padding: spacing.xl,
    },
    tierCardContent: {
        alignItems: 'center',
    },
    tierCardLabel: {
        fontSize: typography.sizes.xs,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 2,
        marginBottom: spacing.sm,
    },
    tierDisplay: {
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    tierName: {
        fontSize: 36,
        fontWeight: '900',
        letterSpacing: 4,
        marginTop: spacing.xs,
        textShadowColor: 'rgba(0,0,0,0.5)',
        textShadowOffset: { width: 0, height: 2 },
        textShadowRadius: 4,
    },
    progressBarContainer: {
        width: '100%',
        height: 8,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 4,
        marginBottom: spacing.md,
        overflow: 'hidden',
    },
    progressBar: {
        height: '100%',
        borderRadius: 4,
    },
    tierMeta: {
        marginTop: spacing.xs,
        backgroundColor: colors.bgSecondary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.full,
    },
    tierMetaText: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
        fontWeight: '600',
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
    sectionSubtitle: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs,
    },
    stockTicker: {
        flexDirection: 'row',
        marginBottom: spacing.xl,
        gap: spacing.sm,
    },
    stockCard: {
        flex: 1,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    stockGradient: {
        padding: spacing.md,
        alignItems: 'center',
    },
    stockHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    stockIcon: {
        fontSize: 16,
        marginRight: 4,
    },
    stockSymbol: {
        fontSize: typography.sizes.xs,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 1,
    },
    stockValue: {
        fontSize: typography.sizes.xl,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    stockUnit: {
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
        marginBottom: spacing.sm,
    },
    stockTier: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    stockTierText: {
        fontSize: 10,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    statCard: {
        width: (width - spacing.lg * 2 - spacing.sm) / 2 - 1,
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    statValue: {
        fontSize: typography.sizes.xxl,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    statLabel: {
        fontSize: typography.sizes.xs,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 1,
    },
});
