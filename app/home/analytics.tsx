import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../../src/config/theme';
import { useOnboarding } from '../../src/context/OnboardingContext';
import { getRank } from '../../src/lib/eloService';
import StreakCard from '../../src/components/StreakCard';
import WorkoutCalendar from '../../src/components/WorkoutCalendar';
import ProgressChart from '../../src/components/ProgressChart';

export default function AnalyticsScreen() {
    const { data, getStreakData } = useOnboarding();
    const streakData = getStreakData();

    // Generate progress data for Signal chart
    const signalProgressData = useMemo(() => {
        if (data.workoutHistory.length === 0) {
            return [];
        }

        // Sort workouts by date
        const sorted = [...data.workoutHistory].sort((a, b) =>
            new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Calculate running signal (simplified - in reality we'd track historical values)
        let runningSignal = data.strataSignal;
        const totalGain = sorted.reduce((sum, w) => sum + w.signalGain, 0);
        const startSignal = runningSignal - totalGain;

        let current = startSignal;
        return sorted.map(workout => {
            current += workout.signalGain;
            return {
                label: new Date(workout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: current,
            };
        });
    }, [data.workoutHistory, data.strataSignal]);

    const currentRank = getRank(data.strataSignal);

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
                        <Text style={styles.headerLabel}>ANALYTICS</Text>
                        <Text style={styles.headerTitle}>Your Progress</Text>
                    </View>

                    {/* Streak Card */}
                    <View style={styles.section}>
                        <StreakCard
                            currentStreak={streakData.currentStreak}
                            longestStreak={streakData.longestStreak}
                            thisWeekWorkouts={streakData.thisWeekWorkouts}
                            weeklyGoal={streakData.weeklyGoal}
                        />
                    </View>

                    {/* Signal Progress Chart */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>STRATA SIGNAL</Text>
                        <ProgressChart
                            title="Signal Progression"
                            data={signalProgressData.length > 0 ? signalProgressData : [
                                { label: 'Start', value: data.strataSignal - 50 },
                                { label: 'Now', value: data.strataSignal },
                            ]}
                            color={currentRank.color}
                            suffix=" pts"
                        />
                    </View>

                    {/* Workout Calendar */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>WORKOUT HISTORY</Text>
                        <WorkoutCalendar workoutHistory={data.workoutHistory} />
                    </View>

                    {/* Quick Stats */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>LIFETIME STATS</Text>
                        <View style={styles.statsGrid}>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>{data.workoutHistory.length}</Text>
                                <Text style={styles.statLabel}>Total Workouts</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>
                                    {data.workoutHistory.reduce((sum, w) => sum + w.prsHit.length, 0)}
                                </Text>
                                <Text style={styles.statLabel}>PRs Hit</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={styles.statValue}>
                                    {data.workoutHistory.reduce((sum, w) => sum + w.totalSets, 0)}
                                </Text>
                                <Text style={styles.statLabel}>Total Sets</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Text style={[styles.statValue, { color: currentRank.color }]}>
                                    {currentRank.name}
                                </Text>
                                <Text style={styles.statLabel}>Current Rank</Text>
                            </View>
                        </View>
                    </View>
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
        marginBottom: spacing.lg,
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
        marginBottom: spacing.xl,
    },
    sectionTitle: {
        fontSize: typography.sizes.xs,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 2,
        marginBottom: spacing.md,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: spacing.sm,
    },
    statCard: {
        width: '48%',
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.md,
        padding: spacing.lg,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    statValue: {
        fontSize: typography.sizes.xl,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.xs,
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 1,
        textAlign: 'center',
    },
});
