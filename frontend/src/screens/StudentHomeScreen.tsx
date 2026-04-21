import React, { useContext, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { StudentAuthContext } from '../context/StudentAuthContext';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { getProjectRequestsStatus, getAssignedProject, getTeamInfo, getDepartmentDeadlines, leaveTeam, assignTeamLeader } from '../api/studentApi';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { usePushNotifications } from '../hooks/usePushNotifications';
import { getUnreadCount } from '../api/notificationApi';

type StudentHomeNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'StudentHome'
>;

// ── Tiny icon helper ──────────────────────────────────────────────────────────
const Icon = ({ name, size = 18 }: { name: string; size?: number }) => {
  const { colors } = useContext(ThemeContext);
  const isDark = colors.background === '#111827';

  const icons: Record<string, any> = {
    team: isDark
      ? require('../assets/team-white.png')
      : require('../assets/team.png'),

    create: isDark
      ? require('../assets/create-white.png')
      : require('../assets/create.png'),

    join: isDark
      ? require('../assets/join-white.png')
      : require('../assets/join.png'),

    requests: isDark
      ? require('../assets/requests-white.png')
      : require('../assets/requests.png'),

    project: isDark
      ? require('../assets/project-white.png')
      : require('../assets/project.png'),

    allocated: isDark
      ? require('../assets/allocated-white.png')
      : require('../assets/allocated.png'),

    status: isDark
      ? require('../assets/status-white.png')
      : require('../assets/status.png'),

    close: isDark
      ? require('../assets/close-white.png')
      : require('../assets/close.png'),

    lead: isDark
      ? require('../assets/lead-white.png')
      : require('../assets/lead.png'),

    info: isDark
      ? require('../assets/info-white.png')
      : require('../assets/info.png'),
  };

  return (
    <Image
      source={icons[name]}
      style={{ width: size, height: size, resizeMode: 'contain' }}
    />
  );
};

// ── SectionLabel ──────────────────────────────────────────────────────────────
const SectionLabel = ({ label, colors }: { label: string; colors: any }) => (
  <Text style={[styles.sectionLabel, { color: colors.subText }]}>
    {label.toUpperCase()}
  </Text>
);

// ── ActionRow ─────────────────────────────────────────────────────────────────
const ActionRow = ({
  label,
  sublabel,
  icon,
  colors,
  accentSoft,
  onPress,
  badge,
  loading,
}: {
  label: string;
  sublabel: string;
  icon: string;
  colors: any;
  accentSoft: string;
  onPress: () => void;
  badge?: string;
  loading?: boolean;
}) => (
  <TouchableOpacity style={styles.actionRow} onPress={onPress} activeOpacity={0.65}>
    <View style={[styles.actionIconWrap, { backgroundColor: accentSoft }]}>
      <Icon name={icon} size={17} />
    </View>
    <View style={styles.actionRowText}>
      <Text style={[styles.actionRowLabel, { color: colors.text }]}>{label}</Text>
      <Text style={[styles.actionRowSub, { color: colors.subText }]}>{sublabel}</Text>
    </View>
    {loading ? (
      <ActivityIndicator size="small" color={colors.primary} />
    ) : badge ? (
      <View style={[styles.badgePill, { backgroundColor: colors.primary }]}>
        <Text style={styles.badgePillText}>{badge}</Text>
      </View>
    ) : (
      <Text style={[styles.chevron, { color: colors.subText }]}>›</Text>
    )}
  </TouchableOpacity>
);

// ── ProjectStatusRow ──────────────────────────────────────────────────────────
const ProjectStatusRow = ({
  project,
  colors,
  divider,
}: {
  project: any;
  colors: any;
  divider: string;
}) => {
  const statusColors: Record<string, { bg: string; text: string }> = {
    PENDING: { bg: '#FEF3C7', text: '#92400E' },
    ACCEPTED: { bg: '#D1FAE5', text: '#065F46' },
    REJECTED: { bg: '#FEE2E2', text: '#991B1B' },
    SCHEDULED: { bg: '#DBEAFE', text: '#1E40AF' },
    COMPLETED: { bg: '#EDE9FE', text: '#5B21B6' },
    APPROVED: { bg: '#D1FAE5', text: '#065F46' },
  };
  const s = statusColors[project.status] ?? { bg: '#F3F4F6', text: '#374151' };
  return (
    <View style={[styles.projectStatusRow, { borderBottomColor: divider }]}>
      <Text style={[styles.psTitle, { color: colors.text }]}>{project.title}</Text>
      <Text style={[styles.psFaculty, { color: colors.subText }]}>
        {project.facultyName || 'N/A'}
      </Text>
      <View
        style={{
          backgroundColor: s.bg,
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 999,
          alignSelf: 'flex-start',
          marginTop: 4,
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: '700', color: s.text }}>
          {project.status}
        </Text>
      </View>
    </View>
  );
};

// ── Main Screen ───────────────────────────────────────────────────────────────
const StudentHomeScreen: React.FC = () => {
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation<StudentHomeNavigationProp>();
  const { studentUser, setStudentUser, loading } = useContext(StudentAuthContext);
  const { setUser } = useContext(AuthContext); // ✅ Added AuthContext
  // ✅ ALL hooks are declared unconditionally — no early returns before this block
  const [showAllocatedModal, setShowAllocatedModal] = useState(false);
  const [allocatedProject, setAllocatedProject] = useState<any>(null);
  const [loadingAllocated, setLoadingAllocated] = useState(false);
  const [allocatedMessage, setAllocatedMessage] = useState<string | null>(null);
  const [showProjectStatusModal, setShowProjectStatusModal] = useState(false);
  const [projectStatus, setProjectStatus] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [teamInfo, setTeamInfo] = useState<any>(null);
  const [loadingTeam, setLoadingTeam] = useState(false);
  const [teamLoaded, setTeamLoaded] = useState(false);
  const [deadlines, setDeadlines] = useState<any>(null);
  const [isTeamFormationLocked, setIsTeamFormationLocked] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Initialize Push Notifications
  usePushNotifications();

  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const fetchDeadlines = async (id: number) => {
        try {
          const res = await getDepartmentDeadlines(id);
          if (res.data && res.data.teamFormationDeadline) {
            setDeadlines(res.data);
            const deadlineDate = new Date(res.data.teamFormationDeadline);
            const now = new Date();
            setIsTeamFormationLocked(now > deadlineDate);
          }
        } catch (e) {
          console.log('[StudentHomeScreen] Could not parse deadlines');
        }
      };

      const loadTeam = async () => {
        try {
          setLoadingTeam(true);

          const studentId = await AsyncStorage.getItem('studentId');
          if (!studentId) return;

          await fetchDeadlines(Number(studentId));

          const res = await getTeamInfo(Number(studentId));
          console.log("TEAM API:", res.data);

          if (!isActive) return;

          setTeamInfo(res.data);

          const storedUserStr = await AsyncStorage.getItem('user');
          if (storedUserStr) {
            const storedUser = JSON.parse(storedUserStr);
            const isLead = res.data.teamLeadId === Number(studentId);

            const updatedUser = {
              ...studentUser,
              isInTeam: true,
              isTeamLead: isLead,
            };

            // ✅ update BOTH contexts
            setStudentUser(updatedUser);
            setUser(updatedUser as any);
          }

          setTeamLoaded(true); // ✅ mark loaded
        } catch (err) {
          console.log('TEAM LOAD ERROR:', err);
        } finally {
          if (isActive) setLoadingTeam(false);
        }
      };

      const loadUnreadCount = async () => {
        try {
          const res = await getUnreadCount();
          setUnreadCount(res.data);
        } catch (e) {
          console.log('Unread count fetch error:', e);
        }
      };

      loadTeam();
      loadUnreadCount();

      return () => {
        isActive = false;
      };
    }, []) // Re-run on focus safely to keep deadlines fresh
  );


  console.log("studentUser:", studentUser);
  // ✅ Conditional returns AFTER all hooks
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading app...</Text>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (!studentUser) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text style={{ color: colors.text, marginBottom: 10 }}>
          Loading user...
        </Text>
        <ActivityIndicator color={colors.primary} />
      </SafeAreaView>
    );
  }

  if (studentUser.role !== 'STUDENT') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  // Derived values
  const { isInTeam } = studentUser;
  const isTeamLead = isInTeam && studentUser.isTeamLead === true;
  const isDark = colors.background === '#111827';
  const accentSoft = isDark ? 'rgba(96,165,250,0.12)' : 'rgba(37,99,235,0.07)';
  const divider = isDark ? '#374151' : '#E5E7EB';
  const successColor = '#10B981';
  const refreshTeam = () => {
    setTeamLoaded(false);
  };

  const handleLeaveTeam = () => {
    Alert.alert(
      "Leave Team?",
      "Are you sure you want to leave this team? If you are the only member, the team will be deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              if (!studentUser?.studentId) return;
              await leaveTeam(Number(studentUser.studentId));
              Alert.alert("Success", "You have left the team.");

              const updatedUser = { ...studentUser, isInTeam: false, isTeamLead: false };
              setStudentUser(updatedUser);
              setUser(updatedUser as any);
              setTeamInfo(null);
            } catch (err: any) {
              Alert.alert("Error", err?.response?.data?.error || "Could not leave team.");
            }
          }
        }
      ]
    );
  };

  const handleAssignLeader = (newLeadId: number, memberName: string) => {
    Alert.alert(
      "Transfer Leadership",
      `Are you sure you want to make ${memberName} the new Team Leader? You will become a regular member.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Transfer",
          style: "destructive",
          onPress: async () => {
            try {
              if (!studentUser?.studentId) return;
              await assignTeamLeader(Number(studentUser.studentId), newLeadId);
              Alert.alert("Success", "Leadership transferred successfully.");

              const res = await getTeamInfo(Number(studentUser.studentId));
              setTeamInfo(res.data);

              const updatedUser = { ...studentUser, isTeamLead: false };
              setStudentUser(updatedUser);
              setUser(updatedUser as any);
            } catch (err: any) {
              Alert.alert("Error", err?.response?.data?.error || "Could not assign new leader.");
            }
          }
        }
      ]
    );
  };
  // ✅ FIXED: handleViewAllocatedProject
  const handleViewAllocatedProject = async () => {
    setLoadingAllocated(true);
    setAllocatedMessage(null);
    try {
      if (!studentUser?.studentId) {
        setAllocatedMessage('Student ID not found');
        return;
      }

      console.log('[StudentHomeScreen] 📡 Fetching allocated project for student:', studentUser.studentId);

      const res = await getAssignedProject(Number(studentUser.studentId));

      console.log('[StudentHomeScreen] Response:', res);

      if (res) {
        const { projectTitle, status, projectId } = res;

        console.log('[StudentHomeScreen] Project Title:', projectTitle);
        console.log('[StudentHomeScreen] Status:', status);
        console.log('[StudentHomeScreen] Project ID:', projectId);

        // Check if project is actually assigned (don't compare to specific string)
        if (
          projectTitle &&
          projectTitle !== 'Project not assigned yet' &&
          projectTitle !== null &&
          projectTitle.trim() !== ''
        ) {
          console.log('[StudentHomeScreen] ✅ Navigating to AllocatedProject');
          navigation.navigate('AllocatedProject' as any);
        } else {
          console.log('[StudentHomeScreen] ❌ Project not allocated');
          setAllocatedMessage('Your project has not been allocated yet. Please wait for Faculty Coordinator assignment.');
        }
      } else {
        setAllocatedMessage('Unable to fetch project information. Please try again.');
      }
    } catch (err: any) {
      console.log('[StudentHomeScreen] ❌ Error fetching allocated project:', err);
      console.log('[StudentHomeScreen] Error response:', err?.response?.data);

      setAllocatedMessage(
        err?.response?.data?.message ||
        err?.message ||
        'Your project has not been allocated yet.'
      );
    } finally {
      setLoadingAllocated(false);
    }
  };
  const handleViewProjectStatus = async () => {
    setLoadingStatus(true);
    setShowProjectStatusModal(true);
    try {
      const res = await getProjectRequestsStatus(Number(studentUser!.studentId));
      setProjectStatus(res);
    } catch (err: any) {
      setProjectStatus(null);
      Alert.alert('Error', err?.response?.data?.message || 'Could not fetch status');
    } finally {
      setLoadingStatus(false);
    }
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const map: Record<string, { bg: string; text: string }> = {
      PENDING: { bg: '#FEF3C7', text: '#92400E' },
      ACCEPTED: { bg: '#D1FAE5', text: '#065F46' },
      REJECTED: { bg: '#FEE2E2', text: '#991B1B' },
      SCHEDULED: { bg: '#DBEAFE', text: '#1E40AF' },
      COMPLETED: { bg: '#EDE9FE', text: '#5B21B6' },
      APPROVED: { bg: '#D1FAE5', text: '#065F46' },
    };
    const s = map[status] ?? { bg: accentSoft, text: colors.primary };
    return (
      <View
        style={{
          backgroundColor: s.bg,
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 999,
          alignSelf: 'flex-start',
          marginTop: 2,
        }}
      >
        <Text style={{ fontSize: 11, fontWeight: '700', color: s.text, letterSpacing: 0.5 }}>
          {status}
        </Text>
      </View>
    );
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>

        {/* Header */}
        <View
          style={[
            styles.header,
            { backgroundColor: colors.card, borderBottomColor: divider },
          ]}
        >
          {/* LEFT SIDE (TEXT) */}
          <View>
            <Text style={[styles.headerGreeting, { color: colors.subText }]}>
              Welcome back,
            </Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {studentUser.name ?? 'Student'}
            </Text>
          </View>

          {/* RIGHT SIDE (NOTIFICATIONS / BELL BUTTON) */}
          <TouchableOpacity
            style={[styles.avatarBadge, { backgroundColor: accentSoft, padding: 8 }]}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Image
              source={require('../assets/bell.png')}
              style={{ width: 24, height: 24, resizeMode: 'contain' }}
            />
            {unreadCount > 0 && (
              <View
                style={[
                  styles.unreadBadge,
                  {
                    backgroundColor: '#ef4444',
                    position: 'absolute',
                    top: -2,
                    right: -2,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    justifyContent: 'center',
                    alignItems: 'center',
                    borderWidth: 2,
                    borderColor: colors.card,
                  },
                ]}
              >
                <Text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Scrollable Body */}
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {/* Team / No-team section */}
          {!isInTeam ? (
            <>
              <SectionLabel label="Team" colors={colors} />
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <ActionRow
                  label="Create Team"
                  sublabel={isTeamFormationLocked ? "Deadline has passed" : "Start a new project team"}
                  icon="create"
                  colors={colors}
                  accentSoft={isTeamFormationLocked ? 'transparent' : accentSoft}
                  onPress={() => {
                    if (isTeamFormationLocked) {
                      Alert.alert("Locked", "The deadline for forming a team has passed.");
                      return;
                    }
                    navigation.navigate('CreateTeam');
                  }}
                />
                <View style={[styles.rowDivider, { backgroundColor: divider }]} />
                <ActionRow
                  label="Join Team"
                  sublabel={isTeamFormationLocked ? "Deadline has passed" : "Send a request to join a team"}
                  icon="join"
                  colors={colors}
                  accentSoft={isTeamFormationLocked ? 'transparent' : accentSoft}
                  onPress={() => {
                    if (isTeamFormationLocked) {
                      Alert.alert("Locked", "The deadline for joining a team has passed.");
                      return;
                    }
                    navigation.navigate('JoinTeam');
                  }}
                />
              </View>

              <SectionLabel label="Requests" colors={colors} />
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <ActionRow
                  label="View Sent Requests"
                  sublabel="Track all your join requests"
                  icon="requests"
                  colors={colors}
                  accentSoft={accentSoft}
                  onPress={() => navigation.navigate('SentRequests')}
                />
              </View>
            </>
          ) : (
            <>
              <SectionLabel label="My Team" colors={colors} />
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                {loadingTeam ? (
                  <ActivityIndicator color={colors.primary} style={{ marginVertical: 20 }} />
                ) : teamInfo ? (
                  <>
                    <View style={styles.teamHeaderRow}>
                      <View style={[styles.teamIconCircle, { backgroundColor: accentSoft }]}>
                        <Icon name="team" size={22} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Text style={[styles.teamName, { color: colors.text }]}>
                            {teamInfo.teamName}
                          </Text>
                          {!isTeamFormationLocked && (
                            <TouchableOpacity onPress={handleLeaveTeam} style={{ padding: 4 }}>
                              <Image
                                source={isDark ? require('../assets/leave-white.png') : require('../assets/leave.png')}
                                style={{ width: 22, height: 22, resizeMode: 'contain', opacity: 0.8 }}
                              />
                            </TouchableOpacity>
                          )}
                        </View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                          <Icon name="lead" size={12} />
                          <Text style={[styles.teamLead, { color: colors.subText, marginLeft: 4 }]}>
                            {teamInfo.teamLead}
                          </Text>
                        </View>
                      </View>
                    </View>

                    <View style={[styles.membersContainer, { borderTopColor: divider }]}>
                      <Text style={[styles.membersLabel, { color: colors.subText }]}>MEMBERS</Text>
                      <View style={styles.membersList}>
                        {teamInfo.members?.map((m: any, idx: number) => {
                          const mName = m.name || m;
                          const mId = m.id;
                          return (
                            <TouchableOpacity
                              key={idx}
                              activeOpacity={isTeamLead && !isTeamFormationLocked && mId && mId !== Number(studentUser?.studentId) ? 0.6 : 1}
                              style={[styles.memberChip, { backgroundColor: accentSoft }]}
                              onPress={() => {
                                if (isTeamLead && !isTeamFormationLocked && mId && mId !== Number(studentUser?.studentId)) {
                                  handleAssignLeader(mId, mName);
                                }
                              }}
                            >
                              <Text style={[styles.memberChipText, { color: colors.primary }]}>
                                {mName}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  </>
                ) : (
                  <Text style={[styles.emptyText, { color: colors.subText }]}>
                    No team info found.
                  </Text>
                )}
              </View>

              {isTeamLead && (
                <>
                  <SectionLabel label="Management" colors={colors} />
                  <View style={[styles.card, { backgroundColor: colors.card }]}>
                    <ActionRow
                      label="View Join Requests"
                      sublabel="Review incoming requests from students"
                      icon="requests"
                      colors={colors}
                      accentSoft={accentSoft}
                      onPress={() => navigation.navigate('ReceivedRequests')}
                      badge="Review"
                    />
                  </View>
                </>
              )}
            </>
          )}

          {/* Projects section */}
          <SectionLabel label="Projects" colors={colors} />
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ActionRow
              label="Browse Projects"
              sublabel="Explore all available projects"
              icon="project"
              colors={colors}
              accentSoft={accentSoft}
              onPress={() => navigation.navigate('ViewProjects')}
            />
            <View style={[styles.rowDivider, { backgroundColor: divider }]} />
            <ActionRow
              label="Allocated Project"
              sublabel="View your assigned project details"
              icon="allocated"
              colors={colors}
              accentSoft={accentSoft}
              onPress={handleViewAllocatedProject}
              loading={loadingAllocated}
            />
            {allocatedMessage && (
              <View
                style={[
                  styles.inlineAlert,
                  { backgroundColor: accentSoft, borderColor: colors.border },
                ]}
              >
                <Icon name="info" size={13} />
                <Text style={[styles.inlineAlertText, { color: colors.subText }]}>
                  {allocatedMessage}
                </Text>
              </View>
            )}
            <View style={[styles.rowDivider, { backgroundColor: divider }]} />
            <ActionRow
              label="Project Requests Status"
              sublabel="Track the status of all requests"
              icon="status"
              colors={colors}
              accentSoft={accentSoft}
              onPress={() => navigation.navigate('TeamProjectRequests' as any)}
            />
          </View>

          <View style={{ height: 16 }} />
        </ScrollView>

        {/* Allocated Project Modal removed - now uses separate screen */}

        {/* Project Requests Status Modal */}
        <Modal visible={showProjectStatusModal} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View
              style={[styles.modalSheet, { backgroundColor: colors.card, maxHeight: '82%' }]}
            >
              <View style={styles.modalHandle} />
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Project Requests</Text>
                <TouchableOpacity
                  onPress={() => setShowProjectStatusModal(false)}
                  style={[styles.closeBtn, { backgroundColor: accentSoft }]}
                >
                  <Icon name="close" size={13} />
                </TouchableOpacity>
              </View>

              {loadingStatus ? (
                <ActivityIndicator color={colors.primary} style={{ marginVertical: 32 }} />
              ) : projectStatus ? (
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.statusGroup}>
                    <View style={[styles.statusGroupLabel, { backgroundColor: accentSoft }]}>
                      <Text style={[styles.statusGroupText, { color: colors.primary }]}>
                        UPCOMING
                      </Text>
                    </View>
                    {projectStatus.upcoming.length === 0 ? (
                      <Text style={[styles.emptyText, { color: colors.subText }]}>
                        No upcoming requests.
                      </Text>
                    ) : (
                      projectStatus.upcoming.map((p: any) => (
                        <ProjectStatusRow
                          key={p.projectId}
                          project={p}
                          colors={colors}
                          divider={divider}
                        />
                      ))
                    )}
                  </View>

                  <View style={[styles.statusGroup, { marginTop: 16 }]}>
                    <View
                      style={[
                        styles.statusGroupLabel,
                        {
                          backgroundColor: isDark
                            ? 'rgba(16,185,129,0.12)'
                            : 'rgba(16,185,129,0.08)',
                        },
                      ]}
                    >
                      <Text style={[styles.statusGroupText, { color: successColor }]}>
                        COMPLETED
                      </Text>
                    </View>
                    {projectStatus.completed.length === 0 ? (
                      <Text style={[styles.emptyText, { color: colors.subText }]}>
                        No completed requests.
                      </Text>
                    ) : (
                      projectStatus.completed.map((p: any) => (
                        <ProjectStatusRow
                          key={p.projectId}
                          project={p}
                          colors={colors}
                          divider={divider}
                        />
                      ))
                    )}
                  </View>
                  <View style={{ height: 16 }} />
                </ScrollView>
              ) : (
                <Text style={[styles.emptyText, { color: colors.subText }]}>No data found.</Text>
              )}
            </View>
          </View>
        </Modal>

        {/* Bottom Tab */}
        <View
          style={[styles.bottomTab, { backgroundColor: colors.card, borderTopColor: divider }]}
        >
          <View style={styles.tabItem}>
            <View style={[styles.tabActiveIndicator, { backgroundColor: colors.primary }]} />
            <Image source={require('../assets/home-color.png')} style={styles.tabIcon} />
            <Text style={[styles.tabActive, { color: colors.primary }]}>Home</Text>
          </View>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigation.navigate('ScheduledMeetings')}
          >
            <Image
              source={isDark ? require('../assets/meeting-white.png') : require('../assets/meeting.png')}
              style={styles.tabIcon}
            />
            <Text style={[styles.tab, { color: colors.subText }]}>Meetings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
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

export default StudentHomeScreen;

// ── Styles ────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    height: 72,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 2,
  },
  headerGreeting: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  avatarBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 17,
    fontWeight: '800',
  },

  content: { padding: 16, paddingBottom: 8 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 6,
    marginTop: 4,
    marginLeft: 2,
  },

  card: {
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  rowDivider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 16,
  },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  actionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRowText: { flex: 1 },
  actionRowLabel: { fontSize: 14, fontWeight: '600' },
  actionRowSub: { fontSize: 12, marginTop: 1 },
  chevron: { fontSize: 22, fontWeight: '300', marginRight: 2 },

  badgePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  badgePillText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  teamHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  teamIconCircle: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  teamName: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2 },
  teamLead: { fontSize: 13 },
  membersContainer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  membersLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.1,
    marginBottom: 8,
  },
  membersList: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  memberChip: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  memberChipText: { fontSize: 12, fontWeight: '600' },

  emptyText: {
    fontSize: 13,
    fontStyle: 'italic',
    padding: 12,
    textAlign: 'center',
  },

  inlineAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  inlineAlertText: { fontSize: 13, flex: 1 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    elevation: 10,
  },
  modalHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', letterSpacing: -0.3 },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  projectBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  projectTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  projectDesc: { fontSize: 13, lineHeight: 20 },
  facultyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  facultyLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.4 },
  facultyValue: { fontSize: 13, fontWeight: '600' },

  statusGroup: { gap: 2 },
  statusGroupLabel: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  statusGroupText: { fontSize: 11, fontWeight: '800', letterSpacing: 1 },
  projectStatusRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  psTitle: { fontSize: 14, fontWeight: '600' },
  psFaculty: { fontSize: 12, marginTop: 2 },

  bottomTab: {
    height: 62,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: { alignItems: 'center', justifyContent: 'center' },
  tabActiveIndicator: {
    position: 'absolute',
    top: -10,
    width: 24,
    height: 3,
    borderRadius: 999,
  },
  tab: { fontSize: 11, marginTop: 3 },
  tabActive: { fontSize: 11, fontWeight: '700', marginTop: 3 },
  tabIcon: { width: 22, height: 22, marginBottom: 3, resizeMode: 'contain' },
  unreadBadge: {
    paddingHorizontal: 4,
    borderWidth: 2,
  },
  //   headerGreeting: {
  //   fontSize: 13,
  //   fontWeight: '500',
  //   letterSpacing: 0.6,
  // },

  // headerTitle: {
  //   fontSize: 22,
  //   fontWeight: '800',
  //   letterSpacing: -0.4,
  // },
});
