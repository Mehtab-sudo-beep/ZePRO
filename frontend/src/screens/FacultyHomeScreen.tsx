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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

import {
  getPendingRequests,
  getFacultyProjects,
  getAllMeetings,
} from '../api/facultyApi';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'FacultyHome'>;

const FacultyHomeScreen: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation<NavProp>();

  const [requests, setRequests] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);

  useEffect(() => {
    console.log('===== FacultyHomeScreen Loaded =====');

    if (user?.token && user?.facultyId) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      console.log('===== loadData() START =====');

      const req = await getPendingRequests(user.token);

      const proj = await getFacultyProjects(user.facultyId, user.token);

      const meet = await getAllMeetings(user.token);

      console.log('Requests:', req);
      console.log('Projects:', proj);
      console.log('Meetings:', meet);

      setRequests(req || []);
      setProjects(proj || []);
      setMeetings(meet || []);
    } catch (err: any) {
      console.log('API ERROR:', err);
    }
  };

  if (!user) return null;
  if (user.role !== 'FACULTY') return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Faculty Home
          </Text>
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {/* Pending Requests */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Pending Requests
            </Text>

            {requests.length === 0 && (
              <Text style={[styles.item, { color: colors.subText }]}>
                No pending requests
              </Text>
            )}

            {requests.slice(0, 2).map(r => (
              <Text
                key={r.requestId}
                style={[styles.item, { color: colors.subText }]}
              >
                • Team {r.teamId}
              </Text>
            ))}

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('FacultyRequests')}
            >
              <Text style={styles.primaryBtnText}>View All Requests</Text>
            </TouchableOpacity>
          </View>

          {/* My Projects */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              My Projects
            </Text>

            {projects.length === 0 && (
              <Text style={[styles.item, { color: colors.subText }]}>
                No projects created
              </Text>
            )}

            {projects.slice(0, 2).map(p => (
              <Text
                key={p.projectId}
                style={[styles.item, { color: colors.subText }]}
              >
                • {p.title}
              </Text>
            ))}

            <TouchableOpacity
              style={[styles.outlineBtn, { borderColor: colors.primary }]}
              onPress={() => navigation.navigate('FacultyProjects')}
            >
              <Text style={[styles.outlineBtnText, { color: colors.primary }]}>
                View Project Details
              </Text>
            </TouchableOpacity>
          </View>

          {/* Meetings */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Meetings
            </Text>

            {meetings.length === 0 && (
              <Text style={[styles.item, { color: colors.subText }]}>
                No upcoming meetings
              </Text>
            )}

            {meetings.slice(0, 2).map(m => (
              <Text
                key={m.meetingId}
                style={[styles.item, { color: colors.subText }]}
              >
                • Team {m.teamId} – {new Date(m.meetingTime).toLocaleString()}
              </Text>
            ))}

            <TouchableOpacity
              style={[styles.outlineBtn, { borderColor: colors.primary }]}
              onPress={() => navigation.navigate('FacultyMeetings')}
            >
              <Text style={[styles.outlineBtnText, { color: colors.primary }]}>
                View Meetings
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Bottom Tab */}
        <View
          style={[
            styles.bottomTab,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <View style={styles.tabItem}>
            <Image
              source={require('../assets/home-color.png')}
              style={styles.tabIcon}
            />
            <Text style={[styles.tabActive, { color: colors.primary }]}>
              Home
            </Text>
          </View>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigation.navigate('FacultyCreateMenu')}
          >
            <Image
              source={require('../assets/create.png')}
              style={styles.tabIcon}
            />
            <Text style={[styles.tab, { color: colors.subText }]}>Create</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigation.navigate('FacultyMore')}
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

export default FacultyHomeScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    borderBottomWidth: 0.5,
    borderColor: '#eee',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 90,
  },

  card: {
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    elevation: 4,
  },

  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },

  item: {
    fontSize: 14,
    marginBottom: 8,
  },

  primaryBtn: {
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 14,
    alignItems: 'center',
  },

  primaryBtnText: {
    color: '#fff',
    fontWeight: '700',
  },

  outlineBtn: {
    borderWidth: 1.2,
    paddingVertical: 11,
    borderRadius: 10,
    marginTop: 14,
    alignItems: 'center',
  },

  outlineBtnText: {
    fontWeight: '600',
  },

  bottomTab: {
    height: 68,
    borderTopWidth: 0.5,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 6,
  },

  tabItem: {
    alignItems: 'center',
  },

  tabIcon: {
    width: 24,
    height: 24,
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
