import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../theme/ThemeContext';

const SENT_REQUESTS = [
  {
    teamName: 'Team Nexus',
    teamLead: 'Arjun Mehta',
    sentOn: '28 Feb 2026',
    status: 'Pending',
  },
  {
    teamName: 'Code Crafters',
    teamLead: 'Priya Nair',
    sentOn: '25 Feb 2026',
    status: 'Rejected',
  },
  {
    teamName: 'InnoVibe',
    teamLead: 'Rahul Verma',
    sentOn: '20 Feb 2026',
    status: 'Accepted',
  },
];

const statusColor = (status: string) => {
  if (status === 'Accepted') return '#16A34A';
  if (status === 'Rejected') return '#DC2626';
  return '#D97706';
};

const SentRequestsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useContext(ThemeContext);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={[styles.back, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Sent Requests</Text>
            <Text style={[styles.headerSub, { color: colors.subText }]}>
              {SENT_REQUESTS.length} requests sent
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.listContent}>
          {SENT_REQUESTS.map((req, index) => (
            <View
              key={index}
              style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text, borderLeftColor: '#2563EB' }]}
            >
              <View style={styles.cardRow}>
                <Text style={[styles.teamName, { color: colors.text }]}>{req.teamName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor(req.status) + '18' }]}>
                  <Text style={[styles.statusText, { color: statusColor(req.status) }]}>
                    {req.status}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.subText }]}>Team Lead</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{req.teamLead}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.subText }]}>Sent On</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{req.sentOn}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default SentRequestsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    height: 68,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    borderBottomWidth: 1,
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    gap: 12,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  back: { fontSize: 22 },

  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: 0.3,
  },

  headerSub: {
    fontSize: 12,
    marginTop: 1,
  },

  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },

  card: {
    borderRadius: 16,
    padding: 16,
    shadowOpacity: 0.07,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderLeftWidth: 4,
  },

  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  teamName: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },

  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    marginVertical: 12,
    borderRadius: 1,
  },

  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  infoLabel: {
    fontSize: 13,
  },

  infoValue: {
    fontSize: 13,
    fontWeight: '500',
  },
});