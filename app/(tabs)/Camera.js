import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  SafeAreaView,
  ActivityIndicator, // Added for loading state
  Platform, 
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';

// Custom Components
import CustomHeader from '../../components/CustomHeader';
import LeafMask from '../../components/LeafMask';

// Config & Auth
import { API_URLS } from '../_config';
import { useAuth } from '../context/AuthContext';


export default function CameraScreen() {
  const router = useRouter();
  const authContext = useAuth(); 
  
  // Safety check for AuthContext
  if (!authContext) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#3E5936" />
      </View>
    );
  }

  const { userToken, signOut } = authContext;
  
  const [permission, requestPermission] = useCameraPermissions();
  const [capturedImage, setCapturedImage] = useState(null);
  const [facing, setFacing] = useState('back');
  const [flash, setFlash] = useState('off');
  const [isUploading, setIsUploading] = useState(false); 
  
  const cameraRef = useRef(null);

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Camera" />
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-off-outline" size={60} color="#666" />
          <Text style={styles.message}>We need your permission to show the camera</Text>
          <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          skipProcessing: true,
        });
        setCapturedImage(photo?.uri || null);
      } catch (error) {
        Alert.alert('Error', 'Failed to take picture');
      }
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Sorry, we need camera roll permissions!');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });
    if (!result.canceled) setCapturedImage(result.assets[0].uri);
  };

  // --- UPLOAD LOGIC ---
  const handleUsePhoto = async () => {
    if (!capturedImage) return;

    setIsUploading(true);

    try {
      // 1. Prepare URI safely
      // Fix: Only add file:// if it's NOT already there AND NOT a content:// URI
      let uri = capturedImage;
      if (Platform.OS === 'android' && !uri.startsWith('file://') && !uri.startsWith('content://')) {
        uri = `file://${uri}`;
      }

      // 2. Prepare FormData
      const formData = new FormData();
      formData.append('image', {
        uri: uri,
        name: 'scan.jpg',
        type: 'image/jpeg',
      });

      console.log('Uploading to:', API_URLS.UPLOAD_SCAN);
      
      // 3. Send Request
      const response = await fetch(API_URLS.UPLOAD_SCAN, {
        method: 'POST',
        headers: {
          // React Native sets Content-Type automatically for FormData
          // Using lowercase 'bearer' as requested
          'Authorization': `bearer ${userToken}`,
        },
        body: formData,
      });

      // 4. Handle Response
      const responseText = await response.text();
      console.log('Raw Server Response:', responseText);

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`Server Error (${response.status}): ${responseText.substring(0, 100)}`);
      }

      if (response.ok) {
        console.log('Upload Success:', data);
        Alert.alert("Success", "Scan uploaded successfully!");
        setCapturedImage(null);
      } else {
        console.error('Upload Failed:', data);
        
        if (response.status === 401) {
          Alert.alert("Session Expired", "Please log in again.", [
            { text: "OK", onPress: () => signOut() }
          ]);
        } else {
          Alert.alert("Upload Failed", data.message || "Something went wrong.");
        }
      }
    } catch (error) {
      console.error('Network Error:', error);
      Alert.alert("Error", error.message || "Could not connect to server.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetake = () => setCapturedImage(null);
  const toggleFlash = () => setFlash(cur => (cur === 'off' ? 'on' : 'off'));
  const toggleCameraType = () => setFacing(cur => (cur === 'back' ? 'front' : 'back'));

  // --- PREVIEW MODE ---
  if (capturedImage) {
    return (
      <View style={styles.container}>
        <CustomHeader title="Review Scan" />
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          
          <View style={styles.previewControls}>
            {isUploading ? (
              <View style={styles.loaderWrapper}>
                <ActivityIndicator size="large" color="#3E5936" />
                <Text style={{ color: '#fff', marginTop: 10 }}>Analyzing...</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity style={[styles.controlButton, styles.retakeButton]} onPress={handleRetake}>
                  <Ionicons name="refresh-outline" size={24} color="#333" />
                  <Text style={styles.controlText}>Retake</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.controlButton, styles.useButton]} onPress={handleUsePhoto}>
                  <Ionicons name="checkmark-circle-outline" size={24} color="#fff" />
                  <Text style={[styles.controlText, { color: '#fff' }]}>Use Photo</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CustomHeader title="New Scan" />
      <View style={styles.cameraContainer}>
        <CameraView style={styles.camera} facing={facing} flash={flash} ref={cameraRef}>
          
          <LeafMask />
          
          <SafeAreaView style={styles.overlayContainer}>
            <View style={styles.topControls}>
              <TouchableOpacity onPress={toggleFlash} style={styles.iconButton}>
                <Ionicons name={flash === 'on' ? 'flash' : 'flash-off'} size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleCameraType} style={styles.iconButton}>
                <Ionicons name="camera-reverse" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <View style={styles.guideContainer}>
              <Text style={styles.guideText}>Center leaf in the shape</Text>
            </View>

            <View style={styles.bottomControls}>
              <TouchableOpacity onPress={pickImage} style={styles.galleryButton}>
                <Ionicons name="images-outline" size={28} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity onPress={takePicture} style={styles.shutterButtonOuter}>
                <View style={styles.shutterButtonInner} />
              </TouchableOpacity>
              <View style={{ width: 40 }} />
            </View>
          </SafeAreaView>
        </CameraView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  permissionContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F7F5F0', padding: 20 },
  message: { textAlign: 'center', marginBottom: 20, marginTop: 20, fontSize: 16, color: '#333' },
  permissionButton: { backgroundColor: '#3E5936', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 8 },
  permissionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cameraContainer: { flex: 1, borderRadius: 20, overflow: 'hidden', marginHorizontal: 0, marginBottom: 80 },
  camera: { flex: 1 },
  overlayContainer: { flex: 1, justifyContent: 'space-between', zIndex: 2 },
  topControls: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, marginTop: 10 },
  iconButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  guideContainer: { alignItems: 'center', marginTop: 'auto', marginBottom: 40 },
  guideText: { color: '#fff', fontSize: 16, fontWeight: '600', textShadowColor: 'rgba(0,0,0,0.8)', textShadowRadius: 2, backgroundColor: 'rgba(0,0,0,0.3)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  bottomControls: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', paddingBottom: 30, paddingHorizontal: 20 },
  galleryButton: { width: 50, height: 50, justifyContent: 'center', alignItems: 'center', borderRadius: 25, backgroundColor: 'rgba(0,0,0,0.3)' },
  shutterButtonOuter: { width: 80, height: 80, borderRadius: 40, backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  shutterButtonInner: { width: 65, height: 65, borderRadius: 32.5, backgroundColor: '#fff' },
  previewContainer: { flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' },
  previewImage: { width: '100%', height: '80%', resizeMode: 'contain' },
  previewControls: { 
    flexDirection: 'row', 
    justifyContent: 'space-around', 
    width: '100%', 
    padding: 20, 
    position: 'absolute', 
    bottom: 110, 
  },
  controlButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 30, minWidth: 140, justifyContent: 'center' },
  retakeButton: { backgroundColor: '#fff' },
  useButton: { backgroundColor: '#3E5936' },
  controlText: { fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  loaderWrapper: { alignItems: 'center', justifyContent: 'center', width: '100%' },
});