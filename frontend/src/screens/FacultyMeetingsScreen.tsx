import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';

import {
  getAllMeetings,
  cancelMeeting,
  completeMeeting,
} from '../api/facultyApi';

const Icon = ({ name, size = 16, style }: { name: string; size?: number; style?: any }) => {
  const { colors } = useContext(ThemeContext);
  const isDark = colors.background === '#111827';
  const icons: Record<string, any> = {
    team: isDark ? require('../assets/team-white.png') : require('../assets/team.png'),
    time: isDark ? require('../assets/clock-white.png') : require('../assets/clock.png'),
    link: isDark ? require('../assets/join-white.png') : require('../assets/join.png'),
    id: isDark ? require('../assets/tag-white.png') : require('../assets/tag.png'),
  };
  return (
    <Image source={icons[name]} style={[{ width: size, height: size, resizeMode: 'contain' }, style]} />
  );
};

const FacultyMeetingsScreen = () => {
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation();

  const isDark = colors.background === '#111827';
  const divider = isDark ? '#374151' : '#E5E7EB';

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
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Image
            source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Meetings</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {meetings.length === 0 && (
          <Text style={{ color: colors.subText, textAlign: 'center', marginTop: 40, fontStyle: 'italic' }}>No meetings scheduled</Text>
        )}

        {meetings.map(m => {
          const isSelected = selectedMeeting?.meetingId === m.meetingId;

          return (
            <TouchableOpacity
              key={m.meetingId}
              style={[styles.card, { backgroundColor: colors.card, borderColor: divider }]}
              onPress={() => setSelectedMeeting(isSelected ? null : m)}
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Icon name="team" size={18} style={{ marginRight: 8, opacity: 0.8 }} />
                  <Text style={[styles.team, { color: colors.text }]} numberOfLines={1}>
                    {m.teamName}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(m.status) }]}>
                  <Text style={styles.statusText}>{m.status}</Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: divider }]} />

              <View style={styles.infoRow}>
                <Icon name="id" size={14} style={{ marginRight: 8, opacity: 0.6 }} />
                <Text style={[styles.item, { color: colors.subText }]}>
                  Meeting ID: {m.meetingId}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Icon name="time" size={14} style={{ marginRight: 8, opacity: 0.6 }} />
                <Text style={[styles.item, { color: colors.subText }]}>
                  {new Date(m.meetingTime).toLocaleString()}
                </Text>
              </View>

              {m.meetingLink ? (
                <View style={styles.infoRow}>
                  <Icon name="link" size={14} style={{ marginRight: 8, opacity: 0.6 }} />
                  <Text style={[styles.item, { color: colors.primary }]} numberOfLines={1}>
                    {m.meetingLink}
                  </Text>
                </View>
              ) : null}

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
  header: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  backIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  team: {
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: 0.5,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  item: {
    fontSize: 13,
    fontWeight: '500',
    flex: 1,
  },
  actions: {
    marginTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(150,150,150,0.2)',
    paddingTop: 12,
  },
  primaryBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 8,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
