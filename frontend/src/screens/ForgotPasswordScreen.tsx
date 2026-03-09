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

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const [email, setEmail] = useState('');

  const handleReset = () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }

    Alert.alert(
      'Reset Link Sent',
      'If the email exists, a password reset link has been sent.'
    );

    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>

      <View style={styles.card}>
        <Text style={styles.title}>Forgot Password</Text>

        <Text style={styles.subtitle}>
          Enter your email to receive a reset link
        </Text>

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          autoCapitalize="none"
          placeholderTextColor="#9ca3af"
        />

        <TouchableOpacity style={styles.resetBtn} onPress={handleReset}>
          <Text style={styles.resetText}>Send Reset Link</Text>
        </TouchableOpacity>

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
    borderRadius: 12,
    padding: 25,
    elevation: 6,
  },

  title: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
    textAlign: 'center',
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

  resetBtn: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
  },

  resetText: {
    color: '#ffffff',
    fontWeight: '600',
  },

  backLink: {
    marginTop: 15,
    textAlign: 'center',
    color: '#2563eb',
  },

});