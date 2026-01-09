import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    Switch,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '../../src/config/theme';
import { useOnboarding } from '../../src/context/OnboardingContext';
import { estimate1RM } from '../../src/lib/strengthCalculator';

export default function Big3Screen() {
    const { data, updateData } = useOnboarding();
    const [knowsMaxes, setKnowsMaxes] = useState(true);

    // Direct max inputs
    const [squatMax, setSquatMax] = useState('');
    const [benchMax, setBenchMax] = useState('');
    const [deadliftMax, setDeadliftMax] = useState('');

    // Rep-based inputs
    const [squatWeight, setSquatWeight] = useState('');
    const [squatReps, setSquatReps] = useState('');
    const [benchWeight, setBenchWeight] = useState('');
    const [benchReps, setBenchReps] = useState('');
    const [deadliftWeight, setDeadliftWeight] = useState('');
    const [deadliftReps, setDeadliftReps] = useState('');

    const getCalculatedMax = useCallback((weight: string, reps: string): number | null => {
        const w = parseFloat(weight);
        const r = parseInt(reps);
        if (!w || !r || r <= 0) return null;
        return estimate1RM(w, r);
    }, []);

    const hasAllMaxes = knowsMaxes
        ? Boolean(squatMax && benchMax && deadliftMax)
        : Boolean(
            squatWeight && squatReps &&
            benchWeight && benchReps &&
            deadliftWeight && deadliftReps
        );

    const handleContinue = () => {
        if (knowsMaxes) {
            updateData({
                squatMax: parseFloat(squatMax) || null,
                benchMax: parseFloat(benchMax) || null,
                deadliftMax: parseFloat(deadliftMax) || null,
            });
        } else {
            updateData({
                squatMax: getCalculatedMax(squatWeight, squatReps),
                benchMax: getCalculatedMax(benchWeight, benchReps),
                deadliftMax: getCalculatedMax(deadliftWeight, deadliftReps),
            });
        }
        router.push('/onboarding/goals');
    };

    const squatCalc = getCalculatedMax(squatWeight, squatReps);
    const benchCalc = getCalculatedMax(benchWeight, benchReps);
    const deadliftCalc = getCalculatedMax(deadliftWeight, deadliftReps);

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <LinearGradient
                colors={[colors.bgPrimary, '#0D1117', colors.bgPrimary]}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.content} edges={['top', 'left', 'right']}>
                {/* Progress indicator */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '66%' }]} />
                    </View>
                    <Text style={styles.progressText}>Step 2 of 3</Text>
                </View>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.stepLabel}>THE AUDIT</Text>
                        <Text style={styles.title}>Your Big 3</Text>
                        <Text style={styles.subtitle}>
                            Enter your 1-rep max (or best recent set){'\n'}
                            for each powerlifting movement
                        </Text>
                    </View>

                    {/* Toggle */}
                    <View style={styles.toggleContainer}>
                        <Text style={[styles.toggleLabel, !knowsMaxes && styles.toggleLabelActive]}>
                            I'll enter my reps
                        </Text>
                        <Switch
                            value={knowsMaxes}
                            onValueChange={setKnowsMaxes}
                            trackColor={{ false: colors.accentSecondary, true: colors.accentPrimary }}
                            thumbColor={colors.textPrimary}
                        />
                        <Text style={[styles.toggleLabel, knowsMaxes && styles.toggleLabelActive]}>
                            I know my maxes
                        </Text>
                    </View>

                    {/* Lift Cards - Inline to prevent re-renders */}
                    <View style={styles.liftsContainer}>
                        {/* SQUAT */}
                        <View style={styles.liftCard}>
                            <LinearGradient
                                colors={[colors.bgCard, colors.bgSecondary]}
                                style={styles.liftGradient}
                            >
                                <View style={styles.liftHeader}>
                                    <Text style={styles.liftIcon}>🦵</Text>
                                    <Text style={styles.liftName}>SQUAT</Text>
                                </View>
                                {knowsMaxes ? (
                                    <View style={styles.maxInputContainer}>
                                        <TextInput
                                            style={styles.maxInput}
                                            value={squatMax}
                                            onChangeText={setSquatMax}
                                            placeholder="---"
                                            placeholderTextColor={colors.textMuted}
                                            keyboardType="number-pad"
                                            returnKeyType="done"
                                        />
                                        <Text style={styles.maxUnit}>lbs</Text>
                                    </View>
                                ) : (
                                    <View style={styles.repInputContainer}>
                                        <View style={styles.repInputGroup}>
                                            <TextInput
                                                style={styles.repInput}
                                                value={squatWeight}
                                                onChangeText={setSquatWeight}
                                                placeholder="Wt"
                                                placeholderTextColor={colors.textMuted}
                                                keyboardType="number-pad"
                                            />
                                            <Text style={styles.repInputLabel}>lbs</Text>
                                        </View>
                                        <Text style={styles.repX}>×</Text>
                                        <View style={styles.repInputGroup}>
                                            <TextInput
                                                style={styles.repInput}
                                                value={squatReps}
                                                onChangeText={setSquatReps}
                                                placeholder="#"
                                                placeholderTextColor={colors.textMuted}
                                                keyboardType="number-pad"
                                            />
                                            <Text style={styles.repInputLabel}>reps</Text>
                                        </View>
                                        {squatCalc && (
                                            <View style={styles.estimatedMax}>
                                                <Text style={styles.estimatedLabel}>≈ {Math.round(squatCalc)}</Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </LinearGradient>
                        </View>

                        {/* BENCH */}
                        <View style={styles.liftCard}>
                            <LinearGradient
                                colors={[colors.bgCard, colors.bgSecondary]}
                                style={styles.liftGradient}
                            >
                                <View style={styles.liftHeader}>
                                    <Text style={styles.liftIcon}>💪</Text>
                                    <Text style={styles.liftName}>BENCH PRESS</Text>
                                </View>
                                {knowsMaxes ? (
                                    <View style={styles.maxInputContainer}>
                                        <TextInput
                                            style={styles.maxInput}
                                            value={benchMax}
                                            onChangeText={setBenchMax}
                                            placeholder="---"
                                            placeholderTextColor={colors.textMuted}
                                            keyboardType="number-pad"
                                            returnKeyType="done"
                                        />
                                        <Text style={styles.maxUnit}>lbs</Text>
                                    </View>
                                ) : (
                                    <View style={styles.repInputContainer}>
                                        <View style={styles.repInputGroup}>
                                            <TextInput
                                                style={styles.repInput}
                                                value={benchWeight}
                                                onChangeText={setBenchWeight}
                                                placeholder="Wt"
                                                placeholderTextColor={colors.textMuted}
                                                keyboardType="number-pad"
                                            />
                                            <Text style={styles.repInputLabel}>lbs</Text>
                                        </View>
                                        <Text style={styles.repX}>×</Text>
                                        <View style={styles.repInputGroup}>
                                            <TextInput
                                                style={styles.repInput}
                                                value={benchReps}
                                                onChangeText={setBenchReps}
                                                placeholder="#"
                                                placeholderTextColor={colors.textMuted}
                                                keyboardType="number-pad"
                                            />
                                            <Text style={styles.repInputLabel}>reps</Text>
                                        </View>
                                        {benchCalc && (
                                            <View style={styles.estimatedMax}>
                                                <Text style={styles.estimatedLabel}>≈ {Math.round(benchCalc)}</Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </LinearGradient>
                        </View>

                        {/* DEADLIFT */}
                        <View style={styles.liftCard}>
                            <LinearGradient
                                colors={[colors.bgCard, colors.bgSecondary]}
                                style={styles.liftGradient}
                            >
                                <View style={styles.liftHeader}>
                                    <Text style={styles.liftIcon}>🏋️</Text>
                                    <Text style={styles.liftName}>DEADLIFT</Text>
                                </View>
                                {knowsMaxes ? (
                                    <View style={styles.maxInputContainer}>
                                        <TextInput
                                            style={styles.maxInput}
                                            value={deadliftMax}
                                            onChangeText={setDeadliftMax}
                                            placeholder="---"
                                            placeholderTextColor={colors.textMuted}
                                            keyboardType="number-pad"
                                            returnKeyType="done"
                                        />
                                        <Text style={styles.maxUnit}>lbs</Text>
                                    </View>
                                ) : (
                                    <View style={styles.repInputContainer}>
                                        <View style={styles.repInputGroup}>
                                            <TextInput
                                                style={styles.repInput}
                                                value={deadliftWeight}
                                                onChangeText={setDeadliftWeight}
                                                placeholder="Wt"
                                                placeholderTextColor={colors.textMuted}
                                                keyboardType="number-pad"
                                            />
                                            <Text style={styles.repInputLabel}>lbs</Text>
                                        </View>
                                        <Text style={styles.repX}>×</Text>
                                        <View style={styles.repInputGroup}>
                                            <TextInput
                                                style={styles.repInput}
                                                value={deadliftReps}
                                                onChangeText={setDeadliftReps}
                                                placeholder="#"
                                                placeholderTextColor={colors.textMuted}
                                                keyboardType="number-pad"
                                            />
                                            <Text style={styles.repInputLabel}>reps</Text>
                                        </View>
                                        {deadliftCalc && (
                                            <View style={styles.estimatedMax}>
                                                <Text style={styles.estimatedLabel}>≈ {Math.round(deadliftCalc)}</Text>
                                            </View>
                                        )}
                                    </View>
                                )}
                            </LinearGradient>
                        </View>
                    </View>

                    {!knowsMaxes && (
                        <Text style={styles.formulaNote}>
                            Using Brzycki formula to estimate your 1RM
                        </Text>
                    )}
                </ScrollView>

                {/* Continue Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={handleContinue}
                        disabled={!hasAllMaxes}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={hasAllMaxes
                                ? [colors.accentPrimary, colors.accentSecondary]
                                : [colors.textMuted, colors.textMuted]
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.continueButton}
                        >
                            <Text style={styles.continueText}>ANALYZE MY STRENGTH</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
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
    },
    progressFill: {
        height: 4,
        backgroundColor: colors.accentPrimary,
        borderRadius: 2,
    },
    progressText: {
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
        fontWeight: '600',
    },
    header: {
        marginBottom: spacing.lg,
    },
    stepLabel: {
        fontSize: typography.sizes.xs,
        fontWeight: '700',
        color: colors.accentPrimary,
        letterSpacing: 2,
        marginBottom: spacing.xs,
    },
    title: {
        fontSize: typography.sizes.xxl,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    toggleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    toggleLabel: {
        fontSize: typography.sizes.sm,
        color: colors.textMuted,
        marginHorizontal: spacing.md,
    },
    toggleLabelActive: {
        color: colors.accentPrimary,
        fontWeight: '600',
    },
    liftsContainer: {
        gap: spacing.md,
    },
    liftCard: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    liftGradient: {
        padding: spacing.lg,
    },
    liftHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    liftIcon: {
        fontSize: 24,
        marginRight: spacing.sm,
    },
    liftName: {
        fontSize: typography.sizes.sm,
        fontWeight: '700',
        color: colors.textSecondary,
        letterSpacing: 2,
    },
    maxInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    maxInput: {
        fontSize: typography.sizes.display,
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
        minWidth: 140,
        paddingVertical: spacing.sm,
    },
    maxUnit: {
        fontSize: typography.sizes.lg,
        fontWeight: '600',
        color: colors.textMuted,
        marginLeft: spacing.sm,
    },
    repInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
    },
    repInputGroup: {
        alignItems: 'center',
    },
    repInput: {
        fontSize: typography.sizes.xl,
        fontWeight: '700',
        color: colors.textPrimary,
        textAlign: 'center',
        backgroundColor: colors.bgSecondary,
        borderRadius: borderRadius.md,
        paddingVertical: spacing.sm,
        paddingHorizontal: spacing.md,
        minWidth: 70,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    repInputLabel: {
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
    repX: {
        fontSize: typography.sizes.xl,
        fontWeight: '700',
        color: colors.textMuted,
        marginHorizontal: spacing.md,
    },
    estimatedMax: {
        marginLeft: spacing.md,
        backgroundColor: colors.accentPrimary + '20',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    estimatedLabel: {
        fontSize: typography.sizes.sm,
        fontWeight: '700',
        color: colors.accentPrimary,
    },
    formulaNote: {
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
        textAlign: 'center',
        marginTop: spacing.lg,
    },
    footer: {
        paddingVertical: spacing.lg,
    },
    continueButton: {
        flexDirection: 'row',
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
