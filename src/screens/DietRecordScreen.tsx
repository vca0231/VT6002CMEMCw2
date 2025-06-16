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
  const [showStartPicker, setShowStartPicker] = useState(true);
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

  const handleResetFilter = () => {
    setStartDate(null);
    setEndDate(null);
  };

  useEffect(() => {
    fetchDietRecords();
  }, [user, startDate, endDate]);

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
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80' }}
        style={styles.backgroundImage}
        blurRadius={2}
      />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Record your diet</Text>

        <View style={styles.card}>
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
            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
                <Text style={styles.actionButtonText}>Pick from album</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
                <Text style={styles.actionButtonText}>Take Photo</Text>
              </TouchableOpacity>
            </View>
            {image && <Image source={{ uri: image }} style={styles.foodImage} />}
          </View>

          <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={[styles.actionButton, { flex: 1 }]} onPress={handleRecordDiet}>
              <Text style={styles.actionButtonText}>Record Diet</Text>
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
            <TouchableOpacity onPress={fetchDietRecords} style={[styles.filterButton, { flex: 1, marginLeft: 5, paddingHorizontal: 0 }]}>
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
          <Text style={styles.subtitle}>Historical diet records</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#219ebc" style={{ marginVertical: 20 }} />
          ) : dietRecords.length === 0 ? (
            <Text style={styles.infoText}>No history records yet. </Text>
          ) : (
            dietRecords.map(record => (
              <View key={record.id} style={styles.recordItem}>
                <Text style={styles.recordText}>{record.foodName} - {record.calories} kcal - {record.mealType}</Text>
                <Text style={styles.recordTime}>{new Date(record.createdAt).toLocaleString()}</Text>
                {record.imageUrl ? (
                  <Image
                    source={{ uri: record.imageUrl }}
                    style={styles.recordImage}
                    resizeMode="cover"
                  />
                ) : null}
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
    backgroundColor: '#219ebc',
  },
  mealTypeButtonText: {
    color: '#023047',
    fontWeight: 'bold',
  },
  selectedMealTypeButtonText: {
    color: '#fff',
  },
  imagePickerContainer: {
    marginBottom: 20,
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
  foodImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginTop: 10,
    resizeMode: 'cover',
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
  recordImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#023047',
    textAlign: 'center',
    marginTop: 10,
  },
});

export default DietRecordScreen; 