import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { ThemeContext } from '../theme/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import {
  getAllMeetings,
  cancelMeeting,
  completeMeeting,
  acceptProject,
  rejectProject,
  rescheduleMeeting,
} from '../api/facultyApi';
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
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rescheduleForm, setRescheduleForm] = useState<Partial<any>>({});
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  // ✅ NEW: Separate date/time states for reschedule modal
  const [scheduledDate, setScheduledDate] = useState(new Date());
  const [hasSelectedScheduledDate, setHasSelectedScheduledDate] = useState(false);
  const [showScheduledDate, setShowScheduledDate] = useState(false);
  const [showScheduledTime, setShowScheduledTime] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (user?.token) {
        loadMeetings();
      }
    }, [user?.token])
  );

  const loadMeetings = async () => {
    try {
      setLoading(true);
      if (!user?.token) return;
      const data = await getAllMeetings(user!.token);
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

  const openDetail = (meeting: any) => {
    setSelectedMeeting(meeting);
    setShowDetailModal(true);
  };

  const openReschedule = (meeting: any) => {
    setSelectedMeeting(meeting);
    const meetingDate = new Date(meeting.meetingTime);
    setScheduledDate(meetingDate);
    setRescheduleForm({
      title: meeting.title || '',
      meetingLink: meeting.meetingLink || '',
      location: meeting.location || '',
    });
    setHasSelectedScheduledDate(true);
    setShowDetailModal(false);
    setShowRescheduleModal(true);
  };

  // ✅ Format date helper
  const formatDate = (date: Date) => {
    return date.toLocaleDateString();
  };

  // ✅ Format time helper
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleReschedule = async () => {
    if (!rescheduleForm.title || !rescheduleForm.location) {
      showAlert('Error', 'Please fill in all required fields');
      return;
    }

    if (!hasSelectedScheduledDate) {
      showAlert('Error', 'Please select a date and time');
      return;
    }

    try {
      if (!user?.token || !selectedMeeting?.requestId) return;

      const year = scheduledDate.getFullYear();
      const month = String(scheduledDate.getMonth() + 1).padStart(2, '0');
      const day = String(scheduledDate.getDate()).padStart(2, '0');
      const hours = String(scheduledDate.getHours()).padStart(2, '0');
      const minutes = String(scheduledDate.getMinutes()).padStart(2, '0');
      const seconds = '00';

      const formattedTime = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;

      await rescheduleMeeting(
        selectedMeeting.requestId,
        formattedTime,
        rescheduleForm.meetingLink || '',
        rescheduleForm.location,
        rescheduleForm.title,
        user!.token
      );

      setShowRescheduleModal(false);
      setSelectedMeeting(null);
      setRescheduleForm({});
      setHasSelectedScheduledDate(false);
      showAlert('Success', 'Meeting rescheduled successfully!');
      loadMeetings();
    } catch (err) {
      console.log('Error rescheduling:', err);
      showAlert('Error', 'Failed to reschedule meeting');
    }
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
              if (!user?.token) return;
              await cancelMeeting(meeting.meetingId, user!.token);
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
    return { bg: '#FEE2E2', text: '#DC2626' };
  };

  /* ── Detail Modal ─────────────────────────────────────── */
  const renderDetailModal = () => {
    if (!selectedMeeting) return null;
    const sc = statusColor(selectedMeeting.status);
    return (
      <Modal visible={showDetailModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Meeting Details
              </Text>
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <Text style={[styles.closeBtn, { color: colors.subText }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
                <Text style={[styles.statusText, { color: sc.text }]}>
                  {selectedMeeting.status.toUpperCase()}
                </Text>
              </View>

              <Text style={[styles.detailMainTitle, { color: colors.text }]}>
                {selectedMeeting.title}
              </Text>

              <DetailRow label="Team" value={selectedMeeting.teamName || 'N/A'} colors={colors} />
              <DetailRow label="Project" value={selectedMeeting.projectTitle || 'N/A'} colors={colors} />
              <DetailRow label="Domain" value={selectedMeeting.domain || 'N/A'} colors={colors} />
              <DetailRow label="SubDomain" value={selectedMeeting.subDomain || 'N/A'} colors={colors} />
              <DetailRow label="Location" value={selectedMeeting.location || 'Online'} colors={colors} />
              <DetailRow label="Date" value={selectedMeeting.meetingTime ? new Date(selectedMeeting.meetingTime).toLocaleDateString() : 'TBD'} colors={colors} />
              <DetailRow label="Time" value={selectedMeeting.meetingTime ? new Date(selectedMeeting.meetingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'} colors={colors} />
              <DetailRow label="Link" value={selectedMeeting.meetingLink || 'N/A'} colors={colors} />

              {/* Action Buttons */}
              {(selectedMeeting.status === 'SCHEDULED' || selectedMeeting.status === 'PENDING') && (
                <View style={styles.actionColumn}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => openReschedule(selectedMeeting)}
                  >
                    <Text style={styles.actionBtnText}>Reschedule Meeting</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
                    onPress={async () => {
                      try {
                        if (!user?.token) return;
                        await completeMeeting(selectedMeeting.meetingId, user!.token);
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
                    style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}
                    onPress={() => handleCancelMeeting(selectedMeeting)}
                  >
                    <Text style={styles.actionBtnText}>Cancel Meeting</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* ✅ ACCEPT / REJECT */}
              {selectedMeeting.status === 'DONE' &&
                selectedMeeting.requestStatus !== 'ACCEPTED' &&
                selectedMeeting.requestStatus !== 'REJECTED' && (
                  <View style={styles.actionColumn}>
                    <TouchableOpacity
                      style={[styles.actionBtn, { backgroundColor: '#10B981' }]}
                      onPress={async () => {
                        try {
                          if (!user?.token) return;
                          await acceptProject(selectedMeeting.requestId, user!.token);
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
                      style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}
                      onPress={() => {
                        setRejectReason('');
                        setShowRejectModal(true);
                      }}
                    >
                      <Text style={styles.actionBtnText}>Reject Project</Text>
                    </TouchableOpacity>
                  </View>
                )}

              {/* 🔒 Read-only outcome banner */}
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
                      color: selectedMeeting.requestStatus === 'ACCEPTED' ? '#5805e8ff' : '#D97706',
                    }}>
                      {selectedMeeting.requestStatus === 'ACCEPTED'
                        ? 'Project has been Accepted'
                        : 'Project has been Rejected'}
                    </Text>
                    {selectedMeeting.requestStatus === 'REJECTED' && (selectedMeeting.rejectionReason || selectedMeeting.reason) && (
                      <Text style={{ marginTop: 8, fontSize: 13, color: '#D97706', textAlign: 'center' }}>
                        Reason: {selectedMeeting.rejectionReason || selectedMeeting.reason}
                      </Text>
                    )}
                  </View>
                )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  /* ── ✅ Reschedule Modal with Date/Time Pickers ────────────────────────────────────── */
  const renderRescheduleModal = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return (
      <Modal visible={showRescheduleModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Reschedule Meeting
              </Text>
              <TouchableOpacity onPress={() => setShowRescheduleModal(false)}>
                <Text style={[styles.closeBtn, { color: colors.subText }]}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Meeting Title */}
              <View style={styles.fieldWrapper}>
                <Text style={[styles.fieldLabel, { color: colors.subText }]}>Meeting Title</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  value={rescheduleForm.title || ''}
                  onChangeText={v => setRescheduleForm({ ...rescheduleForm, title: v })}
                  placeholder="Enter meeting title"
                  placeholderTextColor={colors.subText}
                />
              </View>

              {/* Meeting Link */}
              <View style={styles.fieldWrapper}>
                <Text style={[styles.fieldLabel, { color: colors.subText }]}>Meeting Link</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  value={rescheduleForm.meetingLink || ''}
                  onChangeText={v => setRescheduleForm({ ...rescheduleForm, meetingLink: v })}
                  placeholder="e.g. https://meet.google.com/..."
                  placeholderTextColor={colors.subText}
                />
              </View>

              {/* Location */}
              <View style={styles.fieldWrapper}>
                <Text style={[styles.fieldLabel, { color: colors.subText }]}>Location</Text>
                <TextInput
                  style={[styles.fieldInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
                  value={rescheduleForm.location || ''}
                  onChangeText={v => setRescheduleForm({ ...rescheduleForm, location: v })}
                  placeholder="e.g. Room 401 or Online"
                  placeholderTextColor={colors.subText}
                />
              </View>

              {/* ✅ Date & Time Picker Section */}
              <View style={[styles.rescheduleBox, { borderColor: colors.border, backgroundColor: colors.primary + '0D' }]}>
                <Text style={[styles.rescheduleLabel, { color: colors.primary }]}>
                  📅 New Date & Time
                </Text>

                {/* Date Picker Button */}
                <TouchableOpacity
                  style={[
                    styles.picker,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                    },
                  ]}
                  onPress={() => setShowScheduledDate(true)}
                >
                  <Text style={[styles.pickerText, { color: colors.text }]}>
                    {hasSelectedScheduledDate ? formatDate(scheduledDate) : 'Select Meeting Date'}
                  </Text>
                </TouchableOpacity>

                {/* Time Picker Button */}
                <TouchableOpacity
                  style={[
                    styles.picker,
                    {
                      borderColor: colors.border,
                      backgroundColor: colors.background,
                      marginTop: 10,
                    },
                  ]}
                  onPress={() => setShowScheduledTime(true)}
                >
                  <Text style={[styles.pickerText, { color: colors.text }]}>
                    {hasSelectedScheduledDate ? formatTime(scheduledDate) : 'Select Meeting Time'}
                  </Text>
                </TouchableOpacity>

                {/* Date Picker Modal */}
                {showScheduledDate && (
                  <DateTimePicker
                    value={scheduledDate}
                    mode="date"
                    minimumDate={today}
                    onChange={(event, selectedDate) => {
                      setShowScheduledDate(false);
                      if (selectedDate) {
                        setScheduledDate(selectedDate);
                        setHasSelectedScheduledDate(true);
                      }
                    }}
                  />
                )}

                {/* Time Picker Modal */}
                {showScheduledTime && (
                  <DateTimePicker
                    value={scheduledDate}
                    mode="time"
                    is24Hour={true}
                    onChange={(event, selectedDate) => {
                      setShowScheduledTime(false);
                      if (selectedDate) {
                        setScheduledDate(selectedDate);
                        setHasSelectedScheduledDate(true);
                      }
                    }}
                  />
                )}
              </View>

              {/* Save Button */}
              <TouchableOpacity
                style={[styles.saveBtn, { backgroundColor: '#10B981' }]}
                onPress={handleReschedule}
              >
                <Text style={styles.saveBtnText}>Save & Reschedule</Text>
              </TouchableOpacity>

              {/* Cancel Button */}
              <TouchableOpacity
                style={[styles.discardBtn, { borderColor: colors.border }]}
                onPress={() => setShowRescheduleModal(false)}
              >
                <Text style={[styles.discardBtnText, { color: colors.subText }]}>Cancel</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  /* ── Reject Modal ──────────────────────────────────────── */
  const renderRejectModal = () => (
    <Modal visible={showRejectModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 12 }]}>Reject Project Request</Text>
          <TextInput
            style={[styles.fieldInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.border, height: 80, textAlignVertical: 'top' }]}
            placeholder="Reason for rejection (required)"
            placeholderTextColor={colors.subText}
            multiline
            value={rejectReason}
            onChangeText={setRejectReason}
          />
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <TouchableOpacity style={[styles.actionBtnOutline, { flex: 1, borderColor: colors.border }]} onPress={() => setShowRejectModal(false)}>
              <Text style={[styles.actionBtnOutlineText, { color: colors.subText }]}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { flex: 1, backgroundColor: '#EF4444' }]} onPress={async () => {
              if (!rejectReason.trim()) {
                showAlert('Error', 'Please provide a reason for rejection.');
                return;
              }
              try {
                if (!user?.token) return;
                await rejectProject(selectedMeeting.requestId, user!.token, rejectReason);
                setShowRejectModal(false);
                setShowDetailModal(false);
                loadMeetings();
                showAlert('Done', 'Project rejected with reason.');
              } catch (err) {
                showAlert('Error', 'Reject failed');
              }
            }}>
              <Text style={styles.actionBtnText}>Submit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  /* ── Main Render ──────────────────────────────────────── */
  const isDark = colors.background === '#111827';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>

        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Image
              source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>My Meetings</Text>
        </View>

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
                    Team: {meeting.teamName || 'N/A'}
                  </Text>
                  <Text style={[styles.cardProject, { color: colors.subText }]}>
                    Project: {meeting.projectTitle || 'N/A'}
                  </Text>
                  <Text style={[styles.cardProject, { color: colors.subText }]}>
                    Domain: {meeting.domain || 'N/A'}
                  </Text>

                  <View style={styles.cardMeta}>
                    <MetaChip icon={isDark ? require('../assets/calendar-white.png') : require('../assets/calendar.png')} text={meeting.meetingTime ? new Date(meeting.meetingTime).toLocaleDateString() : 'TBD'} colors={colors} />
                    <MetaChip icon={isDark ? require('../assets/clock-white.png') : require('../assets/clock.png')} text={meeting.meetingTime ? new Date(meeting.meetingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'} colors={colors} />
                    <MetaChip icon={isDark ? require('../assets/location-white.png') : require('../assets/location.png')} text={meeting.location || 'Online'} colors={colors} />
                  </View>

                  <Text style={[styles.cardMembers, { color: colors.subText }]}>
                    {meeting.meetingLink ? `Link: ${meeting.meetingLink}` : ''}
                  </Text>

                  {(meeting.status === 'SCHEDULED' || meeting.status === 'PENDING') && (
                    <TouchableOpacity
                      style={[styles.quickEditBtn, { backgroundColor: colors.primary, borderWidth: 0 }]}
                      onPress={() => openReschedule(meeting)}
                    >
                      <Text style={[styles.quickEditText, { color: '#FFFFFF' }]}>
                        Reschedule
                      </Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>

        {renderDetailModal()}
        {renderRescheduleModal()}
        {renderRejectModal()}
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

const MetaChip = ({ icon, text, colors }: { icon: any; text: string; colors: any }) => (
  <View style={[styles.metaChip, { backgroundColor: colors.background }]}>
    {icon ? <Image source={icon} style={{ width: 14, height: 14, tintColor: colors.subText, marginRight: 4 }} /> : null}
    <Text style={[styles.metaChipText, { color: colors.subText }]}>{text}</Text>
  </View>
);

/* ── Styles ─────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 4,
  },
  backBtn: { marginRight: 8, padding: 4 },
  backIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  headerTitle: { fontSize: 20, fontWeight: '600' },
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
  },
  filterBtnText: { fontSize: 11, fontWeight: '600' },
  listContent: { padding: 16, paddingBottom: 32 },
  emptyBox: { borderRadius: 12, padding: 40, alignItems: 'center' },
  emptyText: { fontSize: 15 },
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
    marginBottom: 8,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8 },
  cardBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  cardBadgeText: { fontSize: 11, fontWeight: '600' },
  cardProject: { fontSize: 13, marginBottom: 8 },
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
  actionColumn: { marginTop: 24, gap: 12 },
  actionBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  actionBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 16 },
  actionBtnOutline: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    backgroundColor: 'transparent',
  },
  actionBtnOutlineText: { fontWeight: '700', fontSize: 16 },
  rescheduleBox: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    marginTop: 12,
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
  picker: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
  },
  pickerText: { fontSize: 14 },
  saveBtn: {
    marginTop: 16,
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