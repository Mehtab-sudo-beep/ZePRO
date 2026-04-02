import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';

import {
  getAllMeetings,
  cancelMeeting,
  completeMeeting,
} from '../api/facultyApi';

const FacultyMeetingsScreen = () => {
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);

  const [meetings, setMeetings] = useState<any[]>([]);
  const [selectedMeeting, setSelectedMeeting] = useState<any>(null);

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      const data = await getAllMeetings(user!.token);
      setMeetings(data || []);
    } catch (err) {
      console.log('Load meetings error:', err);
    }
  };

  const handleCancel = async (meetingId: number) => {
    try {
      await cancelMeeting(meetingId, user!.token);
      setSelectedMeeting(null);
      loadMeetings();
    } catch (err) {
      console.log(err);
    }
  };

  const handleComplete = async (meetingId: number) => {
    try {
      await completeMeeting(meetingId, user!.token);
      setSelectedMeeting(null);
      loadMeetings();
    } catch (err) {
      console.log(err);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'PENDING') return '#F59E0B';
    if (status === 'DONE') return '#10B981';
    if (status === 'CANCELLED') return '#EF4444';
    return '#6B7280';
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>Meetings</Text>

        {meetings.length === 0 && (
          <Text style={{ color: colors.subText }}>No meetings scheduled</Text>
        )}

        {meetings.map(m => {
          const isSelected = selectedMeeting?.meetingId === m.meetingId;

          return (
            <TouchableOpacity
              key={m.meetingId}
              style={[styles.card, { backgroundColor: colors.card }]}
              onPress={() => setSelectedMeeting(m)}
            >
              <Text style={[styles.team, { color: colors.text }]}>
                {m.teamName}
              </Text>

              <Text style={[styles.item, { color: colors.subText }]}>
                Meeting ID: {m.meetingId}
              </Text>

              <Text style={[styles.item, { color: colors.subText }]}>
                Time: {new Date(m.meetingTime).toLocaleString()}
              </Text>

              <Text style={[styles.item, { color: colors.subText }]}>
                Link: {m.meetingLink}
              </Text>

              <Text
                style={[styles.status, { color: getStatusColor(m.status) }]}
              >
                Status: {m.status}
              </Text>

              {isSelected && (
                <View style={styles.actions}>
                  {m.status !== 'DONE' && (
                    <TouchableOpacity
                      style={[
                        styles.primaryBtn,
                        { backgroundColor: '#10B981' },
                      ]}
                      onPress={() => handleComplete(m.meetingId)}
                    >
                      <Text style={styles.primaryBtnText}>Mark Done</Text>
                    </TouchableOpacity>
                  )}

                  {m.status !== 'CANCELLED' && (
                    <TouchableOpacity
                      style={[
                        styles.primaryBtn,
                        { backgroundColor: '#EF4444' },
                      ]}
                      onPress={() => handleCancel(m.meetingId)}
                    >
                      <Text style={styles.primaryBtnText}>Cancel Meeting</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

export default FacultyMeetingsScreen;

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },

  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },

  team: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
  },

  item: {
    fontSize: 14,
    marginBottom: 4,
  },

  status: {
    marginTop: 6,
    fontWeight: '600',
  },

  actions: {
    marginTop: 12,
  },

  primaryBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
    alignItems: 'center',
  },

  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
