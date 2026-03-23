import React, { useState, useMemo, useContext, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal, Image, Alert,
  StyleSheet, StatusBar, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../theme/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import ReactNativeBlobUtil from 'react-native-blob-util';
type FacultyCoordinatorDashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FacultyCoordinatorDashboard'>;
type FacultyNavProp = NativeStackNavigationProp<RootStackParamList>;
interface Props { navigation: FacultyCoordinatorDashboardNavigationProp; }

interface Faculty {
  id: string; name: string; email: string; department: string;
  maxStudents: number; allocatedStudents: number; specialization: string;
}
interface Student {
  id: string; name: string; rollNo: string; email: string;
  department: string; year: string; cgpa: string; isAllocated: boolean;
  allocatedFacultyId?: string; allocatedFacultyName?: string; teamId?: string;
}
interface TeamMember { name: string; rollNo: string; email: string; cgpa: string; }
interface Team {
  id: string; name: string; projectTitle: string; facultyId: string;
  facultyName: string; members: TeamMember[];
}
interface Rules { maxTeamSize: number; maxStudentsPerFaculty: number; }
interface DashboardStats {
  totalStudents: number; allocatedStudents: number; unallocatedStudents: number;
  totalTeams: number; totalFaculty: number; availableSlots: number;
}

// ── Change to match your setup ────────────────────────────────────────────────
// Android emulator → http://10.0.2.2:8080
// iOS simulator    → http://localhost:8080
// Physical device  → http://<your-pc-ip>:8080
const BASE_URL = 'http://localhost:8080/api/coordinator';

const FacultyCoordinatorDashboard: React.FC<Props> = ({ }) => {
  const { colors } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const navigation = useNavigation<FacultyNavProp>();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [rules, setRules] = useState<Rules>({ maxTeamSize: 4, maxStudentsPerFaculty: 10 });
  const [tempRules, setTempRules] = useState<Rules>({ maxTeamSize: 4, maxStudentsPerFaculty: 10 });
  const [activeTab, setActiveTab] = useState<'overview' | 'faculties' | 'students' | 'teams' | 'rules'>('overview');
  const [loading, setLoading] = useState(false);
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [facultySearchQuery, setFacultySearchQuery] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Tracks whether initial load is done — prevents debounce firing on mount
  const isMounted = useRef(false);

  // ── Auth header ──────────────────────────────────────────────────────────
  const authHeader = useCallback(() => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${user?.token ?? ''}`,
  }), [user]);

  // ── Safe fetch — no Alert on failure, just logs ───────────────────────────
  const safeFetch = useCallback(async (url: string, options?: RequestInit) => {
    const res = await fetch(url, options);
    if (!res.ok) {
      console.log(`[API ${res.status}] ${url}`);
      return null;
    }
    return res.json();
  }, []);

  // ── Fetch functions ───────────────────────────────────────────────────────
  const fetchStats = useCallback(async () => {
    try {
      const data = await safeFetch(`${BASE_URL}/stats`, { headers: authHeader() });
      if (data) setStats(data);
    } catch (e) { console.log('fetchStats:', e); }
  }, [authHeader, safeFetch]);

  const fetchFaculties = useCallback(async (query = '') => {
    try {
      const url = query.trim()
        ? `${BASE_URL}/faculties/search?q=${encodeURIComponent(query)}`
        : `${BASE_URL}/faculties`;
      const data = await safeFetch(url, { headers: authHeader() });
      if (data) setFaculties(data.map((f: any) => ({
        id: String(f.facultyId), name: f.name, email: f.email,
        department: f.department, maxStudents: f.maxStudents,
        allocatedStudents: f.allocatedStudents, specialization: f.specialization,
      })));
    } catch (e) { console.log('fetchFaculties:', e); }
  }, [authHeader, safeFetch]);

  const fetchStudents = useCallback(async (query = '') => {
    try {
      const url = query.trim()
        ? `${BASE_URL}/students/search?q=${encodeURIComponent(query)}`
        : `${BASE_URL}/students`;
      const data = await safeFetch(url, { headers: authHeader() });
      if (data) setStudents(data.map((s: any) => ({
        id: String(s.studentId), name: s.name, rollNo: s.rollNo,
        email: s.email, department: s.department, year: s.year, cgpa: s.cgpa,
        isAllocated: s.allocated,
        allocatedFacultyId: s.allocatedFacultyId ? String(s.allocatedFacultyId) : undefined,
        allocatedFacultyName: s.allocatedFacultyName ?? undefined,
        teamId: s.teamId ? String(s.teamId) : undefined,
      })));
    } catch (e) { console.log('fetchStudents:', e); }
  }, [authHeader, safeFetch]);

  const fetchTeams = useCallback(async () => {
    try {
      const data = await safeFetch(`${BASE_URL}/teams`, { headers: authHeader() });
      if (data) setTeams(data.map((t: any) => ({
        id: String(t.teamId), name: t.teamName, projectTitle: t.projectTitle,
        facultyId: t.facultyId ? String(t.facultyId) : '',
        facultyName: t.facultyName, members: t.members ?? [],
      })));
    } catch (e) { console.log('fetchTeams:', e); }
  }, [authHeader, safeFetch]);

  const fetchRules = useCallback(async () => {
    try {
      const data = await safeFetch(`${BASE_URL}/rules`, { headers: authHeader() });
      if (data) {
        const loaded = { maxTeamSize: data.maxTeamSize, maxStudentsPerFaculty: data.maxStudentsPerFaculty };
        setRules(loaded);
        setTempRules(loaded);
      }
    } catch (e) { console.log('fetchRules:', e); }
  }, [authHeader, safeFetch]);

  // ── Initial load ─────────────────────────────────────────────────────────
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([fetchStats(), fetchFaculties(), fetchStudents(), fetchTeams(), fetchRules()]);
      setLoading(false);
      isMounted.current = true; // mark done AFTER load so debounce hooks skip mount
    };
    loadAll();
  }, []);

  // ── Refresh on tab switch (skips on mount) ────────────────────────────────
  useEffect(() => {
    if (!isMounted.current) return;
    const loadTab = async () => {
      setLoading(true);
      if (activeTab === 'overview') await fetchStats();
      if (activeTab === 'faculties') await fetchFaculties(facultySearchQuery);
      if (activeTab === 'students') await fetchStudents(studentSearchQuery);
      if (activeTab === 'teams') await fetchTeams();
      if (activeTab === 'rules') await fetchRules();
      setLoading(false);
    };
    loadTab();
  }, [activeTab]);

  // ── Debounced search (skips on mount) ─────────────────────────────────────
  useEffect(() => {
    if (!isMounted.current) return;
    const t = setTimeout(() => fetchFaculties(facultySearchQuery), 400);
    return () => clearTimeout(t);
  }, [facultySearchQuery]);

  useEffect(() => {
    if (!isMounted.current) return;
    const t = setTimeout(() => fetchStudents(studentSearchQuery), 400);
    return () => clearTimeout(t);
  }, [studentSearchQuery]);

  // ── Client-side filter ────────────────────────────────────────────────────
  const filteredFaculties = useMemo(() => {
    if (!facultySearchQuery.trim()) return faculties;
    const q = facultySearchQuery.toLowerCase();
    return faculties.filter(f =>
      f.name?.toLowerCase().includes(q) || f.email?.toLowerCase().includes(q) ||
      f.specialization?.toLowerCase().includes(q));
  }, [faculties, facultySearchQuery]);

  const filteredStudents = useMemo(() => {
    if (!studentSearchQuery.trim()) return students;
    const q = studentSearchQuery.toLowerCase();
    return students.filter(s =>
      s.name?.toLowerCase().includes(q) || s.rollNo?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q));
  }, [students, studentSearchQuery]);

  const displayStats = stats ?? {
    totalStudents: 0, allocatedStudents: 0, unallocatedStudents: 0,
    totalTeams: 0, totalFaculty: 0, availableSlots: 0,
  };

  // ── Allocate ──────────────────────────────────────────────────────────────
  const handleAllocateStudent = async () => {
    if (!selectedStudent || !selectedFacultyId) {
      Alert.alert('Error', 'Please select both student and faculty'); return;
    }
    try {
      const res = await fetch(`${BASE_URL}/allocate`, {
        method: 'POST', headers: authHeader(),
        body: JSON.stringify({ studentId: Number(selectedStudent.id), facultyId: Number(selectedFacultyId) }),
      });
      if (!res.ok) { const e = await res.json(); Alert.alert('Error', e.message ?? 'Allocation failed'); return; }
      setShowAllocationModal(false); setSelectedStudent(null); setSelectedFacultyId('');
      Alert.alert('Success', 'Student allocated successfully!');
      await Promise.all([fetchStats(), fetchFaculties(), fetchStudents()]);
    } catch { Alert.alert('Error', 'Network error. Please try again.'); }
  };
  //------------------------------------------------------------

  const handleDownloadAllocationReport = async () => {
    try {
      const data = await safeFetch(`${BASE_URL}/students/allocated`, { headers: authHeader() });
      if (!data) { Alert.alert('Error', 'Failed to generate report'); return; }
      const report = `
═══════════════════════════════════════════
     STUDENT ALLOCATION REPORT
═══════════════════════════════════════════
Total Allocated: ${data.length}
Generated on: ${new Date().toLocaleDateString()}

${data.map((s: any, i: number) => `${i + 1}. ${s.name} (${s.rollNo})
   Faculty: ${s.allocatedFacultyName ?? 'N/A'}
   Dept: ${s.department} | CGPA: ${s.cgpa}`).join('\n\n')}
═══════════════════════════════════════════`.trim();
      Alert.alert('Allocation Report', report, [{ text: 'OK' }]);
    } catch (e) { Alert.alert('Error', 'Network error'); }
  };










  // ── Override ──────────────────────────────────────────────────────────────
  const handleOverrideAllocation = async () => {
    if (!selectedStudent || !selectedFacultyId) {
      Alert.alert('Error', 'Please select faculty'); return;
    }
    try {
      const res = await fetch(`${BASE_URL}/override`, {
        method: 'POST', headers: authHeader(),
        body: JSON.stringify({ studentId: Number(selectedStudent.id), newFacultyId: Number(selectedFacultyId) }),
      });
      if (!res.ok) { const e = await res.json(); Alert.alert('Error', e.message ?? 'Override failed'); return; }
      setShowOverrideModal(false); setSelectedStudent(null); setSelectedFacultyId('');
      Alert.alert('Success', 'Allocation overridden successfully!');
      await Promise.all([fetchStats(), fetchFaculties(), fetchStudents()]);
    } catch { Alert.alert('Error', 'Network error. Please try again.'); }
  };

  // ── Download Report ───────────────────────────────────────────────────────
  const handleDownloadAllTeamsReport = async () => {
    try {
      setLoading(true);
      const fileName = `teams_report_${Date.now()}.pdf`;
      const filePath = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${fileName}`;
      await ReactNativeBlobUtil.config({
        path: filePath,
        addAndroidDownloads: {
          useDownloadManager: true,  // system tray notification
          notification: true,
          title: 'Teams Report',
          mime: 'application/pdf',
          mediaScannable: true,
        },
      }).fetch('GET', `${BASE_URL}/teams/report/pdf`, authHeader());
      Alert.alert('Download Complete', `Saved to Downloads as "${fileName}"`);
    } catch (e) {
      Alert.alert('Error', 'Failed to download report');
    } finally {
      setLoading(false);
    }
  };

  // ── Save Rules ────────────────────────────────────────────────────────────
  const handleSaveRules = async () => {
    try {
      const res = await fetch(`${BASE_URL}/rules`, {
        method: 'POST', headers: authHeader(), body: JSON.stringify(tempRules),
      });
      if (!res.ok) { const e = await res.json(); Alert.alert('Error', e.message ?? 'Failed to save rules'); return; }
      setRules(tempRules);
      Alert.alert('Success', 'Rules updated successfully!');
    } catch { Alert.alert('Error', 'Network error. Please try again.'); }
  };

  // ── Renderers ─────────────────────────────────────────────────────────────
  const renderOverview = () => (
    <View>
      {loading
        ? <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
        : <View style={styles.statsGrid}>
          {[
            { label: 'Total Students', value: displayStats.totalStudents, color: '#1F2937' },
            { label: 'Allocated', value: displayStats.allocatedStudents, color: '#059669' },
            { label: 'Unallocated', value: displayStats.unallocatedStudents, color: '#D97706' },
            { label: 'Active Teams', value: displayStats.totalTeams, color: '#1F2937' },
            { label: 'Total Faculty', value: displayStats.totalFaculty, color: '#1F2937' },
            { label: 'Available Slots', value: displayStats.availableSlots, color: '#4F46E5' },
          ].map((s, i) => (
            <View key={i} style={styles.statCard}>
              <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
      }
    </View>
  );

  const renderFaculties = () => (
    <View>
      <TextInput style={styles.searchInput} placeholder="Search faculty..." placeholderTextColor="#9CA3AF"
        value={facultySearchQuery} onChangeText={setFacultySearchQuery} />
      {loading
        ? <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
        : filteredFaculties.map(f => (
          <View key={f.id} style={styles.card}>
            <Text style={styles.cardTitle}>{f.name}</Text>
            <Text style={styles.cardText}>{f.email}</Text>
            <Text style={styles.cardText}>Specialization: {f.specialization}</Text>
            <View style={styles.slotInfo}>
              <Text style={styles.slotText}>Slots: {f.allocatedStudents}/{f.maxStudents}</Text>
            </View>
          </View>
        ))
      }
    </View>
  );

  const renderStudents = () => (
    <View>
      <TextInput style={styles.searchInput} placeholder="Search students..." placeholderTextColor="#9CA3AF"
        value={studentSearchQuery} onChangeText={setStudentSearchQuery} />
      {loading
        ? <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
        : filteredStudents.map(s => (
          <View key={s.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{s.name}</Text>
                <Text style={styles.cardText}>{s.rollNo}</Text>
              </View>
              <View style={[styles.badge, s.isAllocated ? styles.badgeAllocated : styles.badgeUnallocated]}>
                <Text style={[styles.badgeText, s.isAllocated ? styles.badgeTextAllocated : styles.badgeTextUnallocated]}>
                  {s.isAllocated ? 'Allocated' : 'Unallocated'}
                </Text>
              </View>
            </View>
            <Text style={styles.cardText}>Email: {s.email}</Text>
            <Text style={styles.cardText}>CGPA: {s.cgpa}</Text>
            {s.isAllocated && s.allocatedFacultyName && (
              <Text style={styles.cardText}>Faculty: {s.allocatedFacultyName}</Text>
            )}
            <TouchableOpacity
              style={[styles.button, s.isAllocated && styles.buttonOverride]}
              onPress={() => { setSelectedStudent(s); s.isAllocated ? setShowOverrideModal(true) : setShowAllocationModal(true); }}
            >
              <Text style={styles.buttonText}>{s.isAllocated ? 'Override Allocation' : 'Allocate Faculty'}</Text>
            </TouchableOpacity>
          </View>
        ))
      }
    </View>
  );

  const renderTeams = () => (
    <View>
      <TouchableOpacity style={styles.downloadAllButton} onPress={handleDownloadAllTeamsReport}>
        <Text style={styles.downloadAllButtonText}>Download All Teams Report</Text>
      </TouchableOpacity>
      {loading
        ? <ActivityIndicator size="large" color="#4F46E5" style={{ marginTop: 40 }} />
        : teams.map(t => (
          <View key={t.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{t.name}</Text>

            </View>
            <Text style={[styles.cardText, { fontWeight: '600' }]}>{t.projectTitle}</Text>
            <Text style={styles.cardText}>Guide: {t.facultyName}</Text>
            <View style={styles.teamMembers}>
              <Text style={styles.teamMembersTitle}>Members ({t.members.length})</Text>
              {t.members.map((m, i) => (
                <Text key={i} style={styles.cardText}>• {m.name} ({m.rollNo})</Text>
              ))}
            </View>
          </View>
        ))
      }
    </View>
  );

  const renderRules = () => (
    <View style={styles.rulesContainer}>
      <Text style={styles.rulesTitle}>Project Allocation Rules</Text>
      <View style={styles.ruleCard}>
        <Text style={styles.ruleLabel}>Maximum Team Size</Text>
        <TextInput style={styles.ruleInput} placeholder="Enter max team size" placeholderTextColor="#9CA3AF"
          keyboardType="numeric" value={String(tempRules.maxTeamSize)}
          onChangeText={t => setTempRules({ ...tempRules, maxTeamSize: parseInt(t) || 0 })} />
        <Text style={styles.ruleDescription}>Maximum number of students allowed per team</Text>
      </View>
      <View style={styles.ruleCard}>
        <Text style={styles.ruleLabel}>Maximum Students per Faculty</Text>
        <TextInput style={styles.ruleInput} placeholder="Enter max students" placeholderTextColor="#9CA3AF"
          keyboardType="numeric" value={String(tempRules.maxStudentsPerFaculty)}
          onChangeText={t => setTempRules({ ...tempRules, maxStudentsPerFaculty: parseInt(t) || 0 })} />
        <Text style={styles.ruleDescription}>Maximum number of students a faculty can guide</Text>
      </View>
      <TouchableOpacity style={styles.saveRulesButton} onPress={handleSaveRules}>
        <Text style={styles.saveRulesButtonText}>Save Rules</Text>
      </TouchableOpacity>
      <View style={styles.currentRulesCard}>
        <Text style={styles.currentRulesTitle}>Current Active Rules</Text>
        <Text style={styles.currentRuleText}>Max Team Size: {rules.maxTeamSize}</Text>
        <Text style={styles.currentRuleText}>Max Students per Faculty: {rules.maxStudentsPerFaculty}</Text>
      </View>
    </View>
  );

  const renderModal = (isOverride: boolean) => (
    <Modal visible={isOverride ? showOverrideModal : showAllocationModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{isOverride ? 'Override' : 'Allocate'} Faculty</Text>
            <TouchableOpacity onPress={() => {
              isOverride ? setShowOverrideModal(false) : setShowAllocationModal(false);
              setSelectedStudent(null); setSelectedFacultyId('');
            }}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          {selectedStudent && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Student</Text>
              <Text style={styles.infoText}>{selectedStudent.name} ({selectedStudent.rollNo})</Text>
              {isOverride && selectedStudent.allocatedFacultyName && (
                <Text style={styles.infoText}>Current: {selectedStudent.allocatedFacultyName}</Text>
              )}
            </View>
          )}
          <Text style={styles.sectionTitle}>Select Faculty</Text>
          <ScrollView style={styles.facultyList}>
            {faculties
              .filter(f => !isOverride || f.id !== selectedStudent?.allocatedFacultyId)
              .map(f => {
                const disabled = f.allocatedStudents >= f.maxStudents;
                return (
                  <TouchableOpacity key={f.id}
                    style={[styles.facultyOption, selectedFacultyId === f.id && styles.facultyOptionSelected, disabled && styles.facultyOptionDisabled]}
                    onPress={() => !disabled && setSelectedFacultyId(f.id)} disabled={disabled}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.facultyOptionName}>{f.name}</Text>
                      <Text style={styles.facultyOptionSpec}>{f.specialization}</Text>
                    </View>
                    <View style={styles.slotBadge}>
                      <Text style={[styles.slotBadgeText, disabled && styles.slotBadgeTextFull]}>
                        {f.allocatedStudents}/{f.maxStudents}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
          </ScrollView>
          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => {
              isOverride ? setShowOverrideModal(false) : setShowAllocationModal(false);
              setSelectedStudent(null); setSelectedFacultyId('');
            }}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton}
              onPress={isOverride ? handleOverrideAllocation : handleAllocateStudent}>
              <Text style={styles.submitButtonText}>{isOverride ? 'Override' : 'Allocate'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Faculty Coordinator</Text>
        </View>
        <View style={styles.topTabs}>
          {(['overview', 'faculties', 'students', 'teams', 'rules'] as const).map(tab => (
            <TouchableOpacity key={tab}
              style={[styles.topTab, activeTab === tab && styles.topTabActive]}
              onPress={() => setActiveTab(tab)}>
              <Text style={[styles.topTabText, activeTab === tab && styles.topTabTextActive]}>
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <ScrollView style={styles.content}>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'faculties' && renderFaculties()}
          {activeTab === 'students' && renderStudents()}
          {activeTab === 'teams' && renderTeams()}
          {activeTab === 'rules' && renderRules()}
        </ScrollView>
        {renderModal(false)}
        {renderModal(true)}
        <View style={[styles.bottomTab, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.bottomTabItem}>
            <Image source={require('../assets/home-color.png')} style={styles.bottomTabIcon} />
            <Text style={[styles.bottomTabLabelActive, { color: colors.primary }]}>Home</Text>
          </View>
          <TouchableOpacity style={styles.bottomTabItem} onPress={() => navigation.navigate('FacultyCoordinatorMore')}>
            <Image source={require('../assets/more.png')} style={styles.bottomTabIcon} />
            <Text style={[styles.bottomTabLabel, { color: colors.subText }]}>More</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default FacultyCoordinatorDashboard;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { backgroundColor: '#ffffff', paddingTop: 15, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#000000' },
  topTabs: { flexDirection: 'row', backgroundColor: '#FFFFFF', elevation: 2 },
  topTab: { flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  topTabActive: { borderBottomColor: '#43425a' },
  topTabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  topTabTextActive: { color: '#4F46E5' },
  content: { flex: 1, padding: 16 },
  searchInput: { backgroundColor: '#FFFFFF', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, fontSize: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  statCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, width: '48%', elevation: 2 },
  statValue: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#1F2937' },
  cardText: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  slotInfo: { marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  slotText: { fontSize: 14, fontWeight: '600', color: '#4F46E5' },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  badgeAllocated: { backgroundColor: '#D1FAE5' },
  badgeUnallocated: { backgroundColor: '#FEF3C7' },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgeTextAllocated: { color: '#059669' },
  badgeTextUnallocated: { color: '#D97706' },
  button: { backgroundColor: '#000000', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 12 },
  buttonOverride: { backgroundColor: '#6360a6' },
  buttonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  teamMembers: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, marginTop: 8 },
  teamMembersTitle: { fontSize: 13, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  downloadAllButton: { backgroundColor: '#4F46E5', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  downloadAllButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  rulesContainer: { paddingBottom: 20 },
  rulesTitle: { fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 20 },
  ruleCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, elevation: 2 },
  ruleLabel: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 8 },
  ruleInput: { backgroundColor: '#F9FAFB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 8 },
  ruleDescription: { fontSize: 12, color: '#6B7280' },
  saveRulesButton: { backgroundColor: '#4F46E5', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginBottom: 20 },
  saveRulesButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
  currentRulesCard: { backgroundColor: '#EEF2FF', borderRadius: 12, padding: 16 },
  currentRulesTitle: { fontSize: 16, fontWeight: 'bold', color: '#4F46E5', marginBottom: 8 },
  currentRuleText: { fontSize: 14, color: '#1F2937', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, width: '100%', maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  closeButton: { fontSize: 24, color: '#6B7280' },
  infoSection: { backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  infoText: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  facultyList: { maxHeight: 250, marginBottom: 20 },
  facultyOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 8, marginBottom: 8 },
  facultyOptionSelected: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  facultyOptionDisabled: { opacity: 0.5 },
  facultyOptionName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  facultyOptionSpec: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  slotBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  slotBadgeText: { fontSize: 13, fontWeight: '600', color: '#059669' },
  slotBadgeTextFull: { color: '#EF4444' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  submitButton: { flex: 1, backgroundColor: '#4F46E5', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },
  bottomTab: { height: 60, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  bottomTabItem: { alignItems: 'center', justifyContent: 'center' },
  bottomTabIcon: { width: 22, height: 22, marginBottom: 4, resizeMode: 'contain' },
  bottomTabLabel: { fontSize: 12 },
  bottomTabLabelActive: { fontSize: 12, fontWeight: '700' },
});