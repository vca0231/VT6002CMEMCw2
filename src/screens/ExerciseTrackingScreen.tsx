import React, { useState, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { View, Text, StyleSheet, TextInput, Button, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const ExerciseTrackingScreen = () => {
  const [exerciseType, setExerciseType] = useState('Running');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [caloriesBurned, setCaloriesBurned] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [exerciseRecords, setExerciseRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentUser: user } = useAuth();

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
  }, [user]);

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
        caloriesBurned: caloriesBurned ? parseInt(caloriesBurned) : 0,
      });
      if (res.success) {
        Alert.alert('Success', 'Exercise record saved!');
        setDuration('');
        setDistance('');
        setCaloriesBurned('');
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
      <Text style={styles.title}>Record your exercise</Text>

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
        <Text style={styles.label}>Calories burned (kcal, optional):</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter calories burned"
          keyboardType="numeric"
          value={caloriesBurned}
          onChangeText={setCaloriesBurned}
        />
      </View>

      <Button title="Record Exercise" onPress={handleRecordExercise} />

      <View style={styles.historyContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <TouchableOpacity onPress={() => setShowStartPicker(true)} style={[styles.input, { flex: 1, marginRight: 5, justifyContent: 'center' }]}>
            <Text>{startDate ? startDate.toLocaleDateString() : 'Start Date'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowEndPicker(true)} style={[styles.input, { flex: 1, marginLeft: 5, justifyContent: 'center' }]}>
            <Text>{endDate ? endDate.toLocaleDateString() : 'End Date'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={fetchExerciseRecords} style={styles.filterButton}>
            <Text style={styles.filterButtonText}>FILTER</Text>
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
          <ActivityIndicator size="large" color="#007BFF" style={{ marginVertical: 20 }} />
        ) : exerciseRecords.length === 0 ? (
          <Text>No history record yet. </Text>
        ) : (
          exerciseRecords.map(record => (
            <View key={record.id} style={{ marginBottom: 10 }}>
              <Text>{record.exerciseType} - {record.duration} min - {record.distance} km - {record.caloriesBurned} kcal</Text>
              <Text style={{ color: '#888', fontSize: 12 }}>{new Date(record.createdAt).toLocaleString()}</Text>
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
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#555',
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
    backgroundColor: '#6200EE',
  },
  exerciseTypeButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  selectedExerciseTypeButtonText: {
    color: '#fff',
  },
  historyContainer: {
    marginTop: 30,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 20,
  },
  filterButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 5,
    marginLeft: 15,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    letterSpacing: 1,
    fontSize: 15,
  },
});

export default ExerciseTrackingScreen;