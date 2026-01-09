import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    TextInput,
    ActivityIndicator,
    Animated,
    Easing,
    Dimensions,
    Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, borderRadius, typography } from '../../src/config/theme';
import { useOnboarding } from '../../src/context/OnboardingContext';
import { useWorkout } from '../../src/context/WorkoutContext';
import { generateWorkout, type Exercise, type GeneratedWorkout } from '../../src/lib/geminiService';
import { calculateNewSignal } from '../../src/lib/eloService';
import { getExerciseMuscles, updateMuscleProgress } from '../../src/lib/muscleMap';
import WorkoutSummary, { type WorkoutReportData } from '../../src/components/WorkoutSummary';
import ExerciseInfoModal from '../../src/components/ExerciseInfoModal';

const { width, height } = Dimensions.get('window');

type WorkoutType = 'push' | 'pull' | 'legs' | 'upper' | 'lower' | 'full' | 'powerlifting';

const WORKOUT_TYPES: { type: WorkoutType; label: string; icon: string; description: string; color: string }[] = [
    { type: 'push', label: 'Push Day', icon: '💪', description: 'Chest, shoulders, triceps', color: '#FF6B6B' },
    { type: 'pull', label: 'Pull Day', icon: '🎯', description: 'Back, biceps, rear delts', color: '#4ECDC4' },
    { type: 'legs', label: 'Leg Day', icon: '🦵', description: 'Quads, hamstrings, glutes', color: '#A855F7' },
    { type: 'upper', label: 'Upper Body', icon: '🔝', description: 'Complete upper workout', color: '#3B82F6' },
    { type: 'lower', label: 'Lower Body', icon: '⬇️', description: 'Complete lower workout', color: '#F59E0B' },
    { type: 'full', label: 'Full Body', icon: '🏋️', description: 'Total body training', color: '#10B981' },
    { type: 'powerlifting', label: 'Powerlifting', icon: '🏆', description: 'Squat, bench, deadlift', color: '#FFD700' },
];

const REST_PRESETS = [60, 90, 120, 180, 300];

interface SetData {
    weight: string;
    reps: string;
    completed: boolean;
    isPR?: boolean;
    e1RM?: number;
}

export default function WorkoutScreen() {
    const { data, updateData, addWorkoutRecord } = useOnboarding();
    const {
        currentWorkout,
        activeSession,
        startSession,
        endSession,
        logSet,
        lastSessionData,
        sessionPRs,
        setOnBig3PR,
    } = useWorkout();

    // Workout generation
    const [isLoading, setIsLoading] = useState(false);
    const [selectedType, setSelectedType] = useState<WorkoutType | null>(null);
    const [generatedWorkout, setGeneratedWorkout] = useState<GeneratedWorkout | null>(null);

    // Guided workout state
    const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
    const [exerciseSets, setExerciseSets] = useState<Record<string, SetData[]>>({});
    const [currentSetIndex, setCurrentSetIndex] = useState(0);
    const [currentWeight, setCurrentWeight] = useState('');
    const [currentReps, setCurrentReps] = useState('');

    // Rest timer
    const [isResting, setIsResting] = useState(false);
    const [restDuration, setRestDuration] = useState(90); // Default 90 seconds
    const [restRemaining, setRestRemaining] = useState(0);
    const [showRestSettings, setShowRestSettings] = useState(false);

    // PR celebration
    const prGlow = useRef(new Animated.Value(0)).current;
    const prScale = useRef(new Animated.Value(0)).current;
    const [showPRCelebration, setShowPRCelebration] = useState(false);
    const [prMessage, setPRMessage] = useState('');

    // Workout summary
    const [showSummary, setShowSummary] = useState(false);
    const [summaryData, setSummaryData] = useState<{
        workoutData: WorkoutReportData;
        signalBefore: number;
        signalAfter: number;
    } | null>(null);

    // Exercise info modal
    const [showExerciseInfo, setShowExerciseInfo] = useState(false);
    const [selectedExercise, setSelectedExercise] = useState<string>('');

    // Rest timer animation
    const restProgress = useRef(new Animated.Value(0)).current;

    // Set up Big 3 PR callback
    useEffect(() => {
        setOnBig3PR((lift, new1RM) => {
            const updates: Record<string, number> = {};
            if (lift === 'squat' && (!data.squatMax || new1RM > data.squatMax)) {
                updates.squatMax = new1RM;
            } else if (lift === 'bench' && (!data.benchMax || new1RM > data.benchMax)) {
                updates.benchMax = new1RM;
            } else if (lift === 'deadlift' && (!data.deadliftMax || new1RM > data.deadliftMax)) {
                updates.deadliftMax = new1RM;
            }
            if (Object.keys(updates).length > 0) {
                updateData(updates);
            }
        });
    }, [setOnBig3PR, updateData, data]);

    // Rest timer countdown
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isResting && restRemaining > 0) {
            interval = setInterval(() => {
                setRestRemaining(prev => {
                    if (prev <= 1) {
                        setIsResting(false);
                        Vibration.vibrate([0, 200, 100, 200, 100, 400]);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isResting, restRemaining]);

    // Animate rest progress
    useEffect(() => {
        if (isResting) {
            restProgress.setValue(0);
            Animated.timing(restProgress, {
                toValue: 1,
                duration: restDuration * 1000,
                useNativeDriver: false,
                easing: Easing.linear,
            }).start();
        }
    }, [isResting, restDuration]);

    const getCurrentExercise = (): Exercise | null => {
        if (!currentWorkout) return null;
        return currentWorkout.exercises[currentExerciseIndex] || null;
    };

    const initializeExerciseSets = (workout: GeneratedWorkout) => {
        const sets: Record<string, SetData[]> = {};
        workout.exercises.forEach(ex => {
            const lastData = lastSessionData[ex.name];
            sets[ex.name] = Array(ex.sets).fill(null).map(() => ({
                weight: lastData ? String(lastData.weight) : '',
                reps: '',
                completed: false,
            }));
        });
        setExerciseSets(sets);
    };

    const handleGenerateWorkout = async (type: WorkoutType) => {
        setSelectedType(type);
        setIsLoading(true);

        const profile = {
            gender: data.gender || 'male',
            bodyweight: data.bodyweight || 165,
            squatMax: data.squatMax || 135,
            benchMax: data.benchMax || 95,
            deadliftMax: data.deadliftMax || 135,
            weakestLift: 'bench' as const,
            tier: 4,
            goal: 'strength' as const,
        };

        try {
            const workout = await generateWorkout(profile, type);
            setGeneratedWorkout(workout);
        } catch (error) {
            console.error('Failed to generate workout:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStartWorkout = () => {
        if (generatedWorkout) {
            startSession(generatedWorkout);
            initializeExerciseSets(generatedWorkout);
            setCurrentExerciseIndex(0);
            setCurrentSetIndex(0);
            const firstExercise = generatedWorkout.exercises[0];
            const lastData = lastSessionData[firstExercise?.name];
            setCurrentWeight(lastData ? String(lastData.weight) : '');
            setCurrentReps('');
        }
    };

    const triggerPRCelebration = useCallback((exerciseName: string, e1RM: number) => {
        setPRMessage(`NEW PR!\n${exerciseName}\nEst. 1RM: ${e1RM} lbs`);
        setShowPRCelebration(true);
        Vibration.vibrate([0, 100, 50, 100, 50, 200]);

        Animated.parallel([
            Animated.sequence([
                Animated.spring(prScale, { toValue: 1.2, tension: 100, friction: 5, useNativeDriver: true }),
                Animated.spring(prScale, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }),
            ]),
            Animated.sequence([
                Animated.timing(prGlow, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.timing(prGlow, { toValue: 0.6, duration: 300, useNativeDriver: true }),
                Animated.timing(prGlow, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.delay(1000),
                Animated.timing(prGlow, { toValue: 0, duration: 400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
            ]),
        ]).start(() => {
            setShowPRCelebration(false);
            prScale.setValue(0);
        });
    }, [prGlow, prScale]);

    const handleCompleteSet = () => {
        const exercise = getCurrentExercise();
        if (!exercise || !currentWeight || !currentReps) return;

        const weight = parseFloat(currentWeight);
        const reps = parseInt(currentReps);

        // Log the set
        const result = logSet(exercise.name, { weight, reps });

        // Update set data
        setExerciseSets(prev => {
            const updated = { ...prev };
            if (updated[exercise.name] && updated[exercise.name][currentSetIndex]) {
                updated[exercise.name][currentSetIndex] = {
                    weight: currentWeight,
                    reps: currentReps,
                    completed: true,
                    isPR: result.isPR,
                    e1RM: result.estimated1RM,
                };
            }
            return updated;
        });

        // PR celebration
        if (result.isPR) {
            triggerPRCelebration(exercise.name, result.estimated1RM);
        } else {
            Vibration.vibrate(50);
        }

        // Check if more sets remain
        const sets = exerciseSets[exercise.name] || [];
        const nextSetIndex = currentSetIndex + 1;

        if (nextSetIndex < sets.length) {
            // Start rest timer
            setRestRemaining(restDuration);
            setIsResting(true);
            setCurrentSetIndex(nextSetIndex);
            setCurrentReps('');
        } else {
            // Exercise complete, move to next
            moveToNextExercise();
        }
    };

    const moveToNextExercise = () => {
        if (!currentWorkout) return;

        const nextIndex = currentExerciseIndex + 1;
        if (nextIndex < currentWorkout.exercises.length) {
            setCurrentExerciseIndex(nextIndex);
            setCurrentSetIndex(0);
            const nextExercise = currentWorkout.exercises[nextIndex];
            const lastData = lastSessionData[nextExercise?.name];
            setCurrentWeight(lastData ? String(lastData.weight) : '');
            setCurrentReps('');
            setIsResting(false);
        } else {
            // Workout complete
            handleEndWorkout();
        }
    };

    const handleSkipRest = () => {
        setIsResting(false);
        setRestRemaining(0);
        restProgress.setValue(1);
    };

    const handleAddSet = () => {
        const exercise = getCurrentExercise();
        if (!exercise) return;

        setExerciseSets(prev => {
            const updated = { ...prev };
            if (updated[exercise.name]) {
                updated[exercise.name] = [
                    ...updated[exercise.name],
                    { weight: currentWeight, reps: '', completed: false }
                ];
            }
            return updated;
        });
    };

    const handleEndWorkout = () => {
        const session = endSession();

        // Calculate new Signal score
        if (session) {
            const currentSignal = data.strataSignal || 1000;
            const performance = {
                completed: true,
                prsHit: session.prsHit.length,
                volume: 0,
                difficulty: 8,
            };

            const newSignal = calculateNewSignal(currentSignal, performance);
            const diff = newSignal - currentSignal;

            // Build exercise data with muscle contributions
            const exerciseData: { name: string; sets: { weight: number; reps: number }[] }[] = [];
            const musclesWorked: Record<string, number> = {};

            for (const exercise of generatedWorkout?.exercises || []) {
                const sets = exerciseSets[exercise.name] || [];
                const completedSets = sets.filter(s => s.completed).map(s => ({
                    weight: parseFloat(s.weight) || 0,
                    reps: parseInt(s.reps) || 0,
                }));

                if (completedSets.length > 0) {
                    exerciseData.push({ name: exercise.name, sets: completedSets });

                    // Calculate muscle volume
                    const muscles = getExerciseMuscles(exercise.name);
                    for (const set of completedSets) {
                        const volume = set.weight * set.reps;
                        for (const [muscle, contribution] of Object.entries(muscles)) {
                            musclesWorked[muscle] = (musclesWorked[muscle] || 0) + (volume * contribution);
                        }
                    }
                }
            }

            // Update muscle progress
            const newMuscleProgress = updateMuscleProgress(data.muscleProgress || {}, exerciseData);
            updateData({ strataSignal: newSignal, muscleProgress: newMuscleProgress });

            // Save workout record for history & streaks
            const today = new Date();
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            const totalSets = Object.values(exerciseSets).reduce(
                (sum, sets) => sum + sets.filter(s => s.completed).length,
                0
            );

            addWorkoutRecord({
                date: dateStr,
                title: generatedWorkout?.title || 'Workout',
                duration: Math.round((Date.now() - (activeSession?.startTime?.getTime() || Date.now())) / 60000),
                exerciseCount: currentExerciseIndex + 1,
                totalSets: totalSets,
                prsHit: session.prsHit,
                signalGain: diff,
            });

            // Build workout report data
            const workoutReportData: WorkoutReportData = {
                workoutTitle: generatedWorkout?.title || 'Workout',
                duration: Math.round((Date.now() - (activeSession?.startTime?.getTime() || Date.now())) / 60000),
                exercises: exerciseData.map(e => ({
                    name: e.name,
                    sets: e.sets.map(s => ({ ...s, completed: true })),
                    isPR: session.prsHit.some(pr => pr.toLowerCase().includes(e.name.toLowerCase())),
                })),
                musclesWorked,
                prsHit: session.prsHit,
                signalGain: diff,
            };

            // Show workout summary
            setSummaryData({
                workoutData: workoutReportData,
                signalBefore: currentSignal,
                signalAfter: newSignal,
            });
            setShowSummary(true);
        }
    };

    const handleDismissSummary = () => {
        setShowSummary(false);
        setSummaryData(null);
        setGeneratedWorkout(null);
        setSelectedType(null);
        setCurrentExerciseIndex(0);
        setCurrentSetIndex(0);
        setExerciseSets({});
    };

    const adjustWeight = (delta: number) => {
        const current = parseFloat(currentWeight) || 0;
        setCurrentWeight(String(Math.max(0, current + delta)));
    };

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // RENDER: Workout Summary
    if (showSummary && summaryData) {
        return (
            <WorkoutSummary
                workoutData={summaryData.workoutData}
                userProfile={{
                    experienceLevel: data.experienceLevel || undefined,
                    goals: data.goals,
                    focusAreas: data.focusAreas,
                }}
                signalBefore={summaryData.signalBefore}
                signalAfter={summaryData.signalAfter}
                onDismiss={handleDismissSummary}
            />
        );
    }

    // RENDER: Workout selection
    if (!currentWorkout && !generatedWorkout) {
        const recentWorkouts = data.workoutHistory.slice(-3).reverse();

        return (
            <View style={styles.container}>
                <LinearGradient colors={[colors.bgPrimary, '#0D1117', colors.bgPrimary]} style={StyleSheet.absoluteFill} />
                <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.headerLabel}>AI WORKOUT GENERATOR</Text>
                            <Text style={styles.headerTitle}>Start Training</Text>
                        </View>

                        {/* Quick Stats Row */}
                        <View style={styles.quickStatsRow}>
                            <View style={styles.quickStat}>
                                <Text style={styles.quickStatValue}>🔥 {data.currentStreak}</Text>
                                <Text style={styles.quickStatLabel}>Day Streak</Text>
                            </View>
                            <View style={styles.quickStatDivider} />
                            <View style={styles.quickStat}>
                                <Text style={styles.quickStatValue}>💪 {data.workoutHistory.length}</Text>
                                <Text style={styles.quickStatLabel}>Workouts</Text>
                            </View>
                            <View style={styles.quickStatDivider} />
                            <View style={styles.quickStat}>
                                <Text style={styles.quickStatValue}>🏆 {data.totalPRs}</Text>
                                <Text style={styles.quickStatLabel}>PRs Hit</Text>
                            </View>
                        </View>

                        {/* Workout Type Carousel */}
                        <Text style={styles.sectionTitle}>CHOOSE WORKOUT TYPE</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.carouselContainer}
                            decelerationRate="fast"
                            snapToInterval={width * 0.75 + spacing.md}
                        >
                            {WORKOUT_TYPES.map(({ type, label, icon, description, color }) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[styles.carouselCard, selectedType === type && isLoading && { borderColor: color }]}
                                    onPress={() => handleGenerateWorkout(type)}
                                    disabled={isLoading}
                                    activeOpacity={0.9}
                                >
                                    <LinearGradient
                                        colors={[color + '20', colors.bgCard]}
                                        style={styles.carouselCardGradient}
                                    >
                                        <View style={[styles.carouselIconContainer, { backgroundColor: color + '30' }]}>
                                            <Text style={styles.carouselIcon}>{icon}</Text>
                                        </View>
                                        <Text style={styles.carouselLabel}>{label}</Text>
                                        <Text style={styles.carouselDescription}>{description}</Text>
                                        {selectedType === type && isLoading ? (
                                            <ActivityIndicator size="small" color={color} style={styles.carouselLoader} />
                                        ) : (
                                            <View style={[styles.carouselStartButton, { backgroundColor: color }]}>
                                                <Text style={styles.carouselStartText}>START</Text>
                                            </View>
                                        )}
                                    </LinearGradient>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Recent Workouts */}
                        {recentWorkouts.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>RECENT WORKOUTS</Text>
                                {recentWorkouts.map((workout, index) => (
                                    <View key={workout.id} style={styles.recentWorkoutCard}>
                                        <View style={styles.recentWorkoutInfo}>
                                            <Text style={styles.recentWorkoutTitle}>{workout.title}</Text>
                                            <Text style={styles.recentWorkoutMeta}>
                                                {new Date(workout.date).toLocaleDateString()} • {workout.exerciseCount} exercises
                                            </Text>
                                        </View>
                                        <View style={styles.recentWorkoutStats}>
                                            {workout.prsHit.length > 0 && (
                                                <Text style={styles.recentWorkoutPR}>🏆 {workout.prsHit.length}</Text>
                                            )}
                                            <Text style={styles.recentWorkoutSignal}>+{workout.signalGain} 📶</Text>
                                        </View>
                                    </View>
                                ))}
                            </>
                        )}
                    </ScrollView>
                </SafeAreaView>
            </View>
        );
    }

    // RENDER: Workout preview
    if (generatedWorkout && !activeSession) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={[colors.bgPrimary, '#0D1117', colors.bgPrimary]} style={StyleSheet.absoluteFill} />
                <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
                        <TouchableOpacity style={styles.backButton} onPress={() => { setGeneratedWorkout(null); setSelectedType(null); }}>
                            <Text style={styles.backButtonText}>← Back</Text>
                        </TouchableOpacity>

                        <Text style={styles.workoutTitle}>{generatedWorkout.title}</Text>
                        <Text style={styles.workoutMeta}>{generatedWorkout.exercises.length} exercises • {generatedWorkout.duration}</Text>

                        <View style={styles.exerciseList}>
                            {generatedWorkout.exercises.map((ex, i) => (
                                <View key={i} style={styles.exercisePreview}>
                                    <Text style={styles.exercisePreviewNum}>{i + 1}</Text>
                                    <View style={styles.exercisePreviewContent}>
                                        <Text style={styles.exercisePreviewName}>{ex.name}</Text>
                                        <Text style={styles.exercisePreviewDetail}>{ex.sets} sets × {ex.reps}</Text>
                                    </View>
                                </View>
                            ))}
                        </View>

                        <TouchableOpacity onPress={handleStartWorkout} activeOpacity={0.9}>
                            <LinearGradient
                                colors={[colors.accentPrimary, colors.accentSecondary]}
                                start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                style={styles.startButton}
                            >
                                <Text style={styles.startButtonText}>BEGIN WORKOUT</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    </ScrollView>
                </SafeAreaView>
            </View>
        );
    }

    const exercise = getCurrentExercise();
    const sets = exercise ? (exerciseSets[exercise.name] || []) : [];
    const completedSetsCount = sets.filter(s => s.completed).length;

    // RENDER: Rest timer
    if (isResting) {
        const progressWidth = restProgress.interpolate({
            inputRange: [0, 1],
            outputRange: ['0%', '100%'],
        });

        return (
            <View style={styles.container}>
                <LinearGradient colors={[colors.bgPrimary, '#0D1117', colors.bgPrimary]} style={StyleSheet.absoluteFill} />
                <SafeAreaView style={styles.restContainer}>
                    <Text style={styles.restLabel}>REST</Text>
                    <Text style={styles.restTimer}>{formatTime(restRemaining)}</Text>

                    <View style={styles.restProgressContainer}>
                        <Animated.View style={[styles.restProgressFill, { width: progressWidth }]} />
                    </View>

                    <Text style={styles.restNextUp}>
                        Next: Set {currentSetIndex + 1} of {sets.length}
                    </Text>

                    <View style={styles.restActions}>
                        <TouchableOpacity style={styles.restSkipButton} onPress={handleSkipRest}>
                            <Text style={styles.restSkipText}>SKIP REST</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.restSettingsButton} onPress={() => setShowRestSettings(!showRestSettings)}>
                            <Text style={styles.restSettingsText}>⚙️ {restDuration}s</Text>
                        </TouchableOpacity>
                    </View>

                    {showRestSettings && (
                        <View style={styles.restPresetsContainer}>
                            {REST_PRESETS.map(preset => (
                                <TouchableOpacity
                                    key={preset}
                                    style={[styles.restPresetButton, restDuration === preset && styles.restPresetActive]}
                                    onPress={() => { setRestDuration(preset); setRestRemaining(preset); }}
                                >
                                    <Text style={[styles.restPresetText, restDuration === preset && styles.restPresetTextActive]}>
                                        {preset < 60 ? `${preset}s` : `${preset / 60}m`}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}
                </SafeAreaView>
            </View>
        );
    }

    // RENDER: Active set logging
    return (
        <View style={styles.container}>
            <LinearGradient colors={[colors.bgPrimary, '#0D1117', colors.bgPrimary]} style={StyleSheet.absoluteFill} />

            {/* PR Celebration */}
            {showPRCelebration && (
                <Animated.View style={[styles.prOverlay, { opacity: prGlow }]} pointerEvents="none">
                    <LinearGradient colors={['#FFD70060', '#FF8C0030', 'transparent']} style={StyleSheet.absoluteFill} />
                    <Animated.View style={[styles.prBadge, { transform: [{ scale: prScale }] }]}>
                        <Text style={styles.prEmoji}>🏆</Text>
                        <Text style={styles.prText}>{prMessage}</Text>
                    </Animated.View>
                </Animated.View>
            )}

            <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.activeContent}>
                    {/* Header */}
                    <View style={styles.activeHeader}>
                        <View>
                            <Text style={styles.activeProgress}>
                                Exercise {currentExerciseIndex + 1}/{currentWorkout?.exercises.length}
                                {sessionPRs.length > 0 && ` • ${sessionPRs.length} PR${sessionPRs.length > 1 ? 's' : ''} 🔥`}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    if (exercise?.name) {
                                        setSelectedExercise(exercise.name);
                                        setShowExerciseInfo(true);
                                    }
                                }}
                                style={styles.exerciseNameRow}
                            >
                                <Text style={styles.activeExerciseName}>{exercise?.name}</Text>
                                <Text style={styles.exerciseInfoHint}>ⓘ</Text>
                            </TouchableOpacity>
                        </View>
                        <TouchableOpacity style={styles.endButton} onPress={handleEndWorkout}>
                            <Text style={styles.endButtonText}>End</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Set Progress */}
                    <View style={styles.setProgress}>
                        {sets.map((set, i) => (
                            <View
                                key={i}
                                style={[
                                    styles.setDot,
                                    set.completed && styles.setDotComplete,
                                    set.isPR && styles.setDotPR,
                                    i === currentSetIndex && !set.completed && styles.setDotCurrent,
                                ]}
                            >
                                <Text style={[
                                    styles.setDotText,
                                    set.completed && styles.setDotTextComplete,
                                    i === currentSetIndex && !set.completed && styles.setDotTextCurrent,
                                ]}>
                                    {set.completed ? '✓' : i + 1}
                                </Text>
                            </View>
                        ))}
                        <TouchableOpacity style={styles.addSetButton} onPress={handleAddSet}>
                            <Text style={styles.addSetText}>+</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Current Set Card */}
                    <View style={styles.setCard}>
                        <LinearGradient colors={[colors.bgCard, colors.bgSecondary]} style={styles.setCardGradient}>
                            <Text style={styles.setCardTitle}>SET {currentSetIndex + 1}</Text>

                            {/* Weight */}
                            <Text style={styles.inputLabel}>WEIGHT (LBS)</Text>
                            <TextInput
                                style={styles.weightInputFull}
                                value={currentWeight}
                                onChangeText={setCurrentWeight}
                                keyboardType="decimal-pad"
                                placeholder="Enter weight"
                                placeholderTextColor={colors.textMuted}
                            />

                            {/* Reps */}
                            <Text style={styles.inputLabel}>REPS</Text>
                            <View style={styles.repsRow}>
                                {[1, 3, 5, 8, 10, 12].map(rep => (
                                    <TouchableOpacity
                                        key={rep}
                                        style={[styles.repButton, currentReps === String(rep) && styles.repButtonActive]}
                                        onPress={() => setCurrentReps(String(rep))}
                                    >
                                        <Text style={[styles.repText, currentReps === String(rep) && styles.repTextActive]}>{rep}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                            <TextInput
                                style={styles.repInput}
                                value={currentReps}
                                onChangeText={setCurrentReps}
                                keyboardType="number-pad"
                                placeholder="Or type reps..."
                                placeholderTextColor={colors.textMuted}
                            />

                            {/* Complete Button */}
                            <TouchableOpacity
                                onPress={handleCompleteSet}
                                disabled={!currentWeight || !currentReps}
                                activeOpacity={0.9}
                            >
                                <LinearGradient
                                    colors={currentWeight && currentReps
                                        ? [colors.accentPrimary, colors.accentSecondary]
                                        : [colors.textMuted, colors.textMuted]}
                                    start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                                    style={styles.completeButton}
                                >
                                    <Text style={styles.completeButtonText}>
                                        {currentSetIndex + 1 < sets.length ? 'COMPLETE SET → REST' : 'FINISH EXERCISE'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </LinearGradient>
                    </View>

                    {/* Completed Sets Log */}
                    {completedSetsCount > 0 && (
                        <View style={styles.setsLog}>
                            <Text style={styles.setsLogTitle}>COMPLETED SETS</Text>
                            {sets.filter(s => s.completed).map((set, i) => (
                                <View key={i} style={[styles.setLogItem, set.isPR && styles.setLogItemPR]}>
                                    <Text style={styles.setLogNum}>Set {i + 1}</Text>
                                    <Text style={styles.setLogWeight}>{set.weight} × {set.reps}</Text>
                                    {set.isPR && <Text style={styles.setLogPR}>🏆 PR</Text>}
                                </View>
                            ))}
                        </View>
                    )}

                    {/* Rest Settings */}
                    <TouchableOpacity style={styles.restSettingsRow} onPress={() => setShowRestSettings(!showRestSettings)}>
                        <Text style={styles.restSettingsLabel}>Rest Timer: {restDuration}s</Text>
                        <Text style={styles.restSettingsIcon}>⚙️</Text>
                    </TouchableOpacity>

                    {showRestSettings && (
                        <View style={styles.restPresets}>
                            {REST_PRESETS.map(preset => (
                                <TouchableOpacity
                                    key={preset}
                                    style={[styles.restPresetButton, restDuration === preset && styles.restPresetActive]}
                                    onPress={() => setRestDuration(preset)}
                                >
                                    <Text style={[styles.restPresetText, restDuration === preset && styles.restPresetTextActive]}>
                                        {preset < 60 ? `${preset}s` : `${Math.floor(preset / 60)}:${(preset % 60).toString().padStart(2, '0')}`}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    )}

                    {/* Skip to next exercise */}
                    {currentExerciseIndex < (currentWorkout?.exercises.length || 0) - 1 && (
                        <TouchableOpacity style={styles.skipExercise} onPress={moveToNextExercise}>
                            <Text style={styles.skipExerciseText}>Skip to next exercise →</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            </SafeAreaView>

            {/* Exercise Info Modal */}
            <ExerciseInfoModal
                visible={showExerciseInfo}
                exerciseName={selectedExercise}
                onClose={() => setShowExerciseInfo(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.bgPrimary },
    safeArea: { flex: 1 },
    content: { padding: spacing.lg, paddingBottom: spacing.xxl },
    activeContent: { padding: spacing.lg, paddingBottom: 100 },
    header: { marginBottom: spacing.xl },
    headerLabel: { fontSize: typography.sizes.xs, fontWeight: '700', color: colors.accentPrimary, letterSpacing: 2 },
    headerTitle: { fontSize: typography.sizes.xxl, fontWeight: '700', color: colors.textPrimary, marginTop: spacing.xs },
    headerSub: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginTop: spacing.sm },
    typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.xl },
    typeCard: { width: (width - spacing.lg * 2 - spacing.sm * 2) / 3 - 1, borderRadius: borderRadius.md, overflow: 'hidden', borderWidth: 1, borderColor: colors.glassBorder },
    typeCardActive: { borderColor: colors.accentPrimary },
    typeCardGradient: { padding: spacing.md, alignItems: 'center', minHeight: 90, justifyContent: 'center' },
    typeIcon: { fontSize: 28, marginBottom: spacing.xs },
    typeLabel: { fontSize: typography.sizes.xs, fontWeight: '700', color: colors.textSecondary, letterSpacing: 1 },
    loader: { marginTop: spacing.sm },
    backButton: { marginBottom: spacing.md },
    backButtonText: { fontSize: typography.sizes.md, color: colors.accentPrimary, fontWeight: '600' },
    workoutTitle: { fontSize: typography.sizes.xxl, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
    workoutMeta: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginBottom: spacing.xl },
    exerciseList: { gap: spacing.sm, marginBottom: spacing.xl },
    exercisePreview: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: borderRadius.md, padding: spacing.md },
    exercisePreviewNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: colors.accentPrimary + '20', textAlign: 'center', lineHeight: 28, color: colors.accentPrimary, fontWeight: '700', marginRight: spacing.md },
    exercisePreviewContent: { flex: 1 },
    exercisePreviewName: { fontSize: typography.sizes.md, fontWeight: '600', color: colors.textPrimary },
    exercisePreviewDetail: { fontSize: typography.sizes.sm, color: colors.textSecondary },
    startButton: { paddingVertical: spacing.lg, borderRadius: borderRadius.lg, alignItems: 'center' },
    startButtonText: { fontSize: typography.sizes.md, fontWeight: '700', color: colors.bgPrimary, letterSpacing: 2 },
    // Active workout
    activeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.lg },
    activeProgress: { fontSize: typography.sizes.xs, fontWeight: '700', color: colors.accentPrimary, letterSpacing: 2 },
    activeExerciseName: { fontSize: typography.sizes.xl, fontWeight: '700', color: colors.textPrimary },
    exerciseNameRow: { flexDirection: 'row', alignItems: 'center', marginTop: spacing.xs },
    exerciseInfoHint: { fontSize: 22, color: colors.accentPrimary, marginLeft: spacing.md, backgroundColor: colors.accentPrimary + '20', width: 30, height: 30, borderRadius: 15, textAlign: 'center', lineHeight: 30 },
    endButton: { backgroundColor: colors.accentDanger + '20', paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.accentDanger },
    endButtonText: { fontSize: typography.sizes.sm, fontWeight: '700', color: colors.accentDanger },
    // Set progress
    setProgress: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, gap: spacing.sm },
    setDot: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.bgCard, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.glassBorder },
    setDotComplete: { backgroundColor: colors.accentSuccess, borderColor: colors.accentSuccess },
    setDotPR: { backgroundColor: '#FFD700', borderColor: '#FFD700' },
    setDotCurrent: { borderColor: colors.accentPrimary, borderWidth: 2 },
    setDotText: { fontSize: typography.sizes.sm, fontWeight: '700', color: colors.textMuted },
    setDotTextComplete: { color: colors.bgPrimary },
    setDotTextCurrent: { color: colors.accentPrimary },
    addSetButton: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: colors.glassBorder, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
    addSetText: { fontSize: typography.sizes.lg, color: colors.textMuted },
    // Set card
    setCard: { borderRadius: borderRadius.xl, overflow: 'hidden', marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.glassBorder },
    setCardGradient: { padding: spacing.xl },
    setCardTitle: { fontSize: typography.sizes.xs, fontWeight: '700', color: colors.textMuted, letterSpacing: 2, marginBottom: spacing.lg, textAlign: 'center' },
    inputLabel: { fontSize: typography.sizes.xs, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.5, marginBottom: spacing.sm },
    weightRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
    adjustButton: { backgroundColor: colors.bgSecondary, paddingHorizontal: spacing.md, paddingVertical: spacing.md, borderRadius: borderRadius.md, borderWidth: 1, borderColor: colors.glassBorder },
    adjustText: { fontSize: typography.sizes.sm, fontWeight: '700', color: colors.accentPrimary },
    weightInput: { flex: 1, fontSize: typography.sizes.xxl, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', backgroundColor: colors.bgSecondary, borderRadius: borderRadius.md, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.glassBorder },
    weightInputFull: { fontSize: typography.sizes.xxl, fontWeight: '700', color: colors.textPrimary, textAlign: 'center', backgroundColor: colors.bgSecondary, borderRadius: borderRadius.md, paddingVertical: spacing.lg, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.glassBorder },
    repsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md, flexWrap: 'wrap' },
    repButton: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: borderRadius.md, backgroundColor: colors.bgSecondary, borderWidth: 1, borderColor: colors.glassBorder },
    repButtonActive: { backgroundColor: colors.accentPrimary, borderColor: colors.accentPrimary },
    repText: { fontSize: typography.sizes.md, fontWeight: '700', color: colors.textSecondary },
    repTextActive: { color: colors.bgPrimary },
    repInput: { fontSize: typography.sizes.lg, color: colors.textPrimary, textAlign: 'center', backgroundColor: colors.bgSecondary, borderRadius: borderRadius.md, paddingVertical: spacing.md, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.glassBorder },
    completeButton: { paddingVertical: spacing.lg, borderRadius: borderRadius.lg, alignItems: 'center' },
    completeButtonText: { fontSize: typography.sizes.md, fontWeight: '700', color: colors.bgPrimary, letterSpacing: 1 },
    // Completed sets log
    setsLog: { backgroundColor: colors.bgCard, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.lg },
    setsLogTitle: { fontSize: typography.sizes.xs, fontWeight: '700', color: colors.textMuted, letterSpacing: 1.5, marginBottom: spacing.sm },
    setLogItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.glassBorder },
    setLogItemPR: { backgroundColor: '#FFD70010' },
    setLogNum: { fontSize: typography.sizes.sm, color: colors.textSecondary, width: 50 },
    setLogWeight: { flex: 1, fontSize: typography.sizes.md, fontWeight: '600', color: colors.textPrimary },
    setLogPR: { fontSize: typography.sizes.sm, color: '#FFD700', fontWeight: '700' },
    // Rest settings
    restSettingsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm },
    restSettingsLabel: { fontSize: typography.sizes.sm, color: colors.textSecondary },
    restSettingsIcon: { fontSize: 18 },
    restPresets: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg, flexWrap: 'wrap' },
    restPresetsContainer: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xl, flexWrap: 'wrap', justifyContent: 'center' },
    restPresetButton: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: borderRadius.full, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.glassBorder },
    restPresetActive: { backgroundColor: colors.accentPrimary, borderColor: colors.accentPrimary },
    restPresetText: { fontSize: typography.sizes.sm, color: colors.textSecondary, fontWeight: '600' },
    restPresetTextActive: { color: colors.bgPrimary },
    skipExercise: { alignItems: 'center', paddingVertical: spacing.md },
    skipExerciseText: { fontSize: typography.sizes.sm, color: colors.textMuted },
    // Rest timer screen
    restContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
    restLabel: { fontSize: typography.sizes.xs, fontWeight: '700', color: colors.accentPrimary, letterSpacing: 4, marginBottom: spacing.md },
    restTimer: { fontSize: 72, fontWeight: '900', color: colors.textPrimary, marginBottom: spacing.xl },
    restProgressContainer: { width: width - spacing.xl * 2, height: 8, backgroundColor: colors.bgCard, borderRadius: 4, overflow: 'hidden', marginBottom: spacing.lg },
    restProgressFill: { height: 8, backgroundColor: colors.accentPrimary, borderRadius: 4 },
    restNextUp: { fontSize: typography.sizes.md, color: colors.textSecondary, marginBottom: spacing.xl },
    restActions: { flexDirection: 'row', gap: spacing.md },
    restSkipButton: { backgroundColor: colors.accentPrimary, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.lg },
    restSkipText: { fontSize: typography.sizes.md, fontWeight: '700', color: colors.bgPrimary, letterSpacing: 1 },
    restSettingsButton: { backgroundColor: colors.bgCard, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderRadius: borderRadius.lg },
    restSettingsText: { fontSize: typography.sizes.md, color: colors.textSecondary },
    // PR overlay
    prOverlay: { ...StyleSheet.absoluteFillObject, zIndex: 1000, alignItems: 'center', justifyContent: 'center' },
    prBadge: { backgroundColor: '#FFD700', paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, borderRadius: borderRadius.xl, alignItems: 'center', shadowColor: '#FFD700', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 10 },
    prEmoji: { fontSize: 48, marginBottom: spacing.sm },
    prText: { fontSize: typography.sizes.lg, fontWeight: '900', color: '#000', textAlign: 'center' },
    // Quick stats row
    quickStatsRow: { flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: borderRadius.lg, padding: spacing.md, marginBottom: spacing.xl, alignItems: 'center', justifyContent: 'space-around', borderWidth: 1, borderColor: colors.glassBorder },
    quickStat: { alignItems: 'center' },
    quickStatValue: { fontSize: typography.sizes.md, fontWeight: '700', color: colors.textPrimary },
    quickStatLabel: { fontSize: 10, color: colors.textMuted, marginTop: spacing.xs },
    quickStatDivider: { width: 1, height: 30, backgroundColor: colors.glassBorder },
    // Section titles
    sectionTitle: { fontSize: typography.sizes.xs, fontWeight: '700', color: colors.textMuted, letterSpacing: 2, marginBottom: spacing.md, marginTop: spacing.sm },
    // Carousel
    carouselContainer: { paddingRight: spacing.lg, gap: spacing.md },
    carouselCard: { width: width * 0.75, borderRadius: borderRadius.xl, overflow: 'hidden', borderWidth: 2, borderColor: colors.glassBorder },
    carouselCardGradient: { padding: spacing.xl, alignItems: 'center', minHeight: 200 },
    carouselIconContainer: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
    carouselIcon: { fontSize: 32 },
    carouselLabel: { fontSize: typography.sizes.lg, fontWeight: '700', color: colors.textPrimary, marginBottom: spacing.xs },
    carouselDescription: { fontSize: typography.sizes.sm, color: colors.textSecondary, marginBottom: spacing.lg, textAlign: 'center' },
    carouselLoader: { marginTop: spacing.sm },
    carouselStartButton: { paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderRadius: borderRadius.full },
    carouselStartText: { fontSize: typography.sizes.sm, fontWeight: '700', color: colors.bgPrimary, letterSpacing: 1 },
    // Recent workouts
    recentWorkoutCard: { flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: borderRadius.md, padding: spacing.md, marginBottom: spacing.sm, alignItems: 'center', borderWidth: 1, borderColor: colors.glassBorder },
    recentWorkoutInfo: { flex: 1 },
    recentWorkoutTitle: { fontSize: typography.sizes.md, fontWeight: '600', color: colors.textPrimary },
    recentWorkoutMeta: { fontSize: typography.sizes.xs, color: colors.textMuted, marginTop: spacing.xs },
    recentWorkoutStats: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
    recentWorkoutPR: { fontSize: typography.sizes.sm, fontWeight: '700', color: '#FFD700' },
    recentWorkoutSignal: { fontSize: typography.sizes.sm, fontWeight: '700', color: colors.accentPrimary },
});
