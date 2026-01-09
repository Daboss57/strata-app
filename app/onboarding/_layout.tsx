import { Stack } from 'expo-router';
import { colors } from '../../src/config/theme';

export default function OnboardingLayout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bgPrimary },
                animation: 'slide_from_right',
            }}
        />
    );
}
