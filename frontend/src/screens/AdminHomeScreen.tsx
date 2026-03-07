import React, { useContext, useState } from 'react';
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
import { ThemeContext } from '../theme/ThemeContext';

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
  const { colors } = useContext(ThemeContext);

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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.card} />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Dashboard</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderLeftColor: colors.primary }]}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{facultyCount}</Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>Faculty</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderLeftColor: colors.primary }]}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{studentCount}</Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>Students</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderLeftColor: colors.primary }]}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{coordinatorCount}</Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>Coordinators</Text>
          </View>
        </View>

        {/* Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: filterRole === 'all' ? colors.primary : colors.border }]}
            onPress={() => setFilterRole('all')}
          >
            <Text style={[styles.filterText, { color: filterRole === 'all' ? '#FFFFFF' : colors.subText }]}>
              All Users
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: filterRole === 'faculty' ? colors.primary : colors.border }]}
            onPress={() => setFilterRole('faculty')}
          >
            <Text style={[styles.filterText, { color: filterRole === 'faculty' ? '#FFFFFF' : colors.subText }]}>
              Faculty
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, { backgroundColor: filterRole === 'student' ? colors.primary : colors.border }]}
            onPress={() => setFilterRole('student')}
          >
            <Text style={[styles.filterText, { color: filterRole === 'student' ? '#FFFFFF' : colors.subText }]}>
              Students
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add User Button */}
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.primary }]}
          onPress={() => setShowAddModal(true)}
        >
          <Text style={styles.addButtonText}>+ Add User</Text>
        </TouchableOpacity>

        {/* Users List */}
        <View style={styles.usersList}>
          {filteredUsers.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyText, { color: colors.subText }]}>No users found</Text>
            </View>
          ) : (
            filteredUsers.map(user => (
              <View key={user.id} style={[styles.userCard, { backgroundColor: colors.card }]}>
                <View style={styles.userHeader}>
                  <View style={[styles.userAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.userAvatarText}>{user.name.charAt(0)}</Text>
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: colors.text }]}>{user.name}</Text>
                    <Text style={[styles.userEmail, { color: colors.subText }]}>{user.email}</Text>
                  </View>
                </View>

                <View style={styles.userMeta}>
                  <View style={styles.badges}>
                    <View style={[styles.roleBadge, { backgroundColor: colors.primary + '18' }]}>
                      <Text style={[styles.roleBadgeText, { color: colors.primary }]}>
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </Text>
                    </View>
                    {user.isFacultyCoordinator && (
                      <View style={[styles.coordinatorBadge, { backgroundColor: colors.primary + '18' }]}>
                        <Text style={[styles.coordinatorBadgeText, { color: colors.primary }]}>★ Coordinator</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.userActions}>
                  {user.role === 'faculty' && (
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.primary + '18', borderColor: colors.primary, borderWidth: 1 }]}
                      onPress={() => toggleFacultyCoordinator(user.id, user.isFacultyCoordinator || false)}
                    >
                      <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                        {user.isFacultyCoordinator ? 'Remove Coordinator' : 'Make Coordinator'}
                      </Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.deleteButton, { borderColor: '#DC2626' }]}
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
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Add New User</Text>

            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="Full Name"
              value={newUser.name}
              onChangeText={text => setNewUser({ ...newUser, name: text })}
              placeholderTextColor={colors.subText}
            />

            <TextInput
              style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="Email Address"
              value={newUser.email}
              onChangeText={text => setNewUser({ ...newUser, email: text })}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={colors.subText}
            />

            <View style={styles.roleSelector}>
              <TouchableOpacity
                style={[styles.roleOption, { borderColor: newUser.role === 'student' ? colors.primary : colors.border, backgroundColor: newUser.role === 'student' ? colors.primary + '18' : 'transparent' }]}
                onPress={() => setNewUser({ ...newUser, role: 'student' })}
              >
                <Text style={[styles.roleOptionText, { color: newUser.role === 'student' ? colors.primary : colors.subText }]}>
                  Student
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roleOption, { borderColor: newUser.role === 'faculty' ? colors.primary : colors.border, backgroundColor: newUser.role === 'faculty' ? colors.primary + '18' : 'transparent' }]}
                onPress={() => setNewUser({ ...newUser, role: 'faculty' })}
              >
                <Text style={[styles.roleOptionText, { color: newUser.role === 'faculty' ? colors.primary : colors.subText }]}>
                  Faculty
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.border }]}
                onPress={() => {
                  setShowAddModal(false);
                  setNewUser({ name: '', email: '', role: 'student' });
                }}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, { backgroundColor: colors.primary }]}
                onPress={handleAddUser}
              >
                <Text style={styles.submitButtonText}>Add User</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Tab */}
      <View style={[styles.bottomTab, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.tabItem}>
          <Image source={require('../assets/home-color.png')} style={styles.tabIcon} />
          <Text style={[styles.tabActive, { color: colors.primary }]}>Home</Text>
        </View>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('Logs')}>
          <Image source={require('../assets/time.png')} style={styles.tabIcon} />
          <Text style={[styles.tab, { color: colors.subText }]}>Logs</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminMore')}>
          <Image source={require('../assets/more.png')} style={styles.tabIcon} />
          <Text style={[styles.tab, { color: colors.subText }]}>More</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    height: 60,
    paddingHorizontal: 20,
    justifyContent: 'center',
    elevation: 4,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
  },

  content: { flex: 1 },

  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },

  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    borderLeftWidth: 4,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
  },

  statLabel: {
    fontSize: 12,
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
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  filterText: {
    fontWeight: '600',
    fontSize: 14,
  },

  addButton: {
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
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 16,
  },

  userCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
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
  },

  userEmail: {
    fontSize: 14,
    marginTop: 2,
  },

  userMeta: { marginBottom: 12 },

  badges: {
    flexDirection: 'row',
    gap: 8,
  },

  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },

  coordinatorBadge: {
    backgroundColor: '#bbaee3',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },

  coordinatorBadgeText: {
    fontSize: 12,
    fontWeight: '600',
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

  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
  },

  deleteButton: {
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  deleteButtonText: {
    color: '#DC2626',
    fontWeight: '600',
    fontSize: 13,
  },

  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },

  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
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
    alignItems: 'center',
  },

  roleOptionText: {
    fontSize: 16,
    fontWeight: '600',
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
    alignItems: 'center',
  },

  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },

  submitButton: {
    flex: 1,
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
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

  tab: { fontSize: 12 },

  tabActive: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default AdminDashboardScreen;