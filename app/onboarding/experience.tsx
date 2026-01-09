import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '../../src/config/theme';
import { useOnboarding } from '../../src/context/OnboardingContext';

const { width } = Dimensions.get('window');

type ExperienceLevel = 'never' | 'beginner' | 'intermediate' | 'experienced' | 'advanced';

const EXPERIENCE_OPTIONS: { level: ExperienceLevel; label: string; time: string; description: string }[] = [
    { level: 'never', label: 'Brand New', time: 'Never trained', description: "I've never lifted weights before" },
    { level: 'beginner', label: 'Beginner', time: '< 6 months', description: "I'm still learning the basics" },
    { level: 'intermediate', label: 'Intermediate', time: '6-12 months', description: 'I know my way around the gym' },
    { level: 'experienced', label: 'Experienced', time: '1-3 years', description: 'Consistent training for years' },
    { level: 'advanced', label: 'Advanced', time: '3+ years', description: 'Serious lifter, know my numbers' },
];

export default function ExperienceScreen() {
    const router = useRouter();
    const { updateData } = useOnboarding();
    const [selected, setSelected] = useState<ExperienceLevel | null>(null);
    const scaleAnims = useRef(EXPERIENCE_OPTIONS.map(() => new Animated.Value(1))).current;

    const handleSelect = (level: ExperienceLevel, index: number) => {
        setSelected(level);

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
        if (!selected) return;

        // Map to simplified experience type
        const experienceMap: Record<ExperienceLevel, 'beginner' | 'intermediate' | 'advanced'> = {
            'never': 'beginner',
            'beginner': 'beginner',
            'intermediate': 'intermediate',
            'experienced': 'advanced',
            'advanced': 'advanced',
        };

        updateData({
            experience: experienceMap[selected],
            experienceLevel: selected, // Store detailed level
        });

        // Route based on experience
        if (selected === 'never' || selected === 'beginner') {
            // Beginners skip Big 3, go to goals
            router.push('/onboarding/goals');
        } else {
            // Experienced users can optionally enter Big 3
            router.push('/onboarding/big3');
        }
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
                        <Text style={styles.step}>STEP 2 OF 5</Text>
                        <Text style={styles.title}>Your Experience</Text>
                        <Text style={styles.subtitle}>
                            How long have you been strength training?
                        </Text>
                    </View>

                    {/* Options */}
                    <View style={styles.optionsContainer}>
                        {EXPERIENCE_OPTIONS.map((option, index) => (
                            <Animated.View
                                key={option.level}
                                style={{ transform: [{ scale: scaleAnims[index] }] }}
                            >
                                <TouchableOpacity
                                    style={[
                                        styles.optionCard,
                                        selected === option.level && styles.optionCardSelected,
                                    ]}
                                    onPress={() => handleSelect(option.level, index)}
                                    activeOpacity={0.9}
                                >
                                    <View style={styles.optionContent}>
                                        <View>
                                            <Text style={[
                                                styles.optionLabel,
                                                selected === option.level && styles.optionLabelSelected,
                                            ]}>
                                                {option.label}
                                            </Text>
                                            <Text style={styles.optionDescription}>
                                                {option.description}
                                            </Text>
                                        </View>
                                        <View style={[
                                            styles.timeBadge,
                                            selected === option.level && styles.timeBadgeSelected,
                                        ]}>
                                            <Text style={[
                                                styles.timeText,
                                                selected === option.level && styles.timeTextSelected,
                                            ]}>
                                                {option.time}
                                            </Text>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            </Animated.View>
                        ))}
                    </View>

                    {/* Continue Button */}
                    <TouchableOpacity
                        onPress={handleContinue}
                        disabled={!selected}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={selected
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
    optionLabel: {
        fontSize: typography.sizes.lg,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    optionLabelSelected: {
        color: colors.accentPrimary,
    },
    optionDescription: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    timeBadge: {
        backgroundColor: colors.bgSecondary,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    timeBadgeSelected: {
        backgroundColor: colors.accentPrimary,
    },
    timeText: {
        fontSize: typography.sizes.xs,
        fontWeight: '700',
        color: colors.textMuted,
    },
    timeTextSelected: {
        color: colors.bgPrimary,
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
