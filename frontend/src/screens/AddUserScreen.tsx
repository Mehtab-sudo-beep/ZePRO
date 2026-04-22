import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { signup } from '../api/authApi';
import { AlertContext } from '../context/AlertContext';
import { ThemeContext } from '../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'AddUser'>;

const AddUserScreen: React.FC<Props> = ({ navigation, route }) => {
  const { showAlert } = useContext(AlertContext);
  const { theme, colors } = useContext(ThemeContext);

  const { departmentId, departmentName, instituteId, instituteName } = route.params;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'FACULTY' | ''>('');
  const [loading, setLoading] = useState(false);

  const handleAddUser = async () => {
    if (!name.trim()) {
      showAlert('Error', 'Full name is required');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      showAlert('Error', 'Valid email is required');
      return;
    }
    if (!role) {
      showAlert('Error', 'Please select a role');
      return;
    }

    try {
      setLoading(true);
      const generatedPassword = email.trim().split('@')[0];
      await signup({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: generatedPassword,
        role: role as any,
        instituteId: parseInt(instituteId),
        departmentId: parseInt(departmentId),
      });

      showAlert(
        'User Added',
        `${name} has been registered as ${role}.\nPassword has been set to: ${generatedPassword}`,
        [
          {
            text: 'Add Another',
            style: 'default',
            onPress: () => {
              setName('');
              setEmail('');
              setRole('');
            },
          },
          {
            text: 'Done',
            style: 'default',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (err: any) {
      showAlert(
        'Registration Failed',
        err?.response?.data?.error || 'Could not add user. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image
            source={theme === 'dark' ? require('../assets/angle-white.png') : require('../assets/angle.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Add User</Text>
          <Text style={[styles.headerSub, { color: colors.subText }]}>{departmentName} · {instituteName}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Brand */}
        <View style={styles.brandContainer}>
          <Text style={[styles.brandSubtitle, { color: colors.subText }]}>Add a member to your department</Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>User Details</Text>
          <Text style={[styles.cardSub, { color: colors.subText }]}>Password will be set to the part of the email before the @ symbol.</Text>

          {/* Name */}
          <Text style={[styles.label, { color: colors.text }]}>Full Name *</Text>
          <TextInput
            placeholder="e.g. John Doe"
            placeholderTextColor={colors.subText}
            value={name}
            onChangeText={setName}
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          />

          {/* Email */}
          <Text style={[styles.label, { color: colors.text }]}>Email *</Text>
          <TextInput
            placeholder="e.g. [EMAIL_ADDRESS]"
            placeholderTextColor={colors.subText}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border }]}
          />

          {/* Role */}
          <Text style={[styles.label, { color: colors.text }]}>Role *</Text>
          <View style={styles.roleRow}>
            <TouchableOpacity
              style={[
                styles.roleBtn,
                { borderColor: colors.border, backgroundColor: colors.background },
                role === 'STUDENT' && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setRole('STUDENT')}
            >
              <Text style={[styles.roleText, { color: role === 'STUDENT' ? '#fff' : colors.text }]}>🎓 Student</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleBtn,
                { borderColor: colors.border, backgroundColor: colors.background },
                role === 'FACULTY' && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
              onPress={() => setRole('FACULTY')}
            >
              <Text style={[styles.roleText, { color: role === 'FACULTY' ? '#fff' : colors.text }]}>🏫 Faculty</Text>
            </TouchableOpacity>
          </View>
          {/* Submit */}
          <TouchableOpacity
            style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]}
            onPress={handleAddUser}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <Text style={styles.submitText}>Create User</Text>
            }
          </TouchableOpacity>
        </View>

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddUserScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  backIcon: { width: 22, height: 22, resizeMode: 'contain' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerSub: { fontSize: 12, marginTop: 1 },

  scrollContent: { padding: 20, paddingBottom: 40 },
  brandContainer: { alignItems: 'center', marginBottom: 20 },
  brandTitle: { fontSize: 30, fontWeight: '800' },
  brandSubtitle: { fontSize: 13, marginTop: 4 },

  card: {
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  cardTitle: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  cardSub: { fontSize: 13, marginBottom: 20 },

  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  labelHint: { fontSize: 12, fontWeight: '400', color: '#4F46E5' },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    marginBottom: 16,
  },

  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  roleBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  roleText: { fontSize: 14, fontWeight: '600' },

  infoBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  infoText: { fontSize: 12, color: '#4338CA', lineHeight: 18 },

  submitBtn: {
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    elevation: 2,
  },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
