import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import { BASE_URL } from '../api/api';
import { AlertContext } from '../context/AlertContext';

interface DocumentCardProps {
  label: string;
  value: string | null | undefined;
  colors: any;
  user?: any;
  onEdit?: () => void;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ label, value, colors, user, onEdit }) => {
  const { showAlert } = useContext(AlertContext);
  if (!value) {
    return (
      <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.card }]}>
        <View style={styles.leftContent}>
          <View style={[styles.iconContainer, { backgroundColor: colors.background }]}>
            <Ionicons name="document-text-outline" size={24} color={colors.subText} />
          </View>
          <View style={styles.textContent}>
            <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
            <Text style={[styles.value, { color: colors.subText }]}>No document uploaded</Text>
          </View>
        </View>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
            <Text style={{ color: colors.primary, fontWeight: '600' }}>Upload</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const filename = value.split('/').pop() || 'document.pdf';

  const downloadFile = async (action: 'view' | 'download') => {
    const url = value.startsWith('http') ? value : `${BASE_URL}${value.startsWith('/') ? '' : '/'}${value}`;
    const fileUri = `${FileSystem.documentDirectory}${filename}`;

    try {
      const options: any = {};
      if (user && user.token) {
        options.headers = { Authorization: `Bearer ${user.token}` };
      }

      const downloadedFile = await FileSystem.downloadAsync(url, fileUri, options);

      if (downloadedFile.status === 200) {
        if (action === 'download') {
           if (Platform.OS === 'android') {
              const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
              if (permissions.granted) {
                const base64 = await FileSystem.readAsStringAsync(downloadedFile.uri, { encoding: FileSystem.EncodingType.Base64 });
                const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, filename, 'application/pdf');
                await FileSystem.writeAsStringAsync(newFileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
                showAlert('Success', 'File downloaded successfully.');
              }
           } else {
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(downloadedFile.uri, { UTI: 'public.data', mimeType: 'application/pdf' });
              }
           }
        } else {
          // View Action
          if (Platform.OS === 'android') {
            try {
              const contentUri = await FileSystem.getContentUriAsync(downloadedFile.uri);
              await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
                data: contentUri,
                flags: 1, 
                type: 'application/pdf',
              });
            } catch (err: any) {
              if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(downloadedFile.uri, { mimeType: 'application/pdf' });
              }
            }
          } else {
            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(downloadedFile.uri, { UTI: 'public.data', mimeType: 'application/pdf' });
            } else {
              showAlert('Error', 'No application available to open this format.');
            }
          }
        }
      } else {
        showAlert('Error', `Server returned status: ${downloadedFile.status}`);
      }
    } catch (err: any) {
      console.log('Error processing document', err);
      showAlert('Error', `Failed to process document: ${err.message}`);
    }
  };

  return (
    <View style={[styles.container, { borderColor: colors.border, backgroundColor: colors.card }]}>
      <TouchableOpacity 
        style={styles.leftContent} 
        onPress={() => downloadFile('view')}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, { backgroundColor: `${colors.primary}15` }]}>
          <Ionicons name="document-text" size={24} color={colors.primary} />
        </View>
        <View style={styles.textContent}>
          <Text style={[styles.label, { color: colors.text }]} numberOfLines={1}>{label}</Text>
          <Text style={[styles.value, { color: colors.subText }]} numberOfLines={1}>{filename}</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity onPress={() => downloadFile('download')} style={styles.iconBtn}>
          <Ionicons name="download-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
        {onEdit && (
          <TouchableOpacity onPress={onEdit} style={[styles.iconBtn, { marginLeft: 10 }]}>
            <Ionicons name="pencil-outline" size={22} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 12,
  },
  leftContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContent: {
    flex: 1,
    paddingRight: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  value: {
    fontSize: 13,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'transparent',
  },
  actionBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  }
});

export default DocumentCard;
