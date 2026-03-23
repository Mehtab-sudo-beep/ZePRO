import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getSentRequests } from '../api/studentApi';

interface Request {
  requestId: number;
  teamName: string;
  teamLead: string;
  status: string;
  rejectionReason?: string;
}

const statusColor = (status: string) => {
  if (status === 'ACCEPTED') return '#16A34A';
  if (status === 'REJECTED') return '#DC2626';
  return '#D97706';
};

const SentRequestsScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useContext(ThemeContext);
  const isDark = colors.background === '#111827';

  const [requests, setRequests] = useState<Request[]>([]);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const studentId = await AsyncStorage.getItem('studentId');
        const res = await getSentRequests(Number(studentId));
        setRequests(res.data);
      } catch (err) {
        console.log('SENT REQUEST ERROR:', err);
      }
    };
    loadRequests();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image
              source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Sent Requests</Text>
            <Text style={[styles.headerSub, { color: colors.subText }]}>
              {requests.length} requests sent
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={styles.listContent}>

          {requests.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={{ color: colors.subText, fontSize: 16 }}>No requests sent yet</Text>
            </View>
          ) : (
            requests.map((req) => (
              <View
                key={req.requestId}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    shadowColor: colors.text,
                    borderLeftColor: statusColor(req.status),
                  },
                ]}
              >
                <View style={styles.cardRow}>
                  <Text style={[styles.teamName, { color: colors.text }]}>
                    {req.teamName}
                  </Text>
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

                {/* Show rejection reason if rejected */}
                {req.status === 'REJECTED' && req.rejectionReason ? (
                  <View style={[styles.reasonBox, { backgroundColor: '#FEE2E2' }]}>
                    <Text style={{ color: '#DC2626', fontSize: 13, fontWeight: '700', marginBottom: 3 }}>
                      Rejection Reason:
                    </Text>
                    <Text style={{ color: '#DC2626', fontSize: 13, lineHeight: 18 }}>
                      {req.rejectionReason}
                    </Text>
                  </View>
                ) : null}

              </View>
            ))
          )}

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

  backIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },

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

  emptyBox: {
    marginTop: 80,
    alignItems: 'center',
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

  reasonBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
  },
});
