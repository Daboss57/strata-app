import React, { useEffect, useRef, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableOpacity,
    Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { colors, spacing, borderRadius, typography, getTierColor, getTierLabel } from '../../src/config/theme';
import { useOnboarding } from '../../src/context/OnboardingContext';
import { calculateDOTS, getTierFromWeight } from '../../src/lib/strengthCalculator';
import type { LiftType } from '../../src/types';

const { width, height } = Dimensions.get('window');

interface LiftResult {
    type: LiftType;
    weight: number;
    tier: number;
    label: string;
    dotsScore: number;
}

export default function RevealScreen() {
    const { data, completeOnboarding } = useOnboarding();
    const [phase, setPhase] = useState<'scanning' | 'revealing' | 'complete'>('scanning');
    const [results, setResults] = useState<LiftResult[]>([]);
    const [overallTier, setOverallTier] = useState(5);
    const [strongestLift, setStrongestLift] = useState<LiftType>('bench');
    const [weakestLift, setWeakestLift] = useState<LiftType>('squat');

    // Check if user is a beginner without Big 3 data
    const isBeginner = !data.squatMax && !data.benchMax && !data.deadliftMax;
    const hasPartialData = Boolean(data.squatMax || data.benchMax || data.deadliftMax);

    // Animation values
    const scanLinePos = useRef(new Animated.Value(0)).current;
    const scanOpacity = useRef(new Animated.Value(1)).current;
    const gridOpacity = useRef(new Animated.Value(0.3)).current;
    const resultOpacity = useRef(new Animated.Value(0)).current;
    const tierScale = useRef(new Animated.Value(0)).current;
    const cardOpacity1 = useRef(new Animated.Value(0)).current;
    const cardOpacity2 = useRef(new Animated.Value(0)).current;
    const cardOpacity3 = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (!isBeginner) {
            calculateResults();
        }
        startScanAnimation();
    }, []);

    const calculateResults = () => {
        const bodyweight = data.bodyweight || 165;
        const gender = data.gender || 'male';

        // Use bodyweight ratios for tier estimation since we don't have DB connection yet
        const tiers: Record<LiftType, { 4: number; 3: number; 2: number; 1: number }> = gender === 'male'
            ? {
                squat: { 4: 1.25, 3: 1.75, 2: 2.25, 1: 2.83 },
                bench: { 4: 1.00, 3: 1.35, 2: 1.65, 1: 1.95 },
                deadlift: { 4: 1.50, 3: 2.00, 2: 2.60, 1: 3.25 },
            }
            : {
                squat: { 4: 1.00, 3: 1.50, 2: 1.90, 1: 2.26 },
                bench: { 4: 0.65, 3: 0.90, 2: 1.15, 1: 1.35 },
                deadlift: { 4: 1.25, 3: 1.75, 2: 2.25, 1: 2.66 },
            };

        const lifts: { type: LiftType; weight: number }[] = [
            { type: 'squat', weight: data.squatMax || 0 },
            { type: 'bench', weight: data.benchMax || 0 },
            { type: 'deadlift', weight: data.deadliftMax || 0 },
        ];

        const calculated: LiftResult[] = lifts.map(lift => {
            const ratio = lift.weight / bodyweight;
            const tierRatios = tiers[lift.type];

            let tier = 5;
            if (ratio >= tierRatios[1]) tier = 1;
            else if (ratio >= tierRatios[2]) tier = 2;
            else if (ratio >= tierRatios[3]) tier = 3;
            else if (ratio >= tierRatios[4]) tier = 4;

            const dotsScore = calculateDOTS(lift.weight, bodyweight, gender);

            return {
                type: lift.type,
                weight: lift.weight,
                tier,
                label: getTierLabel(tier),
                dotsScore,
            };
        });

        setResults(calculated);

        // Find strongest/weakest
        const sorted = [...calculated].sort((a, b) => a.tier - b.tier);
        setStrongestLift(sorted[0].type);
        setWeakestLift(sorted[sorted.length - 1].type);

        // Overall tier is average
        const avgTier = Math.round(calculated.reduce((sum, r) => sum + r.tier, 0) / 3);
        setOverallTier(avgTier);
    };

    const startScanAnimation = () => {
        // Multiple scan passes
        const scanSequence = Animated.sequence([
            Animated.timing(scanLinePos, {
                toValue: height,
                duration: 1500,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
            Animated.timing(scanLinePos, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
            }),
            Animated.timing(scanLinePos, {
                toValue: height,
                duration: 1000,
                easing: Easing.linear,
                useNativeDriver: true,
            }),
        ]);

        Animated.parallel([
            scanSequence,
            Animated.timing(gridOpacity, {
                toValue: 0.6,
                duration: 2500,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setPhase('revealing');
            startRevealAnimation();
        });
    };

    const startRevealAnimation = () => {
        // Fade out scan elements
        Animated.timing(scanOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start();

        // Fade in results
        Animated.sequence([
            Animated.timing(resultOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            Animated.spring(tierScale, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.stagger(200, [
                Animated.timing(cardOpacity1, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.timing(cardOpacity2, { toValue: 1, duration: 300, useNativeDriver: true }),
                Animated.timing(cardOpacity3, { toValue: 1, duration: 300, useNativeDriver: true }),
            ]),
        ]).start(() => {
            setPhase('complete');
            startPulseAnimation();
        });
    };

    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1.05,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    const handleContinue = () => {
        completeOnboarding();
        router.replace('/home');
    };

    const cardOpacities = [cardOpacity1, cardOpacity2, cardOpacity3];
    const tierColor = getTierColor(overallTier);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.bgPrimary, '#0D1117', colors.bgPrimary]}
                style={StyleSheet.absoluteFill}
            />

            {/* Animated grid */}
            <Animated.View style={[styles.gridContainer, { opacity: gridOpacity }]}>
                {[...Array(25)].map((_, i) => (
                    <View key={`h${i}`} style={[styles.gridLine, { top: i * 32 }]} />
                ))}
                {[...Array(12)].map((_, i) => (
                    <View key={`v${i}`} style={[styles.gridLineV, { left: i * (width / 11) }]} />
                ))}
            </Animated.View>

            {/* Scan line */}
            <Animated.View
                style={[
                    styles.scanLine,
                    {
                        opacity: scanOpacity,
                        transform: [{ translateY: scanLinePos }],
                    },
                ]}
            >
                <LinearGradient
                    colors={['transparent', colors.accentPrimary, 'transparent']}
                    style={styles.scanLineGradient}
                />
            </Animated.View>

            <SafeAreaView style={styles.content}>
                {/* Progress */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                { width: phase === 'complete' ? '100%' : '90%' }
                            ]}
                        />
                    </View>
                    <Text style={styles.progressText}>
                        {phase === 'scanning' ? 'Analyzing...' : 'Complete'}
                    </Text>
                </View>

                {/* Scanning state */}
                {phase === 'scanning' && (
                    <View style={styles.scanningContainer}>
                        <Text style={styles.scanningText}>ANALYZING STRENGTH DATA</Text>
                        <View style={styles.scanningDots}>
                            <Animated.Text style={styles.dot}>●</Animated.Text>
                            <Animated.Text style={styles.dot}>●</Animated.Text>
                            <Animated.Text style={styles.dot}>●</Animated.Text>
                        </View>
                    </View>
                )}

                {/* Results */}
                <Animated.View style={[styles.resultsContainer, { opacity: resultOpacity }]}>
                    {/* BEGINNER WELCOME - No Big 3 data */}
                    {isBeginner ? (
                        <Animated.View
                            style={[
                                styles.tierBadgeContainer,
                                { transform: [{ scale: Animated.multiply(tierScale, pulseAnim) }] },
                            ]}
                        >
                            <View style={[styles.tierBadge, { borderColor: colors.accentPrimary }]}>
                                <LinearGradient
                                    colors={[colors.accentPrimary + '30', 'transparent']}
                                    style={styles.tierGlow}
                                />
                                <Text style={styles.tierLabel}>WELCOME TO</Text>
                                <Text style={[styles.tierNumber, { color: colors.accentPrimary, fontSize: 42 }]}>
                                    STRATA
                                </Text>
                                <Text style={[styles.tierName, { color: colors.textSecondary }]}>
                                    Your fitness journey starts now
                                </Text>

                                {/* Show user's goals */}
                                {data.goals && data.goals.length > 0 && (
                                    <View style={{ marginTop: spacing.lg }}>
                                        <Text style={{ color: colors.textMuted, fontSize: 12, marginBottom: spacing.sm }}>
                                            YOUR GOALS
                                        </Text>
                                        {data.goals.slice(0, 3).map((goal, i) => (
                                            <Text key={goal} style={{ color: colors.textPrimary, fontSize: 14, marginBottom: 4 }}>
                                                {i + 1}. {goal.charAt(0).toUpperCase() + goal.slice(1).replace('_', ' ')}
                                            </Text>
                                        ))}
                                    </View>
                                )}
                            </View>
                        </Animated.View>
                    ) : (
                        /* EXPERIENCED USER - Show tier analysis */
                        <Animated.View
                            style={[
                                styles.tierBadgeContainer,
                                { transform: [{ scale: Animated.multiply(tierScale, pulseAnim) }] },
                            ]}
                        >
                            <View style={[styles.tierBadge, { borderColor: tierColor }]}>
                                <LinearGradient
                                    colors={[tierColor + '30', 'transparent']}
                                    style={styles.tierGlow}
                                />
                                <Text style={styles.tierLabel}>YOUR STRENGTH PROFILE</Text>
                                <Text style={[styles.tierNumber, { color: tierColor }]}>
                                    TIER {['I', 'II', 'III', 'IV', 'V'][overallTier - 1]}
                                </Text>
                                <Text style={[styles.tierName, { color: tierColor }]}>
                                    {getTierLabel(overallTier)}
                                </Text>
                            </View>
                        </Animated.View>
                    )}

                    {/* Lift cards - only show for experienced users */}
                    {!isBeginner && (
                        <View style={styles.liftCardsContainer}>
                            {results.map((result, index) => (
                                <Animated.View
                                    key={result.type}
                                    style={[styles.liftResultCard, { opacity: cardOpacities[index] }]}
                                >
                                    <LinearGradient
                                        colors={[colors.bgCard, colors.bgSecondary]}
                                        style={styles.liftResultGradient}
                                    >
                                        <View style={styles.liftResultHeader}>
                                            <Text style={styles.liftResultIcon}>
                                                {result.type === 'squat' ? '🦵' : result.type === 'bench' ? '💪' : '🏋️'}
                                            </Text>
                                            <Text style={styles.liftResultName}>{result.type.toUpperCase()}</Text>
                                        </View>
                                        <Text style={styles.liftResultWeight}>{result.weight} lbs</Text>
                                        <View style={[styles.liftResultTier, { backgroundColor: getTierColor(result.tier) + '20' }]}>
                                            <Text style={[styles.liftResultTierText, { color: getTierColor(result.tier) }]}>
                                                {result.label}
                                            </Text>
                                        </View>
                                    </LinearGradient>
                                </Animated.View>
                            ))}
                        </View>
                    )}

                    {/* Insights - only show for experienced users */}
                    {!isBeginner && (
                        <View style={styles.insightsContainer}>
                            <View style={styles.insightCard}>
                                <Text style={styles.insightLabel}>STRONGEST LIFT</Text>
                                <Text style={styles.insightValue}>
                                    {strongestLift === 'squat' ? '🦵' : strongestLift === 'bench' ? '💪' : '🏋️'} {strongestLift.toUpperCase()}
                                </Text>
                            </View>
                            <View style={styles.insightCard}>
                                <Text style={styles.insightLabel}>NEEDS WORK</Text>
                                <Text style={styles.insightValue}>
                                    {weakestLift === 'squat' ? '🦵' : weakestLift === 'bench' ? '💪' : '🏋️'} {weakestLift.toUpperCase()}
                                </Text>
                            </View>
                        </View>
                    )}

                    {/* Beginner tips */}
                    {isBeginner && (
                        <View style={styles.insightsContainer}>
                            <View style={[styles.insightCard, { flex: 1 }]}>
                                <Text style={styles.insightLabel}>NEXT STEP</Text>
                                <Text style={styles.insightValue}>Complete your first workout!</Text>
                            </View>
                        </View>
                    )}
                </Animated.View>

                {/* CTA */}
                {phase === 'complete' && (
                    <View style={styles.footer}>
                        <TouchableOpacity onPress={handleContinue} activeOpacity={0.9}>
                            <LinearGradient
                                colors={[colors.accentPrimary, colors.accentSecondary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.continueButton}
                            >
                                <Text style={styles.continueText}>START TRACKING</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
                )}
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
    },
    gridContainer: {
        ...StyleSheet.absoluteFillObject,
    },
    gridLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: colors.accentPrimary,
    },
    gridLineV: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 1,
        backgroundColor: colors.accentPrimary,
    },
    scanLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 4,
        zIndex: 10,
    },
    scanLineGradient: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: spacing.lg,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: spacing.md,
        marginBottom: spacing.xl,
    },
    progressBar: {
        flex: 1,
        height: 4,
        backgroundColor: colors.bgCard,
        borderRadius: 2,
        marginRight: spacing.md,
        overflow: 'hidden',
    },
    progressFill: {
        height: 4,
        backgroundColor: colors.accentPrimary,
        borderRadius: 2,
    },
    progressText: {
        fontSize: typography.sizes.xs,
        color: colors.accentPrimary,
        fontWeight: '600',
    },
    scanningContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scanningText: {
        fontSize: typography.sizes.lg,
        fontWeight: '700',
        color: colors.accentPrimary,
        letterSpacing: 3,
        marginBottom: spacing.lg,
    },
    scanningDots: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    dot: {
        fontSize: 24,
        color: colors.accentPrimary,
    },
    resultsContainer: {
        flex: 1,
        alignItems: 'center',
    },
    tierBadgeContainer: {
        marginBottom: spacing.xl,
    },
    tierBadge: {
        borderWidth: 2,
        borderRadius: borderRadius.xl,
        paddingVertical: spacing.xl,
        paddingHorizontal: spacing.xxl,
        alignItems: 'center',
        overflow: 'hidden',
    },
    tierGlow: {
        ...StyleSheet.absoluteFillObject,
    },
    tierLabel: {
        fontSize: typography.sizes.xs,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 2,
        marginBottom: spacing.sm,
    },
    tierNumber: {
        fontSize: typography.sizes.lg,
        fontWeight: '700',
        letterSpacing: 2,
    },
    tierName: {
        fontSize: typography.sizes.display,
        fontWeight: '900',
        letterSpacing: 4,
        marginTop: spacing.xs,
    },
    liftCardsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: spacing.lg,
    },
    liftResultCard: {
        flex: 1,
        marginHorizontal: 4,
        borderRadius: borderRadius.md,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    liftResultGradient: {
        padding: spacing.md,
        alignItems: 'center',
    },
    liftResultHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    liftResultIcon: {
        fontSize: 16,
        marginRight: spacing.xs,
    },
    liftResultName: {
        fontSize: typography.sizes.xs,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 1,
    },
    liftResultWeight: {
        fontSize: typography.sizes.lg,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    liftResultTier: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.full,
    },
    liftResultTierText: {
        fontSize: typography.sizes.xs,
        fontWeight: '700',
        letterSpacing: 1,
    },
    insightsContainer: {
        flexDirection: 'row',
        width: '100%',
        gap: spacing.md,
    },
    insightCard: {
        flex: 1,
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    insightLabel: {
        fontSize: typography.sizes.xs,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 1,
        marginBottom: spacing.xs,
    },
    insightValue: {
        fontSize: typography.sizes.sm,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    footer: {
        paddingVertical: spacing.lg,
    },
    continueButton: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.lg,
    },
    continueText: {
        fontSize: typography.sizes.md,
        fontWeight: '700',
        color: colors.bgPrimary,
        letterSpacing: 2,
    },
});
