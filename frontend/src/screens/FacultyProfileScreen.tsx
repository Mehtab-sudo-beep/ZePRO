import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';

import {
  getFacultyProfile,
  updateFacultyProfile,
} from '../api/facultyApi';

// ✅ OUTSIDE COMPONENT
const InfoRow = ({ label, value, editKey, onEdit, colors, isDark }: any) => (
  <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
    <View style={{ flex: 1 }}>
      <Text style={[styles.infoLabel, { color: colors.subText }]}>
        {label}
      </Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>
        {value || '-'}
      </Text>
    </View>

    {editKey && (
      <TouchableOpacity onPress={() => onEdit(editKey, label, value)}>
        <Image
          source={
            isDark
              ? require('../assets/edit-white.png')
              : require('../assets/edit.png')
          }
          style={styles.editIcon}
        />
      </TouchableOpacity>
    )}
  </View>
);

const FacultyProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, setUser } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const isDark = colors.background === '#111827';

  const [profile, setProfile] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const [editModal, setEditModal] = useState(false);
  const [editField, setEditField] = useState<any>(null);
  const [editValue, setEditValue] = useState('');

  // ✅ LOAD PROFILE
  useEffect(() => {
    const loadProfile = async () => {
  try {
    const token = await AsyncStorage.getItem('token');

    console.log('🔥 TOKEN:', token);

    const data = await getFacultyProfile(token!);

    console.log('✅ PROFILE RESPONSE:', data);

    setProfile(data);

  } catch (err) {
    console.log('❌ PROFILE ERROR:', err);
    Alert.alert('Error', 'Failed to load profile');
  } finally {
    setLoading(false);
  }
};

    loadProfile();
  }, []);

  const openEdit = (key: string, label: string, value: string) => {
    setEditField({ key, label });
    setEditValue(value || '');
    setEditModal(true);
  };

  // ✅ UPDATE PROFILE
  const saveEdit = async () => {
  if (!editValue.trim()) {
    Alert.alert('Error', 'Field cannot be empty.');
    return;
  }

  try {
    const token = await AsyncStorage.getItem('token');

    const updated = {
      ...profile,
      [editField.key]: editValue.trim(),
    };

    console.log('🔥 SENDING UPDATE:', updated);

    const data = await updateFacultyProfile(updated, token!);

    console.log('✅ UPDATED RESPONSE:', data);

    setProfile(data);

    if (editField.key === 'name') {
      setUser({ ...user, name: data.name });
    }

    Alert.alert('Success', 'Profile updated successfully.');

  } catch (err) {
    console.log('❌ UPDATE ERROR:', err);
    Alert.alert('Error', 'Update failed');
  }

  setEditModal(false);
};

  if (loading) {
    return (
      <View style={styles.loader}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image
            source={
              isDark
                ? require('../assets/angle-white.png')
                : require('../assets/angle.png')
            }
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          My Profile
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
            
        {/* Banner */}
        <View style={[styles.banner, { backgroundColor: colors.card }]}>
          <View style={[styles.avatarWrapper, { borderColor: colors.primary }]}>
            <Image source={require('../assets/avatar.png')} style={styles.avatar} />
          </View>
          <Text style={[styles.bannerName, { color: colors.text }]}>
            {profile.name}
          </Text>

          <Text style={[styles.bannerDesignation, { color: colors.subText }]}>
            {profile.designation}
          </Text>

          <View style={[styles.deptBadge, { backgroundColor: colors.primary + '18' }]}>
            <Text style={[styles.deptBadgeText, { color: colors.primary }]}>
              {profile.department}
            </Text>
          </View>
        </View>
        

        {/* Personal */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Personal Information
          </Text>

          <InfoRow label="Full Name" value={profile.name} editKey="name"
            onEdit={openEdit} colors={colors} isDark={isDark} />

          <InfoRow label="Email" value={profile.email} editKey="email"
            onEdit={openEdit} colors={colors} isDark={isDark} />

          <InfoRow label="Phone" value={profile.phone} editKey="phone"
            onEdit={openEdit} colors={colors} isDark={isDark} />
        </View>

        {/* Academic */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>
            Academic Information
          </Text>

          <InfoRow label="Employee ID" value={profile.employeeId}
            colors={colors} isDark={isDark} />

          <InfoRow label="Designation" value={profile.designation} editKey="designation"
            onEdit={openEdit} colors={colors} isDark={isDark} />

          <InfoRow label="Department" value={profile.department} editKey="department"
            onEdit={openEdit} colors={colors} isDark={isDark} />

          <InfoRow label="Institute" value={profile.institute} editKey="institute"
            onEdit={openEdit} colors={colors} isDark={isDark} />

          <InfoRow label="Qualification" value={profile.qualification} editKey="qualification"
            onEdit={openEdit} colors={colors} isDark={isDark} />

          <InfoRow label="Specialization" value={profile.specialization} editKey="specialization"
            onEdit={openEdit} colors={colors} isDark={isDark} />

          <InfoRow label="Experience" value={profile.experience} editKey="experience"
            onEdit={openEdit} colors={colors} isDark={isDark} />

          <InfoRow label="Cabin No." value={profile.cabinNo} editKey="cabinNo"
            onEdit={openEdit} colors={colors} isDark={isDark} />
        </View>

      </ScrollView>

      {/* Modal */}
      <Modal visible={editModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Edit {editField?.label}
            </Text>

            <TextInput
              value={editValue}
              onChangeText={setEditValue}
              style={[styles.input, { color: colors.text }]}
              autoFocus
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity onPress={() => setEditModal(false)}>
                <Text>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={saveEdit}>
                <Text>Save</Text>
              </TouchableOpacity>
            </View>

          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default FacultyProfileScreen;

const styles = StyleSheet.create({
  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { width: 22, height: 22, resizeMode: 'contain' },
  headerTitle: { fontSize: 18, fontWeight: '600' },

  scroll: { padding: 16, paddingBottom: 36 },

  banner: {
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    marginBottom: 14,
    elevation: 2,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  avatar: { width: '100%', height: '100%', resizeMode: 'cover' },
  bannerName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  bannerDesignation: { fontSize: 14, marginBottom: 10 },
  deptBadge: { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  deptBadgeText: { fontSize: 13, fontWeight: '600' },

  statsRow: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: { alignItems: 'center', flex: 1 },
  statNum: { fontSize: 24, fontWeight: '700' },
  statLbl: { fontSize: 12, marginTop: 2 },
  statDivider: { width: 1, height: 36 },

  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    paddingBottom: 10,
    marginBottom: 6,
    borderBottomWidth: 0.5,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
  },
  infoLabel: { fontSize: 12, marginBottom: 3 },
  infoValue: { fontSize: 14, fontWeight: '500' },
  editRowBtn: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  editRowBtnText: { fontSize: 12, fontWeight: '600' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: { borderRadius: 14, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  inputLabel: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 20,
  },
  modalBtns: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 8,
    borderWidth: 1, alignItems: 'center',
  },
  cancelBtnText: { fontWeight: '600' },
  saveBtn: {
    flex: 1, paddingVertical: 12,
    borderRadius: 8, alignItems: 'center',
  },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700' },
  editIcon: { width: 15, height: 15, resizeMode: 'contain' },
  loader:{
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  }
});