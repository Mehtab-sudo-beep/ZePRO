import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

import { AuthContext } from '../context/AuthContext';

import {
  scheduleMeeting,
  cancelMeeting,
  completeMeeting,
  getMeetingByRequest,
} from '../api/facultyApi';

const FacultyMeetingsScreen = () => {
  const { user } = useContext(AuthContext);

  const [requestId, setRequestId] = useState('');
  const [meetingId, setMeetingId] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingTime, setMeetingTime] = useState('');
  const [meeting, setMeeting] = useState<any>(null);

  const handleSchedule = async () => {
    try {
      const data = await scheduleMeeting(
        Number(requestId),
        meetingLink,
        meetingTime,
        user.token,
      );

      setMeeting(data);
    } catch (err) {
      console.log('Schedule error', err);
    }
  };

  const handleCancel = async () => {
    try {
      const data = await cancelMeeting(Number(meetingId), user.token);

      setMeeting(data);
    } catch (err) {
      console.log('Cancel error', err);
    }
  };

  const handleComplete = async () => {
    try {
      const data = await completeMeeting(Number(meetingId), user.token);

      setMeeting(data);
    } catch (err) {
      console.log('Complete error', err);
    }
  };

  const handleGet = async () => {
    try {
      const data = await getMeetingByRequest(Number(requestId), user.token);

      setMeeting(data);
    } catch (err) {
      console.log('Fetch error', err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Faculty Meetings</Text>

      <TextInput
        placeholder="Request ID"
        style={styles.input}
        value={requestId}
        onChangeText={setRequestId}
      />

      <TextInput
        placeholder="Meeting Link"
        style={styles.input}
        value={meetingLink}
        onChangeText={setMeetingLink}
      />

      <TextInput
        placeholder="Meeting Time (2026-03-16T15:00)"
        style={styles.input}
        value={meetingTime}
        onChangeText={setMeetingTime}
      />

      <TouchableOpacity style={styles.button} onPress={handleSchedule}>
        <Text style={styles.btnText}>Schedule Meeting</Text>
      </TouchableOpacity>

      <TextInput
        placeholder="Meeting ID"
        style={styles.input}
        value={meetingId}
        onChangeText={setMeetingId}
      />

      <TouchableOpacity style={styles.button} onPress={handleCancel}>
        <Text style={styles.btnText}>Cancel Meeting</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleComplete}>
        <Text style={styles.btnText}>Complete Meeting</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={handleGet}>
        <Text style={styles.btnText}>Get Meeting</Text>
      </TouchableOpacity>

      {meeting && (
        <View style={styles.result}>
          <Text>Meeting ID: {meeting.meetingId}</Text>
          <Text>Request ID: {meeting.requestId}</Text>
          <Text>Link: {meeting.meetingLink}</Text>
          <Text>Time: {meeting.meetingTime}</Text>
          <Text>Status: {meeting.status}</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default FacultyMeetingsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },

  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 12,
    borderRadius: 6,
  },

  button: {
    backgroundColor: '#2563EB',
    padding: 12,
    borderRadius: 6,
    marginBottom: 10,
    alignItems: 'center',
  },

  btnText: {
    color: '#fff',
    fontWeight: '600',
  },

  result: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#eee',
    borderRadius: 6,
  },
});
