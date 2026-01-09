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
import { ACHIEVEMENTS, getRarityColor } from '../../src/lib/achievements';
import AchievementCard from '../../src/components/AchievementCard';

export default function AchievementsScreen() {
    const { data } = useOnboarding();

    const unlockedIds = useMemo(() =>
        new Set(data.unlockedAchievements.map(a => a.id)),
        [data.unlockedAchievements]
    );

    const unlockedCount = data.unlockedAchievements.length;
    const totalCount = ACHIEVEMENTS.length;
    const progressPercent = Math.round((unlockedCount / totalCount) * 100);

    // Group achievements by category
    const categories = useMemo(() => {
        const groups: Record<string, typeof ACHIEVEMENTS> = {
            milestone: [],
            streak: [],
            pr: [],
            strength: [],
        };

        ACHIEVEMENTS.forEach(a => {
            groups[a.category].push(a);
        });

        return [
            { key: 'milestone', label: '🎯 MILESTONES', achievements: groups.milestone },
            { key: 'streak', label: '🔥 STREAKS', achievements: groups.streak },
            { key: 'pr', label: '🏆 PERSONAL RECORDS', achievements: groups.pr },
            { key: 'strength', label: '💪 STRENGTH', achievements: groups.strength },
        ];
    }, []);

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
                        <Text style={styles.headerLabel}>ACHIEVEMENTS</Text>
                        <Text style={styles.headerTitle}>Your Badges</Text>
                    </View>

                    {/* Progress Card */}
                    <View style={styles.progressCard}>
                        <LinearGradient
                            colors={[colors.bgCard, colors.bgSecondary]}
                            style={styles.progressGradient}
                        >
                            <View style={styles.progressHeader}>
                                <Text style={styles.progressTitle}>
                                    {unlockedCount} / {totalCount} Unlocked
                                </Text>
                                <Text style={styles.progressPercent}>{progressPercent}%</Text>
                            </View>
                            <View style={styles.progressBar}>
                                <View
                                    style={[
                                        styles.progressFill,
                                        { width: `${progressPercent}%` }
                                    ]}
                                />
                            </View>

                            {/* Rarity breakdown */}
                            <View style={styles.rarityRow}>
                                {(['common', 'rare', 'epic', 'legendary'] as const).map(rarity => {
                                    const count = data.unlockedAchievements.filter(ua => {
                                        const achievement = ACHIEVEMENTS.find(a => a.id === ua.id);
                                        return achievement?.rarity === rarity;
                                    }).length;
                                    return (
                                        <View key={rarity} style={styles.rarityItem}>
                                            <View style={[styles.rarityDot, { backgroundColor: getRarityColor(rarity) }]} />
                                            <Text style={styles.rarityCount}>{count}</Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </LinearGradient>
                    </View>

                    {/* Achievement Categories */}
                    {categories.map(category => (
                        <View key={category.key} style={styles.categorySection}>
                            <Text style={styles.categoryTitle}>{category.label}</Text>
                            {category.achievements.map(achievement => {
                                const unlocked = unlockedIds.has(achievement.id);
                                const unlockedData = data.unlockedAchievements.find(
                                    a => a.id === achievement.id
                                );
                                return (
                                    <AchievementCard
                                        key={achievement.id}
                                        achievement={achievement}
                                        unlocked={unlocked}
                                        unlockedAt={unlockedData?.unlockedAt}
                                    />
                                );
                            })}
                        </View>
                    ))}
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
    progressCard: {
        borderRadius: borderRadius.xl,
        overflow: 'hidden',
        marginBottom: spacing.xl,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    progressGradient: {
        padding: spacing.lg,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    progressTitle: {
        fontSize: typography.sizes.md,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    progressPercent: {
        fontSize: typography.sizes.lg,
        fontWeight: '900',
        color: colors.accentPrimary,
    },
    progressBar: {
        height: 8,
        backgroundColor: colors.bgPrimary,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: spacing.md,
    },
    progressFill: {
        height: 8,
        backgroundColor: colors.accentPrimary,
        borderRadius: 4,
    },
    rarityRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    rarityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    rarityDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    rarityCount: {
        fontSize: typography.sizes.sm,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    categorySection: {
        marginBottom: spacing.xl,
    },
    categoryTitle: {
        fontSize: typography.sizes.sm,
        fontWeight: '700',
        color: colors.textPrimary,
        letterSpacing: 1,
        marginBottom: spacing.md,
    },
});
