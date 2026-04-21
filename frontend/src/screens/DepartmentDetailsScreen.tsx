import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Modal,
  FlatList,
  Image,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertContext } from '../context/AlertContext';
import { ThemeContext } from '../theme/ThemeContext';
import { getFacultyByDepartment, assignFacultyCoordinator, removeFacultyCoordinator, getDepartmentStats } from '../api/departmentApi';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DepartmentDetails'>;
type RoutePropType = RouteProp<RootStackParamList, 'DepartmentDetails'>;

interface Faculty {
  userId: string;
  name: string;
  email: string;
  role: string;
}

const DepartmentDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { showAlert } = useContext(AlertContext);
  const { colors, theme } = useContext(ThemeContext);

  const { departmentId, departmentName, instituteId, instituteName } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [facultyList, setFacultyList] = useState<Faculty[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [currentCoordinator, setCurrentCoordinator] = useState<Faculty | null>(null);

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalProjects: 0,
  });

  // ✅ USE CALLBACK TO MEMOIZE FUNCTION
  const loadFacultyList = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[DepartmentDetails] 📡 Fetching faculty...');

      const response = await getFacultyByDepartment(String(departmentId));
      console.log('[DepartmentDetails] ✅ Faculty loaded:', response.data);

      setFacultyList(response.data || []);
      setStats(prev => ({ ...prev, totalFaculty: response.data?.length || 0 }));

      // ✅ CHECK IF ANY COORDINATOR EXISTS
      const coordinator = response.data?.find((f: Faculty) => f.role === 'FACULTY_COORDINATOR');
      if (coordinator) {
        setCurrentCoordinator(coordinator);
      }
    } catch (error: any) {
      console.log('[DepartmentDetails] ❌ Error:', error.message);
      console.log('[DepartmentDetails] ❌ Status:', error.response?.status);
      console.log('[DepartmentDetails] ❌ Data:', error.response?.data);

      // ✅ HANDLE 403 FORBIDDEN
      if (error.response?.status === 403) {
        showAlert(
          'Access Denied',
          'You do not have permission to view faculty. Only admins can access this feature.'
        );
      } else {
        showAlert(
          'Error',
          error.response?.data?.error || 'Failed to load faculty'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [departmentId, showAlert]); // ✅ DEPENDENCIES FOR CALLBACK

  // ✅ FIXED USEEFFECT WITH PROPER DEPENDENCIES
  useEffect(() => {
    console.log('[DepartmentDetails] 📋 Loaded');
    console.log('Department ID:', departmentId);
    console.log('Department Name:', departmentName);
    console.log('Institute ID:', instituteId);
    console.log('Institute Name:', instituteName);

    loadFacultyList();
  }, [departmentId, departmentName, instituteId, instituteName, loadFacultyList]); // ✅ ALL DEPS INCLUDED

  // ✅ ADD THIS USEEFFECT FOR STATS
  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsRes = await getDepartmentStats(String(departmentId));
        setStats({
          totalStudents: statsRes.data.studentCount,
          totalFaculty: statsRes.data.facultyCount,
          totalProjects: statsRes.data.projectCount,
        });
      } catch (e) {
        console.log('ERROR LOADING STATS:', e);
      }
    };
    loadStats();
  }, [departmentId]);

  const handleAssignCoordinator = async (faculty: Faculty) => {
    console.log('[DepartmentDetails] 🚀 Assigning coordinator:', faculty.name);

    showAlert(
      'Confirm Assignment',
      `Assign "${faculty.name}" as Faculty Coordinator?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Assign',
          style: 'default',
          onPress: async () => {
            setAssigning(true);

            try {
              const response = await assignFacultyCoordinator(
                String(departmentId),
                faculty.userId
              );

              console.log('[DepartmentDetails] ✅ Assigned:', response.data);

              setCurrentCoordinator(faculty);
              setShowModal(false);

              showAlert(
                'Success',
                `${faculty.name} is now Faculty Coordinator!`
              );

              loadFacultyList();
            } catch (error: any) {
              console.log('[DepartmentDetails] ❌ Error:', error.message);
              console.log('[DepartmentDetails] ❌ Status:', error.response?.status);

              // ✅ HANDLE 403 FORBIDDEN
              if (error.response?.status === 403) {
                showAlert(
                  'Access Denied',
                  'You do not have permission to assign coordinators. Only admins can do this.'
                );
              } else {
                showAlert(
                  'Error',
                  error.response?.data?.error || 'Failed to assign coordinator'
                );
              }
            } finally {
              setAssigning(false);
            }
          },
        },
      ]
    );
  };

  const handleRemoveCoordinator = () => {
    if (!currentCoordinator) return;

    showAlert(
      'Remove Coordinator',
      `Remove "${currentCoordinator.name}" as coordinator?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFacultyCoordinator(String(departmentId), currentCoordinator.userId);
              setCurrentCoordinator(null);
              showAlert('Success', 'Coordinator removed successfully');
              loadFacultyList();
            } catch (err: any) {
              showAlert('Error', err.response?.data?.error || 'Failed to remove coordinator');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Image
              source={require('../assets/angle.png')}
              style={[styles.backIcon, { tintColor: colors.text }]}
            />
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>{departmentName}</Text>
            <Text style={[styles.headerSubtitle, { color: colors.subText }]}>{instituteName}</Text>
          </View>
        </View>

        {loading && facultyList.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : (
          <ScrollView style={styles.content}>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statValue, { color: '#4F46E5' }]}>
                  {stats.totalStudents}
                </Text>
                <Text style={[styles.statLabel, { color: colors.subText }]}>Students</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statValue, { color: '#059669' }]}>
                  {stats.totalFaculty}
                </Text>
                <Text style={[styles.statLabel, { color: colors.subText }]}>Faculty</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.statValue, { color: '#D97706' }]}>
                  {stats.totalProjects}
                </Text>
                <Text style={[styles.statLabel, { color: colors.subText }]}>Projects</Text>
              </View>
            </View>

            {/* Current Coordinator Card */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Faculty Coordinator</Text>

              {currentCoordinator ? (
                <>
                  <View style={[styles.coordinatorCard, { backgroundColor: colors.primary + '15', borderColor: colors.primary }]}>
                    <Text style={[styles.coordinatorName, { color: colors.text }]}>
                      ✅ {currentCoordinator.name}
                    </Text>
                    <Text style={[styles.coordinatorEmail, { color: colors.subText }]}>
                      {currentCoordinator.email}
                    </Text>
                    <Text style={[styles.coordinatorRole, { color: colors.primary }]}>
                      FACULTY_COORDINATOR
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.removeButton, { marginTop: 10 }]}
                    onPress={handleRemoveCoordinator}
                  >
                    <Text style={styles.removeButtonText}>❌ Remove Coordinator</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <Text style={[styles.noCoordinatorText, { color: colors.subText }]}>
                  No coordinator assigned yet
                </Text>
              )}
            </View>

            {/* Manage Faculty Section */}
            <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Faculty Members</Text>
                <TouchableOpacity
                  style={styles.assignButton}
                  onPress={() => setShowModal(true)}
                  disabled={facultyList.length === 0}
                >
                  <Text style={styles.assignButtonText}>📌 Assign</Text>
                </TouchableOpacity>
              </View>

              {facultyList.length === 0 ? (
                <Text style={[styles.noDataText, { color: colors.subText }]}>
                  No faculty members in this department
                </Text>
              ) : (
                facultyList.map(faculty => (
                  <View
                    key={faculty.userId}
                    style={[
                      styles.facultyCard,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.border,
                      },
                      faculty.role === 'FACULTY_COORDINATOR' && { backgroundColor: colors.primary + '15' },
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.facultyName, { color: colors.text }]}>
                        {faculty.name}
                      </Text>
                      <Text style={[styles.facultyEmail, { color: colors.subText }]}>
                        {faculty.email}
                      </Text>
                      {faculty.role === 'FACULTY_COORDINATOR' && (
                        <Text style={[styles.coordinatorBadge, { color: colors.primary }]}>
                          📌 Coordinator
                        </Text>
                      )}
                    </View>
                  </View>
                ))
              )}
            </View>
          </ScrollView>
        )}

        {/* Faculty Selection Modal */}
        <Modal visible={showModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Select Faculty Coordinator
                </Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <Text style={[styles.closeButton, { color: colors.subText }]}>✕</Text>
                </TouchableOpacity>
              </View>

              {assigning ? (
                <ActivityIndicator size="large" color="#4F46E5" style={{ marginVertical: 40 }} />
              ) : (
                <FlatList
                  data={facultyList}
                  keyExtractor={item => item.userId}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[
                        styles.facultyOption,
                        { backgroundColor: colors.background, borderColor: colors.border },
                      ]}
                      onPress={() => handleAssignCoordinator(item)}
                      disabled={assigning}
                    >
                      <View>
                        <Text style={[styles.optionName, { color: colors.text }]}>
                          {item.name}
                        </Text>
                        <Text style={[styles.optionEmail, { color: colors.subText }]}>
                          {item.email}
                        </Text>
                      </View>
                      <Text style={styles.selectArrow}>›</Text>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

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
  backIcon: { width: 22, height: 22, resizeMode: 'contain' },
  headerTitle: { fontSize: 22, fontWeight: 'bold' },
  headerSubtitle: { fontSize: 13, marginTop: 2 },

  content: { flex: 1, padding: 16 },

  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    borderRadius: 12,
    padding: 16,
    flex: 1,
    elevation: 2,
    borderWidth: 1,
  },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 11, marginTop: 4 },

  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 12 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },

  coordinatorCard: {
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
  },
  coordinatorName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  coordinatorEmail: { fontSize: 13, marginBottom: 4 },
  coordinatorRole: { fontSize: 11, fontWeight: '600' },

  noCoordinatorText: { fontSize: 14, fontStyle: 'italic', paddingVertical: 20, textAlign: 'center' },
  noDataText: { fontSize: 14, paddingVertical: 16, textAlign: 'center' },

  assignButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  assignButtonText: { color: '#fff', fontSize: 12, fontWeight: '600' },

  facultyCard: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  coordinatorHighlight: { backgroundColor: '#EEF2FF' },
  facultyName: { fontSize: 14, fontWeight: '600' },
  facultyEmail: { fontSize: 12, marginTop: 2 },
  coordinatorBadge: { fontSize: 12, fontWeight: '600', marginTop: 4 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    paddingBottom: 32,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  closeButton: { fontSize: 24 },

  facultyOption: {
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionName: { fontSize: 14, fontWeight: '600' },
  optionEmail: { fontSize: 12, marginTop: 2 },
  selectArrow: { fontSize: 24, color: '#4F46E5', fontWeight: '600' },

  removeButton: {
    borderWidth: 1,
    borderColor: '#DC2626',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  removeButtonText: { color: '#DC2626', fontWeight: '600', fontSize: 13 },
});

export default DepartmentDetailsScreen;