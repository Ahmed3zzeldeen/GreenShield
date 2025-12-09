import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const CustomTabBar = ({ state, descriptors, navigation }) => {
  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // --- ICON CONFIGURATION ---
          let IconComponent = Ionicons;
          let iconName = 'home-outline';
          let label = 'Home';

          // Robust check for route names (handles case sensitivity)
          const routeName = route.name.toLowerCase();

          if (routeName === 'index') {
            iconName = 'home-outline';
            label = 'Home';
          } else if (routeName === 'scans') {
            iconName = 'scan-outline';
            label = 'Scans';
          } else if (routeName === 'camera') {
            // Floating Camera Button
            return (
              <View key={index} style={styles.cameraButtonContainer}>
                <TouchableOpacity onPress={onPress} style={styles.cameraButton}>
                  <Ionicons name="camera-outline" size={32} color="#fff" />
                </TouchableOpacity>
              </View>
            );
          } else if (routeName === 'treatment') {
            IconComponent = MaterialCommunityIcons;
            iconName = 'pill'; 
            label = 'Treatment';
          } else if (routeName === 'profile') {
            iconName = 'person-outline';
            label = 'Profile';
          }

          const color = isFocused ? '#3E5936' : '#999';

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={styles.tabItem}
            >
              <IconComponent name={iconName} size={24} color={color} />
              <Text style={[styles.tabLabel, { color }]}>{label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // CRITICAL FIX: Ensure tab bar is above page content
    zIndex: 100, 
    elevation: 5, 
    backgroundColor: 'transparent', 
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: '#F7F7F7',
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 25 : 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 4,
    fontWeight: '500',
  },
  cameraButtonContainer: {
    top: -30,
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    zIndex: 101, // Higher than container
  },
  cameraButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#3E5936',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3E5936',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});

export default CustomTabBar;