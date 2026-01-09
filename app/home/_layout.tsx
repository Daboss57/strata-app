import { Tabs } from 'expo-router';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing } from '../../src/config/theme';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
    const icons: Record<string, string> = {
        home: '📊',
        workout: '🏋️',
        achievements: '🏆',
        analytics: '📈',
        profile: '👤',
    };

    return (
        <View style={styles.tabIconContainer}>
            <Text style={[styles.tabIcon, focused && styles.tabIconActive]}>
                {icons[name]}
            </Text>
            {focused && <View style={styles.tabIndicator} />}
        </View>
    );
}

export default function HomeLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarStyle: styles.tabBar,
                tabBarActiveTintColor: colors.accentPrimary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarLabelStyle: styles.tabLabel,
            }}
        >
            <Tabs.Screen
                name="index"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="workout"
                options={{
                    title: 'Workout',
                    tabBarIcon: ({ focused }) => <TabIcon name="workout" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="achievements"
                options={{
                    title: 'Badges',
                    tabBarIcon: ({ focused }) => <TabIcon name="achievements" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="analytics"
                options={{
                    title: 'Analytics',
                    tabBarIcon: ({ focused }) => <TabIcon name="analytics" focused={focused} />,
                }}
            />
            <Tabs.Screen
                name="profile"
                options={{
                    title: 'Profile',
                    tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} />,
                }}
            />
            {/* Hidden screens */}
            <Tabs.Screen
                name="calculator"
                options={{
                    href: null, // Hide from tab bar but keep accessible
                }}
            />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    tabBar: {
        backgroundColor: colors.bgSecondary,
        borderTopWidth: 1,
        borderTopColor: colors.glassBorder,
        height: 80,
        paddingTop: spacing.sm,
        paddingBottom: spacing.lg,
    },
    tabLabel: {
        fontSize: 10,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
    tabIconContainer: {
        alignItems: 'center',
    },
    tabIcon: {
        fontSize: 24,
        opacity: 0.6,
    },
    tabIconActive: {
        opacity: 1,
    },
    tabIndicator: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.accentPrimary,
        marginTop: 4,
    },
});
