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
          {teams.length} teams
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : teams.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: colors.subText, fontSize: 16 }}>
            No teams available in your department
          </Text>
        </View>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={item => item.teamId.toString()}
          contentContainerStyle={styles.content}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: colors.card }]}
              onPress={() => setSelectedTeam(item)}
            >
              <Text style={[styles.teamName, { color: colors.text }]}>
                {item.teamName}
              </Text>

              {item.description && (
                <Text style={[styles.desc, { color: colors.subText }]} numberOfLines={2}>
                  {item.description}
                </Text>
              )}

              <Text style={[styles.meta, { color: colors.subText }]}>
                Leader: {item.teamLead}
              </Text>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                <Text style={[styles.meta, { color: colors.subText }]}>
                  Members: {item.members.length}
                </Text>
                {item.alreadyRequested && (
                  <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 12 }}>
                    ✓ Requested
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
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
});