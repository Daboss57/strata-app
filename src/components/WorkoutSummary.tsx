import React, { useEffect, useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Animated,
    Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../config/theme';

const { width } = Dimensions.get('window');

interface ExerciseSet {
    weight: number;
    reps: number;
    completed?: boolean;
}

interface WorkoutReportData {
    workoutTitle: string;
    duration: number;
    exercises: { name: string; sets: ExerciseSet[]; isPR?: boolean }[];
    prsHit: string[];
    musclesWorked?: Record<string, number>;
    signalGain?: number;
}

interface WorkoutSummaryProps {
    workoutData: WorkoutReportData;
    userProfile: { experienceLevel?: string; goals?: string[]; focusAreas?: string[] };
    signalBefore: number;
    signalAfter: number;
    onDismiss: () => void;
}

// Pre-made motivational quotes
const MOTIVATIONAL_QUOTES = [
    "Every rep counts. Every set matters. You're building something great! 💪",
    "Champions are made when no one is watching. Great work today! 🏆",
    "Discipline beats motivation. You showed up. That's what matters! 🔥",
    "Progress isn't always visible, but it's happening. Keep grinding! 💎",
    "You just outworked your yesterday self. Be proud! ⚡",
    "This workout is a deposit in your health bank. Smart investment! 📈",
    "Pain is temporary, but the gains are forever. Well done! 🦾",
    "You didn't come this far to only come this far. Onwards! 🚀",
];

// Pre-made recovery tips based on workout type
const getRecoveryTips = (workoutTitle: string) => {
    const lower = workoutTitle.toLowerCase();

    if (lower.includes('push') || lower.includes('chest')) {
        return {
            soreness: "Expect chest and tricep soreness in 24-48 hours. Stretch those pecs!",
            nutrition: "Hit your protein - aim for 0.8-1g per lb bodyweight today.",
            sleep: "Get 7-9 hours tonight for optimal muscle repair.",
            nextWorkout: "Pull or legs tomorrow would be ideal for recovery balance.",
        };
    }
    if (lower.includes('pull') || lower.includes('back')) {
        return {
            soreness: "Your lats and biceps will feel it tomorrow. Foam roll if needed.",
            nutrition: "Carbs are your friend post-workout - replenish those glycogen stores.",
            sleep: "Quality sleep = quality gains. Aim for 8 hours.",
            nextWorkout: "Push or legs next to keep the momentum going!",
        };
    }
    if (lower.includes('leg')) {
        return {
            soreness: "Leg day DOMS incoming! Walking might be interesting tomorrow 😅",
            nutrition: "Extra protein and carbs today - your legs need the fuel.",
            sleep: "Rest is when growth happens. Prioritize sleep tonight!",
            nextWorkout: "Upper body tomorrow gives your legs time to recover.",
        };
    }
    // Default
    return {
        soreness: "Some muscle soreness is normal - it means you worked hard!",
        nutrition: "Protein within 2 hours post-workout helps maximize gains.",
        sleep: "7-9 hours of sleep is crucial for recovery and growth.",
        nextWorkout: "Listen to your body - train again when you feel ready!",
    };
};

export default function WorkoutSummary({
    workoutData,
    userProfile,
    signalBefore,
    signalAfter,
    onDismiss,
}: WorkoutSummaryProps) {
    const [displaySignal, setDisplaySignal] = useState(signalBefore);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    const recovery = getRecoveryTips(workoutData.workoutTitle);
    const motivation = MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)];

    useEffect(() => {
        // Entrance animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
        ]).start();

        // Animate signal counter with simple interval
        const diff = signalAfter - signalBefore;
        const steps = 30;
        const increment = diff / steps;
        let currentStep = 0;

        const timer = setInterval(() => {
            currentStep++;
            if (currentStep >= steps) {
                setDisplaySignal(signalAfter);
                clearInterval(timer);
            } else {
                setDisplaySignal(Math.round(signalBefore + increment * currentStep));
            }
        }, 50);

        return () => clearInterval(timer);
    }, []);

    const signalGain = signalAfter - signalBefore;

    // Calculate total volume from all sets
    const totalVolume = workoutData.exercises.reduce((sum, ex) => {
        const exerciseVolume = ex.sets.reduce((setSum, set) => {
            return setSum + ((set.weight || 0) * (set.reps || 0));
        }, 0);
        return sum + exerciseVolume;
    }, 0);

    // Count total sets
    const totalSets = workoutData.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.bgPrimary, '#0D1117', colors.bgPrimary]}
                style={StyleSheet.absoluteFill}
            />

            <SafeAreaView style={styles.safeArea}>
                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }],
                        }
                    ]}
                >
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.emoji}>🎉</Text>
                            <Text style={styles.title}>Workout Complete!</Text>
                            <Text style={styles.workoutName}>{workoutData.workoutTitle}</Text>
                        </View>

                        {/* Signal Card */}
                        <View style={styles.signalCard}>
                            <LinearGradient
                                colors={['#FFD700' + '30', colors.bgCard]}
                                style={styles.signalGradient}
                            >
                                <Text style={styles.signalLabel}>STRATA SIGNAL</Text>
                                <Text style={styles.signalValue}>{displaySignal}</Text>
                                <View style={styles.signalGainBadge}>
                                    <Text style={styles.signalGainText}>+{signalGain}</Text>
                                </View>
                            </LinearGradient>
                        </View>

                        {/* Quick Stats */}
                        <View style={styles.statsRow}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{workoutData.duration}</Text>
                                <Text style={styles.statLabel}>Minutes</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{workoutData.exercises.length}</Text>
                                <Text style={styles.statLabel}>Exercises</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={[styles.statValue, { color: '#FFD700' }]}>
                                    {workoutData.prsHit.length}
                                </Text>
                                <Text style={styles.statLabel}>PRs</Text>
                            </View>
                        </View>

                        {/* Volume Card */}
                        <View style={styles.volumeCard}>
                            <Text style={styles.volumeLabel}>TOTAL VOLUME</Text>
                            <Text style={styles.volumeValue}>{totalVolume.toLocaleString()} lbs</Text>
                        </View>

                        {/* PRs Section */}
                        {workoutData.prsHit.length > 0 && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>🏆 PERSONAL RECORDS</Text>
                                {workoutData.prsHit.map((pr, i) => (
                                    <View key={i} style={styles.prItem}>
                                        <Text style={styles.prText}>{pr}</Text>
                                    </View>
                                ))}
                            </View>
                        )}

                        {/* Recovery Tips */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>🛌 RECOVERY TIPS</Text>
                            <View style={styles.recoveryCard}>
                                <View style={styles.recoveryItem}>
                                    <Text style={styles.recoveryIcon}>💪</Text>
                                    <Text style={styles.recoveryText}>{recovery.soreness}</Text>
                                </View>
                                <View style={styles.recoveryItem}>
                                    <Text style={styles.recoveryIcon}>🍎</Text>
                                    <Text style={styles.recoveryText}>{recovery.nutrition}</Text>
                                </View>
                                <View style={styles.recoveryItem}>
                                    <Text style={styles.recoveryIcon}>😴</Text>
                                    <Text style={styles.recoveryText}>{recovery.sleep}</Text>
                                </View>
                                <View style={styles.recoveryItem}>
                                    <Text style={styles.recoveryIcon}>📅</Text>
                                    <Text style={styles.recoveryText}>{recovery.nextWorkout}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Motivation */}
                        <View style={styles.motivationCard}>
                            <Text style={styles.motivationText}>{motivation}</Text>
                        </View>
                    </ScrollView>

                    {/* Done Button */}
                    <TouchableOpacity onPress={onDismiss} activeOpacity={0.9}>
                        <LinearGradient
                            colors={[colors.accentPrimary, colors.accentSecondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.doneButton}
                        >
                            <Text style={styles.doneText}>DONE</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bgPrimary },
    safeArea: { flex: 1 },
    content: { flex: 1, padding: spacing.lg },
    header: { alignItems: 'center', marginBottom: spacing.xl },
    emoji: { fontSize: 56, marginBottom: spacing.md },
    title: { fontSize: typography.sizes.xxl, fontWeight: '700', color: colors.textPrimary },
    workoutName: { fontSize: typography.sizes.md, color: colors.textSecondary, marginTop: spacing.xs },
    // Signal
    signalCard: { borderRadius: borderRadius.xl, overflow: 'hidden', marginBottom: spacing.lg, borderWidth: 2, borderColor: '#FFD700' + '40' },
    signalGradient: { padding: spacing.xl, alignItems: 'center' },
    signalLabel: { fontSize: typography.sizes.xs, fontWeight: '700', color: '#FFD700', letterSpacing: 2 },
    signalValue: { fontSize: 56, fontWeight: '900', color: colors.textPrimary },
    signalGainBadge: { backgroundColor: colors.accentSuccess, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.full },
    signalGainText: { fontSize: typography.sizes.md, fontWeight: '700', color: colors.bgPrimary },
    // Stats
    statsRow: { flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.lg },
    statItem: { flex: 1, alignItems: 'center' },
    statDivider: { width: 1, backgroundColor: colors.glassBorder },
    statValue: { fontSize: typography.sizes.xl, fontWeight: '900', color: colors.textPrimary },
    statLabel: { fontSize: typography.sizes.xs, color: colors.textMuted, marginTop: spacing.xs },
    // Volume
    volumeCard: { backgroundColor: colors.bgCard, borderRadius: borderRadius.lg, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.accentPrimary + '40' },
    volumeLabel: { fontSize: typography.sizes.xs, fontWeight: '700', color: colors.accentPrimary, letterSpacing: 2, marginBottom: spacing.xs },
    volumeValue: { fontSize: typography.sizes.xxl, fontWeight: '900', color: colors.textPrimary },
    // Sections
    section: { marginBottom: spacing.xl },
    sectionTitle: { fontSize: typography.sizes.xs, fontWeight: '700', color: colors.textMuted, letterSpacing: 2, marginBottom: spacing.md },
    // PRs
    prItem: { backgroundColor: '#FFD700' + '15', borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, borderLeftWidth: 3, borderLeftColor: '#FFD700' },
    prText: { fontSize: typography.sizes.md, fontWeight: '600', color: '#FFD700' },
    // Recovery
    recoveryCard: { backgroundColor: colors.bgCard, borderRadius: borderRadius.lg, padding: spacing.md },
    recoveryItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.md },
    recoveryIcon: { fontSize: 18, marginRight: spacing.sm, width: 24 },
    recoveryText: { flex: 1, fontSize: typography.sizes.sm, color: colors.textSecondary, lineHeight: 20 },
    // Motivation
    motivationCard: { backgroundColor: colors.accentPrimary + '15', borderRadius: borderRadius.lg, padding: spacing.lg, marginBottom: spacing.xl },
    motivationText: { fontSize: typography.sizes.md, color: colors.accentPrimary, fontWeight: '600', textAlign: 'center', lineHeight: 24 },
    // Done button
    doneButton: { paddingVertical: spacing.lg, borderRadius: borderRadius.lg, alignItems: 'center', marginTop: spacing.md },
    doneText: { fontSize: typography.sizes.md, fontWeight: '700', color: colors.bgPrimary, letterSpacing: 2 },
});

export type { WorkoutReportData };
