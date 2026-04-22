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
import { verifyOtp, forgotPassword } from '../api/authApi';
import { AlertContext } from '../context/AlertContext';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyOTP'>;

const VerifyOTPScreen: React.FC<Props> = ({ route, navigation }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { showAlert } = React.useContext(AlertContext);

  const handleVerify = async () => {
    if (!otp) {
      showAlert('Error', 'Please enter the OTP');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyOtp({ email, otp });
      if (res.data.valid) {
        navigation.navigate('ResetPassword', { email, otp });
      } else {
        showAlert('Error', 'Invalid or expired OTP.');
      }
    } catch (error: any) {
      showAlert('Error', error.response?.data?.error || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      await forgotPassword({ email });
      showAlert('OTP Resent', 'Please check your email.');
    } catch (error: any) {
      showAlert('Error', error.response?.data?.error || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit code sent to {email}
        </Text>

        <TextInput
          placeholder="000000"
          value={otp}
          onChangeText={setOtp}
          style={styles.input}
          keyboardType="number-pad"
          maxLength={6}
          placeholderTextColor="#9ca3af"
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: '#3b82f6' }]} 
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>Verify</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleResend} style={{ marginTop: 15 }}>
          {resending ? (
            <ActivityIndicator color="#2563eb" size="small" />
          ) : (
            <Text style={styles.backLink}>Resend OTP</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.backLink}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VerifyOTPScreen;

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
    fontSize: 18,
    textAlign: 'center',
    letterSpacing: 4,
  },
  buttonContainer: {
    marginTop: 5,
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
    marginTop: 15,
    textAlign: 'center',
    color: '#2563eb',
    fontWeight: '600',
  },
});
