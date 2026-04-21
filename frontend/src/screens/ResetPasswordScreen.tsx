import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { resetPasswordOtp } from '../api/authApi';

type Props = NativeStackScreenProps<RootStackParamList, 'ResetPassword'>;

const ResetPasswordScreen: React.FC<Props> = ({ route, navigation }) => {
  const { email, otp } = route.params;
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      await resetPasswordOtp({ email, otp, newPassword });
      Alert.alert('Success', 'Your password has been reset successfully.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Set New Password</Text>
        <Text style={styles.subtitle}>
          Create a strong password for your account
        </Text>

        <TextInput
          placeholder="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          style={styles.input}
          secureTextEntry
          placeholderTextColor="#9ca3af"
        />

        <TextInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          style={styles.input}
          secureTextEntry
          placeholderTextColor="#9ca3af"
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#3b82f6' }]} 
            onPress={handleReset}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>Change Password</Text>
            )}
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backLink}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ResetPasswordScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  input: {
    color: '#111827',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 14,
    marginBottom: 15,
    backgroundColor: '#f9fafb',
    fontSize: 15,
  },
  buttonContainer: {
    marginTop: 10,
  },
  actionBtn: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  btnText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 15,
  },
  backLink: {
    marginTop: 20,
    textAlign: 'center',
    color: '#2563eb',
    fontWeight: '600',
  },
});
