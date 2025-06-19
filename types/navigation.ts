export type RootStackParamList = {
  Login: undefined;
  Home: BottomTabParamList;
  Comments: { id: string; title: string };
  DietRecord: undefined;
  ExerciseTracking: undefined;
  DataManagement: undefined;
  Statistics: undefined;
  NotificationReminder: undefined;
  UserProfile: undefined;
  RecipeBrowser: undefined;
};

export type BottomTabParamList = {
  HomeTab: undefined; // The simplified HomeScreen
  DietTab: undefined;
  ExerciseTab: undefined;
  DataManagement: undefined;
  StatisticsTab: undefined;
  NotificationTab: undefined;
  OptionsTab: undefined;
}; 