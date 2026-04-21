import React, { useContext } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BASE_URL } from '../api/api';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const MoreScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, setUser } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const isDark = colors.background === '#111827';

  const logout = async () => {
    try {
      await GoogleSignin.signOut();
    } catch (e) {
      // Ignore if not signed in with Google
    }
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("studentId");
    await setUser(null);
    navigation.replace("Login");
  };

  if (!user || user.role !== 'STUDENT') return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        {/* Header (Z removed) */}
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
            style={[
              styles.profileImage,
              {
                borderColor: colors.card,
                backgroundColor: colors.card,
              },
            ]}
          />

          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {user.name}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.subText }]}>
              {user.email}
            </Text>
          </View>
        </View>

        {/* Menu */}
        <ScrollView
          style={[styles.list, { backgroundColor: colors.card }]}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <MenuItem
            title="Profile"
            onPress={() => navigation.navigate('Profile')}
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
            title="Log Out"
            danger
            onPress={logout}
            colors={colors}
          />
        </ScrollView>

        {/* Bottom Tab */}
        <View
          style={[
            styles.bottomTab,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigation.navigate('StudentHome')}
          >
            <Image
              source={isDark ? require('../assets/home-white.png') : require('../assets/home.png')}
              style={styles.tabIcon}
            />
            <Text style={[styles.tab, { color: colors.subText }]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigation.navigate('ScheduledMeetings')}
          >
            <Image
              source={isDark ? require('../assets/meeting-white.png') : require('../assets/meeting.png')}
              style={styles.tabIcon}
            />
            <Text style={[styles.tab, { color: colors.subText }]}>
              Meetings
            </Text>
          </TouchableOpacity>

          <View style={styles.tabItem}>
            <Image
              source={require('../assets/more-color.png')}
              style={styles.tabIcon}
            />
            <Text style={[styles.tabActive, { color: colors.primary }]}>
              More
            </Text>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default MoreScreen;

/* ================= MENU ITEM ================= */

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
    <Text
      style={[styles.itemText, { color: danger ? '#DC2626' : colors.text }]}
    >
      {title}
    </Text>

    <Text style={[styles.arrow, { color: colors.subText }]}>›</Text>
  </TouchableOpacity>
);

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    height: 60,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },

  profileHeader: {
    paddingVertical: 24,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
  },

  profileInfo: {
    marginLeft: 16,
  },

  profileName: {
    fontSize: 16,
    fontWeight: '600',
  },

  profileEmail: {
    fontSize: 13,
    marginTop: 4,
  },

  list: {
    flex: 1,
    marginTop: 10,
  },

  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderBottomWidth: 0.5,
  },

  itemText: {
    fontSize: 15,
  },

  arrow: {
    fontSize: 22,
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
