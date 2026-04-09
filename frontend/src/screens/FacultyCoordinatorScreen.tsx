import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal, Image,
  StyleSheet, StatusBar, TextInput, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../theme/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import ReactNativeBlobUtil from 'react-native-blob-util';
import { coordinatorApi } from '../api/coordinatorApi';

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const FacultyCoordinatorDashboard: React.FC = () => {
  const { colors } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const navigation = useNavigation<NavProp>();

  const isDark = colors.background === '#111827';
  const accentSoft = isDark ? 'rgba(96,165,250,0.12)' : 'rgba(37,99,235,0.07)';
  const divider = colors.border;

  // ───────── ICON HELPER ─────────
  const Icon = ({ name, size = 18 }: { name: string; size?: number }) => {
    const icons: any = {
      overview: isDark ? require('../assets/overview-white.png') : require('../assets/overview.png'),
      faculty: isDark ? require('../assets/faculty-white.png') : require('../assets/faculty.png'),
      students: isDark ? require('../assets/students-white.png') : require('../assets/students.png'),
      team: isDark ? require('../assets/team-white.png') : require('../assets/team.png'),
      rules: isDark ? require('../assets/rules-white.png') : require('../assets/rules.png'),
      search: isDark ? require('../assets/search-white.png') : require('../assets/search.png'),
      download: isDark ? require('../assets/download-white.png') : require('../assets/download.png'),
      info: require('../assets/info.png'),
    };
    return <Image source={icons[name]} style={{ width: size, height: size }} />;
  };

  // ───────── STATE ─────────
  const [stats, setStats] = useState<any>(null);
  const [faculties, setFaculties] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [team, setteam] = useState<any[]>([]);
  const [rules, setRules] = useState<any>({ maxTeamSize: 3, maxStudentsPerFaculty: 6, maxProjectsPerFaculty: 2 });
  const [tempRules, setTempRules] = useState(rules);

  const [activeTab, setActiveTab] = useState<'overview' | 'faculties' | 'students' | 'download' | 'rules'>('overview');
  const [loading, setLoading] = useState(false);

  const [showAllocationModal, setShowAllocationModal] = useState(false);
  const [showOverrideModal, setShowOverrideModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [selectedFacultyId, setSelectedFacultyId] = useState('');

  const [facultySearchQuery, setFacultySearchQuery] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // ── Blended Alert State ──
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const isMounted = useRef(false);

  const showLocalMsg = (text: string, type: 'success' | 'error') => {
    setMsg({ text, type });
  };

  // ───────── FETCH ─────────
  const fetchAll = async () => {
    if (!user?.token) {
      showLocalMsg("No authentication token", "error");
      return;
    }

    setLoading(true);
    try {
      console.log('[FacultyCoordinatorDashboard] 🔄 Fetching all data...');
      
      // ✅ USE NEW API FUNCTIONS
      const [s, f, st, t, r] = await Promise.all([
        coordinatorApi.getDashboardStats(user.token).catch(e => {
          console.log('[FacultyCoordinatorDashboard] ❌ Stats error:', e);
          return null;
        }),
        coordinatorApi.getAllFaculties(user.token).catch(e => {
          console.log('[FacultyCoordinatorDashboard] ❌ Faculties error:', e);
          return null;
        }),
        coordinatorApi.getAllStudents(user.token).catch(e => {
          console.log('[FacultyCoordinatorDashboard] ❌ Students error:', e);
          return null;
        }),
        coordinatorApi.getAllTeams(user.token).catch(e => {
          console.log('[FacultyCoordinatorDashboard] ❌ Teams error:', e);
          return null;
        }),
        coordinatorApi.getRules(user.token).catch(e => {
          console.log('[FacultyCoordinatorDashboard] ❌ Rules error:', e);
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
        setteam(t.map((item: any) => ({ ...item, id: String(item.teamId) })));
      }
      if (r) {
        console.log('[FacultyCoordinatorDashboard] ✅ Rules:', r);
        setRules(r);
        setTempRules(r);
      }

      showLocalMsg("Data loaded successfully!", "success");
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
  }, [user?.token]);

  // ───────── ACTIONS ─────────
  const handleAllocateStudent = async () => {
    if (!selectedStudent || !selectedFacultyId) {
      showLocalMsg("Please select faculty", "error");
      return;
    }
    try {
      // ✅ USE NEW API FUNCTION
      await coordinatorApi.allocateStudent(selectedStudent.id, selectedFacultyId, user!.token);
      showLocalMsg("Student allocated successfully!", "success");
      fetchAll();
      setShowAllocationModal(false);
    } catch (err: any) {
      showLocalMsg(err.message || "Allocation failed", "error");
    }
  };

  const handleOverrideAllocation = async () => {
    if (!selectedStudent || !selectedFacultyId) {
      showLocalMsg("Please select faculty", "error");
      return;
    }
    try {
      // ✅ USE NEW API FUNCTION
      await coordinatorApi.overrideAllocation(selectedStudent.id, selectedFacultyId, user!.token);
      showLocalMsg("Allocation overridden successfully!", "success");
      fetchAll();
      setShowOverrideModal(false);
    } catch (err: any) {
      showLocalMsg(err.message || "Override failed", "error");
    }
  };

  const handleSaveRules = async () => {
    try {
      const computedRules = {
        ...tempRules,
        maxStudentsPerFaculty: tempRules.maxTeamSize * tempRules.maxProjectsPerFaculty
      };

      // ✅ USE NEW API FUNCTION
      const result = await coordinatorApi.saveRules(computedRules, user!.token);
      
      setRules(computedRules);
      showLocalMsg("Rules updated successfully!", "success");
      
      console.log('[FacultyCoordinatorDashboard] ✅ Rules saved:', result);
    } catch (err: any) {
      showLocalMsg(err.message || "Failed to save rules", "error");
    }
  };

  const handleDownloadReport = async () => {
    try {
      setLoading(true);
      console.log('[FacultyCoordinatorDashboard] 📥 Downloading report...');
      
      // ✅ USE NEW API FUNCTION
      const blob = await coordinatorApi.downloadTeamsReportPdf(user!.token);
      
      const fileName = `team_report_${Date.now()}.pdf`;
      const filePath = `${ReactNativeBlobUtil.fs.dirs.DownloadDir}/${fileName}`;
      
      await ReactNativeBlobUtil.config({
        path: filePath,
        addAndroidDownloads: {
          useDownloadManager: true,
          notification: true,
          title: 'Team Report',
          mime: 'application/pdf',
        },
      }).fetch('GET', `http://localhost:8080/api/coordinator/teams/report/pdf`, {
        'Authorization': `Bearer ${user!.token}`,
      });
      
      showLocalMsg("Report downloaded successfully!", "success");
      console.log('[FacultyCoordinatorDashboard] ✅ Report downloaded to:', filePath);
    } catch (err: any) {
      showLocalMsg("Download failed", "error");
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
      console.log('[FacultyCoordinatorDashboard] 🔍 Searching faculties:', query);
      const results = await coordinatorApi.searchFaculties(query, user!.token);
      setFaculties(results.map((item: any) => ({ ...item, id: String(item.facultyId) })));
    } catch (err) {
      console.log('[FacultyCoordinatorDashboard] ❌ Search error:', err);
    }
  };

  const handleSearchStudents = async (query: string) => {
    setStudentSearchQuery(query);
    if (query.length === 0) {
      fetchAll();
      return;
    }
    try {
      console.log('[FacultyCoordinatorDashboard] 🔍 Searching students:', query);
      const results = await coordinatorApi.searchStudents(query, user!.token);
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
            {/* Main Stats Grid */}
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

            {/* Allocation Progress Card */}
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

            {/* General Summary Card */}
            <SectionLabel label="General Summary" />
            <Card>
              <Text style={{ color: colors.text, fontSize: 14, lineHeight: 20 }}>
                Currently, <Text style={{fontWeight: '700', color: colors.primary}}>{stats?.allocatedStudents || 0}</Text> out of <Text style={{fontWeight: '700'}}>{stats?.totalStudents || 0}</Text> students have been successfully allocated to a faculty guide. 
                There are <Text style={{fontWeight: '700', color: '#ef4444'}}>{stats?.unallocatedStudents || 0}</Text> students still awaiting allocation.
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
              <View style={{ backgroundColor: isFull ? 'rgba(239,68,68,0.1)' : accentSoft, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
                <Text style={{ color: isFull ? '#ef4444' : colors.primary, fontSize: 10, fontWeight: '800' }}>
                  {isFull ? 'FULL' : 'AVAILABLE'}
                </Text>
              </View>
            </View>

            <View style={{ marginTop: 12, borderTopWidth: 1, borderTopColor: divider, paddingTop: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                <View>
                  <Text style={{ color: colors.subText, fontSize: 10, fontWeight: '700' }}>SLOT UTILIZATION</Text>
                  <Text style={{ color: colors.text, fontSize: 11, fontWeight: '600', marginTop: 2 }}>
                    Created: <Text style={{fontWeight: '800', color: colors.primary}}>{f.totalCreatedSlots || 0}</Text> | 
                    Given: <Text style={{fontWeight: '800'}}>{f.allocatedStudents}</Text> | 
                    Max: <Text style={{fontWeight: '800'}}>{rules.maxStudentsPerFaculty}</Text>
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
    <>
      <SearchBox value={studentSearchQuery} setValue={handleSearchStudents} />
      {students.map(s => (
        <Card key={s.id}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: accentSoft, justifyContent: 'center', alignItems: 'center' }}>
              <Icon name="students" size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: colors.text, fontWeight: '800', fontSize: 15 }}>{s.name}</Text>
                <View style={{
                  backgroundColor: s.isAllocated ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                  paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20
                }}>
                  <Text style={{ color: s.isAllocated ? '#10b981' : '#f59e0b', fontSize: 10, fontWeight: '800' }}>
                    {s.isAllocated ? 'ALLOCATED' : 'PENDING'}
                  </Text>
                </View>
              </View>
              <Text style={{ color: colors.subText, fontSize: 12, marginTop: 2 }}>Roll: {s.rollNo}</Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', marginTop: 16, gap: 10 }}>
            <TouchableOpacity
              style={[styles.miniBtn, { backgroundColor: s.isAllocated ? '#6366f1' : colors.primary, flex: 1 }]}
              onPress={() => {
                setSelectedStudent(s);
                setMsg(null);
                if (s.isAllocated) setShowOverrideModal(true);
                else setShowAllocationModal(true);
              }}
            >
              <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>
                {s.isAllocated ? 'Override Allocation' : 'Manual Allocation'}
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      ))}
    </>
  );

  const renderteam = () => (
    <>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary, marginBottom: 16 }]}
        onPress={handleDownloadReport}
      >
        <Icon name="download" />
        <Text style={{ color: '#fff', fontWeight: '700' }}>Export All Teams (PDF)</Text>
      </TouchableOpacity>

      <View style={[styles.tableContainer, { backgroundColor: colors.card, borderColor: colors.border }]}> 
        <View style={[styles.tableHeader, { backgroundColor: accentSoft, borderBottomColor: colors.border }]}> 
          <Text style={[styles.columnHeader, { color: colors.subText, flex: 2 }]}>TEAM NAME</Text>
          <Text style={[styles.columnHeader, { color: colors.subText, flex: 3 }]}>PROJECT TITLE</Text>
          <Text style={[styles.columnHeader, { color: colors.subText, flex: 1, textAlign: 'center' }]}>SLOTS</Text>
          <Text style={[styles.columnHeader, { color: colors.subText, flex: 2.5 }]}>DOWNLOAD INFO</Text>
        </View>

        {team.length === 0 ? (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <Text style={{ color: colors.subText }}>No teams found</Text>
          </View>
        ) : (
          team.map((t, idx) => (
            <View key={t.id} style={[styles.tableRow, { borderBottomColor: colors.border, backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)' }]}> 
              <Text style={[styles.cellText, { color: colors.text, fontWeight: '700', flex: 2 }]} numberOfLines={2}>
                {t.teamName || t.name || 'Unnamed'}
              </Text>
              <Text style={[styles.cellText, { color: colors.text, flex: 3 }]} numberOfLines={2}>
                {t.projectTitle || 'No Project'}
              </Text>
              <Text style={[styles.cellText, { color: colors.primary, flex: 1, textAlign: 'center', fontWeight: '800' }]}> 
                {t.slots || 3}
              </Text>
              <View style={{ flex: 2.5, flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                 <View style={{ padding: 4, backgroundColor: 'rgba(16,185,129,0.1)', borderRadius: 4 }}>
                    <Icon name="download" size={12} />
                 </View>
                 <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '600' }} numberOfLines={1}>
                    {t.teamName} | {t.projectTitle ? (t.projectTitle.length > 12 ? t.projectTitle.substring(0,10)+'...' : t.projectTitle) : 'N/A'}
                 </Text>
              </View>
            </View>
          ))
        )}
      </View>
    </>
  );

  const renderRules = () => (
    <View style={{ gap: 16 }}>
      {/* Configuration Section */}
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <View style={{ padding: 6, backgroundColor: colors.primary, borderRadius: 8 }}>
            <Icon name="rules" size={14} />
          </View>
          <Text style={{ color: colors.text, fontWeight: '800', fontSize: 16 }}>Rule Configuration</Text>
        </View>

        <View>
          <Text style={{ color: colors.subText, fontSize: 11, fontWeight: '700', marginBottom: 6 }}>
            MAX TEAM SIZE
          </Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: divider }]}
            keyboardType="numeric"
            value={tempRules.maxTeamSize ?? ""}
            onChangeText={v => {
              if (/^\d*$/.test(v)) {
                setTempRules(prev => {
                  const teamSize = v;
                  const projects = prev.maxProjectsPerFaculty || "0";
                  const computed = parseInt(teamSize || "0") * parseInt(projects || "0");
                  return {
                    ...prev,
                    maxTeamSize: teamSize,
                    maxStudentsPerFaculty: computed
                  };
                });
              }
            }}
          />
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={{ color: colors.subText, fontSize: 11, fontWeight: '700', marginBottom: 6 }}>
            MAX PROJECTS PER FACULTY
          </Text>
          <TextInput
            style={[styles.input, { color: colors.text, borderColor: divider }]}
            keyboardType="numeric"
            value={tempRules.maxProjectsPerFaculty ?? ""}
            onChangeText={v => {
              if (/^\d*$/.test(v)) {
                setTempRules(prev => {
                  const projects = v;
                  const teamSize = prev.maxTeamSize || "0";
                  const computed = parseInt(teamSize || "0") * parseInt(projects || "0");
                  return {
                    ...prev,
                    maxProjectsPerFaculty: projects,
                    maxStudentsPerFaculty: computed
                  };
                });
              }
            }}
          />
        </View>

        <View style={{ marginTop: 12 }}>
          <Text style={{ color: colors.subText, fontSize: 11, fontWeight: '700', marginBottom: 6 }}>
            MAX STUDENTS PER FACULTY (AUTO)
          </Text>
          <View style={[styles.input, { justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.05)' }]}>
            <Text style={{ color: colors.text, fontWeight: '700' }}>
              {tempRules.maxStudentsPerFaculty || 0}
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary, marginTop: 20 }]}
          onPress={handleSaveRules}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>Save Changes</Text>
        </TouchableOpacity>
      </Card>

      {/* Active Rules Display */}
      <SectionLabel label="Currently Active Rules" />
      <View style={[styles.activeRulesContainer, { backgroundColor: isDark ? 'rgba(31,41,55,0.5)' : '#f8fafc', borderColor: colors.border }]}> 
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: colors.border }}>
          <Text style={{ color: colors.subText, fontSize: 11, fontWeight: '700' }}>PARAMETER</Text>
          <Text style={{ color: colors.subText, fontSize: 11, fontWeight: '700' }}>ACTIVE VALUE</Text>
        </View>
        
        <View style={styles.activeRuleRow}>
          <Text style={{ color: colors.text, fontSize: 13 }}>Team Max Size</Text>
          <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>{rules.maxTeamSize}</Text></View>
        </View>
        
        <View style={styles.activeRuleRow}>
          <Text style={{ color: colors.text, fontSize: 13 }}>Faculty Student Limit</Text>
          <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>{rules.maxStudentsPerFaculty}</Text></View>
        </View>

        <View style={styles.activeRuleRow}>
          <Text style={{ color: colors.text, fontSize: 13 }}>Faculty Project Limit</Text>
          <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>{rules.maxProjectsPerFaculty}</Text></View>
        </View>

        <View style={{ padding: 12, backgroundColor: accentSoft, alignItems: 'center' }}>
          <Text style={{ color: colors.subText, fontSize: 10, fontWeight: '500' }}>
            System Version: <Text style={{ fontWeight: '800' }}>v{rules.version || 1}</Text>
          </Text>
        </View>
      </View>
    </View>
  );

  const renderModal = (isOverride: boolean) => (
    <Modal visible={isOverride ? showOverrideModal : showAllocationModal} transparent animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}> 
          <Text style={{ color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 16 }}>
            {isOverride ? 'Override' : 'Manual'} Allocation
          </Text>

          <ScrollView style={{ maxHeight: 300 }}>
            {faculties.map(f => (
              <TouchableOpacity
                key={f.id}
                style={[
                  styles.facultyItem,
                  { borderColor: divider, backgroundColor: selectedFacultyId === f.id ? accentSoft : 'transparent' }
                ]}
                onPress={() => setSelectedFacultyId(f.id)}
              >
                <Text style={{ color: colors.text, fontWeight: '600' }}>{f.name}</Text>
                <Text style={{ color: colors.subText, fontSize: 12 }}>{f.allocatedStudents} / {f.maxStudents} slots used</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 20 }}>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.border }]}
              onPress={() => { setShowAllocationModal(false); setShowOverrideModal(false); setSelectedFacultyId(''); }}
            >
              <Text style={{ color: colors.text }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: colors.primary, flex: 1 }]}
              onPress={isOverride ? handleOverrideAllocation : handleAllocateStudent}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>Confirm</Text>
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

      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: divider }]}> 
        <View>
          <Text style={{ color: colors.subText, fontSize: 12, fontWeight: '600' }}>DASHBOARD</Text>
          <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800', letterSpacing: -0.5 }}>
            Coordinator
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <InlineAlert />

        <SectionLabel label="Quick Menu" />
        <Card>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
            {['overview', 'faculties', 'students', 'download', 'rules'].map(tab => (
              <TouchableOpacity
                key={tab}
                style={[styles.menuItem, { backgroundColor: activeTab === tab ? accentSoft : 'transparent' }]} 
                onPress={() => { setMsg(null); setActiveTab(tab as any); }}
              >
                <View style={[styles.iconWrap, { backgroundColor: activeTab === tab ? colors.primary : accentSoft }]}> 
                  <Icon name={tab === 'faculties' ? 'faculty' : tab} size={16} />
                </View>
                <Text style={{ fontSize: 10, fontWeight: '700', color: activeTab === tab ? colors.primary : colors.subText, marginTop: 4 }}>
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
        {activeTab === 'download' && renderteam()}
        {activeTab === 'rules' && renderRules()}

      </ScrollView>

      {renderModal(false)}
      {renderModal(true)}

      {/* BOTTOM TAB */}
      <View style={[styles.bottomTab, { backgroundColor: colors.card, borderTopColor: divider }]}> 
        <View style={styles.tabItem}>
          <Image source={require('../assets/home-color.png')} style={styles.tabIcon} />
          <Text style={{ color: colors.primary, fontSize: 10, fontWeight: '700', marginTop: 2 }}>Home</Text>
        </View>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('FacultyCoordinatorMore')}
        >
          <Image source={require('../assets/more.png')} style={styles.tabIcon} />
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
    justifyContent: 'center',
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
  alertIcon: { width: 18, height: 18 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 20
  },
  modalContent: {
    borderRadius: 20,
    padding: 24,
    elevation: 10
  },
  facultyItem: {
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 8
  },
  modalBtn: {
    padding: 12,
    borderRadius: 10,
    alignItems: 'center'
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
  tableContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
  },
  columnHeader: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 14,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  cellText: {
    fontSize: 13,
  },
  activeRulesContainer: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 20,
  },
  activeRuleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  activeBadge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '800',
  }
});