import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  StyleSheet,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../theme/ThemeContext';

type FacultyRequestsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'FacultyRequests'>;

interface Props {
  navigation: FacultyRequestsScreenNavigationProp;
}

interface StudentRequest {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentRollNo: string;
  studentDepartment: string;
  studentYear: string;
  studentPhone: string;
  requestType: 'project_guidance' | 'internship' | 'research' | 'general';
  subject: string;
  message: string;
  requestDate: string;
  status: 'pending' | 'accepted' | 'rejected' | 'meeting_scheduled';
  meetingDetails?: {
    date: string;
    time: string;
    venue: string;
  };
}

const FacultyRequestsScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useContext(ThemeContext);

  const [requests, setRequests] = useState<StudentRequest[]>([
    {
      id: '1',
      studentId: 'S001',
      studentName: 'John Doe',
      studentEmail: 'john.d@student.edu',
      studentRollNo: 'CS2021001',
      studentDepartment: 'Computer Science',
      studentYear: '3rd Year',
      studentPhone: '+91 98765 43210',
      requestType: 'project_guidance',
      subject: 'Request for Final Year Project Guidance',
      message: 'Hello Professor, I am interested in working on Machine Learning projects. Would you be available to guide me for my final year project?',
      requestDate: '2024-02-05',
      status: 'pending',
    },
    {
      id: '2',
      studentId: 'S002',
      studentName: 'Jane Smith',
      studentEmail: 'jane.s@student.edu',
      studentRollNo: 'CS2021045',
      studentDepartment: 'Computer Science',
      studentYear: '2nd Year',
      studentPhone: '+91 98765 43211',
      requestType: 'internship',
      subject: 'Internship Recommendation Request',
      message: 'Dear Sir, I am applying for summer internships and would appreciate if you could provide a recommendation letter.',
      requestDate: '2024-02-06',
      status: 'pending',
    },
    {
      id: '3',
      studentId: 'S003',
      studentName: 'Mike Johnson',
      studentEmail: 'mike.j@student.edu',
      studentRollNo: 'CS2020012',
      studentDepartment: 'Computer Science',
      studentYear: '4th Year',
      studentPhone: '+91 98765 43212',
      requestType: 'research',
      subject: 'Research Collaboration Opportunity',
      message: 'I have been reading your recent publications on AI and would like to collaborate on research.',
      requestDate: '2024-02-04',
      status: 'accepted',
    },
    {
      id: '4',
      studentId: 'S004',
      studentName: 'Sarah Williams',
      studentEmail: 'sarah.w@student.edu',
      studentRollNo: 'CS2021089',
      studentDepartment: 'Computer Science',
      studentYear: '3rd Year',
      studentPhone: '+91 98765 43213',
      requestType: 'general',
      subject: 'Doubt Clarification - Database Systems',
      message: 'Hello Professor, I have some doubts regarding normalization concepts from last lecture.',
      requestDate: '2024-02-07',
      status: 'meeting_scheduled',
      meetingDetails: {
        date: '2024-02-10',
        time: '2:00 PM',
        venue: 'CS Department, Room 304',
      },
    },
  ]);

  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'accepted' | 'rejected' | 'meeting_scheduled'>('all');
  const [selectedRequest, setSelectedRequest] = useState<StudentRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState({ date: '', time: '', venue: '' });

  const handleAcceptRequest = (requestId: string) => {
    Alert.alert('Accept Request', 'Are you sure you want to accept this request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Accept',
        onPress: () => {
          setRequests(requests.map(req => req.id === requestId ? { ...req, status: 'accepted' } : req));
          Alert.alert('Success', 'Request accepted successfully!');
          setShowDetailsModal(false);
        },
      },
    ]);
  };

  const handleRejectRequest = (requestId: string) => {
    Alert.alert('Reject Request', 'Are you sure you want to reject this request?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: () => {
          setRequests(requests.map(req => req.id === requestId ? { ...req, status: 'rejected' } : req));
          Alert.alert('Success', 'Request rejected');
          setShowDetailsModal(false);
        },
      },
    ]);
  };

  const handleScheduleMeeting = () => {
    if (!meetingDetails.date || !meetingDetails.time || !meetingDetails.venue) {
      Alert.alert('Error', 'Please fill in all meeting details');
      return;
    }
    if (selectedRequest) {
      setRequests(requests.map(req =>
        req.id === selectedRequest.id ? { ...req, status: 'meeting_scheduled', meetingDetails } : req
      ));
      setShowScheduleModal(false);
      setShowDetailsModal(false);
      setMeetingDetails({ date: '', time: '', venue: '' });
      Alert.alert('Success', 'Meeting scheduled successfully!');
    }
  };

  const filteredRequests = requests.filter(req =>
    filterStatus === 'all' ? true : req.status === filterStatus
  );

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const acceptedCount = requests.filter(r => r.status === 'accepted').length;
  const scheduledCount = requests.filter(r => r.status === 'meeting_scheduled').length;

  const getRequestTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      project_guidance: 'Project Guidance',
      internship: 'Internship',
      research: 'Research',
      general: 'General Query',
    };
    return labels[type] || type;
  };

  const getStatusColor = (status: string) => {
    const map: { [key: string]: string } = {
      pending: '#F59E0B',
      accepted: '#10B981',
      rejected: '#EF4444',
      meeting_scheduled: '#8B5CF6',
    };
    return map[status] || '#6B7280';
  };

  const getStatusLabel = (status: string) => {
    const map: { [key: string]: string } = {
      pending: 'Pending',
      accepted: 'Accepted',
      rejected: 'Rejected',
      meeting_scheduled: 'Meeting Scheduled',
    };
    return map[status] || status;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Student Requests</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: colors.primary }]}>Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }}>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card }, styles.statCardOrange]}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{pendingCount}</Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }, styles.statCardGreen]}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{acceptedCount}</Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>Accepted</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }, styles.statCardPurple]}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{scheduledCount}</Text>
            <Text style={[styles.statLabel, { color: colors.subText }]}>Scheduled</Text>
          </View>
        </View>

        {/* Filter Buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          <View style={styles.filterContainer}>
            {(['all', 'pending', 'accepted', 'meeting_scheduled', 'rejected'] as const).map(f => (
              <TouchableOpacity
                key={f}
                style={[
                  styles.filterButton,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  filterStatus === f && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setFilterStatus(f)}
              >
                <Text style={[
                  styles.filterText,
                  { color: colors.subText },
                  filterStatus === f && { color: '#FFFFFF' },
                ]}>
                  {f === 'all' ? 'All' : f === 'meeting_scheduled' ? 'Scheduled' : f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        {/* Requests List */}
        <View style={styles.requestsList}>
          {filteredRequests.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyText, { color: colors.subText }]}>No requests found</Text>
            </View>
          ) : (
            filteredRequests.map(request => (
              <TouchableOpacity
                key={request.id}
                style={[styles.requestCard, { backgroundColor: colors.card }]}
                onPress={() => { setSelectedRequest(request); setShowDetailsModal(true); }}
              >
                <View style={styles.requestHeader}>
                  <View style={[styles.studentAvatar, { backgroundColor: colors.primary }]}>
                    <Text style={styles.studentAvatarText}>{request.studentName.charAt(0)}</Text>
                  </View>
                  <View style={styles.requestInfo}>
                    <Text style={[styles.studentName, { color: colors.text }]}>{request.studentName}</Text>
                    <Text style={[styles.studentRoll, { color: colors.subText }]}>{request.studentRollNo}</Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                      {getStatusLabel(request.status)}
                    </Text>
                  </View>
                </View>

                <Text style={[styles.requestSubject, { color: colors.text }]}>{request.subject}</Text>
                <Text style={[styles.requestMessage, { color: colors.subText }]} numberOfLines={2}>
                  {request.message}
                </Text>

                <View style={styles.requestFooter}>
                  <View style={[styles.requestTypeBadge, { backgroundColor: colors.primary + '18' }]}>
                    <Text style={[styles.requestTypeText, { color: colors.primary }]}>
                      {getRequestTypeLabel(request.requestType)}
                    </Text>
                  </View>
                  <Text style={[styles.requestDate, { color: colors.subText }]}>{request.requestDate}</Text>
                </View>

                {request.status === 'meeting_scheduled' && request.meetingDetails && (
                  <View style={[styles.meetingInfo, { backgroundColor: colors.background }]}>
                    <Text style={[styles.meetingInfoTitle, { color: colors.text }]}>Meeting Details:</Text>
                    <Text style={[styles.meetingInfoText, { color: colors.subText }]}>
                      {request.meetingDetails.date} at {request.meetingDetails.time}
                    </Text>
                    <Text style={[styles.meetingInfoText, { color: colors.subText }]}>
                      {request.meetingDetails.venue}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* ── Details Modal ── */}
      <Modal visible={showDetailsModal} transparent animationType="slide" onRequestClose={() => setShowDetailsModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <ScrollView showsVerticalScrollIndicator={false}>

              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Request Details</Text>
                <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                  <Text style={[styles.closeButton, { color: colors.subText }]}>✕</Text>
                </TouchableOpacity>
              </View>

              {selectedRequest && (
                <>
                  {/* Student Info */}
                  <View style={styles.detailsSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Student Information</Text>
                    {[
                      ['Name', selectedRequest.studentName],
                      ['Roll No', selectedRequest.studentRollNo],
                      ['Email', selectedRequest.studentEmail],
                      ['Phone', selectedRequest.studentPhone],
                      ['Department', selectedRequest.studentDepartment],
                      ['Year', selectedRequest.studentYear],
                    ].map(([label, value]) => (
                      <View key={label} style={[styles.detailRow, { borderColor: colors.border }]}>
                        <Text style={[styles.detailLabel, { color: colors.subText }]}>{label}:</Text>
                        <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
                      </View>
                    ))}
                  </View>

                  {/* Request Info */}
                  <View style={styles.detailsSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Request Information</Text>
                    <View style={[styles.detailRow, { borderColor: colors.border }]}>
                      <Text style={[styles.detailLabel, { color: colors.subText }]}>Type:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>{getRequestTypeLabel(selectedRequest.requestType)}</Text>
                    </View>
                    <View style={[styles.detailRow, { borderColor: colors.border }]}>
                      <Text style={[styles.detailLabel, { color: colors.subText }]}>Date:</Text>
                      <Text style={[styles.detailValue, { color: colors.text }]}>{selectedRequest.requestDate}</Text>
                    </View>
                    <View style={[styles.detailRow, { borderColor: colors.border }]}>
                      <Text style={[styles.detailLabel, { color: colors.subText }]}>Status:</Text>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedRequest.status) + '20' }]}>
                        <Text style={[styles.statusText, { color: getStatusColor(selectedRequest.status) }]}>
                          {getStatusLabel(selectedRequest.status)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Message */}
                  <View style={styles.detailsSection}>
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Message</Text>
                    <Text style={[styles.requestSubject, { color: colors.text, marginBottom: 6 }]}>{selectedRequest.subject}</Text>
                    <Text style={[styles.requestMessage, { color: colors.subText }]}>{selectedRequest.message}</Text>
                  </View>

                  {/* Meeting Details */}
                  {selectedRequest.status === 'meeting_scheduled' && selectedRequest.meetingDetails && (
                    <View style={styles.detailsSection}>
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>Meeting Details</Text>
                      {[
                        ['Date', selectedRequest.meetingDetails.date],
                        ['Time', selectedRequest.meetingDetails.time],
                        ['Venue', selectedRequest.meetingDetails.venue],
                      ].map(([label, value]) => (
                        <View key={label} style={[styles.detailRow, { borderColor: colors.border }]}>
                          <Text style={[styles.detailLabel, { color: colors.subText }]}>{label}:</Text>
                          <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Action Buttons */}
                  {selectedRequest.status === 'pending' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#FEE2E2' }]}
                        onPress={() => handleRejectRequest(selectedRequest.id)}
                      >
                        <Text style={[styles.actionBtnText, { color: '#DC2626' }]}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#D1FAE5' }]}
                        onPress={() => handleAcceptRequest(selectedRequest.id)}
                      >
                        <Text style={[styles.actionBtnText, { color: '#059669' }]}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: '#EDE9FE' }]}
                        onPress={() => setShowScheduleModal(true)}
                      >
                        <Text style={[styles.actionBtnText, { color: '#7C3AED' }]}>Schedule</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── Schedule Meeting Modal ── */}
      <Modal visible={showScheduleModal} transparent animationType="slide" onRequestClose={() => setShowScheduleModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Schedule Meeting</Text>
              <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                <Text style={[styles.closeButton, { color: colors.subText }]}>✕</Text>
              </TouchableOpacity>
            </View>

            {[
              { placeholder: 'Meeting Date (e.g., 2024-02-15)', key: 'date' },
              { placeholder: 'Meeting Time (e.g., 2:00 PM)', key: 'time' },
              { placeholder: 'Venue (e.g., CS Dept, Room 304)', key: 'venue' },
            ].map(field => (
              <TextInput
                key={field.key}
                style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                placeholder={field.placeholder}
                placeholderTextColor={colors.subText}
                value={meetingDetails[field.key as keyof typeof meetingDetails]}
                onChangeText={text => setMeetingDetails({ ...meetingDetails, [field.key]: text })}
              />
            ))}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.cancelBtn2, { borderColor: colors.border }]}
                onPress={() => { setShowScheduleModal(false); setMeetingDetails({ date: '', time: '', venue: '' }); }}
              >
                <Text style={[styles.cancelBtnText, { color: colors.subText }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                onPress={handleScheduleMeeting}
              >
                <Text style={styles.submitBtnText}>Schedule</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 4,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 20, fontWeight: '500' },
  backButton: { fontSize: 16, fontWeight: '600' },

  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  statCardOrange: { borderLeftWidth: 4, borderLeftColor: '#F59E0B' },
  statCardGreen: { borderLeftWidth: 4, borderLeftColor: '#10B981' },
  statCardPurple: { borderLeftWidth: 4, borderLeftColor: '#8B5CF6' },
  statNumber: { fontSize: 30, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 4, fontWeight: '500' },

  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  filterText: { fontWeight: '600', fontSize: 13 },

  requestsList: { paddingHorizontal: 16, paddingBottom: 20 },

  emptyState: {
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyText: { fontSize: 16 },

  requestCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
  },
  requestHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  studentAvatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentAvatarText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  requestInfo: { marginLeft: 12, flex: 1 },
  studentName: { fontSize: 15, fontWeight: '700' },
  studentRoll: { fontSize: 13, marginTop: 2 },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '600' },

  requestSubject: { fontSize: 15, fontWeight: '600', marginBottom: 6 },
  requestMessage: { fontSize: 14, lineHeight: 20, marginBottom: 10 },

  requestFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  requestTypeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  requestTypeText: { fontSize: 12, fontWeight: '600' },
  requestDate: { fontSize: 12 },

  meetingInfo: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  meetingInfoTitle: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  meetingInfoText: { fontSize: 12, marginBottom: 2 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  closeButton: { fontSize: 20 },

  detailsSection: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
  },
  detailLabel: { fontSize: 13, fontWeight: '600', width: 100 },
  detailValue: { fontSize: 13, flex: 1 },

  actionButtons: { flexDirection: 'row', gap: 8, marginTop: 10 },
  actionBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  actionBtnText: { fontWeight: '700', fontSize: 14 },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    marginBottom: 14,
  },
  modalButtons: { flexDirection: 'row', gap: 12, marginTop: 4 },
  cancelBtn2: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelBtnText: { fontSize: 15, fontWeight: '600' },
  submitBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitBtnText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
});

export default FacultyRequestsScreen;