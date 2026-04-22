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
import { forgotPassword } from '../api/authApi';
import { AlertContext } from '../context/AlertContext';
import { ThemeContext } from '../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { showAlert } = useContext(AlertContext);
  const { colors } = useContext(ThemeContext);

  const handleSendOTP = async () => {
    if (!email) {
      showAlert('Error', 'Please enter your email');
      return;
    }
    
    try {
      setLoading(true);
      await forgotPassword({ email });
      showAlert('OTP Sent', 'Please check your email for the OTP.');
      navigation.navigate('VerifyOTP', { email });
    } catch (error: any) {
      showAlert('Error', error.response?.data?.error || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Forgot Password</Text>

        <Text style={[styles.subtitle, { color: colors.subText }]}>
          Enter your email and choose a method to recover your account
        </Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          autoCapitalize="none"
          keyboardType="email-address"
          placeholderTextColor={colors.subText}
        />

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionBtn, { backgroundColor: colors.primary }]} 
            onPress={handleSendOTP}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.btnText}>Send OTP</Text>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={[styles.backLink, { color: colors.primary }]}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ForgotPasswordScreen;

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
    fontWeight: '600',
  },
});
