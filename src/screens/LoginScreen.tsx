import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
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

  useEffect(() => {
    checkBiometricSupport();
  }, []);

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
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        await signInWithIdToken(data.token);

        // Save login information for biometric login
        await AsyncStorage.setItem('userCredentials', JSON.stringify({
          email: loginEmail,
          password: loginPassword
        }));

        if (data.isNewUser) {
          showAlert('Registration Successful', 'Account created and logged in!');
        } else {
          showAlert('Login Successful', `Welcome, ${loginEmail}!`);
        }
      } else {
        showAlert('Login Failed', data.message || 'Invalid email or password.');
      }
    } catch (error) {
      console.error('Login/Registration Error:', error);
      showAlert('Error', 'Something went wrong. Please try again later.');
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
      <Text style={styles.title}>Login</Text>
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
          <Text style={styles.buttonText}>Login with Biometrics</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 16
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333'
  },
  input: {
    width: '80%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 10,
    backgroundColor: '#fff'
  },
  button: {
    width: '80%',
    height: 50,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 12
  },
  biometricButton: {
    backgroundColor: '#28a745'
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold'
  },
});

export default LoginScreen;
