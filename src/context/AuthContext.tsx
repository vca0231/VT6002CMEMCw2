import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, User, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, GoogleAuthProvider, signInWithCredential, signInWithCustomToken } from 'firebase/auth';
import { auth } from '../../server/firebase'; // Import the auth instance from your firebase.js
import { ActivityIndicator, View, StyleSheet, Text, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthContextType {
  currentUser: User | null;
  loadingAuth: boolean;
/*   login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string) => Promise<any>; */
  logout: () => Promise<void>;
  signInWithIdToken: (idToken: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true); // Tracks initial auth state loading

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('onAuthStateChanged triggered. User:', user ? user.uid : 'null');
      setCurrentUser(user);
      setLoadingAuth(false);
      if (user) {   
        // Optionally store user token/uid in AsyncStorage for quick access if needed elsewhere
        await AsyncStorage.setItem('userToken', await user.getIdToken());
        await AsyncStorage.setItem('userUid', user.uid);
      } else {
        await AsyncStorage.removeItem('userToken');
        await AsyncStorage.removeItem('userUid');
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

  const logout = async () => {
    console.log('Logout function called.');
    try {
      await signOut(auth);
      console.log('Firebase signOut successful.');
      // onAuthStateChanged will handle setting currentUser to null
    } catch (error: any) {
      console.error("Logout error:", error);
      Alert.alert('登出失敗', '登出過程中發生錯誤。');
    }
  };

  if (loadingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>驗證身份中...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ currentUser, loadingAuth, logout, signInWithIdToken }}>
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