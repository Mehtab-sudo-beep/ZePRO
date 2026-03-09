import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTab } from './InstituteListScreen';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'DepartmentList'>;
type RouteP = RouteProp<RootStackParamList, 'DepartmentList'>;

interface Props {
  navigation: NavProp;
  route: RouteP;
}

interface Department {
  id: string;
  name: string;
  code: string;
  totalStudents: number;
  totalFaculty: number;
  activeTeams: number;
}

const DEPT_DATA: Record<string, Department[]> = {
  I001: [
    { id: 'D001', name: 'Computer Science', code: 'CS', totalStudents: 320, totalFaculty: 24, activeTeams: 18 },
    { id: 'D002', name: 'Electrical Engineering', code: 'EE', totalStudents: 280, totalFaculty: 20, activeTeams: 14 },
    { id: 'D003', name: 'Mechanical Engineering', code: 'ME', totalStudents: 260, totalFaculty: 18, activeTeams: 12 },
    { id: 'D004', name: 'Civil Engineering', code: 'CE', totalStudents: 200, totalFaculty: 16, activeTeams: 10 },
  ],
  I002: [
    { id: 'D005', name: 'Physics', code: 'PHY', totalStudents: 180, totalFaculty: 14, activeTeams: 8 },
    { id: 'D006', name: 'Chemistry', code: 'CHEM', totalStudents: 160, totalFaculty: 12, activeTeams: 7 },
    { id: 'D007', name: 'Mathematics', code: 'MATH', totalStudents: 200, totalFaculty: 15, activeTeams: 9 },
  ],
  I003: [
    { id: 'D008', name: 'English', code: 'ENG', totalStudents: 150, totalFaculty: 10, activeTeams: 5 },
    { id: 'D009', name: 'History', code: 'HIST', totalStudents: 120, totalFaculty: 8, activeTeams: 4 },
  ],
};

const DepartmentListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { instituteId, instituteName } = route.params;

  const [departments, setDepartments] = useState<Department[]>(DEPT_DATA[instituteId] || []);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDept, setNewDept] = useState({ name: '', code: '' });

  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    if (!newDept.name || !newDept.code) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const dept: Department = {
      id: `D${Date.now()}`,
      name: newDept.name,
      code: newDept.code.toUpperCase(),
      totalStudents: 0,
      totalFaculty: 0,
      activeTeams: 0,
    };
    setDepartments([...departments, dept]);
    setNewDept({ name: '', code: '' });
    setShowAddModal(false);
    Alert.alert('Success', 'Department added successfully!');
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Confirm Delete', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => setDepartments(departments.filter(d => d.id !== id)),
      },
    ]);
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
          <View>
            <Text style={styles.headerTitle}>{instituteName}</Text>
            <Text style={styles.headerSubtitle}>Select a Department</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Departments', value: departments.length, color: '#4F46E5' },
            { label: 'Students', value: departments.reduce((s, d) => s + d.totalStudents, 0), color: '#059669' },
            { label: 'Faculty', value: departments.reduce((s, d) => s + d.totalFaculty, 0), color: '#D97706' },
          ].map((stat, idx) => (
            <View key={idx} style={styles.statCard}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
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

        

        {/* List */}
        <ScrollView style={styles.content}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No departments found</Text>
            </View>
          ) : (
            filtered.map(dept => (
              <TouchableOpacity
                key={dept.id}
                style={styles.card}
                onPress={() => navigation.navigate('AdminHome', {
                  departmentId: dept.id,
                  departmentName: dept.name,
                  instituteId,
                  instituteName,
                })}
                activeOpacity={0.85}
              >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.deptIcon}>
                    <Text style={styles.deptIconText}>{dept.code}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.cardTitle}>{dept.name}</Text>
                    <Text style={styles.cardText}>Code: {dept.code}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </View>

                {/* Stats Row */}
                <View style={styles.cardStatsRow}>
                  <StatPill label="Students" value={dept.totalStudents} color="#059669" />
                  <StatPill label="Faculty" value={dept.totalFaculty} color="#4F46E5" />
                  <StatPill label="Teams" value={dept.activeTeams} color="#D97706" />
                </View>

                {/* Delete */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(dept.id, dept.name)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Add Modal */}
        <Modal visible={showAddModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Department</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Department Name"
                placeholderTextColor="#9CA3AF"
                value={newDept.name}
                onChangeText={t => setNewDept({ ...newDept, name: t })}
              />
              <TextInput
                style={styles.input}
                placeholder="Department Code (e.g. CS)"
                placeholderTextColor="#9CA3AF"
                value={newDept.code}
                onChangeText={t => setNewDept({ ...newDept, code: t })}
                autoCapitalize="characters"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={handleAdd}>
                  <Text style={styles.submitButtonText}>Add</Text>
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

/* ── Stat Pill ─────────────────────────────────────────── */
const StatPill = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <View style={[styles.statPill, { backgroundColor: color + '18' }]}>
    <Text style={[styles.statPillValue, { color }]}>{value}</Text>
    <Text style={[styles.statPillLabel, { color }]}>{label}</Text>
  </View>
);

export default DepartmentListScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  header: { backgroundColor: '#ffffff', paddingTop: 15, paddingBottom: 20, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center' },
  backBtn: { marginRight: 12 },
  backArrow: { fontSize: 36, color: '#1F2937', lineHeight: 40 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#000000' },
  headerSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  statsGrid: { flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 0 },
  statCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, flex: 1, elevation: 2 },
  statValue: { fontSize: 22, fontWeight: 'bold' },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 4 },

  searchWrapper: { paddingHorizontal: 16, paddingTop: 16 },
  searchInput: { backgroundColor: '#FFFFFF', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, borderWidth: 1, borderColor: '#E5E7EB' },

  addWrapper: { paddingHorizontal: 16, paddingTop: 12 },
  addButton: { backgroundColor: '#4F46E5', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  addButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },

  content: { flex: 1, padding: 16 },

  emptyState: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 40, alignItems: 'center', marginTop: 8 },
  emptyText: { fontSize: 16, color: '#6B7280' },

  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  cardText: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  chevron: { fontSize: 28, color: '#9CA3AF' },

  deptIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  deptIconText: { fontSize: 13, fontWeight: 'bold', color: '#4F46E5' },

  cardStatsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statPill: { flex: 1, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  statPillValue: { fontSize: 16, fontWeight: 'bold' },
  statPillLabel: { fontSize: 11, marginTop: 2 },

  deleteButton: { borderWidth: 1, borderColor: '#DC2626', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  deleteButtonText: { color: '#DC2626', fontWeight: '600', fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, width: '100%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2937' },
  closeButton: { fontSize: 24, color: '#6B7280' },
  input: { backgroundColor: '#F9FAFB', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 14 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center' },
  cancelButtonText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  submitButton: { flex: 1, backgroundColor: '#4F46E5', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },

  bottomTab: { height: 60, borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: '#FFFFFF', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', elevation: 2 },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabText: { fontSize: 12, color: '#6B7280' },
  tabTextActive: { fontWeight: '700', color: '#4F46E5' },
});