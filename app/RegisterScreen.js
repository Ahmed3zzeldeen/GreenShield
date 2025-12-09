import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  ScrollView,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { API_URLS } from './_config';


const RegisterScreen = () => {
  const router = useRouter();
  
  // State for all required backend fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('FARMER'); // Default role
  
  // New Farmer-specific fields
  const [farmName, setFarmName] = useState('');
  const [farmAddress, setFarmAddress] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Helper to log and set error
  const setError = (msg) => {
    console.error('Validation Error:', msg); 
    setErrorMessage(msg);
  };

  const handleRegister = async () => {
    // 1. Basic Validation
    if (!firstName || !lastName || !username || !phoneNumber || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    // 2. Farmer Specific Validation
    if (role === 'FARMER') {
      if (!farmName || !farmAddress) {
        setError('Farm Name and Address are required for Farmers');
        return;
      }
    }

    // Password Strength Checks
    if (password.length <= 8) {
      setError('Password must be longer than 8 characters');
      return;
    }
    if (!/\d/.test(password)) {
      setError('Password must contain at least one number');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setErrorMessage('');

    try {
      console.log('Registering at:', API_URLS.REGISTER);

      // 3. Construct Payload
      const payload = {
        firstName: firstName,
        lastName: lastName,
        email: email.toLowerCase(),
        password: password,
        username: username,
        phoneNumber: phoneNumber,
        role: role,
        // Add farmer fields if role is FARMER
        ...(role === 'FARMER' && {
          farmName: farmName,
          farmAddress: farmAddress
        })
      };

      console.log('Payload:', JSON.stringify(payload, null, 2));

      // 4. Network Request
      const response = await fetch(API_URLS.REGISTER, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      
      const data = await response.json();

      if (response.ok) {
        console.log('Registration Success:', data);
        router.push({
          pathname: '/OTPScreen',
          params: { email: email.toLowerCase(), type: 'VERIFY_EMAIL' }
        });
      } else {
        console.error('Backend Response:', data);
        const message = data.message || (data.errors ? JSON.stringify(data.errors) : 'Registration failed');
        setError(message);
      }
    } catch (error) {
      console.error('Register Network Error:', error);
      setError('Network error. Check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.headerContainer}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join us to start monitoring your crops.</Text>
          </View>

          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color="#D88D28" />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}

          <View style={styles.formContainer}>
            
            {/* Name Fields */}
            <View style={styles.row}>
              <View style={[styles.inputWrapper, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>First Name</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ahmed"
                    placeholderTextColor="#999"
                    value={firstName}
                    onChangeText={setFirstName}
                  />
                </View>
              </View>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <Text style={styles.label}>Last Name</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Ezz"
                    placeholderTextColor="#999"
                    value={lastName}
                    onChangeText={setLastName}
                  />
                </View>
              </View>
            </View>

            {/* Username */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#666" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="ahmed3zzeldeen"
                  placeholderTextColor="#999"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Phone */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Phone Number</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#666" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="01234567891"
                  placeholderTextColor="#999"
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#666" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="name@example.com"
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={(text) => { setEmail(text); setErrorMessage(''); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Role Selection */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Role</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity 
                  style={[styles.roleButton, role === 'FARMER' && styles.roleButtonActive]} 
                  onPress={() => setRole('FARMER')}
                >
                  <Text style={[styles.roleText, role === 'FARMER' && styles.roleTextActive]}>Farmer</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.roleButton, role === 'ADMIN' && styles.roleButtonActive]} 
                  onPress={() => setRole('ADMIN')}
                >
                  <Text style={[styles.roleText, role === 'ADMIN' && styles.roleTextActive]}>Admin</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Farmer Specific Fields - Only show if Farmer is selected */}
            {role === 'FARMER' && (
              <>
                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Farm Name</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="leaf-outline" size={20} color="#666" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="Green Oasis"
                      placeholderTextColor="#999"
                      value={farmName}
                      onChangeText={setFarmName}
                    />
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.label}>Farm Address</Text>
                  <View style={styles.inputContainer}>
                    <Ionicons name="location-outline" size={20} color="#666" style={styles.icon} />
                    <TextInput
                      style={styles.input}
                      placeholder="123 Farm Road, Cairo"
                      placeholderTextColor="#999"
                      value={farmAddress}
                      onChangeText={setFarmAddress}
                    />
                  </View>
                </View>
              </>
            )}

            {/* Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#666" style={styles.icon} />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                />
              </View>
            </View>

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleRegister}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={styles.footerText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/')}> 
                <Text style={styles.linkText}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F5F0' },
  scrollContent: { padding: 25, flexGrow: 1, justifyContent: 'center' },
  headerContainer: { marginBottom: 20 },
  backButton: { marginBottom: 15 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#000', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#666' },
  formContainer: { width: '100%' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  inputWrapper: { marginBottom: 15 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 6, marginLeft: 4 },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 12, paddingHorizontal: 15, height: 50, borderWidth: 1, borderColor: '#E0E0E0',
  },
  icon: { marginRight: 10 },
  input: { flex: 1, height: '100%', color: '#333', fontSize: 16 },
  
  // Role Styles
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  roleButtonActive: {
    backgroundColor: '#3E5936',
    borderColor: '#3E5936',
  },
  roleText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  roleTextActive: {
    color: '#FFFFFF',
  },

  button: {
    backgroundColor: '#3E5936', borderRadius: 12, height: 55,
    justifyContent: 'center', alignItems: 'center', marginTop: 20,
    shadowColor: '#000', shadowOpacity: 0.1, elevation: 3,
  },
  buttonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  errorContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF3E2',
    padding: 10, borderRadius: 8, marginBottom: 15, borderWidth: 1, borderColor: '#F5D0A9',
  },
  errorText: { color: '#D88D28', marginLeft: 8, fontSize: 14, fontWeight: '500', flex: 1 },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 30, marginBottom: 50 },
  footerText: { color: '#666', fontSize: 15 },
  linkText: { color: '#3E5936', fontWeight: 'bold', fontSize: 15 },
});

export default RegisterScreen;