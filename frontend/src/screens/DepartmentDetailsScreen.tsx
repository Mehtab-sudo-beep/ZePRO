import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertContext } from '../context/AlertContext';

// ✅ USE HOOKS INSTEAD OF PROPS
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'DepartmentDetails'>;
type RoutePropType = RouteProp<RootStackParamList, 'DepartmentDetails'>;

const DepartmentDetailsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RoutePropType>();
  const { showAlert } = useContext(AlertContext);

  const { departmentId, departmentName, instituteId, instituteName } = route.params || {};

  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    totalProjects: 0,
  });

  useEffect(() => {
    console.log('[DepartmentDetails] 📋 Loaded');
    console.log('Department ID:', departmentId);
    console.log('Department Name:', departmentName);
    console.log('Institute ID:', instituteId);
    console.log('Institute Name:', instituteName);

    // ✅ LOAD DEPARTMENT STATS HERE
    loadDepartmentStats();
  }, [departmentId]);

  const loadDepartmentStats = async () => {
    try {
      setLoading(true);
      // TODO: Fetch statistics from backend
      setStats({
        totalStudents: 0,
        totalFaculty: 0,
        totalProjects: 0,
      });
    } catch (error: any) {
      console.log('[DepartmentDetails] ❌ Error:', error.message);
      showAlert('Error', 'Failed to load department details');
    } finally {
      setLoading(false);
    }
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
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{departmentName}</Text>
            <Text style={styles.headerSubtitle}>{instituteName}</Text>
          </View>
        </View>

        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color="#4F46E5" />
          </View>
        ) : (
          <ScrollView style={styles.content}>
            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: '#4F46E5' }]}>
                  {stats.totalStudents}
                </Text>
                <Text style={styles.statLabel}>Students</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: '#059669' }]}>
                  {stats.totalFaculty}
                </Text>
                <Text style={styles.statLabel}>Faculty</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statValue, { color: '#D97706' }]}>
                  {stats.totalProjects}
                </Text>
                <Text style={styles.statLabel}>Projects</Text>
              </View>
            </View>

            {/* Actions */}
            <View style={styles.actionsWrapper}>
              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionIcon}>👥</Text>
                <Text style={styles.actionTitle}>Manage Students</Text>
                <Text style={styles.actionSubtitle}>Add/Remove students</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionIcon}>🏫</Text>
                <Text style={styles.actionTitle}>Manage Faculty</Text>
                <Text style={styles.actionSubtitle}>Assign faculty members</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionIcon}>📚</Text>
                <Text style={styles.actionTitle}>View Projects</Text>
                <Text style={styles.actionSubtitle}>See all projects</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionCard}>
                <Text style={styles.actionIcon}>⚙️</Text>
                <Text style={styles.actionTitle}>Settings</Text>
                <Text style={styles.actionSubtitle}>Configure department</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  header: {
    backgroundColor: '#ffffff',
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: { marginRight: 12, width: 40 },
  backArrow: { fontSize: 36, color: '#1F2937', lineHeight: 40 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#000000' },
  headerSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  content: { flex: 1, padding: 16 },

  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flex: 1,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 4 },

  actionsWrapper: { gap: 12, marginBottom: 30 },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionIcon: { fontSize: 32, marginBottom: 8 },
  actionTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937' },
  actionSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 4 },
});

export default DepartmentDetailsScreen;