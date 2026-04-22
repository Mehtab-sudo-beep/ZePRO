import React, { useState, useContext } from 'react';
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
import { ThemeContext } from '../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'VerifyOTP'>;

const VerifyOTPScreen: React.FC<Props> = ({ route, navigation }) => {
  const { email } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { showAlert } = useContext(AlertContext);
  const { colors } = useContext(ThemeContext);

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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Verify OTP</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          Enter the 6-digit code sent to {email}
        </Text>

        <TextInput
          placeholder="000000"
          value={otp}
          onChangeText={setOtp}
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          keyboardType="number-pad"
          maxLength={6}
          placeholderTextColor={colors.subText}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.primary }]} 
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.btnText}>Verify</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleResend} style={{ marginTop: 15 }}>
          {resending ? (
            <ActivityIndicator color={colors.primary} size="small" />
          ) : (
            <Text style={[styles.backLink, { color: colors.primary }]}>Resend OTP</Text>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.backLink, { color: colors.primary }]}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default VerifyOTPScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
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
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    lineHeight: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    marginBottom: 20,
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
    fontWeight: '600',
  },
});
