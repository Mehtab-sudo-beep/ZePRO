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
  sendProjectRequest,
  getRequestedProjects,
} from "../api/studentApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StudentAuthContext } from '../context/StudentAuthContext';
import { AlertContext } from '../context/AlertContext';

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
  const [sendingRequestId, setSendingRequestId] = useState<number | null>(null);

  const isTeamLead = studentUser?.isTeamLead === true;

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
    
    return (
      project.title?.toLowerCase().includes(query) ||
      project.domain?.toLowerCase().includes(query) ||
      project.facultyName?.toLowerCase().includes(query)
    );
  });

  // ✅ SEND PROJECT REQUEST WITH ERROR HANDLING
  const sendRequest = async (projectId: number, projectTitle: string) => {
    try {
      setSendingRequestId(projectId);
      const studentId = await AsyncStorage.getItem("studentId");

      console.log('[ViewProjects] 📨 Requesting project:', projectId);

      await sendProjectRequest({
        studentId: Number(studentId),
        projectId,
      });

      console.log('[ViewProjects] ✅ Request sent successfully');
      setRequestedProjects(prev => [...prev, projectId]);

      showAlert("Request Sent", `Request sent for "${projectTitle}"`, [
        {
          text: 'OK',
          onPress: () => {
            // Reload to update UI
            loadProjects();
          },
        },
      ]);

    } catch (err: any) {
      console.log('[ViewProjects] ❌ Error:', err.response?.data?.error || err.message);

      const errorMsg = err.response?.data?.error || 'Failed to send request';

      // ✅ SPECIFIC ERROR MESSAGES
      if (errorMsg.includes('different department')) {
        showAlert(
          '❌ Department Mismatch',
          'Faculty is from a different department. Cannot request this project.',
          [{ text: 'OK' }]
        );
      } else if (errorMsg.includes('different institute')) {
        showAlert(
          '❌ Institute Mismatch',
          'Faculty is from a different institute. Cannot request this project.',
          [{ text: 'OK' }]
        );
      } else if (errorMsg.includes('team lead')) {
        showAlert(
          '👥 Team Lead Only',
          'Only the team lead can send project requests.',
          [{ text: 'OK' }]
        );
      } else if (errorMsg.includes('already')) {
        showAlert('⚠️ Already Requested', errorMsg, [{ text: 'OK' }]);
      } else if (errorMsg.includes('No slots available')) {
        showAlert('👥 No Slots', 'This project is full. No more slots available.', [{ text: 'OK' }]);
      } else {
        showAlert('Error', errorMsg, [{ text: 'OK' }]);
      }
    } finally {
      setSendingRequestId(null);
    }
  };

  /* ================= CARD ================= */
  const renderItem = ({ item }: any) => {

    const isRequested = requestedProjects.includes(item.projectId);
    const isSending = sendingRequestId === item.projectId;

    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>

        <Text style={[styles.title, { color: colors.text }]}>
          {item.title}
        </Text>

        <View style={styles.row}>
          <Icon name="user" colors={colors} />
          <Text style={[styles.meta, { color: colors.subText }]}>
            {item.facultyName}
          </Text>
        </View>

        <View style={styles.row}>
          <Icon name="tag" colors={colors} />
          <Text style={[styles.meta, { color: colors.subText }]}>
            {item.domain || 'N/A'}
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

        {/* 🔥 IMPROVED BUTTON */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.primaryBtn,
            {
              backgroundColor: isRequested
                ? '#6B7280'
                : !isTeamLead
                  ? '#9CA3AF'
                  : colors.primary,
            },
          ]}
          onPress={() => {
            if (!isTeamLead) {
              showAlert('⚠️ Not Team Lead', 'Only the team lead can send requests');
              return;
            }

            if (isRequested) {
              showAlert("⚠️ Already Requested", "You already requested this project");
              return;
            }

            sendRequest(item.projectId, item.title);
          }}
          disabled={!isTeamLead || isRequested || isSending}
        >
          <View style={styles.btnContent}>
            {isSending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                {!isRequested && <Icon name="tag" size={14} colors={colors} />}
                <Text style={styles.btnText}>
                  {isRequested
                    ? "✓ Requested"
                    : !isTeamLead
                      ? "Team Lead Only"
                      : "Send Request"}
                </Text>
              </>
            )}
          </View>
        </TouchableOpacity>

      </View>
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
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Icon name="search" colors={colors} />

          <TextInput
            placeholder="Search projects..."
            placeholderTextColor={colors.subText}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: colors.text }]}
          />
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

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
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

  primaryBtn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  btnText: {
    color: '#fff',
    fontWeight: '700',
  },
});