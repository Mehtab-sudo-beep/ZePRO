import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { login, googleLogin } from '../api/authApi';
import { AuthContext } from '../context/AuthContext';
import { StudentAuthContext } from '../context/StudentAuthContext';
import { ThemeContext } from '../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getProfileStatus } from '../api/studentApi';
import { getFacultyProfileStatus } from '../api/facultyApi';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { useEffect } from 'react';

WebBrowser.maybeCompleteAuthSession();

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { setUser } = useContext(AuthContext);
  const { setStudentUser } = useContext(StudentAuthContext);
  const { colors } = useContext(ThemeContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: '799118111005-jdulbv6r8iltb670kt2m63skujr16rnf.apps.googleusercontent.com',
  });
  useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      if (authentication?.accessToken)
      handleGoogleBackend(authentication.accessToken);
    }
  }, [response]);
  // --- HELPER: SAVE SESSION & NAVIGATE ---
  const processLoginSession = async (data: any) => {
    const {
      token, role, studentId, facultyId, isInTeam, isTeamLead,
      email: resEmail, name, phone, fc: isFC
    } = data;

    // Save basic info
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('role', role);
    await AsyncStorage.setItem('userEmail', resEmail || '');
    await AsyncStorage.setItem('userName', name || '');
    await AsyncStorage.setItem('isFC', isFC ? 'true' : 'false');

    if (studentId) await AsyncStorage.setItem('studentId', studentId.toString());
    if (facultyId) await AsyncStorage.setItem('facultyId', facultyId.toString());

    // Update Global Auth Context
    setUser({
      token, role, studentId, facultyId, isInTeam, isTeamLead,
      email: resEmail, name, phone, isFC
    });

    if (role === 'STUDENT') {
      const studentData = { ...data, isInTeam: data.inTeam, isTeamLead: data.teamLead };
      await AsyncStorage.setItem('user', JSON.stringify(studentData));
      setStudentUser(studentData);

      try {
        const profileStatusRes = await getProfileStatus(studentId);
        const profileStatus = profileStatusRes.data;
        const isComplete = profileStatus.isProfileComplete || profileStatus.profileComplete;

        navigation.reset({
          index: 0,
          routes: [{ name: isComplete ? 'StudentHome' : 'CompleteProfile' as any }],
        });
      } catch (err) {
        navigation.reset({ index: 0, routes: [{ name: 'CompleteProfile' as any }] });
      }
    }
    else if (role === 'FACULTY') {
      try {
        const facultyProfileRes = await getFacultyProfileStatus(facultyId, token);
        const facultyProfile = facultyProfileRes.data;
        const isComplete = facultyProfile.isProfileComplete || facultyProfile.profileComplete;

        if (isComplete) {
          navigation.replace('FacultyHome');
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'CompleteFacultyProfile' as any }] });
        }
      } catch (err) {
        navigation.reset({ index: 0, routes: [{ name: 'CompleteFacultyProfile' as any }] });
      }
    }
    else if (role === 'ADMIN') {
      navigation.replace('InstituteList');
    }
  };

  // --- HANDLER: STANDARD LOGIN ---
  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await login({ email, password });
      await processLoginSession(res.data);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  // --- HANDLER: GOOGLE LOGIN ---
  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);

      await promptAsync(); // opens Google login
    } catch (error) {
      console.log('[Google Login Error]', error);
      setErrorMsg('Google login failed');
      setLoading(false);
    }
  };
  const handleGoogleBackend = async (accessToken: string) => {
    try {
      const res = await fetch(
        'https://www.googleapis.com/userinfo/v2/me',
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const user = await res.json();

      const googleRequest = {
        email: user.email,
        name: user.name,
        googleId: user.id,
        role: 'STUDENT',
      };

      const backendRes = await googleLogin(googleRequest);

      await processLoginSession(backendRes.data);
    } catch (error) {
      console.log('[Backend Google Error]', error);
      setErrorMsg('Google login failed');
    } finally {
      setLoading(false);
    }
  };
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.brandContainer}>
        <Image
          source={require('../assets/zepro_new.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[styles.brandTitle, { color: colors.text }]}>ZePRO</Text>
        <Text style={[styles.brandSubtitle, { color: colors.subText }]}>Project Allocation Portal</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 }]}>
        <Text style={[styles.signInTitle, { color: colors.text }]}>Sign in</Text>
        <Text style={[styles.signInSubtitle, { color: colors.subText }]}>Enter your details below</Text>

        {errorMsg && (
          <View style={styles.inlineAlert}>
            <Image source={require('../assets/info.png')} style={[styles.alertIcon, { tintColor: '#ef4444' }]} />
            <Text style={styles.inlineAlertText}>{errorMsg}</Text>
          </View>
        )}

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
          <TouchableOpacity onPress={() => setSecure(!secure)} style={{ padding: 4 }}>
            <Image
              source={colors.background === '#111827' ? require('../assets/eye-white.png') : require('../assets/eye.png')}
              style={{ width: 20, height: 20, opacity: secure ? 0.4 : 1 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.loginBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.loginText}>Login</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.googleBtn}
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          <Image source={require('../assets/google_icon.png')} style={styles.googleIcon} />
          <Text style={styles.googleBtnText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
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
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  brandContainer: { alignItems: 'center', marginBottom: 25 },
  logo: { width: 120, height: 120, marginBottom: 5 },
  brandTitle: { fontSize: 30, fontWeight: '800' },
  brandSubtitle: { fontSize: 14, marginTop: 4 },
  card: { borderRadius: 12, padding: 20, elevation: 4 },
  signInTitle: { fontSize: 22, fontWeight: '600' },
  signInSubtitle: { marginBottom: 16 },
  input: { borderWidth: 1, borderRadius: 6, padding: 12, marginBottom: 15 },
  passwordContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 6, paddingHorizontal: 12, marginBottom: 15 },
  passwordInput: { flex: 1, paddingVertical: 12 },
  loginBtn: { padding: 14, borderRadius: 6, alignItems: 'center', marginBottom: 12 },
  loginText: { color: '#ffffff', fontWeight: '600' },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff'
  },
  googleIcon: { width: 20, height: 20, marginRight: 10 },
  googleBtnText: { color: '#374151', fontWeight: '600' },
  footerLinks: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 15 },
  link: { fontSize: 13, fontWeight: '500' },
  inlineAlert: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fef2f2', borderWidth: 1, borderColor: '#fecaca', padding: 10, borderRadius: 8, marginBottom: 15 },
  alertIcon: { width: 16, height: 16, marginRight: 8 },
  inlineAlertText: { color: '#b91c1c', fontSize: 13, flex: 1 },
});