import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';

import { ThemeContext } from '../theme/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getAllProjects,
  getRequestedProjects,
} from "../api/studentApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StudentAuthContext } from '../context/StudentAuthContext';
import { AlertContext } from '../context/AlertContext';
import { Picker } from '@react-native-picker/picker';
import { Modal } from 'react-native';


const Icon = ({ name, size = 16, colors }: any) => {
  const isDark = colors.background === '#111827';

  const icons: any = {
    search: isDark
      ? require('../assets/search-white.png')
      : require('../assets/search.png'),
    filter: isDark
      ? require('../assets/filter-white.png')
      : require('../assets/filter.png'),
    user: isDark
      ? require('../assets/user-white.png')
      : require('../assets/user.png'),
    tag: isDark
      ? require('../assets/tag-white.png')
      : require('../assets/tag.png'),
    slot: isDark
      ? require('../assets/slot-white.png')
      : require('../assets/slot.png'),
  };

  return (
    <Image source={icons[name]} style={{ width: size, height: size }} />
  );
};

const ProjectListScreen: React.FC = () => {

  const navigation = useNavigation<any>();
  const { colors } = useContext(ThemeContext);
  const { studentUser } = useContext(StudentAuthContext);
  const { showAlert } = useContext(AlertContext);

  const isDark = colors.background === '#111827';
  const divider = isDark ? '#374151' : '#E5E7EB';

  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [requestedProjects, setRequestedProjects] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  const [filterModal, setFilterModal] = useState(false);
  const [searchCategory, setSearchCategory] = useState<'ALL' | 'FACULTY' | 'DOMAIN' | 'SUBDOMAIN'>('ALL');



  // ✅ LOAD PROJECTS WITH ERROR HANDLING
  const loadProjects = async () => {
    try {
      setLoading(true);
      const studentId = await AsyncStorage.getItem("studentId");

      console.log('[ViewProjects] 📥 Fetching projects...');
      const res = await getAllProjects();
      console.log('[ViewProjects] ✅ Projects loaded:', res.data);
      setProjects(Array.isArray(res.data) ? res.data : []);

      if (studentId) {
        const req = await getRequestedProjects(Number(studentId));
        console.log('[ViewProjects] 📋 Requested projects:', req.data);
        setRequestedProjects(req.data || []);
      }

    } catch (err: any) {
      console.log('[ViewProjects] ❌ Error:', err.response?.data?.error || err.message);

      // ✅ HANDLE PROFILE INCOMPLETE ERROR
      if (err.response?.data?.error?.includes('profile')) {
        showAlert(
          'Complete Profile',
          'Please complete your profile first to view projects.',
          [
            {
              text: 'Complete Profile',
              onPress: () => navigation.navigate('CompleteProfile' as any),
            },
            { text: 'Cancel', style: 'cancel' },
          ]
        );
        return;
      }

      showAlert('Error', err.response?.data?.error || 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  // ✅ USE FOCUS EFFECT TO RELOAD
  useFocusEffect(
    React.useCallback(() => {
      loadProjects();
    }, [])
  );

  const filteredProjects = projects.filter(project => {
    const query = search.toLowerCase();

    if (!query) return true;

    if (searchCategory === 'FACULTY') {
      return project.facultyName?.toLowerCase().includes(query);
    } else if (searchCategory === 'DOMAIN') {
      return project.domain?.toLowerCase().includes(query);
    } else if (searchCategory === 'SUBDOMAIN') {
      return project.subdomain?.toLowerCase().includes(query);
    } else {
      // ALL
      return project.title?.toLowerCase().includes(query) ||
        project.domain?.toLowerCase().includes(query) ||
        project.subdomain?.toLowerCase().includes(query) ||
        project.facultyName?.toLowerCase().includes(query);
    }
  });

  /* ================= CARD ================= */
  const renderItem = ({ item }: any) => {

    const isRequested = requestedProjects.includes(item.projectId);

    return (
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.card, opacity: isRequested ? 0.7 : 1 }]}
        onPress={() => navigation.navigate('ProjectDetails', { project: item, isRequested })}
        activeOpacity={0.8}
      >

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text style={[styles.title, { color: colors.text, flex: 1 }]}>
            {item.title}
          </Text>
          {isRequested && (
            <View style={{ backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
              <Text style={{ fontSize: 10, color: '#1E40AF', fontWeight: '700' }}>REQUESTED</Text>
            </View>
          )}
        </View>

        <View style={styles.row}>
          <Icon name="user" colors={colors} />
          <Text style={[styles.meta, { color: colors.subText }]}>
            {item.facultyName}
          </Text>
        </View>

        <View style={styles.row}>
          <Icon name="tag" colors={colors} />
          <Text style={[styles.meta, { color: colors.subText }]}>
            Domain: {item.domain || 'N/A'}
          </Text>
        </View>

        <View style={styles.row}>
          <Icon name="tag" colors={colors} />
          <Text style={[styles.meta, { color: colors.subText }]}>
            Subdomain: {item.subdomain || 'N/A'}
          </Text>
        </View>

        {/* ✅ SHOW REMAINING SLOTS */}
        <View style={styles.row}>
          <Icon name="slot" colors={colors} />
          <Text
            style={[
              styles.slots,
              { color: item.remainingSlots > 0 ? colors.primary : '#EF4444', marginTop: 0 },
            ]}
          >
            {item.remainingSlots > 0
              ? `${item.remainingSlots} slots available`
              : "No slots available"}
          </Text>
        </View>

      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Image
            source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Projects</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.container}>

        {/* SEARCH */}
        {/* SEARCH AND FILTER */}
        <View style={styles.searchRow}>
          <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Icon name="search" colors={colors} />
            <TextInput
              placeholder={searchCategory === 'ALL' ? "Search projects..." : `Search by ${searchCategory.toLowerCase()}...`}
              placeholderTextColor={colors.subText}
              value={search}
              onChangeText={setSearch}
              style={[styles.searchInput, { color: colors.text }]}
            />
            {searchCategory !== 'ALL' && (
              <TouchableOpacity onPress={() => setSearchCategory('ALL')} style={styles.clearBadge}>
                <Text style={styles.clearBadgeText}>✕ {searchCategory}</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.filterBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => setFilterModal(true)}
          >
            <Image
              source={isDark ? require('../assets/sort-white.png') : require('../assets/sort.png')}
              style={{ width: 18, height: 18, resizeMode: 'contain' }}
            />
          </TouchableOpacity>
        </View>

        {/* LIST */}
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : filteredProjects.length === 0 ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: colors.subText, fontSize: 16 }}>
              No projects available in your department
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredProjects}
            keyExtractor={item => item.projectId.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        )}

        {/* FILTER MODAL */}
        <Modal visible={filterModal} transparent animationType="fade">
          <TouchableOpacity activeOpacity={1} style={styles.modalOverlay} onPress={() => setFilterModal(false)}>
            <View style={[styles.modalSheet, { backgroundColor: colors.card }]} onStartShouldSetResponder={() => true}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Search By</Text>
                <TouchableOpacity onPress={() => setFilterModal(false)} style={styles.modalCloseBtn}>
                  <Text style={[styles.modalCloseText, { color: colors.text }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.categoryList}>
                {(['ALL', 'FACULTY', 'DOMAIN', 'SUBDOMAIN'] as const).map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryOption,
                      { borderBottomColor: divider },
                      searchCategory === cat && { backgroundColor: colors.primary + '15' }
                    ]}
                    onPress={() => {
                      setSearchCategory(cat);
                      setFilterModal(false);
                    }}
                  >
                    <Text style={[
                      styles.categoryOptionText,
                      { color: colors.text },
                      searchCategory === cat && { color: colors.primary, fontWeight: '700' }
                    ]}>
                      {cat === 'ALL' ? 'All Fields' : cat.charAt(0) + cat.slice(1).toLowerCase()}
                    </Text>
                    {searchCategory === cat && (
                      <View style={[styles.checkCircle, { backgroundColor: colors.primary }]} />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        </Modal>

      </View>
    </SafeAreaView>
  );
};

export default ProjectListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  backIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  clearBadge: {
    backgroundColor: '#EF444420',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  clearBadgeText: {
    fontSize: 10,
    color: '#EF4444',
    fontWeight: '700',
  },

  card: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },

  meta: {
    fontSize: 13,
  },

  slots: {
    marginTop: 8,
    fontWeight: '600',
  },

  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalCloseText: {
    fontSize: 18,
    fontWeight: '700',
  },
  categoryList: {
    marginTop: 4,
  },
  categoryOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  categoryOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  checkCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});