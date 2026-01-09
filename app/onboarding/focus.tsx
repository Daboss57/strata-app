import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '../../src/config/theme';
import { useOnboarding } from '../../src/context/OnboardingContext';

type MuscleGroup = 'chest' | 'back' | 'shoulders' | 'arms' | 'core' | 'legs' | 'glutes';

const MUSCLE_GROUPS: { id: MuscleGroup; label: string; icon: string }[] = [
    { id: 'chest', label: 'Chest', icon: '💪' },
    { id: 'back', label: 'Back', icon: '🎯' },
    { id: 'shoulders', label: 'Shoulders', icon: '🔝' },
    { id: 'arms', label: 'Arms', icon: '💪' },
    { id: 'core', label: 'Core', icon: '🔥' },
    { id: 'legs', label: 'Legs', icon: '🦵' },
    { id: 'glutes', label: 'Glutes', icon: '🍑' },
];

export default function FocusScreen() {
    const router = useRouter();
    const { updateData } = useOnboarding();
    const [selected, setSelected] = useState<MuscleGroup[]>([]);

    const toggleMuscle = (muscle: MuscleGroup) => {
        setSelected(prev => {
            if (prev.includes(muscle)) {
                return prev.filter(m => m !== muscle);
            } else if (prev.length < 3) {
                return [...prev, muscle];
            }
            return prev;
        });
    };

    const handleContinue = () => {
        updateData({
            focusAreas: selected,
        });

        router.push('/onboarding/reveal');
    };

    const handleSkip = () => {
        router.push('/onboarding/reveal');
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
                        <Text style={styles.step}>STEP 5 OF 5</Text>
                        <Text style={styles.title}>Focus Areas</Text>
                        <Text style={styles.subtitle}>
                            Which areas do you most want to improve? Select up to 3 (optional).
                        </Text>
                    </View>

                    {/* Muscle Grid */}
                    <ScrollView
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.muscleGrid}
                    >
                        {MUSCLE_GROUPS.map(muscle => {
                            const isSelected = selected.includes(muscle.id);
                            return (
                                <TouchableOpacity
                                    key={muscle.id}
                                    style={[
                                        styles.muscleCard,
                                        isSelected && styles.muscleCardSelected,
                                    ]}
                                    onPress={() => toggleMuscle(muscle.id)}
                                >
                                    <Text style={styles.muscleIcon}>{muscle.icon}</Text>
                                    <Text style={[
                                        styles.muscleLabel,
                                        isSelected && styles.muscleLabelSelected,
                                    ]}>
                                        {muscle.label}
                                    </Text>
                                    {isSelected && (
                                        <View style={styles.checkmark}>
                                            <Text style={styles.checkmarkText}>✓</Text>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>

                    {/* Buttons */}
                    <View style={styles.buttonContainer}>
                        <TouchableOpacity
                            style={styles.skipButton}
                            onPress={handleSkip}
                        >
                            <Text style={styles.skipText}>Skip</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={{ flex: 1 }}
                            onPress={handleContinue}
                            activeOpacity={0.9}
                        >
                            <LinearGradient
                                colors={[colors.accentPrimary, colors.accentSecondary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.continueButton}
                            >
                                <Text style={styles.continueText}>
                                    {selected.length > 0 ? 'CONTINUE' : 'CONTINUE'}
                                </Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </View>
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
    },
    header: {
        marginTop: spacing.xl,
        marginBottom: spacing.xl,
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
    muscleGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
        paddingBottom: spacing.xl,
    },
    muscleCard: {
        width: '48%',
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        padding: spacing.lg,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: colors.glassBorder,
    },
    muscleCardSelected: {
        borderColor: colors.accentPrimary,
        backgroundColor: colors.accentPrimary + '15',
    },
    muscleIcon: {
        fontSize: 36,
        marginBottom: spacing.sm,
    },
    muscleLabel: {
        fontSize: typography.sizes.md,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    muscleLabelSelected: {
        color: colors.accentPrimary,
    },
    checkmark: {
        position: 'absolute',
        top: spacing.sm,
        right: spacing.sm,
        backgroundColor: colors.accentPrimary,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmarkText: {
        color: colors.bgPrimary,
        fontWeight: '700',
        fontSize: 14,
    },
    buttonContainer: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    skipButton: {
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xl,
        borderRadius: borderRadius.lg,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    skipText: {
        fontSize: typography.sizes.md,
        fontWeight: '600',
        color: colors.textSecondary,
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
