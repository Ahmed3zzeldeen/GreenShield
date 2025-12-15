import React, { useEffect } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from "expo-router";
import * as NavigationBar from 'expo-navigation-bar';
import { Platform, View, ActivityIndicator } from 'react-native';
import * as Updates from 'expo-updates';

// 1. Import the Auth Provider
import { AuthProvider, useAuth } from './context/AuthContext'; 

// 2. Create a component to handle the Navigation Logic (Consumer)
function RootLayoutNav() {
  // Cast to any to avoid "Property does not exist on type 'never'" error
  const authContext = useAuth() as any;
  const userToken = authContext?.userToken;
  const isLoading = authContext?.isLoading ?? true; 
  
  const segments = useSegments();
  const router = useRouter();
  const navigationState = useRootNavigationState();

  // Handle Authentication Redirects
  useEffect(() => {
    if (isLoading || !navigationState?.key) return;

    const inTabsGroup = segments[0] === '(tabs)';

    console.log('Auth Check:', { 
      token: userToken ? 'Present' : 'Missing', 
      inTabs: inTabsGroup, 
      segments: segments 
    });

    if (!userToken && inTabsGroup) {
      // 3. LOGOUT HANDLING: Token is gone, but we are inside the app.
      console.log('Token lost. Redirecting to Login...');
      
      // FIX: Instead of crashing with reloadAsync, properly reset navigation
      if (router.canDismiss()) {
        router.dismissAll(); // Clear stack history
      }
      router.replace('/'); // Navigate to Login'
      console.log("cnc")
      
    } else if (userToken && !inTabsGroup) {
      // Logged in, not in tabs -> Redirect to Home
      console.log('Token found. Auto-login to Home...');
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
    <Stack 
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="RegisterScreen" />
      <Stack.Screen name="OTPScreen" />
      <Stack.Screen name="ForgotPasswordScreen" />
      <Stack.Screen name="ResetPasswordScreen" />
      <Stack.Screen name="(tabs)" options={{ gestureEnabled: false }} />
    </Stack>
  );
}

// 4. Export the Root Layout wrapped in the Provider
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