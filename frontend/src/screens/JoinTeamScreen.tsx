import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../theme/ThemeContext';

/* =========================
   TYPES
========================= */
interface Team {
  id: string;
  name: string;
  leader: string;
  members: string[];
  description: string;
}

const JoinTeamScreen: React.FC = () => {
  const { colors } = useContext(ThemeContext);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const teams: Team[] = [
    {
      id: '1',
      name: 'AI Innovators',
      leader: 'Rahul',
      members: ['Rahul', 'Anjali', 'Kiran'],
      description: 'Working on AI-based healthcare project.',
    },
    {
      id: '2',
      name: 'Code Masters',
      leader: 'Sneha',
      members: ['Sneha', 'Vishal'],
      description: 'Building full-stack web applications.',
    },
    {
      id: '3',
      name: 'Cyber Warriors',
      leader: 'Arjun',
      members: ['Arjun', 'Megha', 'Rohit'],
      description: 'Focused on cybersecurity tools and research.',
    },
  ];

  const sendRequest = () => {
    Alert.alert(
      'Request Sent',
      'Your request has been sent to the Team Leader (UI only)',
    );
  };

  /* =========================
     TEAM DETAILS SCREEN
  ========================= */
  if (selectedTeam) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.container}>
          <Text style={[styles.header, { color: colors.text }]}>
            Team Details
          </Text>

          <View
            style={[
              styles.detailsCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <Text style={[styles.teamName, { color: colors.text }]}>
              {selectedTeam.name}
            </Text>

            <Text style={[styles.info, { color: colors.subText }]}>
              Leader: {selectedTeam.leader}
            </Text>

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Team Members (Max 3)
            </Text>

            {selectedTeam.members.map((member, index) => (
              <Text key={index} style={[styles.member, { color: colors.text }]}>
                • {member}
              </Text>
            ))}

            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Project Description
            </Text>

            <Text style={[styles.info, { color: colors.subText }]}>
              {selectedTeam.description}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.requestBtn, { backgroundColor: colors.primary }]}
            onPress={sendRequest}
          >
            <Text style={styles.btnText}>Send Join Request</Text>
          </TouchableOpacity>

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
      <Text style={[styles.teamName, { color: colors.text }]}>{item.name}</Text>

      <Text style={[styles.info, { color: colors.subText }]}>
        Leader: {item.leader}
      </Text>

      <Text style={[styles.info, { color: colors.subText }]}>
        Description: {item.description}
      </Text>

      <Text style={[styles.info, { color: colors.subText }]}>
        Members: {item.members.length}/3
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        <Text style={[styles.header, { color: colors.text }]}>Join a Team</Text>

        <FlatList
          data={teams}
          keyExtractor={item => item.id}
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

  header: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 15,
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
