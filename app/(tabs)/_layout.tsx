import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import * as NavigationBar from 'expo-navigation-bar';
// Ensure this path points to your CustomTabBar component
import CustomTabBar from '../../components/CustomTabBar';

export default function TabsLayout() {
  useEffect(() => {
    // Hide the Android navigation bar when inside the tabs
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync("hidden").catch(() => {});
    }
  }, []);

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false, // Hide default header (we use CustomHeader inside screens)
        lazy: true, // Only load screens when visited
      }}
    >
      {/* IMPORTANT: The 'name' prop must match your filenames in 'app/(tabs)/' EXACTLY.
        Based on your logs, these files are Capitalized (e.g. Scans.js, Camera.js).
      */}
      
      <Tabs.Screen 
        name="index" 
        options={{ title: 'Home' }} 
      />
      
      <Tabs.Screen 
        name="Scans" 
        options={{ title: 'Scans' }} 
      />
      
      <Tabs.Screen 
        name="Camera" 
        options={{ title: 'Camera' }} 
      />
      
      <Tabs.Screen 
        name="Treatment" 
        options={{ title: 'Treatment' }} 
      />
      
      <Tabs.Screen 
        name="Profile" 
        options={{ title: 'Profile' }} 
      />
    </Tabs>
  );
}