import { NavigatorScreenParams } from '@react-navigation/native';

// Define a type for the parameters passed to each screen in your main stack navigator
export type RootStackParamList = {
  Login: undefined;
  Home: NavigatorScreenParams<BottomTabParamList>;
  Comments: { taskId: string };
  UserProfile: undefined;
};

// Define a type for the parameters passed to each screen in your bottom tab navigator
export type BottomTabParamList = {
  HomeTab: undefined;
  DietTab: undefined;
  ExerciseTab: undefined;
  DataManagement: undefined;
  StatisticsTab: undefined;
  NotificationTab: undefined;
  OptionsTab: undefined;
  // ProfileTab: undefined;
}; 