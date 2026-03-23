import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ThemeContext } from '../theme/ThemeContext';
import { getProjectScheduleResponses } from '../api/studentApi';
import { AuthContext } from '../context/AuthContext';
type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'ScheduledMeetings'
>;

type TabType = 'UPCOMING' | 'COMPLETED';

type Meeting = {
  requestId: number;
  title: string;
  faculty: string;
  projectName: string;
  domain: string;
  subDomain: string;
  location: string;
  date: string;
  time: string;
  members: string[];
  response: string;
  statusColor: string;
  timestamp?: number;
};

const ScheduledMeetingsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('UPCOMING');
  const [searchQuery, setSearchQuery] = useState('');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchMeetings = async () => {
      setLoading(true);

      try {
        const studentId = user?.studentId;

        const res = await getProjectScheduleResponses(studentId);

        const data = res.data || {};

        const upcomingMapped: Meeting[] = (data.upcomingRequests || []).map((m: any) => {
          const dateObj = m.meetingTime ? new Date(m.meetingTime) : null;

          return {
            requestId: m.requestId,
            title: m.projectTitle,
            faculty: m.facultyName,
            projectName: m.projectTitle,
            domain: '',
            subDomain: '',
            location: m.location || 'Online',
            date: dateObj ? dateObj.toLocaleDateString() : '',
            time: dateObj ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            members: [],
            response: 'SCHEDULED',
            statusColor: '#8B5CF6',
            timestamp: dateObj ? dateObj.getTime() : 0,
          };
        }).sort((a: Meeting, b: Meeting) => (a.timestamp || 0) - (b.timestamp || 0));

        const completedMapped: Meeting[] = (data.completedRequests || []).map((m: any) => {
          let color = '#3B82F6';     // blue  — meeting completed, awaiting decision
          let respTxt = 'Meeting Completed';

          if (m.status === 'ACCEPTED') {
            color = '#16A34A';        // green
            respTxt = 'Accepted';
          } else if (m.status === 'REJECTED') {
            color = '#DC2626';        // red
            respTxt = 'Rejected';
          } else if (m.status === 'CANCELLED') {
            color = '#6B7280';        // grey
            respTxt = 'Cancelled';
          } else if (m.status === 'MEETING COMPLETED') {
            color = '#F59E0B';        // amber — done but pending faculty decision
            respTxt = 'Awaiting Decision';
          }

          return {
            requestId: m.requestId,
            title: m.projectTitle,
            faculty: m.facultyName,
            projectName: m.projectTitle,
            domain: '',
            subDomain: '',
            location: '',
            date: '',
            time: '',
            members: [],
            response: respTxt,
            statusColor: color,
          };
        });

        setMeetings([...upcomingMapped, ...completedMapped]);
      } catch (err) {
        console.log('Meeting API error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [user?.studentId]);

  const navigation = useNavigation<NavProp>();
  const { colors } = useContext(ThemeContext);

  /* -------- FILTER LOGIC -------- */

  const filteredMeetings = meetings.filter(meeting => {
    const matchesTab =
      activeTab === 'UPCOMING'
        ? meeting.response === 'SCHEDULED'
        : meeting.response === 'Accepted' ||
        meeting.response === 'Rejected' ||
        meeting.response === 'Awaiting Decision' ||
        meeting.response === 'Meeting Completed' ||
        meeting.response === 'Cancelled';

    const matchesSearch =
      (meeting.faculty || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (meeting.projectName || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading meetings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        {/* Header (Lowered Properly) */}
        <View style={styles.headerContainer}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Scheduled Meetings
          </Text>
        </View>

        {/* Search */}
        <View
          style={[styles.searchContainer, { backgroundColor: colors.card }]}
        >
          <TextInput
            placeholder="Search by faculty or project"
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={[
              styles.searchInput,
              {
                color: colors.text,
                borderColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}
            placeholderTextColor={colors.subText}
          />
        </View>

        {/* Tabs */}
        <View style={[styles.tabRow, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 'UPCOMING' && {
                borderBottomColor: colors.primary,
              },
            ]}
            onPress={() => setActiveTab('UPCOMING')}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === 'UPCOMING' ? colors.primary : colors.subText,
                },
              ]}
            >
              Upcoming Meetings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 'COMPLETED' && {
                borderBottomColor: colors.primary,
              },
            ]}
            onPress={() => setActiveTab('COMPLETED')}
          >
            <Text
              style={[
                styles.tabText,
                {
                  color:
                    activeTab === 'COMPLETED' ? colors.primary : colors.subText,
                },
              ]}
            >
              Completed Meetings
            </Text>
          </TouchableOpacity>
        </View>

        {/* Meeting Cards */}
        <ScrollView>
          {filteredMeetings.map((meeting, index) => (
            <TouchableOpacity
              key={index}
              onPress={() =>
                navigation.navigate('MeetingDetails', { requestId: meeting.requestId })
              }
            >
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text style={[styles.meetingTitle, { color: colors.text }]}>
                  {meeting.title}
                </Text>
                <Text style={[styles.meta, { color: colors.subText }]}>
                  {meeting.faculty}
                </Text>
                <Text style={[styles.meta, { color: colors.subText }]}>
                  {meeting.date}, {meeting.time}
                </Text>
                <Text style={[styles.status, { color: meeting.statusColor }]}>
                  {meeting.response}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bottom Tab */}
        <View
          style={[
            styles.bottomTab,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={styles.tabItem1}
            onPress={() => navigation.navigate('StudentHome')}
          >
            <Image
              source={require('../assets/home.png')}
              style={styles.tabIcon}
            />
            <Text style={[styles.tab, { color: colors.subText }]}>Home</Text>
          </TouchableOpacity>

          <View style={styles.tabItem1}>
            <Image
              source={require('../assets/meeting-color.png')}
              style={styles.tabIcon}
            />
            <Text style={[styles.tabActive, { color: colors.primary }]}>
              Scheduled Meetings
            </Text>
          </View>

          <TouchableOpacity
            style={styles.tabItem1}
            onPress={() => navigation.navigate('More')}
          >
            <Image
              source={require('../assets/more.png')}
              style={styles.tabIcon}
            />
            <Text style={[styles.tab, { color: colors.subText }]}>More</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ScheduledMeetingsScreen;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: { flex: 1 },

  headerContainer: {
    height: 60,
    paddingHorizontal: 20,
    justifyContent: 'center',
    elevation: 4,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },

  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },

  searchInput: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },

  tabRow: {
    flexDirection: 'row',
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },

  tabText: {
    fontSize: 14,
  },

  card: {
    padding: 16,
    borderBottomWidth: 1,
    borderRadius: 12,
    marginBottom: 10,
    marginHorizontal: 16,
  },

  meetingTitle: {
    fontSize: 15,
    fontWeight: '500',
  },

  meta: {
    fontSize: 13,
  },

  status: {
    marginTop: 8,
    fontWeight: '500',
  },

  bottomTab: {
    height: 60,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  tab: {
    fontSize: 12,
  },

  tabActive: {
    fontSize: 12,
    fontWeight: '700',
  },

  tabItem1: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  tabIcon: {
    width: 22,
    height: 22,
    marginBottom: 4,
    resizeMode: 'contain',
  },
});
