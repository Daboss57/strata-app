import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../src/config/theme';
import { OnboardingProvider } from '../src/context/OnboardingContext';
import { WorkoutProvider } from '../src/context/WorkoutContext';

export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <OnboardingProvider>
                <WorkoutProvider>
                    <StatusBar style="light" />
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: colors.bgPrimary },
                            animation: 'fade',
                        }}
                    />
                </WorkoutProvider>
            </OnboardingProvider>
        </SafeAreaProvider>
    );
}
