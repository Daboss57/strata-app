import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography, getTierColor, getTierLabel } from '../../src/config/theme';
import { calculateDOTS, estimate1RM } from '../../src/lib/strengthCalculator';
import { useOnboarding } from '../../src/context/OnboardingContext';
import type { Gender, LiftType } from '../../src/types';

export default function CalculatorScreen() {
    const { data } = useOnboarding();
    const [gender, setGender] = useState<Gender>(data.gender || 'male');
    const [bodyweight, setBodyweight] = useState(String(data.bodyweight || ''));
    const [liftType, setLiftType] = useState<LiftType>('bench');
    const [weight, setWeight] = useState('');
    const [reps, setReps] = useState('1');
    const [result, setResult] = useState<{
        estimated1RM: number;
        dotsScore: number;
        tier: number;
    } | null>(null);
    const [animatedValue] = useState(new Animated.Value(0));

    const calculate = () => {
        const bw = parseFloat(bodyweight);
        const w = parseFloat(weight);
        const r = parseInt(reps) || 1;

        if (!bw || !w || bw <= 0 || w <= 0) return;

        const estimated1RM = estimate1RM(w, r);
        const dotsScore = calculateDOTS(estimated1RM, bw, gender);

        // Calculate tier based on bodyweight ratio
        const ratio = estimated1RM / bw;
        const tiers = gender === 'male'
            ? { squat: [2.83, 2.25, 1.75, 1.25], bench: [1.95, 1.65, 1.35, 1.0], deadlift: [3.25, 2.6, 2.0, 1.5] }
            : { squat: [2.26, 1.9, 1.5, 1.0], bench: [1.35, 1.15, 0.9, 0.65], deadlift: [2.66, 2.25, 1.75, 1.25] };

        const tierRatios = tiers[liftType];
        let tier = 5;
        if (ratio >= tierRatios[0]) tier = 1;
        else if (ratio >= tierRatios[1]) tier = 2;
        else if (ratio >= tierRatios[2]) tier = 3;
        else if (ratio >= tierRatios[3]) tier = 4;

        setResult({ estimated1RM, dotsScore, tier });
        animatedValue.setValue(0);
        Animated.spring(animatedValue, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 7,
        }).start();
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
                        <Text style={styles.headerLabel}>STRENGTH CALCULATOR</Text>
                        <Text style={styles.headerTitle}>Rank a Lift</Text>
                    </View>

                    {/* Gender */}
                    <View style={styles.section}>
                        <Text style={styles.label}>BIOLOGICAL SEX</Text>
                        <View style={styles.segmentContainer}>
                            {(['male', 'female'] as Gender[]).map((g) => (
                                <TouchableOpacity
                                    key={g}
                                    style={[styles.segment, gender === g && styles.segmentActive]}
                                    onPress={() => setGender(g)}
                                >
                                    <Text style={[styles.segmentText, gender === g && styles.segmentTextActive]}>
                                        {g.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Bodyweight */}
                    <View style={styles.section}>
                        <Text style={styles.label}>BODYWEIGHT (LBS)</Text>
                        <View style={styles.inputContainer}>
                            <TextInput
                                style={styles.input}
                                value={bodyweight}
                                onChangeText={setBodyweight}
                                placeholder="165"
                                placeholderTextColor={colors.textMuted}
                                keyboardType="numeric"
                            />
                        </View>
                    </View>

                    {/* Lift Type */}
                    <View style={styles.section}>
                        <Text style={styles.label}>LIFT TYPE</Text>
                        <View style={styles.liftContainer}>
                            {(['squat', 'bench', 'deadlift'] as LiftType[]).map((lift) => (
                                <TouchableOpacity
                                    key={lift}
                                    style={[styles.liftButton, liftType === lift && styles.liftButtonActive]}
                                    onPress={() => setLiftType(lift)}
                                >
                                    <Text style={styles.liftIcon}>
                                        {lift === 'squat' ? '🦵' : lift === 'bench' ? '💪' : '🏋️'}
                                    </Text>
                                    <Text style={[styles.liftLabel, liftType === lift && styles.liftLabelActive]}>
                                        {lift.toUpperCase()}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Weight & Reps */}
                    <View style={styles.row}>
                        <View style={styles.inputSection}>
                            <Text style={styles.label}>WEIGHT (LBS)</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={weight}
                                    onChangeText={setWeight}
                                    placeholder="225"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                        <View style={styles.inputSectionSmall}>
                            <Text style={styles.label}>REPS</Text>
                            <View style={styles.inputContainer}>
                                <TextInput
                                    style={styles.input}
                                    value={reps}
                                    onChangeText={setReps}
                                    placeholder="1"
                                    placeholderTextColor={colors.textMuted}
                                    keyboardType="numeric"
                                />
                            </View>
                        </View>
                    </View>

                    {/* Calculate Button */}
                    <TouchableOpacity onPress={calculate} activeOpacity={0.9} style={styles.calculateWrapper}>
                        <LinearGradient
                            colors={[colors.accentPrimary, colors.accentSecondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.calculateButton}
                        >
                            <Text style={styles.calculateText}>CALCULATE</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    {/* Result */}
                    {result && (
                        <Animated.View
                            style={[
                                styles.resultCard,
                                {
                                    opacity: animatedValue,
                                    transform: [{
                                        scale: animatedValue.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.9, 1],
                                        }),
                                    }],
                                },
                            ]}
                        >
                            <LinearGradient
                                colors={[getTierColor(result.tier) + '30', colors.bgCard]}
                                style={styles.resultGradient}
                            >
                                <View style={[styles.tierBadge, { borderColor: getTierColor(result.tier) }]}>
                                    <Text style={[styles.tierLabel, { color: getTierColor(result.tier) }]}>
                                        TIER {['I', 'II', 'III', 'IV', 'V'][result.tier - 1]}
                                    </Text>
                                    <Text style={[styles.tierName, { color: getTierColor(result.tier) }]}>
                                        {getTierLabel(result.tier)}
                                    </Text>
                                </View>

                                <View style={styles.statsRow}>
                                    <View style={styles.statItem}>
                                        <Text style={styles.statValue}>{result.estimated1RM}</Text>
                                        <Text style={styles.statLabel}>EST. 1RM</Text>
                                    </View>
                                    <View style={styles.statDivider} />
                                    <View style={styles.statItem}>
                                        <Text style={styles.statValue}>{result.dotsScore.toFixed(1)}</Text>
                                        <Text style={styles.statLabel}>DOTS</Text>
                                    </View>
                                </View>
                            </LinearGradient>
                        </Animated.View>
                    )}
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
    section: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: typography.sizes.xs,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 1.5,
        marginBottom: spacing.sm,
    },
    segmentContainer: {
        flexDirection: 'row',
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.md,
        padding: spacing.xs,
    },
    segment: {
        flex: 1,
        paddingVertical: spacing.md,
        alignItems: 'center',
        borderRadius: borderRadius.sm,
    },
    segmentActive: {
        backgroundColor: colors.accentPrimary,
    },
    segmentText: {
        fontSize: typography.sizes.sm,
        fontWeight: '600',
        color: colors.textMuted,
    },
    segmentTextActive: {
        color: colors.bgPrimary,
    },
    inputContainer: {
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
        paddingHorizontal: spacing.md,
    },
    input: {
        fontSize: typography.sizes.xl,
        fontWeight: '600',
        color: colors.textPrimary,
        paddingVertical: spacing.md,
    },
    liftContainer: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    liftButton: {
        flex: 1,
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.md,
        padding: spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    liftButtonActive: {
        borderColor: colors.accentPrimary,
        backgroundColor: colors.accentPrimary + '15',
    },
    liftIcon: {
        fontSize: 24,
        marginBottom: spacing.xs,
    },
    liftLabel: {
        fontSize: typography.sizes.xs,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 1,
    },
    liftLabelActive: {
        color: colors.accentPrimary,
    },
    row: {
        flexDirection: 'row',
        gap: spacing.md,
        marginBottom: spacing.lg,
    },
    inputSection: {
        flex: 2,
    },
    inputSectionSmall: {
        flex: 1,
    },
    calculateWrapper: {
        marginBottom: spacing.lg,
    },
    calculateButton: {
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    calculateText: {
        fontSize: typography.sizes.md,
        fontWeight: '700',
        color: colors.bgPrimary,
        letterSpacing: 2,
    },
    resultCard: {
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    resultGradient: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    tierBadge: {
        borderWidth: 2,
        borderRadius: borderRadius.lg,
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.md,
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    tierLabel: {
        fontSize: typography.sizes.sm,
        fontWeight: '700',
        letterSpacing: 2,
    },
    tierName: {
        fontSize: typography.sizes.xxl,
        fontWeight: '700',
        letterSpacing: 3,
        marginTop: spacing.xs,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    statValue: {
        fontSize: typography.sizes.display,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    statLabel: {
        fontSize: typography.sizes.xs,
        fontWeight: '600',
        color: colors.textMuted,
        letterSpacing: 1,
        marginTop: spacing.xs,
    },
    statDivider: {
        width: 1,
        height: 40,
        backgroundColor: colors.glassBorder,
    },
});
