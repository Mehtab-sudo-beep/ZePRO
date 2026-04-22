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
  Dimensions,
  TextInput,
} from 'react-native';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertContext } from '../context/AlertContext';
import { ThemeContext } from '../theme/ThemeContext';
import { getFacultyByDepartment, assignFacultyCoordinator, removeFacultyCoordinator, getDepartmentStats, getStudentsByDepartment, deleteUser } from '../api/departmentApi';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DepartmentDetails'>;
type RoutePropType = RouteProp<RootStackParamList, 'DepartmentDetails'>;

interface UserItem {
  userId: string;
  name: string;
  email: string;
  role: string;
  rollNumber?: string;
  isFC?: boolean;
}

type TabType = 'FACULTY' | 'STUDENTS';

const DepartmentDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { showAlert } = useContext(AlertContext);
  const { colors, theme } = useContext(ThemeContext);

  const { departmentId, departmentName, instituteId, instituteName } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [facultyList, setFacultyList] = useState<UserItem[]>([]);
  const [studentList, setStudentList] = useState<UserItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('FACULTY');
  const [showModal, setShowModal] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [currentCoordinator, setCurrentCoordinator] = useState<UserItem | null>(null);

  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalProjects: 0,
  });

  const isDark = theme === 'dark';
  const divider = isDark ? '#374151' : '#E5E7EB';

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [facRes, studRes] = await Promise.all([
        getFacultyByDepartment(String(departmentId)),
        getStudentsByDepartment(String(departmentId))
      ]);
      
      setFacultyList(facRes.data || []);
      setStudentList(studRes.data || []);

      const coordinator = facRes.data?.find((f: UserItem) => f.isFC);
      setCurrentCoordinator(coordinator || null);
    } catch (error: any) {
      if (error.response?.status === 403) {
        showAlert('Access Denied', 'Permission required to view members.');
      }
    } finally {
      setLoading(false);
    }
  }, [departmentId, showAlert]);

  const loadStats = useCallback(async () => {
    try {
      const statsRes = await getDepartmentStats(String(departmentId));
      setStats({
        totalStudents: statsRes.data.studentCount,
        totalFaculty: statsRes.data.facultyCount,
        totalProjects: statsRes.data.projectCount,
      });
    } catch (e) {}
  }, [departmentId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
      loadStats();
    }, [loadData, loadStats])
  );

  const handleAssignCoordinator = async (faculty: UserItem) => {
    showAlert(
      'Assign FC',
      `Make "${faculty.name}" the Faculty Coordinator?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setAssigning(true);
            try {
              await assignFacultyCoordinator(String(departmentId), faculty.userId);
              showAlert('Success', 'Coordinator assigned');
              loadData();
              setShowModal(false);
            } catch (error: any) {
              showAlert('Error', 'Failed to assign');
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
      'Remove FC',
      `Remove "${currentCoordinator.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFacultyCoordinator(String(departmentId), currentCoordinator.userId);
              loadData();
            } catch (err) {}
          },
        },
      ]
    );
  };

  const handleRemoveUser = (userId: string, name: string, role: string) => {
    showAlert(
      'Remove User',
      `Are you sure you want to completely remove ${name} from the system?\n\nWARNING: For Faculty, this deletes their projects. For Students, this removes them from their team and revokes their team's project allocation if applicable.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              await deleteUser(userId);
              showAlert('Success', 'User removed successfully');
              loadData();
              loadStats();
            } catch (error: any) {
              showAlert('Error', 'Failed to remove user');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const filteredList = (activeTab === 'FACULTY' ? facultyList : studentList).filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.rollNumber && item.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const renderMemberCard = (item: UserItem) => {
    const isFaculty = activeTab === 'FACULTY';
    const isCoordinator = isFaculty && item.isFC;
    
    return (
      <View key={item.userId} style={[styles.card, { backgroundColor: colors.card }]}>
        <View style={styles.cardContent}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: colors.text }]}>{item.name}</Text>
            <Text style={[styles.subtitle, { color: colors.subText }]}>{item.email}</Text>
          </View>
          
          {isFaculty ? (
            isCoordinator ? (
              <View style={[styles.pill, { backgroundColor: '#16A34A15' }]}>
                <Text style={[styles.pillText, { color: '#16A34A' }]}>COORDINATOR</Text>
              </View>
            ) : (
              <View style={[styles.pill, { backgroundColor: colors.primary + '15' }]}>
                <Text style={[styles.pillText, { color: colors.primary }]}>FACULTY</Text>
              </View>
            )
          ) : (
            <View style={[styles.pill, { backgroundColor: '#8B5CF615' }]}>
              <Text style={[styles.pillText, { color: '#8B5CF6' }]}>
                {item.rollNumber || 'STUDENT'}
              </Text>
            </View>
          )}
        </View>
        
        <View style={[styles.cardFooter, { borderTopColor: divider }]}>
          <View style={styles.footerButtons}>
            {isFaculty && (
              <TouchableOpacity 
                onPress={() => isCoordinator ? handleRemoveCoordinator() : handleAssignCoordinator(item)}
                style={[
                  styles.solidButton, 
                  { backgroundColor: isCoordinator ? '#DC2626' : colors.primary }
                ]}
              >
                <Text style={styles.solidButtonText}>
                  {isCoordinator ? 'Remove Coordinator' : 'Set as Coordinator'}
                </Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              onPress={() => handleRemoveUser(item.userId, item.name, isFaculty ? 'Faculty' : 'Student')}
              style={[
                styles.outlineButton, 
                { borderColor: '#DC2626' }
              ]}
            >
              <Text style={[styles.outlineButtonText, { color: '#DC2626' }]}>Remove User</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
      
      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>{departmentName}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.subText }]} numberOfLines={1}>{instituteName}</Text>
        </View>
        <TouchableOpacity 
          style={[styles.addUserBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('AddUser', { departmentId: String(departmentId), departmentName: String(departmentName), instituteId: String(instituteId), instituteName: String(instituteName) })}
        >
          <Text style={styles.addUserBtnText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* STATS */}
        <View style={styles.statsContainer}>
          <View style={[styles.statBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNum, { color: '#6366F1' }]}>{stats.totalStudents}</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNum, { color: '#10B981' }]}>{stats.totalFaculty}</Text>
            <Text style={styles.statLabel}>Faculty</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNum, { color: '#F59E0B' }]}>{stats.totalProjects}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
        </View>

        {/* SEARCH */}
        <View style={styles.searchWrap}>
          <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              placeholder={`Search ${activeTab.toLowerCase()}...`}
              placeholderTextColor={colors.subText}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[styles.searchInput, { color: colors.text }]}
            />
          </View>
        </View>

        {/* TABS */}
        <View style={styles.tabRow}>
          {(['FACULTY', 'STUDENTS'] as TabType[]).map(tab => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabItem, 
                  isActive && { backgroundColor: colors.primary, borderColor: colors.primary }
                ]}
                onPress={() => { setActiveTab(tab); setSearchQuery(''); }}
              >
                <Text style={[
                  styles.tabText, 
                  { color: isActive ? '#fff' : colors.subText }, 
                  isActive && { fontWeight: '700' }
                ]}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* LIST */}
        <View style={{ paddingHorizontal: 16 }}>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
          ) : filteredList.length === 0 ? (
            <Text style={styles.emptyText}>No results found.</Text>
          ) : (
            filteredList.map(renderMemberCard)
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: { height: 72, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: StyleSheet.hairlineWidth, elevation: 2 },
  backBtn: { padding: 8, marginRight: 4 },
  backIcon: { width: 22, height: 22, resizeMode: 'contain' },
  headerTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.5 },
  headerSubtitle: { fontSize: 12, marginTop: 1 },
  addUserBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginLeft: 8 },
  addUserBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  statsContainer: { flexDirection: 'row', gap: 12, padding: 16 },
  statBox: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', elevation: 2 },
  statNum: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 10, fontWeight: '600', color: '#94a3b8', marginTop: 4, textTransform: 'uppercase' },

  searchWrap: { paddingHorizontal: 16, marginBottom: 16 },
  searchBox: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, height: 48, justifyContent: 'center' },
  searchInput: { fontSize: 14, padding: 0 },

  tabRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 10, marginBottom: 16 },
  tabItem: { flex: 1, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'transparent' },
  tabText: { fontSize: 12, letterSpacing: 0.5 },

  card: { borderRadius: 16, padding: 18, marginBottom: 14, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  cardContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  title: { fontSize: 15, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 2 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99 },
  pillText: { fontSize: 10, fontWeight: '800' },
  cardFooter: { marginTop: 14, paddingTop: 12, borderTopWidth: StyleSheet.hairlineWidth },
  footerButtons: { flexDirection: 'row', gap: 8, alignItems: 'center', flexWrap: 'wrap' },
  solidButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, alignSelf: 'flex-start' },
  solidButtonText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  outlineButton: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, borderWidth: 1, alignSelf: 'flex-start' },
  outlineButtonText: { fontSize: 12, fontWeight: '700' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#94a3b8', fontStyle: 'italic' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalItem: { paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth },
});

export default DepartmentDetailsScreen;