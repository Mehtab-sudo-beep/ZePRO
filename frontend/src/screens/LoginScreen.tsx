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
import { AlertContext } from '../context/AlertContext';
import { ThemeContext } from '../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { setUser } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const { colors } = useContext(ThemeContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure] = useState(true);

const handleLogin = async () => {
  try {

    if (!email || !password) {
      showAlert("Error", "Please enter email and password");
      return;
    }

    const res = await login({
      email,
      password
    });

const { token, role, studentId, isInTeam, isTeamLead } = res.data;
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('role', role);

    if (studentId) {
      await AsyncStorage.setItem('studentId', studentId.toString());
    }

    setUser({
      token,
      role,
      studentId,
      isInTeam,
      isTeamLead
    });

    if (role === 'STUDENT') {
      console.log("STUDENT LOGGED IN:", res.data);
      navigation.replace('StudentHome');
    } 
    else if (role === 'FACULTY') {
      navigation.replace('FacultyHome');
    }
    else if (role === 'FACULTY_COORDINATOR') {
      navigation.replace('FacultyCoordinatorDashboard');
    }
    else if (role === 'ADMIN') {
      navigation.replace('AddInstitute');
    }

  } catch (error: any) {

    console.log("LOGIN ERROR:", error);

    if (error.response) {
      showAlert("Login Failed", error.response.data.message || "Invalid credentials");
    } else if (error.request) {
      showAlert("Network Error", "Cannot connect to server");
    } else {
      showAlert("Error", "Something went wrong");
    }
  }
};

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.brandContainer}>
        <Text style={[styles.brandTitle, { color: colors.text }]}>ZePRO</Text>
        <Text style={[styles.brandSubtitle, { color: colors.subText }]}>Project Allocation Portal</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
        <Text style={[styles.signInTitle, { color: colors.text }]}>Sign in</Text>
        <Text style={[styles.signInSubtitle, { color: colors.subText }]}>Enter your details below</Text>

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
            secureTextEntry={secure}
            value={password}
            onChangeText={setPassword}
            style={[styles.passwordInput, { color: colors.text }]}
            placeholderTextColor={colors.subText}
          />
        </View>

        <TouchableOpacity style={[styles.loginBtn, { backgroundColor: colors.primary }]} onPress={handleLogin}>
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <View style={styles.footerLinks}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={[styles.link, { color: colors.primary }]}>Forgot Password?</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.link, { color: colors.primary }]}> Sign Up?</Text>
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
