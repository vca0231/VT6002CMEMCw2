import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert, RefreshControl, ScrollView, Image } from 'react-native';
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
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80' }}
          style={styles.backgroundImage}
          blurRadius={2}
        />
        <View style={styles.loadingContent}>
          <ActivityIndicator size="large" color="#219ebc" />
          <Text style={styles.loadingText}>Loading to-do items...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80' }}
        style={styles.backgroundImage}
        blurRadius={2}
      />
      <View style={styles.contentContainer}>
        <Text style={styles.header}>Home</Text>
        <View style={styles.card}>
          <FlatList
            data={data}
            renderItem={renderItem}
            keyExtractor={(item) => item.id}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
            ListEmptyComponent={<Text style={styles.emptyListText}>No To-Do List. Click the button below to add it! </Text>}
            style={styles.flatList}
          />
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Text style={styles.buttonText}>Add To-Do List</Text>
          </TouchableOpacity>
        </View>
        <ShowModal
          visible={modalVisible}
          setVisible={setModalVisible}
          onSubmit={(task: Omit<Task, 'id' | 'createdAt' | 'comments' | 'commentCount'>) => {
            handleAddTask(task);
            setModalVisible(false);
          }}
        />
      </View>
    </View>
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
    padding: 15,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#caf0f8',
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#023047',
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginTop: 40,
    textAlign: 'center',
    color: '#219ebc',
  },
  card: {
    flex: 1,
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
  itemContainer: {
    padding: 15,
    marginVertical: 8,
    backgroundColor: '#f1faee',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
    borderLeftWidth: 5,
    borderLeftColor: '#219ebc',
  },
  itemTitle: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#023047',
    marginBottom: 5,
  },
  description: {
    fontSize: 15,
    marginVertical: 5,
    color: '#023047',
  },
  meta: {
    fontSize: 13,
    color: '#023047',
    marginTop: 5,
  },
  addButton: {
    backgroundColor: '#219ebc',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 17,
    color: '#023047',
    fontStyle: 'italic',
  },
  flatList: {
    flex: 1,
  },
});

export default HomeScreen;
