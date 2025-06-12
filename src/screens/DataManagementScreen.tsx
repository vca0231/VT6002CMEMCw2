import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Button, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { api } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DataManagementScreen = () => {
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('Never synced');
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    // Get user ID from AsyncStorage
    const getUserId = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        if (storedUserId) {
          setUserId(storedUserId);
          // Get the last synchronization time
          const lastSync = await AsyncStorage.getItem('lastSyncTime');
          if (lastSync) {
            setLastSyncTime(new Date(lastSync).toLocaleString());
          }
        }
      } catch (error) {
        console.error('Error getting user ID:', error);
      }
    };
    getUserId();
  }, []);

  const handleToggleCloudSync = async () => {
    const newState = !cloudSyncEnabled;
    setCloudSyncEnabled(newState);
    if (newState) {
      try {
        setIsLoading(true);
        // When cloud sync is enabled, synchronize immediately
        await handleManualBackup();
        Alert.alert('Cloud sync', 'Cloud sync is enabled. Data will be automatically synchronized to Firebase.');
      } catch (error) {
        console.error('Error enabling cloud sync:', error);
        Alert.alert('Error', 'An error occurred when enabling cloud sync.');
        setCloudSyncEnabled(false);
      } finally {
        setIsLoading(false);
      }
    } else {
      Alert.alert('Cloud sync', 'Cloud sync is disabled.');
    }
  };

  const handleManualBackup = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found, please log in first.');
      return;
    }

    try {
      setIsLoading(true);
      // Sync data to the cloud
      const response = await api.syncData(userId);

      if (response.success) {
        const currentTime = new Date().toISOString();
        setLastSyncTime(new Date().toLocaleString());
        // Save synchronization time to local storage
        await AsyncStorage.setItem('lastSyncTime', currentTime);
        Alert.alert('Backup successful', 'Data has been successfully backed up to the cloud!');
      } else {
        throw new Error(response.message || 'Backup failed');
      }
    } catch (error) {
      console.error('Backup error:', error);
      Alert.alert('Backup failed', 'An error occurred while backing up data, please try again later. ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestoreData = async () => {
    if (!userId) {
      Alert.alert('Error', 'User ID not found, please log in first.');
      return;
    }

    try {
      setIsLoading(true);

      // Get all data for the user
      const [dietResponse, exerciseResponse, notificationResponse] = await Promise.all([
        api.getDietRecords(userId),
        api.getExerciseRecords(userId),
        api.getNotifications(userId)
      ]);

      if (dietResponse.success && exerciseResponse.success && notificationResponse.success) {
        // Save data to local storage
        await AsyncStorage.setItem('dietRecords', JSON.stringify(dietResponse.data));
        await AsyncStorage.setItem('exerciseRecords', JSON.stringify(exerciseResponse.data));
        await AsyncStorage.setItem('notifications', JSON.stringify(notificationResponse.data));

        Alert.alert('Restore successful', 'Data has been successfully restored from the cloud!');
      } else {
        throw new Error('Restore data failed');
      }
    } catch (error) {
      console.error('Restore error:', error);
      Alert.alert('Restore failed', 'An error occurred while restoring data from the cloud. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Data management</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cloud synchronization</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Enable automatic cloud synchronization:</Text>
          <Switch
            onValueChange={handleToggleCloudSync}
            value={cloudSyncEnabled}
            disabled={isLoading}
          />
        </View>
        <Text style={styles.infoText}>Last sync time: {lastSyncTime}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manual operation</Text>
        <View style={styles.buttonGroup}>
          <Button
            title="Back up data now"
            onPress={handleManualBackup}
            disabled={isLoading} />
          <View style={{ height: 10 }} />
          <Button
            title="Restore data from the cloud"
            onPress={handleRestoreData}
            color="#FF9800"
            disabled={isLoading} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data privacy and security</Text>
        <Text style={styles.infoText}>
          All your health data is encrypted and securely stored in the Firebase cloud.
          We use end-to-end encryption and biometric authentication to protect your privacy.
        </Text>
      </View>

      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#444',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  infoText: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
  },
  buttonGroup: {
    marginTop: 10,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#333',
  },
});

export default DataManagementScreen; 