import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  ActivityIndicator, 
  RefreshControl,
  Alert
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import CustomHeader from '../../components/CustomHeader';
import { API_URLS } from '../_config';
import { useAuth } from '../context/AuthContext';

export default function ScansScreen() {
  const { userToken, signOut } = useAuth();
  const [scans, setScans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchScans = async () => {
    try {
      if (!userToken) return;
      
      const url = 'https://greenshield.up.railway.app/api/predictions/history?limit=1000';
      console.log('Fetching Scans from:', url);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `bearer ${userToken}`,
        },
      });

      const responseText = await response.text();
      let resData;
      try {
        resData = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Server returned HTML instead of JSON. Status: ${response.status}`);
      }

      // console.log('Scans Response:', JSON.stringify(resData));

      if (response.ok && resData.success) {
        // The API returns { data: { predictions: [], pagination: {} } }
        const predictionsList = resData.data?.predictions || [];
        setScans(predictionsList); 
      } else {
        console.log('Scans Fetch Failed:', resData);
        
        if (response.status === 401) {
          Alert.alert("Session Expired", "Please log in again.", [
            { text: "OK", onPress: () => signOut() }
          ]);
        }
      }
    } catch (error) {
      console.error('Error fetching scans:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchScans();
    }, [userToken])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchScans();
  };

  const renderScanItem = ({ item }) => {
    // FIX 1: The history API puts 'disease' directly on the item, not inside 'prediction'
    const diseaseName = item.disease?.nameEn || 'Unknown';
    
    // Check healthy status for color
    const isHealthy = diseaseName.toLowerCase() === 'healthy';
    const cardBackgroundColor = isHealthy ? '#E9F2EA' : '#FFC1C1';
    
    // FIX 2: The history API puts 'url' directly on the item
    const imageUrl = item.image?.url  || 'https://via.placeholder.com/150';
    
    // Date formatting (History uses 'uploadedAt')
    const rawDate = item.uploadedAt || item.createdAt || item.image?.uploadedAt || item.prediction?.createdAt;
    const dateString = rawDate ? new Date(rawDate).toDateString() : 'Unknown Date';

    return (
      <View style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
        <Image 
          source={{ uri: imageUrl }} 
          style={styles.cardImage} 
          resizeMode="cover"
        />
        <View style={styles.cardContent}>
          <Text style={styles.cardTitle}>{dateString}</Text>
          <Text style={styles.cardText}>
            Response  <Text style={styles.cardValue}>{diseaseName}</Text>
          </Text>
          {/* Confidence might not be in the history list object, so we handle N/A */}
          <Text style={styles.cardText}>
            Conf. rate  <Text style={styles.cardValue}>
              {item.confidence ? Math.round(item.confidence * 100) + '%' : 'N/A'}
            </Text>
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
            keyExtractor={item => item.id || Math.random().toString()}
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
    paddingBottom: 100,
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