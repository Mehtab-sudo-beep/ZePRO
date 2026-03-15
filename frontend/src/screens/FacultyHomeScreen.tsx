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

import { getPendingRequests, getFacultyProjects } from '../api/facultyApi';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'FacultyHome'>;

const FacultyHomeScreen: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation<NavProp>();

  const [requests, setRequests] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  /* ================= SCREEN LOAD DEBUG ================= */

  useEffect(() => {
    console.log('===== FacultyHomeScreen Loaded =====');

    console.log('USER OBJECT:', user);
    console.log('USER NAME:', user?.name);
    console.log('USER EMAIL:', user?.email);
    console.log('USER ROLE:', user?.role);
    console.log('USER TOKEN:', user?.token);
    console.log('USER FACULTY ID:', user?.facultyId);

    if (user?.token && user?.facultyId) {
      console.log('User valid → calling loadData()');
      loadData();
    } else {
      console.log('User not ready yet → skipping API call');
    }
  }, [user]);

  /* ================= API CALL ================= */

  const loadData = async () => {
    try {
      console.log('===== loadData() START =====');
      console.log('TOKEN:', user?.token);
      console.log('FACULTY ID:', user?.facultyId);

      console.log('Calling getPendingRequests API...');

      const req = await getPendingRequests(user.token);

      console.log('Pending Requests API Response:', req);

      console.log('Calling getFacultyProjects API...');

      const proj = await getFacultyProjects(user.facultyId, user.token);

      console.log('Projects API Response:', proj);

      setRequests(req || []);
      setProjects(proj || []);

      console.log('State updated successfully');
    } catch (err: any) {
      console.log('===== API ERROR =====');

      if (err.response) {
        console.log('STATUS:', err.response.status);
        console.log('ERROR DATA:', err.response.data);
      } else {
        console.log('UNKNOWN ERROR:', err);
      }
    }
  };

  /* ================= USER VALIDATION ================= */

  if (!user) {
    console.log('User is NULL → returning null screen');
    return null;
  }

  if (user.role !== 'FACULTY') {
    console.log('User role is not FACULTY:', user.role);
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Faculty Home
          </Text>
        </View>

        {/* Content */}
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
                key={r.projectId}
                style={[styles.item, { color: colors.subText }]}
              >
                • {r.title} – Team {r.teamId}
              </Text>
            ))}

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                console.log('Navigating → FacultyRequests');
                navigation.navigate('FacultyRequests');
              }}
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
              onPress={() => {
                console.log('Navigating → FacultyProjects');
                navigation.navigate('FacultyProjects');
              }}
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

            <Text style={[styles.item, { color: colors.subText }]}>
              No upcoming meetings
            </Text>

            <TouchableOpacity
              style={[styles.outlineBtn, { borderColor: colors.primary }]}
              onPress={() => {
                console.log('Navigating → FacultyMeetings');
                navigation.navigate('FacultyMeetings');
              }}
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
            onPress={() => {
              console.log('Navigating → CreateProject');
              navigation.navigate('CreateProject');
            }}
          >
            <Image
              source={require('../assets/create.png')}
              style={styles.tabIcon}
            />
            <Text style={[styles.tab, { color: colors.subText }]}>Create</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => {
              console.log('Navigating → FacultyMore');
              navigation.navigate('FacultyMore');
            }}
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
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
  },

  content: { padding: 16 },

  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },

  item: {
    fontSize: 14,
    marginBottom: 6,
  },

  primaryBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },

  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  outlineBtn: {
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },

  outlineBtnText: {
    fontWeight: '500',
  },

  bottomTab: {
    height: 60,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  tabItem: {
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
