import React, { useState } from 'react';
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
import { signup } from '../api/authApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'FACULTY' | ''>('');

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !role) {
      Alert.alert('Error', 'Please fill all fields and select role');
      return;
    }

    if (!email.endsWith('@gmail.com')) {
      Alert.alert('Error', 'Only Gmail addresses are allowed');
      return;
    }

    // ✅ Password length validation
    if (password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    // ✅ Password match validation
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    try {
      await signup({
        name: name,
        email: email,
        password: password,
        role: role,
      });

      Alert.alert('Success', `Registered as ${role}`);
      navigation.navigate('Login');
    } catch (error: any) {
      const message =
        error?.response?.data ||
        error?.message ||
        'Unable to create account. Please try again.';
      Alert.alert('Registration Failed', message);
    }
  };
  return (
    <View style={styles.container}>
      <View style={styles.brandContainer}>
        <Text style={styles.brandTitle}>ZePRO</Text>
        <Text style={styles.brandSubtitle}>Project Allocation Portal</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Register to continue</Text>

        <TextInput
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          placeholderTextColor="#9ca3af"
        />

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          placeholderTextColor="#9ca3af"
        />

        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          placeholderTextColor="#9ca3af"
        />

        <TextInput
          placeholder="Confirm Password"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          placeholderTextColor="#9ca3af"
        />

        <Text style={styles.roleLabel}>Select Role</Text>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              role === 'STUDENT' && styles.selectedRole,
            ]}
            onPress={() => setRole('STUDENT')}
          >
            <Text
              style={[
                styles.roleText,
                role === 'STUDENT' && styles.selectedRoleText,
              ]}
            >
              Student
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              role === 'FACULTY' && styles.selectedRole,
            ]}
            onPress={() => setRole('FACULTY')}
          >
            <Text
              style={[
                styles.roleText,
                role === 'FACULTY' && styles.selectedRoleText,
              ]}
            >
              Faculty
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.registerBtn} onPress={handleRegister}>
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.loginLink}>Already have an account? Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RegisterScreen;

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

  title: {
    fontSize: 22,
    fontWeight: '600',
  },

  subtitle: {
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

  roleLabel: {
    marginBottom: 8,
    fontWeight: '500',
  },

  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },

  roleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },

  selectedRole: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },

  roleText: {
    color: '#374151',
  },

  selectedRoleText: {
    color: '#ffffff',
    fontWeight: '600',
  },

  registerBtn: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },

  registerText: {
    color: '#ffffff',
    fontWeight: '600',
  },

  loginLink: {
    marginTop: 15,
    textAlign: 'center',
    color: '#2563eb',
  },
});
