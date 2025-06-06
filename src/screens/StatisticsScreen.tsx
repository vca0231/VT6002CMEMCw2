import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, Button, Alert, Platform } from 'react-native';
// You might need to install a charting library, e.g., npm install react-native-chart-kit
// import { LineChart } from "react-native-chart-kit";

const screenWidth = Dimensions.get("window").width;

const chartConfig = {
  backgroundGradientFrom: "#fff",
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: "#fff",
  backgroundGradientToOpacity: 0,
  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
  strokeWidth: 2, // optional, default 3
  barPercentage: 0.5,
  useShadowColorFromDataset: false // optional
};

const StatisticsScreen = () => {
  // Mock data for demonstration
  const dietData = {
    labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    datasets: [
      {
        data: [2000, 2200, 1800, 2500, 2100, 2300, 1900],
        color: (opacity = 1) => `rgba(255, 99, 132, ${opacity})`, // optional
        strokeWidth: 2 // optional
      }
    ],
    legend: ["Daily Calorie Intake"]
  };

  const exerciseData = {
        labels: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    datasets: [
      {
        data: [30, 45, 20, 60, 40, 50, 25],
        color: (opacity = 1) => `rgba(54, 162, 235, ${opacity})`, // optional
        strokeWidth: 2 // optional
      }
    ],
    legend: ["Daily exercise duration (minutes)"]
  };

  const healthGoals = {
    caloriesGoal: 2000,
    exerciseGoal: 45,
    weightGoal: 60, // kg
    currentWeight: 65,
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Health data statistics and analysis</Text>

      <View style={styles.section}>
       <Text style={styles.sectionTitle}>Dietary Trends</Text>
        {/* <LineChart
          data={dietData}
          width={screenWidth - 40} // from react-native
          height={220}
          chartConfig={chartConfig}
          bezier
        /> */}
       <Text style={styles.placeholderText}>A graph of dietary trends (e.g. calorie intake) will be shown here. </Text>
        <View style={styles.buttonContainer}>
        <Button title="View detailed diet report" onPress={() => Alert.alert('Detailed report', 'Function to be implemented')} />
        </View>
      </View>

      <View style={styles.section}>
      <Text style={styles.sectionTitle}>Sports Trends</Text>
        {/* <LineChart
          data={exerciseData}
          width={screenWidth - 40} // from react-native
          height={220}
          chartConfig={chartConfig}
          bezier
        /> */}
       <Text style={styles.placeholderText}>The exercise trend chart (such as exercise duration) will be displayed here. </Text>
        <View style={styles.buttonContainer}>
         <Button title="View detailed exercise report" onPress={() => Alert.alert('Detailed report', 'Function to be implemented')} />
        </View>
      </View>

      <View style={styles.section}>
      <Text style={styles.sectionTitle}>Health goal achievement</Text>
        <View style={styles.goalItem}>
        <Text style={styles.goalLabel}>Daily Calorie Goal:</Text>
          <Text style={styles.goalValue}>{healthGoals.caloriesGoal} kcal</Text>
        </View>
        <View style={styles.goalItem}>
          <Text style={styles.goalLabel}>Daily exercise duration goal:</Text>
         <Text style={styles.goalValue}>{healthGoals.exerciseGoal} minutes</Text>
        </View>
        <View style={styles.goalItem}>
         <Text style={styles.goalLabel}>Weight goal:</Text>
         <Text style={styles.goalValue}>{healthGoals.weightGoal} kg (current: {healthGoals.currentWeight} kg)</Text>
        </View>
        <View style={styles.buttonContainer}>
        <Button title="Set/Modify target" onPress={() => Alert.alert('Set target', 'Function to be implemented')} />
        </View>
      </View>

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
  placeholderText: {
    textAlign: 'center',
    color: '#888',
    paddingVertical: 50,
    fontStyle: 'italic',
  },
  buttonContainer: {
    marginTop: 15,
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  goalLabel: {
    fontSize: 16,
    color: '#555',
  },
  goalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default StatisticsScreen; 