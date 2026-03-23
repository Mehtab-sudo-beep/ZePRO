import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  TextInput,
  Modal,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
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
}

const ReceivedRequestsScreen: React.FC = () => {

  const navigation = useNavigation<any>();
  const { colors } = useContext(ThemeContext);
  const { showAlert } = useContext(AlertContext);
  const isDark = colors.background === '#111827';

  const [requests, setRequests] = useState<Request[]>([]);

  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const loadRequests = async () => {
    try {
      const studentId = await AsyncStorage.getItem('studentId');
      const res = await getReceivedRequests(Number(studentId));
      if (Array.isArray(res.data)) {
        setRequests(res.data);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.log('RECEIVED REQUEST ERROR:', err);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleAccept = async (id: number) => {
    try {
      await approveRequest(id);
      loadRequests();
      showAlert('Accepted', 'Student has been added to your team.');
    } catch (err) {
      console.log('APPROVE ERROR:', err);
      showAlert('Error', 'Failed to accept request.');
    }
  };

  const openRejectModal = (id: number) => {
    setRejectTargetId(id);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      showAlert('Required', 'Please enter a reason for rejection.');
      return;
    }
    try {
      await rejectRequest(rejectTargetId!, rejectReason.trim());
      setShowRejectModal(false);
      setRejectTargetId(null);
      setRejectReason('');
      loadRequests();
      showAlert('Rejected', 'Request has been rejected with feedback.');
    } catch (err) {
      console.log('REJECT ERROR:', err);
      showAlert('Error', 'Failed to reject request.');
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
            <Text style={{ color: colors.subText, fontSize: 12 }}>
              {pendingCount} pending
            </Text>
          </View>
        </View>

        {/* Cards */}
        <ScrollView contentContainerStyle={{ padding: 16 }}>

          {requests.length === 0 ? (
            <View style={styles.emptyBox}>
              <Text style={{ color: colors.subText, fontSize: 16 }}>No requests yet</Text>
            </View>
          ) : (
            requests.map((req) => (
              <View
                key={req.requestId}
                style={[styles.card, { backgroundColor: colors.card }]}
              >
                <View style={styles.cardRow}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>
                    {req.studentName}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: statusColor(req.status) + '20' }]}>
                    <Text style={{ color: statusColor(req.status), fontWeight: '600', fontSize: 12 }}>
                      {req.status}
                    </Text>
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: colors.border }]} />

                <Text style={{ color: colors.subText, fontSize: 13 }}>
                  Student ID: {req.studentId}
                </Text>

                {/* Show rejection reason if rejected */}
                {req.status === 'REJECTED' && req.rejectionReason ? (
                  <View style={[styles.reasonBox, { backgroundColor: '#FEE2E2' }]}>
                    <Text style={{ color: '#DC2626', fontSize: 13, fontWeight: '600' }}>
                      Reason:
                    </Text>
                    <Text style={{ color: '#DC2626', fontSize: 13, marginTop: 2 }}>
                      {req.rejectionReason}
                    </Text>
                  </View>
                ) : null}

                {req.status === 'PENDING' && (
                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.acceptBtn}
                      onPress={() => handleAccept(req.requestId)}
                    >
                      <Text style={{ color: '#16A34A', fontWeight: '600' }}>Accept</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.rejectBtn}
                      onPress={() => openRejectModal(req.requestId)}
                    >
                      <Text style={{ color: '#DC2626', fontWeight: '600' }}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>

        {/* Rejection Reason Modal */}
        <Modal visible={showRejectModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.modalBox, { backgroundColor: colors.card, borderColor: colors.border }]}>

              {/* Modal header */}
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Reject Request</Text>
                <TouchableOpacity onPress={() => setShowRejectModal(false)}>
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
              />

              {/* Modal buttons */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                  onPress={() => setShowRejectModal(false)}
                >
                  <Text style={{ color: colors.subText, fontWeight: '600', fontSize: 15 }}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalRejectBtn}
                  onPress={handleRejectConfirm}
                >
                  <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>Reject</Text>
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

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },

  backIcon: { width: 22, height: 22, resizeMode: 'contain' },

  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },

  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },

  divider: {
    height: 1,
    marginVertical: 10,
  },

  reasonBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
  },

  actions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 12,
  },

  acceptBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#16A34A',
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
  },

  rejectBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#DC2626',
    padding: 10,
    alignItems: 'center',
    borderRadius: 8,
  },

  emptyBox: {
    marginTop: 80,
    alignItems: 'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },

  modalBox: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    elevation: 5,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  modalDivider: {
    height: 1,
    marginBottom: 14,
  },

  reasonInput: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    textAlignVertical: 'top',
    minHeight: 100,
    marginBottom: 16,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },

  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
  },

  modalRejectBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#EF4444',
  },
});
