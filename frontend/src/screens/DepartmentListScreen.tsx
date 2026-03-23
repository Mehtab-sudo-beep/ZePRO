import React, { useState, useContext, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../theme/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';

import { getDepartments, deleteDepartment } from '../api/departmentApi';

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
  description: string;
  coordinatorName: string;
  coordinatorEmail: string;
  coordinatorPhone: string;
}

const DepartmentListScreen: React.FC<Props> = ({ navigation, route }) => {
  const { instituteId, instituteName } = route.params;
  const { colors } = useContext(ThemeContext);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      console.log('🚀 Fetching departments for institute:', instituteId);
      const res = await getDepartments(instituteId);
      console.log('✅ Departments response:', res.data);

      const data: Department[] = (res.data || []).map((item: any) => ({
        id: item.departmentId?.toString() || '',
        name: item.departmentName || 'Unnamed',
        code: item.departmentCode || 'N/A',
        description: item.description || 'No description',
        coordinatorName: item.coordinatorName || 'Not Assigned',
        coordinatorEmail: item.coordinatorEmail || 'N/A',
        coordinatorPhone: item.coordinatorPhone || 'N/A',
      }));

      setDepartments(data);
    } catch (err: any) {
      console.log('❌ FETCH DEPARTMENTS ERROR:', err?.response || err);
      Alert.alert('Error', 'Failed to load departments');
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDepartments();
    }, [])
  );

  /* FILTER */
  const filtered = departments.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* DELETE */
  const handleDelete = (id: string, name: string) => {
    Alert.alert('Confirm Delete', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDepartment(id);
            fetchDepartments();
          } catch (err) {
            console.log('❌ DELETE ERROR:', err);
            Alert.alert('Error', 'Failed to delete department');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

        {/* HEADER */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>{instituteName}</Text>
            <Text style={styles.headerSubtitle}>Select a Department</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#4F46E5' }]}>
              {departments.length}
            </Text>
            <Text style={styles.statLabel}>Total Departments</Text>
          </View>
        </View>

        {/* SEARCH */}
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search departments..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* ADD BUTTON → NAVIGATION */}
        <View style={styles.addWrapper}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() =>
              navigation.navigate('AddDepartment', {
                instituteId,
                instituteName,
              })
            }
          >
            <Text style={styles.addButtonText}>+ Add Department</Text>
          </TouchableOpacity>
        </View>

        {/* LIST */}
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
                activeOpacity={0.85}
                onPress={() => setExpandedId(expandedId === dept.id ? null : dept.id)}
              >
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{dept.name}</Text>
                  <Text style={styles.dropdownIcon}>{expandedId === dept.id ? '▲' : '▼'}</Text>
                </View>

                {expandedId === dept.id && (
                  <View style={styles.detailsContainer}>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableLabel}>Code</Text>
                      <Text style={styles.tableValue}>{dept.code}</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableLabel}>Coordinator</Text>
                      <Text style={styles.tableValue}>{dept.coordinatorName}</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableLabel}>Email</Text>
                      <Text style={styles.tableValue}>{dept.coordinatorEmail}</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableLabel}>Phone</Text>
                      <Text style={styles.tableValue}>{dept.coordinatorPhone}</Text>
                    </View>
                    <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' }}>
                      <Text style={styles.tableLabel}>Description</Text>
                      <Text style={{ color: '#1F2937', fontSize: 13, marginTop: 4, lineHeight: 20 }}>
                        {dept.description}
                      </Text>
                    </View>

                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={(e) => {
                          e.stopPropagation();
                          handleDelete(dept.id, dept.name);
                        }}
                      >
                        <Text style={styles.deleteButtonText}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

      </View>
    </SafeAreaView>
  );
};

export default DepartmentListScreen;

/* STYLES */
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
  },
  backBtn: { marginRight: 12 },
  backArrow: { fontSize: 36, color: '#1F2937', lineHeight: 40 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', color: '#000000' },
  headerSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  statsGrid: { paddingHorizontal: 16, marginTop: 16 },
  statCard: { backgroundColor: '#fff', padding: 20, borderRadius: 10, alignItems: 'center', width: '100%', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 },

  statValue: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 14, color: '#6B7280', marginTop: 4 },

  searchWrapper: { 
    paddingHorizontal: 16, 
    marginTop: 16, 
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginHorizontal: 16,
    paddingVertical: 4,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#6B7280',
    marginLeft: 10,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: '#1F2937',
  },

  addWrapper: { paddingHorizontal: 16 },
  addButton: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff' },

  content: { padding: 16 },

  emptyState: { alignItems: 'center', marginTop: 20 },
  emptyText: { color: '#6B7280' },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { fontWeight: 'bold', fontSize: 16, flex: 1 },
  dropdownIcon: { color: '#6B7280', fontSize: 12 },
  
  detailsContainer: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 12,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  tableLabel: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  tableValue: {
    color: '#1F2937',
    fontSize: 13,
    flex: 2,
    textAlign: 'right',
  },

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  manageButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  manageButtonText: { color: '#fff', fontWeight: 'bold' },
  
  deleteButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'red',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  deleteButtonText: { color: 'red', fontWeight: 'bold' },
});