import React, { useContext, useCallback } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';
import { BASE_URL } from '../api/api';

const FacultyCoordinatorMoreScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, setUser, loading } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const isDark = colors.background === '#111827';

  // ── Refresh user from AsyncStorage on every screen focus ─────────────────
  useFocusEffect(
    useCallback(() => {
      const refreshUser = async () => {
        try {
          const stored = await AsyncStorage.getItem('user');
          if (stored) {
            setUser(JSON.parse(stored));
          }
        } catch (e) {
          console.log('refresh user error:', e);
        }
      };
      refreshUser();
    }, [  setUser])
  );

  // ── Wait for AsyncStorage to restore user before rendering ────────────────
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!user) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: colors.text, fontSize: 16 }}>Not signed in</Text>
        <TouchableOpacity
          style={{ marginTop: 20, padding: 12, backgroundColor: colors.primary, borderRadius: 8 }}
          onPress={() => navigation.reset({ index: 0, routes: [{ name: 'Login' }] })}
        >
          <Text style={{ color: '#fff', fontWeight: '600' }}>Go to Login</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    Alert.alert(
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
      ],
      { cancelable: true },
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>More</Text>
        </View>

        {/* Profile Section */}
        <View style={[styles.profileHeader, { backgroundColor: colors.card }]}>
          <Image
            source={
              user?.profilePictureUrl
                ? { uri: user.profilePictureUrl.startsWith('http') ? user.profilePictureUrl : `${BASE_URL}${user.profilePictureUrl}` }
                : require('../assets/avatar.png')
            }
            style={[styles.profileImage, { borderColor: colors.border, backgroundColor: colors.card }]}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {user.name ?? 'Faculty Coordinator'}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.subText }]}>
              {user.email ?? ''}
            </Text>
            <Text style={[styles.profileRole, { color: colors.primary }]}>
              Faculty Coordinator
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <ScrollView
          style={[styles.list, { backgroundColor: colors.card }]}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <MenuItem
            title="Profile"
            onPress={() => navigation.navigate('FacultyProfile')} // Ensure this route exists
            colors={colors}
          />
          <MenuItem
            title="Help Center"
            onPress={() => navigation.navigate('HelpCenter')}
            colors={colors}
          />
          <MenuItem
            title="Deadlines"
            onPress={() => navigation.navigate('Deadline')}
            colors={colors}
          />
          <MenuItem
            title="Settings"
            onPress={() => navigation.navigate('Settings')}
            colors={colors}
          />
          <MenuItem
            title="Switch to Faculty Mode"
            onPress={() => navigation.navigate('FacultyHome')}
            colors={colors}
          />
          <MenuItem
            title="Log Out"
            danger
            onPress={handleLogout}
            colors={colors}
          />
        </ScrollView>

        {/* Bottom Tab */}
        <View style={[styles.bottomTab, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={styles.bottomTabItem}
            onPress={() => navigation.navigate('FacultyCoordinatorDashboard')}
          >
            <Image
              source={isDark ? require('../assets/home-white.png') : require('../assets/home.png')}
              style={styles.bottomTabIcon}
            />
            <Text style={[styles.bottomTabLabel, { color: colors.subText }]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.bottomTabItem}
            onPress={() => navigation.navigate('DeadlineManagement')}
          >
            <Image
              source={isDark ? require('../assets/dd-white.png') : require('../assets/dd.png')}
              style={styles.bottomTabIcon}
            />
            <Text style={[styles.bottomTabLabel, { color: colors.subText }]}>Deadlines</Text>
          </TouchableOpacity>

          <View style={styles.bottomTabItem}>
            <Image source={require('../assets/more-color.png')} style={styles.bottomTabIcon} />
            <Text style={[styles.bottomTabLabelActive, { color: colors.primary }]}>More</Text>
          </View>
        </View>

      </View>
    </SafeAreaView>
  );
};

export default FacultyCoordinatorMoreScreen;

/* ─── MenuItem ─────────────────────────────────────────────────────────────── */

const MenuItem = ({
  title,
  onPress,
  danger = false,
  colors,
}: {
  title: string;
  onPress: () => void;
  danger?: boolean;
  colors: any;
}) => (
  <TouchableOpacity
    style={[styles.item, { borderColor: colors.border }]}
    onPress={onPress}
  >
    <Text style={[styles.itemText, { color: danger ? '#DC2626' : colors.text }]}>
      {title}
    </Text>
    <Text style={[styles.arrow, { color: colors.subText }]}>›</Text>
  </TouchableOpacity>
);

/* ─── Styles ───────────────────────────────────────────────────────────────── */

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 60, paddingHorizontal: 18, justifyContent: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '600' },
  profileHeader: {
    paddingVertical: 24,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: { width: 64, height: 64, borderRadius: 32, borderWidth: 2 },
  profileInfo: { marginLeft: 16 },
  profileName:  { fontSize: 16, fontWeight: '600' },
  profileEmail: { fontSize: 13, marginTop: 2 },
  profileRole:  { fontSize: 12, marginTop: 4, fontWeight: '500' },
  list: { flex: 1, marginTop: 10 },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderBottomWidth: 0.5,
  },
  itemText: { fontSize: 15 },
  arrow: { fontSize: 22 },
  bottomTab: { height: 60, borderTopWidth: 1, flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  bottomTabItem: { alignItems: 'center', justifyContent: 'center' },
  bottomTabIcon: { width: 22, height: 22, marginBottom: 4, resizeMode: 'contain' },
  bottomTabLabel: { fontSize: 12 },
  bottomTabLabelActive: { fontSize: 12, fontWeight: '700' },
});