import React, { useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Dimensions,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { colors, spacing, borderRadius, typography } from '../src/config/theme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
    const logoScale = useRef(new Animated.Value(0.3)).current;
    const logoOpacity = useRef(new Animated.Value(0)).current;
    const taglineOpacity = useRef(new Animated.Value(0)).current;
    const buttonOpacity = useRef(new Animated.Value(0)).current;
    const glowOpacity = useRef(new Animated.Value(0)).current;
    const scanLinePos = useRef(new Animated.Value(-100)).current;

    useEffect(() => {
        // Epic entrance animation sequence
        Animated.sequence([
            // Logo appears with scale
            Animated.parallel([
                Animated.spring(logoScale, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(logoOpacity, {
                    toValue: 1,
                    duration: 600,
                    useNativeDriver: true,
                }),
            ]),
            // Glow effect
            Animated.timing(glowOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            // Scan line animation
            Animated.timing(scanLinePos, {
                toValue: height,
                duration: 1200,
                useNativeDriver: true,
            }),
            // Tagline fades in
            Animated.timing(taglineOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
            // Button appears
            Animated.timing(buttonOpacity, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleStart = () => {
        router.push('/onboarding/biometrics');
    };

    return (
        <View style={styles.container}>
            {/* Background gradient */}
            <LinearGradient
                colors={[colors.bgPrimary, '#0D1117', colors.bgPrimary]}
                style={StyleSheet.absoluteFill}
            />

            {/* Animated grid background */}
            <View style={styles.gridContainer}>
                {[...Array(20)].map((_, i) => (
                    <View key={i} style={[styles.gridLine, { top: i * 40 }]} />
                ))}
                {[...Array(12)].map((_, i) => (
                    <View key={i} style={[styles.gridLineV, { left: i * (width / 11) }]} />
                ))}
            </View>

            {/* Scan line effect */}
            <Animated.View
                style={[
                    styles.scanLine,
                    { transform: [{ translateY: scanLinePos }] },
                ]}
            >
                <LinearGradient
                    colors={['transparent', colors.accentPrimary, 'transparent']}
                    style={styles.scanLineGradient}
                />
            </Animated.View>

            <SafeAreaView style={styles.content}>
                {/* Glow behind logo */}
                <Animated.View style={[styles.glow, { opacity: glowOpacity }]}>
                    <LinearGradient
                        colors={[`${colors.accentPrimary}40`, 'transparent']}
                        style={styles.glowGradient}
                    />
                </Animated.View>

                {/* Logo */}
                <Animated.View
                    style={[
                        styles.logoContainer,
                        {
                            opacity: logoOpacity,
                            transform: [{ scale: logoScale }],
                        },
                    ]}
                >
                    <Text style={styles.logo} numberOfLines={1} adjustsFontSizeToFit>STRATA</Text>
                    <View style={styles.logoDivider} />
                    <Text style={styles.logoSub}>STRENGTH ANALYTICS</Text>
                </Animated.View>

                {/* Tagline */}
                <Animated.View style={[styles.taglineContainer, { opacity: taglineOpacity }]}>
                    <Text style={styles.tagline}>
                        Rank your strength against{'\n'}
                        <Text style={styles.taglineHighlight}>global standards</Text>
                    </Text>
                    <Text style={styles.taglineSub}>
                        Powered by 800k+ competition entries
                    </Text>
                </Animated.View>

                {/* Features */}
                <Animated.View style={[styles.features, { opacity: taglineOpacity }]}>
                    <View style={styles.featureRow}>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureIcon}>📊</Text>
                            <Text style={styles.featureText}>DOTS Score</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureIcon}>🏆</Text>
                            <Text style={styles.featureText}>Tier Ranking</Text>
                        </View>
                        <View style={styles.featureItem}>
                            <Text style={styles.featureIcon}>📈</Text>
                            <Text style={styles.featureText}>Elo Rating</Text>
                        </View>
                    </View>
                </Animated.View>

                {/* CTA Button */}
                <Animated.View style={[styles.ctaContainer, { opacity: buttonOpacity }]}>
                    <TouchableOpacity onPress={handleStart} activeOpacity={0.9}>
                        <LinearGradient
                            colors={[colors.accentPrimary, colors.accentSecondary]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.ctaButton}
                        >
                            <Text style={styles.ctaText}>BEGIN CALIBRATION</Text>
                            <Text style={styles.ctaArrow}>→</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <Text style={styles.ctaSub}>3 quick questions to rank your strength</Text>
                </Animated.View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.bgPrimary,
    },
    gridContainer: {
        ...StyleSheet.absoluteFillObject,
        opacity: 0.1,
    },
    gridLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: colors.accentPrimary,
    },
    gridLineV: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 1,
        backgroundColor: colors.accentPrimary,
    },
    scanLine: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: 4,
        zIndex: 10,
    },
    scanLineGradient: {
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: spacing.xl,
    },
    glow: {
        position: 'absolute',
        width: 300,
        height: 300,
        borderRadius: 150,
    },
    glowGradient: {
        width: 300,
        height: 300,
        borderRadius: 150,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    logo: {
        fontSize: 64,
        fontWeight: '900',
        color: colors.textPrimary,
        letterSpacing: 8,
        textShadowColor: colors.accentPrimary,
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 20,
    },
    logoDivider: {
        width: 120,
        height: 2,
        backgroundColor: colors.accentPrimary,
        marginVertical: spacing.md,
    },
    logoSub: {
        fontSize: typography.sizes.sm,
        fontWeight: '600',
        color: colors.accentPrimary,
        letterSpacing: 4,
    },
    taglineContainer: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    tagline: {
        fontSize: typography.sizes.xl,
        fontWeight: '500',
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 32,
    },
    taglineHighlight: {
        color: colors.accentPrimary,
        fontWeight: '700',
    },
    taglineSub: {
        fontSize: typography.sizes.sm,
        color: colors.textMuted,
        marginTop: spacing.sm,
    },
    features: {
        marginBottom: spacing.xxl,
    },
    featureRow: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
    featureItem: {
        alignItems: 'center',
        paddingHorizontal: spacing.lg,
    },
    featureIcon: {
        fontSize: 28,
        marginBottom: spacing.xs,
    },
    featureText: {
        fontSize: typography.sizes.xs,
        fontWeight: '600',
        color: colors.textMuted,
        letterSpacing: 1,
    },
    ctaContainer: {
        alignItems: 'center',
        width: '100%',
    },
    ctaButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: spacing.lg,
        paddingHorizontal: spacing.xxl,
        borderRadius: borderRadius.lg,
        minWidth: 280,
    },
    ctaText: {
        fontSize: typography.sizes.md,
        fontWeight: '700',
        color: colors.bgPrimary,
        letterSpacing: 2,
    },
    ctaArrow: {
        fontSize: typography.sizes.lg,
        fontWeight: '700',
        color: colors.bgPrimary,
        marginLeft: spacing.md,
    },
    ctaSub: {
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
        marginTop: spacing.md,
    },
});
