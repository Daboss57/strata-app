import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../config/theme';

interface StreakCardProps {
    currentStreak: number;
    longestStreak: number;
    thisWeekWorkouts: number;
    weeklyGoal: number;
}

export default function StreakCard({
    currentStreak,
    longestStreak,
    thisWeekWorkouts,
    weeklyGoal,
}: StreakCardProps) {
    const fireAnim = useRef(new Animated.Value(1)).current;
    const glowAnim = useRef(new Animated.Value(0.5)).current;

    useEffect(() => {
        // Fire pulse animation
        if (currentStreak > 0) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(fireAnim, {
                        toValue: 1.15,
                        duration: 600,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(fireAnim, {
                        toValue: 1,
                        duration: 600,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, {
                        toValue: 1,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                    Animated.timing(glowAnim, {
                        toValue: 0.5,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [currentStreak]);

    const weekProgress = Math.min(1, thisWeekWorkouts / weeklyGoal);
    const streakColor = currentStreak >= 7 ? '#FF6B35' : currentStreak >= 3 ? '#FFD700' : colors.accentPrimary;

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.bgCard, colors.bgSecondary]}
                style={styles.gradient}
            >
                <View style={styles.content}>
                    {/* Main Streak Display */}
                    <View style={styles.streakSection}>
                        <Animated.View style={[styles.fireContainer, { transform: [{ scale: fireAnim }] }]}>
                            <Animated.Text style={[styles.fireEmoji, { opacity: glowAnim }]}>
                                {currentStreak > 0 ? '🔥' : '💤'}
                            </Animated.Text>
                        </Animated.View>
                        <View style={styles.streakInfo}>
                            <Text style={[styles.streakNumber, { color: streakColor }]}>
                                {currentStreak}
                            </Text>
                            <Text style={styles.streakLabel}>
                                {currentStreak === 1 ? 'DAY STREAK' : 'DAY STREAK'}
                            </Text>
                        </View>
                    </View>

                    {/* Stats Row */}
                    <View style={styles.statsRow}>
                        {/* Best Streak */}
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>🏆 {longestStreak}</Text>
                            <Text style={styles.statLabel}>Best Streak</Text>
                        </View>

                        {/* Divider */}
                        <View style={styles.divider} />

                        {/* Weekly Progress */}
                        <View style={styles.statItem}>
                            <Text style={styles.statValue}>{thisWeekWorkouts}/{weeklyGoal}</Text>
                            <Text style={styles.statLabel}>This Week</Text>
                        </View>
                    </View>

                    {/* Weekly Progress Bar */}
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${weekProgress * 100}%`,
                                        backgroundColor: weekProgress >= 1 ? colors.accentSuccess : colors.accentPrimary,
                                    }
                                ]}
                            />
                        </View>
                        <Text style={styles.progressText}>
                            {weekProgress >= 1 ? '✅ Goal Complete!' : `${Math.round(weekProgress * 100)}% of weekly goal`}
                        </Text>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    gradient: {
        padding: spacing.lg,
    },
    content: {
        alignItems: 'center',
    },
    streakSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    fireContainer: {
        marginRight: spacing.md,
    },
    fireEmoji: {
        fontSize: 48,
    },
    streakInfo: {
        alignItems: 'flex-start',
    },
    streakNumber: {
        fontSize: 48,
        fontWeight: '900',
        lineHeight: 52,
    },
    streakLabel: {
        fontSize: typography.sizes.xs,
        fontWeight: '700',
        color: colors.textMuted,
        letterSpacing: 2,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.md,
        width: '100%',
        justifyContent: 'center',
    },
    statItem: {
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    statValue: {
        fontSize: typography.sizes.lg,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    statLabel: {
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: colors.glassBorder,
    },
    progressContainer: {
        width: '100%',
        alignItems: 'center',
    },
    progressBar: {
        width: '100%',
        height: 8,
        backgroundColor: colors.bgPrimary,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: spacing.sm,
    },
    progressFill: {
        height: 8,
        borderRadius: 4,
    },
    progressText: {
        fontSize: typography.sizes.xs,
        color: colors.textSecondary,
    },
});
