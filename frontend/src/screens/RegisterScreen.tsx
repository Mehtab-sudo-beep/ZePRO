import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { signup } from '../api/authApi';
import { AlertContext } from '../context/AlertContext';
import { ThemeContext } from '../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { showAlert } = useContext(AlertContext);
  const { colors } = useContext(ThemeContext);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'FACULTY' | ''>('');
  
  const [securePass, setSecurePass] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !role) {
      showAlert('Error', 'Please fill all fields and select role');
      return;
    }

    if (!email.endsWith('@gmail.com')) {
      showAlert('Error', 'Only Gmail addresses are allowed');
      return;
    }

    // ✅ Password length validation
    if (password.length < 8) {
      showAlert('Error', 'Password must be at least 8 characters long');
      return;
    }

    // ✅ Password match validation
    if (password !== confirmPassword) {
      showAlert('Error', 'Passwords do not match');
      return;
    }

    try {
      await signup({
        name: name,
        email: email,
        password: password,
        role: role,
      });

      showAlert('Success', `Registered as ${role}`);
      navigation.navigate('Login');
    } catch (error) {
      showAlert(
        'Registration Failed',
        'Unable to create account. Please try again.',
      );
    }
  };
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.brandContainer}>
        <Text style={[styles.brandTitle, { color: colors.text }]}>ZePRO</Text>
        <Text style={[styles.brandSubtitle, { color: colors.subText }]}>Project Allocation Portal</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Create Account</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>Register to continue</Text>

        <TextInput
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          placeholderTextColor={colors.subText}
        />

        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          autoCapitalize="none"
          placeholderTextColor={colors.subText}
        />

        <View style={[styles.passwordContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <TextInput
            placeholder="Password"
            secureTextEntry={securePass}
            value={password}
            onChangeText={setPassword}
            style={[styles.passwordInput, { color: colors.text }]}
            placeholderTextColor={colors.subText}
          />
          <TouchableOpacity onPress={() => setSecurePass(!securePass)} style={{ padding: 4 }}>
            <Image 
              source={colors.background === '#111827' ? require('../assets/eye-white.png') : require('../assets/eye.png')} 
              style={{ width: 20, height: 20, opacity: securePass ? 0.4 : 1 }} 
              resizeMode="contain" 
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.passwordContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
          <TextInput
            placeholder="Confirm Password"
            secureTextEntry={secureConfirm}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            style={[styles.passwordInput, { color: colors.text }]}
            placeholderTextColor={colors.subText}
          />
          <TouchableOpacity onPress={() => setSecureConfirm(!secureConfirm)} style={{ padding: 4 }}>
            <Image 
              source={colors.background === '#111827' ? require('../assets/eye-white.png') : require('../assets/eye.png')} 
              style={{ width: 20, height: 20, opacity: secureConfirm ? 0.4 : 1 }} 
              resizeMode="contain" 
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.roleLabel, { color: colors.text }]}>Select Role</Text>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              { borderColor: colors.border, backgroundColor: colors.background },
              role === 'STUDENT' && [styles.selectedRole, { backgroundColor: colors.primary, borderColor: colors.primary }],
            ]}
            onPress={() => setRole('STUDENT')}
          >
            <Text
              style={[
                styles.roleText,
                { color: colors.text },
                role === 'STUDENT' && styles.selectedRoleText,
              ]}
            >
              Student
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.roleButton,
              { borderColor: colors.border, backgroundColor: colors.background },
              role === 'FACULTY' && [styles.selectedRole, { backgroundColor: colors.primary, borderColor: colors.primary }],
            ]}
            onPress={() => setRole('FACULTY')}
          >
            <Text
              style={[
                styles.roleText,
                { color: colors.text },
                role === 'FACULTY' && styles.selectedRoleText,
              ]}
            >
              Faculty
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.registerBtn, { backgroundColor: colors.primary }]} onPress={handleRegister}>
          <Text style={styles.registerText}>Register</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.replace('Login')}>
          <Text style={[styles.loginLink, { color: colors.primary }]}>Already have an account? Login</Text>
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
