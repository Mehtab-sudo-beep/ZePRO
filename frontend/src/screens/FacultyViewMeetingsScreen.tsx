import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../theme/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import {
  getAllMeetings,
  cancelMeeting,
  completeMeeting,
  acceptProject,
  rejectProject
} from '../api/facultyApi';
interface Meeting {
  id: string;
  title: string;
  faculty: string;
  projectName: string;
  domain: string;
  subDomain: string;
  location: string;
  date: string;
  time: string;
  members: string[];
  status: 'upcoming' | 'completed' | 'cancelled';
}
import { AlertContext } from '../context/AlertContext';
const FacultyViewMeetingsScreen: React.FC = () => {
  const { colors } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const navigation = useNavigation<any>();

  const [meetings, setMeetings] = useState<any[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<any>>({});
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  React.useEffect(() => {
    if (user?.token) {
      loadMeetings();
    }
  }, [user?.token]);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const data = await getAllMeetings(user.token);
      setMeetings(data || []);
    } catch (err) {
      console.log('Error loading meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredMeetings = meetings.filter(m => {
    const s = m.status?.toLowerCase() || 'scheduled';
    const rs = m.requestStatus?.toLowerCase() || '';
    if (activeFilter === 'all') return true;
    if (activeFilter === 'upcoming') return s === 'scheduled' || s === 'pending';
    if (activeFilter === 'completed') return s === 'done' || s === 'completed' || rs === 'accepted' || rs === 'rejected';
    if (activeFilter === 'cancelled') return s === 'cancelled';
    return true;
  }).sort((a, b) => {
    if (!a.meetingTime || !b.meetingTime) return 0;
    const timeA = new Date(a.meetingTime).getTime();
    const timeB = new Date(b.meetingTime).getTime();
    return activeFilter === 'upcoming' ? timeA - timeB : timeB - timeA;
  });

  const openDetail = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setShowDetailModal(true);
  };

  const openEdit = (meeting: Meeting) => {
    setSelectedMeeting(meeting);
    setEditForm({
      title: meeting.title,
      location: meeting.location,
      date: meeting.date,
      time: meeting.time,
      projectName: meeting.projectName,
      domain: meeting.domain,
      subDomain: meeting.subDomain,
    });
    setShowDetailModal(false);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editForm.date || !editForm.time || !editForm.location || !editForm.title) {
      showAlert('Error', 'Please fill in all required fields');
      return;
    }
    setMeetings(meetings.map(m =>
      m.id === selectedMeeting?.id ? { ...m, ...editForm } : m
    ));
    setShowEditModal(false);
    setSelectedMeeting(null);
    showAlert('Success', 'Meeting updated successfully!');
  };

  const handleCancelMeeting = (meeting: any) => {
    showAlert(
      'Cancel Meeting',
      `Are you sure you want to cancel "${meeting.title || 'this meeting'}"?`,
      [
        { text: 'No', style: 'cancel', onPress: () => { } },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelMeeting(meeting.meetingId, user.token);
              loadMeetings();
              setShowDetailModal(false);
              showAlert('Done', 'Meeting has been cancelled.');
            } catch (err) {
              showAlert('Error', 'Could not cancel meeting');
            }
          },
        },
      ]
    );
  };

  const statusColor = (statusRaw: string) => {
    const s = (statusRaw || '').toLowerCase();
    if (s === 'scheduled' || s === 'pending') return { bg: '#D1FAE5', text: '#059669' };
    if (s === 'done' || s === 'completed') return { bg: '#DBEAFE', text: '#2563EB' };
    if (s === 'accepted') return { bg: '#EDE9FE', text: '#7C3AED' };
    if (s === 'rejected') return { bg: '#FEF3C7', text: '#D97706' };
    return { bg: '#FEE2E2', text: '#DC2626' }; // cancelled
  };

  /* ── Detail Modal ─────────────────────────────────────── */
  const renderDetailModal = () => {
    if (!selectedMeeting) return null;
    const sc = statusColor(selectedMeeting.status);
    return (
      <Modal visible={showDetailModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>

            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Meeting Details
              </Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Text style={[styles.closeBtn, { color: colors.subText }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Status Badge */}
              <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                <Text style={[styles.statusText, { color: sc.text }]}>
                  {selectedMeeting.status.toUpperCase()}
                </Text>
              </View>

              <Text style={[styles.detailMainTitle, { color: colors.text }]}>
                {selectedMeeting.title}
              </Text>

              <DetailRow label="Project" value={selectedMeeting.projectTitle || 'N/A'} colors={colors} />
              <DetailRow label="Domain" value={selectedMeeting.domain || 'N/A'} colors={colors} />
              <DetailRow label="SubDomain" value={selectedMeeting.subDomain || 'N/A'} colors={colors} />
              <DetailRow label="Location" value={selectedMeeting.location || 'Online'} colors={colors} />
              <DetailRow label="Date" value={selectedMeeting.meetingTime ? new Date(selectedMeeting.meetingTime).toLocaleDateString() : 'TBD'} colors={colors} />
              <DetailRow label="Time" value={selectedMeeting.meetingTime ? new Date(selectedMeeting.meetingTime).toLocaleTimeString() : 'TBD'} colors={colors} />
              <DetailRow label="Link" value={selectedMeeting.meetingLink || 'N/A'} colors={colors} />

              {/* Action Buttons */}
              {(selectedMeeting.status === 'SCHEDULED' || selectedMeeting.status === 'PENDING') && (
                <View style={styles.actionColumn}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => openEdit(selectedMeeting)}
                  >
                    <Text style={styles.actionBtnText}>Edit / Reschedule</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
                    onPress={async () => {
                      try {
                        await completeMeeting(selectedMeeting.meetingId, user.token);
                        loadMeetings();
                        setShowDetailModal(false);
                        showAlert('Success', 'Meeting marked as completed');
                      } catch (err) {
                        showAlert('Error', 'Failed to mark meeting as done');
                      }
                    }}
                  >
                    <Text style={styles.actionBtnText}>Mark as Done</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtnOutline, { borderColor: '#EF4444' }]}
                    onPress={() => handleCancelMeeting(selectedMeeting)}
                  >
                    <Text style={[styles.actionBtnOutlineText, { color: '#EF4444' }]}>Cancel Meeting</Text>
                  </TouchableOpacity>
                </View>
              )}
              {/* ✅ ACCEPT / REJECT — only when DONE and not yet decided */}
              {selectedMeeting.status === 'DONE' &&
                selectedMeeting.requestStatus !== 'ACCEPTED' &&
                selectedMeeting.requestStatus !== 'REJECTED' && (
                  <View style={styles.actionColumn}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
                      onPress={async () => {
                        try {
                          await acceptProject(selectedMeeting.requestId, user.token);
                          loadMeetings();
                          setShowDetailModal(false);
                          showAlert('Success', 'Project Assigned');
                        } catch (err) {
                          showAlert('Error', 'Accept failed');
                        }
                      }}
                    >
                      <Text style={styles.actionBtnText}>Accept Project</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionBtnOutline, { borderColor: '#EF4444' }]}
                      onPress={async () => {
                        try {
                          await rejectProject(selectedMeeting.requestId, user.token);
                          loadMeetings();
                          setShowDetailModal(false);
                          showAlert('Done', 'Project Rejected');
                        } catch (err) {
                          showAlert('Error', 'Reject failed');
                        }
                      }}
                    >
                      <Text style={[styles.actionBtnOutlineText, { color: '#EF4444' }]}>Reject Project</Text>
                    </TouchableOpacity>
                  </View>
                )}

              {/* 🔒 Read-only outcome banner — shown once decision is final */}
              {(selectedMeeting.requestStatus === 'ACCEPTED' ||
                selectedMeeting.requestStatus === 'REJECTED') && (
                  <View style={{
                    marginTop: 24,
                    padding: 14,
                    borderRadius: 12,
                    alignItems: 'center',
                    backgroundColor: selectedMeeting.requestStatus === 'ACCEPTED' ? '#EDE9FE' : '#FEF3C7',
                  }}>
                    <Text style={{
                      fontWeight: '700',
                      fontSize: 15,
                      color: selectedMeeting.requestStatus === 'ACCEPTED' ? '#7C3AED' : '#D97706',
                    }}>
                      {selectedMeeting.requestStatus === 'ACCEPTED'
                        ? '✅ Project has been Accepted'
                        : '❌ Project has been Rejected'}
                    </Text>
                  </View>
                )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  /* ── Edit / Reschedule Modal ──────────────────────────── */
  const renderEditModal = () => (
    <Modal visible={showEditModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Edit / Reschedule
            </Text>
            <TouchableOpacity onPress={() => setShowEditModal(false)}>
              <Text style={[styles.closeBtn, { color: colors.subText }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <EditField
              label="Meeting Title"
              value={editForm.title || ''}
              onChangeText={v => setEditForm({ ...editForm, title: v })}
              colors={colors}
            />
            <EditField
              label="Location"
              value={editForm.location || ''}
              onChangeText={v => setEditForm({ ...editForm, location: v })}
              colors={colors}
            />

            {/* Reschedule Section */}
            <View style={[styles.rescheduleBox, { borderColor: colors.primary + '44', backgroundColor: colors.primary + '0D' }]}>
              <Text style={[styles.rescheduleLabel, { color: colors.primary }]}>
                Reschedule
              </Text>
              <EditField
                label="New Date  (YYYY-MM-DD)"
                value={editForm.date || ''}
                onChangeText={v => setEditForm({ ...editForm, date: v })}
                colors={colors}
                placeholder="e.g. 2025-03-15"
              />
              <EditField
                label="New Time"
                value={editForm.time || ''}
                onChangeText={v => setEditForm({ ...editForm, time: v })}
                colors={colors}
                placeholder="e.g. 02:30 PM"
              />
            </View>

            <EditField
              label="Domain"
              value={editForm.domain || ''}
              onChangeText={v => setEditForm({ ...editForm, domain: v })}
              colors={colors}
            />
            <EditField
              label="Sub-Domain"
              value={editForm.subDomain || ''}
              onChangeText={v => setEditForm({ ...editForm, subDomain: v })}
              colors={colors}
            />

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveBtn, { backgroundColor: colors.primary }]}
              onPress={handleSaveEdit}
            >
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.discardBtn, { borderColor: colors.border }]}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={[styles.discardBtnText, { color: colors.subText }]}>Discard</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  /* ── Main Render ──────────────────────────────────────── */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={[styles.backArrow, { color: colors.text }]}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Meetings</Text>
        </View>

        {/* Filter Tabs */}
        <View style={[styles.filterRow, { backgroundColor: colors.card }]}>
          {(['all', 'upcoming', 'completed', 'cancelled'] as const).map(f => (
            <TouchableOpacity
              key={f}
              style={[
                styles.filterBtn,
                activeFilter === f && { backgroundColor: colors.primary },
              ]}
              onPress={() => setActiveFilter(f)}
            >
              <Text style={[
                styles.filterBtnText,
                { color: activeFilter === f ? '#FFFFFF' : colors.subText },
              ]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Meeting Cards */}
        <ScrollView contentContainerStyle={styles.listContent}>
          {filteredMeetings.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.card }]}>
              <Text style={[styles.emptyText, { color: colors.subText }]}>No meetings found</Text>
            </View>
          ) : (
            filteredMeetings.map(meeting => {
              const sc = statusColor(meeting.status);
              return (
                <TouchableOpacity
                  key={meeting.meetingId}
                  style={[styles.card, { backgroundColor: colors.card }]}
                  onPress={() => openDetail(meeting)}
                  activeOpacity={0.85}
                >
                  {/* Card Top Row */}
                  <View style={styles.cardTopRow}>
                    <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                      {meeting.title || `Meeting with ${meeting.teamName || 'Team'}`}
                    </Text>
                    <View style={[styles.cardBadge, { backgroundColor: sc.bg }]}>
                      <Text style={[styles.cardBadgeText, { color: sc.text }]}>
                        {(meeting.status || 'SCHEDULED').toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.cardProject, { color: colors.subText }]}>
                    Project: {meeting.projectTitle || 'N/A'}
                  </Text>
                  <Text style={[styles.cardProject, { color: colors.subText }]}>
                    Domain: {meeting.domain || 'N/A'}
                  </Text>

                  <Text style={[styles.cardProject, { color: colors.subText }]}>
                    SubDomain: {meeting.subDomain || 'N/A'}
                  </Text>

                  {/* Date / Time / Location */}
                  <View style={styles.cardMeta}>
                    <MetaChip icon="" text={meeting.meetingTime ? new Date(meeting.meetingTime).toLocaleDateString() : 'TBD'} colors={colors} />
                    <MetaChip icon="" text={meeting.meetingTime ? new Date(meeting.meetingTime).toLocaleTimeString() : 'TBD'} colors={colors} />
                    <MetaChip icon="" text={meeting.location || 'Online'} colors={colors} />
                  </View>

                  {/* Members */}
                  <Text style={[styles.cardMembers, { color: colors.subText }]}>
                    {meeting.meetingLink ? `Link: ${meeting.meetingLink}` : ''}
                  </Text>

                  {/* Quick Edit Button for upcoming */}
                  {(meeting.status === 'SCHEDULED' || meeting.status === 'PENDING') && (
                    <TouchableOpacity
                      style={[styles.quickEditBtn, { borderColor: colors.primary }]}
                      onPress={() => openEdit(meeting)}
                    >
                      <Text style={[styles.quickEditText, { color: colors.primary }]}>
                        Edit / Reschedule
                      </Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {renderDetailModal()}
        {renderEditModal()}
      </View>
    </SafeAreaView>
  );
};

export default FacultyViewMeetingsScreen;

/* ── Helper Components ──────────────────────────────────── */

const DetailRow = ({ label, value, colors }: { label: string; value: string; colors: any }) => (
  <View style={styles.detailRow}>
    <Text style={[styles.detailLabel, { color: colors.subText }]}>{label}</Text>
    <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
  </View>
);

const EditField = ({
  label,
  value,
  onChangeText,
  colors,
  placeholder,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  colors: any;
  placeholder?: string;
}) => (
  <View style={styles.fieldWrapper}>
    <Text style={[styles.fieldLabel, { color: colors.subText }]}>{label}</Text>
    <TextInput
      style={[styles.fieldInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder || ''}
      placeholderTextColor={colors.subText}
    />
  </View>
);

const MetaChip = ({ icon, text, colors }: { icon: string; text: string; colors: any }) => (
  <View style={[styles.metaChip, { backgroundColor: colors.background }]}>
    <Text style={[styles.metaChipText, { color: colors.subText }]}>{icon} {text}</Text>
  </View>
);

/* ── Styles ─────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Header
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 4,
  },
  backBtn: { marginRight: 8 },
  backArrow: { fontSize: 32, lineHeight: 36 },
  headerTitle: { fontSize: 20, fontWeight: '600' },

  // Filter
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    elevation: 2,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  filterBtnText: { fontSize: 11, fontWeight: '600' },

  // List
  listContent: { padding: 16, paddingBottom: 32 },

  emptyBox: { borderRadius: 12, padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 15 },

  // Card
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
  cardBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  cardBadgeText: { fontSize: 11, fontWeight: '600' },
  cardProject: { fontSize: 13, marginBottom: 10 },
  cardMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  metaChip: { flexDirection: 'row', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  metaChipText: { fontSize: 12 },
  cardMembers: { fontSize: 12, marginBottom: 10 },
  quickEditBtn: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 4,
  },
  quickEditText: { fontSize: 13, fontWeight: '600' },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '88%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 20, fontWeight: '700' },
  closeBtn: { fontSize: 22 },

  // Detail Modal
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 10,
    marginBottom: 12,
  },
  statusText: { fontSize: 11, fontWeight: '700' },
  detailMainTitle: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  detailRow: { marginBottom: 12 },
  detailLabel: { fontSize: 12 },
  detailValue: { fontSize: 15, fontWeight: '500', marginTop: 2 },
  membersTitle: { fontSize: 16, fontWeight: '600', marginTop: 20, marginBottom: 8 },
  memberItem: { fontSize: 14, marginBottom: 4 },
  actionColumn: { marginTop: 24, gap: 12 },
  actionRow: { marginTop: 24, flexDirection: 'row', gap: 12 },
  actionBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  actionBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },
  actionBtnOutline: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  actionBtnOutlineText: { fontWeight: '700', fontSize: 16, letterSpacing: 0.5 },

  // Edit Modal
  rescheduleBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 4,
    marginTop: 4,
  },
  rescheduleLabel: { fontSize: 14, fontWeight: '700', marginBottom: 10 },
  fieldWrapper: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, marginBottom: 6 },
  fieldInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
  },
  saveBtn: {
    marginTop: 8,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  discardBtn: {
    marginTop: 10,
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 20,
  },
  discardBtnText: { fontWeight: '600', fontSize: 15 },
});