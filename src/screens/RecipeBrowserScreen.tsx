import React, { useState } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Modal, StyleSheet, Image, Alert, ScrollView } from 'react-native';
import axios from 'axios';

interface Meal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions: string;
}

const RecipeBrowserScreen = () => {
  const [query, setQuery] = useState('');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<Meal | null>(null);
  const [favorites, setFavorites] = useState<Meal[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const searchMeals = async () => {
    try {
      const response = await axios.get(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`);
      setMeals(response.data.meals || []);
    } catch (error) {
      Alert.alert('Error', 'Unable to obtain recipe data');
    }
  };

  const showMealDetail = (meal: Meal) => {
    setSelectedMeal(meal);
    setModalVisible(true);
  };

  const addToFavorites = (meal: Meal) => {
    if (!favorites.find(fav => fav.idMeal === meal.idMeal)) {
      setFavorites([...favorites, meal]);
      Alert.alert('Added to favorites', 'This recipe has been added to favorites');
    } else {
      Alert.alert('Reminder', 'This recipe is already in favorites');
    }
  };

  const renderHeader = () => (
    <View>
      <Text style={styles.title}>Recipe Browse</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter recipe name..."
          value={query}
          onChangeText={setQuery}
        />
        <Button title="Search" onPress={searchMeals} />
      </View>
      <Text style={styles.subtitle}>Favorites</Text>
      {favorites.length > 0 ? (
        <FlatList
          data={favorites}
          keyExtractor={item => item.idMeal}
          horizontal
          renderItem={({ item }) => (
            <View style={styles.favoriteItem}>
              <Image source={{ uri: item.strMealThumb }} style={styles.favoriteImage} />
              <Text style={styles.favoriteName}>{item.strMeal}</Text>
            </View>
          )}
          style={{ marginBottom: 16 }}
          showsHorizontalScrollIndicator={false}
        />
      ) : (
        <Text style={styles.emptyText}></Text>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recipe Browse</Text>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter recipe name..."
          value={query}
          onChangeText={setQuery}
        />
        <Button title="Search" onPress={searchMeals} />
      </View>
        <FlatList
        data={meals}
        keyExtractor={item => item.idMeal}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.mealItem} onPress={() => showMealDetail(item)}>
            <Image source={{ uri: item.strMealThumb }} style={styles.mealImage} />
            <Text style={styles.mealName}>{item.strMeal}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Please search for recipes</Text>}
        contentContainerStyle={{ paddingBottom: 50 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />
      <Text style={styles.subtitle}>Favorites</Text>
      <FlatList
        data={favorites}
        keyExtractor={item => item.idMeal}
        horizontal
        renderItem={({ item }) => (
          <View style={styles.favoriteItem}>
            <Image source={{ uri: item.strMealThumb }} style={styles.favoriteImage} />
            <Text style={styles.favoriteName}>{item.strMeal}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No collection yet</Text>}
        style={{ height: 100, marginBottom: 16 }}
        showsHorizontalScrollIndicator={false}
      />
      <Modal visible={modalVisible} animationType="slide" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContent}>
          {selectedMeal && (
            <ScrollView contentContainerStyle={{ alignItems: 'center', paddingBottom: 40 }}>
              <Image source={{ uri: selectedMeal.strMealThumb }} style={styles.modalImage} />
              <Text style={styles.modalTitle}>{selectedMeal.strMeal}</Text>
              <Text style={styles.modalInstructions}>{selectedMeal.strInstructions}</Text>
              <TouchableOpacity onPress={() => selectedMeal && addToFavorites(selectedMeal)} style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Favorites</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Close</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container:
  {
    flex: 1, 
    backgroundColor: '#f1faee',
    padding: 16
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#219ebc',
  },
  searchContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 8,
    marginRight: 8
  },
  mealItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 8,
    elevation: 2
  },
  mealImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12
  },
  mealName: { fontSize: 18, fontWeight: 'bold', color: '#023047' },
  emptyText: { textAlign: 'center', color: '#adb5bd', marginVertical: 16 },
  subtitle: { fontSize: 20, fontWeight: 'bold', color: '#457b9d', marginTop: 16, marginBottom: 8 },
  favoriteItem: { alignItems: 'center', marginRight: 12 },
  favoriteImage: { width: 50, height: 50, borderRadius: 8 },
  favoriteName: { fontSize: 14, color: '#023047', marginTop: 4 },
  modalContent: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 16 },
  modalImage: { width: 200, height: 200, borderRadius: 16, marginBottom: 16 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#219ebc', marginBottom: 12 },
  modalInstructions: { fontSize: 16, color: '#333', marginBottom: 16 },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    gap: 10,

  },
  actionButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    marginTop: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 2,
    width: '45%',
    height: 50,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 15,
  },
});

export default RecipeBrowserScreen; 