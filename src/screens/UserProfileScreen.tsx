import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ScrollView, Alert, Switch } from 'react-native';

const UserProfileScreen = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('');
  const [height, setHeight] = useState(''); // cm
  const [weight, setWeight] = useState(''); // kg
  const [calorieGoal, setCalorieGoal] = useState('');
  const [exerciseGoal, setExerciseGoal] = useState('');
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const handleSaveProfile = () => {
    
    console.log('save user data:', { name, age, gender, height, weight, calorieGoal, exerciseGoal, biometricEnabled });
    Alert.alert('Success', 'Personal data saved！');
  };

  const handleBiometricToggle = () => {
    const newState = !biometricEnabled;
    setBiometricEnabled(newState);
    if (newState) {
      Alert.alert('Biometric Authentication', 'Fingerprint/Face Recognition is enabled.');
    } else {
      Alert.alert('Biometric Authentication', 'Fingerprint/Face Recognition is disabled.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Personal Information and Health Goals</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Name:</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Age:</Text>
          <TextInput
            style={styles.input}
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Gender:</Text>
          <TextInput
            style={styles.input}
            value={gender}
            onChangeText={setGender}
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Height (cm):</Text>
          <TextInput
            style={styles.input}
            value={height}
            onChangeText={setHeight}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Weight (kg):</Text>
          <TextInput
            style={styles.input}
            value={weight}
            onChangeText={setWeight}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Health Goals</Text>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Daily calorie goal (kcal):</Text>
          <TextInput
            style={styles.input}
            value={calorieGoal}
            onChangeText={setCalorieGoal}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Daily exercise duration goal (min):</Text>
          <TextInput
            style={styles.input}
            value={exerciseGoal}
            onChangeText={setExerciseGoal}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security Settings</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Enable biometric authentication (fingerprint/face):</Text>
          <Switch
            onValueChange={handleBiometricToggle}
            value={biometricEnabled}
          />
        </View>
        <Text style={styles.infoText}>Once turned on, you can use fingerprint or facial recognition to quickly log in and access apps.</Text>
      </View>

      <Button title="Save the Personal Data" onPress={handleSaveProfile} />

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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
    marginTop: 5,
  },
});

export default UserProfileScreen; 