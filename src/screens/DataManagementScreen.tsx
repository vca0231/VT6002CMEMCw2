import React, { useState } from 'react';
import { View, Text, StyleSheet, Switch, Button, Alert, ScrollView } from 'react-native';

const DataManagementScreen = () => {
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('Never synced');

  const handleToggleCloudSync = () => {
    const newState = !cloudSyncEnabled;
    setCloudSyncEnabled(newState);
    if (newState) {
      Alert.alert('Cloud Sync', 'Cloud Sync is on. Data will be automatically synced to Firebase.');
      // Trigger the actual sync logic here
      setLastSyncTime(new Date().toLocaleString());
    } else {
      Alert.alert('Cloud Sync', 'Cloud Sync is off.');
    }
  };

  const handleManualBackup = () => {
    Alert.alert('Manual backup', 'Backing up your data to the cloud...');
    // Trigger the manual backup logic here
    setTimeout(() => {
      setLastSyncTime(new Date().toLocaleString());
      Alert.alert('Manual backup', 'Data backup successful!');
    }, 2000);
  };

  const handleRestoreData = () => {
    Alert.alert('Restore data', 'Restoring data from the cloud... (This function is to be implemented)');
    // Trigger data recovery logic here
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
          />
        </View>
        <Text style={styles.infoText}>Last sync time: {lastSyncTime}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Manual operation</Text>
        <View style={styles.buttonGroup}>
          <Button title="Back up data now" onPress={handleManualBackup} />
          <View style={{ height: 10 }} />
          <Button title="Restore data from the cloud" onPress={handleRestoreData} color="#FF9800" />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data privacy and security</Text>
        <Text style={styles.infoText}>
          All your health data is encrypted and securely stored in the Firebase cloud.
          We use end-to-end encryption and biometric authentication to protect your privacy.
        </Text>
      </View>

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
});

export default DataManagementScreen; 