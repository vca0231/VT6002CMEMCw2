const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs
const { db } = require('./firebase'); // Import Firestore database instance from firebase.js
const { collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy } = require("firebase/firestore");
const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = require("firebase/auth"); // Import Firebase Auth
const admin = require('firebase-admin');
const { setDoc } = require("firebase/firestore");

const app = express();
const PORT = 3000;
const cors = require('cors');

app.use(cors());
app.use(bodyParser.json());

// Initialize Firebase Auth
const auth = getAuth();

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: "react-native-78f2e"
});

// Get all tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasksCollection = collection(db, 'tasks');
    const tasksSnapshot = await getDocs(tasksCollection);
    const tasks = tasksSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    res.json(tasks);
  } catch (error) {
    console.error("Error fetching tasks:", error);
    res.status(500).send("Failed to fetch tasks.");
  }
});

// Get a specific task by ID
app.get('/tasks/:id', async (req, res) => {
  try {
    const taskRef = doc(db, 'tasks', req.params.id);
    const taskDoc = await getDoc(taskRef);

    if (taskDoc.exists()) {
      res.json({ id: taskDoc.id, ...taskDoc.data() });
    } else {
      res.status(404).send('Task not found');
    }
  } catch (error) {
    console.error("Error fetching task:", error);
    res.status(500).send("Failed to fetch task.");
  }
});

// Create a new task
app.post('/tasks', async (req, res) => {
  const { title, description, user } = req.body; // Include user in the request body
  const newTask = {
    title,
    description,
    user: user || "default_user", // Default to "default_user" if user is not provided
    createdAt: new Date().toISOString(),
    comments: [],
    commentCount: 0,
  };

  try {
    const tasksCollection = collection(db, 'tasks');
    const taskRef = await addDoc(tasksCollection, newTask);
    res.status(201).json({ id: taskRef.id, ...newTask });
  } catch (error) {
    console.error("Error creating task:", error);
    res.status(500).send("Failed to create task.");
  }
});

// Update a task by ID
app.put('/tasks/:id', async (req, res) => {
  try {
    const taskRef = doc(db, 'tasks', req.params.id);
    const taskDoc = await getDoc(taskRef);

    if (taskDoc.exists()) {
      await updateDoc(taskRef, req.body);
      res.json({ id: req.params.id, ...req.body });
    } else {
      res.status(404).send('Task not found');
    }
  } catch (error) {
    console.error("Error updating task:", error);
    res.status(500).send("Failed to update task.");
  }
});

// Delete a task by ID
app.delete('/tasks/:id', async (req, res) => {
  try {
    const taskRef = doc(db, 'tasks', req.params.id);
    const taskDoc = await getDoc(taskRef);

    if (taskDoc.exists()) {
      await deleteDoc(taskRef);
      res.json({ id: req.params.id });
    } else {
      res.status(404).send('Task not found');
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    res.status(500).send("Failed to delete task.");
  }
});

// Get comments for a specific task
app.get('/tasks/:id/comments', async (req, res) => {
  try {
    const taskRef = doc(db, 'tasks', req.params.id);
    const taskDoc = await getDoc(taskRef);

    if (taskDoc.exists()) {
      res.json(taskDoc.data().comments || []);
    } else {
      res.status(404).send('Task not found');
    }
  } catch (error) {
    console.error("Error fetching comments:", error);
    res.status(500).send("Failed to fetch comments.");
  }
});

// Add a comment to a specific task
app.post('/tasks/:id/comments', async (req, res) => {
  const { title, user } = req.body; // Include user in the request body
  const newComment = {
    id: uuidv4(),
    title,
    user: user || "default_user", // Default to "default_user" if user is not provided
    createdAt: new Date().toISOString(),
  };

  try {
    const taskRef = doc(db, 'tasks', req.params.id);
    const taskDoc = await getDoc(taskRef);
    if (taskDoc.exists()) {
      const taskData = taskDoc.data();
      const updatedComments = [...(taskData.comments || []), newComment];
      await updateDoc(taskRef, {
        comments: updatedComments,
        commentCount: (taskData.commentCount || 0) + 1,
      });

      res.status(201).json(newComment);
    } else {
      res.status(404).send('Task not found');
    }
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).send("Failed to add comment.");
  }
});

// Delete a comment from a specific task
app.delete('/tasks/:taskId/comments/:commentId', async (req, res) => {
  try {
    const taskRef = doc(db, 'tasks', req.params.taskId);
    const taskDoc = await getDoc(taskRef);

    if (taskDoc.exists()) {
      const taskData = taskDoc.data();
      const updatedComments = (taskData.comments || []).filter(
        (comment) => comment.id !== req.params.commentId
      );

      if (updatedComments.length < (taskData.comments || []).length) {
        await updateDoc(taskRef, {
          comments: updatedComments,
          commentCount: updatedComments.length,
        });

        res.json({ id: req.params.commentId });
      } else {
        res.status(404).send('Comment not found');
      }
    } else {
      res.status(404).send('Task not found');
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).send("Failed to delete comment.");
  }
});

// --- New API Endpoints for Health Management App ---

// Record a new diet entry
app.post('/api/dietRecords', async (req, res) => {
  const { userId, foodName, calories, macros, photoUrl, mealType, timestamp } = req.body;

  if (!userId || !foodName || !calories || !timestamp) {
    return res.status(400).json({ success: false, message: 'Missing required diet record fields.' });
  }

  const newDietRecord = {
    userId,
    foodName,
    calories: parseFloat(calories),
    macros: macros || {}, // e.g., { protein: 10, carbs: 20, fat: 5 }
    photoUrl: photoUrl || null,
    mealType: mealType || 'other',
    timestamp: new Date(timestamp), // Ensure it's a Date object
    createdAt: new Date().toISOString(),
  };

  try {
    const dietRecordsCollection = collection(db, 'dietRecords');
    const docRef = await addDoc(dietRecordsCollection, newDietRecord);
    res.status(201).json({ id: docRef.id, ...newDietRecord });
  } catch (error) {
    console.error("Error recording diet entry:", error);
    res.status(500).send("Failed to record diet entry.");
  }
});

// Get all diet records of a user
app.get('/api/diet/records/:uid', async (req, res) => {
  const { uid } = req.params;
  const { startDate, endDate } = req.query;
  try {
    let dietQuery;
    if (startDate && endDate) {
      dietQuery = query(
        collection(db, 'dietRecords'),
        where('uid', '==', uid),
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate),
        orderBy('createdAt', 'desc')
      );
    } else {
      dietQuery = query(
        collection(db, 'dietRecords'),
        where('uid', '==', uid),
        orderBy('createdAt', 'desc')
      );
    }
    const snapshot = await getDocs(dietQuery);
    const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    console.error("Error in getting diet record:", error);
    res.status(500).json({ success: false, message: 'Failed to get diet record' });
  }
});

// --- User Management API Endpoints ---

// Get user profile by UID
app.get('/api/users/:uid', async (req, res) => {
  try {
    const userRef = doc(db, 'users', req.params.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      res.json({ id: userDoc.id, ...userDoc.data() });
    } else {
      res.status(404).json({ success: false, message: 'User not found' });
    }
  } catch (error) {
    console.error("Error fetching user profile:", error);
    res.status(500).send("Failed to fetch user profile.");
  }
});

// Update user profile by UID
app.put('/api/users/:uid', async (req, res) => {
  try {
    const userRef = doc(db, 'users', req.params.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      await updateDoc(userRef, req.body);
      res.json({ id: req.params.uid, ...req.body });
    } else {
      // If user does not exist, create a new profile (optional, based on your app's flow)
      // For a user profile, it's usually created upon registration.
      res.status(404).send('User not found, cannot update.');
    }
  } catch (error) {
    console.error("Error updating user profile:", error);
    res.status(500).send("Failed to update user profile.");
  }
});

// --- Exercise Tracking API Endpoints ---

// Record a new exercise entry
app.post('/api/exerciseTracking', async (req, res) => {
  const { userId, exerciseType, duration, distance, caloriesBurned, timestamp } = req.body;

  if (!userId || !exerciseType || !timestamp) {
    return res.status(400).json({ success: false, message: 'Missing required exercise record fields.' });
  }

  const newExerciseRecord = {
    userId,
    exerciseType,
    duration: parseFloat(duration) || 0,
    distance: parseFloat(distance) || 0,
    caloriesBurned: parseFloat(caloriesBurned) || 0,
    timestamp: new Date(timestamp),
    createdAt: new Date().toISOString(),
  };

  try {
    const exerciseRecordsCollection = collection(db, 'exerciseRecords');
    const docRef = await addDoc(exerciseRecordsCollection, newExerciseRecord);
    res.status(201).json({ id: docRef.id, ...newExerciseRecord });
  } catch (error) {
    console.error("Error recording exercise entry:", error);
    res.status(500).send("Failed to record exercise entry.");
  }
});

// Get a user's exercise record (optional date filtering)
app.get('/api/exercise/records/:uid', async (req, res) => {
  const { uid } = req.params;
  const { startDate, endDate } = req.query;
  try {
    let exerciseQuery;
    if (startDate && endDate) {
      exerciseQuery = query(
        collection(db, 'exerciseRecords'),
        where('uid', '==', uid),
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate),
        orderBy('createdAt', 'desc')
      );
    } else {
      exerciseQuery = query(
        collection(db, 'exerciseRecords'),
        where('uid', '==', uid),
        orderBy('createdAt', 'desc')
      );
    }
    const snapshot = await getDocs(exerciseQuery);
    const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, data: records });
  } catch (error) {
    console.error("Error in getting exercise records:", error);
    res.status(500).json({ success: false, message: 'Failed to get exercise records' });
  }
});

// Get daily exercise records for a specific user
app.get('/api/exerciseTracking/:uid/daily', async (req, res) => {
  const { date } = req.query; // Date in YYYY-MM-DD format
  const { uid } = req.params;

  if (!date) {
    return res.status(400).json({ success: false, message: 'Date parameter is required.' });
  }

  try {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23, 59, 59, 999);

    const q = query(
      collection(db, 'exerciseRecords'),
      where('userId', '==', uid),
      where('timestamp', '>=', startOfDay),
      where('timestamp', '<=', endOfDay),
      orderBy('timestamp', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const dailyRecords = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(dailyRecords);
  } catch (error) {
    console.error("Error fetching daily exercise records:", error);
    res.status(500).send("Failed to fetch daily exercise records.");
  }
});

// Get all historical exercise records for a specific user
app.get('/api/exerciseTracking/:uid/history', async (req, res) => {
  const { uid } = req.params;

  try {
    const q = query(
      collection(db, 'exerciseRecords'),
      where('userId', '==', uid),
      orderBy('timestamp', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const historyRecords = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(historyRecords);
  } catch (error) {
    console.error("Error fetching historical exercise records:", error);
    res.status(500).send("Failed to fetch historical exercise records.");
  }
});

// --- Statistical Analysis API Endpoints ---

// Get diet data trends for a specific user
app.get('/api/statistics/:uid/diet/trends', async (req, res) => {
  const { uid } = req.params;
  const { period } = req.query; // e.g., 'daily', 'weekly', 'monthly'

  try {
    let startDate = new Date();
    if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'monthly') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else { // default to daily
      startDate.setDate(startDate.getDate() - 1); // Last 24 hours
    }

    const q = query(
      collection(db, 'dietRecords'),
      where('userId', '==', uid),
      where('timestamp', '>=', startDate),
      orderBy('timestamp', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const trendData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // In a real application, you would aggregate this data further (e.g., sum calories per day)
    res.json(trendData);
  } catch (error) {
    console.error("Error fetching diet data trends:", error);
    res.status(500).send("Failed to fetch diet data trends.");
  }
});

// Get exercise data trends for a specific user
app.get('/api/statistics/:uid/exercise/trends', async (req, res) => {
  const { uid } = req.params;
  const { period } = req.query; // e.g., 'daily', 'weekly', 'monthly'

  try {
    let startDate = new Date();
    if (period === 'weekly') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'monthly') {
      startDate.setMonth(startDate.getMonth() - 1);
    } else { // default to daily
      startDate.setDate(startDate.getDate() - 1); // Last 24 hours
    }

    const q = query(
      collection(db, 'exerciseRecords'),
      where('userId', '==', uid),
      where('timestamp', '>=', startDate),
      orderBy('timestamp', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const trendData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // In a real application, you would aggregate this data further (e.g., sum duration per day)
    res.json(trendData);
  } catch (error) {
    console.error("Error fetching exercise data trends:", error);
    res.status(500).send("Failed to fetch exercise data trends.");
  }
});

// Get user's health goals and their completion status
app.get('/api/statistics/:uid/goals', async (req, res) => {
  const { uid } = req.params;

  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      // Assuming goals are stored directly in the user document or a subcollection
      res.json(userData.goals || {});
    } else {
      res.status(404).send('User not found');
    }
  } catch (error) {
    console.error("Error fetching user goals:", error);
    res.status(500).send("Failed to fetch user goals.");
  }
});

// --- Notification Reminders API Endpoints ---

// Set a new reminder for a user
app.post('/api/notifications/:uid', async (req, res) => {
  const { uid } = req.params;
  const { message, type, time, isActive } = req.body;

  if (!message || !type || !time) {
    return res.status(400).json({ success: false, message: 'Missing required notification fields.' });
  }

  const newReminder = {
    userId: uid,
    message,
    type, // e.g., 'diet', 'exercise', 'general'
    time, // e.g., '08:00', '12:30'
    isActive: isActive !== undefined ? isActive : true,
    createdAt: new Date().toISOString(),
  };

  try {
    const remindersCollection = collection(db, 'reminders');
    const docRef = await addDoc(remindersCollection, newReminder);
    res.status(201).json({ id: docRef.id, ...newReminder });
  } catch (error) {
    console.error("Error setting notification reminder:", error);
    res.status(500).send("Failed to set notification reminder.");
  }
});

// Get all reminders for a specific user
app.get('/api/notifications/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    const q = query(
      collection(db, 'reminders'),
      where('userId', '==', uid),
      orderBy('createdAt', 'asc')
    );

    const querySnapshot = await getDocs(q);
    const userReminders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(userReminders);
  } catch (error) {
    console.error("Error fetching user reminders:", error);
    res.status(500).send("Failed to fetch user reminders.");
  }
});

// --- Location Services API Endpoints ---

// Get nearby healthy restaurant recommendations
app.get('/api/location/restaurants', async (req, res) => {
  const { latitude, longitude, radius } = req.query; // Radius in meters

  if (!latitude || !longitude) {
    return res.status(400).json({ success: false, message: 'Latitude and longitude are required.' });
  }

  // In a real application, you would integrate with a third-party API like Google Places API here
  // For now, let's return some mock data.
  const mockRestaurants = [
    {
      id: '1',
      name: 'Healthy Bites Cafe',
      address: '123 Health St, City',
      cuisine: 'Healthy',
      rating: 4.5,
      latitude: parseFloat(latitude) + 0.001,
      longitude: parseFloat(longitude) + 0.001,
    },
    {
      id: '2',
      name: 'Green Leaf Eatery',
      address: '456 Green Ave, Town',
      cuisine: 'Vegan',
      rating: 4.8,
      latitude: parseFloat(latitude) - 0.002,
      longitude: parseFloat(longitude) + 0.003,
    },
  ];

  // Filter by radius (simple approximation for mock data)
  const filteredRestaurants = mockRestaurants.filter(restaurant => {
    const dist = Math.sqrt(Math.pow(restaurant.latitude - parseFloat(latitude), 2) + Math.pow(restaurant.longitude - parseFloat(longitude), 2));
    // Convert simple degree difference to approximate meters for filtering. This is a very rough estimate.
    // A more accurate calculation would use Haversine formula.
    const approximateDistanceMeters = dist * 111139; // Roughly meters per degree of latitude/longitude
    return !radius || approximateDistanceMeters <= parseFloat(radius);
  });

  res.json(filteredRestaurants);
});

// Login or Register Endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const customToken = await admin.auth().createCustomToken(userCredential.user.uid);
    res.status(200).json({ success: true, token: customToken, uid: userCredential.user.uid });
  } catch (error) {
    console.error("Login error:", error);
    res.status(401).json({ message: error.message });
  }
});

// Register Endpoint
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const customToken = await admin.auth().createCustomToken(userCredential.user.uid);
    res.status(201).json({ success: true, token: customToken, uid: userCredential.user.uid });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ message: error.message });
  }
});

// Add the following API endpoints in server.js

// 1. User Profile API
app.post('/api/user/profile', async (req, res) => {
  const { uid, ...profileData } = req.body;


  const cleanProfileData = Object.fromEntries(
    Object.entries(profileData).filter(([_, v]) => v !== undefined)
  );

  try {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      await updateDoc(userRef, {
        ...cleanProfileData,
        updatedAt: new Date().toISOString()
      });
    } else {
      await setDoc(userRef, {
        ...cleanProfileData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    }
    res.status(200).json({ success: true, message: 'User profile updated' });
  } catch (error) {
    console.error("Update user profile error:", error);
    res.status(500).json({ success: false, message: 'Update user profile failed' });
  }
});

// 2. Diet Record API
app.post('/api/diet/record', async (req, res) => {
  const { uid, foodName, calories, mealType, imageUrl } = req.body;

  try {
    const dietRef = collection(db, 'dietRecords');
    const newDietRecord = {
      uid,
      foodName,
      calories: parseInt(calories),
      mealType,
      imageUrl,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(dietRef, newDietRecord);
    res.status(201).json({ success: true, id: docRef.id, ...newDietRecord });
  } catch (error) {
    console.error("Diet record error:", error);
    res.status(500).json({ success: false, message: 'Diet record failed' });
  }
});

// 3. Exercise record API
app.post('/api/exercise/record', async (req, res) => {
  const { uid, exerciseType, duration, distance, caloriesBurned } = req.body;

  try {
    const exerciseRef = collection(db, 'exerciseRecords');
    const newExerciseRecord = {
      uid,
      exerciseType,
      duration: parseInt(duration),
      distance: parseFloat(distance),
      caloriesBurned: parseInt(caloriesBurned),
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(exerciseRef, newExerciseRecord);
    res.status(201).json({ success: true, id: docRef.id, ...newExerciseRecord });
  } catch (error) {
    console.error("Record exercise error:", error);
    res.status(500).json({ success: false, message: 'Record exercise failed' });
  }
});

// 4. Reminder Notification API
app.post('/api/notifications', async (req, res) => {
  const { uid, message, time, type } = req.body;

  try {
    const notificationRef = collection(db, 'notifications');
    const newNotification = {
      uid,
      message,
      time,
      type,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    const docRef = await addDoc(notificationRef, newNotification);
    res.status(201).json({ success: true, id: docRef.id, ...newNotification });
  } catch (error) {
    console.error("Error in creating reminder:", error);
    res.status(500).json({ success: false, message: 'Failed to create reminder' });
  }
});

// 5. Data Management API
app.post('/api/data/sync', async (req, res) => {
  const { uid, lastSyncTime } = req.body;

  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, {
      lastSyncTime: new Date().toISOString()
    });
    res.status(200).json({ success: true, message: 'Data synchronization successful' });
  } catch (error) {
    console.error("Error in data synchronization:", error);
    res.status(500).json({ success: false, message: 'Data synchronization failed' });
  }
});

// 6. Statistics API
app.get('/api/statistics/:uid', async (req, res) => {
  const { uid } = req.params;
  const { startDate, endDate } = req.query;

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Get diet records
    const dietQuery = query(
      collection(db, 'dietRecords'),
      where('uid', '==', uid),
      where('createdAt', '>=', start),
      where('createdAt', '<=', end)
    );
    const dietSnapshot = await getDocs(dietQuery);
    const dietRecords = dietSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Get exercise records
    const exerciseQuery = query(
      collection(db, 'exerciseRecords'),
      where('uid', '==', uid),
      where('createdAt', '>=', start),
      where('createdAt', '<=', end)
    );
    const exerciseSnapshot = await getDocs(exerciseQuery);
    const exerciseRecords = exerciseSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.status(200).json({
      success: true,
      data: {
        dietRecords,
        exerciseRecords
      }
    });
  } catch (error) {
    console.error("Error in getting statistical data:", error);
    res.status(500).json({ success: false, message: 'Failed to get statistics' });
  }
});

// 7. Get all user reminders
app.get('/api/notifications/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    const notificationQuery = query(
      collection(db, 'notifications'),
      where('uid', '==', uid),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(notificationQuery);
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error("Error getting reminder:", error);
    res.status(500).json({ success: false, message: 'Failed to get reminder' });
  }
});

// 8. Delete reminder
app.delete('/api/notifications/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await deleteDoc(doc(db, 'notifications', id));
    res.status(200).json({ success: true, message: 'Reminder deleted successfully' });
  } catch (error) {
    console.error("Delete reminder error:", error);
    res.status(500).json({ success: false, message: 'Reminder deleted failed' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});