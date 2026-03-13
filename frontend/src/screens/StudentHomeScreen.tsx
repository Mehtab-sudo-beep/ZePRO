import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getProjectRequestsStatus, getAssignedProject, getTeamInfo } from '../api/studentApi';
import { Alert, Modal, ActivityIndicator } from 'react-native';
import { useEffect } from 'react';

type StudentHomeNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'StudentHome'
>;

const StudentHomeScreen: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation<StudentHomeNavigationProp>();

  const [showAllocatedMessage, setShowAllocatedMessage] = useState(false);
  const [showAllocatedModal, setShowAllocatedModal] = useState(false);
  const [allocatedProject, setAllocatedProject] = useState<any>(null);
  const [loadingAllocated, setLoadingAllocated] = useState(false);

  const [showProjectStatusModal, setShowProjectStatusModal] = useState(false);
  const [projectStatus, setProjectStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const [teamInfo, setTeamInfo] = useState<any>(null);
  const [loadingTeam, setLoadingTeam] = useState(false);

  if (!user || user.role !== 'STUDENT') return null;

  const { isInTeam } = user;
  const isTeamLead = isInTeam && user.isTeamLead === true;

  const handleViewAllocatedProject = async () => {
    setLoadingAllocated(true);
    setShowAllocatedModal(true);
    try {
      const res = await getAssignedProject(user.studentId);
      setAllocatedProject(res.data);
    } catch (err: any) {
      setAllocatedProject(null);
      Alert.alert('No Project', err?.response?.data?.message || 'No project assigned yet');
    } finally {
      setLoadingAllocated(false);
    }
  };

  const handleViewProjectStatus = async () => {
    setLoadingStatus(true);
    setShowProjectStatusModal(true);
    try {
      const res = await getProjectRequestsStatus(user.studentId);
      setProjectStatus(res.data);
    } catch (err: any) {
      setProjectStatus(null);
      Alert.alert('Error', err?.response?.data?.message || 'Could not fetch status');
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (isInTeam) {
      setLoadingTeam(true);
      getTeamInfo(user.studentId)
        .then(res => setTeamInfo(res.data))
        .catch(() => setTeamInfo(null))
        .finally(() => setLoadingTeam(false));
    }
  }, [isInTeam, user.studentId]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Home</Text>
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={styles.content}>
          {!isInTeam ? (
            <>
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Team Actions
                </Text>

                <TouchableOpacity
                  style={[styles.actionButton, { borderColor: colors.primary }]}
                  onPress={() => navigation.navigate('CreateTeam')}
                >
                  <Text style={[styles.actionText, { color: colors.primary }]}>
                    Create Team
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.actionButton, { borderColor: colors.primary }]}
                  onPress={() => navigation.navigate('JoinTeam')}
                >
                  <Text style={[styles.actionText, { color: colors.primary }]}>
                    Join Team
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Requests Sent — only for students not in a team */}
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  Requests Sent
                </Text>
                <Text style={[styles.label, { color: colors.subText }]}>
                  View all join requests you have sent to teams.
                </Text>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { borderColor: colors.primary, marginTop: 12 },
                  ]}
                  onPress={() => navigation.navigate('SentRequests')}
                >
                  <Text style={[styles.actionText, { color: colors.primary }]}>
                    View Sent Requests
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  My Team
                </Text>
                {loadingTeam ? (
                  <Text style={{ color: colors.subText }}>Loading...</Text>
                ) : teamInfo ? (
                  <>
                    <Text style={[styles.label, { color: colors.subText }]}>
                      Team Name
                    </Text>
                    <Text style={[styles.value, { color: colors.text }]}>
                      {teamInfo.teamName}
                    </Text>

                    <Text style={[styles.label, { color: colors.subText }]}>
                      Team Lead
                    </Text>
                    <Text style={[styles.value, { color: colors.text }]}>
                      {teamInfo.teamLead}
                    </Text>

                    <Text style={[styles.label, { color: colors.subText }]}>
                      Members
                    </Text>
                    {teamInfo.members?.map((m: string, idx: number) => (
                      <Text key={idx} style={[styles.value, { color: colors.text }]}>
                        • {m}
                      </Text>
                    ))}
                  </>
                ) : (
                  <Text style={{ color: colors.subText }}>No team info found.</Text>
                )}
              </View>

              {/* Received Requests — only for team lead */}
              {isTeamLead && (
                <View style={[styles.card, { backgroundColor: colors.card }]}>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>
                    Join Requests
                  </Text>
                  <Text style={[styles.label, { color: colors.subText }]}>
                    Review incoming requests from students who want to join your
                    team.
                  </Text>
                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      { borderColor: colors.primary, marginTop: 12 },
                    ]}
                    onPress={() => navigation.navigate('ReceivedRequests')}
                  >
                    <Text
                      style={[styles.actionText, { color: colors.primary }]}
                    >
                      View Received Requests
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}

          {/* Projects Section */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Projects
            </Text>

            <TouchableOpacity
              style={[styles.actionButton, { borderColor: colors.primary }]}
              onPress={() => navigation.navigate('ViewProjects')}
            >
              <Text style={[styles.actionText, { color: colors.primary }]}>
                View Projects
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { borderColor: colors.primary }]}
              onPress={handleViewAllocatedProject}
            >
              <Text style={[styles.actionText, { color: colors.primary }]}>
                View Allocated Project
              </Text>
            </TouchableOpacity>

            {isTeamLead && (
              <TouchableOpacity
                style={[styles.actionButton, { borderColor: colors.primary }]}
                onPress={handleViewProjectStatus}
              >
                <Text style={[styles.actionText, { color: colors.primary }]}>
                  View Project Requests Status
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>

        {/* Allocated Project Modal */}
        <Modal visible={showAllocatedModal} transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: '#0008', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: colors.card, padding: 24, borderRadius: 12, width: '85%' }}>
              <TouchableOpacity onPress={() => setShowAllocatedModal(false)} style={{ alignSelf: 'flex-end' }}>
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Close</Text>
              </TouchableOpacity>
              {loadingAllocated ? (
                <ActivityIndicator color={colors.primary} />
              ) : allocatedProject ? (
                <>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>Allocated Project</Text>
                  <Text style={{ color: colors.text, fontWeight: 'bold' }}>{allocatedProject.title}</Text>
                  <Text style={{ color: colors.subText }}>{allocatedProject.description}</Text>
                  <Text style={{ color: colors.text, marginTop: 8 }}>Faculty: {allocatedProject.facultyName}</Text>
                </>
              ) : (
                <Text style={{ color: colors.subText }}>No project assigned yet.</Text>
              )}
            </View>
          </View>
        </Modal>

        {/* Project Requests Status Modal */}
        <Modal visible={showProjectStatusModal} transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: '#0008', justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ backgroundColor: colors.card, padding: 24, borderRadius: 12, width: '90%', maxHeight: '80%' }}>
              <TouchableOpacity onPress={() => setShowProjectStatusModal(false)} style={{ alignSelf: 'flex-end' }}>
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Close</Text>
              </TouchableOpacity>
              {loadingStatus ? (
                <ActivityIndicator color={colors.primary} />
              ) : projectStatus ? (
                <ScrollView>
                  <Text style={[styles.cardTitle, { color: colors.text }]}>Project Requests Status</Text>
                  <Text style={{ color: colors.primary, marginTop: 8, fontWeight: 'bold' }}>Upcoming</Text>
                  {projectStatus.upcoming.length === 0 && (
                    <Text style={{ color: colors.subText }}>No upcoming requests.</Text>
                  )}
                  {projectStatus.upcoming.map((p: any) => (
                    <View key={p.projectId} style={{ marginVertical: 6 }}>
                      <Text style={{ color: colors.text }}>{p.title}</Text>
                      <Text style={{ color: colors.subText }}>Faculty: {p.facultyName || 'N/A'}</Text>
                      <Text style={{ color: colors.subText }}>Status: {p.status}</Text>
                    </View>
                  ))}
                  <Text style={{ color: colors.primary, marginTop: 12, fontWeight: 'bold' }}>Completed</Text>
                  {projectStatus.completed.length === 0 && (
                    <Text style={{ color: colors.subText }}>No completed requests.</Text>
                  )}
                  {projectStatus.completed.map((p: any) => (
                    <View key={p.projectId} style={{ marginVertical: 6 }}>
                      <Text style={{ color: colors.text }}>{p.title}</Text>
                      <Text style={{ color: colors.subText }}>Faculty: {p.facultyName || 'N/A'}</Text>
                      <Text style={{ color: colors.subText }}>Status: {p.status}</Text>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <Text style={{ color: colors.subText }}>No data found.</Text>
              )}
            </View>
          </View>
        </Modal>

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
            onPress={() => navigation.navigate('ScheduledMeetings')}
          >
            <Image
              source={require('../assets/meeting.png')}
              style={styles.tabIcon}
            />
            <Text style={[styles.tab, { color: colors.subText }]}>
              Meetings
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
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

export default StudentHomeScreen;

/* ======================= STYLES ======================= */

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    height: 60,
    paddingHorizontal: 20,
    justifyContent: 'center',
    elevation: 4,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '500',
  },

  content: {
    padding: 16,
  },

  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },

  label: {
    fontSize: 13,
    marginTop: 8,
  },

  value: {
    fontSize: 14,
    marginTop: 2,
  },

  actionButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },

  actionText: {
    fontWeight: '600',
  },

  placeholderText: {
    fontStyle: 'italic',
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
});


