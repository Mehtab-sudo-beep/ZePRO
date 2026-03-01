import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';

const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, setUser } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const isDark = theme === 'dark';

  const [editNameVisible, setEditNameVisible] = useState(false);
  const [editPasswordVisible, setEditPasswordVisible] = useState(false);

  const [newName, setNewName] = useState(user?.name || '');
  const [newPassword, setNewPassword] = useState('');

  const saveName = () => {
    if (!user) return;
    setUser({ ...user, name: newName });
    setEditNameVisible(false);
  };
  return (
    <SafeAreaView style={[styles.safeArea, isDark && styles.darkBg]}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, isDark && styles.darkCard]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.back, isDark && styles.darkText]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, isDark && styles.darkText]}>
            Settings
          </Text>
        </View>

        {/* ACCOUNT SECTION */}
        <Text style={[styles.sectionTitle, isDark && styles.darkSubText]}>
          Account
        </Text>

        <TouchableOpacity
          style={[styles.row, isDark && styles.darkCard]}
          onPress={() => setEditNameVisible(true)}
        >
          <Text style={[styles.rowText, isDark && styles.darkText]}>
            Change Name
          </Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.row, isDark && styles.darkCard]}
          onPress={() => setEditPasswordVisible(true)}
        >
          <Text style={[styles.rowText, isDark && styles.darkText]}>
            Change Password
          </Text>
          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* APPEARANCE SECTION */}
        <Text style={[styles.sectionTitle, isDark && styles.darkSubText]}>
          Appearance
        </Text>

        <View style={[styles.row, isDark && styles.darkCard]}>
          <Text style={[styles.rowText, isDark && styles.darkText]}>
            Dark Mode
          </Text>
          <Switch value={isDark} onValueChange={toggleTheme} />
        </View>

        {/* ---------- EDIT NAME MODAL ---------- */}
        <Modal visible={editNameVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, isDark && styles.darkCard]}>
              <Text style={[styles.modalTitle, isDark && styles.darkText]}>
                Enter New Name
              </Text>
              <TextInput
                value={newName}
                onChangeText={setNewName}
                style={[styles.input, isDark && styles.darkInput]}
              />
              <TouchableOpacity style={styles.saveBtn} onPress={saveName}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* ---------- EDIT PASSWORD MODAL ---------- */}
        <Modal visible={editPasswordVisible} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, isDark && styles.darkCard]}>
              <Text style={[styles.modalTitle, isDark && styles.darkText]}>
                Enter New Password
              </Text>
              <TextInput
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
                style={[styles.input, isDark && styles.darkInput]}
              />
              <TouchableOpacity
                style={styles.saveBtn}
                onPress={() => setEditPasswordVisible(false)}
              >
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
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
  container: { flex: 1, paddingHorizontal: 16 },

  header: {
    height: 60,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    elevation: 4,
  },

  headerTitle: { fontSize: 18, fontWeight: '600', marginLeft: 10 },
  back: { fontSize: 22 },

  sectionTitle: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
  },

  row: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 10,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  rowText: { fontSize: 15 },
  arrow: { fontSize: 18, color: '#9CA3AF' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20,
  },

  modalBox: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 12,
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },

  input: {
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },

  saveBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  saveText: { color: '#FFFFFF', fontWeight: '600' },

  /* DARK MODE */
  darkBg: { backgroundColor: '#111827' },
  darkCard: { backgroundColor: '#1F2937' },
  darkText: { color: '#FFFFFF' },
  darkSubText: { color: '#9CA3AF' },
  darkInput: { backgroundColor: '#374151', color: '#FFFFFF' },
});
