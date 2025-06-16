import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../../types/navigation';

// We can directly use NavigationProp<RootStackParamList> as the navigation hook type

const OptionsScreen = () => {
  // Use the broader RootStackParamList for navigation
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { logout } = useAuth();

  const handleLogout = async () => {
    console.log('Attempting direct logout from OptionsScreen...');
    await logout();
  };

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80' }}
        style={styles.backgroundImage}
        blurRadius={2}
      />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Options</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('UserProfile')}
          >
            <Text style={styles.buttonText}>My Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.navigate('DataManagement')}
          >
            <Text style={styles.buttonText}>Data Management</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.button, styles.logoutButton]} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#caf0f8',
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#219ebc',
  },
  card: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#90e0ef',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  button: {
    width: '100%',
    padding: 15,
    backgroundColor: '#219ebc',
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutButton: {
    backgroundColor: '#e63946',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default OptionsScreen; 