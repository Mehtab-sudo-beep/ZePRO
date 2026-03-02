import React, { useContext, useState } from 'react';
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

const INITIAL_REQUESTS = [
  {
    id: '1',
    studentName: 'Ravi Shankar',
    rollNo: '21CS045',
    sentOn: '01 Mar 2026',
    status: 'Pending',
  },
  {
    id: '2',
    studentName: 'Sneha Reddy',
    rollNo: '21CS067',
    sentOn: '28 Feb 2026',
    status: 'Pending',
  },
  {
    id: '3',
    studentName: 'Kiran Patel',
    rollNo: '21CS032',
    sentOn: '26 Feb 2026',
    status: 'Accepted',
  },
];

const ReceivedRequestsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useContext(ThemeContext);
  const [requests, setRequests] = useState(INITIAL_REQUESTS);

  const handleAccept = (id: string) => {
    setRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'Accepted' } : r)
    );
  };

  const handleReject = (id: string) => {
    setRequests(prev =>
      prev.map(r => r.id === id ? { ...r, status: 'Rejected' } : r)
    );
  };

  const statusColor = (status: string) => {
    if (status === 'Accepted') return '#16A34A';
    if (status === 'Rejected') return '#DC2626';
    return '#D97706';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={[styles.back, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Join Requests</Text>
            <Text style={[styles.headerSub, { color: colors.subText }]}>
              {requests.filter(r => r.status === 'Pending').length} pending
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.listContent}>
          {requests.map((req) => (
            <View
              key={req.id}
              style={[styles.card, { backgroundColor: colors.card, shadowColor: colors.text, borderLeftColor: '#2563EB' }]}
            >
              <View style={styles.cardRow}>
                <Text style={[styles.studentName, { color: colors.text }]}>{req.studentName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: statusColor(req.status) + '18' }]}>
                  <Text style={[styles.statusText, { color: statusColor(req.status) }]}>
                    {req.status}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.subText }]}>Roll No</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{req.rollNo}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: colors.subText }]}>Sent On</Text>
                <Text style={[styles.infoValue, { color: colors.text }]}>{req.sentOn}</Text>
              </View>

              {req.status === 'Pending' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.acceptBtn, { borderColor: '#16A34A' }]}
                    onPress={() => handleAccept(req.id)}
                  >
                    <Text style={[styles.acceptText, { color: '#16A34A' }]}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.rejectBtn, { borderColor: '#DC2626' }]}
                    onPress={() => handleReject(req.id)}
                  >
                    <Text style={[styles.rejectText, { color: '#DC2626' }]}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default ReceivedRequestsScreen;

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

  studentName: {
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

  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },

  acceptBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },

  acceptText: {
    fontWeight: '700',
    fontSize: 13,
  },

  rejectBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },

  rejectText: {
    fontWeight: '700',
    fontSize: 13,
  },
});