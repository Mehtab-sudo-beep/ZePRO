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

  const filteredUsers = users.filter(user =>
    filterRole === 'all' ? true : user.role === filterRole
  );

  const facultyCount = users.filter(u => u.role === 'faculty').length;
  const studentCount = users.filter(u => u.role === 'student').length;
  const coordinatorCount = users.filter(u => u.isFacultyCoordinator).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* Stats Cards */}
          <View style={styles.statsGrid}>
            {[
              { label: 'Faculty', value: facultyCount, color: '#1F2937' },
              { label: 'Students', value: studentCount, color: '#059669' },
              { label: 'Coordinators', value: coordinatorCount, color: '#4F46E5' },
            ].map((stat, idx) => (
              <View key={idx} style={styles.statCard}>
                <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Filter Buttons */}
          <View style={styles.filterContainer}>
            {(['all', 'faculty', 'student'] as const).map(role => (
              <TouchableOpacity
                key={role}
                style={[styles.filterButton, filterRole === role && styles.filterButtonActive]}
                onPress={() => setFilterRole(role)}
              >
                <Text style={[styles.filterText, filterRole === role && styles.filterTextActive]}>
                  {role === 'all' ? 'All Users' : role.charAt(0).toUpperCase() + role.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Add User Button */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
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
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Text>
                      </View>
                      {user.isFacultyCoordinator && (
                        <View style={[styles.badge, styles.badgeCoordinator]}>
                          <Text style={[styles.badgeText, styles.badgeTextCoordinator]}>★ Coordinator</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  <View style={styles.userActions}>
                    {user.role === 'faculty' && (
                      <TouchableOpacity
                        style={[styles.button, styles.buttonOverride]}
                        onPress={() => toggleFacultyCoordinator(user.id, user.isFacultyCoordinator || false)}
                      >
                        <Text style={styles.buttonText}>
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
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={handleAddUser}
                >
                  <Text style={styles.submitButtonText}>Add User</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Bottom Tab */}
        <View style={styles.bottomTab}>
          <View style={styles.tabItem}>
            <Image source={require('../assets/home-color.png')} style={styles.tabIcon} />
            <Text style={[styles.tabText, styles.tabTextActive]}>Home</Text>
          </View>

          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Logs')}>
            <Image source={require('../assets/time.png')} style={styles.tabIcon} />
            <Text style={styles.tabText}>Logs</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminMore')}>
            <Image source={require('../assets/more.png')} style={styles.tabIcon} />
            <Text style={styles.tabText}>More</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  content: {
    flex: 1,
    padding: 16,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    minWidth: '28%',
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },

  // Filter
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#4F46E5',
  },
  filterText: {
    fontWeight: '600',
    fontSize: 13,
    color: '#6B7280',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },

  // Add Button
  addButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },

  // Users list
  usersList: {
    paddingBottom: 20,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },

  // Card (matches FacultyCoordinator card style)
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cardText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },

  // User avatar
  userHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#4F46E5',
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

  // Badges
  userMeta: {
    marginBottom: 10,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeRole: {
    backgroundColor: '#EEF2FF',
  },
  badgeCoordinator: {
    backgroundColor: '#D1FAE5',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
  badgeTextRole: {
    color: '#4F46E5',
  },
  badgeTextCoordinator: {
    color: '#059669',
  },

  // Action buttons
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flex: 1,
    backgroundColor: '#000000',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  buttonOverride: {
    backgroundColor: '#6360a6',
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#DC2626',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  deleteButtonText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 13,
  },

  // Modal
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
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    fontSize: 24,
    color: '#6B7280',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  facultyOption: {
    flex: 1,
    padding: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    alignItems: 'center',
  },
  facultyOptionSelected: {
    borderColor: '#4F46E5',
    backgroundColor: '#EEF2FF',
  },
  facultyOptionName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
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

  // Bottom Tab
  bottomTab: {
    height: 60,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    elevation: 2,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    width: 22,
    height: 22,
    marginBottom: 4,
    resizeMode: 'contain',
  },
  tabText: {
    fontSize: 12,
    color: '#6B7280',
  },
  tabTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
});

export default AdminDashboardScreen;