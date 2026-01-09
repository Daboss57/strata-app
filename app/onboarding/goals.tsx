import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '../../src/config/theme';
import { useOnboarding } from '../../src/context/OnboardingContext';

type Goal = 'strength' | 'muscle' | 'fitness' | 'weight_loss' | 'athletic';

const GOAL_OPTIONS: { goal: Goal; label: string; icon: string; description: string }[] = [
    { goal: 'strength', label: 'Get Stronger', icon: '💪', description: 'Build raw strength and power' },
    { goal: 'muscle', label: 'Build Muscle', icon: '🏋️', description: 'Gain size and definition' },
    { goal: 'fitness', label: 'General Fitness', icon: '❤️', description: 'Improve overall health' },
    { goal: 'weight_loss', label: 'Lose Weight', icon: '🔥', description: 'Burn fat, get lean' },
    { goal: 'athletic', label: 'Athletic Performance', icon: '⚡', description: 'Speed, agility, explosiveness' },
];

export default function GoalsScreen() {
    const router = useRouter();
    const { updateData } = useOnboarding();
    const [selected, setSelected] = useState<Goal[]>([]);
    const scaleAnims = useRef(GOAL_OPTIONS.map(() => new Animated.Value(1))).current;

    const toggleGoal = (goal: Goal, index: number) => {
        setSelected(prev => {
            if (prev.includes(goal)) {
                return prev.filter(g => g !== goal);
            } else if (prev.length < 3) {
                return [...prev, goal];
            }
            return prev;
        });

        // Bounce animation
        Animated.sequence([
            Animated.timing(scaleAnims[index], {
                toValue: 0.95,
                duration: 100,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnims[index], {
                toValue: 1,
                tension: 300,
                friction: 10,
                useNativeDriver: true,
            }),
        ]).start();
    };

    const handleContinue = () => {
        if (selected.length === 0) return;

        // Map primary goal
        const primaryGoal = selected[0];
        const goalMap: Record<Goal, 'strength' | 'aesthetics' | 'endurance'> = {
            'strength': 'strength',
            'muscle': 'aesthetics',
            'fitness': 'endurance',
            'weight_loss': 'aesthetics',
            'athletic': 'endurance',
        };

        updateData({
            goal: goalMap[primaryGoal],
            goals: selected, // Store all selected goals
        });

        router.push('/onboarding/availability');
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
                        <Text style={styles.step}>STEP 3 OF 5</Text>
                        <Text style={styles.title}>Your Goals</Text>
                        <Text style={styles.subtitle}>
                            What do you want to achieve? Select up to 3.
                        </Text>
                    </View>

                    {/* Options */}
                    <View style={styles.optionsContainer}>
                        {GOAL_OPTIONS.map((option, index) => {
                            const isSelected = selected.includes(option.goal);
                            const rank = selected.indexOf(option.goal) + 1;

                            return (
                                <Animated.View
                                    key={option.goal}
                                    style={{ transform: [{ scale: scaleAnims[index] }] }}
                                >
                                    <TouchableOpacity
                                        style={[
                                            styles.optionCard,
                                            isSelected && styles.optionCardSelected,
                                        ]}
                                        onPress={() => toggleGoal(option.goal, index)}
                                        activeOpacity={0.9}
                                    >
                                        <View style={styles.optionContent}>
                                            <View style={styles.optionLeft}>
                                                <Text style={styles.optionIcon}>{option.icon}</Text>
                                                <View>
                                                    <Text style={[
                                                        styles.optionLabel,
                                                        isSelected && styles.optionLabelSelected,
                                                    ]}>
                                                        {option.label}
                                                    </Text>
                                                    <Text style={styles.optionDescription}>
                                                        {option.description}
                                                    </Text>
                                                </View>
                                            </View>
                                            {isSelected && (
                                                <View style={styles.rankBadge}>
                                                    <Text style={styles.rankText}>#{rank}</Text>
                                                </View>
                                            )}
                                        </View>
                                    </TouchableOpacity>
                                </Animated.View>
                            );
                        })}
                    </View>

                    {/* Selected count */}
                    <Text style={styles.selectedCount}>
                        {selected.length}/3 selected
                    </Text>

                    {/* Continue Button */}
                    <TouchableOpacity
                        onPress={handleContinue}
                        disabled={selected.length === 0}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={selected.length > 0
                                ? [colors.accentPrimary, colors.accentSecondary]
                                : [colors.textMuted, colors.textMuted]}
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
    optionsContainer: {
        gap: spacing.sm,
    },
    optionCard: {
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        borderWidth: 2,
        borderColor: colors.glassBorder,
    },
    optionCardSelected: {
        borderColor: colors.accentPrimary,
        backgroundColor: colors.accentPrimary + '15',
    },
    optionContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    optionIcon: {
        fontSize: 28,
    },
    optionLabel: {
        fontSize: typography.sizes.md,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: 2,
    },
    optionLabelSelected: {
        color: colors.accentPrimary,
    },
    optionDescription: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    rankBadge: {
        backgroundColor: colors.accentPrimary,
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankText: {
        fontSize: typography.sizes.sm,
        fontWeight: '700',
        color: colors.bgPrimary,
    },
    selectedCount: {
        textAlign: 'center',
        fontSize: typography.sizes.sm,
        color: colors.textMuted,
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
