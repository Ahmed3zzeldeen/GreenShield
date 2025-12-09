import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image
} from 'react-native';
// 1. Use correct SafeAreaView
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <CustomHeader title="Home" subtitle="Hello, Farmer" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Main Content Container */}
        <View style={styles.mainCard}>
          <Text style={styles.sectionTitle}>My Fields</Text>

          {/* Status Cards Row */}
          <View style={styles.statusRow}>
            {/* Healthy Card */}
            <TouchableOpacity style={[styles.statusCard, styles.cardHealthy]}>
              <View style={styles.statusIconRow}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#387C3C" />
                <Text style={[styles.statusCount, styles.textHealthy]}>7</Text>
              </View>
              <Text style={styles.statusLabel}>Healthy</Text>
            </TouchableOpacity>

            {/* Needs Attention Card */}
            <TouchableOpacity style={[styles.statusCard, styles.cardWarning]}>
              <View style={styles.statusIconRow}>
                <Ionicons name="warning-outline" size={20} color="#D88D28" />
                <Text style={[styles.statusCount, styles.textWarning]}>2</Text>
              </View>
              <Text style={styles.statusLabel}>Needs Attention</Text>
            </TouchableOpacity>
          </View>

          {/* Overall Health Bar */}
          <View style={styles.healthCard}>
            <View style={styles.healthHeader}>
              <Text style={styles.healthTitle}>Overall Health</Text>
              <Text style={styles.healthPercentage}>78%</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: '78%' }]} />
            </View>
          </View>

          {/* Show All Scans Button */}
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionButtonText}>Show all scans</Text>
            <Ionicons name="arrow-forward" size={18} color="#000" />
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F0',
  },
  scrollContent: {
    paddingBottom: 120, // Increased padding to ensure Tab Bar doesn't cover content
  },
  mainCard: {
    backgroundColor: '#fff',
    marginTop: 10,
    marginHorizontal: 15,
    borderRadius: 20,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    marginBottom: 15,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statusCard: {
    width: '48%',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardHealthy: {
    backgroundColor: '#E9F2EA', 
  },
  cardWarning: {
    backgroundColor: '#FEF3E2', 
  },
  statusIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  statusCount: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  textHealthy: {
    color: '#3E5936',
  },
  textWarning: {
    color: '#D88D28',
  },
  statusLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  healthCard: {
    backgroundColor: '#EFEDE8',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  healthTitle: {
    fontSize: 15,
    color: '#444',
  },
  healthPercentage: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#3E5936',
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: '#DCDCDC',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#527346', 
    borderRadius: 4,
  },
  actionButton: {
    backgroundColor: '#EFEDE8',
    borderRadius: 12,
    paddingVertical: 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    color: '#000',
    marginRight: 8,
  },
});