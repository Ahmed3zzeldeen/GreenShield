import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CustomHeader = ({ title, subtitle, userName }) => {
  // Logic:
  // 1. If a specific 'subtitle' is passed, use that (e.g., for non-greeting pages).
  // 2. If 'userName' is passed (even as null), format it as a greeting.
  // 3. Default the name to 'Farmer' if userName is falsey (null, undefined, empty).
  
  let displayText = subtitle;

  if (!displayText && userName !== undefined) {
    displayText = `Hello, ${userName || 'Farmer'}`;
  }

  return (
    <View style={styles.headerContainer}>
      <SafeAreaView edges={['top']} style={styles.safeArea}>
        <View style={styles.content}>
          <Text style={styles.headerTitle}>{title}</Text>
          {displayText && <Text style={styles.headerSubtitle}>{displayText}</Text>}
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  safeArea: {
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
});

export default CustomHeader;