import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';

import {
  getPendingRequests,
  cancelRequest,
  scheduleMeeting,
} from '../api/facultyApi';

const FacultyRequestsScreen = () => {
  const { user } = useContext(AuthContext);

  const [requests, setRequests] = useState<any[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<number | null>(null);

  const [meetingLink, setMeetingLink] = useState('');

  const [date, setDate] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [showTime, setShowTime] = useState(false);

  const [message, setMessage] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await getPendingRequests(user.token);
      setRequests(data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const handleCancel = async (requestId: number) => {
    try {
      await cancelRequest(requestId, user.token);
      setMessage('Request cancelled');
      loadRequests();
    } catch (err) {
      console.log(err);
    }
  };

  const handleSchedule = async (requestId: number) => {
    try {
      const formattedTime = date.toISOString().slice(0, 16);

      await scheduleMeeting(requestId, formattedTime, meetingLink, user.token);

      setMessage('Meeting scheduled successfully');

      setSelectedRequest(null);
      setMeetingLink('');

      loadRequests();
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FB' }}>
      <ScrollView contentContainerStyle={styles.container}>
        {message !== '' && (
          <View style={styles.successBox}>
            <Text style={styles.successText}>{message}</Text>
          </View>
        )}

        {requests.map(r => {
          const isSelected = selectedRequest === r.requestId;

          return (
            <View key={r.requestId} style={styles.card}>
              <Text style={styles.team}>👥 Team {r.teamId}</Text>
              <Text style={styles.request}>Request ID: {r.requestId}</Text>

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
                    onPress={() => handleCancel(r.requestId)}
                  >
                    <Text style={styles.btnText}>Cancel Request</Text>
                  </TouchableOpacity>
                </>
              )}

              {isSelected && (
                <View style={styles.form}>
                  <Text style={styles.label}>Meeting Link</Text>

                  <TextInput
                    placeholder="Paste Google Meet / Zoom link (optional)"
                    placeholderTextColor="#999"
                    value={meetingLink}
                    onChangeText={setMeetingLink}
                    style={styles.input}
                  />

                  <TouchableOpacity
                    style={styles.picker}
                    onPress={() => setShowDate(true)}
                  >
                    <Text style={styles.pickerText}>
                      Select Meeting Date 📅
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.picker}
                    onPress={() => setShowTime(true)}
                  >
                    <Text style={styles.pickerText}>
                      Select Meeting Time ⏰
                    </Text>
                  </TouchableOpacity>

                  <Text style={styles.helper}>
                    Selected: {date.toLocaleString()}
                  </Text>

                  {showDate && (
                    <DateTimePicker
                      value={date}
                      mode="date"
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
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default FacultyRequestsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },

  card: {
    backgroundColor: '#fff',
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
    color: '#666',
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
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },

  picker: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 10,
    borderRadius: 8,
    marginTop: 6,
  },

  pickerText: {
    color: '#333',
  },

  helper: {
    fontSize: 12,
    color: '#777',
    marginTop: 6,
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
});
