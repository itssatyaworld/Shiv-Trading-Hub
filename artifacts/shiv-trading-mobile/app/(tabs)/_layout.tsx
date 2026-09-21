import React from 'react';
import { Platform, StyleSheet, useColorScheme, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';

function Icon({
  name,
  color,
}: {
  name: React.ComponentProps<typeof Ionicons>['name'];
  color: React.ComponentProps<typeof Ionicons>['color'];
}) {
  return <Ionicons name={name} size={22} color={color} />;
}

export default function TabLayout() {
  const colors = useColors();
  const scheme = useColorScheme();
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: { fontFamily: 'Inter_600SemiBold', fontSize: 10 },
        tabBarStyle: {
          height: isWeb ? 84 : 74,
          paddingTop: 8,
          paddingBottom: isWeb ? 28 : 10,
          backgroundColor: isIOS ? 'transparent' : colors.card,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: colors.border,
          elevation: 0,
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={90}
              tint={scheme === 'dark' ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.card },
              ]}
            />
          ),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Icon name="home-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          title: 'Products',
          tabBarIcon: ({ color }) => <Icon name="grid-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="enquiry"
        options={{
          title: 'Enquiry',
          tabBarIcon: ({ color }) => (
            <Icon name="clipboard-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => (
            <Icon name="receipt-outline" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Icon name="person-outline" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}