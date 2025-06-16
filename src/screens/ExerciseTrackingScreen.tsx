import React, { useState, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { View, Text, StyleSheet, TextInput, Button, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const MET_VALUES: Record<string, number> = {
  'Running': 7,
  'Walking': 3.5,
  'Cycling': 8,
  'Swimming': 6,
  'Strength training': 6,
  'Yoga': 3,
  'Other': 4,
};

const ExerciseTrackingScreen = () => {
  const [exerciseType, setExerciseType] = useState('Running');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [exerciseRecords, setExerciseRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [caloriesBurned, setCaloriesBurned] = useState(0);
  const { currentUser: user } = useAuth();
  const [userWeight, setUserWeight] = useState<number | null>(null);



  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      const res = await api.getUserProfile(user.uid);
      if (res && res.weight) {
        setUserWeight(Number(res.weight));
      }
    };
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!userWeight || !duration) {
      setCaloriesBurned(0);
      return;
    }
    const MET = MET_VALUES[exerciseType] || 4;
    const hours = parseFloat(duration) / 60;
    if (!isNaN(userWeight) && !isNaN(hours)) {
      setCaloriesBurned(Math.round(MET * userWeight * hours));
    } else {
      setCaloriesBurned(0);
    }
  }, [exerciseType, duration, userWeight]);

  const handleResetFilter = () => {
    setStartDate(null);
    setEndDate(null);
  };

  const fetchExerciseRecords = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const startStr = startDate ? startDate.toISOString() : undefined;
      const endStr = endDate ? endDate.toISOString() : undefined;
      const res = await api.getExerciseRecords(user.uid, startStr, endStr);
      if (res.success) setExerciseRecords(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExerciseRecords();
  }, [user, startDate, endDate]);

  const handleRecordExercise = async () => {
    if (!exerciseType || !duration) {
      Alert.alert('Input error', 'Please enter the exercise type and duration.');
      return;
    }
    if (!user) {
      Alert.alert('Error', 'Please log in first.');
      return;
    }
    try {
      const res = await api.recordExercise({
        uid: user.uid,
        exerciseType,
        duration: parseInt(duration),
        distance: distance ? parseFloat(distance) : 0,
        caloriesBurned,
      });
      if (res.success) {
        Alert.alert('Success', 'Exercise record saved!');
        setDuration('');
        setDistance('');
        fetchExerciseRecords();
      } else {
        Alert.alert('Error', res.message || 'Save failed, please try again.');
      }
    } catch (error) {
      Alert.alert('Error', 'Save failed, please check network connection and try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80' }}
        style={styles.backgroundImage}
        blurRadius={2}
      />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Record your exercise</Text>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Exercise type:</Text>
            <View style={styles.exerciseTypeContainer}>
              {['Running', 'Walking', 'Cycling', 'Swimming', 'Strength training', 'Yoga', 'Other'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.exerciseTypeButton, exerciseType === type && styles.selectedExerciseTypeButton]}
                  onPress={() => setExerciseType(type)}
                >
                  <Text style={[styles.exerciseTypeButtonText, exerciseType === type && styles.selectedExerciseTypeButtonText]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Duration (minutes):</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter duration"
              keyboardType="numeric"
              value={duration}
              onChangeText={setDuration}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Distance (km, optional):</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter distance"
              keyboardType="numeric"
              value={distance}
              onChangeText={setDistance}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Calories burned (kcal):</Text>
            <Text style={[styles.input, { color: '#023047', backgroundColor: '#f1faee' }]}>{caloriesBurned}</Text>
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={handleRecordExercise}>
              <Text style={styles.actionButtonText}>Record Exercise</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <TouchableOpacity onPress={() => setShowStartPicker(true)} style={[styles.input, { flex: 2, marginRight: 3, justifyContent: 'center' }]}>
              <Text>{startDate ? startDate.toLocaleDateString() : 'Start Date'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setShowEndPicker(true)} style={[styles.input, { flex: 2, marginLeft: 3, justifyContent: 'center' }]}>
              <Text>{endDate ? endDate.toLocaleDateString() : 'End Date'}</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={fetchExerciseRecords} style={[styles.filterButton, { flex: 1, marginLeft: 5, paddingHorizontal: 0 }]}>
              <Text style={styles.filterButtonText}>FILTER</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleResetFilter} style={[styles.filterButton, { flex: 1, backgroundColor: '#aaa', marginLeft: 5, paddingHorizontal: 0 }]}>
              <Text style={styles.filterButtonText}>RESET</Text>
            </TouchableOpacity>
          </View>
          {showStartPicker && (
            <DateTimePicker
              value={startDate || new Date()}
              mode="date"
              display="default"
              onChange={(_, date) => {
                setShowStartPicker(false);
                if (date) setStartDate(date);
              }}
            />
          )}
          {showEndPicker && (
            <DateTimePicker
              value={endDate || new Date()}
              mode="date"
              display="default"
              onChange={(_, date) => {
                setShowEndPicker(false);
                if (date) setEndDate(date);
              }}
            />
          )}
          <Text style={styles.subtitle}>Historical exercise records</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#219ebc" style={{ marginVertical: 20 }} />
          ) : exerciseRecords.length === 0 ? (
            <Text style={styles.infoText}>No history record yet. </Text>
          ) : (
            exerciseRecords.map(record => (
              <View key={record.id} style={styles.recordItem}>
                <Text style={styles.recordText}>{record.exerciseType} - {record.duration} min - {record.distance} km - {record.caloriesBurned} kcal</Text>
                <Text style={styles.recordTime}>{new Date(record.createdAt).toLocaleString()}</Text>
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
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#023047',
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
  exerciseTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 10,
  },
  exerciseTypeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
    margin: 5,
  },
  selectedExerciseTypeButton: {
    backgroundColor: '#219ebc',
  },
  exerciseTypeButtonText: {
    color: '#023047',
    fontWeight: 'bold',
  },
  selectedExerciseTypeButtonText: {
    color: '#fff',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#219ebc',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  filterButton: {
    backgroundColor: '#219ebc',
    paddingVertical: 10,
    paddingHorizontal: 0,
    borderRadius: 12,
    marginLeft: 15,
    justifyContent: 'center',
    alignItems: 'center',
    height: 35,
    minWidth: 29,
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
    fontSize: 13,
  },
  recordItem: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f1faee',
    borderRadius: 12,
  },
  recordText: {
    fontSize: 16,
    color: '#023047',
    fontWeight: 'bold',
  },
  recordTime: {
    fontSize: 12,
    color: '#023047',
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#023047',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default ExerciseTrackingScreen;