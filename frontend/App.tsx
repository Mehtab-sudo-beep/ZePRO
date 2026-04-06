import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider } from './src/theme/ThemeContext';
import { AlertProvider } from './src/context/AlertContext';
import AppNavigator from './src/navigation/AppNavigator';
import { StudentAuthProvider } from './src/context/StudentAuthContext';

export default function App() {
  return (

    <AuthProvider>
      <StudentAuthProvider>
        <ThemeProvider>
          <AlertProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </AlertProvider>
        </ThemeProvider>
      </StudentAuthProvider>
    </AuthProvider>

  );
}
