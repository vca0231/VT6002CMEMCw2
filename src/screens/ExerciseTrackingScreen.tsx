import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ScrollView, Alert, TouchableOpacity } from 'react-native';

const ExerciseTrackingScreen = () => {
  const [exerciseType, setExerciseType] = useState('Running');
  const [duration, setDuration] = useState(''); // minutes
  const [distance, setDistance] = useState(''); // km
  const [caloriesBurned, setCaloriesBurned] = useState('');

  const handleRecordExercise = () => {
    if (!exerciseType || !duration) {
      Alert.alert('Input error', 'Please enter the exercise type and duration.');
      return;
    }
    // Call the backend API here to record exercise
    console.log('Record exercise:', { exerciseType, duration, distance, caloriesBurned });
    Alert.alert('Success', 'Exercise record successful!');
    // Clear the form
    setDuration('');
    setDistance('');
    setCaloriesBurned('');
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

      {/* You can add a display area for historical exercise records here */}
      <View style={styles.historyContainer}>
        <Text style={styles.subtitle}>Historical Exercise Records</Text>
        {/* Assume that data will be loaded from the backend here */}
        <Text>No history record yet. </Text>
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
});

export default ExerciseTrackingScreen; 