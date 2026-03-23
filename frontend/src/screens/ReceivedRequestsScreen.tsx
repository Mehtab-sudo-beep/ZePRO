import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  getReceivedRequests,
  approveRequest,
  rejectRequest,
} from '../api/studentApi';

interface Request {
  requestId: number;
  studentId: number;
  studentName: string;
  status: string;
}

const ReceivedRequestsScreen: React.FC = () => {

  const navigation = useNavigation<any>();
  const { colors } = useContext(ThemeContext);
 const isDark = colors.background === '#111827';
 const [requests, setRequests] = useState<Request[]>([]);

  const loadRequests = async () => {
  try {

    const studentId = await AsyncStorage.getItem("studentId");

    const res = await getReceivedRequests(Number(studentId));

    console.log("REQUESTS:", res.data);

    // ensure array
    if (Array.isArray(res.data)) {
      setRequests(res.data);
    } else {
      setRequests([]);
    }

  } catch (err) {
    console.log("RECEIVED REQUEST ERROR:", err);
  }
};

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAccept = async (id: number) => {

  try {

    await approveRequest(id);

    setRequests(prev => prev.filter(r => r.requestId !== id));

  } catch (err) {

    console.log("APPROVE ERROR:", err);

  }

};

  const handleReject = async (id: number) => {

    try {

      await rejectRequest(id);

      loadRequests();

    } catch (err) {

      console.log("REJECT ERROR:", err);

    }

  };

  const statusColor = (status: string) => {
    if (status === 'ACCEPTED' || status === 'APPROVED') return '#16A34A';
    if (status === 'REJECTED') return '#DC2626';
    return '#D97706';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

      <View style={styles.container}>

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image
            source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
            style={styles.backIcon}
          />
          </TouchableOpacity>

          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Join Requests
            </Text>
            <Text style={{ color: colors.subText }}>
              {requests.length} pending
            </Text>
          </View>
        </View>

        <ScrollView contentContainerStyle={{ padding: 16 }}>

          {requests.map((req) => (

            <View
              key={req.requestId}
              style={[styles.card, { backgroundColor: colors.card }]}
            >

              <View style={styles.cardRow}>

                <Text style={{ color: colors.text, fontWeight: "700" }}>
                  {req.studentName}
                </Text>

                <Text style={{ color: statusColor(req.status) }}>
                  {req.status}
                </Text>

              </View>

              <View style={styles.divider} />

              <Text style={{ color: colors.subText }}>
  Student ID: {req.studentId}
</Text>

              {req.status === "PENDING" && (

                <View style={styles.actions}>

                  <TouchableOpacity
                    style={[styles.acceptBtn]}
                    onPress={() => handleAccept(req.requestId)}
                  >
                    <Text style={{ color: "#16A34A" }}>Accept</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.rejectBtn]}
                    onPress={() => handleReject(req.requestId)}
                  >
                    <Text style={{ color: "#DC2626" }}>Reject</Text>
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
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 12,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },

  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },

  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },

  acceptBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#16A34A",
    padding: 10,
    alignItems: "center",
    borderRadius: 6,
  },

  rejectBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#DC2626",
    padding: 10,
    alignItems: "center",
    borderRadius: 6,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { width: 22, height: 22, resizeMode: 'contain' },
  headerSub: {
    fontSize: 12,
    marginTop: 1,
  },
});