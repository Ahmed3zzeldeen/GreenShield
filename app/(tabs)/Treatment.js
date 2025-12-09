import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator } from 'react-native';
import CustomHeader from '../../components/CustomHeader';

// 1. Master Data (Same as Scans, but we will filter it)
const ALL_SCANS = [
  {
    id: '1',
    title: 'Corn 11-05-2025',
    response: 'Healthy',
    status: 'healthy',
    image: 'https://via.placeholder.com/150/527346/FFFFFF?text=Corn',
  },
  {
    id: '2',
    title: 'Corn 19-02-2025',
    response: 'Gray Spot',
    status: 'danger',
    image: 'https://via.placeholder.com/150/D88D28/FFFFFF?text=Spot',
  },
  {
    id: '3',
    title: 'Corn 1-5-2024',
    response: 'Common Rust',
    status: 'danger',
    image: 'https://via.placeholder.com/150/D88D28/FFFFFF?text=Rust',
  },
  {
    id: '4',
    title: 'Corn 5-7-2023',
    response: 'Blight',
    status: 'danger',
    image: 'https://via.placeholder.com/150/D88D28/FFFFFF?text=Blight',
  },
];

// 2. Helper to get treatment based on disease
const getTreatmentPlan = (disease) => {
  switch (disease) {
    case 'Gray Spot': return 'Panadole'; // Matches your image
    case 'Common Rust': return 'Fungicide A';
    case 'Blight': return 'Copper Spray';
    default: return 'Consult Agronomist';
  }
};

export default function TreatmentScreen() {
  const [illScans, setIllScans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching and filtering data
    const loadTreatments = async () => {
      // Filter: Keep ONLY items where status is 'danger' (Ill leaves)
      const filtered = ALL_SCANS.filter(item => item.status === 'danger').map(item => ({
        ...item,
        treatment: getTreatmentPlan(item.response) // Add treatment info
      }));

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIllScans(filtered);
      setIsLoading(false);
    };

    loadTreatments();
  }, []);

  const renderTreatmentCard = ({ item }) => {
    return (
      // Card Background is Pink (#FFC1C1) for ill plants
      <View style={styles.card}>
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
            Treatment <Text style={styles.cardValue}>{item.treatment}</Text>
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Treatment" />

      <View style={styles.contentContainer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3E5936" />
            <Text style={styles.loadingText}>Analyzing treatments...</Text>
          </View>
        ) : (
          <FlatList
            data={illScans}
            renderItem={renderTreatmentCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>Great news! No treatments needed.</Text>
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
    marginBottom: 80, // Space for bottom tab bar
  },
  listContent: {
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  // Card Styles matching your image
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFC1C1', // The specific pink color from your design
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