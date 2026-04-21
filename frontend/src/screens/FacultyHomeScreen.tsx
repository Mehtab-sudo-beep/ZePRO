import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { AlertContext } from '../context/AlertContext';
import { BASE_URL } from '../api/api';

import {
  getPendingRequests,
  getFacultyProjects,
  getAllMeetings,
  getFacultyProfile,
} from '../api/facultyApi';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'FacultyHome'>;

// ── Tiny icon helper ──────────────────────────────────────────────────────────
const Icon = ({ name, size = 18 }: { name: string; size?: number }) => {
  const { colors } = useContext(ThemeContext);
  const isDark = colors.background === '#111827';

  const icons: Record<string, any> = {
    requests: isDark
      ? require('../assets/requests-white.png')
      : require('../assets/requests.png'),
    project: isDark
      ? require('../assets/project-white.png')
      : require('../assets/project.png'),
    status: isDark
      ? require('../assets/status-white.png')
      : require('../assets/status.png'),
    create: isDark
      ? require('../assets/create-white.png')
      : require('../assets/create.png'),
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
      <Icon name={icon} size={17}  />
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

const FacultyHomeScreen: React.FC = () => {
  const { user, setUser } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const isDark = colors.background === '#111827';
  const navigation = useNavigation<NavProp>();

  const [requests, setRequests] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const { showAlert } = useContext(AlertContext);

  const handleLogout = () => {
    showAlert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try { await import('@react-native-google-signin/google-signin').then(m => m.GoogleSignin.signOut()); } catch (e) {}
            await import('@react-native-async-storage/async-storage').then(m => {
              m.default.removeItem('token');
              m.default.removeItem('role');
              m.default.removeItem('facultyId');
            });
            setUser(null);
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          },
        },
      ]
    );
  };

  useFocusEffect(
    useCallback(() => {
      if (user?.token && user?.facultyId) {
        loadData();
      }
    }, [user])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      console.log('🔥 [HOME] Fetching profile & projects...');
      const req = await getPendingRequests(user!.token);
      const prof = await getFacultyProfile(user!.token);
      const proj = await getFacultyProjects(user!.token);
      const meet = await getAllMeetings(user!.token);

      console.log('✅ [HOME] Data fetched. Rules Max Slots:', prof?.maxStudentsPerFaculty);

      setRequests(req || []);
      setProfile(prof);
      setProjects(proj || []);
      setMeetings(meet || []);
    } catch (err: any) {
      console.log('API ERROR:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;
  if (user.role !== 'FACULTY') {
      return (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          <Text style={{ color: colors.text, padding: 20 }}>Loading...</Text>
        </SafeAreaView>
      );
  }

  const accentSoft = isDark ? 'rgba(96,165,250,0.12)' : 'rgba(37,99,235,0.07)';
  const divider = isDark ? '#374151' : '#E5E7EB';

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
          <View>
            <Text style={[styles.headerGreeting, { color: colors.subText }]}>
              Welcome back,
            </Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {user.name ?? 'Faculty'}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.avatarBadge, { backgroundColor: accentSoft, overflow: 'hidden' }]}
            onPress={() => setShowMenu(true)}
          >
            {(user.profilePictureUrl || profile?.profilePictureUrl) ? (
              <Image
                source={{ uri: (user.profilePictureUrl || profile.profilePictureUrl).startsWith('http') ? (user.profilePictureUrl || profile.profilePictureUrl) : `${BASE_URL}${(user.profilePictureUrl || profile.profilePictureUrl)}` }}
                style={{ width: '100%', height: '100%' }}
              />
            ) : (
              <Text style={[styles.avatarText, { color: colors.primary }]}>
                {(user.name ?? 'F').charAt(0).toUpperCase()}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          
          {/* Quick Stats Summary */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
            <View style={[styles.card, { backgroundColor: colors.card, flex: 1, padding: 16 }]}>
              <Text style={{ color: colors.subText, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }}>RES. CAPACITY (SLOTS)</Text>
              <Text style={{ color: colors.primary, fontSize: 24, fontWeight: '800', marginTop: 4 }}>
                {profile?.totalCreatedSlots} <Text style={{ fontSize: 12, color: colors.subText }}>/ {profile?.maxStudentsPerFaculty}</Text>
              </Text>
              <View style={{ height: 4, backgroundColor: colors.border, borderRadius: 2, marginTop: 10, overflow: 'hidden' }}>
                <View style={{ height: '100%', width: `${Math.min(100, ((profile?.totalCreatedSlots || 0) / (profile?.maxStudentsPerFaculty || 6)) * 100)}%`, backgroundColor: colors.primary }} />
              </View>
            </View>
            <View style={[styles.card, { backgroundColor: colors.card, flex: 1, padding: 16 }]}>
               <Text style={{ color: colors.subText, fontSize: 10, fontWeight: '700', letterSpacing: 0.5 }}>ACTIVE PROJECTS</Text>
               <Text style={{ color: colors.text, fontSize: 24, fontWeight: '800', marginTop: 4 }}>
                 {projects.filter(p => p.isActive).length}
               </Text>
               <Text style={{ color: colors.subText, fontSize: 10, marginTop: 4 }}>Out of {projects.length} total</Text>
            </View>
          </View>

          <SectionLabel label="Requests" colors={colors} />
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ActionRow
              label="Pending Requests"
              sublabel="Review unhandled team requests"
              icon="requests"
              colors={colors}
              accentSoft={accentSoft}
              onPress={() => navigation.navigate('FacultyRequests')}
            />
          </View>

          <SectionLabel label="Projects" colors={colors} />
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ActionRow
              label="My Projects"
              sublabel="Manage your created projects"
              icon="project"
              colors={colors}
              accentSoft={accentSoft}
              onPress={() => navigation.navigate('FacultyProjects')}
            />
          </View>

          <SectionLabel label="Meetings" colors={colors} />
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <ActionRow
              label="Upcoming Meetings"
              sublabel="View scheduled team meetings"
              icon="status"
              colors={colors}
              accentSoft={accentSoft}
              onPress={() => navigation.navigate('FacultyMeetings')}
              badge={meetings.filter(m => m.status === 'PENDING').length > 0 ? `${meetings.filter(m => m.status === 'PENDING').length}` : undefined}
            />
          </View>

          {user?.isFC && (
            <>
              <SectionLabel label="Administration" colors={colors} />
              <View style={[styles.card, { backgroundColor: colors.card }]}>
                <ActionRow
                  label="Faculty Coordinator"
                  sublabel="Access coordinator dashboard"
                  icon="info"
                  colors={colors}
                  accentSoft={isDark ? 'rgba(167,139,250,0.15)' : 'rgba(139,92,246,0.1)'}
                  onPress={() => navigation.navigate('FacultyCoordinatorDashboard')}
                />
              </View>
            </>
          )}

          <View style={{ height: 16 }} />
        </ScrollView>

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
            onPress={() => navigation.navigate('FacultyCreateMenu')}
          >
            <Image
              source={isDark ? require('../assets/create-white.png') : require('../assets/create.png')}
              style={styles.tabIcon}
            />
            <Text style={[styles.tab, { color: colors.subText }]}>Create</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigation.navigate('FacultyMore')}
          >
            <Image
              source={isDark ? require('../assets/more-white.png') : require('../assets/more.png')}
              style={styles.tabIcon}
            />
            <Text style={[styles.tab, { color: colors.subText }]}>More</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Menu Popup */}
        <Modal
          visible={showMenu}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowMenu(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowMenu(false)}
          >
            <View style={[styles.menuContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
               <TouchableOpacity 
                 style={styles.menuItem} 
                 onPress={() => { setShowMenu(false); navigation.navigate('FacultyProfile'); }}
               >
                 <Image source={isDark ? require('../assets/user-white.png') : require('../assets/user.png')} style={styles.menuIcon} />
                 <Text style={[styles.menuText, { color: colors.text }]}>Profile</Text>
               </TouchableOpacity>
               
               <View style={[styles.menuDivider, { backgroundColor: colors.border }]} />
               
               <TouchableOpacity 
                 style={styles.menuItem} 
                 onPress={() => { setShowMenu(false); handleLogout(); }}
               >
                 <Image source={require('../assets/leave.png')} style={[styles.menuIcon, { tintColor: '#ef4444' }]} />
                 <Text style={[styles.menuText, { color: '#ef4444' }]}>Logout</Text>
               </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default FacultyHomeScreen;

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

  bottomTab: {
    height: 68,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  tabIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
    resizeMode: 'contain',
  },
  tab: {
    fontSize: 12,
    fontWeight: '500',
  },
  tabActive: {
    fontSize: 12,
    fontWeight: '700',
  },
  tabActiveIndicator: {
    position: 'absolute',
    top: 0,
    width: '40%',
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  menuContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 170,
    borderRadius: 16,
    padding: 6,
    borderWidth: 1,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 12,
  },
  menuIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
  },
  menuDivider: {
    height: 1,
    marginHorizontal: 8,
    marginVertical: 2,
  },
});
