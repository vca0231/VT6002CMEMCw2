import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ScrollView, Alert, TouchableOpacity, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import * as Notifications from 'expo-notifications';
// You might need to install a date picker library, e.g., npm install @react-native-community/datetimepicker
// import DateTimePicker from '@react-native-community/datetimepicker';

const NotificationReminderScreen = () => {
  const { currentUser: user } = useAuth();
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderTime, setReminderTime] = useState(''); // Format: HH:MM
  type Reminder = {
    id: string;
    message: string;
    time: string;
    type: string;
  };

  const [reminders, setReminders] = useState<Reminder[]>([]);

  const fetchReminders = async () => {
    if (!user) return;
    const res = await api.getNotifications(user.uid);
    if (res.success) setReminders(res.data);
    else setReminders([]);
  };

  useEffect(() => {
    fetchReminders();
  }, [user]);

  const handleSetReminder = async () => {
    if (!reminderMessage || !reminderTime) {
      Alert.alert('Input error', 'Please enter the reminder content and time.');
      return;
    }

    const res = await api.createNotification({
      uid: user?.uid,
      message: reminderMessage,
      time: reminderTime,
      type: 'general'
    });
    if (res.success) {
      Alert.alert('Success', 'Reminder set');
      setReminderMessage('');
      setReminderTime('');
      fetchReminders();
      // Set local push
      scheduleLocalNotification(reminderMessage, reminderTime);
    } else {
      Alert.alert('Error', res.message || 'Setting failed');
    }
  };


  // Local push
  const scheduleLocalNotification = async (message: string, time: string) => {
    const [hour, minute] = time.split(':').map(Number);

    if (Platform.OS === 'web') {
      //Web side instant notification
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('reminder', { body: message });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('reminder', { body: message });
            }
          });
        }
      }
      return;
    }

    // The native side only reminds once
    const now = new Date();
    const trigger = new Date();
    trigger.setHours(hour, minute, 0, 0);
    if (trigger <= now) {
      trigger.setDate(trigger.getDate() + 1); // If the time has passed, set it to tomorrow
    }

    await Notifications.scheduleNotificationAsync({
      content: { title: 'Reminder', body: message },
      trigger, // Remind only once
    } as any);
  };

  // Delete reminder
  const handleDeleteReminder = async (id: string) => {
    await api.deleteNotification(id);
    fetchReminders();
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
            <View key={item?.id} style={styles.reminderItem}>
              <View>
                <Text style={styles.reminderMessage}>{item.message}</Text>
                <Text style={styles.reminderTime}>{item.time}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert(
                    'Delete reminder',
                    `Are you sure you want to delete "${item.message}"?`,
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => handleDeleteReminder(item.id) }
                    ]
                  );
                }}
              >
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