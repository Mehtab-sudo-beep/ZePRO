import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { login } from '../api/authApi';
import { AuthContext } from '../context/AuthContext';
import { StudentAuthContext } from '../context/StudentAuthContext';
import { ThemeContext } from '../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'react-native';
import { getProfileStatus } from '../api/studentApi';
import { getFacultyProfileStatus } from '../api/facultyApi';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { setUser } = useContext(AuthContext);
  const {  setStudentUser } = useContext(StudentAuthContext);
  const { colors } = useContext(ThemeContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);


  const handleLogin = async () => {
    setErrorMsg(null);
    try {

      if (!email || !password) {
        setErrorMsg("Please enter email and password");
        return;
      }

      console.log('[Login] 🔐 Attempting login with:', email);

      const res = await login({
        email,
        password
      });

      console.log('[Login] ✅ Login response:', res.data);

      const { 
        token, 
        role, 
        studentId, 
        facultyId, 
        isInTeam, 
        isTeamLead, 
        email: resEmail, 
        name, 
        phone, 
        fc: isFC 
      } = res.data;

      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('role', role);
      await AsyncStorage.setItem('userEmail', resEmail || '');
      await AsyncStorage.setItem('userName', name || '');
      await AsyncStorage.setItem('userPhone', phone || '');
      await AsyncStorage.setItem('isFC', isFC ? 'true' : 'false');

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
        phone,
        isFC
      });

      if (role === 'STUDENT') {
        console.log('[Login] 👤 Student logged in - ID:', studentId);

        const user = {
          ...res.data,
          isInTeam: res.data.inTeam,
          isTeamLead: res.data.teamLead,
        };

        await AsyncStorage.setItem('user', JSON.stringify(user));
        setStudentUser(user);

        // ✅ CHECK PROFILE COMPLETION
        console.log('\n[Login] 📊 CHECKING PROFILE STATUS...');
        console.log('[Login] ═══════════════════════════════════════');
        
        try {
          console.log('[Login] 🔍 Calling getProfileStatus with studentId:', studentId);
          
          const profileStatusRes = await getProfileStatus(studentId);
          
          console.log('[Login] ✅ Got response');
          console.log('[Login] Response status:', profileStatusRes.status);
          console.log('[Login] Response headers:', profileStatusRes.headers);
          
          // ✅ GET THE DATA PROPERLY
          const profileStatus = profileStatusRes.data;
          
          console.log('\n[Login] 📥 RAW RESPONSE DATA:');
          console.log('[Login] Full object:', JSON.stringify(profileStatus, null, 2));
          
          console.log('\n[Login] 📋 CHECKING FIELDS:');
          console.log('[Login] Type of profileStatus:', typeof profileStatus);
          console.log('[Login] Keys in object:', Object.keys(profileStatus));
          console.log('[Login] profileStatus.isProfileComplete:', profileStatus.isProfileComplete);
          console.log('[Login] typeof isProfileComplete:', typeof profileStatus.isProfileComplete);
          console.log('[Login] Value (strict):', profileStatus.isProfileComplete === true);
          console.log('[Login] Value (loose):', profileStatus.isProfileComplete == true);
          
          // ✅ ALTERNATIVE: Also check for field name variations
          const isComplete = 
            profileStatus.isProfileComplete === true ||
            profileStatus['isProfileComplete'] === true ||
            profileStatus.profileComplete === true ||
            profileStatus['profileComplete'] === true;
          
          console.log('[Login] 🎯 Is Complete (any variation):', isComplete);
          
          if (isComplete) {
            console.log('\n[Login] ✅✅✅ PROFILE COMPLETE - NAVIGATING TO STUDENT HOME');
            console.log('[Login] ═══════════════════════════════════════\n');
            
            navigation.reset({
              index: 0,
              routes: [{ name: 'StudentHome' }],
            });
          } else {
            console.log('\n[Login] ⚠️  PROFILE INCOMPLETE');
            console.log('[Login] isProfileComplete value:', profileStatus.isProfileComplete);
            console.log('[Login] All response fields:', profileStatus);
            console.log('[Login] ═══════════════════════════════════════\n');
            
            navigation.reset({
              index: 0,
              routes: [{ name: 'CompleteProfile' as any }],
            });
          }
        } catch (err: any) {
          console.log('\n[Login] ❌ ERROR IN PROFILE CHECK');
          console.log('[Login] Error name:', err.name);
          console.log('[Login] Error message:', err.message);
          console.log('[Login] Error code:', err.code);
          console.log('[Login] Response status:', err.response?.status);
          console.log('[Login] Response data:', err.response?.data);
          console.log('[Login] ═══════════════════════════════════════');
          console.log('[Login] ⚠️  DEFAULTING TO COMPLETE PROFILE\n');
          
          navigation.reset({
            index: 0,
            routes: [{ name: 'CompleteProfile' as any }],
          });
        }
      }
      else if (role === 'FACULTY') {
        console.log('[Login] 👨‍🏫 Faculty logged in - ID:', facultyId);

        // ✅ CHECK FACULTY PROFILE COMPLETION
        console.log('\n[Login] 📊 CHECKING FACULTY PROFILE STATUS...');
        console.log('[Login] ═══════════════════════════════════════');
        
        try {
          console.log('[Login] 🔍 Calling getFacultyProfileStatus with facultyId:', facultyId);
          
          const facultyProfileRes = await getFacultyProfileStatus(facultyId, token);
          
          console.log('[Login] ✅ Got response');
          console.log('[Login] Response status:', facultyProfileRes.status);
          
          // ✅ GET THE DATA PROPERLY
          const facultyProfile = facultyProfileRes.data;
          
          console.log('\n[Login] 📥 RAW RESPONSE DATA:');
          console.log('[Login] Full object:', JSON.stringify(facultyProfile, null, 2));
          
          console.log('\n[Login] 📋 CHECKING FIELDS:');
          console.log('[Login] isProfileComplete:', facultyProfile.isProfileComplete);
          console.log('[Login] Type:', typeof facultyProfile.isProfileComplete);
          
          const isComplete = 
            facultyProfile.isProfileComplete === true ||
            facultyProfile['isProfileComplete'] === true ||
            facultyProfile.profileComplete === true ||
            facultyProfile['profileComplete'] === true;
          
          console.log('[Login] 🎯 Is Complete:', isComplete);
          
          if (isComplete) {
            console.log('\n[Login] ✅✅✅ FACULTY PROFILE COMPLETE - NAVIGATING TO FACULTY HOME');
            console.log('[Login] ═══════════════════════════════════════\n');
            
            navigation.replace('FacultyHome');
          } else {
            console.log('\n[Login] ⚠️  FACULTY PROFILE INCOMPLETE');
            console.log('[Login] isProfileComplete value:', facultyProfile.isProfileComplete);
            console.log('[Login] All response fields:', facultyProfile);
            console.log('[Login] ═══════════════════════════════════════\n');
            
            navigation.reset({
              index: 0,
              routes: [{ name: 'CompleteFacultyProfile' as any }],
            });
          }
        } catch (err: any) {
          console.log('\n[Login] ❌ ERROR IN FACULTY PROFILE CHECK');
          console.log('[Login] Error message:', err.message);
          console.log('[Login] Response status:', err.response?.status);
          console.log('[Login] Response data:', err.response?.data);
          console.log('[Login] ═══════════════════════════════════════');
          console.log('[Login] ⚠️  DEFAULTING TO COMPLETE PROFILE\n');
          
          navigation.reset({
            index: 0,
            routes: [{ name: 'CompleteFacultyProfile' as any }],
          });
        }
      }
      else if (role === 'ADMIN') {
        console.log('[Login] 🔐 Admin logged in');
        navigation.replace('InstituteList');
      }

    } catch (error: any) {

      console.log('[Login] ❌ Login error:', error);

      if (error.response) {
        setErrorMsg(error.response.data.message || "Invalid credentials");
      } else if (error.request) {
        setErrorMsg("Cannot connect to server");
      } else {
        setErrorMsg("Something went wrong");
      }
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
            <Image
              source={require('../assets/info.png')}
              style={[styles.alertIcon, { tintColor: '#ef4444' }]}
            />
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
    marginTop: 20,
  },

  logo: {
    width: 140,
    height: 140,
    marginBottom: 5,
    // Added a subtle shadow to help it pop from the background without harsh lines
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
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
  inlineAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
  },
  alertIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  inlineAlertText: {
    color: '#b91c1c',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
});
