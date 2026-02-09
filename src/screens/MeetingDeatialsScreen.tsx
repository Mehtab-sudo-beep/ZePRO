import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
type Props = NativeStackScreenProps<
  RootStackParamList,
  'MeetingDetails'
>;

const MeetingDetailsScreen: React.FC<Props> = ({ route }) => {
  const { meeting } = route.params;

  return (
     <SafeAreaView style={styles.safeArea}>
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{meeting.title}</Text>

      <Detail label="Faculty" value={meeting.faculty} />
      <Detail label="Project" value={meeting.projectName} />
      <Detail label="Domain" value={meeting.domain} />
      <Detail label="Sub-Domain" value={meeting.subDomain} />
      <Detail label="Location" value={meeting.location} />
      <Detail label="Date" value={meeting.date} />
      <Detail label="Time" value={meeting.time} />

      <Text style={styles.sectionTitle}>Team Members</Text>
      {meeting.members.map((m, i) => (
        <Text key={i} style={styles.member}>• {m}</Text>
      ))}
    </ScrollView>
    </SafeAreaView>
  );
};

export default MeetingDetailsScreen;
const Detail = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F9FAFB',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  row: {
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    color: '#6B7280',
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
  },
  sectionTitle: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: '600',
  },
  member: {
    fontSize: 14,
    marginTop: 4,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
});

