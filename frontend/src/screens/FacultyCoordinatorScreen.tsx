import React, { useState, useContext, useEffect, useRef, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal, Image,
  StyleSheet, StatusBar, TextInput, ActivityIndicator, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../theme/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { AlertContext } from '../context/AlertContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { coordinatorApi } from '../api/coordinatorApi';
import { getFacultyProfile } from '../api/facultyApi';
import { BASE_URL } from '../api/api';
import DegreeSelector from '../components/DegreeSelector';
import { useDegree } from '../context/DegreeContext';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const FacultyCoordinatorDashboard: React.FC = () => {
  const { colors } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const navigation = useNavigation<NavProp>();
  const { selectedDegree } = useDegree();

  const isDark = colors.background === '#111827';
  const accentSoft = isDark ? 'rgba(96,165,250,0.12)' : 'rgba(37,99,235,0.07)';
  const divider = colors.border;

  // ───────── ICON HELPER ─────────
  const Icon = ({ name, size = 18, color }: { name: string; size?: number; color?: string }) => {
    const icons: any = {
      overview: isDark ? require('../assets/overview-white.png') : require('../assets/overview.png'),
      faculty: isDark ? require('../assets/faculty-white.png') : require('../assets/faculty.png'),
      students: isDark ? require('../assets/students-white.png') : require('../assets/students.png'),
      team: isDark ? require('../assets/team-white.png') : require('../assets/team.png'),
      rules: isDark ? require('../assets/rules-white.png') : require('../assets/rules.png'),
      search: isDark ? require('../assets/search-white.png') : require('../assets/search.png'),
      download: isDark ? require('../assets/download-white.png') : require('../assets/download.png'),
      delete: isDark ? require('../assets/close-white.png') : require('../assets/close.png'),
      info: require('../assets/info.png'),
    };
    return (
      <Image 
        source={icons[name] || icons.info} 
        style={{ width: size, height: size, tintColor: color }} 
      />
    );
  };

  // ───────── STATE ─────────
  const [stats, setStats] = useState<any>(null);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [studentTeamData, setStudentTeamData] = useState<any>(null);
  const [rules, setRules] = useState<any>({ maxTeamSize: 3, maxStudentsPerFaculty: 6, maxProjectsPerFaculty: 2 });
  const [tempRules, setTempRules] = useState(rules);

  const [activeTab, setActiveTab] = useState<'overview' | 'faculties' | 'students' | 'download' | 'rules'>('overview');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const { setSelectedDegree } = useDegree();

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');
  const [selectedTeamForAllocation, setSelectedTeamForAllocation] = useState<any>(null);
  const [showAllocateFacultyModal, setShowAllocateFacultyModal] = useState(false);
  const [facultyProjectsForTeam, setFacultyProjectsForTeam] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  // ✅ NEW: Create & Join Team States
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [showJoinTeamModal, setShowJoinTeamModal] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedStudentForJoin, setSelectedStudentForJoin] = useState<any>(null);
  const [availableTeamsToJoin, setAvailableTeamsToJoin] = useState<any[]>([]);

  const [facultySearchQuery, setFacultySearchQuery] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // ── Blended Alert State ──
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const isMounted = useRef(false);

  const showLocalMsg = (text: string, type: 'success' | 'error') => {
    setMsg({ text, type });
    // Automatically hide after 1 second
    setTimeout(() => {
      if (isMounted.current) setMsg(null);
    }, 1000);
  };

  // ───────── FETCH ─────────
  const fetchStudentTeamData = async () => {
    if (!user?.token) return;
    try {
      console.log(`[FacultyCoordinatorDashboard] 🔄 Fetching student and team details for ${selectedDegree}...`);
      const data = await coordinatorApi.getStudentAndTeamDetails(selectedDegree);
      setStudentTeamData(data);
      console.log('[FacultyCoordinatorDashboard] ✅ Student and team data loaded');
    } catch (err: any) {
      console.log('[FacultyCoordinatorDashboard] ❌ Error fetching student team data:', err);
    }
  };

  // ✅ NEW: Fetch Available Teams (Not Full)
  const fetchAvailableTeamsToJoin = async () => {
    if (!user?.token) return;
    try {
      console.log(`[FacultyCoordinatorDashboard] 🔄 Fetching available teams to join for ${selectedDegree}...`);
      const data = await coordinatorApi.getAvailableTeamsToJoin(selectedDegree);
      setAvailableTeamsToJoin(data || []);
      console.log('[FacultyCoordinatorDashboard] ✅ Available teams loaded:', data?.length || 0);
    } catch (err: any) {
      console.log('[FacultyCoordinatorDashboard] ❌ Error fetching available teams:', err);
      setAvailableTeamsToJoin([]);
    }
  };

  const fetchAll = async () => {
    if (!user?.token) {
      showLocalMsg("No authentication token", "error");
      return;
    }

    setLoading(true);
    try {
      console.log(`[FacultyCoordinatorDashboard] 🔄 Fetching all data for ${selectedDegree}...`);

      const [s, f, st, t, r, p] = await Promise.all([
        coordinatorApi.getDashboardStats(selectedDegree).catch(e => {
          console.log('[FacultyCoordinatorDashboard] ❌ Stats error:', e);
          return null;
        }),
        coordinatorApi.getAllFaculties(selectedDegree).catch(e => {
          console.log('[FacultyCoordinatorDashboard] ❌ Faculties error:', e);
          return null;
        }),
        coordinatorApi.getAllStudents(selectedDegree).catch(e => {
          console.log('[FacultyCoordinatorDashboard] ❌ Students error:', e);
          return null;
        }),
        coordinatorApi.getAllTeams(selectedDegree).catch(e => {
          console.log('[FacultyCoordinatorDashboard] ❌ Teams error:', e);
          return null;
        }),
        coordinatorApi.getRules(selectedDegree).catch(e => {
          console.log('[FacultyCoordinatorDashboard] ❌ Rules error:', e);
          return null;
        }),
        getFacultyProfile(selectedDegree, user!.token).catch(e => {
          console.log('[FacultyCoordinatorDashboard] ❌ Profile error:', e);
          return null;
        }),
      ]);

      if (s) {
        console.log('[FacultyCoordinatorDashboard] ✅ Stats:', s);
        setStats(s);
      }
      if (f) {
        console.log('[FacultyCoordinatorDashboard] ✅ Faculties:', f);
        setFaculties(f.map((item: any) => ({ ...item, id: String(item.facultyId) })));
      }
      if (st) {
        console.log('[FacultyCoordinatorDashboard] ✅ Students:', st);
        setStudents(st.map((item: any) => ({ ...item, id: String(item.studentId) })));
      }
      if (t) {
        console.log('[FacultyCoordinatorDashboard] ✅ Teams:', t);
        setTeams(t.map((item: any) => ({ ...item, id: String(item.teamId) })));
      }
      if (r) {
        console.log('[FacultyCoordinatorDashboard] ✅ Rules:', r);
        setRules(r);
        setTempRules(r);
      }
      if (p) {
        setProfile(p);
        // ✅ AUTO-SWITCH DEGREE BASED ON COORDINATOR TYPE
        if (p.isUGCoordinator && !p.isPGCoordinator && selectedDegree !== 'UG') {
          setSelectedDegree('UG');
        } else if (!p.isUGCoordinator && p.isPGCoordinator && selectedDegree !== 'PG') {
          setSelectedDegree('PG');
        }
      }


    } catch (err: any) {
      console.log('[FacultyCoordinatorDashboard] ❌ Error:', err);
      showLocalMsg("Failed to load data", "error");
    } finally {
      setLoading(false);
      isMounted.current = true;
    }
  };

  useEffect(() => {
    fetchAll();
  }, [user?.token, selectedDegree]);

  useEffect(() => {
    if (activeTab === 'students' && user?.token) {
      fetchStudentTeamData();
    }
  }, [activeTab, user?.token, selectedDegree]);

  // ✅ NEW: Create Team Handler
  const handleCreateTeam = async () => {
    if (!newTeamName.trim()) {
      showLocalMsg("Please enter team name", "error");
      return;
    }
    if (!selectedStudent?.id && !selectedStudent?.studentId) {
      showLocalMsg("Student not selected", "error");
      return;
    }
    try {
      setLoading(true);
      const studentId = selectedStudent.id || selectedStudent.studentId;
      console.log('[FacultyCoordinatorDashboard] 🆕 Creating team:', newTeamName);

      const result = await coordinatorApi.createTeam(newTeamName, String(studentId), selectedDegree);
      showLocalMsg("Team created successfully!", "success");
      setNewTeamName('');
      setShowCreateTeamModal(false);
      setSelectedStudent(null);
      fetchStudentTeamData();
    } catch (err: any) {
      console.log('[FacultyCoordinatorDashboard] ❌ Create team error:', err);
      showLocalMsg(err.error || "Failed to create team", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Join Team Handler
  const handleJoinTeam = async (team: any) => {
    if (!selectedStudentForJoin?.id && !selectedStudentForJoin?.studentId) {
      showLocalMsg("Student not selected", "error");
      return;
    }
    try {
      setLoading(true);
      const studentId = selectedStudentForJoin.id || selectedStudentForJoin.studentId;
      const teamId = team.teamId;
      console.log('[FacultyCoordinatorDashboard] 👥 Joining team:', teamId);

      const result = await coordinatorApi.joinTeam(String(studentId), String(teamId));
      showLocalMsg("Student joined team successfully!", "success");
      setShowJoinTeamModal(false);
      setSelectedStudentForJoin(null);
      setAvailableTeamsToJoin([]);
      fetchStudentTeamData();
    } catch (err: any) {
      console.log('[FacultyCoordinatorDashboard] ❌ Join team error:', err);
      showLocalMsg(err.error || "Failed to join team", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ NEW: Delete User Handler
  const handleDeleteUser = async (userId: number, name: string) => {
    showAlert(
      "Confirm Deletion",
      `Are you sure you want to permanently delete user "${name}"? This will dissolve any assigned teams and reset projects to "In Progress". This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: async () => {
            try {
              setLoading(true);
              const res = await coordinatorApi.deleteUser(userId);
              showLocalMsg("User deleted successfully", "success");
              fetchAll();
            } catch (err: any) {
              showLocalMsg(err.error || "Failed to delete user", "error");
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleSaveRules = async () => {
    try {
      const computedRules = {
        ...tempRules,
        maxStudentsPerFaculty: tempRules.maxTeamSize * tempRules.maxProjectsPerFaculty,
        degree: selectedDegree
      };

      await coordinatorApi.saveRules(computedRules);

      setRules(computedRules);
      // Removed: showLocalMsg("Rules updated successfully!", "success");

      console.log('[FacultyCoordinatorDashboard] ✅ Rules saved:', computedRules);
    } catch (err: any) {
      showLocalMsg(err.message || "Failed to save rules", "error");
    }
  };

  const handleDownloadReport = async () => {
    try {
      setLoading(true);
      console.log('[FacultyCoordinatorDashboard] 📥 Downloading fresh report...');

      const now = new Date();
      const dateStr = now.toISOString().split('T')[0];
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-');
      const fileName = `team_report_${dateStr}_${timeStr}_${Math.random().toString(36).substring(7)}.pdf`;

      const fileUri = FileSystem.documentDirectory + fileName;

      const { uri } = await FileSystem.downloadAsync(
        `${BASE_URL}/api/coordinator/teams/report/pdf?degree=${selectedDegree}`,
        fileUri,
        {
          headers: {
            'Authorization': `Bearer ${user!.token}`,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );

      console.log('[FacultyCoordinatorDashboard] ✅ Report downloaded to:', uri);

      if (Platform.OS === 'android') {
        const { StorageAccessFramework } = FileSystem;
        const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();

        if (permissions.granted) {
          try {
            const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
            const savedUri = await StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, 'application/pdf');
            await FileSystem.writeAsStringAsync(savedUri, base64, { encoding: FileSystem.EncodingType.Base64 });
            showLocalMsg("Report successfully saved to your chosen folder!", "success");
          } catch (e: any) {
            showLocalMsg("Failed to write file to folder.", "error");
          }
        } else {
          showLocalMsg("Folder permission was denied.", "error");
        }
      } else {
        // Fallback for iOS natively opens Save To Files from Share Sheet
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Save Team Report',
            UTI: 'com.adobe.pdf'
          });
        }
      }
    } catch (err: any) {
      showLocalMsg("Download failed: " + err.message, "error");
      console.log('[FacultyCoordinatorDashboard] ❌ Download error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ───────── SEARCH HANDLERS ─────────
  const handleSearchFaculties = async (query: string) => {
    setFacultySearchQuery(query);
    if (query.length === 0) {
      fetchAll();
      return;
    }
    try {
      console.log(`[FacultyCoordinatorDashboard] 🔍 Searching faculties (${selectedDegree}):`, query);
      const results = await coordinatorApi.searchFaculties(query, selectedDegree);
      setFaculties(results.map((item: any) => ({ ...item, id: String(item.facultyId) })));
    } catch (err) {
      console.log('[FacultyCoordinatorDashboard] ❌ Search error:', err);
    }
  };

  const handleSearchStudents = async (query: string) => {
    setStudentSearchQuery(query);
    if (query.length === 0) {
      fetchStudentTeamData();
      return;
    }
    try {
      console.log(`[FacultyCoordinatorDashboard] 🔍 Searching students (${selectedDegree}):`, query);
      const results = await coordinatorApi.searchStudents(query, selectedDegree);
      setStudents(results.map((item: any) => ({ ...item, id: String(item.studentId) })));
    } catch (err) {
      console.log('[FacultyCoordinatorDashboard] ❌ Search error:', err);
    }
  };

  // ───────── UI COMPONENTS ─────────
  const InlineAlert = () => {
    if (!msg) return null;
    const isError = msg.type === 'error';
    return (
      <View style={[
        styles.inlineAlert,
        { backgroundColor: isError ? '#fef2f2' : '#f0fdf4', borderColor: isError ? '#fecaca' : '#bbf7d0' }
      ]}>
        <Icon name="info" />
        <Text style={[styles.inlineAlertText, { color: isError ? '#b91c1c' : '#15803d' }]}>{msg.text}</Text>
        <TouchableOpacity onPress={() => setMsg(null)}>
          <Text style={{ fontSize: 16, color: isError ? '#b91c1c' : '#15803d' }}>✕</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const SectionLabel = ({ label }: { label: string }) => (
    <Text style={[styles.sectionLabel, { color: colors.subText }]}>{label.toUpperCase()}</Text>
  );

  const Card = ({ children }: any) => (
    <View style={[styles.card, { backgroundColor: colors.card }]}>{children}</View>
  );

  const SearchBox = ({ value, setValue }: any) => (
    <View style={[styles.searchBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Icon name="search" />
      <TextInput
        value={value}
        onChangeText={setValue}
        placeholder="Search..."
        placeholderTextColor={colors.subText}
        style={{ flex: 1, color: colors.text, paddingVertical: 8, marginLeft: 8 }}
      />
    </View>
  );

  // ───────── RENDERERS ─────────
  const renderOverview = () => {
    const allocationRate = stats?.totalStudents ? Math.round((stats.allocatedStudents / stats.totalStudents) * 100) : 0;

    return (
      <View style={{ gap: 16 }}>
        {loading && !stats ? (
          <Card><ActivityIndicator color={colors.primary} /></Card>
        ) : (
          <>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 }}>
              <View style={[styles.miniCard, { backgroundColor: colors.card, width: '48%' }]}>
                <View style={[styles.iconWrap, { backgroundColor: 'rgba(59,130,246,0.1)' }]}>
                  <Icon name="students" />
                </View>
                <Text style={[styles.statNum, { color: colors.text }]}>{stats?.totalStudents || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.subText }]}>Total Students</Text>
              </View>

              <View style={[styles.miniCard, { backgroundColor: colors.card, width: '48%' }]}>
                <View style={[styles.iconWrap, { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
                  <Icon name="faculty" />
                </View>
                <Text style={[styles.statNum, { color: '#059669' }]}>{stats?.allocatedStudents || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.subText }]}>Allocated</Text>
              </View>

              <View style={[styles.miniCard, { backgroundColor: colors.card, width: '48%' }]}>
                <View style={[styles.iconWrap, { backgroundColor: 'rgba(99,102,241,0.1)' }]}>
                  <Icon name="team" />
                </View>
                <Text style={[styles.statNum, { color: colors.text }]}>{stats?.totalTeams || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.subText }]}>Active Teams</Text>
              </View>

              <View style={[styles.miniCard, { backgroundColor: colors.card, width: '48%' }]}>
                <View style={[styles.iconWrap, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
                  <Icon name="faculty" />
                </View>
                <Text style={[styles.statNum, { color: colors.text }]}>{stats?.totalFaculty || 0}</Text>
                <Text style={[styles.statLabel, { color: colors.subText }]}>Total Faculty</Text>
              </View>
            </View>

            <Card>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 12 }}>
                <View>
                  <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>Allocation Status</Text>
                  <Text style={{ color: colors.subText, fontSize: 12 }}>Overall progress based on {rules.maxStudentsPerFaculty} slots per faculty</Text>
                </View>
                <Text style={{ color: colors.primary, fontSize: 24, fontWeight: '800' }}>{allocationRate}%</Text>
              </View>

              <View style={{ height: 8, backgroundColor: colors.border, borderRadius: 4, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${allocationRate}%`, backgroundColor: colors.primary }} />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                <View>
                  <Text style={{ color: colors.subText, fontSize: 10, fontWeight: '700' }}>UNALLOCATED</Text>
                  <Text style={{ color: '#D97706', fontSize: 16, fontWeight: '700' }}>{stats?.unallocatedStudents || 0}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{ color: colors.subText, fontSize: 10, fontWeight: '700' }}>REMAINING CAPACITY</Text>
                  <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '700' }}>{stats?.availableSlots || 0}</Text>
                </View>
              </View>
            </Card>

            <SectionLabel label="General Summary" />
            <Card>
              <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>
                Currently, <Text style={{ fontWeight: '700', color: colors.primary }}>{stats?.allocatedStudents || 0}</Text> out of <Text style={{ fontWeight: '700' }}>{stats?.totalStudents || 0}</Text> students have been successfully allocated to a faculty guide.
                There are <Text style={{ fontWeight: '700', color: '#ef4444' }}>{stats?.unallocatedStudents || 0}</Text> students still awaiting allocation.
              </Text>
            </Card>
          </>
        )}
      </View>
    );
  };

  const renderFaculties = () => (
    <>
      <SearchBox value={facultySearchQuery} setValue={handleSearchFaculties} />
      {faculties.map(f => {
        const isFull = f.allocatedStudents >= f.maxStudents;

        return (
          <Card key={f.id}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{f.name}</Text>
                <Text style={{ color: colors.subText, fontSize: 13, marginTop: 2 }}>{f.email}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View style={{ backgroundColor: isFull ? 'rgba(239,68,68,0.1)' : accentSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                  <Text style={{ color: isFull ? '#ef4444' : colors.primary, fontSize: 10, fontWeight: '800' }}>
                    {isFull ? 'FULL' : 'AVAILABLE'}
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => handleDeleteUser(f.userId || f.id, f.name)}
                  style={{ padding: 4 }}
                >
                  <Icon name="delete" size={18} color="#ef4444" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: divider, paddingTop: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <View>
                  <Text style={{ color: colors.subText, fontSize: 10, fontWeight: '700' }}>SLOT UTILIZATION</Text>
                  <Text style={{ color: colors.text, fontSize: 11, fontWeight: '600', marginTop: 2 }}>
                    Created: <Text style={{ fontWeight: '800', color: colors.primary }}>{f.totalCreatedSlots || 0}</Text> |
                    Given: <Text style={{ fontWeight: '800' }}>{f.allocatedStudents}</Text> |
                    Max: <Text style={{ fontWeight: '800' }}>{rules.maxStudentsPerFaculty}</Text>
                  </Text>
                </View>
                <Text style={{ color: isFull ? '#ef4444' : colors.primary, fontSize: 16, fontWeight: '800' }}>
                  {Math.min(100, Math.round((f.allocatedStudents / rules.maxStudentsPerFaculty) * 100))}%
                </Text>
              </View>
              <View style={{ height: 6, backgroundColor: colors.border, borderRadius: 3, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${Math.min(100, (f.allocatedStudents / rules.maxStudentsPerFaculty) * 100)}%`, backgroundColor: isFull ? '#ef4444' : colors.primary }} />
              </View>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 12, gap: 15 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ padding: 4, backgroundColor: accentSoft, borderRadius: 6 }}>
                  <Icon name="rules" size={12} />
                </View>
                <Text style={{ color: colors.text, fontSize: 12 }}>{f.specialization || 'General'}</Text>
              </View>
            </View>
          </Card>
        );
      })}
    </>
  );

  const renderStudents = () => (
    <View style={{ gap: 16 }}>
      <SectionLabel label="Teams in Department" />
      {studentTeamData?.teamsInDepartment && studentTeamData.teamsInDepartment.length > 0 ? (
        studentTeamData.teamsInDepartment.map((team: any) => {
          const isFull = team.memberCount >= team.maxSlots;
          return (
            <Card key={team.teamId}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>{team.teamName}</Text>
                  <Text style={{ color: colors.subText, fontSize: 12, marginTop: 4 }}>
                    Project: {team.projectTitle}
                  </Text>
                </View>
                <View style={{ backgroundColor: team.status === 'ALLOCATED' ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                  <Text style={{ color: team.status === 'ALLOCATED' ? '#22c55e' : '#f59e0b', fontSize: 10, fontWeight: '800' }}>
                    {team.status}
                  </Text>
                </View>
              </View>

              <View style={{ backgroundColor: accentSoft, padding: 12, borderRadius: 10, marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <Text style={{ color: colors.text, fontSize: 12, fontWeight: '700' }}>Members ({team.memberCount}/{team.maxSlots})</Text>
                  <View style={{ backgroundColor: isFull ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 }}>
                    <Text style={{ color: isFull ? '#ef4444' : '#22c55e', fontSize: 9, fontWeight: '800' }}>
                      {isFull ? 'FULL' : 'OPEN'}
                    </Text>
                  </View>
                </View>
                {team.memberNames && team.memberNames.map((name: string, idx: number) => (
                  <Text key={idx} style={{ color: colors.text, fontSize: 11, paddingVertical: 2 }}>• {name}</Text>
                ))}
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: divider }}>
                <View>
                  <Text style={{ color: colors.subText, fontSize: 10, fontWeight: '700' }}>GUIDE</Text>
                  <Text style={{ color: colors.text, fontSize: 12, fontWeight: '600', marginTop: 2 }}>{team.facultyName}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.miniBtn, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    setSelectedTeamForAllocation(team);
                    setShowAllocateFacultyModal(true);
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>Allocate</Text>
                </TouchableOpacity>
              </View>
            </Card>
          );
        })
      ) : (
        <Card>
          <Text style={{ color: colors.subText, textAlign: 'center' }}>No teams in department</Text>
        </Card>
      )}

      <SectionLabel label="Students Not in Team" />
      <SearchBox value={studentSearchQuery} setValue={handleSearchStudents} />
      {studentTeamData?.unallocatedStudents && studentTeamData.unallocatedStudents.length > 0 ? (
        studentTeamData.unallocatedStudents.map((s: any) => (
          <Card key={s.id || s.studentId}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: accentSoft, justifyContent: 'center', alignItems: 'center' }}>
                <Icon name="students" size={20} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}>{s.name || s.studentName}</Text>
                <Text style={{ color: colors.subText, fontSize: 12, marginTop: 2 }}>Roll: {s.rollNo || s.rollNumber}</Text>
              </View>
              <TouchableOpacity 
                onPress={() => handleDeleteUser(s.userId || s.id || s.studentId, s.name || s.studentName)}
                style={{ padding: 8 }}
              >
                <Icon name="delete" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>

            <View style={{ flexDirection: 'row', marginTop: 16, gap: 10 }}>
              <TouchableOpacity
                style={[styles.miniBtn, { backgroundColor: '#6366f1', flex: 1 }]}
                onPress={() => {
                  setSelectedStudent(s);
                  setShowCreateTeamModal(true);
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>Create Team</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.miniBtn, { backgroundColor: colors.primary, flex: 1 }]}
                onPress={() => {
                  setSelectedStudentForJoin(s);
                  fetchAvailableTeamsToJoin();
                  setShowJoinTeamModal(true);
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>Join Team</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))
      ) : (
        <Card>
          <Text style={{ color: colors.subText, textAlign: 'center' }}>All students are in teams</Text>
        </Card>
      )}
    </View>
  );

  const renderDownload = () => (
    <Card>
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 12 }}>Download Team Report</Text>
      <Text style={{ color: colors.subText, fontSize: 13, marginBottom: 16 }}>
        Generate and download a fresh PDF report of all teams and their details.
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={handleDownloadReport}
        disabled={loading}
      >

        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>
          {loading ? 'Downloading...' : 'Download Report'}
        </Text>
      </TouchableOpacity>
    </Card>
  );

  const renderedRules = React.useMemo(() => (
    <View style={{ gap: 16 }}>
      <Card>
        <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 16 }}>Allocation Rules</Text>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.subText, fontSize: 12, fontWeight: '700', marginBottom: 8 }}>Max Team Size</Text>
          <View style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <TextInput
              value={String(tempRules.maxTeamSize)}
              onChangeText={(val) => setTempRules({ ...tempRules, maxTeamSize: parseInt(val) || 0 })}
              keyboardType="number-pad"
              style={{ color: colors.text, flex: 1 }}
            />
          </View>
        </View>

        <View style={{ marginBottom: 16 }}>
          <Text style={{ color: colors.subText, fontSize: 12, fontWeight: '700', marginBottom: 8 }}>Max Projects Per Faculty</Text>
          <View style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <TextInput
              value={String(tempRules.maxProjectsPerFaculty)}
              onChangeText={(val) => setTempRules({ ...tempRules, maxProjectsPerFaculty: parseInt(val) || 0 })}
              keyboardType="number-pad"
              style={{ color: colors.text, flex: 1 }}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={handleSaveRules}
        >
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>Save Rules</Text>
        </TouchableOpacity>
      </Card>
    </View>
  ), [tempRules, colors]); // tempRules is needed for typing to work

  const renderRules = () => renderedRules;

  // ✅ NEW: Create Team Modal
  const renderCreateTeamModal = () => (
    <Modal visible={showCreateTeamModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>
            Create New Team
          </Text>

          <Text style={{ color: colors.subText, fontSize: 12, marginBottom: 8, fontWeight: '700' }}>Student</Text>
          <Card>
            <Text style={{ color: colors.text, fontWeight: '600' }}>
              {selectedStudent?.name || selectedStudent?.studentName}
            </Text>
            <Text style={{ color: colors.subText, fontSize: 11, marginTop: 2 }}>
              Roll: {selectedStudent?.rollNo || selectedStudent?.rollNumber}
            </Text>
          </Card>

          <Text style={{ color: colors.subText, fontSize: 12, marginBottom: 8, marginTop: 16, fontWeight: '700' }}>Team Name</Text>
          <View style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, marginBottom: 20 }]}>
            <TextInput
              value={newTeamName}
              onChangeText={setNewTeamName}
              placeholder="Enter team name"
              placeholderTextColor={colors.subText}
              style={{ color: colors.text, flex: 1 }}
            />
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.border, flex: 1 }]}
              onPress={() => {
                setShowCreateTeamModal(false);
                setNewTeamName('');
                setSelectedStudent(null);
              }}
            >
              <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.primary, flex: 1 }]}
              onPress={handleCreateTeam}
              disabled={loading}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>
                {loading ? 'Creating...' : 'Create Team'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ✅ NEW: Join Team Modal
  const renderJoinTeamModal = () => (
    <Modal visible={showJoinTeamModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>
            Join Team
          </Text>

          <Text style={{ color: colors.subText, fontSize: 12, marginBottom: 8, fontWeight: '700' }}>Student</Text>
          <Card>
            <Text style={{ color: colors.text, fontWeight: '600' }}>
              {selectedStudentForJoin?.name || selectedStudentForJoin?.studentName}
            </Text>
            <Text style={{ color: colors.subText, fontSize: 11, marginTop: 2 }}>
              Roll: {selectedStudentForJoin?.rollNo || selectedStudentForJoin?.rollNumber}
            </Text>
          </Card>

          <Text style={{ color: colors.subText, fontSize: 12, marginBottom: 12, marginTop: 16, fontWeight: '700' }}>Available Teams (Not Full)</Text>
          <ScrollView style={{ maxHeight: 300 }}>
            {availableTeamsToJoin && availableTeamsToJoin.length > 0 ? (
              availableTeamsToJoin.map((team: any) => {
                const isFull = team.memberCount >= team.maxSlots;
                return (
                  <TouchableOpacity
                    key={team.teamId}
                    disabled={isFull}
                    onPress={() => handleJoinTeam(team)}
                    style={[
                      styles.teamJoinItem,
                      {
                        borderColor: divider,
                        backgroundColor: isFull ? 'rgba(239,68,68,0.05)' : colors.background,
                        opacity: isFull ? 0.5 : 1
                      }
                    ]}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.text, fontWeight: '600', fontSize: 13 }}>{team.teamName}</Text>
                      <Text style={{ color: colors.subText, fontSize: 10, marginTop: 4 }}>
                        Members: {team.memberCount}/{team.maxSlots}
                      </Text>
                      <Text style={{ color: colors.subText, fontSize: 10, marginTop: 2 }}>
                        Project: {team.projectTitle}
                      </Text>
                    </View>
                    <View style={{
                      backgroundColor: isFull ? 'rgba(239,68,68,0.1)' : accentSoft,
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8
                    }}>
                      <Text style={{
                        color: isFull ? '#ef4444' : colors.primary,
                        fontWeight: '700',
                        fontSize: 10
                      }}>
                        {isFull ? 'FULL' : 'JOIN'}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })
            ) : (
              <Card>
                <Text style={{ color: colors.subText, textAlign: 'center', fontSize: 12 }}>
                  No available teams to join (all teams are full)
                </Text>
              </Card>
            )}
          </ScrollView>

          <TouchableOpacity
            style={[styles.modalBtn, { backgroundColor: colors.border, marginTop: 16 }]}
            onPress={() => {
              setShowJoinTeamModal(false);
              setSelectedStudentForJoin(null);
              setAvailableTeamsToJoin([]);
            }}
          >
            <Text style={{ color: colors.text, fontWeight: '600' }}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  const renderAllocateFacultyModal = () => (
    <Modal visible={showAllocateFacultyModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>
            Allocate Team to Faculty & Project
          </Text>

          <Text style={{ color: colors.subText, fontSize: 12, marginBottom: 8, fontWeight: '700' }}>Select Faculty</Text>
          <ScrollView style={{ maxHeight: 250 }}>
            {faculties.map((f) => (
              <TouchableOpacity
                key={f.id}
                style={[styles.facultyItem, { borderColor: divider, backgroundColor: selectedFacultyId === f.id ? accentSoft : colors.background }]}
                onPress={async () => {
                  setSelectedFacultyId(f.id);
                  try {
                    const projects = await coordinatorApi.getFacultyProjects(f.id, selectedDegree);
                    setFacultyProjectsForTeam(projects.map((p: any) => ({ ...p, id: String(p.projectId) })));
                  } catch (err) {
                    showLocalMsg("Failed to load projects", "error");
                  }
                }}
              >
                <Text style={{ color: colors.text, fontWeight: '600' }}>{f.name}</Text>
                <Text style={{ color: colors.subText, fontSize: 11, marginTop: 2 }}>Specialization: {f.specialization || 'General'}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {selectedFacultyId && facultyProjectsForTeam.length > 0 && (
            <View style={{ marginTop: 16, padding: 12, backgroundColor: accentSoft, borderRadius: 12 }}>
              <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 8 }}>Select Project</Text>
              <ScrollView style={{ maxHeight: 150 }}>
                {facultyProjectsForTeam.map((p: any) => (
                  <TouchableOpacity
                    key={p.id}
                    style={[{ padding: 10, borderRadius: 8, marginBottom: 6, backgroundColor: selectedProject?.id === p.id ? colors.primary : colors.border }]}
                    onPress={() => setSelectedProject(p)}
                  >
                    <Text style={{ color: selectedProject?.id === p.id ? '#fff' : colors.text, fontWeight: '600', fontSize: 12 }}>
                      {p.projectTitle} ({p.status})
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.border, flex: 1 }]}
              onPress={() => {
                setShowAllocateFacultyModal(false);
                setSelectedFacultyId('');
                setSelectedProject(null);
              }}
            >
              <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.primary, flex: 1 }]}
              onPress={async () => {
                if (!selectedTeamForAllocation || !selectedFacultyId || !selectedProject) {
                  showLocalMsg("Please select team, faculty and project", "error");
                  return;
                }
                try {
                  setLoading(true);
                  await coordinatorApi.allocateTeamToFaculty(
                    String(selectedTeamForAllocation.teamId),
                    selectedFacultyId,
                    selectedProject.id
                  );
                  showLocalMsg("Team allocated successfully!", "success");
                  fetchStudentTeamData();
                  setShowAllocateFacultyModal(false);
                  setSelectedFacultyId('');
                  setSelectedProject(null);
                } catch (err: any) {
                  console.log('[FacultyCoordinatorDashboard] ❌ Allocation error:', err);
                  showLocalMsg(err.message || "Allocation failed", "error");
                } finally {
                  setLoading(false);
                }
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Confirm Allocation</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // ───────── MAIN UI ─────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: divider }]}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.subText, fontSize: 12, fontWeight: '600' }}>DASHBOARD</Text>
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 }}>
            Coordinator
          </Text>
        </View>
        {profile?.isUGCoordinator && profile?.isPGCoordinator && (
          <DegreeSelector />
        )}
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <InlineAlert />

        <SectionLabel label="Quick Menu" />
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 }}>
            {['overview', 'faculties', 'students', 'download', 'rules'].map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.menuItem, { backgroundColor: activeTab === tab ? accentSoft : 'transparent' }]}
                onPress={() => { setMsg(null); setActiveTab(tab as any); }}
              >
                <View style={[styles.iconWrap, { backgroundColor: activeTab === tab ? colors.primary : accentSoft }]}>
                  <Icon name={tab === 'faculties' ? 'faculty' : tab} size={16} />
                </View>
                <Text
                  style={{ fontSize: 9, fontWeight: '700', color: activeTab === tab ? colors.primary : colors.subText, marginTop: 4 }}
                  numberOfLines={1}
                >
                  {tab.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <SectionLabel label={activeTab} />

        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'faculties' && renderFaculties()}
        {activeTab === 'students' && renderStudents()}
        {activeTab === 'download' && renderDownload()}
        {activeTab === 'rules' && renderRules()}
      </ScrollView>

      {renderCreateTeamModal()}
      {renderJoinTeamModal()}
      {renderAllocateFacultyModal()}

      <View style={[styles.bottomTab, { backgroundColor: colors.card, borderTopColor: divider }]}>
        <View style={styles.tabItem}>
          <Image source={require('../assets/home-color.png')} style={styles.tabIcon} />
          <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700', marginTop: 2 }}>Home</Text>
        </View>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('DeadlineManagement')}
        >
          <Image
            source={isDark ? require('../assets/dd-white.png') : require('../assets/dd.png')}
            style={styles.tabIcon}
          />
          <Text style={{ color: colors.subText, fontSize: 10, fontWeight: '500', marginTop: 2 }}>Deadlines</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('FacultyCoordinatorMore')}
        >
          <Image
            source={isDark ? require('../assets/more-white.png') : require('../assets/more.png')}
            style={styles.tabIcon}
          />
          <Text style={{ color: colors.subText, fontSize: 10, fontWeight: '500', marginTop: 2 }}>More</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FacultyCoordinatorDashboard;

// ───────── STYLES ─────────
const styles = StyleSheet.create({
  header: {
    height: 80,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 16,
    letterSpacing: 1,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  menuItem: {
    width: '18%',
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 12,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
    height: 45,
  },
  button: {
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 16,
    elevation: 2,
  },
  miniBtn: {
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  input: {
    height: 45,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  bottomTab: {
    height: 65,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderTopWidth: 1,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    width: 22, height: 22, resizeMode: 'contain'
  },
  inlineAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    padding: 12,
    borderRadius: 12,
    marginVertical: 8,
    gap: 10
  },
  inlineAlertText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    elevation: 10,
    maxHeight: '85%'
  },
  facultyItem: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8
  },
  teamJoinItem: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  modalBtn: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  miniCard: {
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNum: {
    fontSize: 24,
    fontWeight: '800',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
});