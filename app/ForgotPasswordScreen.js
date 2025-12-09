import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';
// Import the centralized config
import { API_URLS } from './_config';

const ForgotPasswordScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSendCode = async () => {
    if (!email) {
      setErrorMessage('Please enter your email');
      return;
    }
    setIsLoading(true);
    setErrorMessage('');

    try {
      console.log('Sending Code to:', API_URLS.FORGOT_PASSWORD);
      const payload = { email };
      console.log('Payload:', payload);
      
      const response = await fetch(API_URLS.FORGOT_PASSWORD, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      // Log full response for debugging
      console.log('Response Status:', response.status);
      console.log('Response Data:', JSON.stringify(data, null, 2));

      if (response.ok) {
        // Success: Navigate to OTP Screen with params
        router.push({
          pathname: '/ResetOTP',
        });
      } else {
        console.error('Forgot Password Failed:', data);
        setErrorMessage(data.message || 'Failed to send code');
      }
    } catch (error) {
      console.error('Network Error:', error);
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you a code to reset your password.
          </Text>
        </View>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <View style={styles.inputWrapper}>
          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="name@example.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setErrorMessage('');
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSendCode} disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Send Code</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F5F0' },
  contentContainer: { flex: 1, padding: 25, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 50, left: 25 },
  header: { marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#000', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#666', lineHeight: 22 },
  inputWrapper: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginLeft: 4 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 12, paddingHorizontal: 15, height: 55, borderWidth: 1, borderColor: '#E0E0E0',
  },
  icon: { marginRight: 10 },
  input: { flex: 1, height: '100%', color: '#333', fontSize: 16 },
  button: {
    backgroundColor: '#3E5936', borderRadius: 12, height: 55,
    justifyContent: 'center', alignItems: 'center', marginTop: 10,
    shadowColor: '#000', shadowOpacity: 0.1, elevation: 3,
  },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  errorText: { color: '#D88D28', marginBottom: 15, fontWeight: '500' },
});

export default ForgotPasswordScreen;