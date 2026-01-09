import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Line, Circle, G, Text as SvgText } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../config/theme';

const { width } = Dimensions.get('window');

interface ProgressChartProps {
    title: string;
    data: { label: string; value: number }[];
    color?: string;
    suffix?: string;
}

export default function ProgressChart({
    title,
    data,
    color = colors.accentPrimary,
    suffix = '',
}: ProgressChartProps) {
    // Need at least 2 points for a line chart
    if (data.length < 2) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={[colors.bgCard, colors.bgSecondary]}
                    style={styles.gradient}
                >
                    <Text style={styles.title}>{title}</Text>
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyIcon}>📊</Text>
                        <Text style={styles.emptyText}>Complete more workouts to see progress</Text>
                    </View>
                </LinearGradient>
            </View>
        );
    }

    // Take last 7 data points max
    const chartData = data.slice(-7);
    const values = chartData.map(d => d.value);
    const labels = chartData.map(d => d.label);

    // Calculate chart dimensions
    const chartWidth = width - spacing.lg * 4;
    const chartHeight = 150;
    const padding = { top: 20, right: 10, bottom: 30, left: 10 };
    const innerWidth = chartWidth - padding.left - padding.right;
    const innerHeight = chartHeight - padding.top - padding.bottom;

    // Calculate min/max for scaling
    const minValue = Math.min(...values) * 0.95;
    const maxValue = Math.max(...values) * 1.05;
    const valueRange = maxValue - minValue || 1;

    // Generate path points
    const points = values.map((value, index) => {
        const x = padding.left + (index / (values.length - 1)) * innerWidth;
        const y = padding.top + innerHeight - ((value - minValue) / valueRange) * innerHeight;
        return { x, y, value };
    });

    // Create SVG path
    const pathD = points.reduce((acc, point, index) => {
        if (index === 0) {
            return `M ${point.x} ${point.y}`;
        }
        // Bezier curve for smooth line
        const prev = points[index - 1];
        const cpx = (prev.x + point.x) / 2;
        return `${acc} Q ${cpx} ${prev.y} ${point.x} ${point.y}`;
    }, '');

    // Calculate change
    const firstValue = values[0];
    const lastValue = values[values.length - 1];
    const change = lastValue - firstValue;
    const percentChange = firstValue > 0 ? ((change / firstValue) * 100).toFixed(1) : '0';

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={[colors.bgCard, colors.bgSecondary]}
                style={styles.gradient}
            >
                <View style={styles.header}>
                    <Text style={styles.title}>{title}</Text>
                    <View style={styles.changeContainer}>
                        <Text style={[
                            styles.changeText,
                            { color: change >= 0 ? colors.accentSuccess : colors.accentDanger }
                        ]}>
                            {change >= 0 ? '+' : ''}{change}{suffix}
                        </Text>
                        <Text style={styles.percentText}>
                            ({change >= 0 ? '+' : ''}{percentChange}%)
                        </Text>
                    </View>
                </View>

                <Svg width={chartWidth} height={chartHeight}>
                    {/* Grid lines */}
                    {[0, 0.5, 1].map((ratio, i) => (
                        <Line
                            key={i}
                            x1={padding.left}
                            y1={padding.top + innerHeight * ratio}
                            x2={chartWidth - padding.right}
                            y2={padding.top + innerHeight * ratio}
                            stroke={colors.glassBorder}
                            strokeWidth="1"
                            strokeDasharray="4,4"
                        />
                    ))}

                    {/* Line path */}
                    <Path
                        d={pathD}
                        fill="none"
                        stroke={color}
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Data points */}
                    {points.map((point, index) => (
                        <G key={index}>
                            <Circle
                                cx={point.x}
                                cy={point.y}
                                r="5"
                                fill={colors.bgCard}
                                stroke={color}
                                strokeWidth="2"
                            />
                        </G>
                    ))}

                    {/* X-axis labels */}
                    {labels.map((label, index) => {
                        const x = padding.left + (index / (labels.length - 1)) * innerWidth;
                        return (
                            <SvgText
                                key={index}
                                x={x}
                                y={chartHeight - 5}
                                fill={colors.textMuted}
                                fontSize="10"
                                textAnchor="middle"
                            >
                                {label}
                            </SvgText>
                        );
                    })}
                </Svg>

                {/* Current value display */}
                <View style={styles.currentValue}>
                    <Text style={[styles.valueText, { color }]}>
                        {lastValue}{suffix}
                    </Text>
                    <Text style={styles.valueLabel}>Current</Text>
                </View>
            </LinearGradient>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    gradient: {
        padding: spacing.md,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    title: {
        fontSize: typography.sizes.sm,
        fontWeight: '700',
        color: colors.textPrimary,
        letterSpacing: 1,
    },
    changeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    changeText: {
        fontSize: typography.sizes.sm,
        fontWeight: '700',
    },
    percentText: {
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
    },
    currentValue: {
        alignItems: 'center',
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.glassBorder,
        marginTop: spacing.sm,
    },
    valueText: {
        fontSize: typography.sizes.xxl,
        fontWeight: '900',
    },
    valueLabel: {
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
        marginTop: spacing.xs,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: spacing.xl,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: spacing.md,
    },
    emptyText: {
        fontSize: typography.sizes.sm,
        color: colors.textMuted,
        textAlign: 'center',
    },
});
