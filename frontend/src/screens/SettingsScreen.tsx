import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';
import { AlertContext } from '../context/AlertContext';
import API from '../api/api';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, setUser } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { showAlert } = useContext(AlertContext);

  const isDark = theme === 'dark';

  const [editNameVisible, setEditNameVisible] = useState(false);
  const [editPasswordVisible, setEditPasswordVisible] = useState(false);
  const [editPhoneVisible, setEditPhoneVisible] = useState(false);
  const [deleteAccountVisible, setDeleteAccountVisible] = useState(false);

  const [newName, setNewName] = useState(user?.name || '');

  const [newPhone, setNewPhone] = useState(user?.phone || '');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [notifEnabled, setNotifEnabled] = useState(user?.pushNotifications ?? true);
  const [emailNotif, setEmailNotif] = useState(user?.emailNotifications ?? true);

  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const saveName = async () => {
    if (!user) return;
    if (!newName.trim()) {
      showAlert('Error', 'Name cannot be empty.');
      return;
    }
    try {
      await API.put('/auth/update-profile', { name: newName.trim(), email: user.email, phone: user.phone || '' });
      setUser({ ...user, name: newName.trim() });
      setEditNameVisible(false);
      showAlert('Success', 'Name updated successfully.');
    } catch (e: any) {
      showAlert('Error', e.response?.data?.message || 'Failed to update name');
    }
  };



  const savePassword = async () => {
    if (!user) return;
    if (!currentPassword) {
      showAlert('Error', 'Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      showAlert('Error', 'New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showAlert('Error', 'New passwords do not match.');
      return;
    }
    if (currentPassword === newPassword) {
      showAlert('Error', 'New password must be different from current password.');
      return;
    }

    try {
      await API.post('/auth/change-password', {
        email: user.email,
        currentPassword,
        newPassword
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setEditPasswordVisible(false);
      showAlert('Success', 'Password updated successfully.');
    } catch (err: any) {
      showAlert('Error', err.response?.data?.message || 'Failed to change password');
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE') {
      showAlert('Error', 'Please type DELETE to confirm.');
      return;
    }
    try {
      await API.delete('/auth/delete-account');
      setUser(null);
      navigation.replace('Login');
    } catch (e) {
      showAlert('Error', 'Failed to delete account');
    }
  };

  const card = [styles.row, isDark && styles.darkCard];
  const txt = [styles.rowText, isDark && styles.darkText];
  const modalBox = [styles.modalBox, isDark && styles.darkCard];
  const modalTitle = [styles.modalTitle, isDark && styles.darkText];
  const inputStyle = [styles.input, isDark && styles.darkInput];

  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.darkBg]}>
      <View style={styles.container}>

        {/* Header */}
        <View style={[styles.header, isDark && styles.darkCard]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Image
            source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
            style={styles.backIcon}
          />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark && styles.darkText]}>Settings</Text>
        </View>

        <ScrollView contentContainerStyle={styles.scroll}>

          {/* ── ACCOUNT ── */}
          <Text style={[styles.sectionTitle, isDark && styles.darkSubText]}>Account</Text>

          <TouchableOpacity style={card} onPress={() => setEditNameVisible(true)}>
            <Text style={txt}>Change Name</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>



          <TouchableOpacity style={card} onPress={() => setEditPhoneVisible(true)}>
            <Text style={txt}>Change Phone Number</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity style={card} onPress={() => setEditPasswordVisible(true)}>
            <Text style={txt}>Change Password</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          {/* ── NOTIFICATIONS ── */}
          <Text style={[styles.sectionTitle, isDark && styles.darkSubText]}>Notifications</Text>

          <View style={card}>
            <Text style={txt}>Push Notifications</Text>
            <Switch 
              value={notifEnabled} 
              onValueChange={async (val) => {
                setNotifEnabled(val);
                if (user) {
                  setUser({ ...user, pushNotifications: val });
                  try {
                    await API.put('/auth/notifications', { email: user.email, emailNotifications: emailNotif, pushNotifications: val });
                  } catch (e) {
                    console.error('Failed to update push notifications', e);
                  }
                }
              }} 
            />
          </View>

          <View style={card}>
            <Text style={txt}>Email Notifications</Text>
            <Switch 
              value={emailNotif} 
              onValueChange={async (val) => {
                setEmailNotif(val);
                if (user) {
                  setUser({ ...user, emailNotifications: val });
                  try {
                    await API.put('/auth/notifications', { email: user.email, emailNotifications: val, pushNotifications: notifEnabled });
                  } catch (e) {
                    console.error('Failed to update email notifications', e);
                  }
                }
              }} 
            />
          </View>

          {/* ── APPEARANCE ── */}
          <Text style={[styles.sectionTitle, isDark && styles.darkSubText]}>Appearance</Text>

          <View style={card}>
            <Text style={txt}>Dark Mode</Text>
            <Switch value={isDark} onValueChange={toggleTheme} />
          </View>

          {/* ── SUPPORT ── */}
          <Text style={[styles.sectionTitle, isDark && styles.darkSubText]}>Support</Text>

          <TouchableOpacity style={card} onPress={() => showAlert('User Manual for Faculty', 'Opens after complteion of project')}>
            <Text style={txt}>User Manual</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={card}
            onPress={() => showAlert('Privacy Policy', 'Opens privacy policy page.')}
          >
            <Text style={txt}>Privacy Policy</Text>
            <Text style={styles.arrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={card}
            onPress={() => showAlert('Version', 'App Version: 1.0.0')}
          >
            <Text style={txt}>About / Version</Text>
            <Text style={[styles.arrow, { fontSize: 13 }]}>1.0.0</Text>
          </TouchableOpacity>

          {/* ── DANGER ZONE ── */}
          <Text style={[styles.sectionTitle, { color: '#DC2626' }]}>Danger Zone</Text>

          <TouchableOpacity
            style={[card, { borderWidth: 1, borderColor: '#DC2626' }]}
            onPress={() => setDeleteAccountVisible(true)}
          >
            <Text style={[styles.rowText, { color: '#DC2626' }]}>Delete Account</Text>
            <Text style={[styles.arrow, { color: '#DC2626' }]}>›</Text>
          </TouchableOpacity>

        </ScrollView>

        {/* ════ CHANGE NAME MODAL ════ */}
        <Modal visible={editNameVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={modalBox}>
              <Text style={modalTitle}>Change Name</Text>
              <Text style={[styles.inputLabel, isDark && styles.darkSubText]}>New Name</Text>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                style={inputStyle}
                placeholder="Enter new name"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              />
              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditNameVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={saveName}>
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>



        {/* ════ CHANGE PHONE MODAL ════ */}
        <Modal visible={editPhoneVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={modalBox}>
              <Text style={modalTitle}>Change Phone Number</Text>
              <Text style={[styles.inputLabel, isDark && styles.darkSubText]}>Phone Number</Text>
              <TextInput
                value={newPhone}
                onChangeText={setNewPhone}
                style={inputStyle}
                keyboardType="phone-pad"
                placeholder="+91 XXXXX XXXXX"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
              />
              <View style={styles.modalBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditPhoneVisible(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.saveBtn}
                  onPress={async () => {
                    try {
                      await API.put('/auth/update-profile', { name: user?.name || '', email: user?.email || '', phone: newPhone.trim() });
                      setUser({ ...user, phone: newPhone.trim() });
                      setEditPhoneVisible(false);
                      showAlert('Success', 'Phone number updated.');
                    } catch (e: any) {
                      showAlert('Error', 'Failed to update phone');
                    }
                  }}
                >
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ════ CHANGE PASSWORD MODAL ════ */}
        <Modal visible={editPasswordVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={modalBox}>
              <Text style={modalTitle}>Change Password</Text>

              <Text style={[styles.inputLabel, isDark && styles.darkSubText]}>Current Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  secureTextEntry={!showCurrent}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  style={[inputStyle, { flex: 1 }]}
                  placeholder="Enter current password"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowCurrent(p => !p)}>
                  <Text style={styles.eyeText}>{showCurrent ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, isDark && styles.darkSubText]}>New Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  secureTextEntry={!showNew}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  style={[inputStyle, { flex: 1 }]}
                  placeholder="Enter new password"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowNew(p => !p)}>
                  <Text style={styles.eyeText}>{showNew ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>

              <Text style={[styles.inputLabel, isDark && styles.darkSubText]}>Confirm New Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  secureTextEntry={!showConfirm}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={[inputStyle, { flex: 1 }]}
                  placeholder="Re-enter new password"
                  placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm(p => !p)}>
                  <Text style={styles.eyeText}>{showConfirm ? 'Hide' : 'Show'}</Text>
                </TouchableOpacity>
              </View>

              {newPassword.length > 0 && (
                <Text style={[
                  styles.strengthText,
                  { color: newPassword.length < 6 ? '#DC2626' : newPassword.length < 10 ? '#F59E0B' : '#16A34A' }
                ]}>
                  {newPassword.length < 6 ? 'Weak' : newPassword.length < 10 ? 'Medium' : 'Strong'} password
                </Text>
              )}

              <View style={styles.modalBtns}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setEditPasswordVisible(false);
                  }}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveBtn} onPress={savePassword}>
                  <Text style={styles.saveText}>Update</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* ════ DELETE ACCOUNT MODAL ════ */}
        <Modal visible={deleteAccountVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={modalBox}>
              <Text style={[modalTitle, { color: '#DC2626' }]}>Delete Account</Text>
              <Text style={[styles.inputLabel, isDark && styles.darkSubText, { marginBottom: 12, lineHeight: 20 }]}>
                This action is permanent and cannot be undone. Type{' '}
                <Text style={{ fontWeight: '700', color: '#DC2626' }}>DELETE</Text>{' '}
                to confirm.
              </Text>
              <TextInput
                value={deleteConfirmText}
                onChangeText={setDeleteConfirmText}
                style={inputStyle}
                placeholder="Type DELETE"
                placeholderTextColor={isDark ? '#9CA3AF' : '#6B7280'}
                autoCapitalize="characters"
              />
              <View style={styles.modalBtns}>
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => {
                    setDeleteConfirmText('');
                    setDeleteAccountVisible(false);
                  }}
                >
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveBtn, { backgroundColor: '#DC2626' }]}
                  onPress={handleDeleteAccount}
                >
                  <Text style={styles.saveText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 40 },

  header: {
    height: 60,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    elevation: 4,
  },
  headerTitle: { fontSize: 18, fontWeight: '600', marginLeft: 10 },
  back: { fontSize: 22 },
  backIcon: { width: 22, height: 22, resizeMode: 'contain' },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    paddingHorizontal: 4,
  },

  row: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 1,
  },

  rowText: { fontSize: 15 },
  arrow: { fontSize: 18, color: '#9CA3AF' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 14,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 16 },
  inputLabel: { fontSize: 13, color: '#6B7280', marginBottom: 6, marginTop: 4 },

  input: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 14,
    color: '#111827',
  },

  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  eyeBtn: { paddingHorizontal: 10 },
  eyeText: { fontSize: 13, color: '#2563EB', fontWeight: '600' },

  strengthText: { fontSize: 12, marginBottom: 12, fontWeight: '600' },

  modalBtns: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 4 },

  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  cancelText: { color: '#6B7280', fontWeight: '600' },

  saveBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveText: { color: '#FFFFFF', fontWeight: '600' },

  darkBg: { backgroundColor: '#111827' },
  darkCard: { backgroundColor: '#1F2937' },
  darkText: { color: '#FFFFFF' },
  darkSubText: { color: '#9CA3AF' },
  darkInput: { backgroundColor: '#374151', color: '#FFFFFF' },
});