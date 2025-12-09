import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import * as NavigationBar from 'expo-navigation-bar';
import { Platform, View, ActivityIndicator } from 'react-native';
// 1. Import the Auth Provider
import { AuthProvider, useAuth } from './context/AuthContext'; 

// 2. Create a component to handle the Navigation Logic (Consumer)
function RootLayoutNav() {
  const { userToken, isLoading } = useAuth(); // Now this will work
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  // Handle Authentication Redirects
  useEffect(() => {
    if (isLoading || !navigationState?.key) return;

    const inTabsGroup = segments[0] === '(tabs)';

    console.log('Auth State Change:', { userToken, inTabsGroup });

    if (!userToken && inTabsGroup) {
      // Not logged in, but in tabs -> Redirect to Login
      router.replace('/'); 
    } else if (userToken && !inTabsGroup) {
      // Logged in, not in tabs -> Redirect to Home
      router.replace('/(tabs)');
    }
  }, [userToken, segments, isLoading, navigationState?.key]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F5F0' }}>
        <ActivityIndicator size="large" color="#3E5936" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="RegisterScreen" />
      <Stack.Screen name="OTPScreen" />
      <Stack.Screen name="ForgotPasswordScreen" />
      <Stack.Screen name="ResetPasswordScreen" />
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
    </Stack>
  );
}

// 3. Export the Root Layout wrapped in the Provider
export default function RootLayout() {
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync("hidden").catch(() => {});
    }
  }, []);

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}