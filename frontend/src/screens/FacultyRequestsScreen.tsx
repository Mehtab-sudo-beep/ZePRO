import React, { useContext, useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Platform,
  ActivityIndicator,
  Modal,
} from 'react-native';

import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as IntentLauncher from 'expo-intent-launcher';
import { BASE_URL } from '../api/api';
import axios from 'axios';

import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import { AuthContext } from '../context/AuthContext';
import { AlertContext } from '../context/AlertContext';
import { ThemeContext } from '../theme/ThemeContext';
import {
  getPendingRequests,
  cancelRequest,
  scheduleMeeting,
} from '../api/facultyApi';
import { coordinatorApi } from '../api/coordinatorApi';

const FacultyRequestsScreen = () => {
  const { user } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const { colors } = useContext(ThemeContext);
  const isDark = colors.background === '#111827';
  const navigation = useNavigation<any>();

  const [loading, setLoading] = useState(true);
  const [groupedRequests, setGroupedRequests] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [expandedTeam, setExpandedTeam] = useState<number | null>(null);
  const [selectedDegree, setSelectedDegree] = useState<'UG' | 'PG'>('UG');

  const [meetingLink, setMeetingLink] = useState('');
  const [location, setLocation] = useState('');

  const [date, setDate] = useState(new Date());
  const [hasSelectedDate, setHasSelectedDate] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);
  const [maxDate, setMaxDate] = useState<Date | undefined>(undefined);

  const [message, setMessage] = useState('');
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    loadRequests();
    loadDeadlines();
    return () => { isMounted.current = false; };
  }, [selectedDegree]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await getPendingRequests(selectedDegree, user!.token);

      // Group by projectId
      const grouped = data.reduce((acc: any, curr: any) => {
        const pid = curr.projectId;
        if (!acc[pid]) {
          acc[pid] = {
            projectId: pid,
            title: curr.title,
            description: curr.description,
            requests: []
          };
        }
        acc[pid].requests.push(curr);
        return acc;
      }, {});

      if (isMounted.current) {
        const groupedArray = Object.values(grouped);
        setGroupedRequests(groupedArray);

        // Update selectedProject if it's open
        if (selectedProject) {
          const updatedProj = groupedArray.find((p: any) => p.projectId === selectedProject.projectId);
          if (updatedProj) setSelectedProject(updatedProj);
          else setSelectedProject(null);
        }
      }
    } catch (err) {
      console.log(err);
    } finally {
      if (isMounted.current) setLoading(false);
    }
  };

  const loadDeadlines = async () => {
    try {
      // 1. Fetch predefined department deadlines (the "source of truth" for rules)
      const ruleRes = await coordinatorApi.getDeadlines(selectedDegree);
      let scheduleLimit: Date | undefined = undefined;

      if (ruleRes.meetingSchedulingDeadline) {
        scheduleLimit = new Date(ruleRes.meetingSchedulingDeadline);
        console.log(`[FacultyRequestsScreen] Found Predefined Scheduling Deadline for ${selectedDegree}:`, scheduleLimit);
      }

      // 2. Fetch custom ad-hoc deadlines (secondary check)
      const customRes = await axios.get(`${BASE_URL}/api/deadlines?degree=${selectedDegree}`, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });
      const customDeadlines = customRes.data;

      const customMeetingDeadline = customDeadlines.find((d: any) =>
        d.isActive && (
          d.title.toLowerCase().includes('meeting') ||
          d.title.toLowerCase().includes('schedule')
        )
      );

      if (customMeetingDeadline) {
        const customDate = new Date(customMeetingDeadline.deadlineDate);
        console.log(`[FacultyRequestsScreen] Found Custom Scheduling Deadline for ${selectedDegree}:`, customDate);
        
        // Take the more restrictive (earlier) date if both exist
        if (!scheduleLimit || customDate < scheduleLimit) {
          scheduleLimit = customDate;
        }
      }

      if (isMounted.current) {
        setMaxDate(scheduleLimit);
      }
    } catch (e) {
      console.log('[FacultyRequestsScreen] Error loading deadlines:', e);
    }
  };

  const handleCancel = async (requestId: number) => {
    try {
      await cancelRequest(requestId, user!.token);
      setMessage('Request cancelled successfully');
      setTimeout(() => setMessage(''), 3000);
      loadRequests();
    } catch (err) {
      console.log(err);
      showAlert('Error', 'Failed to cancel request.');
    }
  };

  const confirmCancel = (requestId: number, teamName: string) => {
    showAlert(
      'Cancel Request',
      `Are you sure you want to cancel the request from "${teamName}"?`,
      [
        { text: 'No', style: 'cancel' },
        { text: 'Yes, Cancel', style: 'destructive', onPress: () => handleCancel(requestId) },
      ]
    );
  };

  const handleSchedule = async (requestId: number) => {
    if (!hasSelectedDate) {
      showAlert('Error', 'Please select meeting date and time.');
      return;
    }

    try {
      const now = new Date();
      if (date.getTime() < now.getTime()) {
        showAlert('Invalid Time', 'Cannot select past date/time.');
        return;
      }

      if (maxDate && date.getTime() > maxDate.getTime()) {
        showAlert('Deadline Exceeded', 'Meeting must be scheduled before the department deadline.');
        return;
      }

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      const formattedTime = `${year}-${month}-${day}T${hours}:${minutes}:00`;

      await scheduleMeeting(
        requestId,
        formattedTime,
        meetingLink,
        location,
        user!.token
      );

      setMessage('Meeting scheduled successfully');
      setTimeout(() => setMessage(''), 3000);
      setSelectedRequest(null);
      setMeetingLink('');
      setLocation('');
      setHasSelectedDate(false);
      loadRequests();

    } catch (err: any) {
      console.log(err);
      showAlert('Error', err?.response?.data?.message || 'Failed to schedule meeting.');
    }
  };

  const formatDate = (d: Date) => d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatTime = (d: Date) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const openLink = async (url: string) => {
    if (!url || url === 'N/A') return;
    try {
      const fullUrl = url.startsWith('http') ? url : `${BASE_URL}${url.startsWith('/') ? '' : '/'}${url}`;
      const filename = encodeURIComponent(url.split('/').pop() || 'document.pdf');
      const fileUri = `${FileSystem.documentDirectory}${filename}`;

      const downloadedFile = await FileSystem.downloadAsync(fullUrl, fileUri, {
        headers: { Authorization: `Bearer ${user?.token}` }
      });

      if (downloadedFile.status === 200) {
        if (Platform.OS === 'android') {
          const contentUri = await FileSystem.getContentUriAsync(downloadedFile.uri);
          await IntentLauncher.startActivityAsync('android.intent.action.VIEW', {
            data: contentUri,
            flags: 1,
            type: 'application/pdf',
          });
        } else {
          await Sharing.shareAsync(downloadedFile.uri, { UTI: 'public.data', mimeType: 'application/pdf' });
        }
      } else {
        showAlert('Error', `Server error: ${downloadedFile.status}`);
      }
    } catch (err) {
      showAlert('Error', 'Unable to fetch document.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Image
            source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Pending Requests</Text>
      </View>

      {/* UG/PG Toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={[styles.degreeBtn, selectedDegree === 'UG' && styles.degreeBtnActive, { borderColor: colors.primary }]}
          onPress={() => setSelectedDegree('UG')}
        >
          <Text style={[styles.degreeText, { color: colors.text }, selectedDegree === 'UG' && { color: '#FFF' }]}>UG Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.degreeBtn, selectedDegree === 'PG' && styles.degreeBtnActive, { borderColor: colors.primary }]}
          onPress={() => setSelectedDegree('PG')}
        >
          <Text style={[styles.degreeText, { color: colors.text }, selectedDegree === 'PG' && { color: '#FFF' }]}>PG Requests</Text>
        </TouchableOpacity>
      </View>

      {/* Grouped View */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {message !== '' && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{message}</Text>
          </View>
        )}

        {loading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : groupedRequests.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyText, { color: colors.subText }]}>No pending requests</Text>
          </View>
        ) : (
          groupedRequests.map((proj) => (
            <TouchableOpacity
              key={proj.projectId}
              style={[styles.projectCard, { backgroundColor: colors.card }]}
              onPress={() => setSelectedProject(proj)}
            >
              <View style={styles.projHeader}>
                <Text style={[styles.projTitle, { color: colors.text }]} numberOfLines={1}>
                  {proj.title}
                </Text>
                <View style={[styles.badge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.badgeText, { color: colors.primary }]}>
                    {proj.requests.length} {proj.requests.length === 1 ? 'Request' : 'Requests'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.projDesc, { color: colors.subText }]} numberOfLines={2}>
                {proj.description}
              </Text>
              <View style={styles.projFooter}>
                <Text style={{ color: colors.primary, fontWeight: '600' }}>View Requests ›</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Requests Modal */}
      <Modal visible={!!selectedProject} animationType="slide" transparent={false}>
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <View style={[styles.header, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.backButton} onPress={() => { setSelectedProject(null); setSelectedRequest(null); }}>
              <Image
                source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
                style={styles.backIcon}
              />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
              {selectedProject?.title}
            </Text>
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={[styles.sectionHeading, { color: colors.subText }]}>TEAM REQUESTS</Text>

            {selectedProject?.requests.map((r: any) => (
              <View key={r.requestId} style={[styles.requestCard, { backgroundColor: colors.card }]}>
                <TouchableOpacity
                  onPress={() => setExpandedTeam(expandedTeam === r.teamId ? null : r.teamId)}
                  style={styles.requestHeader}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.teamName, { color: colors.text }]}>{r.teamName || `Team ${r.teamId}`}</Text>
                  </View>
                  <Text style={{ color: colors.subText, fontSize: 18 }}>
                    {expandedTeam === r.teamId ? '▼' : '▶'}
                  </Text>
                </TouchableOpacity>

                {expandedTeam === r.teamId && (
                  <View style={styles.expandedContent}>
                    {r.teamMemberDetails?.map((m: any, idx: number) => (
                      <View key={idx} style={[styles.memberItem, { borderTopColor: colors.border }]}>
                        <View style={styles.memberMeta}>
                          <Text style={[styles.memberName, { color: colors.text }]}>
                            {m.name} {m.isTeamLead && <Text style={{ color: '#F59E0B' }}>★</Text>}
                          </Text>
                          <Text style={[styles.memberSub, { color: colors.subText }]}>{m.rollNo} | {m.cgpa ? m.cgpa.toFixed(2) : 'N/A'} CGPA</Text>
                        </View>

                        <View style={styles.docRow}>
                          {m.resumeLink && m.resumeLink !== 'N/A' && (
                            <TouchableOpacity style={styles.docBtn} onPress={() => openLink(m.resumeLink)}>
                              <Text style={styles.docBtnText}>📄 Resume</Text>
                            </TouchableOpacity>
                          )}
                          {m.marksheetLink && m.marksheetLink !== 'N/A' && (
                            <TouchableOpacity style={styles.docBtn} onPress={() => openLink(m.marksheetLink)}>
                              <Text style={styles.docBtnText}>📋 Marksheet</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                <View style={styles.requestActions}>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                    onPress={() => setSelectedRequest(r)}
                  >
                    <Text style={styles.actionBtnText}>Schedule Meeting</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: '#EF4444' }]}
                    onPress={() => confirmCancel(r.requestId, r.teamName || `Team ${r.teamId}`)}
                  >
                    <Text style={styles.actionBtnText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>

        {/* Schedule Sub-Modal */}
        <Modal visible={!!selectedRequest} animationType="fade" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Schedule Meeting</Text>
              <Text style={[styles.modalSub, { color: colors.subText }]}>
                Team: {selectedRequest?.teamName}
              </Text>

              <TextInput
                placeholder="Meeting Link (Google Meet / Zoom)"
                placeholderTextColor={colors.subText}
                value={meetingLink}
                onChangeText={setMeetingLink}
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
              />

              <TextInput
                placeholder="Location (Room No / Online)"
                placeholderTextColor={colors.subText}
                value={location}
                onChangeText={setLocation}
                style={[styles.modalInput, { color: colors.text, borderColor: colors.border }]}
              />

              <View style={styles.pickerRow}>
                <TouchableOpacity
                  style={[styles.miniPicker, { borderColor: colors.border }]}
                  onPress={() => setShowDate(true)}
                >
                  <Text style={{ color: colors.text }}>{hasSelectedDate ? formatDate(date) : 'Select Date'}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.miniPicker, { borderColor: colors.border }]}
                  onPress={() => setShowTime(true)}
                >
                  <Text style={{ color: colors.text }}>{hasSelectedDate ? formatTime(date) : 'Select Time'}</Text>
                </TouchableOpacity>
              </View>

              {maxDate && (
                <Text style={styles.deadlineWarning}>
                  Deadline: {formatDate(maxDate)}
                </Text>
              )}

              {showDate && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  minimumDate={new Date()}
                  maximumDate={maxDate}
                  onChange={(e, d) => { setShowDate(false); if (d) { setDate(d); setHasSelectedDate(true); } }}
                />
              )}
              {showTime && (
                <DateTimePicker
                  value={date}
                  mode="time"
                  onChange={(e, d) => { setShowTime(false); if (d) { setDate(d); setHasSelectedDate(true); } }}
                />
              )}

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[styles.footerBtn, { backgroundColor: '#9CA3AF' }]}
                  onPress={() => setSelectedRequest(null)}
                >
                  <Text style={styles.footerBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.footerBtn, { backgroundColor: '#10B981' }]}
                  onPress={() => handleSchedule(selectedRequest.requestId)}
                >
                  <Text style={styles.footerBtnText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  backButton: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { width: 22, height: 22, resizeMode: 'contain' },
  headerTitle: { fontSize: 18, fontWeight: '700', flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 40 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: 100 },
  successBox: { backgroundColor: '#DCFCE7', padding: 12, borderRadius: 10, marginBottom: 16 },
  successText: { color: '#15803D', textAlign: 'center', fontWeight: '600' },
  emptyBox: { alignItems: 'center', marginTop: 100 },
  emptyText: { fontSize: 16, fontWeight: '600' },

  // UG/PG Toggle
  toggleContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    justifyContent: 'center',
  },
  degreeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  degreeBtnActive: {
    backgroundColor: '#3B82F6',
  },
  degreeText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Project Cards
  projectCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  projHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  projTitle: { fontSize: 18, fontWeight: '800', flex: 1, marginRight: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontSize: 12, fontWeight: '700' },
  projDesc: { fontSize: 14, lineHeight: 20, marginBottom: 12 },
  projFooter: { alignItems: 'flex-end' },

  // Request Cards
  sectionHeading: { fontSize: 12, fontWeight: '800', marginBottom: 12, letterSpacing: 1 },
  requestCard: { borderRadius: 14, padding: 16, marginBottom: 16, elevation: 2 },
  requestHeader: { flexDirection: 'row', alignItems: 'center' },
  teamName: { fontSize: 16, fontWeight: '700', marginBottom: 2 },
  memberCount: { fontSize: 12 },
  expandedContent: { marginTop: 12 },
  memberItem: { borderTopWidth: 0.5, paddingVertical: 12 },
  memberMeta: { marginBottom: 8 },
  memberName: { fontSize: 14, fontWeight: '600' },
  memberSub: { fontSize: 12 },
  docRow: { flexDirection: 'row', gap: 10 },
  docBtn: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 },
  docBtnText: { fontSize: 11, fontWeight: '600', color: '#374151' },
  requestActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  actionBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalContent: { borderRadius: 20, padding: 24, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: '800', marginBottom: 4 },
  modalSub: { fontSize: 14, marginBottom: 20 },
  modalInput: { borderWidth: 1, borderRadius: 10, padding: 12, marginBottom: 12, fontSize: 14 },
  pickerRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  miniPicker: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 12, alignItems: 'center' },
  deadlineWarning: { fontSize: 12, color: '#EF4444', fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  modalFooter: { flexDirection: 'row', gap: 12, marginTop: 10 },
  footerBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  footerBtnText: { color: '#fff', fontWeight: '700' },
});

export default FacultyRequestsScreen;
