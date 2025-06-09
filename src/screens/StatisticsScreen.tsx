import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Button, Alert, Modal, TextInput, Platform, ActivityIndicator } from 'react-native';
import { LineChart, BarChart } from "react-native-chart-kit";
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';



function calculateBMR(weight: number, height: number, age: number, gender: string): number {
  if (gender === 'male') {
    return 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    return 10 * weight + 6.25 * height - 5 * age - 161;
  }
}

function calculateTDEE(bmr: number, activityLevel: number = 1.4): number {
  return bmr * activityLevel;
}

/**
 * Recommended Target
 * @param {number} currentWeight
 * @param {number} targetWeight
 * @param {number} height
 * @param {number} age
 * @param {'male'|'female'} gender
 * @param {number} activityLevel
 * @param {number} weeks
 */
function recommendGoals(
  currentWeight: number,
  targetWeight: number,
  height: number,
  age: number,
  gender: string,
  activityLevel: number = 1.4,
  weeks: number = 4
): { calorieGoal: number; exerciseGoal: number } {
  const bmr = calculateBMR(currentWeight, height, age, gender);
  const tdee = calculateTDEE(bmr, activityLevel);
  const totalChange = targetWeight - currentWeight; // Negative number means weight loss
  const days = weeks * 7;
  const dailyCalorieChange = (totalChange * 7700) / days;
  const calorieGoal = tdee + dailyCalorieChange;
  const exerciseGoal = 30; // For example, 30 minutes a day
  return { calorieGoal: Math.round(calorieGoal), exerciseGoal };
}

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientTo: "#fff",
  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(0,0,0,${opacity})`,
  strokeWidth: 2,
  barPercentage: 0.7,
  useShadowColorFromDataset: false
};

const getWeekDates = () => {
  const now = new Date();
  const week = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    week.push(d);
  }
  return week;
};

const StatisticsScreen = () => {
  const { currentUser: user } = useAuth();
  const [dietRecords, setDietRecords] = useState<any[]>([]);
  const [exerciseRecords, setExerciseRecords] = useState<any[]>([]);
  const [goal, setGoal] = useState({
    calorieGoal: 2000,
    exerciseGoal: 45,
    weightGoal: 60,
    currentWeight: 65,
    gender: 'male',
    age: 25,
    height: 170
  });
  const [loading, setLoading] = useState(true);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [goalInput, setGoalInput] = useState({ calorieGoal: '', exerciseGoal: '', weightGoal: '' });
  const screenWidth = Dimensions.get("window").width;
  const [recommendWeeks, setRecommendWeeks] = useState('4');

  // Get the start and end dates of this week
  const weekDates = getWeekDates();
  const weekStart = new Date(weekDates[0]);
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekDates[6]);
  weekEnd.setHours(23, 59, 59, 999);

  // Pull data
  useEffect(() => {
    if (!user) return;
    const fetchAll = async () => {
      setLoading(true);
      // Get the goal
      const profile = await api.getUserProfile(user.uid);
      setGoal({
        calorieGoal: profile.calorieGoal || 2000,
        exerciseGoal: profile.exerciseGoal || 45,
        weightGoal: profile.weightGoal || 60,
        currentWeight: profile.weight || 65,
        gender: profile.gender || 'male',
        age: profile.age || 25,
        height: profile.height || 170
      });
      // Get diet
      const dietRes = await api.getDietRecords(user.uid, weekStart.toISOString(), weekEnd.toISOString());
      setDietRecords(dietRes.data || []);
      // Get motion
      const exerciseRes = await api.getExerciseRecords(user.uid, weekStart.toISOString(), weekEnd.toISOString());
      setExerciseRecords(exerciseRes.data || []);
      setLoading(false);
    };
    fetchAll();
  }, [user]);

  // Count calories and exercise time for each day of this week
  const weekLabels = weekDates.map(d => `${d.getMonth() + 1}/${d.getDate()}`);
  const dietData = weekDates.map(date => {
    const day = date.toISOString().slice(0, 10);
    const total = dietRecords
      .filter(r => r.createdAt && r.createdAt.slice(0, 10) === day)
      .reduce((sum, r) => sum + (r.calories || 0), 0);
    return total;
  });
  const exerciseData = weekDates.map(date => {
    const day = date.toISOString().slice(0, 10);
    const total = exerciseRecords
      .filter(r => r.createdAt && r.createdAt.slice(0, 10) === day)
      .reduce((sum, r) => sum + (r.duration || 0), 0);
    return total;
  });

  // Count the number of days to reach the goal
  const calorieGoalDays = dietData.filter(v => v > 0 && v <= goal.calorieGoal).length;
  const exerciseGoalDays = exerciseData.filter(v => v >= goal.exerciseGoal).length;

  // Average value
  const avgCalorie = dietData.reduce((a, b) => a + b, 0) / 7;
  const avgExercise = exerciseData.reduce((a, b) => a + b, 0) / 7;

  // Modify the goal
  const handleSaveGoal = async () => {
    if (!user) return;
    const newGoal = {
      calorieGoal: goalInput.calorieGoal ? parseInt(goalInput.calorieGoal) : goal.calorieGoal,
      exerciseGoal: goalInput.exerciseGoal ? parseInt(goalInput.exerciseGoal) : goal.exerciseGoal,
      weightGoal: goalInput.weightGoal ? parseFloat(goalInput.weightGoal) : goal.weightGoal,
    };
    await api.updateUserProfile(user.uid, newGoal);
    setGoal({ ...goal, ...newGoal });
    setShowGoalModal(false);
    Alert.alert('Success', 'Target updated');
  };

  const handleRecommendGoal = () => {

    const { currentWeight, height, age, gender } = goal;
    const targetWeight = parseFloat(goalInput.weightGoal) || goal.weightGoal;
    const weeks = parseInt(recommendWeeks) || 4;
    if (!currentWeight || !height || !age || !gender || !targetWeight) {
      Alert.alert('Please complete your personal information and target weight first');
      return;
    }
    const { calorieGoal, exerciseGoal } = recommendGoals(
      Number(currentWeight),
      Number(targetWeight),
      Number(height),
      Number(age),
      gender,
      1.4,
      weeks
    );
    setGoalInput({
      ...goalInput,
      calorieGoal: calorieGoal.toString(),
      exerciseGoal: exerciseGoal.toString(),
    });
  };

  if (loading) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#007BFF" /></View>;
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Health Data Statistics & Analysis</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dietary Trends (This Week)</Text>
        <BarChart
          data={{
            labels: weekLabels,
            datasets: [{ data: dietData }]
          }}
          width={screenWidth - 60}
          height={220}
          yAxisSuffix="kcal"
          chartConfig={chartConfig}
          fromZero yAxisLabel={''} />
        <Text style={styles.infoText}>Average: {avgCalorie.toFixed(0)} kcal / day</Text>
        <Text style={styles.infoText}>Goal: {goal.calorieGoal} kcal</Text>
        <Text style={styles.infoText}>Number of days to achieve goal: {calorieGoalDays} / 7</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Exercise Trends (This Week)</Text>
        <BarChart
          data={{
            labels: weekLabels,
            datasets: [{ data: exerciseData }]
          }}
          width={screenWidth - 60}
          height={220}
          yAxisSuffix="min"
          chartConfig={chartConfig}
          fromZero yAxisLabel={''} />
        <Text style={styles.infoText}>Average: {avgExercise.toFixed(0)} min / day</Text>
        <Text style={styles.infoText}>Goal: {goal.exerciseGoal} min</Text>
        <Text style={styles.infoText}>Number of days to achieve the standard: {exerciseGoalDays} / 7</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Weight Goal</Text>
        <Text style={styles.infoText}>Current: {goal.currentWeight} kg</Text>
        <Text style={styles.infoText}>Goal: {goal.weightGoal} kg</Text>
        <Text style={styles.infoText}>Gap: {(goal.currentWeight - goal.weightGoal).toFixed(1)} kg</Text>
      </View>

      <View style={styles.section}>
        <Button title="Set/Modify Target" onPress={() => setShowGoalModal(true)} />
      </View>

      <Modal visible={showGoalModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.sectionTitle}>Set/Modify Target</Text>
            <Text style={styles.inputLabel}>Weight Goal (kg)</Text>
            <TextInput
              style={[styles.input, styles.inputLarge]}
              placeholder={`Weight Goal (current: ${goal.weightGoal})`}
              keyboardType="numeric"
              value={goalInput.weightGoal}
              onChangeText={v => setGoalInput({ ...goalInput, weightGoal: v })}
            />
            <Text style={styles.inputLabel}>Target Period (weeks)</Text>
            <TextInput
              style={[styles.input, styles.inputLarge]}
              placeholder="Target period (weeks) such as 4"
              keyboardType="numeric"
              value={recommendWeeks}
              onChangeText={setRecommendWeeks}
            />
            <Button title="One-click recommendation goal" onPress={handleRecommendGoal} />
            <Text style={styles.inputLabel}>Recommended Calorie Goal (kcal/day)</Text>
            <TextInput
              style={[styles.input, styles.inputLarge]}
              placeholder={`Calorie Goal (current: ${goal.calorieGoal})`}
              keyboardType="numeric"
              value={goalInput.calorieGoal}
              onChangeText={v => setGoalInput({ ...goalInput, calorieGoal: v })}
            />
            <Text style={styles.inputLabel}>Recommended Exercise Goal (min/day)</Text>
            <TextInput
              style={[styles.input, styles.inputLarge]}
              placeholder={`Exercise Goal (current: ${goal.exerciseGoal})`}
              keyboardType="numeric"
              value={goalInput.exerciseGoal}
              onChangeText={v => setGoalInput({ ...goalInput, exerciseGoal: v })}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 }}>
              <Button title="Save" onPress={handleSaveGoal} />
              <Button title="Cancel" color="#888" onPress={() => setShowGoalModal(false)} />
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f8f8f8',
    ...(Platform.OS === 'web' && {
      height: '100%'
    })
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
  infoText: {
    fontSize: 15,
    color: '#555',
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    fontSize: 16,
    marginBottom: 10,
  },
  inputLarge: { height: 48 },
  inputLabel: { fontSize: 15, color: '#444', marginBottom: 4, marginTop: 10, fontWeight: 'bold' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    alignItems: 'stretch',
  },
});

export default StatisticsScreen;