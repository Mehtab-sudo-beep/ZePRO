import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import StudentHomeScreen from '../screens/StudentHomeScreen';

export type RootStackParamList = {
  Login: undefined;
  StudentHome: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="StudentHome" component={StudentHomeScreen} />
    </Stack.Navigator>
  );
};

export default AppNavigator;

