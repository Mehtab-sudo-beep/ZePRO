import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../theme/ThemeContext';
import { getMeetingDetails } from '../api/studentApi';

type Props = NativeStackScreenProps<RootStackParamList, 'MeetingDetails'>;

type MeetingDetail = {
  requestId: number;
  title: string;
  faculty: string;
  projectName: string;
  domain: string;
  subDomain: string;
  location: string;
  date: string;
  time: string;
  members: string[];
};

const MeetingDetailsScreen: React.FC<Props> = ({ route }) => {
  const { requestId } = route.params;
  console.log("Request ID:", requestId);
  const { colors } = useContext(ThemeContext);

  const [meeting, setMeeting] = useState<MeetingDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeeting = async () => {
  try {
    const res = await getMeetingDetails(requestId);

    console.log("Meeting API response:", res.data);

    if (res.data) {
      setMeeting(res.data);
    }

  } catch (err) {
    console.log("Failed to load meeting", err);
  } finally {
    setLoading(false);
  }
};

    fetchMeeting();
  }, [requestId]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading meeting...</Text>
      </View>
    );
  }

  if (!meeting) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No meeting found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.container}>

        <Text style={[styles.title, { color: colors.text }]}>
          {meeting.title}
        </Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Detail label="Faculty" value={meeting.faculty} colors={colors} />
          <Detail label="Project" value={meeting.projectName} colors={colors} />
          <Detail label="Domain" value={meeting.domain} colors={colors} />
          <Detail label="Sub-Domain" value={meeting.subDomain} colors={colors} />
          <Detail label="Location" value={meeting.location} colors={colors} />
          <Detail label="Date" value={meeting.date} colors={colors} />
          <Detail label="Time" value={meeting.time} colors={colors} />
        </View>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Team Members
        </Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {meeting.members?.map((m, i) => (
            <Text key={i} style={[styles.member, { color: colors.text }]}>
              • {m}
            </Text>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

export default MeetingDetailsScreen;
const Detail = ({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: any;
}) => (
  <View style={styles.row}>
    <Text style={[styles.label, { color: colors.subText }]}>{label}</Text>
    <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
  </View>
);
const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },

  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },

  row: {
    marginBottom: 12,
  },

  label: {
    fontSize: 13,
    marginBottom: 2,
  },

  value: {
    fontSize: 16,
    fontWeight: '500',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },

  member: {
    fontSize: 15,
    marginBottom: 6,
  },
});
