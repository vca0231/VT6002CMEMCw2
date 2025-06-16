import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Platform, Image, KeyboardAvoidingView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '@env';
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../context/AuthContext';
import ReactNativeBiometrics from 'react-native-biometrics';

const rnBiometrics = new ReactNativeBiometrics();

type LoginScreenNavigationProp = NavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signInWithIdToken } = useAuth();
  const API_URL = API_BASE_URL;

  /*  useEffect(() => {
     checkBiometricSupport();
   }, []); */

  const checkBiometricSupport = async () => {
    try {
      const { available } = await rnBiometrics.isSensorAvailable();
      setBiometricAvailable(available);
    } catch (error) {
      console.error('Biometric check error:', error);
      setBiometricAvailable(false);
    }
  };

  const handleBiometricLogin = async () => {
    try {
      const { success } = await rnBiometrics.simplePrompt({
        promptMessage: 'Verify your identity to login',
        cancelButtonText: 'Cancel'
      });

      if (success) {
        // Get saved login information from AsyncStorage 
        const savedCredentials = await AsyncStorage.getItem('userCredentials');
        if (savedCredentials) {
          const { email, password } = JSON.parse(savedCredentials);
          await handleLogin(email, password);
        } else {
          Alert.alert('Error', 'No saved credentials found. Please login with email and password first.');
        }
      }
    } catch (error) {
      console.error('Biometric login error:', error);
      Alert.alert('Error', 'Biometric verification failed');
    }
  };

  const handleLogin = async (loginEmail = email, loginPassword = password) => {
    if (!loginEmail || !loginPassword) {
      showAlert('Validation Error', 'Please enter both email and password.');
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

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
        throw new Error(errorData.message || 'Network response was not ok');
      }

      const data = await response.json();

      await signInWithIdToken(data.token);

      // Save login information for biometric login
      await AsyncStorage.setItem('userCredentials', JSON.stringify({
        email: loginEmail,
        password: loginPassword
      }));

      // Store user ID for data management
      if (data.uid) {
        await AsyncStorage.setItem('userId', data.uid);
        await AsyncStorage.setItem('loginResponse', JSON.stringify(data));
      }

      if (data.isNewUser) {
        showAlert('Registration Successful', 'Account created and logged in!');
      } else {
        showAlert('Login Successful', `Welcome, ${loginEmail}!`);
      }
    } catch (error: any) {
      console.error('Login/Registration Error:', error);
      if (error.name === 'AbortError') {
        showAlert('Error', 'Request timed out. Please check your internet connection and try again.');
      } else if (error.message?.includes('Network request failed')) {
        showAlert('Error', 'Network error. Please check your internet connection and try again.');
      } else {
        showAlert('Error', error.message || 'Something went wrong. Please try again later.');
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
      <KeyboardAvoidingView behavior="padding" style={styles.innerContainer}>
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

{/*           {biometricAvailable && (
            <TouchableOpacity
              style={[styles.button, styles.biometricButton]}
              onPress={handleBiometricLogin}
            >
              <Text style={styles.buttonText}>Login with Biometrics</Text>
            </TouchableOpacity>
          )} */}
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
    marginBottom: 16,
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
});

export default LoginScreen;
