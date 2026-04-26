import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from '../theme/ThemeContext';
import { AlertContext } from '../context/AlertContext';
import { getAllTeams, sendJoinRequest } from "../api/studentApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface Team {
  teamId: number;
  teamName: string;
  description?: string;
  teamLead: string;
  members: string[];
  alreadyRequested: boolean;
}

const Icon = ({ name, size = 16, colors }: any) => {
  const isDark = colors.background === '#111827';

  const icons: any = {
    search: isDark
      ? require('../assets/search-white.png')
      : require('../assets/search.png'),
    sort: isDark
      ? require('../assets/sort-white.png')
      : require('../assets/sort.png'),
    user: isDark
      ? require('../assets/user-white.png')
      : require('../assets/user.png'),
    team: isDark
      ? require('../assets/team-white.png')
      : require('../assets/team.png'),
  };

  return (
    <Image source={icons[name]} style={{ width: size, height: size, resizeMode: 'contain' }} />
  );
};

const JoinTeamScreen: React.FC = () => {
  const { colors } = useContext(ThemeContext);
  const isDark = colors.background === '#111827';
  const divider = isDark ? '#374151' : '#E5E7EB';

  const { showAlert } = useContext(AlertContext);
  const navigation = useNavigation<any>();

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);

  const [search, setSearch] = useState('');
  const [filterModal, setFilterModal] = useState(false);
  const [searchCategory, setSearchCategory] = useState<'ALL' | 'TEAM NAME' | 'LEADER' | 'MEMBERS'>('ALL');

  // ✅ LOAD TEAMS WITH ERROR HANDLING
  const loadTeams = async () => {
    try {
      setLoading(true);
      const studentId = await AsyncStorage.getItem("studentId");
      console.log('[JoinTeam] 📋 Fetching teams for student:', studentId);

      const res = await getAllTeams(Number(studentId));
      console.log('[JoinTeam] ✅ Teams loaded:', res.data);
      setTeams(res.data || []);
    } catch (err: any) {
      console.log('[JoinTeam] ❌ Error:', err.response?.data?.error || err.message);

      // ✅ HANDLE PROFILE INCOMPLETE ERROR
      if (err.response?.data?.error?.includes('profile')) {
        showAlert(
          'Complete Profile',
          'Please complete your profile first to join teams.',
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

      showAlert('Error', err.response?.data?.error || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  // ✅ USE FOCUS EFFECT TO RELOAD TEAMS
  useFocusEffect(
    React.useCallback(() => {
      loadTeams();
    }, [])
  );

  // ✅ SEND JOIN REQUEST WITH ERROR HANDLING
  const sendRequest = async () => {
    try {
      setSendingRequest(true);
      const studentId = await AsyncStorage.getItem("studentId");

      console.log('[JoinTeam] 📤 Sending join request for team:', selectedTeam?.teamId);

      await sendJoinRequest({
        studentId: Number(studentId),
        teamId: selectedTeam!.teamId,
      });

      console.log('[JoinTeam] ✅ Request sent successfully');
      showAlert("Request Sent", "Team leader will review your request.", [
        {
          text: 'OK',
          onPress: () => {
            const res = getAllTeams(Number(studentId));
            res.then(r => {
              setTeams(r.data || []);
              const updatedTeam = r.data?.find(
                (t: Team) => t.teamId === selectedTeam!.teamId
              );
              setSelectedTeam(updatedTeam || null);
            });
          },
        },
      ]);

    } catch (err: any) {
      console.log('[JoinTeam] ❌ Error:', err.response?.data?.error || err.message);

      const errorMsg = err.response?.data?.error || 'Failed to send request';

      // ✅ SPECIFIC ERROR MESSAGES
      if (errorMsg.includes('different department')) {
        showAlert(
          '❌ Department Mismatch',
          'You are from a different department. Cannot join this team.',
          [{ text: 'OK' }]
        );
      } else if (errorMsg.includes('different institute')) {
        showAlert(
          '❌ Institute Mismatch',
          'You are from a different institute. Cannot join this team.',
          [{ text: 'OK' }]
        );
      } else if (errorMsg.includes('already')) {
        showAlert('⚠️ Already Requested', errorMsg, [{ text: 'OK' }]);
      } else if (errorMsg.includes('Limit reached')) {
        showAlert(
          '👥 Team Full',
          'This team has reached the maximum size. Allocation rules prevent adding more members.',
          [{ text: 'OK' }]
        );
      } else {
        showAlert('Error', errorMsg, [{ text: 'OK' }]);
      }
    } finally {
      setSendingRequest(false);
    }
  };

  // ✅ FILTERING LOGIC
  const filteredTeams = teams.filter(team => {
    const query = search.toLowerCase();
    if (!query) return true;

    if (searchCategory === 'TEAM NAME') {
      return team.teamName.toLowerCase().includes(query);
    } else if (searchCategory === 'LEADER') {
      return team.teamLead.toLowerCase().includes(query);
    } else if (searchCategory === 'MEMBERS') {
      return team.members.some(m => m.toLowerCase().includes(query));
    } else {
      // ALL
      return team.teamName.toLowerCase().includes(query) ||
        team.teamLead.toLowerCase().includes(query) ||
        team.members.some(m => m.toLowerCase().includes(query));
    }
  });

  // ================= DETAILS SCREEN =================
  if (selectedTeam) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: divider }]}>
          <TouchableOpacity onPress={() => setSelectedTeam(null)}>
            <Image
              source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Team Details
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>

          {/* CARD */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.teamName, { color: colors.text }]}>
              {selectedTeam.teamName}
            </Text>

            {selectedTeam.description && (
              <Text style={[styles.desc, { color: colors.subText }]}>
                {selectedTeam.description}
              </Text>
            )}

            <Text style={[styles.meta, { color: colors.subText }]}>
              Leader: {selectedTeam.teamLead}
            </Text>

            <Text style={[styles.sectionLabel, { color: colors.subText }]}>
              MEMBERS ({selectedTeam.members.length})
            </Text>

            {selectedTeam.members.map((m, i) => (
              <Text key={i} style={[styles.member, { color: colors.text }]}>
                • {m}
              </Text>
            ))}
          </View>

          {/* BUTTON */}
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              { backgroundColor: selectedTeam.alreadyRequested ? '#9CA3AF' : colors.primary }
            ]}
            onPress={sendRequest}
            disabled={selectedTeam.alreadyRequested || sendingRequest}
          >
            {sendingRequest ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>
                {selectedTeam.alreadyRequested ? 'Request Sent' : 'Send Join Request'}
              </Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    );
  }

  // ================= LIST SCREEN =================
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Join Team
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.subText }]}>
          {filteredTeams.length} teams
        </Text>
      </View>

      <View style={{ paddingHorizontal: 16, paddingTop: 16 }}>
        {/* SEARCH AND FILTER */}
        <View style={styles.searchRow}>
          <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Icon name="search" colors={colors} />
            <TextInput
              placeholder={searchCategory === 'ALL' ? "Search teams..." : `Search by ${searchCategory.toLowerCase()}...`}
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
            <Icon name="sort" size={18} colors={colors} />
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : filteredTeams.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.subText, fontSize: 16 }}>
            {teams.length === 0 ? 'No teams available in your department' : 'No results matching your search'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTeams}
          keyExtractor={item => item.teamId.toString()}
          contentContainerStyle={styles.content}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.card }]}
              onPress={() => setSelectedTeam(item)}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.teamIcon, { backgroundColor: colors.primary + '15' }]}>
                  <Icon name="team" colors={colors} size={20} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.teamName, { color: colors.text }]}>
                    {item.teamName}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 2 }}>
                    <Icon name="user" colors={colors} size={12} />
                    <Text style={{ color: colors.subText, fontSize: 12 }}>{item.teamLead}</Text>
                  </View>
                </View>
              </View>

              {item.description && (
                <Text style={[styles.desc, { color: colors.subText, marginTop: 12 }]} numberOfLines={2}>
                  {item.description}
                </Text>
              )}

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12, alignItems: 'center' }}>
                <View style={{ backgroundColor: isDark ? '#1F2937' : '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}>
                  <Text style={{ color: colors.subText, fontSize: 11, fontWeight: '600' }}>
                    {item.members.length} MEMBERS
                  </Text>
                </View>
                {item.alreadyRequested && (
                  <View style={{ backgroundColor: '#DBEAFE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                    <Text style={{ color: '#1E40AF', fontWeight: '700', fontSize: 10 }}>✓ REQUESTED</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          )}
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
              {(['ALL', 'TEAM NAME', 'LEADER', 'MEMBERS'] as const).map((cat) => (
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
    </SafeAreaView>
  );
};

export default JoinTeamScreen;

const styles = StyleSheet.create({
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  headerSubtitle: {
    fontSize: 12,
    marginLeft: 'auto',
  },

  content: {
    padding: 16,
  },

  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  teamName: {
    fontSize: 16,
    fontWeight: '700',
  },

  desc: {
    fontSize: 13,
    marginTop: 4,
  },

  meta: {
    fontSize: 12,
    marginTop: 4,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 12,
  },

  member: {
    fontSize: 14,
    marginTop: 4,
  },

  primaryBtn: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  btnText: {
    color: '#fff',
    fontWeight: '700',
  },

  backIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },

  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
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
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  teamIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});