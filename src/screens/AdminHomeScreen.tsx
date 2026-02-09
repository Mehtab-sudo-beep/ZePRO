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
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';

type AdminDashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AdminHome'
>;

interface Props {
  navigation: AdminDashboardScreenNavigationProp;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'faculty' | 'student';
  isFacultyCoordinator?: boolean;
}

const AdminDashboardScreen: React.FC<Props> = ({ navigation }) => {
  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Dr. Sarah Johnson', email: 'sarah.j@university.edu', role: 'faculty', isFacultyCoordinator: true },
    { id: '2', name: 'Prof. Michael Chen', email: 'michael.c@university.edu', role: 'faculty' },
    { id: '3', name: 'Dr. Emily Rodriguez', email: 'emily.r@university.edu', role: 'faculty' },
    { id: '4', name: 'John Doe', email: 'john.d@student.edu', role: 'student' },
    { id: '5', name: 'Jane Smith', email: 'jane.s@student.edu', role: 'student' },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [filterRole, setFilterRole] = useState<'all' | 'faculty' | 'student'>('all');

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    role: 'student' as 'faculty' | 'student',
  });

  // Add new user
  const handleAddUser = () => {
    if (newUser.name && newUser.email) {
      const user: User = {
        id: Date.now().toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isFacultyCoordinator: false,
      };
      setUsers([...users, user]);
      setNewUser({ name: '', email: '', role: 'student' });
      setShowAddModal(false);
      Alert.alert('Success', 'User added successfully!');
    } else {
      Alert.alert('Error', 'Please fill in all fields');
    }
  };

  // Delete user
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

  // Assign/Remove faculty coordinator
  const toggleFacultyCoordinator = (userId: string, currentStatus: boolean) => {
    setUsers(users.map(user => {
      if (user.id === userId) {
        return { ...user, isFacultyCoordinator: !currentStatus };
      }
      return user;
    }));
    Alert.alert(
      'Success',
      currentStatus ? 'Faculty coordinator removed' : 'Faculty coordinator assigned'
    );
  };

  // Filter users based on role
  const filteredUsers = users.filter(user =>
    filterRole === 'all' ? true : user.role === filterRole
  );

  const facultyCount = users.filter(u => u.role === 'faculty').length;
  const studentCount = users.filter(u => u.role === 'student').length;
  const coordinatorCount = users.filter(u => u.isFacultyCoordinator).length;

  

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          
        </View>

      </View>

      <ScrollView style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statCardBlue]}>
            <Text style={styles.statNumber}>{facultyCount}</Text>
            <Text style={styles.statLabel}>Faculty</Text>
          </View>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <Text style={styles.statNumber}>{studentCount}</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={[styles.statCard, styles.statCardPurple]}>
            <Text style={styles.statNumber}>{coordinatorCount}</Text>
            <Text style={styles.statLabel}>Coordinators</Text>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, filterRole === 'all' && styles.filterButtonActive]}
            onPress={() => setFilterRole('all')}
          >
            <Text style={[styles.filterText, filterRole === 'all' && styles.filterTextActive]}>
              All Users
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterRole === 'faculty' && styles.filterButtonActiveBlue]}
            onPress={() => setFilterRole('faculty')}
          >
            <Text style={[styles.filterText, filterRole === 'faculty' && styles.filterTextActive]}>
              Faculty
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, filterRole === 'student' && styles.filterButtonActiveGreen]}
            onPress={() => setFilterRole('student')}
          >
            <Text style={[styles.filterText, filterRole === 'student' && styles.filterTextActive]}>
              Students
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add User Button */}
        <TouchableOpacity style={styles.addButton} onPress={() => setShowAddModal(true)}>
          <Text style={styles.addButtonText}>+ Add User</Text>
        </TouchableOpacity>

        {/* Users List */}
        <View style={styles.usersList}>
          {filteredUsers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No users found</Text>
            </View>
          ) : (
            filteredUsers.map(user => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <View style={styles.userAvatar}>
                    <Text style={styles.userAvatarText}>{user.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                </View>

                <View style={styles.userMeta}>
                  <View style={styles.badges}>
                    <View
                      style={[
                        styles.roleBadge,
                        user.role === 'faculty' ? styles.roleBadgeFaculty : styles.roleBadgeStudent,
                      ]}
                    >
                      <Text style={styles.roleBadgeText}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Text>
                    </View>
                    {user.isFacultyCoordinator && (
                      <View style={styles.coordinatorBadge}>
                        <Text style={styles.coordinatorBadgeText}>★ Coordinator</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.userActions}>
                  {user.role === 'faculty' && (
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        user.isFacultyCoordinator ? styles.actionButtonPurple : styles.actionButtonGray,
                      ]}
                      onPress={() => toggleFacultyCoordinator(user.id, user.isFacultyCoordinator || false)}
                    >
                      <Text style={styles.actionButtonText}>
                        {user.isFacultyCoordinator ? 'Remove Coordinator' : 'Make Coordinator'}
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
            <Text style={styles.modalTitle}>Add New User</Text>

            <TextInput
              style={styles.input}
              placeholder="Full Name"
              value={newUser.name}
              onChangeText={text => setNewUser({ ...newUser, name: text })}
              placeholderTextColor="#9CA3AF"
            />

            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={newUser.email}
              onChangeText={text => setNewUser({ ...newUser, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#9CA3AF"
            />

            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  newUser.role === 'student' && styles.roleOptionActive,
                ]}
                onPress={() => setNewUser({ ...newUser, role: 'student' })}
              >
                <Text
                  style={[
                    styles.roleOptionText,
                    newUser.role === 'student' && styles.roleOptionTextActive,
                  ]}
                >
                  Student
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleOption,
                  newUser.role === 'faculty' && styles.roleOptionActive,
                ]}
                onPress={() => setNewUser({ ...newUser, role: 'faculty' })}
              >
                <Text
                  style={[
                    styles.roleOptionText,
                    newUser.role === 'faculty' && styles.roleOptionTextActive,
                  ]}
                >
                  Faculty
                </Text>
              </TouchableOpacity>
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
            {/* Add User Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* your add user modal content stays SAME */}
          </View>
        </View>
      </Modal>

      
      {/* =========================
          Bottom Dashboard
         ========================= */}
      <View style={styles.bottomTab}>
        <Text style={styles.tabActive}>Home</Text>

        <TouchableOpacity onPress={() => navigation.navigate('Logs')}>
          <Text style={styles.tab}>Logs</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('AdminMore')}>
          <Text style={styles.tab}>More</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
    logItem: {
  fontSize: 14,
  color: '#374151',
  marginBottom: 8,
},
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#000000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    marginTop: 4,
  },
  
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statCardBlue: {
    borderLeftWidth: 4,
    borderLeftColor: '#2b313c',
  },
  statCardGreen: {
    borderLeftWidth: 4,
    borderLeftColor: '#2b313c',
  },
  statCardPurple: {
    borderLeftWidth: 4,
    borderLeftColor: '#2b313c',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#374151',
  },
  filterButtonActiveBlue: {
    backgroundColor: '#374151',
  },
  filterButtonActiveGreen: {
    backgroundColor: '#374151',
  },
  filterText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  addButton: {
    backgroundColor: '#374151',
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  usersList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#717175',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  userInfo: {
    marginLeft: 12,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  userMeta: {
    marginBottom: 12,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeFaculty: {
    backgroundColor: '#DBEAFE',
  },
  roleBadgeStudent: {
    backgroundColor: '#D1FAE5',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
  },
  coordinatorBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  coordinatorBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7C3AED',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonGray: {
    backgroundColor: '#E5E7EB',
  },
  actionButtonPurple: {
    backgroundColor: '#EDE9FE',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  deleteButton: {
    backgroundColor: '#eea7a7fb',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#020000',
    fontWeight: '600',
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#1F2937',
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  roleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  roleOptionActive: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  roleOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  roleOptionTextActive: {
    color: '#4F46E5',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
   bottomTab: {
    height: 60,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  tab: {
    color: '#9CA3AF',
    fontSize: 12,
  },

  tabActive: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default AdminDashboardScreen;