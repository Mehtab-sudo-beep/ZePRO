import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  StyleSheet,
  StatusBar,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';

type FacultyCoordinatorDashboardNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FacultyCoordinatorDashboard'>;

interface Props {
  navigation: FacultyCoordinatorDashboardNavigationProp;
}

interface Faculty {
  id: string;
  name: string;
  email: string;
  department: string;
  maxStudents: number;
  allocatedStudents: number;
  specialization: string;
}

interface Student {
  id: string;
  name: string;
  rollNo: string;
  email: string;
  department: string;
  year: string;
  cgpa: string;
  isAllocated: boolean;
  allocatedFacultyId?: string;
  teamId?: string;
}

interface Team {
  id: string;
  name: string;
  projectTitle: string;
  facultyId: string;
  facultyName: string;
  members: string[];
  status: 'active' | 'completed' | 'pending';
}

interface Rules {
  maxTeamSize: number;
  maxStudentsPerFaculty: number;
}

const FacultyCoordinatorDashboard: React.FC<Props> = ({}) => {
  const [rules, setRules] = useState<Rules>({
    maxTeamSize: 4,
    maxStudentsPerFaculty: 10,
  });

  const [faculties, setFaculties] = useState<Faculty[]>([
    { id: 'F001', name: 'Dr. Sarah Johnson', email: 'sarah.j@university.edu', department: 'Computer Science', maxStudents: 10, allocatedStudents: 8, specialization: 'Machine Learning' },
    { id: 'F002', name: 'Prof. Michael Chen', email: 'michael.c@university.edu', department: 'Computer Science', maxStudents: 8, allocatedStudents: 6, specialization: 'Web Development' },
    { id: 'F003', name: 'Dr. Emily Rodriguez', email: 'emily.r@university.edu', department: 'Computer Science', maxStudents: 12, allocatedStudents: 12, specialization: 'Data Science' },
    { id: 'F004', name: 'Prof. James Williams', email: 'james.w@university.edu', department: 'Computer Science', maxStudents: 10, allocatedStudents: 5, specialization: 'Cybersecurity' },
  ]);

  const [students, setStudents] = useState<Student[]>([
    { id: 'S001', name: 'John Doe', rollNo: 'CS2021001', email: 'john.d@student.edu', department: 'Computer Science', year: '3rd Year', cgpa: '8.5', isAllocated: true, allocatedFacultyId: 'F001', teamId: 'T001' },
    { id: 'S002', name: 'Jane Smith', rollNo: 'CS2021002', email: 'jane.s@student.edu', department: 'Computer Science', year: '3rd Year', cgpa: '9.0', isAllocated: true, allocatedFacultyId: 'F001', teamId: 'T001' },
    { id: 'S003', name: 'Mike Johnson', rollNo: 'CS2021003', email: 'mike.j@student.edu', department: 'Computer Science', year: '3rd Year', cgpa: '7.8', isAllocated: true, allocatedFacultyId: 'F002', teamId: 'T002' },
    { id: 'S004', name: 'Sarah Williams', rollNo: 'CS2021004', email: 'sarah.w@student.edu', department: 'Computer Science', year: '3rd Year', cgpa: '8.9', isAllocated: false },
    { id: 'S005', name: 'Alex Brown', rollNo: 'CS2021005', email: 'alex.b@student.edu', department: 'Computer Science', year: '3rd Year', cgpa: '8.2', isAllocated: false },
    { id: 'S006', name: 'Emma Davis', rollNo: 'CS2021006', email: 'emma.d@student.edu', department: 'Computer Science', year: '3rd Year', cgpa: '9.2', isAllocated: true, allocatedFacultyId: 'F003', teamId: 'T003' },
  ]);

  const [teams] = useState<Team[]>([
    { id: 'T001', name: 'Team Alpha', projectTitle: 'AI-Based Chatbot for Customer Support', facultyId: 'F001', facultyName: 'Dr. Sarah Johnson', members: ['S001', 'S002'], status: 'active' },
    { id: 'T002', name: 'Team Beta', projectTitle: 'E-Commerce Platform with React', facultyId: 'F002', facultyName: 'Prof. Michael Chen', members: ['S003'], status: 'active' },
    { id: 'T003', name: 'Team Gamma', projectTitle: 'Predictive Analytics Dashboard', facultyId: 'F003', facultyName: 'Dr. Emily Rodriguez', members: ['S006'], status: 'active' },
  ]);

  const [activeTab, setActiveTab] = useState<'overview' | 'faculties' | 'students' | 'teams' | 'rules'>('overview');
  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [facultySearchQuery, setFacultySearchQuery] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [tempRules, setTempRules] = useState<Rules>(rules);

  const filteredFaculties = useMemo(() => {
    if (!facultySearchQuery.trim()) return faculties;
    const query = facultySearchQuery.toLowerCase();
    return faculties.filter(f => f.name.toLowerCase().includes(query) || f.email.toLowerCase().includes(query) || f.specialization.toLowerCase().includes(query));
  }, [faculties, facultySearchQuery]);

  const filteredStudents = useMemo(() => {
    if (!studentSearchQuery.trim()) return students;
    const query = studentSearchQuery.toLowerCase();
    return students.filter(s => s.name.toLowerCase().includes(query) || s.rollNo.toLowerCase().includes(query) || s.email.toLowerCase().includes(query));
  }, [students, studentSearchQuery]);

  const stats = {
    totalStudents: students.length,
    allocatedStudents: students.filter(s => s.isAllocated).length,
    unallocatedStudents: students.filter(s => !s.isAllocated).length,
    totalTeams: teams.length,
    totalFaculty: faculties.length,
    availableSlots: faculties.reduce((sum, f) => sum + f.maxStudents, 0) - faculties.reduce((sum, f) => sum + f.allocatedStudents, 0),
  };

  const handleAllocateStudent = () => {
    if (!selectedStudent || !selectedFacultyId) {
      Alert.alert('Error', 'Please select both student and faculty');
      return;
    }

    const faculty = faculties.find(f => f.id === selectedFacultyId);
    if (!faculty || faculty.allocatedStudents >= faculty.maxStudents) {
      Alert.alert('Error', 'No slots available for this faculty');
      return;
    }

    setStudents(students.map(s => s.id === selectedStudent.id ? { ...s, isAllocated: true, allocatedFacultyId: selectedFacultyId } : s));
    setFaculties(faculties.map(f => f.id === selectedFacultyId ? { ...f, allocatedStudents: f.allocatedStudents + 1 } : f));
    setShowAllocationModal(false);
    setSelectedStudent(null);
    setSelectedFacultyId('');
    Alert.alert('Success', 'Student allocated successfully!');
  };

  const handleOverrideAllocation = () => {
    if (!selectedStudent || !selectedFacultyId) {
      Alert.alert('Error', 'Please select faculty');
      return;
    }

    const newFaculty = faculties.find(f => f.id === selectedFacultyId);
    if (!newFaculty || newFaculty.allocatedStudents >= newFaculty.maxStudents) {
      Alert.alert('Error', 'No slots available for this faculty');
      return;
    }

    const oldFacultyId = selectedStudent.allocatedFacultyId;
    setStudents(students.map(s => s.id === selectedStudent.id ? { ...s, allocatedFacultyId: selectedFacultyId } : s));
    setFaculties(faculties.map(f => {
      if (f.id === oldFacultyId) return { ...f, allocatedStudents: f.allocatedStudents - 1 };
      if (f.id === selectedFacultyId) return { ...f, allocatedStudents: f.allocatedStudents + 1 };
      return f;
    }));
    setShowOverrideModal(false);
    setSelectedStudent(null);
    setSelectedFacultyId('');
    Alert.alert('Success', 'Allocation overridden successfully!');
  };

  const handleDownloadAllTeamsReport = () => {
    const report = `
═══════════════════════════════════════════
     ALL TEAMS PROJECT REPORT
═══════════════════════════════════════════

Total Teams: ${teams.length}
Generated on: ${new Date().toLocaleDateString()}

${teams.map((team, idx) => {
  const teamMembers = students.filter(s => team.members.includes(s.id));
  const faculty = faculties.find(f => f.id === team.facultyId);
  return `
─────────────────────────────────────────
TEAM ${idx + 1}: ${team.name}
─────────────────────────────────────────
Project Title: ${team.projectTitle}
Status: ${team.status.toUpperCase()}

Project Guide:
  Name: ${faculty?.name || 'N/A'}
  Email: ${faculty?.email || 'N/A'}
  Specialization: ${faculty?.specialization || 'N/A'}

Team Members (${teamMembers.length}):
${teamMembers.map((member, i) => `  ${i + 1}. ${member.name} (${member.rollNo})
     Email: ${member.email}
     CGPA: ${member.cgpa}`).join('\n')}
`;
}).join('\n')}

═══════════════════════════════════════════
    `.trim();

    Alert.alert('All Teams Report', report, [{ text: 'OK' }]);
  };

  const handleSaveRules = () => {
    setRules(tempRules);
    Alert.alert('Success', 'Rules updated successfully!');
  };

  const renderOverview = () => (
    <View>
      <View style={styles.statsGrid}>
        {[
          { label: 'Total Students', value: stats.totalStudents, color: '#1F2937' },
          { label: 'Allocated', value: stats.allocatedStudents, color: '#059669' },
          { label: 'Unallocated', value: stats.unallocatedStudents, color: '#D97706' },
          { label: 'Active Teams', value: stats.totalTeams, color: '#1F2937' },
          { label: 'Total Faculty', value: stats.totalFaculty, color: '#1F2937' },
          { label: 'Available Slots', value: stats.availableSlots, color: '#4F46E5' },
        ].map((stat, idx) => (
          <View key={idx} style={styles.statCard}>
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderFaculties = () => (
    <View>
      <TextInput
        style={styles.searchInput}
        placeholder="Search faculty..."
        placeholderTextColor="#9CA3AF"
        value={facultySearchQuery}
        onChangeText={setFacultySearchQuery}
      />
      {filteredFaculties.map(faculty => (
        <View key={faculty.id} style={styles.card}>
          <Text style={styles.cardTitle}>{faculty.name}</Text>
          <Text style={styles.cardText}>{faculty.email}</Text>
          <Text style={styles.cardText}>Specialization: {faculty.specialization}</Text>
          <View style={styles.slotInfo}>
            <Text style={styles.slotText}>Slots: {faculty.allocatedStudents}/{faculty.maxStudents}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderStudents = () => (
    <View>
      <TextInput
        style={styles.searchInput}
        placeholder="Search students..."
        placeholderTextColor="#9CA3AF"
        value={studentSearchQuery}
        onChangeText={setStudentSearchQuery}
      />
      {filteredStudents.map(student => (
        <View key={student.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{student.name}</Text>
              <Text style={styles.cardText}>{student.rollNo}</Text>
            </View>
            <View style={[styles.badge, student.isAllocated ? styles.badgeAllocated : styles.badgeUnallocated]}>
              <Text style={[styles.badgeText, student.isAllocated ? styles.badgeTextAllocated : styles.badgeTextUnallocated]}>
                {student.isAllocated ? 'Allocated' : 'Unallocated'}
              </Text>
            </View>
          </View>
          <Text style={styles.cardText}>Email: {student.email}</Text>
          <Text style={styles.cardText}>CGPA: {student.cgpa}</Text>
          {student.isAllocated && student.allocatedFacultyId && (
            <Text style={styles.cardText}>Faculty: {faculties.find(f => f.id === student.allocatedFacultyId)?.name}</Text>
          )}
          <TouchableOpacity
            style={[styles.button, student.isAllocated && styles.buttonOverride]}
            onPress={() => {
              setSelectedStudent(student);
              student.isAllocated ? setShowOverrideModal(true) : setShowAllocationModal(true);
            }}
          >
            <Text style={styles.buttonText}>{student.isAllocated ? 'Override Allocation' : 'Allocate Faculty'}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  const renderTeams = () => (
    <View>
      <TouchableOpacity style={styles.downloadAllButton} onPress={handleDownloadAllTeamsReport}>
        <Text style={styles.downloadAllButtonText}>Download All Teams Report</Text>
      </TouchableOpacity>
      {teams.map(team => {
        const teamMembers = students.filter(s => team.members.includes(s.id));
        return (
          <View key={team.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{team.name}</Text>
              <View style={styles.badgeAllocated}>
                <Text style={styles.badgeTextAllocated}>{team.status}</Text>
              </View>
            </View>
            <Text style={[styles.cardText, { fontWeight: '600', color: '#f4f4f4' }]}>{team.projectTitle}</Text>
            <Text style={styles.cardText}>Guide: {team.facultyName}</Text>
            <View style={styles.teamMembers}>
              <Text style={styles.teamMembersTitle}>Members ({teamMembers.length})</Text>
              {teamMembers.map(member => (
                <Text key={member.id} style={styles.cardText}>• {member.name} ({member.rollNo})</Text>
              ))}
            </View>
          </View>
        );
      })}
    </View>
  );

  const renderRules = () => (
    <View style={styles.rulesContainer}>
      <Text style={styles.rulesTitle}>Project Allocation Rules</Text>
      
      <View style={styles.ruleCard}>
        <Text style={styles.ruleLabel}>Maximum Team Size</Text>
        <TextInput
          style={styles.ruleInput}
          placeholder="Enter max team size"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          value={String(tempRules.maxTeamSize)}
          onChangeText={text => setTempRules({ ...tempRules, maxTeamSize: parseInt(text) || 0 })}
        />
        <Text style={styles.ruleDescription}>Maximum number of students allowed per team</Text>
      </View>

      <View style={styles.ruleCard}>
        <Text style={styles.ruleLabel}>Maximum Students per Faculty</Text>
        <TextInput
          style={styles.ruleInput}
          placeholder="Enter max students"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          value={String(tempRules.maxStudentsPerFaculty)}
          onChangeText={text => setTempRules({ ...tempRules, maxStudentsPerFaculty: parseInt(text) || 0 })}
        />
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
            <TouchableOpacity onPress={() => isOverride ? setShowOverrideModal(false) : setShowAllocationModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {selectedStudent && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Student</Text>
              <Text style={styles.infoText}>{selectedStudent.name} ({selectedStudent.rollNo})</Text>
              {isOverride && selectedStudent.allocatedFacultyId && (
                <Text style={styles.infoText}>Current: {faculties.find(f => f.id === selectedStudent.allocatedFacultyId)?.name}</Text>
              )}
            </View>
          )}

          <Text style={styles.sectionTitle}>Select Faculty</Text>
          <ScrollView style={styles.facultyList}>
            {faculties.filter(f => !isOverride || f.id !== selectedStudent?.allocatedFacultyId).map(faculty => {
              const isDisabled = faculty.allocatedStudents >= faculty.maxStudents;
              return (
                <TouchableOpacity
                  key={faculty.id}
                  style={[styles.facultyOption, selectedFacultyId === faculty.id && styles.facultyOptionSelected, isDisabled && styles.facultyOptionDisabled]}
                  onPress={() => !isDisabled && setSelectedFacultyId(faculty.id)}
                  disabled={isDisabled}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.facultyOptionName}>{faculty.name}</Text>
                    <Text style={styles.facultyOptionSpec}>{faculty.specialization}</Text>
                  </View>
                  <View style={styles.slotBadge}>
                    <Text style={[styles.slotBadgeText, isDisabled && styles.slotBadgeTextFull]}>
                      {faculty.allocatedStudents}/{faculty.maxStudents}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => {
              isOverride ? setShowOverrideModal(false) : setShowAllocationModal(false);
              setSelectedStudent(null);
              setSelectedFacultyId('');
            }}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.submitButton} onPress={isOverride ? handleOverrideAllocation : handleAllocateStudent}>
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

      <View style={styles.tabs}>
        {['overview', 'faculties', 'students', 'teams', 'rules'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab as any)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
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
    </View>
    /</SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3F4F6' },
  header: { backgroundColor: '#ffffff', paddingTop: 15, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#000000' },
  tabs: { flexDirection: 'row', backgroundColor: '#FFFFFF', elevation: 2 },
  tab: { flex: 1, paddingVertical: 16, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#43425a' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  tabTextActive: { color: '#4F46E5' },
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
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
  safeArea: {
  flex: 1,
  backgroundColor: '#F9FAFB',
},
});

export default FacultyCoordinatorDashboard;