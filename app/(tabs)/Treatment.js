import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  ActivityIndicator, 
  RefreshControl,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import Ionicons from 'react-native-vector-icons/Ionicons';
import CustomHeader from '../../components/CustomHeader';
import { useAuth } from '../context/AuthContext';

// Enable LayoutAnimation for Android to make card expansion smooth
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function TreatmentScreen() {
  const { userToken } = useAuth();
  const [treatments, setTreatments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const fetchTreatments = async () => {
    try {
      if (!userToken) return;
      
      const url = 'https://greenshield.up.railway.app/api/predictions/history?limit=1000';
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
        console.log("Error parsing JSON");
        return;
      }

      if (response.ok && resData.success) {
        const allScans = resData.data?.predictions || [];
        // Filter: Keep ONLY items where the disease is NOT 'Healthy'
        const illPlants = allScans.filter(item => 
          item.disease?.nameEn && item.disease.nameEn.toLowerCase() !== 'healthy'
        );
        setTreatments(illPlants);
      }
    } catch (error) {
      console.error('Error fetching treatments:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTreatments();
    }, [userToken])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchTreatments();
  };

  const toggleExpand = (id) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpandedId(expandedId === id ? null : id);
  };

  const renderTreatmentItem = ({ item }) => {
    const isExpanded = expandedId === item.id;
    const disease = item.disease || {};
    const rawDate = item.uploadedAt || item.createdAt || item.image?.uploadedAt || item.prediction?.createdAt;
    const dateString = rawDate ? new Date(rawDate).toDateString() : 'Unknown Date';
    // Fallback for severity color
    const severityColor = getSeverityColor(disease.severityLevel);

    return (
      <View style={styles.card}>
        <TouchableOpacity 
          style={styles.cardHeader} 
          onPress={() => toggleExpand(item.id)}
          activeOpacity={0.7}
        >
          <Image 
            source={{ uri: item.image?.url || 'https://via.placeholder.com/150' }} 
            style={styles.cardImage} 
            resizeMode="cover"
          />
          <View style={styles.headerContent}>
            <View style={styles.titleRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.diseaseName}>{disease.nameEn || 'Unknown Disease'}</Text>
                {/* Arabic Name */}
                {disease.nameAr && <Text style={styles.diseaseNameAr}>{disease.nameAr}</Text>}
              </View>
              <Ionicons 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={20} 
                color="#666" 
              />
            </View>
            <Text style={styles.dateText}>{dateString}</Text>
            
            {/* Severity Badge */}
            <View style={[styles.badge, { backgroundColor: severityColor }]}>
              <Text style={styles.badgeText}>{disease.severityLevel || 'Pending'}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Expanded Content: Description & Treatments */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Description</Text>
              <Text style={styles.descriptionText}>{disease.descriptionEn || 'No description available.'}</Text>
              {/* Arabic Description */}
              {disease.descriptionAr && (
                <Text style={[styles.descriptionText, styles.rtlText]}>{disease.descriptionAr}</Text>
              )}
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recommended Treatments</Text>
              {disease.treatments && disease.treatments.length > 0 ? (
                disease.treatments.map((treatment, index) => (
                  <View key={index} style={styles.treatmentRow}>
                    <View style={styles.iconContainer}>
                      <Ionicons 
                        name={treatment.isChemical ? "flask-outline" : "leaf-outline"} 
                        size={18} 
                        color={treatment.isChemical ? "#D32F2F" : "#388E3C"} 
                      />
                    </View>
                    <View style={styles.treatmentTextContainer}>
                      <Text style={styles.treatmentTitle}>{treatment.titleEn}</Text>
                      {/* Arabic Treatment Title */}
                      {treatment.titleAr && (
                         <Text style={[styles.treatmentTitle, styles.rtlText]}>{treatment.titleAr}</Text>
                      )}
                      
                      <Text style={styles.treatmentDesc}>{treatment.descriptionEn}</Text>
                      {/* Arabic Treatment Desc */}
                      {treatment.descriptionAr && (
                         <Text style={[styles.treatmentDesc, styles.rtlText]}>{treatment.descriptionAr}</Text>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.noTreatmentsText}>No specific treatments listed.</Text>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Treatment" />
      
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3E5936" />
        </View>
      ) : (
        <FlatList
          data={treatments}
          renderItem={renderTreatmentItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#3E5936" />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="happy-outline" size={60} color="#ccc" />
              <Text style={styles.emptyText}>Great news! No plants currently need treatment.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

// Helper for badge background colors
const getSeverityColor = (severity) => {
  switch (severity?.toUpperCase()) {
    case 'HIGH': return '#FFEBEE'; // Light Red
    case 'MEDIUM': return '#FFF3E0'; // Light Orange
    case 'LOW': return '#E8F5E9'; // Light Green
    default: return '#F5F5F5'; // Grey
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F5F0',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Space for bottom tab bar
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#EFEFEF',
    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    // Elevation for Android
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    padding: 12,
    alignItems: 'center',
  },
  cardImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: '#eee',
  },
  headerContent: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start', // Align to top to handle multi-line text
    marginBottom: 4,
  },
  diseaseName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  diseaseNameAr: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginTop: 2,
    textAlign: 'left',
  },
  dateText: {
    fontSize: 12,
    color: '#888',
    marginBottom: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#555',
    textTransform: 'capitalize',
  },
  expandedContent: {
    padding: 16,
    paddingTop: 0,
    backgroundColor: '#fafafa',
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3E5936',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  descriptionText: {
    fontSize: 18,
    color: '#444',
    lineHeight: 20,
  },
  rtlText: {
    textAlign: 'right',
    color: '#666',
    marginTop: 4,
  },
  treatmentRow: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  treatmentTextContainer: {
    flex: 1,
  },
  treatmentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  treatmentDesc: {
    fontSize: 18,
    color: '#666',
    lineHeight: 20,
  },
  noTreatmentsText: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
});