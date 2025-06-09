import React, { useState, useEffect } from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';
import { View, Text, StyleSheet, TextInput, Button, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { API_BASE_URL } from '@env';
import { api } from '../services/api';


const DietRecordScreen = () => {
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [mealType, setMealType] = useState('breakfast');
  const [image, setImage] = useState<string | null>(null);
  const [dietRecords, setDietRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentUser: user } = useAuth();

  const fetchDietRecords = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const startStr = startDate ? startDate.toISOString() : undefined;
      const endStr = endDate ? endDate.toISOString() : undefined;
      const res = await api.getDietRecords(user.uid, startStr, endStr);
      if (res.success) setDietRecords(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDietRecords();
  }, [user]);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Insufficient permissions', 'Please allow the app to access the photo library to select images.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Insufficient permissions', 'Please allow the application to access the camera to take pictures.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setImage(result.assets[0].uri);
    }
  };

  const handleRecordDiet = async () => {
    if (!foodName || !calories) {
      Alert.alert('Input error', 'Please enter the food name and calories.');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'Please log in first.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/diet/record`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          foodName,
          calories: parseInt(calories),
          mealType,
          imageUrl: image || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        Alert.alert('Success', 'Diet record saved!');
        // Clear form
        setFoodName('');
        setCalories('');
        setImage(null);
        fetchDietRecords();
      } else {
        Alert.alert('Error', data.message || 'Save failed, please try again.')
      }
    } catch (error) {
      console.error('Diet record error:', error);
      Alert.alert('Error', 'Save failed, please check network connection and try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Record your diet</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Food name:</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter food name"
          value={foodName}
          onChangeText={setFoodName}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Calories (kcal):</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter calories"
          keyboardType="numeric"
          value={calories}
          onChangeText={setCalories}
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Meal type:</Text>
        <View style={styles.mealTypeContainer}>
          {['Breakfast', 'Lunch', 'Dinner', 'Snack'].map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.mealTypeButton, mealType === type && styles.selectedMealTypeButton]}
              onPress={() => setMealType(type)}
            >
              <Text style={[styles.mealTypeButtonText, mealType === type && styles.selectedMealTypeButtonText]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.imagePickerContainer}>
        <Text style={styles.label}>Food photos:</Text>
        <View style={styles.imageButtons}>
          <Button title="Pick from album" onPress={pickImage} />
          <View style={{ width: 10 }} />
          <Button title="Take Photo" onPress={takePhoto} />
        </View>
        {image && <Image source={{ uri: image }} style={styles.foodImage} />}
      </View>

      <Button title="Record Diet" onPress={handleRecordDiet} />

      {/* Here you can add a display area for historical diet records */}

      <View style={styles.historyContainer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
          <TouchableOpacity onPress={() => setShowStartPicker(true)} style={[styles.input, { flex: 1, marginRight: 5, justifyContent: 'center' }]}>
            <Text>{startDate ? startDate.toLocaleDateString() : 'Start Date'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowEndPicker(true)} style={[styles.input, { flex: 1, marginLeft: 5, justifyContent: 'center' }]}>
            <Text>{endDate ? endDate.toLocaleDateString() : 'End Date'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={fetchDietRecords} style={styles.filterButton}>
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
        <Text style={styles.subtitle}>Historical diet records</Text>
        {loading ? (
          <ActivityIndicator size="large" color="#007BFF" style={{ marginVertical: 20 }} />
        ) : dietRecords.length === 0 ? (
          <Text>No history records yet. </Text>
        ) : (
          dietRecords.map(record => (
            <View key={record.id} style={{ marginBottom: 10 }}>
              <Text>{record.foodName} - {record.calories} kcal - {record.mealType}</Text>
              <Text style={{ color: '#888', fontSize: 12 }}>{new Date(record.createdAt).toLocaleString()}</Text>
              {record.imageUrl ? (
                <Image
                  source={{ uri: record.imageUrl }}
                  style={{ width: 120, height: 80, borderRadius: 8, marginTop: 4 }}
                  resizeMode="cover"
                />
              ) : null}
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
  mealTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  mealTypeButton: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: '#e0e0e0',
  },
  selectedMealTypeButton: {
    backgroundColor: '#4CAF50',
  },
  mealTypeButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  selectedMealTypeButtonText: {
    color: '#fff',
  },
  imagePickerContainer: {
    marginBottom: 20,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  foodImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginTop: 10,
    resizeMode: 'cover',
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

export default DietRecordScreen; 