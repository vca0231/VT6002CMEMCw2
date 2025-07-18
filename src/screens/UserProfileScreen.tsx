import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ScrollView, Alert, Switch, ActivityIndicator, TouchableOpacity, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import ReactNativeBiometrics from 'react-native-biometrics';
import { Picker } from '@react-native-picker/picker';

const rnBiometrics = new ReactNativeBiometrics();

const UserProfileScreen = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [height, setHeight] = useState(''); // cm
  const [weight, setWeight] = useState(''); // kg
  const [calorieGoal, setCalorieGoal] = useState('');
  const [exerciseGoal, setExerciseGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const { currentUser: user, isBiometricEnabled, toggleBiometric } = useAuth();
  const [showGenderPicker, setShowGenderPicker] = useState(false);

  // Pull user information
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const res = await api.getUserProfile(user.uid);
        if (res && res.id) {
          setName(res.name || '');
          setAge(res.age ? String(res.age) : '');
          setGender(res.gender || 'male');
          setHeight(res.height ? String(res.height) : '');
          setWeight(res.weight ? String(res.weight) : '');
          setCalorieGoal(res.calorieGoal ? String(res.calorieGoal) : '');
          setExerciseGoal(res.exerciseGoal ? String(res.exerciseGoal) : '');
        }
      } catch (e) {
        Alert.alert('Error', 'Unable to obtain personal information, please try again later');
      }
      setLoading(false);
      setHasFetched(true);
    };
    fetchProfile();
  }, [user]);

  const handleSaveProfile = async () => {
    if (!user) {
      Alert.alert('Error', 'Please log in first.');
      return;
    }
    setLoading(true);
    const profileData = { name, age, gender, height, weight, calorieGoal, exerciseGoal };
    const res = await api.updateUserProfile(user.uid, profileData);
    setLoading(false);
    if (res.success) {
      Alert.alert('Success', 'Personal data saved!');
      console.log('Profile updated:', res);
    } else {
      Alert.alert('Error', res.message || 'Save failed.');
    }
  };

  const checkBiometricSupport = async () => {
    try {
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
      if (!available) {
        Alert.alert('prompt', 'Your device does not support biometrics');
        return false;
      }
      return true;
    } catch (error) {
     // console.error('Biometric check error:', error);
      return false;
    }
  };

/*   const handleBiometricToggle = async () => {
    const isSupported = await checkBiometricSupport();
    if (!isSupported) {
      toggleBiometric(false);
      return;
    }

    if (!isBiometricEnabled) {
      try {
        const { success } = await rnBiometrics.simplePrompt({
          promptMessage: 'Please verify your identity to enable biometrics',
          cancelButtonText: 'Cancel'
        });

        if (success) {
          await toggleBiometric(true);
          Alert.alert('Success', 'Biometric authentication enabled');
        }
      } catch (error) {
        console.error('Biometric verification error:', error);
        Alert.alert('Error', 'Biometric verification failed');
      }
    } else {
      await toggleBiometric(false);
      Alert.alert('Success', 'Biometric authentication disabled');
    }
  };
 */
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Personal Information and{'\n'} Health Goals</Text>
      <>
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
            <TouchableOpacity 
              style={styles.pickerButton} 
              onPress={() => setShowGenderPicker(!showGenderPicker)}
            >
              <Text style={styles.pickerButtonText}>
                {gender === 'male' ? 'Male' : gender === 'female' ? 'Female' : ''}
              </Text>
            </TouchableOpacity>
            {showGenderPicker && (
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={gender}
                  onValueChange={(itemValue) => {
                    setGender(itemValue);
                    setShowGenderPicker(false);
                  }}
                  style={styles.picker}
                  itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Male" value="male" />
                  <Picker.Item label="Female" value="female" />
                </Picker>
              </View>
            )}
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
          <View style={styles.securityRow}>
            <Text style={styles.label}>Enable biometric authentication (fingerprint/face):</Text>
            <Switch
         /*      onValueChange={handleBiometricToggle} */
              value={isBiometricEnabled}
            />
          </View>
          <Text style={styles.infoText}>
            Once enabled, you can use fingerprint or facial recognition to quickly log in to the app.
          </Text>
        </View>

        <View style={styles.actionButtonsRow}>
          <TouchableOpacity style={[styles.actionButton, { flex: 1 }]} onPress={handleSaveProfile}>
            <Text style={styles.actionButtonText}>Save the Personal Data</Text>
          </TouchableOpacity>
        </View>
      </>
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
  securityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#888',
    lineHeight: 20,
    marginTop: 5,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
  pickerButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    padding: 12,
    backgroundColor: '#fff',
    marginBottom: 5,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#333',
  },
  pickerContainer: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  picker: {
    height: 120,
    width: '100%',
    marginTop: -15,
  },
  pickerItem: {
    height: 150,
    fontSize: 16,
  },
});

export default UserProfileScreen; 