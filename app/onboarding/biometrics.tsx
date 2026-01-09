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
import { router } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '../../src/config/theme';
import { useOnboarding } from '../../src/context/OnboardingContext';
import type { Gender } from '../../src/types';

const { width } = Dimensions.get('window');

export default function BiometricsScreen() {
    const { data, updateData } = useOnboarding();
    const [gender, setGender] = useState<Gender | null>(data.gender);
    const [weight, setWeight] = useState(data.bodyweight || 165);
    const [height, setHeight] = useState(data.height || 68);

    const weightAnim = useRef(new Animated.Value(weight)).current;

    const handleGenderSelect = (g: Gender) => {
        setGender(g);
    };

    const adjustWeight = (delta: number) => {
        const newWeight = Math.max(80, Math.min(400, weight + delta));
        setWeight(newWeight);
        Animated.spring(weightAnim, {
            toValue: newWeight,
            useNativeDriver: false,
            tension: 100,
            friction: 10,
        }).start();
    };

    const adjustHeight = (delta: number) => {
        const newHeight = Math.max(48, Math.min(96, height + delta));
        setHeight(newHeight);
    };

    const formatHeight = (inches: number) => {
        const feet = Math.floor(inches / 12);
        const remainingInches = inches % 12;
        return `${feet}'${remainingInches}"`;
    };

    const canContinue = gender !== null;

    const handleContinue = () => {
        updateData({ gender, bodyweight: weight, height });
        router.push('/onboarding/experience');
    };

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.bgPrimary, '#0D1117', colors.bgPrimary]}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.content} edges={['top', 'left', 'right']}>
                {/* Progress indicator */}
                <View style={styles.progressContainer}>
                    <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: '33%' }]} />
                    </View>
                    <Text style={styles.progressText}>Step 1 of 3</Text>
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.stepLabel}>CALIBRATION</Text>
                    <Text style={styles.title}>Your Biometrics</Text>
                    <Text style={styles.subtitle}>
                        We need this to calculate your{'\n'}relative strength level
                    </Text>
                </View>

                {/* Gender Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>BIOLOGICAL SEX</Text>
                    <View style={styles.genderContainer}>
                        {(['male', 'female'] as Gender[]).map((g) => (
                            <TouchableOpacity
                                key={g}
                                style={[
                                    styles.genderCard,
                                    gender === g && styles.genderCardActive,
                                ]}
                                onPress={() => handleGenderSelect(g)}
                                activeOpacity={0.8}
                            >
                                <LinearGradient
                                    colors={gender === g
                                        ? [colors.accentPrimary + '30', colors.accentSecondary + '20']
                                        : [colors.bgCard, colors.bgCard]
                                    }
                                    style={styles.genderGradient}
                                >
                                    <Text style={styles.genderIcon}>
                                        {g === 'male' ? '♂' : '♀'}
                                    </Text>
                                    <Text style={[
                                        styles.genderText,
                                        gender === g && styles.genderTextActive,
                                    ]}>
                                        {g.toUpperCase()}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <Text style={styles.helperText}>
                        Strength standards differ by biological sex
                    </Text>
                </View>

                {/* Weight Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>BODYWEIGHT</Text>
                    <View style={styles.numberSelector}>
                        <TouchableOpacity
                            style={styles.selectorButton}
                            onPress={() => adjustWeight(-5)}
                        >
                            <Text style={styles.selectorButtonText}>-5</Text>
                        </TouchableOpacity>

                        <View style={styles.numberDisplay}>
                            <Text style={styles.numberValue}>{weight}</Text>
                            <Text style={styles.numberUnit}>lbs</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.selectorButton}
                            onPress={() => adjustWeight(5)}
                        >
                            <Text style={styles.selectorButtonText}>+5</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Height Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>HEIGHT</Text>
                    <View style={styles.numberSelector}>
                        <TouchableOpacity
                            style={styles.selectorButton}
                            onPress={() => adjustHeight(-1)}
                        >
                            <Text style={styles.selectorButtonText}>-1"</Text>
                        </TouchableOpacity>

                        <View style={styles.numberDisplay}>
                            <Text style={styles.numberValue}>{formatHeight(height)}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.selectorButton}
                            onPress={() => adjustHeight(1)}
                        >
                            <Text style={styles.selectorButtonText}>+1"</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Continue Button */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        onPress={handleContinue}
                        disabled={!canContinue}
                        activeOpacity={0.9}
                    >
                        <LinearGradient
                            colors={canContinue
                                ? [colors.accentPrimary, colors.accentSecondary]
                                : [colors.textMuted, colors.textMuted]
                            }
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.continueButton}
                        >
                            <Text style={styles.continueText}>CONTINUE</Text>
                            <Text style={styles.continueArrow}>→</Text>
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
        marginBottom: spacing.xl,
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
    section: {
        marginBottom: spacing.xl,
    },
    sectionLabel: {
        fontSize: typography.sizes.xs,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 1.5,
        marginBottom: spacing.md,
    },
    genderContainer: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    genderCard: {
        flex: 1,
        borderRadius: borderRadius.lg,
        borderWidth: 2,
        borderColor: colors.glassBorder,
        overflow: 'hidden',
    },
    genderCardActive: {
        borderColor: colors.accentPrimary,
    },
    genderGradient: {
        paddingVertical: spacing.lg,
        alignItems: 'center',
    },
    genderIcon: {
        fontSize: 36,
        marginBottom: spacing.sm,
    },
    genderText: {
        fontSize: typography.sizes.sm,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 2,
    },
    genderTextActive: {
        color: colors.accentPrimary,
    },
    helperText: {
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
        marginTop: spacing.sm,
        textAlign: 'center',
    },
    numberSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    selectorButton: {
        width: 60,
        height: 60,
        backgroundColor: colors.bgSecondary,
        borderRadius: borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    selectorButtonText: {
        fontSize: typography.sizes.lg,
        fontWeight: '700',
        color: colors.accentPrimary,
    },
    numberDisplay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    numberValue: {
        fontSize: typography.sizes.display,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    numberUnit: {
        fontSize: typography.sizes.sm,
        fontWeight: '600',
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
    footer: {
        marginTop: 'auto',
        paddingBottom: spacing.xl,
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
    continueArrow: {
        fontSize: typography.sizes.lg,
        fontWeight: '700',
        color: colors.bgPrimary,
        marginLeft: spacing.md,
    },
});
