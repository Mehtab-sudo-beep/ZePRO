import React, { useState, useContext } from 'react';
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

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'ScheduledMeetings'
>;

type TabType = 'UPCOMING' | 'COMPLETED';

type Meeting = {
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
};

const ScheduledMeetingsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('UPCOMING');
  const [searchQuery, setSearchQuery] = useState('');

  const navigation = useNavigation<NavProp>();
  const { colors } = useContext(ThemeContext);

  const meetings: Meeting[] = [
    {
      title: 'Project Discussion',
      faculty: 'Dr. Vinay V. Panicker',
      projectName: 'Project Allocation System',
      domain: 'Software Engineering',
      subDomain: 'Full Stack Development',
      location: 'Seminar Hall – 2',
      date: '12 Feb 2026',
      time: '10:30 AM',
      members: ['Mehtab Shaik', 'Student A', 'Student B'],
      response: 'Accepted',
      statusColor: '#16A34A',
    },
    {
      title: 'Requirement Review',
      faculty: 'Dr. Anoop K.',
      projectName: 'Internship Management Portal',
      domain: 'Information Systems',
      subDomain: 'Requirement Analysis',
      location: 'Faculty Cabin – CS Block',
      date: '14 Feb 2026',
      time: '02:00 PM',
      members: ['Mehtab Shaik', 'Student C'],
      response: 'Pending',
      statusColor: '#F59E0B',
    },
    {
      title: 'Initial Proposal Review',
      faculty: 'Dr. Suresh Kumar',
      projectName: 'Smart Attendance System',
      domain: 'Data Analytics',
      subDomain: 'Machine Learning',
      location: 'Online (Google Meet)',
      date: '02 Feb 2026',
      time: '11:00 AM',
      members: ['Mehtab Shaik', 'Student D', 'Student E'],
      response: 'Rejected',
      statusColor: '#DC2626',
    },
  ];

  /* -------- FILTER LOGIC -------- */

  const filteredMeetings = meetings.filter(meeting => {
    const matchesTab =
      activeTab === 'UPCOMING'
        ? meeting.response === 'Pending'
        : meeting.response === 'Accepted' || meeting.response === 'Rejected';

    const matchesSearch =
      meeting.faculty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      meeting.projectName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

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
              onPress={() => navigation.navigate('MeetingDetails', { meeting })}
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
