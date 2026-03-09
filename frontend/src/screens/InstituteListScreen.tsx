import React, { useState, useContext } from 'react';
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
  Image,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../theme/ThemeContext';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'InstituteList'>;

interface Props {
  navigation: NavProp;
}

interface Institute {
  id: string;
  name: string;
  location: string;
  totalDepartments: number;
  totalStudents: number;
  totalFaculty: number;
}

const InstituteListScreen: React.FC<Props> = ({ navigation }) => {
  const [institutes, setInstitutes] = useState<Institute[]>([
    { id: 'I001', name: 'College of Engineering', location: 'Main Campus', totalDepartments: 6, totalStudents: 1200, totalFaculty: 80 },
    { id: 'I002', name: 'College of Science', location: 'North Campus', totalDepartments: 4, totalStudents: 800, totalFaculty: 50 },
    { id: 'I003', name: 'College of Arts & Humanities', location: 'East Campus', totalDepartments: 5, totalStudents: 600, totalFaculty: 40 },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newInstitute, setNewInstitute] = useState({ name: '', location: '' });

  const filtered = institutes.filter(i =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAdd = () => {
    if (!newInstitute.name || !newInstitute.location) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const inst: Institute = {
      id: `I${Date.now()}`,
      name: newInstitute.name,
      location: newInstitute.location,
      totalDepartments: 0,
      totalStudents: 0,
      totalFaculty: 0,
    };
    setInstitutes([...institutes, inst]);
    setNewInstitute({ name: '', location: '' });
    setShowAddModal(false);
    Alert.alert('Success', 'Institute added successfully!');
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Confirm Delete', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => setInstitutes(institutes.filter(i => i.id !== id)),
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSubtitle}>Select an Institute</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Institutes', value: institutes.length, color: '#4F46E5' },
            { label: 'Departments', value: institutes.reduce((s, i) => s + i.totalDepartments, 0), color: '#059669' },
            { label: 'Students', value: institutes.reduce((s, i) => s + i.totalStudents, 0), color: '#D97706' },
          ].map((stat, idx) => (
            <View key={idx} style={styles.statCard}>
              <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search institutes..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        

        {/* List */}
        <ScrollView style={styles.content}>
          {filtered.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No institutes found</Text>
            </View>
          ) : (
            filtered.map(inst => (
              <TouchableOpacity
                key={inst.id}
                style={styles.card}
                onPress={() => navigation.navigate('DepartmentList', {
                  instituteId: inst.id,
                  instituteName: inst.name,
                })}
                activeOpacity={0.85}
              >
                {/* Card Header */}
                <View style={styles.cardHeader}>
                  <View style={styles.instituteIcon}>
                    <Text style={styles.instituteIconText}>{inst.name.charAt(0)}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.cardTitle}>{inst.name}</Text>
                    <Text style={styles.cardText}> {inst.location}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </View>

                {/* Stats Row */}
                <View style={styles.cardStatsRow}>
                  <StatPill label="Dept" value={inst.totalDepartments} color="#4F46E5" />
                  <StatPill label="Students" value={inst.totalStudents} color="#059669" />
                  <StatPill label="Faculty" value={inst.totalFaculty} color="#D97706" />
                </View>

                {/* Delete */}
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(inst.id, inst.name)}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {/* Add Modal */}
        <Modal visible={showAddModal} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Institute</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Text style={styles.closeButton}>✕</Text>
                </TouchableOpacity>
              </View>

              <TextInput
                style={styles.input}
                placeholder="Institute Name"
                placeholderTextColor="#9CA3AF"
                value={newInstitute.name}
                onChangeText={t => setNewInstitute({ ...newInstitute, name: t })}
              />
              <TextInput
                style={styles.input}
                placeholder="Location"
                placeholderTextColor="#9CA3AF"
                value={newInstitute.location}
                onChangeText={t => setNewInstitute({ ...newInstitute, location: t })}
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setShowAddModal(false)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={handleAdd}>
                  <Text style={styles.submitButtonText}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Bottom Tab */}
        <BottomTab navigation={navigation} active="home" />
      </View>
    </SafeAreaView>
  );
};

/* ── Shared Bottom Tab ─────────────────────────────────── */
export const BottomTab = ({ navigation, active }: { navigation: any; active: string }) => {
  const { colors } = useContext(ThemeContext);
  return (
    <View style={[styles.bottomTab, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => navigation.navigate('InstituteList')}
      >
        <Image
          source={active === 'home' ? require('../assets/home-color.png') : require('../assets/home.png')}
          style={styles.tabIcon}
        />
        <Text style={[styles.tabText, active === 'home' && { color: colors.primary, fontWeight: '700' }]}>Home</Text>
      </TouchableOpacity>

      

      <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminMore')}>
        <Image
          source={active === 'more' ? require('../assets/more-color.png') : require('../assets/more.png')}
          style={styles.tabIcon}
        />
        <Text style={[styles.tabText, active === 'more' ? { color: colors.primary, fontWeight: '700' } : { color: colors.subText }]}>More</Text>
      </TouchableOpacity>
    </View>
  );
};

/* ── Stat Pill ─────────────────────────────────────────── */
const StatPill = ({ label, value, color }: { label: string; value: number; color: string }) => (
  <View style={[styles.statPill, { backgroundColor: color + '18' }]}>
    <Text style={[styles.statPillValue, { color }]}>{value}</Text>
    <Text style={[styles.statPillLabel, { color }]}>{label}</Text>
  </View>
);

export default InstituteListScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  container: { flex: 1, backgroundColor: '#F3F4F6' },

  header: { backgroundColor: '#ffffff', paddingTop: 15, paddingBottom: 20, paddingHorizontal: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#000000' },
  headerSubtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },

  statsGrid: { flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 0 },
  statCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, flex: 1, elevation: 2 },
  statValue: { fontSize: 24, fontWeight: 'bold' },
  statLabel: { fontSize: 11, color: '#6B7280', marginTop: 4 },

  searchWrapper: { paddingHorizontal: 16, paddingTop: 16 },
  searchInput: { backgroundColor: '#FFFFFF', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, borderWidth: 1, borderColor: '#E5E7EB' },

  addWrapper: { paddingHorizontal: 16, paddingTop: 12 },
  addButton: { backgroundColor: '#4F46E5', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  addButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },

  content: { flex: 1, padding: 16 },

  emptyState: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 40, alignItems: 'center', marginTop: 8 },
  emptyText: { fontSize: 16, color: '#6B7280' },

  card: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#121416' },
  cardText: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  chevron: { fontSize: 28, color: '#9CA3AF' },

  instituteIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center' },
  instituteIconText: { fontSize: 22, fontWeight: 'bold', color: '#101012' },

  cardStatsRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  statPill: { flex: 1, borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  statPillValue: { fontSize: 16, fontWeight: 'bold' },
  statPillLabel: { fontSize: 11, marginTop: 2 },

  deleteButton: { borderWidth: 1, borderColor: '#DC2626', paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
  deleteButtonText: { color: '#DC2626', fontWeight: '600', fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 24, width: '100%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1F2937' },
  closeButton: { fontSize: 24, color: '#6B7280' },
  input: { backgroundColor: '#F9FAFB', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 14 },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelButton: { flex: 1, paddingVertical: 14, borderRadius: 8, borderWidth: 1, borderColor: '#D1D5DB', alignItems: 'center' },
  cancelButtonText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  submitButton: { flex: 1, backgroundColor: '#4F46E5', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },

  bottomTab: { height: 60, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabIcon: { width: 22, height: 22, marginBottom: 4, resizeMode: 'contain' },
  tabText: { fontSize: 12, color: '#6B7280' },
});