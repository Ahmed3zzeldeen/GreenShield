import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
// Import config to get the correct URL (Update path if needed)
import { API_URLS } from '../_config';

export default function ProfileScreen() {
  const router = useRouter(); 
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  const fetchProfileData = async () => {
    try {
      // --- CONNECT TO BACKEND ---
      // const response = await fetch(API_URLS.PROFILE);
      // const data = await response.json();
      // setProfileData(data);

      // --- MOCK DATA FOR DEMO ---
      await new Promise(resolve => setTimeout(resolve, 1000)); 
      setProfileData({
        user: {
          name: '3m abdo',
          role: 'farmer',
          image: 'https://i.pravatar.cc/150?img=11', 
          location: 'Fayoum, Egypt',
          farmName: 'Green Oasis Farm',
          contact: '+201120966035',
        },
        stats: {
          healthy: 7,
          attention: 2,
          healthPercentage: 78,
        },
        recentScans: [
          {
            id: '1',
            title: 'Corn 11-05-2025',
            response: 'Healthy',
            confRate: '95.2%',
            status: 'healthy',
            image: 'https://via.placeholder.com/150/527346/FFFFFF?text=Corn',
          },
          {
            id: '2',
            title: 'Corn 19-02-2025',
            response: 'Gray Spot',
            confRate: '95.2%',
            status: 'danger',
            image: 'https://via.placeholder.com/150/D88D28/FFFFFF?text=Spot',
          },
        ]
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- LOGOUT LOGIC ---
  const handleLogout = async () => {
    Alert.alert(
      "Log Out",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Log Out", 
          style: "destructive", 
          onPress: async () => {
            try {
              console.log('Logging out...');
              
              // 1. Remove Token
              await AsyncStorage.removeItem('userToken');
              
              // 2. Clear Navigation Stack (Critical for fixing loops)
              if (router.canDismiss()) {
                router.dismissAll();
              }

              // 3. Force navigate to the index route
              // Using '/index' instead of '/' helps be specific if '/' is ambiguous
              router.replace('/'); 
              
            } catch (error) {
              console.error('Error logging out:', error);
            }
          }
        }
      ]
    );
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3E5936" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity>
          <Text style={styles.editButton}>Edit profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* User Card */}
        <View style={styles.userCard}>
          <Image 
            source={{ uri: profileData.user.image }} 
            style={styles.profileImage} 
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{profileData.user.name}</Text>
            <Text style={styles.userRole}>{profileData.user.role}</Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{profileData.user.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Farm name</Text>
            <Text style={styles.detailValue}>{profileData.user.farmName}</Text>
          </View>
          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.detailLabel}>Contact</Text>
            <Text style={styles.detailValue}>{profileData.user.contact}</Text>
          </View>
        </View>

        {/* My Fields Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>My Fields</Text>
          
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#E9F2EA' }]}>
              <View style={styles.statHeader}>
                <Ionicons name="checkmark-circle-outline" size={20} color="#3E5936" />
                <Text style={[styles.statNumber, { color: '#3E5936' }]}>
                  {profileData.stats.healthy}
                </Text>
              </View>
              <Text style={styles.statLabel}>Healthy</Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: '#FEF3E2' }]}>
              <View style={styles.statHeader}>
                <Ionicons name="warning-outline" size={20} color="#D88D28" />
                <Text style={[styles.statNumber, { color: '#D88D28' }]}>
                  {profileData.stats.attention}
                </Text>
              </View>
              <Text style={styles.statLabel}>Needs Attention</Text>
            </View>
          </View>

          {/* Health Bar */}
          <View style={styles.healthBarContainer}>
            <View style={styles.healthBarHeader}>
              <Text style={styles.healthLabel}>Overall Health</Text>
              <Text style={styles.healthPercent}>{profileData.stats.healthPercentage}%</Text>
            </View>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${profileData.stats.healthPercentage}%` }]} />
            </View>
          </View>

          <TouchableOpacity style={styles.showAllButton}>
            <Text style={styles.showAllText}>Show all scans</Text>
            <Ionicons name="arrow-forward" size={16} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Recent Scans Section */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>Recent Scans</Text>
          {profileData.recentScans.map((scan) => (
            <View 
              key={scan.id} 
              style={[
                styles.scanCard, 
                { backgroundColor: scan.status === 'healthy' ? '#E9F2EA' : '#FFC1C1' }
              ]}
            >
              <Image source={{ uri: scan.image }} style={styles.scanImage} />
              <View style={styles.scanContent}>
                <Text style={styles.scanTitle}>{scan.title}</Text>
                <Text style={styles.scanText}>
                  Response <Text style={styles.scanValue}>{scan.response}</Text>
                </Text>
                <Text style={styles.scanText}>
                  Conf. rate <Text style={styles.scanValue}>{scan.confRate}</Text>
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* LOGOUT BUTTON */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#D32F2F" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F5F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  editButton: {
    fontSize: 16,
    color: '#3E5936',
    fontWeight: 'bold',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 15,
    padding: 20,
    borderRadius: 20,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 20,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 16,
    color: '#000',
    fontWeight: '500',
  },
  detailsCard: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    width: 100,
    fontSize: 16,
    color: '#999',
    fontWeight: '600',
  },
  detailValue: {
    flex: 1,
    fontSize: 16,
    color: '#000',
    fontWeight: '700',
  },
  sectionContainer: {
    backgroundColor: '#fff',
    marginHorizontal: 15,
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  healthBarContainer: {
    backgroundColor: '#EFEDE8',
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  healthBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  healthLabel: {
    color: '#444',
  },
  healthPercent: {
    fontWeight: 'bold',
    color: '#3E5936',
  },
  track: {
    height: 8,
    backgroundColor: '#DCDCDC',
    borderRadius: 4,
  },
  fill: {
    height: '100%',
    backgroundColor: '#3E5936',
    borderRadius: 4,
  },
  showAllButton: {
    backgroundColor: '#EFEDE8',
    padding: 15,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  showAllText: {
    marginRight: 5,
    fontSize: 16,
    color: '#000',
  },
  scanCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: 'center',
  },
  scanImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#ccc',
    marginRight: 15,
  },
  scanContent: {
    flex: 1,
  },
  scanTitle: {
    fontSize: 15,
    color: '#000',
    marginBottom: 2,
  },
  scanText: {
    fontSize: 13,
    color: '#333',
  },
  scanValue: {
    fontWeight: '600',
    color: '#000',
  },
  // Logout Button Styles
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 30, // Extra margin at bottom
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  logoutText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D32F2F',
  }
});