import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Path, G, Ellipse, Defs, LinearGradient, Stop } from 'react-native-svg';
import { colors, spacing, typography, borderRadius } from '../config/theme';
import { getRankFromPoints, RANK_COLORS, type MuscleId } from '../lib/rankingService';

interface BodyGraphDualProps {
    musclePoints: Record<MuscleId, number>;
    width?: number;
    height?: number;
    showLabels?: boolean;
}

// Get color based on muscle points/rank
const getMuscleColor = (points: number): string => {
    const rank = getRankFromPoints(points);
    return rank.color;
};

// Get opacity based on points (higher = more opaque)
const getMuscleOpacity = (points: number): number => {
    if (points === 0) return 0.3;
    if (points < 100) return 0.5;  // Iron
    if (points < 300) return 0.6;  // Bronze
    if (points < 600) return 0.7;  // Silver
    if (points < 1000) return 0.8; // Gold
    return 0.95; // Platinum+
};

export default function BodyGraphDual({
    musclePoints,
    width = 320,
    height = 400,
    showLabels = true,
}: BodyGraphDualProps) {
    const getColor = (muscle: MuscleId) => getMuscleColor(musclePoints[muscle] || 0);
    const getOpacity = (muscle: MuscleId) => getMuscleOpacity(musclePoints[muscle] || 0);

    const singleWidth = width / 2 - 10;
    const singleHeight = height - 20;

    return (
        <View style={styles.container}>
            {/* Front View */}
            <View style={styles.bodyContainer}>
                <Svg width={singleWidth} height={singleHeight} viewBox="0 0 100 180">
                    <Defs>
                        <LinearGradient id="bodyOutline" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor="#555566" stopOpacity="0.6" />
                            <Stop offset="100%" stopColor="#333344" stopOpacity="0.4" />
                        </LinearGradient>
                    </Defs>

                    {/* HEAD */}
                    <Ellipse cx="50" cy="16" rx="10" ry="12" fill="#3A3A4A" stroke="#555566" strokeWidth="0.5" />

                    {/* Hair hint */}
                    <Path d="M42 8 Q50 2 58 8 Q60 14 58 18 Q50 8 42 18 Q40 14 42 8" fill="#4A4A5A" opacity="0.8" />

                    {/* NECK */}
                    <Path d="M46 26 L46 32 L54 32 L54 26" fill={getColor('traps')} opacity={getOpacity('traps') * 0.7} />

                    {/* TRAPS */}
                    <Path
                        d="M38 32 Q44 30 50 31 Q56 30 62 32 L60 38 Q50 36 40 38 Z"
                        fill={getColor('traps')}
                        opacity={getOpacity('traps')}
                    />

                    {/* LEFT SHOULDER */}
                    <Path
                        d="M30 35 Q25 40 24 48 Q26 54 32 55 Q38 50 40 38 Q36 34 30 35"
                        fill={getColor('shoulders')}
                        opacity={getOpacity('shoulders')}
                    />

                    {/* RIGHT SHOULDER */}
                    <Path
                        d="M70 35 Q75 40 76 48 Q74 54 68 55 Q62 50 60 38 Q64 34 70 35"
                        fill={getColor('shoulders')}
                        opacity={getOpacity('shoulders')}
                    />

                    {/* LEFT CHEST */}
                    <Path
                        d="M40 40 Q38 48 39 58 Q44 62 49 60 L49 42 Q44 38 40 40"
                        fill={getColor('chest')}
                        opacity={getOpacity('chest')}
                    />

                    {/* RIGHT CHEST */}
                    <Path
                        d="M60 40 Q62 48 61 58 Q56 62 51 60 L51 42 Q56 38 60 40"
                        fill={getColor('chest')}
                        opacity={getOpacity('chest')}
                    />

                    {/* CHEST CENTER LINE */}
                    <Path d="M50 42 L50 60" stroke="#0A0A0F" strokeWidth="0.8" opacity="0.6" />

                    {/* LEFT BICEP */}
                    <Path
                        d="M26 52 Q22 62 22 72 Q24 78 28 78 Q33 70 34 58 Q32 52 26 52"
                        fill={getColor('biceps')}
                        opacity={getOpacity('biceps')}
                    />

                    {/* RIGHT BICEP */}
                    <Path
                        d="M74 52 Q78 62 78 72 Q76 78 72 78 Q67 70 66 58 Q68 52 74 52"
                        fill={getColor('biceps')}
                        opacity={getOpacity('biceps')}
                    />

                    {/* LEFT FOREARM */}
                    <Path
                        d="M22 80 Q18 95 17 108 Q20 110 24 108 Q28 95 30 82 Q26 78 22 80"
                        fill={getColor('forearms')}
                        opacity={getOpacity('forearms')}
                    />

                    {/* RIGHT FOREARM */}
                    <Path
                        d="M78 80 Q82 95 83 108 Q80 110 76 108 Q72 95 70 82 Q74 78 78 80"
                        fill={getColor('forearms')}
                        opacity={getOpacity('forearms')}
                    />

                    {/* CORE / ABS */}
                    <Path
                        d="M42 60 L58 60 Q60 75 59 92 Q55 96 50 97 Q45 96 41 92 Q40 75 42 60"
                        fill={getColor('core')}
                        opacity={getOpacity('core')}
                    />
                    {/* Ab lines */}
                    <Path d="M50 64 L50 94" stroke="#0A0A0F" strokeWidth="0.5" opacity="0.4" />
                    <Path d="M44 70 L56 70" stroke="#0A0A0F" strokeWidth="0.4" opacity="0.3" />
                    <Path d="M44 78 L56 78" stroke="#0A0A0F" strokeWidth="0.4" opacity="0.3" />
                    <Path d="M44 86 L56 86" stroke="#0A0A0F" strokeWidth="0.4" opacity="0.3" />

                    {/* LEFT QUAD */}
                    <Path
                        d="M42 98 Q38 115 37 138 Q41 142 47 140 Q50 120 50 100 Q46 96 42 98"
                        fill={getColor('quads')}
                        opacity={getOpacity('quads')}
                    />

                    {/* RIGHT QUAD */}
                    <Path
                        d="M58 98 Q62 115 63 138 Q59 142 53 140 Q50 120 50 100 Q54 96 58 98"
                        fill={getColor('quads')}
                        opacity={getOpacity('quads')}
                    />

                    {/* LEFT CALF */}
                    <Path
                        d="M38 144 Q34 158 36 172 Q40 176 46 174 Q48 160 48 145 Q43 142 38 144"
                        fill={getColor('calves')}
                        opacity={getOpacity('calves')}
                    />

                    {/* RIGHT CALF */}
                    <Path
                        d="M62 144 Q66 158 64 172 Q60 176 54 174 Q52 160 52 145 Q57 142 62 144"
                        fill={getColor('calves')}
                        opacity={getOpacity('calves')}
                    />

                    {/* FEET */}
                    <Ellipse cx="42" cy="178" rx="8" ry="3" fill="#3A3A4A" opacity="0.8" />
                    <Ellipse cx="58" cy="178" rx="8" ry="3" fill="#3A3A4A" opacity="0.8" />
                </Svg>
                {showLabels && <Text style={styles.viewLabel}>FRONT</Text>}
            </View>

            {/* Back View */}
            <View style={styles.bodyContainer}>
                <Svg width={singleWidth} height={singleHeight} viewBox="0 0 100 180">
                    <Defs>
                        <LinearGradient id="bodyOutlineBack" x1="0%" y1="0%" x2="0%" y2="100%">
                            <Stop offset="0%" stopColor="#555566" stopOpacity="0.6" />
                            <Stop offset="100%" stopColor="#333344" stopOpacity="0.4" />
                        </LinearGradient>
                    </Defs>

                    {/* HEAD (back) */}
                    <Ellipse cx="50" cy="16" rx="10" ry="12" fill="#3A3A4A" stroke="#555566" strokeWidth="0.5" />

                    {/* Hair (back) */}
                    <Path d="M40 6 Q50 0 60 6 Q62 16 60 22 Q50 12 40 22 Q38 16 40 6" fill="#4A4A5A" opacity="0.9" />

                    {/* NECK (back) */}
                    <Path d="M46 26 L46 32 L54 32 L54 26" fill={getColor('traps')} opacity={getOpacity('traps') * 0.7} />

                    {/* UPPER TRAPS */}
                    <Path
                        d="M38 32 Q44 28 50 30 Q56 28 62 32 L60 40 Q50 38 40 40 Z"
                        fill={getColor('traps')}
                        opacity={getOpacity('traps')}
                    />

                    {/* LEFT REAR DELT */}
                    <Path
                        d="M30 35 Q25 40 24 48 Q26 54 32 55 Q38 50 40 38 Q36 34 30 35"
                        fill={getColor('shoulders')}
                        opacity={getOpacity('shoulders')}
                    />

                    {/* RIGHT REAR DELT */}
                    <Path
                        d="M70 35 Q75 40 76 48 Q74 54 68 55 Q62 50 60 38 Q64 34 70 35"
                        fill={getColor('shoulders')}
                        opacity={getOpacity('shoulders')}
                    />

                    {/* UPPER BACK / LATS */}
                    <G>
                        {/* Left lat */}
                        <Path
                            d="M40 42 Q36 55 37 75 Q42 85 48 82 L48 44 Q44 40 40 42"
                            fill={getColor('back')}
                            opacity={getOpacity('back')}
                        />
                        {/* Right lat */}
                        <Path
                            d="M60 42 Q64 55 63 75 Q58 85 52 82 L52 44 Q56 40 60 42"
                            fill={getColor('back')}
                            opacity={getOpacity('back')}
                        />
                        {/* Spine line */}
                        <Path d="M50 38 L50 90" stroke="#0A0A0F" strokeWidth="1" opacity="0.5" />
                        {/* Mid back definition */}
                        <Path d="M44 50 Q50 48 56 50" stroke="#0A0A0F" strokeWidth="0.5" opacity="0.3" />
                        <Path d="M44 60 Q50 58 56 60" stroke="#0A0A0F" strokeWidth="0.5" opacity="0.3" />
                    </G>

                    {/* LEFT TRICEP (back view) */}
                    <Path
                        d="M28 52 Q24 62 24 74 Q26 78 30 78 Q35 68 36 56 Q33 50 28 52"
                        fill={getColor('triceps')}
                        opacity={getOpacity('triceps')}
                    />

                    {/* RIGHT TRICEP (back view) */}
                    <Path
                        d="M72 52 Q76 62 76 74 Q74 78 70 78 Q65 68 64 56 Q67 50 72 52"
                        fill={getColor('triceps')}
                        opacity={getOpacity('triceps')}
                    />

                    {/* LEFT FOREARM (back) */}
                    <Path
                        d="M24 80 Q20 95 19 108 Q22 110 26 108 Q30 95 32 82 Q28 78 24 80"
                        fill={getColor('forearms')}
                        opacity={getOpacity('forearms')}
                    />

                    {/* RIGHT FOREARM (back) */}
                    <Path
                        d="M76 80 Q80 95 81 108 Q78 110 74 108 Q70 95 68 82 Q72 78 76 80"
                        fill={getColor('forearms')}
                        opacity={getOpacity('forearms')}
                    />

                    {/* LOWER BACK */}
                    <Path
                        d="M44 82 L56 82 Q58 90 56 96 Q52 98 50 98 Q48 98 44 96 Q42 90 44 82"
                        fill={getColor('back')}
                        opacity={getOpacity('back') * 0.8}
                    />

                    {/* GLUTES */}
                    <G>
                        {/* Left glute */}
                        <Path
                            d="M42 98 Q38 105 40 115 Q45 118 50 116 L50 100 Q46 96 42 98"
                            fill={getColor('glutes')}
                            opacity={getOpacity('glutes')}
                        />
                        {/* Right glute */}
                        <Path
                            d="M58 98 Q62 105 60 115 Q55 118 50 116 L50 100 Q54 96 58 98"
                            fill={getColor('glutes')}
                            opacity={getOpacity('glutes')}
                        />
                        {/* Center line */}
                        <Path d="M50 98 L50 116" stroke="#0A0A0F" strokeWidth="0.8" opacity="0.5" />
                    </G>

                    {/* LEFT HAMSTRING */}
                    <Path
                        d="M40 118 Q37 132 38 148 Q42 152 47 150 Q50 135 50 120 Q46 116 40 118"
                        fill={getColor('hamstrings')}
                        opacity={getOpacity('hamstrings')}
                    />

                    {/* RIGHT HAMSTRING */}
                    <Path
                        d="M60 118 Q63 132 62 148 Q58 152 53 150 Q50 135 50 120 Q54 116 60 118"
                        fill={getColor('hamstrings')}
                        opacity={getOpacity('hamstrings')}
                    />
                    {/* Ham center line */}
                    <Path d="M50 120 L50 148" stroke="#0A0A0F" strokeWidth="0.6" opacity="0.4" />

                    {/* LEFT CALF (back) */}
                    <Path
                        d="M38 150 Q34 162 36 174 Q40 178 46 176 Q48 164 48 152 Q43 148 38 150"
                        fill={getColor('calves')}
                        opacity={getOpacity('calves')}
                    />

                    {/* RIGHT CALF (back) */}
                    <Path
                        d="M62 150 Q66 162 64 174 Q60 178 54 176 Q52 164 52 152 Q57 148 62 150"
                        fill={getColor('calves')}
                        opacity={getOpacity('calves')}
                    />

                    {/* FEET */}
                    <Ellipse cx="42" cy="178" rx="7" ry="3" fill="#3A3A4A" opacity="0.8" />
                    <Ellipse cx="58" cy="178" rx="7" ry="3" fill="#3A3A4A" opacity="0.8" />
                </Svg>
                {showLabels && <Text style={styles.viewLabel}>BACK</Text>}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.md,
    },
    bodyContainer: {
        alignItems: 'center',
    },
    viewLabel: {
        fontSize: typography.sizes.xs,
        fontWeight: '600',
        color: colors.textMuted,
        letterSpacing: 2,
        marginTop: spacing.sm,
    },
});
