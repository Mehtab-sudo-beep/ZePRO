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
import { login } from '../api/authApi';
import { AuthContext } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { setUser } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure] = useState(true);

  const handleLogin = async () => {
    console.log('Login button clicked');

    try {
      const res = await login({
        email: email.trim(),
        password: password,
      });

      console.log('Response from backend:', res.data);

      const user = res.data;

      if (!user) {
        Alert.alert('Login Failed', 'Invalid credentials');
        return;
      }

      setUser(user);

      if (user.role === 'FACULTY') {
        navigation.replace('FacultyHome');
      } else if (user.role === 'ADMIN') {
        navigation.replace('InstituteList');
      } else if (user.role === 'FACULTY_COORDINATOR') {
        navigation.replace('FacultyCoordinatorDashboard');
      } else {
        navigation.replace('StudentHome');
      }
    } catch (error) {
      console.log('Login error:', error);
      Alert.alert('Login Failed', 'Invalid credentials or server error');
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
          placeholderTextColor="#9ca3af"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Password"
            secureTextEntry={secure}
            value={password}
            onChangeText={setPassword}
            style={styles.passwordInput}
            placeholderTextColor="#9ca3af"
          />
        </View>

        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.footerLinks}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.link}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}> Sign Up?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;

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
    borderColor: '#e5e7eb',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    backgroundColor: '#ffffff',
  },

  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 6,
    paddingHorizontal: 12,
    marginBottom: 15,
    backgroundColor: '#ffffff',
  },

  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    color: '#000000',
  },

  eyeText: {
    color: '#3b82f6',
    fontWeight: '500',
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
