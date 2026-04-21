import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { login, googleLogin } from '../api/authApi';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';
import { GoogleSignin, statusCodes, isErrorWithCode } from '@react-native-google-signin/google-signin';
import Animated, { FadeInUp, FadeInDown, Layout } from 'react-native-reanimated';

GoogleSignin.configure({
  webClientId: '799118111005-enlr4flip3roa6u3qn366aac0ao5gmbb.apps.googleusercontent.com',
});

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { setUser } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMsg("Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      const res = await login({ email, password });
      setUser(res.data);
    } catch (error: any) {
      setErrorMsg(error.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      await GoogleSignin.hasPlayServices();
      try { await GoogleSignin.signOut(); } catch (e) {}
      const userInfo = await GoogleSignin.signIn();

      let idToken = userInfo.data?.idToken || (userInfo as any).idToken;
      if (!idToken) throw new Error("No ID Token received.");

      const backendRes = await googleLogin({ idToken, role: 'STUDENT' });
      setUser(backendRes.data);
    } catch (error: any) {
      if (isErrorWithCode(error)) {
        if (error.code === statusCodes.SIGN_IN_CANCELLED) setErrorMsg('Sign in cancelled');
        else setErrorMsg('Google login failed');
      } else {
        setErrorMsg('Google login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const isDark = colors.background === '#111827';

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.inner}>
          <Animated.View 
            entering={FadeInUp.duration(800).delay(200)}
            style={styles.header}
          >
            <Image
              source={isDark ? require('../assets/zepro_new.png') : require('../assets/zepro.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.title, { color: colors.text }]}>ZePRO</Text>
            <Text style={[styles.subtitle, { color: colors.subText }]}>Experience Premium Project Management</Text>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.duration(800).delay(400)}
            layout={Layout.springify()}
            style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.cardTitle, { color: colors.text }]}>Welcome Back</Text>
            
            {errorMsg && (
              <Animated.View entering={FadeInUp} style={styles.errorBox}>
                <Text style={styles.errorText}>{errorMsg}</Text>
              </Animated.View>
            )}

            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: colors.subText }]}>Email Address</Text>
              <TextInput
                placeholder="e.g. name@institute.edu"
                value={email}
                onChangeText={setEmail}
                style={[styles.input, { color: colors.text, borderColor: colors.border }]}
                autoCapitalize="none"
                placeholderTextColor={isDark ? '#4B5563' : '#9CA3AF'}
              />
            </View>

            <View style={styles.inputWrapper}>
              <Text style={[styles.label, { color: colors.subText }]}>Password</Text>
              <View style={[styles.passwordField, { borderColor: colors.border }]}>
                <TextInput
                  placeholder="••••••••"
                  secureTextEntry={secure}
                  value={password}
                  onChangeText={setPassword}
                  style={[styles.passInput, { color: colors.text }]}
                  placeholderTextColor={isDark ? '#4B5563' : '#9CA3AF'}
                />
                <TouchableOpacity onPress={() => setSecure(!secure)}>
                  <Image
                    source={isDark ? require('../assets/eye-white.png') : require('../assets/eye.png')}
                    style={[styles.eyeIcon, { opacity: secure ? 0.3 : 1 }]}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              onPress={() => navigation.navigate('ForgotPassword')}
              style={styles.forgotPass}
            >
              <Text style={[styles.forgotText, { color: colors.primary }]}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: colors.primary }]}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.subText }]}>OR</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            <TouchableOpacity
              style={[styles.socialButton, { borderColor: colors.border }]}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <Image source={require('../assets/google_icon.png')} style={styles.socialIcon} />
              <Text style={[styles.socialText, { color: colors.text }]}>Continue with Google</Text>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View 
            entering={FadeInDown.duration(800).delay(600)}
            style={styles.footer}
          >
            <Text style={[styles.footerText, { color: colors.subText }]}>Don't have an account?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={[styles.signupLink, { color: colors.primary }]}> Create Account</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  inner: { flex: 1, padding: 24, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { width: 100, height: 100, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '800', letterSpacing: -1 },
  subtitle: { fontSize: 16, marginTop: 8, textAlign: 'center', opacity: 0.8 },
  card: {
    padding: 24,
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', marginBottom: 24 },
  errorBox: { 
    backgroundColor: '#FEE2E2', 
    padding: 12, 
    borderRadius: 12, 
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FECACA'
  },
  errorText: { color: '#B91C1C', fontSize: 14, fontWeight: '500', textAlign: 'center' },
  inputWrapper: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 4 },
  input: {
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
  },
  passwordField: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 14,
    paddingRight: 14,
  },
  passInput: { flex: 1, padding: 14, fontSize: 16 },
  eyeIcon: { width: 22, height: 22 },
  forgotPass: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotText: { fontSize: 14, fontWeight: '600' },
  loginButton: {
    padding: 16,
    borderRadius: 14,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, opacity: 0.5 },
  dividerText: { marginHorizontal: 16, fontSize: 12, fontWeight: '700', letterSpacing: 1 },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  socialIcon: { width: 20, height: 20, marginRight: 12 },
  socialText: { fontSize: 15, fontWeight: '600' },
  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  footerText: { fontSize: 15 },
  signupLink: { fontSize: 15, fontWeight: '700' },
});