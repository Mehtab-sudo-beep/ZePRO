import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';

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

const FacultyRequestsScreen = () => {
  const { user } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const { colors } = useContext(ThemeContext);
  const isDark = colors.background === '#111827';
  const navigation = useNavigation<any>();

  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);

  const [meetingLink, setMeetingLink] = useState('');
  const [location, setLocation] = useState('');

  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const [message, setMessage] = useState('');

  const loadRequests = async () => {
    try {
      const data = await getPendingRequests(user.token);
      setRequests(data || []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const handleCancel = async (requestId: number) => {
    try {
      await cancelRequest(requestId, user.token);
      setMessage('Request cancelled');
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
        {
          text: 'No',
          style: 'cancel',
          onPress: () => { },
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => handleCancel(requestId),
        },
      ]
    );
  };

  const handleSchedule = async (requestId: number) => {
    try {
      const now = new Date();

      if (
        date.toDateString() === now.toDateString() &&
        date.getTime() < now.getTime()
      ) {
        showAlert('Invalid Time', 'Cannot select past time today');
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
        user.token
      );

      setMessage('Meeting scheduled successfully');
      setSelectedRequest(null);
      setMeetingLink('');
      setLocation('');
      loadRequests();

    } catch (err: any) {
      console.log(err);
      showAlert(
        'Error',
        err?.response?.data?.message || 'Failed to schedule meeting.'
      );
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={
              isDark
                ? require('../assets/angle-white.png')
                : require('../assets/angle.png')
            }
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Pending Requests
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>

        {/* Success message */}
        {message !== '' && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{message}</Text>
          </View>
        )}

        {/* Empty state */}
        {requests.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={[styles.emptyText, { color: colors.subText }]}>
              No pending requests
            </Text>
          </View>
        ) : (
          requests.map(r => {
            const isSelected = selectedRequest === r.requestId;
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            return (
              <View
                key={r.requestId}
                style={[
                  styles.card,
                  { backgroundColor: colors.card, borderColor: colors.border },
                ]}
              >
                {/* Team name */}
                <Text style={[styles.team, { color: colors.text }]}>
                  {r.teamName || `Team ${r.teamId}`}
                </Text>

                {/* Members */}
                {r.members && r.members.length > 0 && (
                  <Text style={{ fontSize: 12, color: colors.subText, marginBottom: 4 }}>
                    Members: {r.members.join(', ')}
                  </Text>
                )}

                <Text style={[styles.request, { color: colors.subText }]}>
                  Request ID: {r.requestId}
                </Text>

                {/* Action buttons (not expanded) */}
                {!isSelected && (
                  <>
                    <TouchableOpacity
                      style={styles.scheduleBtn}
                      onPress={() => setSelectedRequest(r.requestId)}
                    >
                      <Text style={styles.btnText}>Schedule Meeting</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => confirmCancel(r.requestId, r.teamName || `Team ${r.teamId}`)}
                    >
                      <Text style={styles.btnText}>Cancel Request</Text>
                    </TouchableOpacity>
                  </>
                )}

                {/* Schedule form (expanded) */}
                {isSelected && (
                  <View style={styles.form}>

                    <Text style={[styles.label, { color: colors.text }]}>
                      Meeting Link
                    </Text>
                    <TextInput
                      placeholder="Paste Google Meet / Zoom link (optional)"
                      placeholderTextColor={colors.subText}
                      value={meetingLink}
                      onChangeText={setMeetingLink}
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                      ]}
                    />

                    <Text style={[styles.label, { color: colors.text }]}>
                      Location
                    </Text>
                    <TextInput
                      placeholder="Enter venue or online location"
                      placeholderTextColor={colors.subText}
                      value={location}
                      onChangeText={setLocation}
                      style={[
                        styles.input,
                        {
                          backgroundColor: colors.background,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                      ]}
                    />

                    <TouchableOpacity
                      style={[
                        styles.picker,
                        {
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                        },
                      ]}
                      onPress={() => setShowDate(true)}
                    >
                      <Text style={[styles.pickerText, { color: colors.text }]}>
                        Select Meeting Date
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.picker,
                        {
                          borderColor: colors.border,
                          backgroundColor: colors.background,
                        },
                      ]}
                      onPress={() => setShowTime(true)}
                    >
                      <Text style={[styles.pickerText, { color: colors.text }]}>
                        Select Meeting Time
                      </Text>
                    </TouchableOpacity>

                    <Text style={[styles.helper, { color: colors.subText }]}>
                      Selected: {date.toLocaleString()}
                    </Text>

                    {showDate && (
                      <DateTimePicker
                        value={date}
                        mode="date"
                        minimumDate={today}
                        onChange={(event, selectedDate) => {
                          setShowDate(false);
                          if (selectedDate) setDate(selectedDate);
                        }}
                      />
                    )}

                    {showTime && (
                      <DateTimePicker
                        value={date}
                        mode="time"
                        onChange={(event, selectedDate) => {
                          setShowTime(false);
                          if (selectedDate) setDate(selectedDate);
                        }}
                      />
                    )}

                    <TouchableOpacity
                      style={styles.confirmBtn}
                      onPress={() => handleSchedule(r.requestId)}
                    >
                      <Text style={styles.btnText}>Confirm Meeting</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cancelBtn}
                      onPress={() => setSelectedRequest(null)}
                    >
                      <Text style={styles.btnText}>Back</Text>
                    </TouchableOpacity>

                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default FacultyRequestsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginLeft: -8,
  },

  backIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },

  card: {
    borderWidth: 1,
    padding: 18,
    borderRadius: 12,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },

  team: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },

  request: {
    fontSize: 13,
    marginBottom: 12,
  },

  scheduleBtn: {
    backgroundColor: '#6366F1',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 8,
  },

  cancelBtn: {
    backgroundColor: '#EF4444',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 6,
  },

  confirmBtn: {
    backgroundColor: '#10B981',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  btnText: {
    color: '#fff',
    fontWeight: '600',
  },

  form: {
    marginTop: 10,
  },

  label: {
    fontWeight: '600',
    marginBottom: 4,
  },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },

  picker: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },

  pickerText: {
    fontSize: 14,
  },

  helper: {
    fontSize: 12,
    marginTop: 6,
    marginBottom: 4,
  },

  successBox: {
    backgroundColor: '#DCFCE7',
    padding: 12,
    borderRadius: 10,
    marginBottom: 16,
  },

  successText: {
    color: '#15803D',
    textAlign: 'center',
    fontWeight: '600',
  },

  emptyBox: {
    marginTop: 80,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 18,
    fontWeight: '600',
  },
});
