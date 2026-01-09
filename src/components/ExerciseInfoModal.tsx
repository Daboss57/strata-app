import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Dimensions,
    Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../config/theme';
import { getExerciseInfo, ExerciseInfo } from '../lib/exerciseDatabase';

const { width, height } = Dimensions.get('window');

// Exercise diagram images
const EXERCISE_IMAGES: Record<string, any> = {
    'bench_press': require('../../assets/exercises/bench_press.png'),
    'squat': require('../../assets/exercises/squat.png'),
    'deadlift': require('../../assets/exercises/deadlift.png'),
    'pull_ups': require('../../assets/exercises/pull_ups.png'),
    'overhead_press': require('../../assets/exercises/overhead_press.png'),
    'barbell_row': require('../../assets/exercises/barbell_row.png'),
};

interface ExerciseInfoModalProps {
    visible: boolean;
    exerciseName: string;
    onClose: () => void;
}

export default function ExerciseInfoModal({
    visible,
    exerciseName,
    onClose,
}: ExerciseInfoModalProps) {
    const info = getExerciseInfo(exerciseName);

    // Fallback for unknown exercises
    const displayInfo: ExerciseInfo = info || {
        name: exerciseName,
        muscles: ['Various'],
        equipment: 'Various',
        difficulty: 'intermediate',
        instructions: ['Perform the exercise with proper form', 'Control the weight through full range of motion'],
        formCues: ['Maintain good posture', 'Breathe throughout'],
        commonMistakes: ['Using too much weight', 'Rushing the movement'],
        icon: '💪',
    };

    const difficultyColor =
        displayInfo.difficulty === 'beginner' ? colors.accentSuccess :
            displayInfo.difficulty === 'intermediate' ? colors.accentPrimary :
                colors.accentDanger;

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <LinearGradient
                        colors={[colors.bgSecondary, colors.bgPrimary]}
                        style={StyleSheet.absoluteFill}
                    />

                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerTop}>
                            <Text style={styles.exerciseIcon}>{displayInfo.icon}</Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                <Text style={styles.closeText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={styles.exerciseName}>{displayInfo.name}</Text>
                        <View style={styles.tagRow}>
                            <View style={[styles.difficultyTag, { backgroundColor: difficultyColor + '30' }]}>
                                <Text style={[styles.difficultyText, { color: difficultyColor }]}>
                                    {displayInfo.difficulty.toUpperCase()}
                                </Text>
                            </View>
                            <Text style={styles.equipment}>{displayInfo.equipment}</Text>
                        </View>
                    </View>

                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                    >
                        {/* Exercise Diagram */}
                        {displayInfo.imageKey && EXERCISE_IMAGES[displayInfo.imageKey] && (
                            <View style={styles.imageSection}>
                                <Image
                                    source={EXERCISE_IMAGES[displayInfo.imageKey]}
                                    style={styles.exerciseImage}
                                    resizeMode="contain"
                                />
                            </View>
                        )}

                        {/* Muscles */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>💪 MUSCLES WORKED</Text>
                            <View style={styles.muscleRow}>
                                {displayInfo.muscles.map((muscle, i) => (
                                    <View key={muscle} style={styles.muscleTag}>
                                        <Text style={styles.muscleText}>{muscle}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Instructions */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>📋 HOW TO DO IT</Text>
                            {displayInfo.instructions.map((step, i) => (
                                <View key={i} style={styles.stepRow}>
                                    <View style={styles.stepNumber}>
                                        <Text style={styles.stepNumberText}>{i + 1}</Text>
                                    </View>
                                    <Text style={styles.stepText}>{step}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Form Cues */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>✅ FORM CUES</Text>
                            {displayInfo.formCues.map((cue, i) => (
                                <View key={i} style={styles.cueRow}>
                                    <Text style={styles.cueIcon}>•</Text>
                                    <Text style={styles.cueText}>{cue}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Common Mistakes */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>⚠️ AVOID THESE</Text>
                            {displayInfo.commonMistakes.map((mistake, i) => (
                                <View key={i} style={styles.mistakeRow}>
                                    <Text style={styles.mistakeIcon}>✗</Text>
                                    <Text style={styles.mistakeText}>{mistake}</Text>
                                </View>
                            ))}
                        </View>

                        <View style={{ height: spacing.xxl }} />
                    </ScrollView>

                    {/* Got it button */}
                    <TouchableOpacity onPress={onClose} activeOpacity={0.9}>
                        <LinearGradient
                            colors={[colors.accentPrimary, colors.accentSecondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.gotItButton}
                        >
                            <Text style={styles.gotItText}>GOT IT</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    container: {
        height: height * 0.85,
        borderTopLeftRadius: borderRadius.xl,
        borderTopRightRadius: borderRadius.xl,
        overflow: 'hidden',
        paddingBottom: spacing.xl,
    },
    header: {
        padding: spacing.lg,
        paddingTop: spacing.xl,
        borderBottomWidth: 1,
        borderBottomColor: colors.glassBorder,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    exerciseIcon: {
        fontSize: 48,
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.bgCard,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeText: {
        fontSize: 18,
        color: colors.textMuted,
    },
    exerciseName: {
        fontSize: typography.sizes.xxl,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    tagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    difficultyTag: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: borderRadius.sm,
    },
    difficultyText: {
        fontSize: typography.sizes.xs,
        fontWeight: '700',
        letterSpacing: 1,
    },
    equipment: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    content: {
        flex: 1,
        padding: spacing.lg,
    },
    imageSection: {
        marginBottom: spacing.lg,
        alignItems: 'center',
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
    },
    exerciseImage: {
        width: width - spacing.lg * 4,
        height: 180,
    },
    section: {
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.sizes.xs,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 2,
        marginBottom: spacing.md,
    },
    muscleRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    muscleTag: {
        backgroundColor: colors.accentPrimary + '20',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        borderRadius: borderRadius.md,
    },
    muscleText: {
        fontSize: typography.sizes.sm,
        color: colors.accentPrimary,
        fontWeight: '600',
    },
    stepRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    stepNumber: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: colors.accentPrimary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    stepNumberText: {
        fontSize: typography.sizes.sm,
        fontWeight: '700',
        color: colors.bgPrimary,
    },
    stepText: {
        flex: 1,
        fontSize: typography.sizes.md,
        color: colors.textPrimary,
        lineHeight: 24,
    },
    cueRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    cueIcon: {
        fontSize: 18,
        color: colors.accentSuccess,
        marginRight: spacing.sm,
        width: 20,
    },
    cueText: {
        flex: 1,
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    mistakeRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: spacing.sm,
    },
    mistakeIcon: {
        fontSize: 14,
        color: colors.accentDanger,
        marginRight: spacing.sm,
        width: 20,
        fontWeight: '700',
    },
    mistakeText: {
        flex: 1,
        fontSize: typography.sizes.md,
        color: colors.textSecondary,
        lineHeight: 22,
    },
    gotItButton: {
        marginHorizontal: spacing.lg,
        paddingVertical: spacing.lg,
        borderRadius: borderRadius.lg,
        alignItems: 'center',
    },
    gotItText: {
        fontSize: typography.sizes.md,
        fontWeight: '700',
        color: colors.bgPrimary,
        letterSpacing: 2,
    },
});
