import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../config/theme';
import { Achievement, getRarityColor } from '../lib/achievements';

interface AchievementCardProps {
    achievement: Achievement;
    unlocked: boolean;
    unlockedAt?: string;
    isNew?: boolean; // For unlock animation
}

export default function AchievementCard({
    achievement,
    unlocked,
    unlockedAt,
    isNew = false,
}: AchievementCardProps) {
    const glowAnim = useRef(new Animated.Value(0)).current;
    const scaleAnim = useRef(new Animated.Value(isNew ? 0.8 : 1)).current;

    const rarityColor = getRarityColor(achievement.rarity);

    useEffect(() => {
        if (isNew) {
            // Unlock animation
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 5,
                    useNativeDriver: true,
                }),
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(glowAnim, {
                            toValue: 1,
                            duration: 800,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                        Animated.timing(glowAnim, {
                            toValue: 0.3,
                            duration: 800,
                            easing: Easing.inOut(Easing.ease),
                            useNativeDriver: true,
                        }),
                    ])
                ),
            ]).start();
        }
    }, [isNew]);

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ scale: scaleAnim }],
                    opacity: unlocked ? 1 : 0.5,
                }
            ]}
        >
            <LinearGradient
                colors={unlocked
                    ? [rarityColor + '25', colors.bgCard]
                    : [colors.bgCard, colors.bgSecondary]}
                style={styles.gradient}
            >
                {/* Badge Icon */}
                <View style={[
                    styles.iconContainer,
                    unlocked && { borderColor: rarityColor }
                ]}>
                    <Text style={styles.icon}>
                        {unlocked ? achievement.icon : '🔒'}
                    </Text>
                    {isNew && (
                        <Animated.View
                            style={[
                                styles.glowRing,
                                {
                                    borderColor: rarityColor,
                                    opacity: glowAnim,
                                }
                            ]}
                        />
                    )}
                </View>

                {/* Info */}
                <View style={styles.info}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.name, unlocked && { color: colors.textPrimary }]}>
                            {achievement.name}
                        </Text>
                        <View style={[styles.rarityBadge, { backgroundColor: rarityColor + '30' }]}>
                            <Text style={[styles.rarityText, { color: rarityColor }]}>
                                {achievement.rarity.toUpperCase()}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.description}>{achievement.description}</Text>
                    {unlocked && unlockedAt && (
                        <Text style={styles.unlockedDate}>
                            Unlocked {new Date(unlockedAt).toLocaleDateString()}
                        </Text>
                    )}
                </View>
            </LinearGradient>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.glassBorder,
        marginBottom: spacing.sm,
    },
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.bgSecondary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: colors.glassBorder,
        marginRight: spacing.md,
    },
    icon: {
        fontSize: 28,
    },
    glowRing: {
        position: 'absolute',
        width: 64,
        height: 64,
        borderRadius: 32,
        borderWidth: 3,
    },
    info: {
        flex: 1,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.sm,
        marginBottom: spacing.xs,
    },
    name: {
        fontSize: typography.sizes.md,
        fontWeight: '700',
        color: colors.textMuted,
    },
    rarityBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: borderRadius.sm,
    },
    rarityText: {
        fontSize: 8,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    description: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
    },
    unlockedDate: {
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
});
