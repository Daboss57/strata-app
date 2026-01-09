import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, G, Ellipse, RadialGradient } from 'react-native-svg';
import { getTierColor, colors } from '../config/theme';
import type { MuscleGroup } from '../lib/muscleMap';

interface MuscleMapSVGProps {
    muscleTiers: Record<MuscleGroup, number>;
    width?: number;
    height?: number;
}

export default function MuscleMapSVG({
    muscleTiers,
    width = 180,
    height = 320
}: MuscleMapSVGProps) {
    const getColor = (muscle: MuscleGroup) => getTierColor(muscleTiers[muscle] || 5);
    const getGlowOpacity = (muscle: MuscleGroup) => {
        const tier = muscleTiers[muscle] || 5;
        return tier <= 2 ? 0.6 : tier <= 3 ? 0.4 : 0.2;
    };

    return (
        <View style={styles.container}>
            <Svg width={width} height={height} viewBox="0 0 180 320">
                <Defs>
                    {/* Ambient glow gradient */}
                    <RadialGradient id="ambientGlow" cx="50%" cy="40%" r="60%">
                        <Stop offset="0%" stopColor={colors.accentPrimary} stopOpacity="0.08" />
                        <Stop offset="100%" stopColor="transparent" stopOpacity="0" />
                    </RadialGradient>

                    {/* Body outline gradient */}
                    <LinearGradient id="outlineGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor={colors.accentPrimary} stopOpacity="0.4" />
                        <Stop offset="50%" stopColor={colors.accentSecondary} stopOpacity="0.2" />
                        <Stop offset="100%" stopColor={colors.accentPrimary} stopOpacity="0.3" />
                    </LinearGradient>
                </Defs>

                {/* Background ambient glow */}
                <Ellipse cx="90" cy="140" rx="80" ry="120" fill="url(#ambientGlow)" />

                {/* ========== HEAD ========== */}
                <Ellipse cx="90" cy="28" rx="18" ry="22" fill="#1A1A24" stroke={colors.glassBorder} strokeWidth="0.5" />

                {/* ========== NECK (part of traps) ========== */}
                <Path
                    d="M82 48 Q90 52 98 48 L100 58 Q90 62 80 58 Z"
                    fill={getColor('traps')}
                    opacity="0.85"
                />

                {/* ========== TRAPS ========== */}
                <Path
                    d="M65 62 Q75 55 90 58 Q105 55 115 62 L110 75 Q90 70 70 75 Z"
                    fill={getColor('traps')}
                    opacity="0.9"
                />

                {/* ========== SHOULDERS (Left) ========== */}
                <Path
                    d="M50 68 Q42 72 40 85 Q42 95 50 98 Q60 90 65 75 Q60 68 50 68"
                    fill={getColor('shoulders')}
                    opacity="0.95"
                />
                {/* Shoulder highlight */}
                <Path
                    d="M48 72 Q44 78 44 85"
                    stroke={getColor('shoulders')}
                    strokeWidth="2"
                    strokeOpacity={getGlowOpacity('shoulders')}
                    fill="none"
                />

                {/* ========== SHOULDERS (Right) ========== */}
                <Path
                    d="M130 68 Q138 72 140 85 Q138 95 130 98 Q120 90 115 75 Q120 68 130 68"
                    fill={getColor('shoulders')}
                    opacity="0.95"
                />
                {/* Shoulder highlight */}
                <Path
                    d="M132 72 Q136 78 136 85"
                    stroke={getColor('shoulders')}
                    strokeWidth="2"
                    strokeOpacity={getGlowOpacity('shoulders')}
                    fill="none"
                />

                {/* ========== CHEST ========== */}
                <G>
                    {/* Left pec */}
                    <Path
                        d="M68 75 Q65 85 67 100 Q75 108 88 105 L88 78 Q78 72 68 75"
                        fill={getColor('chest')}
                        opacity="0.95"
                    />
                    {/* Right pec */}
                    <Path
                        d="M112 75 Q115 85 113 100 Q105 108 92 105 L92 78 Q102 72 112 75"
                        fill={getColor('chest')}
                        opacity="0.95"
                    />
                    {/* Chest separation line */}
                    <Path
                        d="M90 78 L90 105"
                        stroke="#0A0A0F"
                        strokeWidth="1.5"
                        opacity="0.6"
                    />
                    {/* Chest highlight glow */}
                    <Path
                        d="M72 82 Q70 90 72 98"
                        stroke={getColor('chest')}
                        strokeWidth="3"
                        strokeOpacity={getGlowOpacity('chest')}
                        fill="none"
                    />
                    <Path
                        d="M108 82 Q110 90 108 98"
                        stroke={getColor('chest')}
                        strokeWidth="3"
                        strokeOpacity={getGlowOpacity('chest')}
                        fill="none"
                    />
                </G>

                {/* ========== BICEPS (Left) ========== */}
                <Path
                    d="M42 88 Q35 100 34 118 Q36 128 42 130 Q50 122 52 105 Q50 92 42 88"
                    fill={getColor('biceps')}
                    opacity="0.9"
                />

                {/* ========== BICEPS (Right) ========== */}
                <Path
                    d="M138 88 Q145 100 146 118 Q144 128 138 130 Q130 122 128 105 Q130 92 138 88"
                    fill={getColor('biceps')}
                    opacity="0.9"
                />

                {/* ========== TRICEPS (Left) - behind biceps ========== */}
                <Path
                    d="M50 92 Q58 105 56 125 Q52 130 46 128 Q42 115 48 95 Z"
                    fill={getColor('triceps')}
                    opacity="0.7"
                />

                {/* ========== TRICEPS (Right) - behind biceps ========== */}
                <Path
                    d="M130 92 Q122 105 124 125 Q128 130 134 128 Q138 115 132 95 Z"
                    fill={getColor('triceps')}
                    opacity="0.7"
                />

                {/* ========== FOREARMS (Left) ========== */}
                <Path
                    d="M34 132 Q28 155 26 178 Q30 182 36 180 Q42 158 44 135 Q40 130 34 132"
                    fill={getColor('forearms')}
                    opacity="0.85"
                />

                {/* ========== FOREARMS (Right) ========== */}
                <Path
                    d="M146 132 Q152 155 154 178 Q150 182 144 180 Q138 158 136 135 Q140 130 146 132"
                    fill={getColor('forearms')}
                    opacity="0.85"
                />

                {/* ========== CORE / ABS ========== */}
                <G>
                    <Path
                        d="M75 108 L105 108 Q108 130 106 158 Q100 165 90 168 Q80 165 74 158 Q72 130 75 108"
                        fill={getColor('core')}
                        opacity="0.9"
                    />
                    {/* Ab separation lines */}
                    <Path d="M90 112 L90 162" stroke="#0A0A0F" strokeWidth="1" opacity="0.5" />
                    <Path d="M78 120 L102 120" stroke="#0A0A0F" strokeWidth="0.8" opacity="0.4" />
                    <Path d="M77 133 L103 133" stroke="#0A0A0F" strokeWidth="0.8" opacity="0.4" />
                    <Path d="M78 146 L102 146" stroke="#0A0A0F" strokeWidth="0.8" opacity="0.4" />
                    {/* Core glow */}
                    <Path
                        d="M84 115 L84 155"
                        stroke={getColor('core')}
                        strokeWidth="2"
                        strokeOpacity={getGlowOpacity('core')}
                    />
                    <Path
                        d="M96 115 L96 155"
                        stroke={getColor('core')}
                        strokeWidth="2"
                        strokeOpacity={getGlowOpacity('core')}
                    />
                </G>

                {/* ========== BACK (subtle behind core) ========== */}
                <Path
                    d="M70 70 Q65 100 68 155 L112 155 Q115 100 110 70 Q90 65 70 70"
                    fill={getColor('back')}
                    opacity="0.25"
                />

                {/* ========== GLUTES ========== */}
                <Ellipse
                    cx="90"
                    cy="175"
                    rx="22"
                    ry="12"
                    fill={getColor('glutes')}
                    opacity="0.6"
                />

                {/* ========== QUADS (Left) ========== */}
                <Path
                    d="M72 172 Q65 200 62 240 Q68 248 78 245 Q85 210 86 175 Q80 170 72 172"
                    fill={getColor('quads')}
                    opacity="0.95"
                />
                {/* Quad muscle definition */}
                <Path
                    d="M70 190 Q68 210 67 230"
                    stroke={getColor('quads')}
                    strokeWidth="2"
                    strokeOpacity={getGlowOpacity('quads')}
                    fill="none"
                />

                {/* ========== QUADS (Right) ========== */}
                <Path
                    d="M108 172 Q115 200 118 240 Q112 248 102 245 Q95 210 94 175 Q100 170 108 172"
                    fill={getColor('quads')}
                    opacity="0.95"
                />
                {/* Quad muscle definition */}
                <Path
                    d="M110 190 Q112 210 113 230"
                    stroke={getColor('quads')}
                    strokeWidth="2"
                    strokeOpacity={getGlowOpacity('quads')}
                    fill="none"
                />

                {/* ========== HAMSTRINGS (behind quads) ========== */}
                <Path
                    d="M74 178 Q70 205 68 235 L78 240 Q82 210 84 180 Z"
                    fill={getColor('hamstrings')}
                    opacity="0.4"
                />
                <Path
                    d="M106 178 Q110 205 112 235 L102 240 Q98 210 96 180 Z"
                    fill={getColor('hamstrings')}
                    opacity="0.4"
                />

                {/* ========== CALVES (Left) ========== */}
                <Path
                    d="M62 250 Q56 275 58 300 Q64 308 74 305 Q78 280 78 252 Q70 248 62 250"
                    fill={getColor('calves')}
                    opacity="0.9"
                />
                <Path
                    d="M65 260 Q62 278 63 295"
                    stroke={getColor('calves')}
                    strokeWidth="2"
                    strokeOpacity={getGlowOpacity('calves')}
                    fill="none"
                />

                {/* ========== CALVES (Right) ========== */}
                <Path
                    d="M118 250 Q124 275 122 300 Q116 308 106 305 Q102 280 102 252 Q110 248 118 250"
                    fill={getColor('calves')}
                    opacity="0.9"
                />
                <Path
                    d="M115 260 Q118 278 117 295"
                    stroke={getColor('calves')}
                    strokeWidth="2"
                    strokeOpacity={getGlowOpacity('calves')}
                    fill="none"
                />

                {/* ========== FEET ========== */}
                <Ellipse cx="68" cy="312" rx="12" ry="5" fill="#1A1A24" stroke={colors.glassBorder} strokeWidth="0.5" />
                <Ellipse cx="112" cy="312" rx="12" ry="5" fill="#1A1A24" stroke={colors.glassBorder} strokeWidth="0.5" />

                {/* ========== BODY OUTLINE GLOW ========== */}
                <Path
                    d="M90 6 
             Q115 6 118 28 Q120 48 100 58 
             L130 68 Q148 78 148 100 Q152 135 155 178 
             L145 180 Q140 140 138 130 
             L138 175 Q145 220 140 270 Q138 305 115 315 
             L65 315 Q42 305 40 270 Q35 220 42 175 
             L42 130 Q40 140 35 180 
             L25 178 Q28 135 32 100 Q32 78 50 68 
             L80 58 Q60 48 62 28 Q65 6 90 6"
                    fill="none"
                    stroke="url(#outlineGrad)"
                    strokeWidth="1"
                />
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});
