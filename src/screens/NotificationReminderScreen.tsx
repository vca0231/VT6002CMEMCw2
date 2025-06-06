import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ScrollView, Alert, TouchableOpacity } from 'react-native';
// You might need to install a date picker library, e.g., npm install @react-native-community/datetimepicker
// import DateTimePicker from '@react-native-community/datetimepicker';

const NotificationReminderScreen = () => {
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderTime, setReminderTime] = useState(''); // Format: HH:MM
  const [reminders, setReminders] = useState([
    { id: '1', message: '記錄早餐', time: '08:00', type: 'diet' },
    { id: '2', message: '運動時間', time: '18:30', type: 'exercise' },
  ]);

  const handleSetReminder = () => {
    if (!reminderMessage || !reminderTime) {
      Alert.alert('Input error', 'Please enter the reminder content and time.');
      return;
    }

    const newReminder = {
      id: Date.now().toString(), // Simple unique ID for mock data
      message: reminderMessage,
      time: reminderTime,
      type: 'general', // Default type, can be expanded
    };
    setReminders([...reminders, newReminder]);
    Alert.alert('Success', 'Reminder set successfully!');
    setReminderMessage('');
    setReminderTime('');
    // Call the backend API here to set a reminder
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Notification Reminder</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Set new reminder</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Reminder content:</Text>
          <TextInput
            style={styles.input}
            placeholder="Example: record lunch, go to the gym"
            value={reminderMessage}
            onChangeText={setReminderMessage}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Reminder time (HH:MM):</Text>
          <TextInput
            style={styles.input}
            placeholder="Example：12:30"
            value={reminderTime}
            onChangeText={setReminderTime}
            keyboardType="numbers-and-punctuation" // To allow colon
          />
          {/* If you have DateTimePicker installed, you can use it here */}
          {/* <DateTimePicker
            value={new Date()}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleTimeChange}
          /> */}
        </View>
        <Button title="Set a reminder" onPress={handleSetReminder} />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your reminder</Text>
        {reminders.length === 0 ? (
          <Text style={styles.infoText}>No reminders yet.</Text>
        ) : (
          reminders.map((item) => (
            <View key={item.id} style={styles.reminderItem}>
              <View>
                <Text style={styles.reminderMessage}>{item.message}</Text>
                <Text style={styles.reminderTime}>{item.time} ({item.type})</Text>
              </View>
              <TouchableOpacity onPress={() => Alert.alert('Delete reminder', `Are you sure you want to delete ${item.message}? `)}>
                <Text style={styles.deleteButton}>Delete</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
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
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#666',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  reminderMessage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  reminderTime: {
    fontSize: 14,
    color: '#666',
  },
  deleteButton: {
    color: '#FF0000',
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default NotificationReminderScreen; 