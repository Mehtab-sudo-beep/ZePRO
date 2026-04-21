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
  Linking,
  Platform,
} from 'react-native';
import * as IntentLauncher from 'expo-intent-launcher';

import { SafeAreaView } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import { BASE_URL } from '../api/api';
import { useNavigation } from '@react-navigation/native';
//import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';

import {
  getStudentProfile,
  updateStudentProfile,
} from '../api/studentApi';
import { uploadProfilePicture } from '../api/authApi';
import * as ImagePicker from 'expo-image-picker';

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import DocumentCard from '../components/DocumentCard';

const InfoItem = ({ label, value, editKey, onEdit, isLink, colors, user }: any) => {
  const displayValue = value || '-';

  return (
    <View style={[styles.item, { borderColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: colors.subText }]}>{label}</Text>
        <Text style={[
          styles.value, 
          { color: colors.text }
        ]}>
          {displayValue}
        </Text>
      </View>

      {editKey && (
        <TouchableOpacity onPress={() => onEdit(editKey, label, value)}>
          <Text style={{ color: colors.primary }}>Edit</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

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
  const [selectedFile, setSelectedFile] = useState<any>(null);

  useEffect(() => {
    const load = async () => {
      const data = await getStudentProfile();
      setProfile(data);
      setLoading(false);
    };
    load();
  }, []);

  const [picModal, setPicModal] = useState(false);

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const formData = new FormData() as any;
      formData.append('email', user?.email || '');
      formData.append('file', {
        uri: asset.uri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      });

      try {
        const res = await uploadProfilePicture(formData);
        const newUrl = res.data;
        setUser({ ...user, profilePictureUrl: newUrl });
        Alert.alert('Success', 'Profile picture updated');
        setPicModal(false);
      } catch (err) {
        console.log('Upload error:', err);
        Alert.alert('Error', 'Failed to upload picture');
      }
    }
  };

  const getAvatarSource = () => {
    if (user?.profilePictureUrl) {
      return { uri: user.profilePictureUrl.startsWith('http') ? user.profilePictureUrl : `${BASE_URL}${user.profilePictureUrl}` };
    }
    return require('../assets/avatar.png');
  };

  const openEdit = (key: string, label: string, val: string) => {
    setEditField({ key, label });
    setValue(val || '');
    setSelectedFile(null); // Reset when opening
    setModal(true);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (err) {
      console.log('Error picking document', err);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const save = async () => {
    let updated;
    
    // Determine if we're uploading a new file or updating regular text
    if (editField.key === 'resumeLink' || editField.key === 'marksheetLink') {
      const fileKey = editField.key === 'resumeLink' ? 'resumeFile' : 'marksheetFile';
      updated = { ...profile };
      
      // Only include if a new file was actually selected
      if (selectedFile) {
        updated[fileKey] = selectedFile;
      } else {
        // If they click Save without selecting, just close
        setModal(false);
        return;
      }
    } else {
      updated = { ...profile, [editField.key]: value };
    }

    try {
      const data = await updateStudentProfile(updated);
      setProfile(data);

      if (editField.key === 'name') {
        setUser({ ...user, name: data.name });
      }

      setModal(false);
      Alert.alert('Updated successfully');
    } catch (err) {
      Alert.alert('Error', 'Failed to update profile');
      console.log(err);
    }
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
          <TouchableOpacity onPress={() => setPicModal(true)}>
            <Image
              source={getAvatarSource()}
              style={styles.profileImage}
            />
            <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary, borderRadius: 12, padding: 4 }}>
              <Text style={{ color: 'white', fontSize: 10 }}>Edit</Text>
            </View>
          </TouchableOpacity>

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
          <InfoItem label="Department" value={profile.department} colors={colors} user={user} />
          <InfoItem label="Team" value={profile.teamName} colors={colors} user={user} />
          <InfoItem
            label="Role"
            value={profile.isTeamLead ? 'Team Lead' : 'Member'}
            colors={colors}
            user={user}
          />

          <InfoItem
            label="Name"
            value={profile.name}
            editKey="name"
            onEdit={openEdit}
            colors={colors}
            user={user}
          />

          <DocumentCard
            label="Resume Document"
            value={profile.resumeLink}
            colors={colors}
            user={user}
            onEdit={() => openEdit("resumeLink", "Resume Document", profile.resumeLink)}
          />

          <DocumentCard
            label="Marksheet Document"
            value={profile.marksheetLink}
            colors={colors}
            user={user}
            onEdit={() => openEdit("marksheetLink", "Marksheet Document", profile.marksheetLink)}
          />
        </ScrollView>

      </View>

      {/* Picture View/Edit Modal */}
      <Modal visible={picModal} transparent animationType="fade">
        <TouchableOpacity style={styles.modal} activeOpacity={1} onPress={() => setPicModal(false)}>
          <View style={[styles.modalBox, { backgroundColor: colors.card, alignItems: 'center' }]}>
            <Image
              source={getAvatarSource()}
              style={{ width: 200, height: 200, borderRadius: 100, marginBottom: 20 }}
            />
            <TouchableOpacity style={styles.filePickerBtn} onPress={handlePickImage}>
              <Text style={{ color: '#fff', fontWeight: '500' }}>Change Picture</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setPicModal(false)} style={{ marginTop: 15 }}>
              <Text style={{ color: colors.subText }}>Close</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal */}
      <Modal visible={modal} transparent animationType="fade">
        <TouchableOpacity style={styles.modal} activeOpacity={1} onPress={() => setModal(false)}>
          <View style={[styles.modalBox, { backgroundColor: colors.card }]}>
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 15 }}>
              Edit {editField?.label}
            </Text>
            
            {(editField?.key === 'resumeLink' || editField?.key === 'marksheetLink') ? (
              <TouchableOpacity style={styles.filePickerBtn} onPress={pickDocument}>
                <Text style={{ color: '#fff', fontWeight: '500' }}>
                  {selectedFile ? `Selected: ${selectedFile.name}` : 'Select New Document'}
                </Text>
              </TouchableOpacity>
            ) : (
              <TextInput 
                value={value} 
                onChangeText={setValue} 
                style={[styles.input, { color: colors.text, borderColor: colors.border }]} 
              />
            )}

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20 }}>
              <TouchableOpacity onPress={() => setModal(false)} style={{ marginRight: 20, padding: 10 }}>
                <Text style={{ color: colors.subText }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={save} style={{ padding: 10 }}>
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
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
    padding: 24,
    borderRadius: 16,
    marginHorizontal: 10,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }
  },

  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 10,
    marginVertical: 10,
    fontSize: 16,
  },

  filePickerBtn: {
    backgroundColor: '#3B82F6',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  }
});
