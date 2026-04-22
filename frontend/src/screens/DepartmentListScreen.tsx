import React, { useState, useContext, useEffect } from 'react';
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
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from '../theme/ThemeContext';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertContext } from '../context/AlertContext';
import { getDepartments, addDepartment, deleteDepartment, getDepartmentStats } from '../api/departmentApi';
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

interface DepartmentStats {
  studentCount: number;
  facultyCount: number;
  projectCount: number;
}
const Icon = ({ name, size = 16, colors }: any) => {
  const isDark = colors.background === '#111827';
  const icons: any = {
    search: isDark
      ? require('../assets/search-white.png')
      : require('../assets/search.png'),
  };
  return <Image source={icons[name]} style={{ width: size, height: size, resizeMode: 'contain' }} />;
};

const DepartmentListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { instituteId, instituteName } = route.params;
  const { showAlert } = useContext(AlertContext);
  const { colors, theme } = useContext(ThemeContext);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentStats, setDepartmentStats] = useState<Record<string, DepartmentStats>>({});
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

  // ✅ LOAD DEPARTMENT STATS
  const loadDepartmentStats = async (deptId: string) => {
    try {
      console.log('[DepartmentList] 📊 Fetching stats for dept:', deptId);
      const statsRes = await getDepartmentStats(deptId);
      console.log('[DepartmentList] ✅ Stats loaded:', statsRes.data);

      setDepartmentStats(prev => ({
        ...prev,
        [deptId]: {
          studentCount: statsRes.data.studentCount || 0,
          facultyCount: statsRes.data.facultyCount || 0,
          projectCount: statsRes.data.projectCount || 0,
        }
      }));
    } catch (e) {
      console.log('[DepartmentList] ❌ Error loading stats:', e);
    }
  };

  // ✅ LOAD DEPARTMENTS FROM BACKEND
  const loadDepartments = async () => {
    try {
      setLoading(true);
      console.log('[DepartmentList] 📡 Fetching departments for institute:', instituteId);

      const response = await getDepartments(instituteId);
      console.log('[DepartmentList] ✅ Departments loaded:', response.data);

      setDepartments(response.data || []);

      // ✅ LOAD STATS FOR EACH DEPARTMENT
      if (response.data && response.data.length > 0) {
        response.data.forEach((dept: Department) => {
          loadDepartmentStats(dept.departmentId);
        });
      }
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

  // ✅ CALCULATE TOTAL STATS
  const totalStats = {
    students: Object.values(departmentStats).reduce((sum, s) => sum + s.studentCount, 0),
    faculty: Object.values(departmentStats).reduce((sum, s) => sum + s.facultyCount, 0),
  };

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
          onPress: () => { },
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
            const newStats = { ...departmentStats };
            delete newStats[id];
            setDepartmentStats(newStats);

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
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={[styles.backArrow, { color: colors.text }]}>‹</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{instituteName}</Text>
            <Text style={[styles.headerSubtitle, { color: colors.subText }]}>Departments</Text>
          </View>
        </View>

        {/* ✅ UPDATED Stats with dynamic data */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{departments.length}</Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>Departments</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: '#059669' }]}>{totalStats.students}</Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>Students</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: '#D97706' }]}>{totalStats.faculty}</Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>Faculty</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Icon name="search" colors={colors} size={18} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search Departments"
              placeholderTextColor={colors.subText}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        </View>

        {/* Add Button */}
        <View style={styles.addWrapper}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
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
              filtered.map(dept => {
                const stats = departmentStats[dept.departmentId] || { studentCount: 0, facultyCount: 0, projectCount: 0 };

                return (
                  <TouchableOpacity
                    key={dept.departmentId}
                    style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
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
                      <View style={[styles.deptIcon, { backgroundColor: colors.primary + '15' }]}>
                        <Text style={[styles.deptIconText, { color: colors.primary }]}>
                          {dept.departmentCode.substring(0, 2).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>{dept.departmentName}</Text>
                        <Text style={[styles.cardText, { color: colors.subText }]}>Code: {dept.departmentCode}</Text>
                      </View>
                      <Text style={[styles.chevron, { color: colors.subText }]}>›</Text>
                    </View>

                    {/* ✅ DYNAMIC STATS ROW */}
                    <View style={[styles.statsRow, { backgroundColor: colors.background }]}>
                      <View style={styles.statItem}>
                        <Text style={[styles.statCount, { color: '#059669' }]}>
                          {stats.studentCount}
                        </Text>
                        <Text style={[styles.statName, { color: colors.subText }]}>Students</Text>
                      </View>
                      <View style={[styles.divider, { backgroundColor: colors.border }]} />
                      <View style={styles.statItem}>
                        <Text style={[styles.statCount, { color: '#D97706' }]}>
                          {stats.facultyCount}
                        </Text>
                        <Text style={[styles.statName, { color: colors.subText }]}>Faculty</Text>
                      </View>
                      <View style={[styles.divider, { backgroundColor: colors.border }]} />
                      <View style={styles.statItem}>
                        <Text style={[styles.statCount, { color: colors.primary }]}>
                          {stats.projectCount}
                        </Text>
                        <Text style={[styles.statName, { color: colors.subText }]}>Projects</Text>
                      </View>
                    </View>

                    {/* Delete Button */}
                    <TouchableOpacity
                      style={[styles.deleteButton, { borderColor: '#DC2626' }]}
                      onPress={() => handleDelete(dept.departmentId, dept.departmentName)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        )}

        {/* Add Modal */}
        <Modal visible={showAddModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Add Department</Text>
                <TouchableOpacity onPress={() => {
                  setShowAddModal(false);
                  setNewDept({ departmentName: '', departmentCode: '', description: '' });
                  setErrors({});
                }}>
                  <Text style={[styles.closeButton, { color: colors.subText }]}>✕</Text>
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
                  style={[styles.cancelButton, { borderColor: colors.border }]}
                  onPress={() => {
                    setShowAddModal(false);
                    setNewDept({ departmentName: '', departmentCode: '', description: '' });
                    setErrors({});
                  }}
                  disabled={submitting}
                >
                  <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.submitButton, { backgroundColor: colors.primary }, submitting && { opacity: 0.7 }]}
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
}) => {
  const { colors } = useContext(ThemeContext);
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={[styles.fieldLabel, { color: colors.text }]}>{label}</Text>
      <TextInput
        style={[
          styles.fieldInput,
          {
            backgroundColor: colors.background,
            borderColor: error ? '#ef4444' : colors.border,
            color: colors.text,
          },
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.subText}
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
      />
      {error && <Text style={styles.fieldError}>{error}</Text>}
    </View>
  );
};

export default DepartmentListScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },

  header: {
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
  },
  backBtn: { marginRight: 12, width: 40, justifyContent: 'center', alignItems: 'center' },
  backArrow: { fontSize: 32, fontWeight: '300' },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 13, marginTop: 2 },

  statsGrid: { flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 0 },
  statCard: {
    borderRadius: 12,
    padding: 16,
    flex: 1,
    elevation: 2,
    borderWidth: 1,
  },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 11, marginTop: 4 },

  searchWrapper: { paddingHorizontal: 16, paddingTop: 16 },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },

  addWrapper: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  addButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    elevation: 2,
  },
  addButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },

  content: { flex: 1, padding: 16 },

  emptyState: {
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
  },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16 },

  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold' },
  cardText: { fontSize: 13, marginTop: 2 },
  chevron: { fontSize: 28 },

  deptIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deptIconText: { fontSize: 13, fontWeight: 'bold' },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statCount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  statName: {
    fontSize: 11,
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 30,
  },

  deleteButton: {
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: { color: '#DC2626', fontWeight: '600', fontSize: 13 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold' },
  closeButton: { fontSize: 24 },

  fieldLabel: { fontWeight: '700', marginBottom: 8, fontSize: 13 },
  fieldInput: {
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
  },
  fieldError: { color: '#ef4444', fontSize: 12, marginTop: 4 },

  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 24 },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: { fontSize: 15, fontWeight: '600' },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  submitButtonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});