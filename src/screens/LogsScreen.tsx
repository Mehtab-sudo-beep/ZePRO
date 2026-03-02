import React, { useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ThemeContext } from '../theme/ThemeContext';

type AdminDashboardScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Logs'
>;

const logs = [
  { id: '1', time: '10:30 AM', user: 'Admin', action: 'Logged into system' },
  { id: '2', time: '10:32 AM', user: 'Admin', action: 'Added user John Doe' },
  { id: '3', time: '10:35 AM', user: 'Admin', action: 'Assigned Faculty Coordinator' },
  { id: '4', time: '10:40 AM', user: 'Admin', action: 'Deleted user Jane Smith' },
  { id: '5', time: '10:45 AM', user: 'Admin', action: 'Updated roles' },
  { id: '6', time: '10:50 AM', user: 'Admin', action: 'Viewed logs' },
  { id: '7', time: '11:00 AM', user: 'Admin', action: 'Logged out' },
];

export default function AuditLogsScreen() {
  const navigation = useNavigation<AdminDashboardScreenNavigationProp>();
  const { colors } = useContext(ThemeContext);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>Audit Logs</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>Complete system activity</Text>
      </View>

      {/* Logs List */}
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={[styles.logCard, { backgroundColor: colors.card, borderLeftColor: colors.primary }]}>
            <View style={styles.logTop}>
              <Text style={[styles.user, { color: colors.text }]}>{item.user}</Text>
              <Text style={[styles.time, { color: colors.subText }]}>{item.time}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: colors.border }]} />
            <Text style={[styles.action, { color: colors.subText }]}>{item.action}</Text>
          </View>
        )}
      />

      {/* Bottom Tab */}
      <View style={[styles.bottomTab, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminHome')}>
          <Image source={require('../assets/home.png')} style={styles.tabIcon} />
          <Text style={[styles.tab, { color: colors.subText }]}>Home</Text>
        </TouchableOpacity>

        <View style={styles.tabItem}>
          <Image source={require('../assets/timecolor.png')} style={styles.tabIcon} />
          <Text style={[styles.tabActive, { color: colors.primary }]}>Logs</Text>
        </View>

        <TouchableOpacity style={styles.tabItem} onPress={() => navigation.navigate('AdminMore')}>
          <Image source={require('../assets/more.png')} style={styles.tabIcon} />
          <Text style={[styles.tab, { color: colors.subText }]}>More</Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    elevation: 4,
    marginBottom: 8,
  },

  title: {
    fontSize: 20,
    fontWeight: '500',
  },

  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },

  listContent: {
    padding: 16,
    paddingBottom: 8,
  },

  logCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    elevation: 2,
    borderLeftWidth: 4,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },

  logTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  user: {
    fontSize: 14,
    fontWeight: '600',
  },

  time: {
    fontSize: 12,
  },

  divider: {
    height: 1,
    marginBottom: 8,
    borderRadius: 1,
  },

  action: {
    fontSize: 13,
    lineHeight: 18,
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