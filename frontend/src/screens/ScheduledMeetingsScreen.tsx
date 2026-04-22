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
import { ThemeContext } from '../theme/ThemeContext';
import { getProjectScheduleResponses } from '../api/studentApi';
import { AuthContext } from '../context/AuthContext';

/* ================= ICON ================= */
const Icon = ({ name, size = 16, colors }: any) => {
  const isDark = colors.background === '#111827';



  const icons: any = {
    trophy: isDark
      ? require('../assets/trophy-white.png')
      : require('../assets/trophy.png'),

    clock: isDark
      ? require('../assets/clock-white.png')
      : require('../assets/clock.png'),

    close: isDark
      ? require('../assets/close-white.png')
      : require('../assets/close.png'),
  };

  return <Image source={icons[name]} style={{ width: size, height: size }} />;
};

type TabType = 'UPCOMING' | 'COMPLETED';

type Meeting = {
  requestId: number;
  title: string;
  faculty: string;
  projectName: string;
  location: string;
  date: string;
  time: string;
  response: string;
  statusColor: string;
  timestamp?: number;
  domain?: string;
  subDomain?: string;
};

const ScheduledMeetingsScreen: React.FC = () => {

  const [activeTab, setActiveTab] = useState<TabType>('UPCOMING');
  const [searchQuery, setSearchQuery] = useState('');
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(false);

  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation<any>();
  const isDark = colors.background === '#111827';
  const divider = isDark ? '#374151' : '#E5E7EB';

  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchMeetings = async () => {
      setLoading(true);

      try {
        if (!user?.studentId) return;
        const res = await getProjectScheduleResponses(Number(user!.studentId));
        const data = res.data || {};

        const upcomingMapped: Meeting[] = (data.upcomingRequests || []).map((m: any) => {
          const dateObj = m.meetingTime ? new Date(m.meetingTime) : null;

          return {
            requestId: m.requestId,
            title: m.projectTitle,
            faculty: m.facultyName,
            projectName: m.projectTitle,
            domain: m.domain || '',
            subDomain: m.subDomain || '',
            location: m.location || 'Online',
            date: dateObj ? dateObj.toLocaleDateString() : '',
            time: dateObj
              ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '',
            response: 'SCHEDULED',
            statusColor: '#8B5CF6',
            timestamp: dateObj ? dateObj.getTime() : 0,
          };
        });

        const completedMapped: Meeting[] = (data.completedRequests || []).map((m: any) => {
          let color = '#3B82F6';
          let respTxt = 'Meeting Completed';

          if (m.status === 'ACCEPTED') {
            color = '#16A34A';
            respTxt = 'Accepted';
          } else if (m.status === 'REJECTED') {
            color = '#DC2626';
            respTxt = 'Rejected';
          } else if (m.status === 'CANCELLED') {
            color = '#6B7280';
            respTxt = 'Cancelled';
          } else if (m.status === 'MEETING COMPLETED') {
            color = '#F59E0B';
            respTxt = 'Awaiting Decision';
          }

          return {
            requestId: m.requestId,
            title: m.projectTitle,
            faculty: m.facultyName,
            projectName: m.projectTitle,
            domain: m.domain || '',
            subDomain: m.subDomain || '',
            location: '',
            date: '',
            time: '',
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

  /* ================= FILTER ================= */
  const now = new Date().getTime();

  const filteredMeetings = meetings.filter(meeting => {

    const isUpcoming =
      meeting.response === 'SCHEDULED' &&
      meeting.timestamp &&
      meeting.timestamp > now;

    const isCompleted =
      meeting.response === 'Accepted' ||
      meeting.response === 'Rejected' ||
      meeting.response === 'Cancelled' ||
      meeting.response === 'Awaiting Decision' ||
      meeting.response === 'Meeting Completed';

    const matchesTab =
      activeTab === 'UPCOMING' ? isUpcoming : isCompleted;

    const matchesSearch =
      (meeting.faculty || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (meeting.projectName || '').toLowerCase().includes(searchQuery.toLowerCase());

    return matchesTab && matchesSearch;
  });

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading meetings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>

        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: divider }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
            <Image
              source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Scheduled Meetings
          </Text>
          <View style={{ width: 30 }} />
        </View>

        {/* SEARCH */}
        <View style={{ padding: 16, paddingBottom: 8 }}>
          <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <TextInput
              placeholder="Search meetings..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={[ styles.searchInput, { color: colors.text } ]}
              placeholderTextColor={colors.subText}
            />
          </View>
        </View>

        {/* TABS */}
        <View style={[styles.tabRow, { marginHorizontal: 16, marginBottom: 12 }]}>
          {['UPCOMING', 'COMPLETED'].map(tab => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                style={[
                  styles.tabItem,
                  isActive && { backgroundColor: isDark ? 'rgba(96,165,250,0.12)' : 'rgba(37,99,235,0.07)' }
                ]}
                onPress={() => setActiveTab(tab as TabType)}
              >
                <Text style={{
                  color: isActive ? colors.primary : colors.subText,
                  fontWeight: isActive ? '700' : '500',
                  fontSize: 13,
                  letterSpacing: isActive ? 1.1 : 0
                }}>
                  {tab}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* LIST */}
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          {filteredMeetings.length === 0 ? (
            <View style={{ marginTop: 40, alignItems: 'center' }}>
              <Text style={{ color: colors.subText, fontStyle: 'italic', fontSize: 13 }}>No meetings found.</Text>
            </View>
          ) : (
            filteredMeetings.map(meeting => {
              const isAccepted = meeting.response === 'Accepted';
              return (
                <TouchableOpacity
                  activeOpacity={0.8}
                  key={meeting.requestId}
                  onPress={() =>
                    navigation.navigate('MeetingDetails', {
                      requestId: meeting.requestId,
                    })
                  }
                >
                  <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <View style={{ flex: 1, marginRight: 12 }}>
                        <Text style={[styles.meetingTitle, { color: colors.text }]}>
                          {meeting.title}
                        </Text>
                        <Text style={{ color: colors.subText, fontSize: 13, marginTop: 2 }}>
                          {meeting.faculty}
                        </Text>
                      </View>
                      
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {isAccepted && (
                          <Image
                            source={isDark ? require('../assets/trophy-white.png') : require('../assets/trophy.png')}
                            style={{ width: 16, height: 16, resizeMode: 'contain' }}
                          />
                        )}
                        <View style={[styles.statusPill, { backgroundColor: meeting.statusColor + '15' }]}>
                          <Text style={{ color: meeting.statusColor, fontSize: 11, fontWeight: '700' }}>
                            {meeting.response.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    </View>
                    
                    {(meeting.domain || meeting.subDomain) ? (
                      <View style={{ flexDirection: 'row', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                        {meeting.domain ? (
                          <View style={[styles.domainChip, { backgroundColor: isDark ? 'rgba(96,165,250,0.12)' : 'rgba(37,99,235,0.07)' }]}>
                            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '600' }}>
                              {meeting.domain}
                            </Text>
                          </View>
                        ) : null}
                        {meeting.subDomain ? (
                          <View style={[styles.domainChip, { backgroundColor: isDark ? 'rgba(96,165,250,0.12)' : 'rgba(37,99,235,0.07)' }]}>
                            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '600' }}>
                              {meeting.subDomain}
                            </Text>
                          </View>
                        ) : null}
                      </View>
                    ) : null}

                    {meeting.date ? (
                      <View style={[styles.dateWrap, { borderTopColor: divider }]}>
                           <Icon name="clock" colors={colors} size={14} />
                           <Text style={{ color: colors.subText, fontSize: 13, marginLeft: 6 }}>
                             {meeting.date} • {meeting.time}
                           </Text>
                      </View>
                    ) : null}
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
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
      source={isDark ? require('../assets/home-white.png') : require('../assets/home.png')}
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
      source={isDark ? require('../assets/more-white.png') : require('../assets/more.png')}
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

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  backIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tabItem: {
    flex: 1,
    paddingVertical: 12,
    marginHorizontal: 4,
    alignItems: 'center',
    borderRadius: 12,
  },
  card: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  domainChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  dateWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomTab: {
  height: 60,
  borderTopWidth: 1,
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
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

tab: {
  fontSize: 12,
},

tabActive: {
  fontSize: 12,
  fontWeight: '700',
},
});