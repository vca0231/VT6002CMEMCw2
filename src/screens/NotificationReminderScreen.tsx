import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ScrollView, Alert, TouchableOpacity, Platform, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import * as Notifications from 'expo-notifications';
import DateTimePicker from '@react-native-community/datetimepicker';
// You might need to install a date picker library, e.g., npm install @react-native-community/datetimepicker
// import DateTimePicker from '@react-native-community/datetimepicker';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});


const NotificationReminderScreen = () => {
  const { currentUser: user } = useAuth();
  const [reminderMessage, setReminderMessage] = useState('');
  const [reminderTime, setReminderTime] = useState(''); // Format: HH:MM
  const [showTimePicker, setShowTimePicker] = useState(false);

  type Reminder = {
    id: string;
    message: string;
    time: string;
    type: string;
  };

  const handleTimeChange = (event: any, selectedDate?: Date) => {
    setShowTimePicker(false);
    if (selectedDate) {
      const hours = selectedDate.getHours().toString().padStart(2, '0');
      const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
      setReminderTime(`${hours}:${minutes}`);
    }
  };

  const [reminders, setReminders] = useState<Reminder[]>([]);

  const fetchReminders = async () => {
    if (!user) return;
    const res = await api.getNotifications(user.uid);
    if (res.success) setReminders(res.data);
    else setReminders([]);
  };

  useEffect(() => {

    (async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Insufficient permissions', 'Please allow notification permissions to receive reminders');
      }
    })();
    fetchReminders();
  }, [user]);


  useEffect(() => {
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      Alert.alert(notification.request.content.title || '', notification.request.content.body || '');
    });
    return () => subscription.remove();
  }, []);

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
      // Time has passed or is equal to now, send notification immediately
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Reminder', body: message, sound: true },
        trigger: null, // immediately
      });
    } else {
      // Time has not yet arrived, schedule normally
      await Notifications.scheduleNotificationAsync({
        content: { title: 'Reminder', body: message, sound: true },
        trigger,
        hour,
        minute,
        repeats: false, // Remind only once
      } as any);
    }
  };
  // Delete reminder
  const handleDeleteReminder = async (id: string) => {
    await api.deleteNotification(id);
    fetchReminders();
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80' }}
        style={styles.backgroundImage}
        blurRadius={2}
      />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Notification Reminder</Text>

        <View style={styles.card}>
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
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={{ color: reminderTime ? '#023047' : '#aaa', fontSize: 16 }}>
                {reminderTime ? reminderTime : 'Please select a time'}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={reminderTime ? new Date(0, 0, 0, Number(reminderTime.split(':')[0]), Number(reminderTime.split(':')[1])) : new Date()}
                mode="time"
                is24Hour={true}
                display="default"
                onChange={handleTimeChange}
                style={{ marginTop: 10, backgroundColor: '#fff' }}
              />
            )}
          </View>
          <TouchableOpacity style={styles.actionButton} onPress={handleSetReminder}>
            <Text style={styles.actionButtonText}>Set a reminder</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
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
      </View>
    </ScrollView>
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
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 40,
    textAlign: 'center',
    color: '#219ebc',
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 24,
    padding: 20,
    marginTop: 20,
    shadowColor: '#90e0ef',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#023047',
    borderBottomWidth: 1,
    borderBottomColor: '#8ecae6',
    paddingBottom: 5,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: '#023047',
  },
  input: {
    borderWidth: 1,
    borderColor: '#8ecae6',
    padding: 10,
    borderRadius: 12,
    backgroundColor: '#f1faee',
    fontSize: 16,
    color: '#023047',
  },
  actionButton: {
    backgroundColor: '#219ebc',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  reminderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    backgroundColor: '#f1faee',
    borderRadius: 12,
    marginBottom: 10,
  },
  reminderMessage: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#023047',
  },
  reminderTime: {
    fontSize: 14,
    color: '#023047',
    marginTop: 4,
  },
  deleteButton: {
    color: '#e63946',
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 14,
    color: '#023047',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default NotificationReminderScreen; 