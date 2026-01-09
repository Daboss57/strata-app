import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '../../src/config/theme';
import { useOnboarding } from '../../src/context/OnboardingContext';

const DAY_OPTIONS = [2, 3, 4, 5, 6];

export default function AvailabilityScreen() {
    const router = useRouter();
    const { updateData } = useOnboarding();
    const [daysPerWeek, setDaysPerWeek] = useState<number>(4);

    const handleContinue = () => {
        updateData({
            daysPerWeek,
        });

        router.push('/onboarding/focus');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.bgPrimary, '#0D1117', colors.bgPrimary]}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.step}>STEP 4 OF 5</Text>
                        <Text style={styles.title}>Availability</Text>
                        <Text style={styles.subtitle}>
                            How many days per week can you train?
                        </Text>
                    </View>

                    {/* Day Selector */}
                    <View style={styles.daySelector}>
                        {DAY_OPTIONS.map(day => (
                            <TouchableOpacity
                                key={day}
                                style={[
                                    styles.dayButton,
                                    daysPerWeek === day && styles.dayButtonSelected,
                                ]}
                                onPress={() => setDaysPerWeek(day)}
                            >
                                <Text style={[
                                    styles.dayNumber,
                                    daysPerWeek === day && styles.dayNumberSelected,
                                ]}>
                                    {day}
                                </Text>
                                <Text style={[
                                    styles.dayLabel,
                                    daysPerWeek === day && styles.dayLabelSelected,
                                ]}>
                                    days
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Recommendation */}
                    <View style={styles.recommendation}>
                        <Text style={styles.recommendationTitle}>
                            {daysPerWeek === 2 && '💪 Perfect for beginners'}
                            {daysPerWeek === 3 && '🎯 Great balance'}
                            {daysPerWeek === 4 && '⚡ Optimal for most'}
                            {daysPerWeek === 5 && '🔥 Serious training'}
                            {daysPerWeek === 6 && '🏆 Advanced level'}
                        </Text>
                        <Text style={styles.recommendationText}>
                            {daysPerWeek === 2 && "Full body sessions, plenty of recovery time."}
                            {daysPerWeek === 3 && "Upper/Lower or Push/Pull/Legs split works great."}
                            {daysPerWeek === 4 && "Upper/Lower split with solid recovery."}
                            {daysPerWeek === 5 && "PPL or Bro split for maximum volume."}
                            {daysPerWeek === 6 && "PPL x2 for serious gains."}
                        </Text>
                    </View>

                    {/* Continue Button */}
                    <TouchableOpacity
                        onPress={handleContinue}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={[colors.accentPrimary, colors.accentSecondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.continueButton}
                        >
                            <Text style={styles.continueText}>CONTINUE</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
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
        flex: 1,
        padding: spacing.lg,
        justifyContent: 'space-between',
    },
    header: {
        marginTop: spacing.xl,
    },
    step: {
        fontSize: typography.sizes.xs,
        fontWeight: '700',
        color: colors.accentPrimary,
        letterSpacing: 2,
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: typography.sizes.display,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    daySelector: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: spacing.sm,
    },
    dayButton: {
        flex: 1,
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        paddingVertical: spacing.xl,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.glassBorder,
    },
    dayButtonSelected: {
        borderColor: colors.accentPrimary,
        backgroundColor: colors.accentPrimary + '20',
    },
    dayNumber: {
        fontSize: typography.sizes.xxl,
        fontWeight: '900',
        color: colors.textPrimary,
    },
    dayNumberSelected: {
        color: colors.accentPrimary,
    },
    dayLabel: {
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
    dayLabelSelected: {
        color: colors.accentPrimary,
    },
    recommendation: {
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    recommendationTitle: {
        fontSize: typography.sizes.md,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    recommendationText: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        lineHeight: 20,
    },
    continueButton: {
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    continueText: {
        fontSize: typography.sizes.md,
        fontWeight: '700',
        color: colors.bgPrimary,
        letterSpacing: 2,
    },
});
