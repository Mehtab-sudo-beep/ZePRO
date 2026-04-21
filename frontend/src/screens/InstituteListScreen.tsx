import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  StatusBar,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../theme/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { AlertContext } from '../context/AlertContext';
import { getInstitutes, deleteInstitute, getAdminDashboardStats } from '../api/instituteApi';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'InstituteList'>;

interface Props {
  navigation: NavProp;
}

interface Institute {
  instituteId: string;
  instituteName: string;
  instituteCode: string;
  phoneNumber: string;
  address: string;
  city: string;
  state: string;
  email: string;
  website: string;
  tail: string;
}

const InstituteListScreen: React.FC<Props> = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const { colors, theme } = useContext(ThemeContext);

  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // ✅ ADD STATS STATE
  const [stats, setStats] = useState({
    institutes: 0,
    departments: 0,
    users: 0,
    students: 0,
    faculty: 0,
  });

  // ✅ FETCH STATS
  const loadStats = async () => {
    try {
      const statsRes = await getAdminDashboardStats();
      console.log('[InstituteList] ✅ Stats loaded:', statsRes.data);
      setStats({
        institutes: statsRes.data.totalInstitutes || 0,
        departments: statsRes.data.totalDepartments || 0,
        users: statsRes.data.totalUsers || 0,
        students: statsRes.data.totalStudents || 0,
        faculty: statsRes.data.totalFaculty || 0,
      });
    } catch (e) {
      console.log('[InstituteList] ❌ Error loading stats:', e);
    }
  };

  // ✅ UPDATED LOAD INSTITUTES
  const loadInstitutes = async () => {
    if (!user?.token) {
      showAlert('Error', 'Authentication token not found');
      return;
    }

    try {
      setLoading(true);
      console.log('[InstituteList] 📡 Fetching institutes...');
      
      const response = await getInstitutes();
      console.log('[InstituteList] ✅ Institutes loaded:', response.data);
      
      setInstitutes(response.data || []);
      
      // ✅ LOAD STATS TOO
      await loadStats();
    } catch (error: any) {
      console.log('[InstituteList] ❌ Error:', error.message);
      showAlert('Error', error.response?.data?.error || 'Failed to fetch institutes');
    } finally {
      setLoading(false);
    }
  };

  // ✅ LOAD ON SCREEN FOCUS
  useFocusEffect(
    React.useCallback(() => {
      loadInstitutes();
    }, [user?.token])
  );

  // ✅ FILTER INSTITUTES
  const filtered = institutes.filter(i =>
    i.instituteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ✅ HANDLE DELETE INSTITUTE
  const handleDelete = (id: string, name: string) => {
    showAlert('Confirm Delete', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            setLoading(true);
            console.log('[InstituteList] 🗑 Deleting:', id);

            await deleteInstitute(id);

            console.log('[InstituteList] ✅ Deleted successfully');

            setInstitutes(institutes.filter(i => i.instituteId !== id));
            showAlert('Success', 'Institute deleted successfully');
          } catch (error: any) {
            console.log('[InstituteList] ❌ Error:', error.message);
            showAlert('Error', error.response?.data?.error || 'Failed to delete institute');
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Admin Dashboard</Text>
          <Text style={[styles.headerSubtitle, { color: colors.subText }]}>Manage Institutes</Text>
        </View>

        {/* ✅ UPDATED Stats with dynamic data */}
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: colors.primary }]}>{stats.institutes}</Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>Institutes</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: '#059669' }]}>{stats.departments}</Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>Departments</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.statValue, { color: '#D97706' }]}>{stats.users}</Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>Users</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <TextInput
            style={[styles.searchInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }]}
            placeholder="Search institutes..."
            placeholderTextColor={colors.subText}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* ✅ ADD Button - Navigate to AddInstituteScreen */}
        <View style={styles.addWrapper}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('AddInstitute')}
          >
            <Text style={styles.addButtonText}>+ Add Institute</Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        {loading && institutes.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : (
          <ScrollView style={styles.content}>
            {filtered.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.emptyText, { color: colors.subText }]}>
                  {institutes.length === 0 ? 'No institutes found' : 'No results matching your search'}
                </Text>
              </View>
            ) : (
              filtered.map(inst => (
                <TouchableOpacity
                  key={inst.instituteId}
                  style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() =>
                    navigation.navigate('DepartmentList', {
                      instituteId: inst.instituteId,
                      instituteName: inst.instituteName,
                    })
                  }
                  activeOpacity={0.85}
                >
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={[styles.instituteIcon, { backgroundColor: colors.primary + '15' }]}>
                      <Text style={[styles.instituteIconText, { color: colors.primary }]}>
                        {inst.instituteName.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>{inst.instituteName}</Text>
                      <Text style={[styles.cardText, { color: colors.subText }]}>{inst.address}</Text>
                    </View>
                    <Text style={[styles.chevron, { color: colors.subText }]}>›</Text>
                  </View>

                  {/* Info Row */}
                  <View style={styles.infoRow}>
                    <Text style={[styles.infoText, { color: colors.subText }]}>
                      Code: <Text style={{ fontWeight: '600', color: colors.text }}>{inst.instituteCode}</Text>
                    </Text>
                    <Text style={[styles.infoText, { color: colors.subText }]}>
                      Phone: <Text style={{ fontWeight: '600', color: colors.text }}>{inst.phoneNumber}</Text>
                    </Text>
                  </View>

                  {/* Delete */}
                  <TouchableOpacity
                    style={[styles.deleteButton, { borderColor: '#DC2626' }]}
                    onPress={() => handleDelete(inst.instituteId, inst.instituteName)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}

        {/* Bottom Tab */}
        <BottomTab navigation={navigation} active="home" />
      </View>
    </SafeAreaView>
  );
};

/* ── Shared Bottom Tab ─────────────────────────────────── */
export const BottomTab = ({ navigation, active }: { navigation: any; active: string }) => {
  const { colors } = useContext(ThemeContext);
  const isDark = colors.background === '#111827';

  return (
    <View style={[styles.bottomTab, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate('InstituteList')}
      >
        <Image
          source={
            active === 'home'
              ? require('../assets/home-color.png')
              : isDark
              ? require('../assets/home-white.png')
              : require('../assets/home.png')
          }
          style={styles.tabIcon}
        />
        <Text style={[styles.tabText, active === 'home' && { color: colors.primary, fontWeight: '700' }]}>
          Home
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminMore')}>
        <Image
          source={
            active === 'more'
              ? require('../assets/more-color.png')
              : isDark
              ? require('../assets/more-white.png')
              : require('../assets/more.png')
          }
          style={styles.tabIcon}
        />
        <Text
          style={[
            styles.tabText,
            active === 'more' ? { color: colors.primary, fontWeight: '700' } : { color: colors.subText },
          ]}
        >
          More
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default InstituteListScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },

  header: {
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 24, fontWeight: 'bold' },
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
  searchInput: {
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
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

  instituteIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  instituteIconText: { fontSize: 22, fontWeight: 'bold' },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12, paddingVertical: 8 },
  infoText: { fontSize: 12 },

  deleteButton: {
    borderWidth: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: { color: '#DC2626', fontWeight: '600', fontSize: 13 },

  bottomTab: { height: 60, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabIcon: { width: 22, height: 22, marginBottom: 4, resizeMode: 'contain' },
  tabText: { fontSize: 12, color: '#6B7280' },
});