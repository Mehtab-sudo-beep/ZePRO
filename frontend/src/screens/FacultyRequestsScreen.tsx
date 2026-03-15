import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';

import { getPendingRequests, assignProject } from '../api/facultyApi';

const FacultyRequestsScreen = () => {
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const navigation: any = useNavigation();

  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await getPendingRequests(user.token);
      setRequests(data || []);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAssign = async (projectId: number, teamId: number) => {
    await assignProject(projectId, teamId, user.token);
    loadRequests();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Pending Requests
          </Text>
        </View>

        {/* Requests List */}

        <ScrollView contentContainerStyle={styles.content}>
          {requests.length === 0 && (
            <Text style={[styles.empty, { color: colors.subText }]}>
              No pending requests
            </Text>
          )}

          {requests.map(r => (
            <View
              key={r.projectId}
              style={[styles.card, { backgroundColor: colors.card }]}
            >
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                {r.title}
              </Text>

              <Text style={[styles.item, { color: colors.subText }]}>
                Team {r.teamId}
              </Text>

              <TouchableOpacity
                style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
                onPress={() => handleAssign(r.projectId, r.teamId)}
              >
                <Text style={styles.primaryBtnText}>Assign Project</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Bottom Navigation */}

        <View
          style={[
            styles.bottomTab,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {/* Home */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigation.navigate('FacultyHome')}
          >
            <Image
              source={require('../assets/home.png')}
              style={styles.tabIcon}
            />
            <Text style={[styles.tab, { color: colors.subText }]}>Home</Text>
          </TouchableOpacity>

          {/* Create */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigation.navigate('CreateProject')}
          >
            <Image
              source={require('../assets/create.png')}
              style={styles.tabIcon}
            />
            <Text style={[styles.tab, { color: colors.subText }]}>Create</Text>
          </TouchableOpacity>

          {/* More */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigation.navigate('FacultyMore')}
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

export default FacultyRequestsScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },

  headerTitle: {
    fontSize: 18,
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
    fontWeight: '600',
    marginBottom: 6,
  },

  item: {
    fontSize: 14,
    marginBottom: 10,
  },

  primaryBtn: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  empty: {
    textAlign: 'center',
    marginTop: 20,
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
});
