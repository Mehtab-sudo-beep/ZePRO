import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
  ActivityIndicator,
  Linking,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from '../theme/ThemeContext';
import { AlertContext } from '../context/AlertContext';
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
  rejectionReason?: string;
  studentEmail?: string;
  studentRollNumber?: string;
  cgpa?: number;
  resumeLink?: string;
  marksheetLink?: string;
}

const ReceivedRequestsScreen: React.FC = () => {

  const navigation = useNavigation<any>();
  const { colors } = useContext(ThemeContext);
  const { showAlert } = useContext(AlertContext);
  const isDark = colors.background === '#111827';

  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectingId, setRejectingId] = useState<number | null>(null);

  // ✅ LOAD REQUESTS WITH ERROR HANDLING
  const loadRequests = async () => {
    try {
      setLoading(true);
      const studentId = await AsyncStorage.getItem('studentId');
      console.log('[ReceivedRequests] 📥 Fetching requests for student:', studentId);

      const res = await getReceivedRequests(Number(studentId));
      console.log('[ReceivedRequests] ✅ Requests loaded:', res.data);

      if (Array.isArray(res.data)) {
        setRequests(res.data);
      } else {
        setRequests([]);
      }
    } catch (err: any) {
      console.log('[ReceivedRequests] ❌ Error:', err.response?.data?.error || err.message);
      showAlert('Error', err.response?.data?.error || 'Failed to load requests');
    } finally {
      setLoading(false);
    }
  };

  // ✅ USE FOCUS EFFECT
  useFocusEffect(
    React.useCallback(() => {
      loadRequests();
    }, [])
  );

  // ✅ HANDLE ACCEPT WITH ERROR HANDLING
  const handleAccept = async (id: number) => {
    try {
      setProcessingId(id);
      console.log('[ReceivedRequests] ✅ Approving request:', id);

      await approveRequest(id);

      console.log('[ReceivedRequests] ✅ Request approved');
      loadRequests();
      showAlert('Accepted', 'Student has been added to your team.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err: any) {
      console.log('[ReceivedRequests] ❌ Error:', err.response?.data?.error || err.message);

      const errorMsg = err.response?.data?.error || 'Failed to accept request';

      // ✅ SPECIFIC ERROR MESSAGES
      if (errorMsg.includes('different department')) {
        showAlert(
          '❌ Department Mismatch',
          'Student is from a different department. Cannot add to team.',
          [{ text: 'OK' }]
        );
      } else if (errorMsg.includes('different institute')) {
        showAlert(
          '❌ Institute Mismatch',
          'Student is from a different institute. Cannot add to team.',
          [{ text: 'OK' }]
        );
      } else if (errorMsg.includes('Limit reached')) {
        showAlert(
          '👥 Team Full',
          'Team has reached maximum size due to allocation rules.',
          [{ text: 'OK' }]
        );
      } else if (errorMsg.includes('already allocated')) {
        showAlert(
          '🚫 Already Allocated',
          'You cannot add members to the team after a project has been allocated.',
          [{ text: 'OK' }]
        );
      } else {
        showAlert('Error', errorMsg, [{ text: 'OK' }]);
      }
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (id: number) => {
    setRejectTargetId(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  // ✅ HANDLE REJECT WITH ERROR HANDLING
  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      showAlert('Required', 'Please enter a reason for rejection.');
      return;
    }
    try {
      setRejectingId(rejectTargetId!);
      console.log('[ReceivedRequests] ❌ Rejecting request:', rejectTargetId);

      await rejectRequest(rejectTargetId!, rejectReason.trim());

      console.log('[ReceivedRequests] ✅ Request rejected');
      setShowRejectModal(false);
      setRejectTargetId(null);
      setRejectReason('');
      loadRequests();
      showAlert('Rejected', 'Request has been rejected with feedback.', [
        {
          text: 'OK',
        },
      ]);
    } catch (err: any) {
      console.log('[ReceivedRequests] ❌ Error:', err.response?.data?.error || err.message);
      showAlert('Error', err.response?.data?.error || 'Failed to reject request.');
    } finally {
      setRejectingId(null);
    }
  };

  const handleSendEmail = (email?: string) => {
    if (email) {
      Linking.openURL(`mailto:${email}`);
    } else {
      showAlert('Error', 'No email provided for this user.');
    }
  };

  const statusColor = (status: string) => {
    if (status === 'ACCEPTED' || status === 'APPROVED') return '#16A34A';
    if (status === 'REJECTED') return '#DC2626';
    return '#D97706';
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

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
            <Text style={{ color: colors.subText, fontSize: 13 }}>
              {pendingCount} pending • {requests.length} total
            </Text>
          </View>
        </View>

        {/* Cards */}
        {loading ? (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 16 }}>

            {requests.length === 0 ? (
              <View style={styles.emptyBox}>
                <Text style={{ color: colors.subText, fontSize: 16 }}>No requests yet</Text>
              </View>
            ) : (
              requests.map((req) => (
                <View
                  key={req.requestId}
                  style={[styles.card, { backgroundColor: isDark ? '#1E293B' : '#F8FAFC', shadowColor: isDark ? '#000' : '#CBD5E1' }]}
                >
                  <View style={styles.cardRow}>
                    <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>
                      {req.studentName}
                    </Text>
                    <View style={[styles.badge, { backgroundColor: statusColor(req.status) }]}>
                      <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 11, textTransform: 'uppercase' }}>
                        {req.status}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.divider, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]} />

                  <View style={styles.detailRow}>
                    <Text style={{ color: colors.subText, fontSize: 13, fontWeight: '600' }}>Student ID: </Text>
                    <Text style={{ color: colors.text, fontSize: 13, fontWeight: '500' }}>{req.studentId}</Text>
                  </View>

                  {req.studentEmail ? (
                    <View style={styles.detailRow}>
                      <Text style={{ color: colors.subText, fontSize: 13, fontWeight: '600' }}>Email: </Text>
                      <TouchableOpacity onPress={() => handleSendEmail(req.studentEmail)}>
                        <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' }}>{req.studentEmail}</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  {req.studentRollNumber ? (
                    <View style={styles.detailRow}>
                      <Text style={{ color: colors.subText, fontSize: 13, fontWeight: '600' }}>Roll No: </Text>
                      <Text style={{ color: colors.text, fontSize: 13, fontWeight: '500' }}>{req.studentRollNumber}</Text>
                    </View>
                  ) : null}

                  {req.cgpa ? (
                    <View style={styles.detailRow}>
                      <Text style={{ color: colors.subText, fontSize: 13, fontWeight: '600' }}>CGPA: </Text>
                      <Text style={{ color: colors.text, fontSize: 13, fontWeight: '500' }}>{req.cgpa}</Text>
                    </View>
                  ) : null}

                  {req.resumeLink && req.resumeLink !== "N/A" ? (
                    <View style={styles.detailRow}>
                      <Text style={{ color: colors.subText, fontSize: 13, fontWeight: '600' }}>Resume: </Text>
                      <TouchableOpacity onPress={() => Linking.openURL(req.resumeLink!)}>
                        <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' }}>View Document</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  {req.marksheetLink && req.marksheetLink !== "N/A" ? (
                    <View style={styles.detailRow}>
                      <Text style={{ color: colors.subText, fontSize: 13, fontWeight: '600' }}>Marksheet: </Text>
                      <TouchableOpacity onPress={() => Linking.openURL(req.marksheetLink!)}>
                        <Text style={{ color: colors.primary, fontSize: 13, fontWeight: '600', textDecorationLine: 'underline' }}>View Document</Text>
                      </TouchableOpacity>
                    </View>
                  ) : null}

                  {/* Show rejection reason if rejected */}
                  {req.status === 'REJECTED' && req.rejectionReason ? (
                    <View style={[styles.reasonBox, { backgroundColor: '#FEE2E2', borderColor: '#FECACA', borderWidth: 1 }]}>
                      <Text style={{ color: '#DC2626', fontSize: 13, fontWeight: '700' }}>
                        Rejection Reason:
                      </Text>
                      <Text style={{ color: '#DC2626', fontSize: 13, marginTop: 4, fontWeight: '500' }}>
                        {req.rejectionReason}
                      </Text>
                    </View>
                  ) : null}

                  {req.status === 'PENDING' && (
                    <View style={styles.actions}>
                      <TouchableOpacity
                        style={[styles.acceptBtn, { backgroundColor: '#16A34A' }]}
                        onPress={() => handleAccept(req.requestId)}
                        disabled={processingId === req.requestId}
                      >
                        {processingId === req.requestId ? (
                          <ActivityIndicator color="#FFF" size="small" />
                        ) : (
                          <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>Accept Request</Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.rejectBtn, { backgroundColor: '#DC2626' }]}
                        onPress={() => openRejectModal(req.requestId)}
                        disabled={processingId === req.requestId}
                      >
                        <Text style={{ color: '#FFF', fontWeight: '700', fontSize: 14 }}>Reject Request</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              ))
            )}
          </ScrollView>
        )}

        {/* Rejection Reason Modal */}
        <Modal visible={showRejectModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.border }]}>

              {/* Modal header */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Reject Request</Text>
                <TouchableOpacity onPress={() => setShowRejectModal(false)} disabled={rejectingId !== null}>
                  <Text style={{ fontSize: 20, color: colors.subText }}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.modalDivider, { backgroundColor: colors.border }]} />

              <Text style={{ color: colors.subText, marginBottom: 10, fontSize: 14 }}>
                Please provide a reason for rejection. The student will be able to see this.
              </Text>

              <TextInput
                style={[
                  styles.reasonInput,
                  {
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                    color: colors.text,
                  },
                ]}
                placeholder="Enter rejection reason..."
                placeholderTextColor={colors.subText}
                value={rejectReason}
                onChangeText={setRejectReason}
                multiline
                numberOfLines={4}
                editable={rejectingId === null}
              />

              {/* Modal buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalCancelBtn, { borderColor: colors.border, backgroundColor: colors.background }]}
                  onPress={() => setShowRejectModal(false)}
                  disabled={rejectingId !== null}
                >
                  <Text style={{ color: colors.text, fontWeight: '600', fontSize: 15 }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalRejectBtn}
                  onPress={handleRejectConfirm}
                  disabled={rejectingId !== null}
                >
                  {rejectingId !== null ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Reject</Text>
                  )}
                </TouchableOpacity>
              </View>

            </View>
          </View>
        </Modal>

      </View>
    </SafeAreaView>
  );
};

export default ReceivedRequestsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  headerTitle: { fontSize: 18, fontWeight: '700' },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backIcon: { width: 22, height: 22, resizeMode: 'contain' },

  infoBanner: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
  },

  card: {
    padding: 18,
    borderRadius: 14,
    marginBottom: 16,
    elevation: 3,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },

  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  badge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },

  divider: { height: 1, marginVertical: 12 },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },

  reasonBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
  },

  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },

  acceptBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  rejectBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  emptyBox: {
    marginTop: 80,
    alignItems: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  modalBox: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    padding: 24,
    elevation: 5,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },

  modalTitle: { fontSize: 20, fontWeight: '800' },

  modalDivider: { height: 1, marginBottom: 16 },

  reasonInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    textAlignVertical: 'top',
    minHeight: 120,
    marginBottom: 18,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },

  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },

  modalRejectBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: '#EF4444',
  },
});
