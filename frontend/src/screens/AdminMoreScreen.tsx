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

const AdminMoreScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, setUser } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);

  const handleLogout = () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => {
            setUser(null);
            navigation.replace('Login');
          },
        },
      ],
      { cancelable: true },
    );
  };

  if (!user || (user.role !== 'admin' && user.role !== 'ADMIN')) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            More
          </Text>
        </View>

        {/* Profile Section */}
        <View style={[styles.profileHeader, { backgroundColor: colors.card }]}>
          <Image
            source={require('../assets/avatar.png')}
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
            title="Add Institute"
            onPress={() => navigation.navigate('AddInstitute')}
            colors={colors}
          />

          <MenuItem
            title="Rule Management"
            onPress={() => navigation.navigate('RuleManagement')}
            colors={colors}
          />

          <MenuItem
            title="Deadline Management"
            onPress={() => navigation.navigate('DeadlineManagement')}
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
            onPress={handleLogout}
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
            onPress={() => navigation.navigate('AdminHome')}
          >
            <Image
              source={require('../assets/home.png')}
              style={styles.tabIcon}
            />
            <Text style={[styles.tab, { color: colors.subText }]}>
              Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigation.navigate('Logs')}
          >
            <Image
              source={require('../assets/time.png')}
              style={styles.tabIcon}
            />
            <Text style={[styles.tab, { color: colors.subText }]}>
              Logs
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

export default AdminMoreScreen;

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
      style={[
        styles.itemText,
        { color: danger ? colors.error || colors.primary : colors.text },
      ]}
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
