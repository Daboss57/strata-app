import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography, getTierColor } from '../config/theme';
import type { WorkoutRecord } from '../lib/workoutHistory';

interface WorkoutCalendarProps {
    workoutHistory: WorkoutRecord[];
    currentMonth?: Date;
    onMonthChange?: (date: Date) => void;
}

const DAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

export default function WorkoutCalendar({
    workoutHistory,
    currentMonth = new Date(),
}: WorkoutCalendarProps) {
    // Get workout dates as a Set for fast lookup
    const workoutDates = useMemo(() => {
        const dates = new Map<string, WorkoutRecord>();
        workoutHistory.forEach(w => dates.set(w.date, w));
        return dates;
    }, [workoutHistory]);

    // Generate calendar grid
    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        // Adjust for Monday start (0 = Monday, 6 = Sunday)
        let startDayOfWeek = firstDay.getDay() - 1;
        if (startDayOfWeek < 0) startDayOfWeek = 6;

        const daysInMonth = lastDay.getDate();
        const weeks: (number | null)[][] = [];
        let currentWeek: (number | null)[] = [];

        // Fill empty days at start
        for (let i = 0; i < startDayOfWeek; i++) {
            currentWeek.push(null);
        }

        // Fill days
        for (let day = 1; day <= daysInMonth; day++) {
            currentWeek.push(day);
            if (currentWeek.length === 7) {
                weeks.push(currentWeek);
                currentWeek = [];
            }
        }

        // Fill remaining days
        while (currentWeek.length < 7 && currentWeek.length > 0) {
            currentWeek.push(null);
        }
        if (currentWeek.length > 0) {
            weeks.push(currentWeek);
        }

        return weeks;
    }, [currentMonth]);

    const getDateString = (day: number) => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    };

    const isToday = (day: number) => {
        const today = new Date();
        return (
            today.getDate() === day &&
            today.getMonth() === currentMonth.getMonth() &&
            today.getFullYear() === currentMonth.getFullYear()
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.monthTitle}>
                    {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </Text>
            </View>

            {/* Day labels */}
            <View style={styles.daysHeader}>
                {DAYS.map((day, i) => (
                    <View key={i} style={styles.dayLabel}>
                        <Text style={styles.dayLabelText}>{day}</Text>
                    </View>
                ))}
            </View>

            {/* Calendar grid */}
            <View style={styles.grid}>
                {calendarDays.map((week, weekIndex) => (
                    <View key={weekIndex} style={styles.week}>
                        {week.map((day, dayIndex) => {
                            if (day === null) {
                                return <View key={dayIndex} style={styles.emptyDay} />;
                            }

                            const dateStr = getDateString(day);
                            const workout = workoutDates.get(dateStr);
                            const hasWorkout = !!workout;
                            const hasPR = workout && workout.prsHit.length > 0;
                            const today = isToday(day);

                            return (
                                <View
                                    key={dayIndex}
                                    style={[
                                        styles.dayCell,
                                        today && styles.todayCell,
                                    ]}
                                >
                                    <Text style={[
                                        styles.dayNumber,
                                        today && styles.todayNumber,
                                        hasWorkout && styles.workoutDayNumber,
                                    ]}>
                                        {day}
                                    </Text>
                                    {hasWorkout && (
                                        <View style={styles.workoutIndicator}>
                                            <View style={[
                                                styles.workoutDot,
                                                { backgroundColor: hasPR ? '#FFD700' : colors.accentPrimary }
                                            ]} />
                                            {hasPR && <Text style={styles.prStar}>⭐</Text>}
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                ))}
            </View>

            {/* Legend */}
            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: colors.accentPrimary }]} />
                    <Text style={styles.legendText}>Workout</Text>
                </View>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#FFD700' }]} />
                    <Text style={styles.legendText}>PR Day</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: colors.bgCard,
        borderRadius: borderRadius.lg,
        padding: spacing.md,
        borderWidth: 1,
        borderColor: colors.glassBorder,
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    monthTitle: {
        fontSize: typography.sizes.md,
        fontWeight: '700',
        color: colors.textPrimary,
        letterSpacing: 1,
    },
    daysHeader: {
        flexDirection: 'row',
        marginBottom: spacing.sm,
    },
    dayLabel: {
        flex: 1,
        alignItems: 'center',
    },
    dayLabelText: {
        fontSize: typography.sizes.xs,
        fontWeight: '600',
        color: colors.textMuted,
    },
    grid: {
        gap: spacing.xs,
    },
    week: {
        flexDirection: 'row',
    },
    emptyDay: {
        flex: 1,
        aspectRatio: 1,
        margin: 2,
    },
    dayCell: {
        flex: 1,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 2,
        borderRadius: borderRadius.sm,
        backgroundColor: colors.bgSecondary,
    },
    todayCell: {
        borderWidth: 2,
        borderColor: colors.accentPrimary,
    },
    dayNumber: {
        fontSize: typography.sizes.sm,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    todayNumber: {
        color: colors.accentPrimary,
        fontWeight: '700',
    },
    workoutDayNumber: {
        color: colors.textPrimary,
        fontWeight: '700',
    },
    workoutIndicator: {
        position: 'absolute',
        bottom: 2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    workoutDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    prStar: {
        fontSize: 8,
        marginLeft: 1,
    },
    legend: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: spacing.lg,
        marginTop: spacing.md,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.glassBorder,
    },
    legendItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.xs,
    },
    legendDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    legendText: {
        fontSize: typography.sizes.xs,
        color: colors.textMuted,
    },
});
