import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

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
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  /* Dummy Teams (UI only) */
  const teams: Team[] = [
    {
      id: "1",
      name: "AI Innovators",
      leader: "Rahul",
      members: ["Rahul", "Anjali", "Kiran"],
      description: "Working on AI-based healthcare project.",
    },
    {
      id: "2",
      name: "Code Masters",
      leader: "Sneha",
      members: ["Sneha", "Vishal"],
      description: "Building full-stack web applications.",
    },
    {
      id: "3",
      name: "Cyber Warriors",
      leader: "Arjun",
      members: ["Arjun", "Megha", "Rohit"],
      description: "Focused on cybersecurity tools and research.",
    },
  ];

  const sendRequest = () => {
    Alert.alert(
      "Request Sent",
      "Your request has been sent to the Team Leader (UI only)"
    );
  };

  /* =========================
     TEAM DETAILS SCREEN
     ========================= */
  if (selectedTeam) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.header}>Team Details</Text>

        <View style={styles.detailsCard}>
          <Text style={styles.teamName}>{selectedTeam.name}</Text>
          <Text style={styles.info}>Leader: {selectedTeam.leader}</Text>
          

          <Text style={styles.sectionTitle}>Team Members (Max 3)</Text>
          {selectedTeam.members.map((member, index) => (
            <Text key={index} style={styles.member}>
              • {member}
            </Text>
          ))}

          <Text style={styles.sectionTitle}>Project Description</Text>
          <Text style={styles.info}>{selectedTeam.description}</Text>
        </View>

        <TouchableOpacity style={styles.requestBtn} onPress={sendRequest}>
          <Text style={styles.btnText}>Send Join Request</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setSelectedTeam(null)}
        >
          <Text style={styles.btnText}>Back to Team List</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  /* =========================
     TEAM LIST SCREEN
     ========================= */
  const renderTeam = ({ item }: { item: Team }) => (
    <TouchableOpacity
      style={styles.teamCard}
      onPress={() => setSelectedTeam(item)}
    >
      <Text style={styles.teamName}>{item.name}</Text>
      <Text style={styles.info}>Leader: {item.leader}</Text>
      <Text style={styles.info}>Description: {item.description}</Text>
      <Text style={styles.info}>
        Members: {item.members.length}/3
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Join a Team</Text>

      <FlatList
        data={teams}
        keyExtractor={(item) => item.id}
        renderItem={renderTeam}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
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
    backgroundColor: "#f4f6f8",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
  },
  teamCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    elevation: 2,
  },
  teamName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  info: {
    fontSize: 14,
    color: "#555",
    marginTop: 2,
  },
  detailsCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 10,
  },
  member: {
    fontSize: 15,
    marginLeft: 5,
    marginTop: 2,
  },
  requestBtn: {
    backgroundColor: "#007bff",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 10,
  },
  backBtn: {
    backgroundColor: "#888",
    padding: 14,
    borderRadius: 6,
    alignItems: "center",
  },
  btnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
