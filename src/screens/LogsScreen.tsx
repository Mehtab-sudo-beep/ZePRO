import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type AdminDashboardScreenNavigationProp =
  NativeStackNavigationProp<
    RootStackParamList,
    'Logs'
  >;

export default function AuditLogsScreen() {
  const navigation =
    useNavigation<AdminDashboardScreenNavigationProp>();

  const logs = [
    { id: '1', time: '10:30 AM', user: 'Admin', action: 'Logged into system' },
    { id: '2', time: '10:32 AM', user: 'Admin', action: 'Added user John Doe' },
    { id: '3', time: '10:35 AM', user: 'Admin', action: 'Assigned Faculty Coordinator' },
    { id: '4', time: '10:40 AM', user: 'Admin', action: 'Deleted user Jane Smith' },
    { id: '5', time: '10:45 AM', user: 'Admin', action: 'Updated roles' },
    { id: '6', time: '10:50 AM', user: 'Admin', action: 'Viewed logs' },
    { id: '7', time: '11:00 AM', user: 'Admin', action: 'Logged out' },
  ];

  return (
    <SafeAreaView style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Audit Logs</Text>
        <Text style={styles.subtitle}>Complete system activity</Text>
      </View>

      {/* Logs List */}
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.logCard}>
            <Text style={styles.time}>{item.time}</Text>
            <Text style={styles.user}>{item.user}</Text>
            <Text style={styles.action}>{item.action}</Text>
          </View>
        )}
      />

      {/* Bottom Dashboard */}
      <View style={styles.bottomTab}>

        <TouchableOpacity
          onPress={() => navigation.navigate('AdminHome')}
        >
          <Text style={styles.tab}>Home</Text>
        </TouchableOpacity>

        <Text style={styles.tabActive}>Logs</Text>

        <TouchableOpacity
          onPress={() => navigation.navigate('AdminMore')}
        >
          <Text style={styles.tab}>More</Text>
        </TouchableOpacity>

      </View>

    </SafeAreaView>
  );
}
/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingTop: 16,
paddingLeft: 16,
paddingRight: 16,
paddingBottom: 0,
  },

  header: {
    marginBottom: 16,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#111827',
  },

  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },

  logCard: {
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },

  time: {
    fontSize: 12,
    color: '#6B7280',
  },

  user: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 2,
  },

  action: {
    fontSize: 14,
    color: '#374151',
    marginTop: 4,
  },

  backButton: {
    backgroundColor: '#4F46E5',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },

  backText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  bottomTab: {
    height: 60,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  tab: {
    color: '#9CA3AF',
    fontSize: 12,
  },

  tabActive: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
});
