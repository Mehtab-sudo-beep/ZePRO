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
} from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../theme/ThemeContext';

// API
import { getInstitutes, deleteInstitute } from '../api/instituteApi';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'InstituteList'>;

interface Props {
  navigation: NavProp;
}

interface Institute {
  id: string;
  name: string;
  location: string;
  code: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  website: string;
  totalDepartments?: number;
  totalStudents?: number;
  totalFaculty?: number;
}

const InstituteListScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useContext(ThemeContext);

  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchInstitutes = async () => {
    try {
      console.log("🚀 Fetching institutes...");

      const res = await getInstitutes();

      const data = res.data?.data || res.data || [];

      if (!Array.isArray(data)) {
        setInstitutes([]);
        return;
      }

      const formatted = data.map((item: any, index: number) => ({
        id: item.instituteId?.toString() || index.toString(),
        name: item.instituteName || "Unnamed Institute",
        location: item.city || item.address || "N/A",
        code: item.instituteCode || "N/A",
        email: item.email || "N/A",
        phone: item.phoneNumber || "N/A",
        address: item.address || "N/A",
        city: item.city || "N/A",
        state: item.state || "N/A",
        website: item.website || "N/A",
        totalDepartments: item.totalDepartments || 0,
        totalStudents: item.totalStudents || 0,
        totalFaculty: item.totalFaculty || 0,
      }));

      setInstitutes(formatted);

    } catch (err: any) {
      console.log("❌ FETCH ERROR:", err?.response || err);
      Alert.alert("Error", "Failed to load institutes");
    }
  };

  // AUTO REFRESH
  useFocusEffect(
    useCallback(() => {
      fetchInstitutes();
    }, [])
  );

  // FILTER
  const filtered = institutes.filter(i =>
    (i.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (i.location || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // DELETE
  const handleDelete = (id: string, name: string) => {
    Alert.alert('Confirm Delete', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteInstitute(id);
            fetchInstitutes();
          } catch (err) {
            console.log("❌ DELETE ERROR:", err);
            Alert.alert("Error", "Delete failed");
          }
        },
      },
    ]);
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
            <Text style={styles.headerTitle}>Institute List</Text>
            <Text style={styles.headerSubtitle}>Select an Institute</Text>
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: '#4F46E5' }]}>
              {institutes.length}
            </Text>
            <Text style={styles.statLabel}>Total Institutes</Text>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search institutes..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Add Institute */}
        <View style={styles.addWrapper}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddInstitute')}
          >
            <Text style={styles.addButtonText}>+ Add Institute</Text>
          </TouchableOpacity>
        </View>

        {/* List */}
        <ScrollView style={styles.content}>

          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No institutes found</Text>
            </View>
          ) : (
            filtered.map(inst => (
              <View key={inst.id} style={styles.card}>
                <Text style={styles.cardTitle}>{inst.name}</Text>
                
                <View style={styles.detailsContainer}>
                  <View style={styles.tableRow}>
                    <Text style={styles.tableLabel}>Location</Text>
                    <Text style={styles.tableValue}>{inst.location}</Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={styles.detailsButton}
                    onPress={() => setExpandedId(expandedId === inst.id ? null : inst.id)}
                  >
                    <Text style={styles.detailsButtonText}>
                      Institute Details
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.departmentListButton}
                    onPress={() =>
                      navigation.navigate('DepartmentList', {
                        instituteId: inst.id,
                        instituteName: inst.name,
                      })
                    }
                  >
                    <Text style={styles.departmentListButtonText}>Department List</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(inst.id, inst.name)}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>

                {expandedId === inst.id && (
                  <View style={{ marginTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 }}>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableLabel}>Code</Text>
                      <Text style={styles.tableValue}>{inst.code}</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableLabel}>Email</Text>
                      <Text style={styles.tableValue}>{inst.email}</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableLabel}>Phone</Text>
                      <Text style={styles.tableValue}>{inst.phone}</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableLabel}>Address</Text>
                      <Text style={styles.tableValue}>{inst.address}, {inst.city}, {inst.state}</Text>
                    </View>
                    <View style={styles.tableRow}>
                      <Text style={styles.tableLabel}>Website</Text>
                      <Text style={styles.tableValue}>{inst.website}</Text>
                    </View>
                  </View>
                )}
              </View>
            ))
          )}

        </ScrollView>

      </View>
    </SafeAreaView>
  );
};

export default InstituteListScreen;

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

  addWrapper: { padding: 16 },
  addButton: {
    backgroundColor: '#4F46E5',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center'
  },
  addButtonText: { color: '#fff' },

  content: { padding: 16 },

  emptyState: { alignItems: 'center' },
  emptyText: { color: '#6B7280' },

  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10
  },

  cardTitle: { fontWeight: 'bold', fontSize: 18, marginBottom: 8 },
  cardText: { color: '#6B7280', fontSize: 14, marginTop: 4 },
  detailsContainer: { marginTop: 4, backgroundColor: '#F9FAFB', padding: 12, borderRadius: 8 },
  tableRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tableLabel: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  tableValue: { fontSize: 13, color: '#1F2937', fontWeight: '600', flex: 1, textAlign: 'right' },

  actionRow: { flexDirection: 'row', gap: 6, marginTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12 },
  detailsButton: { flex: 1, backgroundColor: '#E5E7EB', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  detailsButtonText: { color: '#1F2937', fontWeight: '600', fontSize: 12 },
  departmentListButton: { flex: 1, backgroundColor: '#4F46E5', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  departmentListButtonText: { color: '#ffffff', fontWeight: '600', fontSize: 12 },
  deleteButton: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#DC2626' },
  deleteButtonText: { color: '#DC2626', fontWeight: '600', fontSize: 12 },
});