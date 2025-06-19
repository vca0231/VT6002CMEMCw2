import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons'; // You might need to install @expo/vector-icons

import HomeScreen from '../screens/HomeScreen';
import DietRecordScreen from '../screens/DietRecordScreen';
import ExerciseTrackingScreen from '../screens/ExerciseTrackingScreen';
import DataManagementScreen from '../screens/DataManagementScreen';
import StatisticsScreen from '../screens/StatisticsScreen';
import NotificationReminderScreen from '../screens/NotificationReminderScreen';
import OptionsScreen from '../screens/OptionsScreen'; // Import OptionsScreen
import RecipeBrowserScreen from '../screens/RecipeBrowserScreen';

import { BottomTabParamList } from '../types/navigation'; 
import HealthyRestaurantsScreen from '../screens/HealthyRestaurantsScreen';

const Tab = createBottomTabNavigator<BottomTabParamList>();

const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'HomeTab') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'DietTab') {
            iconName = focused ? 'fast-food' : 'fast-food-outline';
          } else if (route.name === 'ExerciseTab') {
            iconName = focused ? 'barbell' : 'barbell-outline';
          } else if (route.name === 'RestaurantsTab') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'StatisticsTab') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'NotificationTab') {
            iconName = focused ? 'notifications' : 'notifications-outline';
          } else if (route.name === 'OptionsTab') { // Add OptionsTab icon
            iconName = focused ? 'ellipsis-horizontal-circle' : 'ellipsis-horizontal-circle-outline';
          } else if (route.name === 'RecipeBrowserTab') {
            iconName = focused ? 'book' : 'book-outline';
          } else {
            // Default icon or handle other cases if necessary
            iconName = 'information-circle-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        headerShown: false, // Hide header as each screen will have its own title
      })}
    >
<Tab.Screen name="HomeTab" component={HomeScreen} options={{ title: 'Home' }} />
<Tab.Screen name="DietTab" component={DietRecordScreen} options={{ title: 'Diet' }} />
<Tab.Screen name="ExerciseTab" component={ExerciseTrackingScreen} options={{ title: 'Exercise' }} />
<Tab.Screen name="RestaurantsTab" component={HealthyRestaurantsScreen} options={{ title: 'Restaurants' }} />
<Tab.Screen name="StatisticsTab" component={StatisticsScreen} options={{ title: 'Statistics' }} />
<Tab.Screen name="NotificationTab" component={NotificationReminderScreen} options={{ title: 'Reminder' }} />
<Tab.Screen name="OptionsTab" component={OptionsScreen} options={{ title: 'Options' }} />
    </Tab.Navigator>
  );
};

export default MainTabNavigator; 