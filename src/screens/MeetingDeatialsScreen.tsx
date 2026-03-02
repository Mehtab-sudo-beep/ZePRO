import React, { useContext } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'MeetingDetails'>;

const MeetingDetailsScreen: React.FC<Props> = ({ route }) => {
  const { meeting } = route.params;
  const { colors } = useContext(ThemeContext);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
        }}
      >
        <Text style={[styles.title, { color: colors.text }]}>
          {meeting.title}
        </Text>

        <Detail label="Faculty" value={meeting.faculty} colors={colors} />
        <Detail label="Project" value={meeting.projectName} colors={colors} />
        <Detail label="Domain" value={meeting.domain} colors={colors} />
        <Detail label="Sub-Domain" value={meeting.subDomain} colors={colors} />
        <Detail label="Location" value={meeting.location} colors={colors} />
        <Detail label="Date" value={meeting.date} colors={colors} />
        <Detail label="Time" value={meeting.time} colors={colors} />

        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Team Members
        </Text>

        {meeting.members.map((m, i) => (
          <Text key={i} style={[styles.member, { color: colors.text }]}>
            • {m}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default MeetingDetailsScreen;

/* ================= DETAIL COMPONENT ================= */

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

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 18,
  },

  row: {
    marginBottom: 14,
  },

  label: {
    fontSize: 13,
  },

  value: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 2,
  },

  sectionTitle: {
    marginTop: 24,
    fontSize: 18,
    fontWeight: '600',
  },

  member: {
    fontSize: 15,
    marginTop: 6,
  },
});
