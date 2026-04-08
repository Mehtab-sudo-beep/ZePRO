import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertContext } from '../context/AlertContext';
import { getDepartments, addDepartment, deleteDepartment } from '../api/departmentApi';
import { BottomTab } from './InstituteListScreen';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'DepartmentList'>;
type RouteP = RouteProp<RootStackParamList, 'DepartmentList'>;

interface Props {
  navigation: NavProp;
  route: RouteP;
}

interface Department {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  institute?: {
    instituteId: string;
    instituteName: string;
  };
}

const DepartmentListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { instituteId, instituteName } = route.params;
  const { showAlert } = useContext(AlertContext);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [newDept, setNewDept] = useState({
    departmentName: '',
    departmentCode: '',
    description: '',
  });

  // ✅ LOAD DEPARTMENTS FROM BACKEND
  const loadDepartments = async () => {
    try {
      setLoading(true);
      console.log('[DepartmentList] 📡 Fetching departments for institute:', instituteId);

      const response = await getDepartments(instituteId);
      console.log('[DepartmentList] ✅ Departments loaded:', response.data);

      setDepartments(response.data || []);
    } catch (error: any) {
      console.log('[DepartmentList] ❌ Error:', error.message);
      showAlert('Error', error.response?.data?.error || 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOAD ON SCREEN FOCUS
  useFocusEffect(
    React.useCallback(() => {
      loadDepartments();
    }, [instituteId])
  );

  // ✅ FILTER DEPARTMENTS
  const filtered = departments.filter(d =>
    d.departmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.departmentCode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ VALIDATE FORM
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!newDept.departmentName.trim()) {
      newErrors.departmentName = 'Department name is required';
    }

    if (!newDept.departmentCode.trim()) {
      newErrors.departmentCode = 'Department code is required';
    }

    return newErrors;
  };

  // ✅ HANDLE ADD DEPARTMENT
  const handleAdd = async () => {
    console.log('[DepartmentList] 🚀 Adding department...');

    const validationErrors = validateForm();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showAlert('Validation Error', 'Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        departmentName: newDept.departmentName,
        departmentCode: newDept.departmentCode.toUpperCase(),
        instituteId: instituteId,
        description: newDept.description || '',
      };

      console.log('[DepartmentList] 📤 Payload:', payload);

      const response = await addDepartment(payload);

      console.log('[DepartmentList] ✅ Department added:', response.data);

      setDepartments([...departments, response.data]);
      setNewDept({ departmentName: '', departmentCode: '', description: '' });
      setErrors({});
      setShowAddModal(false);

      showAlert('Success', `${response.data.departmentName} added successfully!`, [
        {
          text: 'OK',
          onPress: () => {},
          style: 'default',
        }
      ]);

    } catch (error: any) {
      console.log('[DepartmentList] ❌ Error:', error.message);
      showAlert('Error', error.response?.data?.error || 'Failed to create department');
    } finally {
      setSubmitting(false);
    }
  };

  // ✅ HANDLE DELETE DEPARTMENT
  const handleDelete = (id: string, name: string) => {
    showAlert('Confirm Delete', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            console.log('[DepartmentList] 🗑 Deleting:', id);

            await deleteDepartment(id);

            console.log('[DepartmentList] ✅ Deleted successfully');

            setDepartments(departments.filter(d => d.departmentId !== id));
            showAlert('Success', 'Department deleted successfully');
          } catch (error: any) {
            console.log('[DepartmentList] ❌ Error:', error.message);
            showAlert('Error', error.response?.data?.error || 'Failed to delete department');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  const handleChange = (field: string, value: string) => {
    setNewDept(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{instituteName}</Text>
            <Text style={styles.headerSubtitle}>Departments</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#4F46E5' }]}>{departments.length}</Text>
            <Text style={styles.statLabel}>Departments</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#059669' }]}>-</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#D97706' }]}>-</Text>
            <Text style={styles.statLabel}>Faculty</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search departments..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Add Button */}
        <View style={styles.addWrapper}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Text style={styles.addButtonText}>+ Add Department</Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        {loading && departments.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : (
          <ScrollView style={styles.content}>
            {filtered.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyIcon}>📋</Text>
                <Text style={styles.emptyText}>
                  {departments.length === 0 ? 'No departments found' : 'No results matching your search'}
                </Text>
              </View>
            ) : (
              filtered.map(dept => (
                <TouchableOpacity
                  key={dept.departmentId}
                  style={styles.card}
                  onPress={() =>
                    navigation.navigate('DepartmentDetails', {
                      departmentId: dept.departmentId,
                      departmentName: dept.departmentName,
                      instituteId,
                      instituteName,
                    })
                  }
                  activeOpacity={0.85}
                >
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.deptIcon}>
                      <Text style={styles.deptIconText}>
                        {dept.departmentCode.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.cardTitle}>{dept.departmentName}</Text>
                      <Text style={styles.cardText}>Code: {dept.departmentCode}</Text>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </View>

                  {/* Delete Button */}
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(dept.departmentId, dept.departmentName)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}

        {/* Add Modal */}
        <Modal visible={showAddModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Department</Text>
                <TouchableOpacity onPress={() => {
                  setShowAddModal(false);
                  setNewDept({ departmentName: '', departmentCode: '', description: '' });
                  setErrors({});
                }}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <FormField
                label="Department Name *"
                placeholder="e.g. Computer Science"
                value={newDept.departmentName}
                onChangeText={(t: string) => handleChange('departmentName', t)}
                error={errors.departmentName}
              />

              <FormField
                label="Department Code *"
                placeholder="e.g. CS"
                value={newDept.departmentCode}
                onChangeText={(t: string) => handleChange('departmentCode', t.toUpperCase())}
                error={errors.departmentCode}
              />

              <FormField
                label="Description"
                placeholder="Optional description"
                value={newDept.description}
                onChangeText={(t: string) => handleChange('description', t)}
                multiline
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddModal(false);
                    setNewDept({ departmentName: '', departmentCode: '', description: '' });
                    setErrors({});
                  }}
                  disabled={submitting}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitButton, submitting && { backgroundColor: '#93C5FD' }]}
                  onPress={handleAdd}
                  disabled={submitting}
                >
                  {submitting ? (
                    <ActivityIndicator color="#FFF" />
                  ) : (
                    <Text style={styles.submitButtonText}>Add</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Bottom Tab */}
        <BottomTab navigation={navigation} active="home" />
      </View>
    </SafeAreaView>
  );
};

// ✅ FORM FIELD COMPONENT
const FormField = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  multiline = false,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: string;
  multiline?: boolean;
}) => (
  <View style={{ marginBottom: 14 }}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput
      style={[
        styles.fieldInput,
        error && { borderColor: '#ef4444' },
      ]}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
    />
    {error && <Text style={styles.fieldError}>{error}</Text>}
  </View>
);

export default DepartmentListScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  header: {
    backgroundColor: '#ffffff',
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: { marginRight: 12, width: 40 },
  backArrow: { fontSize: 36, color: '#1F2937', lineHeight: 40 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#000000' },
  headerSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  statsGrid: { flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 0 },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 4 },

  searchWrapper: { paddingHorizontal: 16, paddingTop: 16 },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  addWrapper: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  addButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  addButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },

  content: { flex: 1, padding: 16 },

  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginTop: 8,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, color: '#6B7280' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  cardText: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  chevron: { fontSize: 28, color: '#9CA3AF' },

  deptIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deptIconText: { fontSize: 13, fontWeight: 'bold', color: '#4F46E5' },

  deleteButton: {
    borderWidth: 1,
    borderColor: '#DC2626',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: { color: '#DC2626', fontWeight: '600', fontSize: 13 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: 32,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2937' },
  closeButton: { fontSize: 24, color: '#6B7280' },

  fieldLabel: { fontWeight: '600', marginBottom: 6, color: '#374151', fontSize: 13 },
  fieldInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  fieldError: { color: '#ef4444', fontSize: 12, marginTop: 4 },

  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 20 },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  submitButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});