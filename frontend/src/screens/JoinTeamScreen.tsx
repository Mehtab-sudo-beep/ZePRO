import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../theme/ThemeContext';
import { AlertContext } from '../context/AlertContext';
import { getAllTeams, sendJoinRequest } from "../api/studentApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect } from "react";
/* =========================
   TYPES
========================= */
interface Team {
  teamId: number;
  teamName: string;
  description?: string;
  teamLead: string;
  members: string[];
  alreadyRequested: boolean;
}

// ONLY UI IMPROVED — NO LOGIC CHANGED

const JoinTeamScreen: React.FC = () => {
  const { colors } = useContext(ThemeContext);
  const isDark = colors.background === '#111827';
  const accentSoft = isDark ? 'rgba(96,165,250,0.12)' : 'rgba(37,99,235,0.07)';
  const divider = isDark ? '#374151' : '#E5E7EB';

  const { showAlert } = useContext(AlertContext);
  const navigation = useNavigation<any>();

  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const studentId = await AsyncStorage.getItem("studentId");
        const res = await getAllTeams(Number(studentId));
        setTeams(res.data);
      } catch (err) {
        console.log("TEAM LIST ERROR:", err);
      }
    };
    loadTeams();
  }, []);

  const sendRequest = async () => {
    try {
      const studentId = await AsyncStorage.getItem("studentId");

      await sendJoinRequest({
        studentId: Number(studentId),
        teamId: selectedTeam!.teamId,
      });

      showAlert("Request Sent", "Team leader will review your request.");

      const res = await getAllTeams(Number(studentId));
      setTeams(res.data);

      const updatedTeam = res.data.find(
        (t: Team) => t.teamId === selectedTeam!.teamId
      );

      setSelectedTeam(updatedTeam || null);

    } catch (err) {
      console.log("JOIN REQUEST ERROR:", err);
      showAlert("Error sending request");
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
              MEMBERS
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
            disabled={selectedTeam.alreadyRequested}
          >
            <Text style={styles.btnText}>
              {selectedTeam.alreadyRequested ? 'Request Sent' : 'Send Join Request'}
            </Text>
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
      </View>

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

            <Text style={[styles.meta, { color: colors.subText }]}>
              {item.members.length}/3 members
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
};

export default JoinTeamScreen;

/* =========================
   STYLES
========================= */
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