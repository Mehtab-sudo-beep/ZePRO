import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
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

const JoinTeamScreen: React.FC = () => {
  const { colors } = useContext(ThemeContext);
  const { showAlert } = useContext(AlertContext);
  const isDark = colors.background === '#111827';
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

    loadTeams();   // 🔴 THIS WAS MISSING

  }, []);
  const sendRequest = async () => {
    try {

      const studentId = await AsyncStorage.getItem("studentId");

      await sendJoinRequest({
        studentId: Number(studentId),
        teamId: selectedTeam!.teamId,
      });

      showAlert("Request Sent", "Team leader will review your request.");

      // 🔴 reload teams so alreadyRequested becomes true
      const res = await getAllTeams(Number(studentId));
      setTeams(res.data);

      // update selected team also
      const updatedTeam = res.data.find(
        (t: Team) => t.teamId === selectedTeam!.teamId
      );

      setSelectedTeam(updatedTeam || null);

    } catch (err) {

      console.log("JOIN REQUEST ERROR:", err);
      showAlert("Error sending request");

    }
  };

  /* =========================
     TEAM DETAILS SCREEN
  ========================= */
  if (selectedTeam) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.container}>
          <View style={[styles.headerRow, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.backButton} onPress={() => setSelectedTeam(null)}>
              <Image
                source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <Text style={[styles.header, { color: colors.text }]}>Team Details</Text>
          </View>

          <View
            style={[
              styles.detailsCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.teamName, { color: colors.text }]}>
              {selectedTeam.teamName}
            </Text>

            {selectedTeam.description ? (
              <Text style={[styles.info, { color: colors.text, fontStyle: 'italic', marginBottom: 8 }]}>
                {selectedTeam.description}
              </Text>
            ) : null}

            <Text style={[styles.info, { color: colors.subText }]}>
              Leader: {selectedTeam.teamLead}
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Team Members (Max 3)
            </Text>

            {selectedTeam.members.map((member, index) => (
              <Text key={index} style={[styles.member, { color: colors.text }]}>
                • {member}
              </Text>
            ))}


          </View>

          {selectedTeam.alreadyRequested ? (

            <View style={[styles.requestBtn, { backgroundColor: "#999" }]}>
              <Text style={styles.btnText}>Request Already Sent</Text>
            </View>

          ) : (

            <TouchableOpacity
              style={[styles.requestBtn, { backgroundColor: colors.primary }]}
              onPress={sendRequest}
            >
              <Text style={styles.btnText}>Send Join Request</Text>
            </TouchableOpacity>

          )}

          <TouchableOpacity
            style={[
              styles.backBtn,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => setSelectedTeam(null)}
          >
            <Text style={[styles.btnText, { color: colors.subText }]}>
              Back to Team List
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  /* =========================
     TEAM LIST SCREEN
  ========================= */
  const renderTeam = ({ item }: { item: Team }) => (
    <TouchableOpacity
      style={[
        styles.teamCard,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
      onPress={() => setSelectedTeam(item)}
    >
      <Text style={[styles.teamName, { color: colors.text }]}>
        {item.teamName}
      </Text>

      {item.description ? (
        <Text style={[styles.info, { color: colors.text, fontStyle: 'italic' }]} numberOfLines={2}>
          {item.description}
        </Text>
      ) : null}

      <Text style={[styles.info, { color: colors.subText }]}>
        Leader: {item.teamLead}
      </Text>

      <Text style={[styles.info, { color: colors.subText }]}>
        Members: {item.members.length}/3
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        <View style={[styles.headerRow, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image
              source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={[styles.header, { color: colors.text }]}>Join a Team</Text>
        </View>
        <FlatList
          data={teams}
          keyExtractor={item => item.teamId.toString()}
          renderItem={renderTeam}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
};

export default JoinTeamScreen;

/* =========================
   STYLES
========================= */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    paddingHorizontal: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 12,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginLeft: -8,
  },
  backIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
  },

  teamCard: {
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },

  teamName: {
    fontSize: 18,
    fontWeight: '600',
  },

  info: {
    fontSize: 14,
    marginTop: 4,
  },

  detailsCard: {
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },

  member: {
    fontSize: 15,
    marginLeft: 5,
    marginTop: 4,
  },

  requestBtn: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },

  backBtn: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },

  btnText: {
    fontWeight: '600',
    color: '#fff',
  },
});
