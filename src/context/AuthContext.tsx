import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, User, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, signInWithCustomToken } from 'firebase/auth';
import { auth } from '../../server/firebase'; // Import the auth instance from your firebase.js
import { ActivityIndicator, View, StyleSheet, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';

interface AuthContextType {
  currentUser: User | null;
  loadingAuth: boolean;
  /*   login: (email: string, password: string) => Promise<any>;
    register: (email: string, password: string) => Promise<any>; */
  logout: () => Promise<void>;
  signInWithIdToken: (idToken: string) => Promise<any>;
  isBiometricEnabled: boolean;
  toggleBiometric: (enabled: boolean) => Promise<void>;
  checkBiometricSupport: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // Tracks initial auth state loading
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('onAuthStateChanged triggered. User:', user ? user.uid : 'null');
      setCurrentUser(user);
      setLoadingAuth(false);
      if (user) {
        // Optionally store user token/uid in AsyncStorage for quick access if needed elsewhere
        await AsyncStorage.setItem('userToken', await user.getIdToken());
        await AsyncStorage.setItem('userUid', user.uid);
        // Check biometric settings
        const biometricEnabled = await AsyncStorage.getItem('biometricEnabled');
        setIsBiometricEnabled(biometricEnabled === 'true');
      } else {
        await AsyncStorage.multiRemove([
          'userToken',
          'userUid',
          'loginResponse',
          'userId',
        ]);
        console.log('Run the else, User logged out or no user found. Cleared AsyncStorage.');
        setIsBiometricEnabled(false);
      }
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting currentUser
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      console.error("Login error:", error);
      return { success: false, message: error.message };
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle setting currentUser
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      console.error("Registration error:", error);
      return { success: false, message: error.message };
    }
  };

  const signInWithIdToken = async (idToken: string) => {
    try {

      const userCredential = await signInWithCustomToken(auth, idToken);
      return { success: true, user: userCredential.user };
    } catch (error: any) {
      console.error("Sign in with ID Token error:", error);
      return { success: false, message: error.message };
    }
  };

  const checkBiometricSupport = async () => {
    try {
      const compatible = await LocalAuthentication.hasHardwareAsync();
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      return compatible && enrolled;
    } catch (error) {
      console.error('Biometric support check error:', error);
      return false;
    }
  };

  const toggleBiometric = async (enabled: boolean) => {
    try {
      if (enabled) {
        const isSupported = await checkBiometricSupport();
        if (!isSupported) {
          Alert.alert('error', 'Your device does not support Face ID or Face ID is not set up');
          return;
        }
      }
      await AsyncStorage.setItem('biometricEnabled', String(enabled));
      setIsBiometricEnabled(enabled);
    } catch (error) {
      console.error('Error toggling biometric:', error);
      Alert.alert('error', 'Failed to update Face ID settings');
    }
  };

  const logout = async () => {
    console.log('Logout function called.');
    try {
      await signOut(auth);

      // Only delete authentication-related keys, not userCredentials and biometricEnabled
      const authKeys = ['userToken', 'userUid', 'loginResponse', 'userId'];
      for (const key of authKeys) {
        await AsyncStorage.removeItem(key);
        console.log(`Deleted ${key}`);
      }

      // Verify that userCredentials is still there
      const savedCredentials = await AsyncStorage.getItem('userCredentials');
      console.log('Login information saved after logout:', savedCredentials);

      console.log('Firebase signOut successful and storage cleared.');
    } catch (error: any) {
      console.error("Logout error:", error);
      Alert.alert('Logout failed', 'An error occurred during the logout process.');
    }
  };

  if (loadingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Verifying identity...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      loadingAuth,
      logout,
      signInWithIdToken,
      isBiometricEnabled,
      toggleBiometric,
      checkBiometricSupport
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
}); 