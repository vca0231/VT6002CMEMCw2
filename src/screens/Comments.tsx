import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage
import { API_BASE_URL } from '@env';


const Comments = ({ route }) => {
  const { id, title } = route.params;
  const API_URL = API_BASE_URL

  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/tasks/${id}/comments`);
      if (!response.ok) {
        throw new Error('Failed to fetch comments');
      }
      const result = await response.json();
      setComments(result);
    } catch (error) {
      console.error("Failed to fetch comments:", error);
      Alert.alert('Error', 'Failed to fetch comments. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'Comment cannot be empty.');
      return;
    }

    try {
      // Retrieve the logged-in user's email from AsyncStorage
      const user = await AsyncStorage.getItem('loggedInUser');
      if (!user) {
        Alert.alert('Error', 'No logged-in user found. Please log in again.');
        return;
      }

      const response = await fetch(`${API_URL}/tasks/${id}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: newComment, user }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      const createdComment = await response.json();
      setComments((prev) => [...prev, createdComment]);
      setNewComment('');
    } catch (error) {
      console.error("Failed to add comment:", error);
      Alert.alert('Error', 'Failed to add comment. Please try again later.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{title}</Text>
      <FlatList
        data={comments}
        keyExtractor={(item) => item.id || Math.random().toString()} // Ensure a unique key
        renderItem={({ item }) => (
          <View style={styles.commentItem}>
            <Text style={styles.commentText}>{item.title}</Text>
            <Text style={styles.commentMeta}>By: {item.user}</Text>
          </View>
        )}
      />
      <TextInput
        style={styles.input}
        placeholder="Add a comment"
        value={newComment}
        onChangeText={setNewComment}
      />
      <TouchableOpacity style={styles.button} onPress={handleAddComment}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  commentItem: {
    padding: 10,
    marginBottom: 5,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    backgroundColor: '#f9f9f9',
  },
  commentText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  commentMeta: {
    fontSize: 12,
    color: '#888',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    padding: 10,
    backgroundColor: '#007BFF',
    alignItems: 'center',
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default Comments;
