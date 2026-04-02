import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
//import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';

import {
  getStudentProfile,
  updateStudentProfile,
} from '../api/studentApi';

// ✅ OUTSIDE
const InfoItem = ({ label, value, editKey, onEdit, colors }: any) => (
  <View style={[styles.item, { borderColor: colors.border }]}>
    <View style={{ flex: 1 }}>
      <Text style={[styles.label, { color: colors.subText }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>
        {value || '-'}
      </Text>
    </View>

    {editKey && (
      <TouchableOpacity onPress={() => onEdit(editKey, label, value)}>
        <Text style={{ color: colors.primary }}>Edit</Text>
      </TouchableOpacity>
    )}
  </View>
);

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, setUser } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const isDark = colors.background === '#111827';

  const [profile, setProfile] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const [modal, setModal] = useState(false);
  const [editField, setEditField] = useState<any>(null);
  const [value, setValue] = useState('');

  useEffect(() => {
    const load = async () => {
      const data = await getStudentProfile();
      setProfile(data);
      setLoading(false);
    };
    load();
  }, []);

  const openEdit = (key: string, label: string, val: string) => {
    setEditField({ key, label });
    setValue(val || '');
    setModal(true);
  };

  const save = async () => {

    const updated = { ...profile, [editField.key]: value };

    const data = await updateStudentProfile(updated);
    setProfile(data);

    if (editField.key === 'name') {
      setUser({ ...user, name: data.name });
    }

    setModal(false);
    Alert.alert('Updated');
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
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
            Profile
          </Text>
        </View>

        {/* Top */}
        <View style={[styles.profileHeader, { backgroundColor: colors.card }]}>
          <Image
            source={require('../assets/avatar.png')}
            style={styles.profileImage}
          />

          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {profile.name}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.subText }]}>
              {profile.email}
            </Text>
          </View>
        </View>

        {/* Details */}
        <ScrollView style={[styles.list, { backgroundColor: colors.card }]}>
          <InfoItem label="Department" value={profile.department} colors={colors} />
          <InfoItem label="Team" value={profile.teamName} colors={colors} />
          <InfoItem
            label="Role"
            value={profile.isTeamLead ? 'Team Lead' : 'Member'}
            colors={colors}
          />

          <InfoItem
            label="Name"
            value={profile.name}
            editKey="name"
            onEdit={openEdit}
            colors={colors}
          />

          <InfoItem
            label="Resume Link (Drive)"
            value={profile.resumeLink}
            editKey="resumeLink"
            onEdit={openEdit}
            colors={colors}
          />

          <InfoItem
            label="Marksheet Link (Drive)"
            value={profile.marksheetLink}
            editKey="marksheetLink"
            onEdit={openEdit}
            colors={colors}
          />
        </ScrollView>

      </View>

      {/* Modal */}
      <Modal visible={modal} transparent>
        <View style={styles.modal}>
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <Text>Edit {editField?.label}</Text>
            <TextInput value={value} onChangeText={setValue} style={styles.input} />
            <TouchableOpacity onPress={save}>
              <Text>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },

  backIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },

  profileHeader: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },

  profileInfo: {
    marginLeft: 16,
  },

  profileName: {
    fontSize: 16,
    fontWeight: '600',
  },

  profileEmail: {
    fontSize: 13,
    marginTop: 4,
  },

  list: {
    marginTop: 12,
    paddingHorizontal: 16,
    flex: 1,
  },

  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
  },

  label: {
    fontSize: 14,
  },

  value: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 4,
  },

  modal: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#00000088',
    padding: 20,
  },

  modalBox: {
    padding: 20,
    borderRadius: 12,
  },

  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
  },
});
