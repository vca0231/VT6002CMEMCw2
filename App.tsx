import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './src/screens/LoginScreen';
import Comment from './src/screens/Comments';
import MainTabNavigator from './src/navigation/MainTabNavigator';
import UserProfileScreen from './src/screens/UserProfileScreen';
import DataManagementScreen from './src/screens/DataManagementScreen';
import RecipeBrowserScreen from './src/screens/RecipeBrowserScreen';
import { RootStackParamList } from './types/navigation';
import { AuthProvider, useAuth } from './src/context/AuthContext';

const Stack = createStackNavigator<RootStackParamList>();

function AppContent() {
  const { currentUser, loadingAuth } = useAuth();

  if (loadingAuth) {
    return (
      <View style={styles.loadingContainer}>
        <Text>加載中...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack.Navigator initialRouteName={currentUser ? "Home" : "Login"}>
        {currentUser ? (
          <Stack.Screen name="Home" component={MainTabNavigator} options={{ headerShown: false }} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        )}
        <Stack.Screen name="Comments" component={Comment} />
        <Stack.Screen
          name="UserProfile"
          component={UserProfileScreen}
          options={{
            title: 'My Profile',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="DataManagement"
          component={DataManagementScreen}
          options={{
            title: 'Data Management',
            presentation: 'modal',
          }}
        />
        <Stack.Screen name="RecipeBrowser" component={RecipeBrowserScreen} options={{ title: 'Recipe' }} />
      </Stack.Navigator>
    </View>
  );
}

export default function App() {
  return (
    <View style={{ flex: 1 }}>
      <NavigationContainer>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
