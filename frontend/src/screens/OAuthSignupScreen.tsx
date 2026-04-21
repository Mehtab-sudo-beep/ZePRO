import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { googleLogin } from '../api/authApi';
import { AlertContext } from '../context/AlertContext';
import { ThemeContext } from '../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { StudentAuthContext } from '../context/StudentAuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'OAuthSignup'>;

const OAuthSignupScreen: React.FC<Props> = ({ navigation }) => {
  const { showAlert } = useContext(AlertContext);
  const { colors } = useContext(ThemeContext);
  const { setUser } = useContext(AuthContext);
  const { setStudentUser } = useContext(StudentAuthContext);

  const [role, setRole] = useState<'STUDENT' | 'FACULTY' | ''>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID.apps.googleusercontent.com',
      offlineAccess: true,
    });
  }, []);

  const handleGoogleSignup = async () => {
    if (!role) {
      showAlert('Error', 'Please select a role to continue');
      return;
    }

    try {
      setLoading(true);

      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();

      if (response.type !== 'success') {
        throw new Error('Google Sign-In cancelled or failed');
      }

      const { user, idToken } = response.data;

      console.log('[OAuth] Google user:', user);

      // Send the Google ID Token and the requested role to backend
      const googleRequest = {
        idToken: idToken,
        role: role,
      };

      console.log('[OAuth] Sending Google login request:', googleRequest);

      const loginRes = await googleLogin(googleRequest);
      console.log('[OAuth] Google login response:', loginRes.data);

      const {
        token,
        studentId,
        facultyId,
        isInTeam,
        isTeamLead,
        email: resEmail,
        name,
        isUGCoordinator,
        isPGCoordinator,
      } = loginRes.data;

      // Save to AsyncStorage
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('role', role);
      await AsyncStorage.setItem('userEmail', resEmail || '');
      await AsyncStorage.setItem('userName', name || '');
      await AsyncStorage.setItem('isUGCoordinator', isUGCoordinator ? 'true' : 'false');
      await AsyncStorage.setItem('isPGCoordinator', isPGCoordinator ? 'true' : 'false');
      await AsyncStorage.setItem('oauthProvider', 'google');

      if (studentId) {
        await AsyncStorage.setItem('studentId', studentId.toString());
      }
      if (facultyId) {
        await AsyncStorage.setItem('facultyId', facultyId.toString());
      }

      setUser({
        token,
        role,
        studentId,
        facultyId,
        isInTeam,
        isTeamLead,
        email: resEmail,
        name,
        isUGCoordinator,
        isPGCoordinator,
      });

      showAlert('Success', `Registered as ${role} via Google`);

      if (role === 'STUDENT') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'CompleteProfile' as any }],
        });
      } else if (role === 'FACULTY') {
        navigation.reset({
          index: 0,
          routes: [{ name: 'CompleteFacultyProfile' as any }],
        });
      }
    } catch (error: any) {
      console.error('[OAuth] Error:', error);
      showAlert('Registration Failed', 'Could not signup with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.brandContainer}>
        <Text style={[styles.brandTitle, { color: colors.text }]}>ZePRO</Text>
        <Text style={[styles.brandSubtitle, { color: colors.subText }]}>
          Project Allocation Portal
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
        <Text style={[styles.title, { color: colors.text }]}>Quick Signup</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          Sign up with your Google account
        </Text>

        <Text style={[styles.roleLabel, { color: colors.text }]}>Select Your Role</Text>

        <View style={styles.roleContainer}>
          <TouchableOpacity
            style={[
              styles.roleButton,
              { borderColor: colors.border, backgroundColor: colors.background },
              role === 'STUDENT' && [
                styles.selectedRole,
                { backgroundColor: colors.primary, borderColor: colors.primary },
              ],
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
              role === 'FACULTY' && [
                styles.selectedRole,
                { backgroundColor: colors.primary, borderColor: colors.primary },
              ],
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

        <TouchableOpacity
          style={[styles.googleBtn, { backgroundColor: colors.primary, opacity: loading ? 0.6 : 1 }]}
          onPress={handleGoogleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <>
              <Image
                source={require('../assets/google-icon.png')}
                style={styles.googleIcon}
                resizeMode="contain"
              />
              <Text style={styles.googleBtnText}>Sign up with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.divider}>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.subText }]}>or</Text>
          <View style={[styles.line, { backgroundColor: colors.border }]} />
        </View>

        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
          <Text style={[styles.signupLink, { color: colors.primary }]}>
            Sign up with email instead
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.replace('Login')}>
          <Text style={[styles.loginLink, { color: colors.primary }]}>
            Already have an account? Login
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default OAuthSignupScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fb',
    padding: 20,
  },

  brandContainer: {
    alignItems: 'center',
    marginBottom: 25,
    marginTop: 30,
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
    marginBottom: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: '600',
  },

  subtitle: {
    color: '#6b7280',
    marginBottom: 20,
    fontSize: 14,
  },

  roleLabel: {
    marginBottom: 12,
    fontWeight: '500',
  },

  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
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

  googleBtn: {
    backgroundColor: '#3b82f6',
    padding: 14,
    borderRadius: 6,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 15,
  },

  googleIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },

  googleBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },

  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },

  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },

  dividerText: {
    marginHorizontal: 10,
    color: '#9ca3af',
  },

  signupLink: {
    textAlign: 'center',
    color: '#2563eb',
    marginBottom: 12,
    fontWeight: '500',
  },

  loginLink: {
    marginTop: 10,
    textAlign: 'center',
    color: '#2563eb',
  },
});