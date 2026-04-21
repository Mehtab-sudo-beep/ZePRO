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
import { forgotPassword } from '../api/authApi';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    
    try {
      setLoading(true);
      await forgotPassword({ email });
      Alert.alert('OTP Sent', 'Please check your email for the OTP.');
      navigation.navigate('VerifyOTP', { email });
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Forgot Password</Text>

        <Text style={styles.subtitle}>
          Enter your email and choose a method to recover your account
        </Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor="#9ca3af"
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#3b82f6' }]} 
            onPress={handleSendOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>Send OTP</Text>
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

export default ForgotPasswordScreen;

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
    marginBottom: 20,
    backgroundColor: '#f9fafb',
    fontSize: 15,
  },

  buttonContainer: {
    marginTop: 5,
    marginBottom: 10,
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
