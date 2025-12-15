import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';

// Context & Config
import { useAuth } from '../context/AuthContext';
import { API_URLS } from '../_config';

export default function ProfileScreen() {
  const router = useRouter();
  const { signOut, userToken } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({ user: {}, recentScans: [] });

  const fetchProfileData = async () => {
    try {
      if (!userToken) return;

      // 1. Fetch User Info
      let userData = {};
      try {
        const response = await fetch(API_URLS.PROFILE, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `bearer ${userToken}`,
          },
        });
        
        const resData = await response.json();
        if (response.ok && resData.success) {
          userData = resData.data.user;
        }
      } catch (e) {
        console.log('Profile fetch error', e);
      }

      // 2. Fetch Recent Scans (Limit 3)
      let recentScans = [];
      try {
        // Explicitly using the history endpoint with limit=3
        const historyUrl = 'https://greenshield.up.railway.app/api/predictions/history?limit=3';
        const response = await fetch(historyUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `bearer ${userToken}`,
          },
        });
        
        const text = await response.text();
        const json = JSON.parse(text);
        
        if (response.ok && json.success) {
          recentScans = json.data?.predictions || [];
        }
      } catch (e) {
        console.log('Recent scans fetch error', e);
      }

      setProfileData({ user: userData, recentScans });

    } catch (error) {
      console.error('Failed to load profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: () => {
          signOut();
        },
      },
    ]);
  };

  useEffect(() => {
    fetchProfileData();
  }, [userToken]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3E5936" />
      </View>
    );
  }

  const { user, recentScans } = profileData;

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
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
            source={{ uri: user?.image || 'https://i.pravatar.cc/150?img=12' }}
            style={styles.profileImage}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.firstName || user?.name || 'Farmer'}</Text>
            <Text style={styles.userRole}>{user?.role || 'User'}</Text>
          </View>
        </View>

        {/* Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>{user?.location || 'Egypt'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Farm name</Text>
            <Text style={styles.detailValue}>{user?.farmName || 'N/A'}</Text>
          </View>
          <View style={[styles.detailRow, { borderBottomWidth: 0 }]}>
            <Text style={styles.detailLabel}>Contact</Text>
            <Text style={styles.detailValue}>{user?.phoneNumber || user?.contact || 'N/A'}</Text>
          </View>
        </View>

        {/* Recent Scans Section (Replaces My Fields) */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeader}>Recent Scans</Text>
            <TouchableOpacity onPress={() => router.push('/Scans')}>
              <Text style={styles.seeMoreText}>See more</Text>
            </TouchableOpacity>
          </View>
          
          {recentScans.length === 0 ? (
            <Text style={styles.emptyText}>No recent scans found.</Text>
          ) : (
            recentScans.map((item) => {
                // Map backend data to UI
                const diseaseName = item.disease?.nameEn || 'Unknown';
                const isHealthy = diseaseName.toLowerCase() === 'healthy';
                const cardBackgroundColor = isHealthy ? '#E9F2EA' : '#FFC1C1';
                const imageUrl = item.url || 'https://via.placeholder.com/150';
                const dateString = item.uploadedAt ? new Date(item.uploadedAt).toDateString() : 'Unknown Date';
                const confidence = item.confidence ? Math.round(item.confidence * 100) + '%' : 'N/A';

                return (
                    <View
                    key={item.id}
                    style={[
                        styles.scanCard,
                        { backgroundColor: cardBackgroundColor },
                    ]}
                    >
                    <Image source={{ uri: imageUrl }} style={styles.scanImage} />
                    <View style={styles.scanContent}>
                        <Text style={styles.scanTitle}>{dateString}</Text>
                        <Text style={styles.scanText}>
                        Response <Text style={styles.scanValue}>{diseaseName}</Text>
                        </Text>
                        <Text style={styles.scanText}>
                        Conf. rate <Text style={styles.scanValue}>{confidence}</Text>
                        </Text>
                    </View>
                    </View>
                );
            })
          )}
        </View>

        {/* Logout Button */}
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
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  seeMoreText: {
    fontSize: 14,
    color: '#3E5936',
    fontWeight: 'bold',
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
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 10,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 15,
    marginBottom: 30,
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
  },
});