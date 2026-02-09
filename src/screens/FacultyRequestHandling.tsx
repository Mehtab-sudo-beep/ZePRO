import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  StyleSheet,
  StatusBar,
  TextInput,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';

type FacultyRequestsScreenNavigationProp = NativeStackNavigationProp< RootStackParamList,'FacultyRequests'>;

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
  const [meetingDetails, setMeetingDetails] = useState({
    date: '',
    time: '',
    venue: '',
  });

  // Handle Accept Request
  const handleAcceptRequest = (requestId: string) => {
    Alert.alert(
      'Accept Request',
      'Are you sure you want to accept this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            setRequests(requests.map(req =>
              req.id === requestId ? { ...req, status: 'accepted' } : req
            ));
            Alert.alert('Success', 'Request accepted successfully!');
            setShowDetailsModal(false);
          },
        },
      ]
    );
  };

  // Handle Reject Request
  const handleRejectRequest = (requestId: string) => {
    Alert.alert(
      'Reject Request',
      'Are you sure you want to reject this request?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: () => {
            setRequests(requests.map(req =>
              req.id === requestId ? { ...req, status: 'rejected' } : req
            ));
            Alert.alert('Success', 'Request rejected');
            setShowDetailsModal(false);
          },
        },
      ]
    );
  };

  // Handle Schedule Meeting
  const handleScheduleMeeting = () => {
    if (!meetingDetails.date || !meetingDetails.time || !meetingDetails.venue) {
      Alert.alert('Error', 'Please fill in all meeting details');
      return;
    }

    if (selectedRequest) {
      setRequests(requests.map(req =>
        req.id === selectedRequest.id
          ? { ...req, status: 'meeting_scheduled', meetingDetails }
          : req
      ));
      setShowScheduleModal(false);
      setShowDetailsModal(false);
      setMeetingDetails({ date: '', time: '', venue: '' });
      Alert.alert('Success', 'Meeting scheduled successfully!');
    }
  };

  // Open Details Modal
  const openDetailsModal = (request: StudentRequest) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  // Open Schedule Modal
  const openScheduleModal = () => {
    setShowScheduleModal(true);
  };

  // Filter requests based on status
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
    const colors: { [key: string]: string } = {
      pending: '#F59E0B',
      accepted: '#10B981',
      rejected: '#EF4444',
      meeting_scheduled: '#8B5CF6',
    };
    return colors[status] || '#6B7280';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: 'Pending',
      accepted: 'Accepted',
      rejected: 'Rejected',
      meeting_scheduled: 'Meeting Scheduled',
    };
    return labels[status] || status;
  };

 

  return (
    <SafeAreaView style={styles.container1}>
      <StatusBar barStyle="light-content" backgroundColor="#44434b" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Student Requests</Text>
          
        </View>
        <TouchableOpacity onPress={() => navigation.goBack()}>
    <Text style={styles.backButton}>Back</Text>
  </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statCardOrange]}>
            <Text style={styles.statIcon}></Text>
            <Text style={styles.statNumber}>{pendingCount}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <Text style={styles.statIcon}></Text>
            <Text style={styles.statNumber}>{acceptedCount}</Text>
            <Text style={styles.statLabel}>Accepted</Text>
          </View>
          <View style={[styles.statCard, styles.statCardPurple]}>
            <Text style={styles.statIcon}></Text>
            <Text style={styles.statNumber}>{scheduledCount}</Text>
            <Text style={styles.statLabel}>Scheduled</Text>
          </View>
        </View>

        {/* Filter Buttons */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScrollView}>
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[styles.filterButton, filterStatus === 'all' && styles.filterButtonActive]}
              onPress={() => setFilterStatus('all')}
            >
              <Text style={[styles.filterText, filterStatus === 'all' && styles.filterTextActive]}>
                All Requests
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterStatus === 'pending' && styles.filterButtonActivePending]}
              onPress={() => setFilterStatus('pending')}
            >
              <Text style={[styles.filterText, filterStatus === 'pending' && styles.filterTextActive]}>
                Pending
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterStatus === 'accepted' && styles.filterButtonActiveAccepted]}
              onPress={() => setFilterStatus('accepted')}
            >
              <Text style={[styles.filterText, filterStatus === 'accepted' && styles.filterTextActive]}>
                Accepted
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterStatus === 'meeting_scheduled' && styles.filterButtonActiveScheduled]}
              onPress={() => setFilterStatus('meeting_scheduled')}
            >
              <Text style={[styles.filterText, filterStatus === 'meeting_scheduled' && styles.filterTextActive]}>
                Scheduled
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.filterButton, filterStatus === 'rejected' && styles.filterButtonActiveRejected]}
              onPress={() => setFilterStatus('rejected')}
            >
              <Text style={[styles.filterText, filterStatus === 'rejected' && styles.filterTextActive]}>
                Rejected
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Requests List */}
        <View style={styles.requestsList}>
          {filteredRequests.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📭</Text>
              <Text style={styles.emptyText}>No requests found</Text>
            </View>
          ) : (
            filteredRequests.map(request => (
              <TouchableOpacity
                key={request.id}
                style={styles.requestCard}
                onPress={() => openDetailsModal(request)}
              >
                <View style={styles.requestHeader}>
                  <View style={styles.studentAvatar}>
                    <Text style={styles.studentAvatarText}>{request.studentName.charAt(0)}</Text>
                  </View>
                  <View style={styles.requestInfo}>
                    <Text style={styles.studentName}>{request.studentName}</Text>
                    <Text style={styles.studentRoll}>{request.studentRollNo}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(request.status) + '20' },
                    ]}
                  >
                    <Text style={[styles.statusText, { color: getStatusColor(request.status) }]}>
                      {getStatusLabel(request.status)}
                    </Text>
                  </View>
                </View>

                <Text style={styles.requestSubject}>{request.subject}</Text>
                <Text style={styles.requestMessage} numberOfLines={2}>
                  {request.message}
                </Text>

                <View style={styles.requestFooter}>
                  <View style={styles.requestTypeBadge}>
                    <Text style={styles.requestTypeText}>{getRequestTypeLabel(request.requestType)}</Text>
                  </View>
                  <Text style={styles.requestDate}>{request.requestDate}</Text>
                </View>

                {request.status === 'meeting_scheduled' && request.meetingDetails && (
                  <View style={styles.meetingInfo}>
                    <Text style={styles.meetingInfoTitle}>Meeting Details:</Text>
                    <Text style={styles.meetingInfoText}>
                      {request.meetingDetails.date} at {request.meetingDetails.time}
                    </Text>
                    <Text style={styles.meetingInfoText}>📍{request.meetingDetails.venue}</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
      {/* Student Details Modal */}
      <Modal
        visible={showDetailsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowDetailsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Request Details</Text>
                <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                  <Text style={styles.closeButton}>✖️</Text>
                </TouchableOpacity>
              </View>

              {selectedRequest && (
                <>
                  {/* Student Details */}
                  <View style={styles.detailsSection}>
                    <Text style={styles.sectionTitle}>Student Information</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Name:</Text>
                      <Text style={styles.detailValue}>{selectedRequest.studentName}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Roll No:</Text>
                      <Text style={styles.detailValue}>{selectedRequest.studentRollNo}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Email:</Text>
                      <Text style={styles.detailValue}>{selectedRequest.studentEmail}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Phone:</Text>
                      <Text style={styles.detailValue}>{selectedRequest.studentPhone}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Department:</Text>
                      <Text style={styles.detailValue}>{selectedRequest.studentDepartment}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Year:</Text>
                      <Text style={styles.detailValue}>{selectedRequest.studentYear}</Text>
                    </View>
                  </View>

                  {/* Request Details */}
                  <View style={styles.detailsSection}>
                    <Text style={styles.sectionTitle}>Request Information</Text>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Type:</Text>
                      <Text style={styles.detailValue}>{getRequestTypeLabel(selectedRequest.requestType)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Date:</Text>
                      <Text style={styles.detailValue}>{selectedRequest.requestDate}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status:</Text>
                      <View
                        style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(selectedRequest.status) + '20' },
                        ]}
                      >
                        <Text style={[styles.statusText, { color: getStatusColor(selectedRequest.status) }]}>
                          {getStatusLabel(selectedRequest.status)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Subject and Message */}
                  <View style={styles.detailsSection}>
                    <Text style={styles.sectionTitle}>Message</Text>
                    <Text style={styles.requestSubjectModal}>{selectedRequest.subject}</Text>
                    <Text style={styles.requestMessageModal}>{selectedRequest.message}</Text>
                  </View>

                  {/* Meeting Details if scheduled */}
                  {selectedRequest.status === 'meeting_scheduled' && selectedRequest.meetingDetails && (
                    <View style={styles.detailsSection}>
                      <Text style={styles.sectionTitle}>Meeting Details</Text>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Date:</Text>
                        <Text style={styles.detailValue}>{selectedRequest.meetingDetails.date}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Time:</Text>
                        <Text style={styles.detailValue}>{selectedRequest.meetingDetails.time}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Venue:</Text>
                        <Text style={styles.detailValue}>{selectedRequest.meetingDetails.venue}</Text>
                      </View>
                    </View>
                  )}

                  {/* Action Buttons */}
                  {selectedRequest.status === 'pending' && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.rejectButton}
                        onPress={() => handleRejectRequest(selectedRequest.id)}
                      >
                        <Text style={styles.rejectButtonText}>Reject</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleAcceptRequest(selectedRequest.id)}
                      >
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.scheduleButton}
                        onPress={openScheduleModal}
                      >
                        <Text style={styles.scheduleButtonText}>Schedule</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Schedule Meeting Modal */}
      <Modal
        visible={showScheduleModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowScheduleModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Schedule Meeting</Text>
              <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                <Text style={styles.closeButton}>✖️</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Meeting Date (e.g., 2024-02-15)"
              value={meetingDetails.date}
              onChangeText={text => setMeetingDetails({ ...meetingDetails, date: text })}
              placeholderTextColor="#9CA3AF"
            />

            <TextInput
              style={styles.input}
              placeholder="Meeting Time (e.g., 2:00 PM)"
              value={meetingDetails.time}
              onChangeText={text => setMeetingDetails({ ...meetingDetails, time: text })}
              placeholderTextColor="#9CA3AF"
            />

            <TextInput
              style={styles.input}
              placeholder="Venue (e.g., CS Dept, Room 304)"
              value={meetingDetails.venue}
              onChangeText={text => setMeetingDetails({ ...meetingDetails, venue: text })}
              placeholderTextColor="#9CA3AF"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  setShowScheduleModal(false);
                  setMeetingDetails({ date: '', time: '', venue: '' });
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={handleScheduleMeeting}>
                <Text style={styles.submitButtonText}>Schedule Meeting</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  backButton: {
  fontSize: 18,
  color: '#2563EB',
},

  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  header: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between', 
  paddingHorizontal: 16,
  height: 60,
  backgroundColor: '#FFFFFF',
  elevation: 4,
},

  headerTitle: {
    fontSize: 22,
    
    fontWeight: '500',
    color: '#000000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: '#6366F1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statCardOrange: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
  },
  statCardGreen: {
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  statCardPurple: {
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  filterScrollView: {
    maxHeight: 100,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  filterButton: {
    backgroundColor: '#E5E7EB',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#585861',
  },
  filterButtonActivePending: {
    backgroundColor: '#585861',
  },
  filterButtonActiveAccepted: {
    backgroundColor: '#585861',
  },
  filterButtonActiveScheduled: {
    backgroundColor: '#585861',
  },
  filterButtonActiveRejected: {
    backgroundColor: '#585861',
  },
  filterText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  requestsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  requestCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#565665',
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentAvatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  requestInfo: {
    marginLeft: 12,
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  studentRoll: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  requestSubject: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  requestMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 12,
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  requestTypeBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  requestTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#070901',
  },
  requestDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  container1: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  meetingInfo: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
  },
  meetingInfoTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 6,
  },
  meetingInfoText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 500,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  closeButton: {
    fontSize: 20,
    color: '#6B7280',
  },
  detailsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    width: 100,
  },
  detailValue: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  requestSubjectModal: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  requestMessageModal: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 22,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  rejectButton: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rejectButtonText: {
    color: '#010000',
    fontWeight: '600',
    fontSize: 14,
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#D1FAE5',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  acceptButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 14,
  },
  scheduleButton: {
    flex: 1,
    backgroundColor: '#EDE9FE',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  scheduleButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 16,
    color: '#1F2937',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    flex: 1,
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default FacultyRequestsScreen;