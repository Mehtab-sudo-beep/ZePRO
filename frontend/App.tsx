import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/theme/ThemeContext';
import { AlertProvider } from './src/context/AlertContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AlertProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AlertProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}
