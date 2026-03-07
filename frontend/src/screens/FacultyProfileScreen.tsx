import React, { useState, useContext } from 'react';
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
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';

const FacultyProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, setUser } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const isDark = colors.background === '#111827';

  const [editModal, setEditModal] = useState(false);
  const [editField, setEditField] = useState<{ key: string; label: string; value: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const [profile, setProfile] = useState({
    name: user?.name || 'Dr. Faculty Name',
    email: user?.email || 'faculty@institute.edu',
    phone: '+91 98765 43210',
    department: 'Computer Science & Engineering',
    designation: 'Associate Professor',
    employeeId: 'FAC2024001',
    specialization: 'Machine Learning, AI',
    experience: '8 Years',
    qualification: 'Ph.D. Computer Science',
    cabinNo: 'CS-204',
    institute: 'National Institute of Technology',
  });

  const openEdit = (key: string, label: string, value: string) => {
    setEditField({ key, label, value });
    setEditValue(value);
    setEditModal(true);
  };

  const saveEdit = () => {
    if (!editValue.trim()) {
      Alert.alert('Error', 'Field cannot be empty.');
      return;
    }
    if (editField) {
      setProfile(prev => ({ ...prev, [editField.key]: editValue.trim() }));
      if (editField.key === 'name' && user) setUser({ ...user, name: editValue.trim() });
      if (editField.key === 'email' && user) setUser({ ...user, email: editValue.trim() });
    }
    setEditModal(false);
    Alert.alert('Success', 'Profile updated successfully.');
  };

 const InfoRow = ({ label, value, editKey }: { label: string; value: string; editKey?: string }) => (
  <View style={[styles.infoRow, { borderBottomColor: colors.border }]}>
    <View style={{ flex: 1 }}>
      <Text style={[styles.infoLabel, { color: colors.subText }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
    {editKey && (
      <TouchableOpacity onPress={() => openEdit(editKey, label, value)}>
        <Image
          source={isDark ? require('../assets/edit-white.png') : require('../assets/edit.png')}
          style={styles.editIcon}
        />
      </TouchableOpacity>
    )}
  </View>
);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image
            source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Profile</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Avatar + Name Banner */}
        <View style={[styles.banner, { backgroundColor: colors.card }]}>
          <View style={[styles.avatarWrapper, { borderColor: colors.primary }]}>
            <Image source={require('../assets/avatar.png')} style={styles.avatar} />
          </View>
          <Text style={[styles.bannerName, { color: colors.text }]}>{profile.name}</Text>
          <Text style={[styles.bannerDesignation, { color: colors.subText }]}>{profile.designation}</Text>
          <View style={[styles.deptBadge, { backgroundColor: colors.primary + '18' }]}>
            <Text style={[styles.deptBadgeText, { color: colors.primary }]}>{profile.department}</Text>
          </View>
        </View>

        {/* Quick Stats */}
        <View style={[styles.statsRow, { backgroundColor: colors.card }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.primary }]}>2</Text>
            <Text style={[styles.statLbl, { color: colors.subText }]}>Projects</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.primary }]}>8</Text>
            <Text style={[styles.statLbl, { color: colors.subText }]}>Students</Text>
          </View>
          <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statItem}>
            <Text style={[styles.statNum, { color: colors.primary }]}>3</Text>
            <Text style={[styles.statLbl, { color: colors.subText }]}>Requests</Text>
          </View>
        </View>

        {/* Personal Info */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text, borderBottomColor: colors.border }]}>
            Personal Information
          </Text>
          <InfoRow label="Full Name" value={profile.name} editKey="name" />
          <InfoRow label="Email Address" value={profile.email} editKey="email" />
          <InfoRow label="Phone Number" value={profile.phone} editKey="phone" />
        </View>

        {/* Academic Info */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.cardTitle, { color: colors.text, borderBottomColor: colors.border }]}>
            Academic Information
          </Text>
          <InfoRow label="Employee ID" value={profile.employeeId} />
          <InfoRow label="Designation" value={profile.designation} editKey="designation" />
          <InfoRow label="Department" value={profile.department} editKey="department" />
          <InfoRow label="Institute" value={profile.institute} editKey="institute" />
          <InfoRow label="Qualification" value={profile.qualification} editKey="qualification" />
          <InfoRow label="Specialization" value={profile.specialization} editKey="specialization" />
          <InfoRow label="Experience" value={profile.experience} editKey="experience" />
          <InfoRow label="Cabin No." value={profile.cabinNo} editKey="cabinNo" />
        </View>

      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editModal} transparent animationType="slide" onRequestClose={() => setEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>

            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Edit {editField?.label}
            </Text>

            <Text style={[styles.inputLabel, { color: colors.subText }]}>
              {editField?.label}
            </Text>
            <TextInput
              value={editValue}
              onChangeText={setEditValue}
              style={[styles.input, {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              }]}
              placeholder={`Enter ${editField?.label}`}
              placeholderTextColor={colors.subText}
              autoFocus
            />

            <View style={styles.modalBtns}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: colors.border }]}
                onPress={() => setEditModal(false)}
              >
                <Text style={[styles.cancelBtnText, { color: colors.subText }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: colors.primary }]}
                onPress={saveEdit}
              >
                <Text style={styles.saveBtnText}>Save</Text>
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
});