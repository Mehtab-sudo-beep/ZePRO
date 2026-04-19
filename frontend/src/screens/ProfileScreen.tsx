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

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

// ✅ OUTSIDE
const InfoItem = ({ label, value, editKey, onEdit, isLink, colors, user }: any) => {
  const displayValue = isLink && value ? "View Document" : (value || '-');
  
  const handlePress = async () => {
    if (isLink && value) {
      const url = value.startsWith('http') ? value : `${BASE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
      
      try {
        const filename = encodeURIComponent(value.split('/').pop() || 'document.pdf');
        const fileUri = `${FileSystem.documentDirectory}${filename}`;
        
        console.log('[ProfileScreen] Downloading:', url, 'to:', fileUri);

        const options: any = {};
        if (user && user.token) {
          options.headers = { Authorization: `Bearer ${user.token}` };
        }

        const downloadedFile = await FileSystem.downloadAsync(url, fileUri, options);
        
        console.log('[ProfileScreen] Download Status:', downloadedFile.status);

        if (downloadedFile.status === 200) {
          if (Platform.OS === 'android') {
            try {
              const contentUri = await FileSystem.getContentUriAsync(downloadedFile.uri);
              await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                data: contentUri,
                flags: 1, // FLAG_GRANT_READ_URI_PERMISSION
                type: 'application/pdf',
              });
            } catch (err: any) {
              // Fallback to sharing if no PDF viewer exists
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(downloadedFile.uri, { mimeType: 'application/pdf' });
              }
            }
          } else {
            // iOS handles PDF perfectly via share sheet's QuickLook
            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(downloadedFile.uri, { UTI: 'public.data', mimeType: 'application/pdf' });
            } else {
              Alert.alert('Error', 'No application available to open this format.');
            }
          }
        } else {
          Alert.alert('Error', `Server returned status: ${downloadedFile.status}`);
        }
      } catch (err: any) {
        console.log('[ProfileScreen] Error downloading file:', err);
        Alert.alert('Error', `Unable to fetch file: ${err.message || JSON.stringify(err)}`);
      }
    }
  };

  return (
    <View style={[styles.item, { borderColor: colors.border }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.label, { color: colors.subText }]}>{label}</Text>
        <TouchableOpacity onPress={handlePress} disabled={!isLink}>
          <Text style={[
            styles.value, 
            { color: isLink ? colors.primary : colors.text },
            isLink && { textDecorationLine: 'underline' }
          ]}>
            {displayValue}
          </Text>
        </TouchableOpacity>
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

          <InfoItem
            label="Resume Document"
            value={profile.resumeLink}
            editKey="resumeLink"
            onEdit={openEdit}
            isLink={true}
            colors={colors}
            user={user}
          />

          <InfoItem
            label="Marksheet Document"
            value={profile.marksheetLink}
            editKey="marksheetLink"
            onEdit={openEdit}
            isLink={true}
            colors={colors}
            user={user}
          />
        </ScrollView>

      </View>

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
