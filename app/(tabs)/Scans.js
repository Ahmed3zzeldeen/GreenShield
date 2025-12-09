import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
// Use the relative path to avoid import errors
import CustomHeader from '../../components/CustomHeader';

// REPLACE WITH YOUR ACTUAL API ENDPOINT
const API_URL = 'https://your-project.vercel.app/api/scans';

// Mock Data (matches your design)
const MOCK_SCAN_DATA = [
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
  {
    id: '3',
    title: 'Corn 1-5-2024',
    response: 'Common Rust',
    confRate: '93.4%',
    status: 'danger',
    image: 'https://via.placeholder.com/150/D88D28/FFFFFF?text=Rust',
  },
  {
    id: '4',
    title: 'Corn 5-7-2023',
    response: 'Blight',
    confRate: '90.9%',
    status: 'danger',
    image: 'https://via.placeholder.com/150/D88D28/FFFFFF?text=Blight',
  },
];

export default function ScansScreen() {
  const [scans, setScans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Function to fetch data from Backend
  const fetchScans = async () => {
    try {
      // --- UNCOMMENT THIS BLOCK TO CONNECT TO REAL BACKEND ---
      /*
      const response = await fetch(API_URL);
      const data = await response.json();
      if (response.ok) {
        setScans(data); // Assuming data is an array of scans
      } else {
        console.error('Failed to fetch scans');
      }
      */
      
      // --- REMOVE THIS BLOCK WHEN CONNECTING TO REAL BACKEND ---
      // This simulates a network call delay using Mock Data
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      setScans(MOCK_SCAN_DATA); 
      // --------------------------------------------------------

    } catch (error) {
      console.error('Error fetching scans:', error);
      // Optional: Alert.alert("Error", "Could not fetch scans");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Initial Fetch
  useEffect(() => {
    fetchScans();
  }, []);

  // Pull-to-refresh handler
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchScans();
  }, []);

  const renderScanItem = ({ item }) => {
    const cardBackgroundColor = item.status === 'healthy' ? '#E9F2EA' : '#FFC1C1';
    
    return (
      <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
        <Image 
          source={{ uri: item.image }} 
          style={styles.cardImage} 
          resizeMode="cover"
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.cardText}>
            Response  <Text style={styles.cardValue}>{item.response}</Text>
          </Text>
          <Text style={styles.cardText}>
            Conf. rate  <Text style={styles.cardValue}>{item.confRate}</Text>
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Scans" />

      <View style={styles.contentContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3E5936" />
            <Text style={styles.loadingText}>Loading your scans...</Text>
          </View>
        ) : (
          <FlatList
            data={scans}
            renderItem={renderScanItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3E5936" />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No scans found.</Text>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F0', 
  },
  contentContainer: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 10,
    marginHorizontal: 15,
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 80, 
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  listContent: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 12,
    marginBottom: 15,
    alignItems: 'center',
  },
  cardImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#ccc',
    marginRight: 15,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 4,
  },
  cardTitle: {
    fontSize: 15,
    color: '#000',
    marginBottom: 2,
    fontWeight: '400',
  },
  cardText: {
    fontSize: 14,
    color: '#1a1a1a',
  },
  cardValue: {
    fontWeight: '500',
    color: '#000',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#999',
    fontSize: 16,
  }
});