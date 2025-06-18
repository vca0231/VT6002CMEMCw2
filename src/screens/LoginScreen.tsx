import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Platform, Image, KeyboardAvoidingView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../context/AuthContext';
import * as LocalAuthentication from 'expo-local-authentication';

type LoginScreenNavigationProp = NavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signInWithIdToken } = useAuth();
  const API_URL = API_BASE_URL;

  useEffect(() => {
    checkBiometricSupport();
  }, []);

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      setBiometricAvailable(compatible && enrolled);
    } catch (error) {
      console.error('Biometric check error:', error);
      setBiometricAvailable(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      console.log('Start fingerprint verification...');

      // First check if there is any saved login information
      const savedCredentials = await AsyncStorage.getItem('userCredentials');
      console.log('Currently saved login information:', savedCredentials);

      if (!savedCredentials) {
        console.log('No saved login information found, you need to log in with your email and password first');
        Alert.alert('Prompt', 'Please log in with your email and password first to enable fingerprint login.');
        return;
      }

      // Check if fingerprint recognition is available
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();

      if (!compatible || !enrolled) {
        console.log('Fingerprint recognition is not available:', { compatible, enrolled });
        Alert.alert('Prompt', 'Your device does not support fingerprint recognition or has not been set up. ');
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Please use fingerprint to verify your identity',
        fallbackLabel: 'Use password',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      console.log('Fingerprint verification result:', result);

      if (result.success) {
        console.log('Fingerprint verification is successful, try to get the saved login information...');
        try {
          const { email, password } = JSON.parse(savedCredentials);
          console.log('Found the saved login information, try to log in...');
          await handleLogin(email, password);
        } catch (parseError) {
          console.error('Parsing login information failed:', parseError);
          Alert.alert('Error', 'Login information is damaged. Please log in again using your email password.');
        }
      } else {
        console.log('Fingerprint verification failed');
        Alert.alert('Prompt', 'Fingerprint verification failed. Please try again or log in with your password.');
      }
    } catch (error) {
      console.error('Fingerprint login error:', error);
      Alert.alert('Error', 'Fingerprint verification failed. Please try again or log in with your password.');
    }
  };

  const handleLogin = async (loginEmail = email, loginPassword = password) => {
    if (!loginEmail || !loginPassword) {
      showAlert('Verification error', 'Please enter your email and password.');
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Network response error');
      }

      const data = await response.json();
      console.log('Login response data:', data);

      // Save login information
      const credentials = {
        email: loginEmail,
        password: loginPassword
      };

      try {
        // Save login information
        await AsyncStorage.setItem('userCredentials', JSON.stringify(credentials));
        console.log('Login information has been saved to AsyncStorage');

        // Check if Face ID is available
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();

        if (compatible && enrolled) {
          // Enable Face ID if Face ID is available
          await AsyncStorage.setItem('biometricEnabled', 'true');
          console.log('Face ID is enabled');
        }

        // Verify that the save was successful
        const savedCredentials = await AsyncStorage.getItem('userCredentials');
        console.log('Verify the saved login information:', savedCredentials);
      } catch (storageError) {
        console.error('Failed to save login information:', storageError);
      }

      // Login
      await signInWithIdToken(data.token);

      // Store user ID and other data
      if (data.uid) {
        await AsyncStorage.setItem('userId', data.uid);
        await AsyncStorage.setItem('loginResponse', JSON.stringify(data));
      }

      if (data.isNewUser) {
        showAlert('Registration successful', 'Account created and logged in!');
      } else {
        showAlert('Login successful', `Welcome back, ${loginEmail}!`);
      }
    } catch (error: any) {
      console.error('Login/Registration error:', error);
      if (error.name === 'AbortError') {
        showAlert('Error', 'Request timeout. Please check the network connection and try again.');
      } else if (error.message?.includes('Network request failed')) {
        showAlert('Error', 'Network error. Please check the network connection and try again.');
      } else {
        showAlert('Error', error.message || 'An error occurred. Please try again later.');
      }
    }
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background illustration */}
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80' }}
        style={styles.backgroundImage}
        blurRadius={2}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.innerContainer}>
        {/* Page illustration */}
        <Image
          source={{ uri: 'https://cdn-icons-png.flaticon.com/512/135/135620.png' }}
          style={styles.illustration}
        />
        <View style={styles.card}>
          <Text style={styles.title}>Welcome back! </Text>
          <Text style={styles.subtitle}>Start your healthy eating journey</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity style={styles.button} onPress={() => handleLogin()}>
            <Text style={styles.buttonText}>Login / Register</Text>
          </TouchableOpacity>

          {biometricAvailable && (
            <TouchableOpacity
              style={[styles.button, styles.biometricButton]}
              onPress={handleBiometricLogin}
            >
              <Text style={styles.buttonText}>Login using biometrics</Text>
            </TouchableOpacity>
          )}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#caf0f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  innerContainer: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: 100,
    height: 100,
    marginBottom: 20,
    borderRadius: 50,
    backgroundColor: '#fff',
    alignSelf: 'center',
  },
  card: {
    width: 320,
    padding: 30,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    shadowColor: '#90e0ef',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#219ebc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#023047',
    marginBottom: 24,
  },
  input: {
    width: '100%',
    height: 48,
    borderColor: '#8ecae6',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    backgroundColor: '#f1faee',
    fontSize: 16,
    color: '#023047',
  },
  button: {
    width: '100%',
    height: 48,
    backgroundColor: '#219ebc',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  biometricButton: {
    backgroundColor: '#023047',
    marginTop: 10,
  },
});

export default LoginScreen;
