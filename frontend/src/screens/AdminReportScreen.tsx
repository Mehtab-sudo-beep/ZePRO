import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
  StatusBar,
  Image,
  Platform,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';
import { AlertContext } from '../context/AlertContext';
import { BASE_URL } from '../api/api';
import { getInstitutes } from '../api/instituteApi';
import { getDepartments } from '../api/departmentApi';

const AdminReportScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);
  const { theme, colors } = useContext(ThemeContext);
  const { showAlert } = useContext(AlertContext);

  const isDark = theme === 'dark';

  const [institutes, setInstitutes] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  
  const [selectedInstitute, setSelectedInstitute] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null); // null means 'All Departments'

  const [loadingInstitutes, setLoadingInstitutes] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [showInstituteModal, setShowInstituteModal] = useState(false);
  const [showDepartmentModal, setShowDepartmentModal] = useState(false);

  useEffect(() => {
    fetchInstitutes();
  }, []);

  const fetchInstitutes = async () => {
    try {
      setLoadingInstitutes(true);
      const res = await getInstitutes();
      setInstitutes(res.data);
    } catch (err: any) {
      showAlert('Error', 'Failed to load institutes');
    } finally {
      setLoadingInstitutes(false);
    }
  };

  const fetchDepartments = async (instId: string) => {
    try {
      setLoadingDepartments(true);
      const res = await getDepartments(instId);
      setDepartments(res.data);
    } catch (err: any) {
      showAlert('Error', 'Failed to load departments');
    } finally {
      setLoadingDepartments(false);
    }
  };

  const handleInstituteSelect = (inst: any) => {
    setSelectedInstitute(inst);
    setSelectedDepartment(null);
    setShowInstituteModal(false);
    fetchDepartments(inst.instituteId);
  };

  const handleDepartmentSelect = (dept: any) => {
    setSelectedDepartment(dept);
    setShowDepartmentModal(false);
  };

  const handleDownloadReport = async () => {
    if (!selectedInstitute) {
      showAlert('Error', 'Please select an Institute first.');
      return;
    }

    try {
      setDownloading(true);
      console.log('[AdminReportScreen] 📥 Downloading admin report...');

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      
      let deptQuery = '';
      let fileNameStr = `admin_report_${selectedInstitute.instituteName.replace(/\s+/g, '_')}`;
      if (selectedDepartment) {
        deptQuery = `?departmentId=${selectedDepartment.departmentId}`;
        fileNameStr += `_${selectedDepartment.departmentName.replace(/\s+/g, '_')}`;
      } else {
        fileNameStr += `_All_Departments`;
      }
      
      const fileName = `${fileNameStr}_${dateStr}_${timeStr}.pdf`;
      // @ts-ignore
      const fileUri = FileSystem.documentDirectory + fileName;

      const { uri } = await FileSystem.downloadAsync(
        `${BASE_URL}/admin/institutes/${selectedInstitute.instituteId}/report/pdf${deptQuery}`,
        fileUri,
        {
          headers: {
            'Authorization': `Bearer ${user!.token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );

      console.log('[AdminReportScreen] ✅ Report downloaded to:', uri);

      if (Platform.OS === 'android') {
        // @ts-ignore
        const { StorageAccessFramework } = FileSystem;
        const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (permissions.granted) {
          try {
            // @ts-ignore
            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
            const savedUri = await StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, 'application/pdf');
            // @ts-ignore
            await FileSystem.writeAsStringAsync(savedUri, base64, { encoding: FileSystem.EncodingType.Base64 });
            showAlert('Success', 'Report successfully saved to your chosen folder!');
          } catch (e: any) {
            showAlert('Error', 'Failed to write file to folder.');
          }
        } else {
          showAlert('Error', 'Folder permission was denied.');
        }
      } else {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Save Admin Report',
            UTI: 'com.adobe.pdf'
          });
        }
      }
    } catch (err: any) {
      showAlert('Error', 'Download failed: ' + err.message);
      console.log('[AdminReportScreen] ❌ Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  const SelectionModal = ({
    visible,
    title,
    data,
    onClose,
    onSelect,
    isDepartment = false,
  }: any) => (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>
            {title}
          </Text>
          
          <ScrollView style={{ maxHeight: 300 }}>
            {isDepartment && (
              <TouchableOpacity
                style={[
                  styles.modalItem,
                  { borderColor: colors.border },
                  !selectedDepartment && { backgroundColor: 'rgba(59,130,246,0.1)' }
                ]}
                onPress={() => onSelect(null)}
              >
                <Text style={{ color: !selectedDepartment ? colors.primary : colors.text, fontWeight: '600' }}>
                  All Departments
                </Text>
              </TouchableOpacity>
            )}
            
            {data.map((item: any) => {
              const id = isDepartment ? item.departmentId : item.instituteId;
              const name = isDepartment ? item.departmentName : item.instituteName;
              const isSelected = isDepartment ? selectedDepartment?.departmentId === id : selectedInstitute?.instituteId === id;
              
              return (
                <TouchableOpacity
                  key={id}
                  style={[
                    styles.modalItem,
                    { borderColor: colors.border },
                    isSelected && { backgroundColor: 'rgba(59,130,246,0.1)' }
                  ]}
                  onPress={() => onSelect(item)}
                >
                  <Text style={{ color: isSelected ? colors.primary : colors.text, fontWeight: '600' }}>{name}</Text>
                  {!isDepartment && <Text style={{ color: colors.subText, fontSize: 12 }}>Code: {item.instituteCode}</Text>}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.border }]}
            onPress={onClose}
          >
            <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image
            source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Report</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={{ color: colors.subText, fontSize: 12, fontWeight: '700', marginBottom: 8 }}>
          SELECT INSTITUTE
        </Text>
        <TouchableOpacity
          style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowInstituteModal(true)}
        >
          <Text style={{ color: selectedInstitute ? colors.text : colors.subText, fontSize: 16, fontWeight: '500' }}>
            {selectedInstitute ? selectedInstitute.instituteName : 'Select an Institute'}
          </Text>
          <Text style={{ color: colors.subText, fontSize: 18 }}>▾</Text>
        </TouchableOpacity>

        {selectedInstitute && (
          <>
            <Text style={{ color: colors.subText, fontSize: 12, fontWeight: '700', marginBottom: 8, marginTop: 16 }}>
              SELECT DEPARTMENT
            </Text>
            <TouchableOpacity
              style={[styles.selector, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={() => setShowDepartmentModal(true)}
            >
              <Text style={{ color: colors.text, fontSize: 16, fontWeight: '500' }}>
                {selectedDepartment ? selectedDepartment.departmentName : 'All Departments'}
              </Text>
              <Text style={{ color: colors.subText, fontSize: 18 }}>▾</Text>
            </TouchableOpacity>
          </>
        )}

        <View style={{ marginTop: 32 }}>
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 12 }}>Download Team Report</Text>
            <Text style={{ color: colors.subText, fontSize: 13, marginBottom: 16 }}>
              Generate and download a fresh PDF report of teams for the selected configuration.
            </Text>
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: selectedInstitute ? colors.primary : colors.border }
              ]}
              onPress={handleDownloadReport}
              disabled={downloading || !selectedInstitute}
            >
              {downloading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={{ color: selectedInstitute ? '#fff' : colors.subText, fontWeight: '700', fontSize: 14 }}>
                  Download Report
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>

      {/* MODALS */}
      <SelectionModal
        visible={showInstituteModal}
        title="Select Institute"
        data={institutes}
        onClose={() => setShowInstituteModal(false)}
        onSelect={handleInstituteSelect}
      />

      <SelectionModal
        visible={showDepartmentModal}
        title="Select Department"
        data={departments}
        onClose={() => setShowDepartmentModal(false)}
        onSelect={handleDepartmentSelect}
        isDepartment
      />

    </SafeAreaView>
  );
};

export default AdminReportScreen;

// ───────── STYLES ─────────
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, justifyContent: 'center', alignItems: 'flex-start' },
  backIcon: { width: 22, height: 22, resizeMode: 'contain' },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  button: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    borderRadius: 16,
    padding: 20,
    elevation: 5,
  },
  modalItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderRadius: 8,
  },
  closeBtn: {
    marginTop: 16,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
});
