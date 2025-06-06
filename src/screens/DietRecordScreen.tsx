import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Button, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

const DietRecordScreen = () => {
  const [foodName, setFoodName] = useState('');
  const [calories, setCalories] = useState('');
  const [mealType, setMealType] = useState('breakfast');
  const [image, setImage] = useState<string | null>(null);

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

  const handleRecordDiet = () => {
    if (!foodName || !calories) {
      Alert.alert('Input error', 'Please enter the food name and calories.');
      return;
    }
    // Call the backend API here to record diet
    console.log('Record diet:', { foodName, calories, mealType, image });
    Alert.alert('Success', 'Diet record successful!');
    // Clear the form
    setFoodName('');
    setCalories('');
    setImage(null);
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
        <Text style={styles.subtitle}>Historical diet records</Text>
        {/* Assume that data will be loaded from the backend here */}
        <Text>No history records yet. </Text>
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
});

export default DietRecordScreen; 