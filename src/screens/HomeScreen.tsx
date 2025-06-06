import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, RefreshControl, ScrollView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ShowModal from './ShowModal';
import { RootStackParamList, BottomTabParamList } from '../../types/navigation'; // Corrected import path
import { Task } from '../../types/data'; // Corrected import path
import { API_BASE_URL } from '@env'; // Ensure you have this set up in your .env file

// Define the navigation type of HomeScreen, allowing navigation to screens in the bottom tab and screens in the stack navigator
type HomeScreenNavigationProp = NavigationProp<BottomTabParamList, 'HomeTab'> &
  NavigationProp<RootStackParamList>;

const API_URL = API_BASE_URL; // Temporarily hard-coded, please modify according to the actual backend address

const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>(); // Use type parameters

  const [data, setData] = useState<Task[]>([]); // Explicitly specify data types
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tasks`);
      const result: Task[] = await response.json(); // Explicitly specify the type
      setData(result);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      Alert.alert('Error', 'Failed to fetch tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddTask = async (newTask: Omit<Task, 'id' | 'createdAt' | 'comments' | 'commentCount'>) => {
    try {
      const user = await AsyncStorage.getItem('loggedInUser'); // Retrieve the logged-in user's email
      if (!user) {
        Alert.alert('Error', 'No logged-in user found. Please log in again.');
        return;
      }

      const taskWithUser = { ...newTask, user }; // Include the user in the task data
      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskWithUser),
      });

      if (!response.ok) {
        throw new Error('Failed to add task');
      }

      const createdTask: Task = await response.json(); // Explicitly specify the type
      setData((prevData) => [...prevData, createdTask]);
    } catch (error) {
      console.error("Failed to add task:", error);
      Alert.alert('Error', 'Failed to add task. Please try again later.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const handleTaskPress = (task: Task) => {
    // Navigate to Comments screen in the root stack
    navigation.navigate('Comments', {
      id: task.id,
      title: task.title,
    });
  };

  const renderItem = ({ item }: { item: Task }) => {
    const date = new Date(item.createdAt);
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString();

    return (
      <TouchableOpacity style={styles.itemContainer} onPress={() => handleTaskPress(item)}>
        <Text style={styles.itemTitle}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.meta}>
          {item.user && `By: ${item.user} - `}Comments: {item.commentCount}
        </Text>
        <Text style={styles.meta}>{formattedDate} {formattedTime}</Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading to-do items...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My To-Do List</Text>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id} // Use item.id as key
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
        ListEmptyComponent={<Text style={styles.emptyListText}>No To-Do List. Click the button below to add it! </Text>}
        style={styles.flatList}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.buttonText}>Add To-Do List</Text>
      </TouchableOpacity>
      <ShowModal
        visible={modalVisible}
        setVisible={setModalVisible}
        onSubmit={(task: Omit<Task, 'id' | 'createdAt' | 'comments' | 'commentCount'>) => {
          handleAddTask(task);
          setModalVisible(false);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15, // Adjusted padding for cleaner look
    backgroundColor: '#eef2f7', // Lighter background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eef2f7',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    fontSize: 26, // Slightly smaller
    fontWeight: 'bold',
    marginBottom: 20, // More spacing
    textAlign: 'center',
    color: '#333',
    textShadowColor: 'rgba(0, 0, 0, 0.1)', // Subtle shadow
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  itemContainer: {
    padding: 15, // Increased padding
    marginVertical: 8, // More vertical spacing
    backgroundColor: '#fff',
    borderRadius: 12, // More rounded corners
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 }, // More pronounced shadow
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4, // Android shadow
    borderLeftWidth: 5, // A color bar on the left
    borderLeftColor: '#4CAF50', // Green accent
  },
  itemTitle: {
    fontSize: 19, // Slightly larger
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  description: {
    fontSize: 15, // Slightly larger
    marginVertical: 5,
    color: '#555',
  },
  meta: {
    fontSize: 13, // Slightly larger
    color: '#777',
    marginTop: 5,
  },
  addButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 14, // Taller button
    borderRadius: 10, // More rounded
    alignItems: 'center',
    marginTop: 20, // More spacing from list
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18, // Larger text
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 30, // More spacing
    fontSize: 17, // Larger text
    color: '#777',
    fontStyle: 'italic',
  },
  flatList: {
    flex: 1,
  },
});

export default HomeScreen;
