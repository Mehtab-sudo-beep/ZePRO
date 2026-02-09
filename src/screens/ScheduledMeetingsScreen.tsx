import React, { useState } from 'react';
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

/* ---------------- TYPES ---------------- */

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'ScheduledMeetings'
>;

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

/* ---------------- COMPONENT ---------------- */

const ScheduledMeetingsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'COMPLETED'>(
    'UPCOMING'
  );
  const navigation = useNavigation<NavProp>();

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
    response: 'Completed',
    statusColor: '#2563EB',
  },
  {
    title: 'Faculty Approval Meeting',
    faculty: 'Dr. Vinay V. Panicker',
    projectName: 'Campus Navigation App',
    domain: 'Mobile Computing',
    subDomain: 'Android Development',
    location: 'Dept. Conference Room',
    date: '28 Jan 2026',
    time: '04:00 PM',
    members: ['Mehtab Shaik', 'Student A', 'Student F'],
    response: 'Rejected',
    statusColor: '#DC2626',
  },
  {
    title: 'Mid-Semester Progress Review',
    faculty: 'Dr. Rekha Nair',
    projectName: 'Online Examination System',
    domain: 'Web Technologies',
    subDomain: 'Backend Systems',
    location: 'Seminar Hall – 1',
    date: '20 Feb 2026',
    time: '09:30 AM',
    members: ['Mehtab Shaik', 'Student G', 'Student H'],
    response: 'Accepted',
    statusColor: '#16A34A',
  },
];

const filteredMeetings = meetings.filter(meeting => {
  if (activeTab === 'UPCOMING') {
    return meeting.response === 'Pending';
  }

  // COMPLETED tab
  return meeting.response === 'Accepted' || meeting.response === 'Rejected';
});

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          
          <Text style={[styles.headerTitle, { marginLeft: 8 }]}>
            Scheduled Meetings
          </Text>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search by faculty or project"
            style={styles.searchInput}
            placeholderTextColor={'#1c201d'}
          />
        </View>

        {/* Tabs */}
        <View style={styles.tabRow}>
          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 'UPCOMING' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('UPCOMING')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'UPCOMING' && styles.activeTabText,
              ]}
            >
              Upcoming Meetings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === 'COMPLETED' && styles.activeTab,
            ]}
            onPress={() => setActiveTab('COMPLETED')}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === 'COMPLETED' && styles.activeTabText,
              ]}
            >
              Completed Meetings
            </Text>
          </TouchableOpacity>
        </View>

        {/* Meeting List */}
        <ScrollView>
          
            {filteredMeetings.map((meeting, index) => (
  <TouchableOpacity
    key={index}
    onPress={() =>
      navigation.navigate('MeetingDetails', { meeting })
    }
  >
              <MeetingCard
                title={meeting.title}
                faculty={meeting.faculty}
                time={`${meeting.date}, ${meeting.time}`}
                response={meeting.response}
                statusColor={meeting.statusColor}
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Bottom Dashboard */}
        <View style={styles.bottomTab}>
        
          {/* Home */}
          <TouchableOpacity
              style={styles.tabItem1}
              onPress={() => navigation.navigate('StudentHome')}
            >
              <Image source={require('../assets/home.png')} style={styles.tabIcon} />
              <Text style={styles.tab}>Home</Text>
            </TouchableOpacity>
        
          {/* Schedule Meetings */}
          <View style={styles.tabItem1}>
              <Image
              source={require('../assets/meeting-color.png')}
              style={styles.tabIcon}
              resizeMode="contain"
            />
              <Text style={styles.tabActive}>Scheduled Meetings</Text>
            </View>
        
          {/* Project Details */}
          <View style={styles.tabItem1}>
            <Image source={require('../assets/document.png')} style={styles.tabIcon} />
            <Text style={styles.tab}>Project Details</Text>
          </View>
        
          {/* More */}
          <TouchableOpacity
            style={styles.tabItem1}
            onPress={() => navigation.navigate('More')}
          ><Image source={require('../assets/more.png')} style={styles.tabIcon} />
            <Text style={styles.tab}>More</Text>
          </TouchableOpacity>
        
        </View>

      </View>
    </SafeAreaView>
  );
};

export default ScheduledMeetingsScreen;

/* ---------------- MEETING CARD ---------------- */

const MeetingCard = ({
  title,
  faculty,
  time,
  response,
  statusColor,
}: {
  title: string;
  faculty: string;
  time: string;
  response: string;
  statusColor: string;
}) => (
  <View style={styles.card}>
    <Text style={styles.meetingTitle}>{title}</Text>
    <Text style={styles.meta}>{faculty}</Text>
    <Text style={styles.meta}>{time}</Text>
    <Text style={[styles.status, { color: statusColor }]}>
      {response}
    </Text>
  </View>
);

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
  },
  headerIcon: {
    width: 62,
    height: 42,
  },
  searchContainer: {
    color: 'rgb(0, 0, 0)',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  searchInput: {
    color:'#000000',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#4338CA',
  },
  tabText: {
    color: '#6B7280',
  },
  activeTabText: {
    color: '#4338CA',
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  meetingTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  meta: {
    color: '#6B7280',
    fontSize: 13,
  },
  status: {
    marginTop: 8,
    fontWeight: '500',
  },
  bottomTab: {
    height: 60,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tab: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  tabActive: {
    color: '#2563EB',
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
