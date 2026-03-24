import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Image,
  Alert,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp, useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCallback } from 'react';
import { getAllUsers, updateUserRole } from '../api/departmentApi';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'AdminHome'>;
type RouteP = RouteProp<RootStackParamList, 'AdminHome'>;

interface Props {
  navigation: NavProp;
  route: RouteP;
}

type DBUserRole = 'STUDENT' | 'FACULTY' | 'FACULTY_COORDINATOR' | 'ADMIN';

interface User {
  id: string;
  name: string;
  email: string;
  role: DBUserRole;
}

const AdminHomeScreen: React.FC<Props> = ({ navigation, route }) => {
  const { departmentId, departmentName, instituteName } = route.params || {};

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | 'faculty' | 'student' | 'coordinator'>('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'student' });
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();
      const fetchedUsers: User[] = (res.data || []).map((u: any) => ({
        id: u.userId?.toString(),
        name: u.name,
        email: u.email,
        role: u.role,
      }));
      setUsers(fetchedUsers);
    } catch (err) {
      console.log('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUsers();
    }, [])
  );

  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      const user: User = {
        id: Date.now().toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role === 'faculty' ? 'FACULTY' : 'STUDENT', // Map to DBUserRole
      };
      setUsers([...users, user]);
      setNewUser({ name: '', email: '', role: 'student' });
      setShowAddModal(false);
      Alert.alert('Success', 'User added successfully!');
    } else {
      Alert.alert('Error', 'Please fill in all fields');
    }
  };

  const handleDeleteUser = (userId: string, userName: string) => {
    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete ${userName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setUsers(users.filter(user => user.id !== userId)),
        },
      ]
    );
  };

  const toggleFacultyCoordinator = async (userId: string, currentRole: DBUserRole) => {
    const newRole = currentRole === 'FACULTY_COORDINATOR' ? 'FACULTY' : 'FACULTY_COORDINATOR';
    try {
      await updateUserRole(userId, newRole);
      setUsers(users.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));
      Alert.alert('Success', newRole === 'FACULTY_COORDINATOR' ? 'Made Faculty Coordinator' : 'Reverted to Faculty');
    } catch (err) {
      console.log('Role update failed:', err);
      Alert.alert('Error', 'Failed to update role');
    }
  };

  // Stats computation based on fetched users
  const facultyCount = users.filter(u => u.role === 'FACULTY' || u.role === 'FACULTY_COORDINATOR').length;
  const studentCount = users.filter(u => u.role === 'STUDENT').length;
  const coordinatorCount = users.filter(u => u.role === 'FACULTY_COORDINATOR').length;

  const filteredUsers = users.filter(u => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterRole === 'all') return matchesSearch;
    if (filterRole === 'faculty') return matchesSearch && (u.role === 'FACULTY' || u.role === 'FACULTY_COORDINATOR');
    if (filterRole === 'student') return matchesSearch && u.role === 'STUDENT';
    if (filterRole === 'coordinator') return matchesSearch && u.role === 'FACULTY_COORDINATOR';
    return false;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{departmentName || 'Admin Dashboard'}</Text>
            <Text style={styles.headerSubtitle}>{instituteName || 'All Institute Users'}</Text>
          </View>
        </View>

        <ScrollView style={styles.content}>
          {/* Institute List Button at Top */}
          <View style={{ marginBottom: 16 }}>
            <TouchableOpacity style={styles.addButton} onPress={() => navigation.navigate('InstituteList')}>
              <Text style={styles.addButtonText}>Institute List</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            {[
              { label: 'Faculty', value: facultyCount, color: '#1F2937' },
              { label: 'Students', value: studentCount, color: '#059669' },
              { label: 'Coordinators', value: coordinatorCount, color: '#7C3AED' },
            ].map((stat, idx) => (
              <View key={idx} style={[styles.statCard, { flex: 1, marginHorizontal: 4 }]}>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            {([['all', 'All Users'], ['faculty', 'Faculty'], ['student', 'Student'], ['coordinator', 'Coordinator']] as const).map(([role, label]) => (
              <TouchableOpacity
                key={role}
                style={[styles.filterButton, filterRole === role && styles.filterButtonActive]}
                onPress={() => setFilterRole(role as any)}
              >
                <Text style={[styles.filterText, filterRole === role && styles.filterTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* User List Heading */}
          <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#1F2937', marginBottom: 10 }}>User List</Text>

          {/* Search Bar */}
          <View style={styles.listSearchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.listSearchInput}
              placeholder="Search users by name or email..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {/* Users List */}
          <View style={styles.usersList}>
            {filteredUsers.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No users found</Text>
              </View>
            ) : (
              filteredUsers.map(user => (
                <View key={user.id} style={styles.card}>
                  <View style={styles.userHeader}>
                    <View style={styles.userAvatar}>
                      <Text style={styles.userAvatarText}>{user.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.userInfo}>
                      <Text style={styles.cardTitle}>{user.name}</Text>
                      <Text style={styles.cardText}>{user.email}</Text>
                    </View>
                  </View>

                  <View style={styles.userMeta}>
                    <View style={styles.badges}>
                      <View style={[styles.badge, styles.badgeRole]}>
                        <Text style={[styles.badgeText, styles.badgeTextRole]}>
                          {user.role === 'STUDENT' ? 'Student' : (user.role === 'FACULTY_COORDINATOR' ? 'Coordinator' : 'Faculty')}
                        </Text>
                      </View>
                      {user.role === 'FACULTY_COORDINATOR' && (
                        <View style={[styles.badge, styles.badgeCoordinator]}>
                          <Text style={[styles.badgeText, styles.badgeTextCoordinator]}>★ Coordinator</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.userActions}>
                    {(user.role === 'FACULTY' || user.role === 'FACULTY_COORDINATOR') && (
                      <TouchableOpacity
                        style={[
                          styles.button,
                          styles.buttonOverride,
                          user.role === 'FACULTY_COORDINATOR' && { backgroundColor: '#DC2626' },
                        ]}
                        onPress={() => toggleFacultyCoordinator(user.id, user.role)}
                      >
                        <Text style={styles.buttonText}>
                          {user.role === 'FACULTY_COORDINATOR' ? 'Make Faculty' : 'Make Coordinator'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteUser(user.id, user.name)}
                    >
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Add User Modal */}
        <Modal
          visible={showAddModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New User</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.searchInput}
                placeholder="Full Name"
                value={newUser.name}
                onChangeText={text => setNewUser({ ...newUser, name: text })}
                placeholderTextColor="#9CA3AF"
              />
              <TextInput
                style={styles.searchInput}
                placeholder="Email Address"
                value={newUser.email}
                onChangeText={text => setNewUser({ ...newUser, email: text })}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#9CA3AF"
              />

              <Text style={styles.sectionTitle}>Select Role</Text>
              <View style={styles.roleSelector}>
                {(['student', 'faculty'] as const).map(role => (
                  <TouchableOpacity
                    key={role}
                    style={[styles.facultyOption, newUser.role === role && styles.facultyOptionSelected]}
                    onPress={() => setNewUser({ ...newUser, role })}
                  >
                    <Text style={styles.facultyOptionName}>
                      {role.charAt(0).toUpperCase() + role.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setShowAddModal(false);
                    setNewUser({ name: '', email: '', role: 'student' });
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={handleAddUser}>
                  <Text style={styles.submitButtonText}>Add User</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Bottom Tab */}
        <View style={styles.bottomTab}>
          <TouchableOpacity onPress={() => navigation.navigate('InstituteList')}>
            <Text style={styles.tabText}>🏠 Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('AdminMore')}>
            <Text style={styles.tabText}>⋯ More</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AdminHomeScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  // Header with back button
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backBtn: { marginRight: 12 },
  backArrow: { fontSize: 36, color: '#1F2937', lineHeight: 40 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#000000' },
  headerSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  content: { flex: 1, padding: 16 },

  listSearchContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#6B7280',
  },
  listSearchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#1F2937',
  },

  // Stats
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statValue: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },

  // Filter
  filterContainer: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterButton: { flex: 1, paddingVertical: 10, borderRadius: 8, alignItems: 'center', backgroundColor: '#E5E7EB' },
  filterButtonActive: { backgroundColor: '#4F46E5' },
  filterText: { fontWeight: '600', fontSize: 13, color: '#6B7280' },
  filterTextActive: { color: '#FFFFFF' },

  // Add Button
  addButton: { backgroundColor: '#4F46E5', paddingVertical: 12, borderRadius: 8, alignItems: 'center', marginBottom: 16 },
  addButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },

  // Users list
  usersList: { paddingBottom: 20 },
  emptyState: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 16, color: '#6B7280' },

  // Card
  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  cardText: { fontSize: 14, color: '#6B7280', marginTop: 2 },

  // User avatar
  userHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  userAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#4F46E5', justifyContent: 'center', alignItems: 'center' },
  userAvatarText: { color: '#FFFFFF', fontSize: 20, fontWeight: 'bold' },
  userInfo: { marginLeft: 12, flex: 1 },

  // Badges
  userMeta: { marginBottom: 10 },
  badges: { flexDirection: 'row', gap: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeRole: { backgroundColor: '#EEF2FF' },
  badgeCoordinator: { backgroundColor: '#D1FAE5' },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgeTextRole: { color: '#4F46E5' },
  badgeTextCoordinator: { color: '#059669' },

  // Action buttons
  userActions: { flexDirection: 'row', gap: 8 },
  button: { flex: 1, backgroundColor: '#000000', paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  buttonOverride: { backgroundColor: '#6360a6' },
  buttonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },
  deleteButton: { borderWidth: 1, borderColor: '#DC2626', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, alignItems: 'center', marginTop: 4 },
  deleteButtonText: { color: '#DC2626', fontWeight: '600', fontSize: 13 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, width: '100%', maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  closeButton: { fontSize: 24, color: '#6B7280' },
  searchInput: { backgroundColor: '#FFFFFF', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 16, fontSize: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 },
  roleSelector: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  facultyOption: { flex: 1, padding: 12, borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 8, alignItems: 'center' },
  facultyOptionSelected: { borderColor: '#4F46E5', backgroundColor: '#EEF2FF' },
  facultyOptionName: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  modalButtons: { flexDirection: 'row', gap: 12 },
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center' },
  cancelButtonText: { fontSize: 16, fontWeight: '600', color: '#374151' },
  submitButton: { flex: 1, backgroundColor: '#4F46E5', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { fontSize: 16, fontWeight: '600', color: '#FFFFFF' },

  bottomTab: { flexDirection: 'row', justifyContent: 'space-around', padding: 12, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  tabText: { fontSize: 14, color: '#4F46E5', fontWeight: '600' },
});