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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../theme/ThemeContext';

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

const SAMPLE_MEETINGS: Meeting[] = [
  {
    id: 'M001',
    title: 'Project Kickoff Meeting',
    faculty: 'Dr. Sarah Johnson',
    projectName: 'AI-Based Chatbot',
    domain: 'Artificial Intelligence',
    subDomain: 'NLP',
    location: 'Room 204, CS Block',
    date: '2025-02-12',
    time: '10:00 AM',
    members: ['John Doe', 'Jane Smith', 'Mike Johnson'],
    status: 'upcoming',
  },
  {
    id: 'M002',
    title: 'Requirement Review',
    faculty: 'Dr. Sarah Johnson',
    projectName: 'AI-Based Chatbot',
    domain: 'Artificial Intelligence',
    subDomain: 'Machine Learning',
    location: 'Lab 3, CS Block',
    date: '2025-02-14',
    time: '02:00 PM',
    members: ['John Doe', 'Jane Smith'],
    status: 'upcoming',
  },
  {
    id: 'M003',
    title: 'Mid-Review Discussion',
    faculty: 'Dr. Sarah Johnson',
    projectName: 'Campus Navigation App',
    domain: 'Mobile Development',
    subDomain: 'React Native',
    location: 'Seminar Hall',
    date: '2025-01-20',
    time: '11:00 AM',
    members: ['Alex Brown', 'Emma Davis'],
    status: 'completed',
  },
];

const FacultyViewMeetingsScreen: React.FC = () => {
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation<any>();

  const [meetings, setMeetings] = useState<Meeting[]>(SAMPLE_MEETINGS);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Meeting>>({});
  const [activeFilter, setActiveFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('all');

  const filteredMeetings = meetings.filter(m =>
    activeFilter === 'all' ? true : m.status === activeFilter
  );

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
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    setMeetings(meetings.map(m =>
      m.id === selectedMeeting?.id ? { ...m, ...editForm } : m
    ));
    setShowEditModal(false);
    setSelectedMeeting(null);
    Alert.alert('Success', 'Meeting updated successfully!');
  };

  const handleCancelMeeting = (meeting: Meeting) => {
    Alert.alert(
      'Cancel Meeting',
      `Are you sure you want to cancel "${meeting.title}"?`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            setMeetings(meetings.map(m =>
              m.id === meeting.id ? { ...m, status: 'cancelled' } : m
            ));
            setShowDetailModal(false);
            Alert.alert('Done', 'Meeting has been cancelled.');
          },
        },
      ]
    );
  };

  const statusColor = (status: Meeting['status']) => {
    if (status === 'upcoming') return { bg: '#D1FAE5', text: '#059669' };
    if (status === 'completed') return { bg: '#DBEAFE', text: '#2563EB' };
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

              <DetailRow label="Project" value={selectedMeeting.projectName} colors={colors} />
              <DetailRow label="Domain" value={selectedMeeting.domain} colors={colors} />
              <DetailRow label="Sub-Domain" value={selectedMeeting.subDomain} colors={colors} />
              <DetailRow label="Location" value={selectedMeeting.location} colors={colors} />
              <DetailRow label="Date" value={selectedMeeting.date} colors={colors} />
              <DetailRow label="Time" value={selectedMeeting.time} colors={colors} />

              <Text style={[styles.membersTitle, { color: colors.text }]}>Team Members</Text>
              {selectedMeeting.members.map((m, i) => (
                <Text key={i} style={[styles.memberItem, { color: colors.subText }]}>• {m}</Text>
              ))}

              {/* Action Buttons */}
              {selectedMeeting.status === 'upcoming' && (
                <View style={styles.actionRow}>
                  <TouchableOpacity
                    style={[styles.editBtn, { backgroundColor: colors.primary }]}
                    onPress={() => openEdit(selectedMeeting)}
                  >
                    <Text style={styles.editBtnText}>  Edit / Reschedule</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => handleCancelMeeting(selectedMeeting)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel Meeting</Text>
                  </TouchableOpacity>
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
                  key={meeting.id}
                  style={[styles.card, { backgroundColor: colors.card }]}
                  onPress={() => openDetail(meeting)}
                  activeOpacity={0.85}
                >
                  {/* Card Top Row */}
                  <View style={styles.cardTopRow}>
                    <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                      {meeting.title}
                    </Text>
                    <View style={[styles.cardBadge, { backgroundColor: sc.bg }]}>
                      <Text style={[styles.cardBadgeText, { color: sc.text }]}>
                        {meeting.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.cardProject, { color: colors.subText }]}>
                    {meeting.projectName}
                  </Text>

                  {/* Date / Time / Location */}
                  <View style={styles.cardMeta}>
                    <MetaChip icon="" text={meeting.date} colors={colors} />
                    <MetaChip icon="" text={meeting.time} colors={colors} />
                    <MetaChip icon="" text={meeting.location} colors={colors} />
                  </View>

                  {/* Members */}
                  <Text style={[styles.cardMembers, { color: colors.subText }]}>
                     {meeting.members.join(', ')}
                  </Text>

                  {/* Quick Edit Button for upcoming */}
                  {meeting.status === 'upcoming' && (
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
  actionRow: { marginTop: 24, gap: 10 },
  editBtn: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  editBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  cancelBtn: {
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  cancelBtnText: { color: '#DC2626', fontWeight: '600', fontSize: 15 },

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