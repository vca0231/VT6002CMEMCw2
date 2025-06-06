import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Re-import AsyncStorage
// import { useAuth } from '../context/AuthContext'; // No longer needed here, will re-import specific function later
import { API_BASE_URL } from '@env'; // Re-import API_BASE_URL
import { RootStackParamList } from '../../types/navigation';
import { useAuth } from '../context/AuthContext';

type LoginScreenNavigationProp = NavigationProp<RootStackParamList, 'Login'>;

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signInWithIdToken } = useAuth(); // We will use this new function
  const API_URL = API_BASE_URL; // Use API_BASE_URL from @env

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showAlert('Validation Error', 'Please enter both email and password.');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        // Instead of storing in AsyncStorage directly, use AuthContext to sign in Firebase client SDK
        await signInWithIdToken(data.token); // Use the new function from AuthContext

        showAlert('Login Successful', `Welcome, ${email}!`);
        // Navigation is now handled by App.tsx based on AuthContext currentUser state
      } else {
        const errorData = await response.json();
        // If login fails, try to register
        if (errorData.message === 'User not found' || errorData.message === 'Invalid credentials') {
          const registerResponse = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          if (registerResponse.ok) {
            const registerData = await registerResponse.json();
            await signInWithIdToken(registerData.token); // Use the new function from AuthContext
            showAlert('Registration Successful', 'Account created and logged in!');
          } else {
            const registerErrorData = await registerResponse.json();
            showAlert('Registration Failed', registerErrorData.message || 'Registration failed. Please try again.');
          }
        } else {
          showAlert('Login Failed', errorData.message || 'Invalid email or password.');
        }
      }
    } catch (error) {
      console.error('Login/Registration Error:', error);
      showAlert('Error', 'Something went wrong. Please try again later.');
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
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login / Register</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', padding: 16 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 24, color: '#333' },
  input: { width: '80%', height: 50, borderColor: '#ccc', borderWidth: 1, borderRadius: 8, marginBottom: 16, paddingHorizontal: 10, backgroundColor: '#fff' },
  button: { width: '80%', height: 50, backgroundColor: '#007BFF', justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});

export default LoginScreen;
