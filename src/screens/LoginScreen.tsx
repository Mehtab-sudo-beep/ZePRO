import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

import { login } from '../auth/authService';
import { AuthContext } from '../context/AuthContext'; 

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { setUser } = useContext(AuthContext); 

  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = () => {
  const user = login(email, password);

  if (!user) {
    Alert.alert('Login Failed', 'Invalid credentials');
    return;
  }

  setUser(user);

  if (user.role === 'faculty') {
    navigation.replace('FacultyHome');
  } else if (user.role==='admin') {
    navigation.replace('AdminHome');
  }
  else if (user.role==='facultycoordinator'){
    navigation.replace('FacultyCoordinatorDashboard');
  }
  else{
    navigation.replace('StudentHome');
  }
};


  return (
    <View style={styles.container}>

      <View style={styles.brandContainer}>
        <Text style={styles.brandTitle}>ZePRO</Text>
        <Text style={styles.brandSubtitle}>Project Allocation Portal</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.signInTitle}>Sign in</Text>
        <Text style={styles.signInSubtitle}>Enter your details below</Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          placeholderTextColor="#252628"
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholderTextColor="#252628"
        />

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.footerLinks}>
          <Text style={styles.link}>Forgot Password?</Text>
          <Text style={styles.link}>Sign Up</Text>
        </View>
      </View>

    </View>
  );
};

export default LoginScreen;


/* ===== STYLES (UNCHANGED) ===== */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    justifyContent: 'center',
    padding: 20,
  },

  brandContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#1e293b',
  },
  brandSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },

  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    elevation: 6,
  },

  signInTitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  signInSubtitle: {
    color: '#6b7280',
    marginBottom: 16,
  },

  input: {
    color: '#000000',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
  },

  loginBtn: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },
  loginText: {
    color: '#ffffff',
    fontWeight: '600',
  },

  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  link: {
    color: '#2563eb',
    fontSize: 12,
  },
});
