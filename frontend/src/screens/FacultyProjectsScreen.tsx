import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';

import { getFacultyProjects } from '../api/facultyApi';

const FacultyProjectsScreen = () => {
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const navigation: any = useNavigation();

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.token && user.facultyId) {
      loadProjects();
    }
  }, [user]);

  const loadProjects = async () => {
    try {
      setLoading(true);

      console.log('USER:', user);
      console.log('FACULTY ID:', user?.facultyId);
      console.log('TOKEN:', user?.token);

      const data = await getFacultyProjects(user.facultyId, user.token);

      console.log('PROJECT RESPONSE:', data);

      if (Array.isArray(data)) {
        setProjects(data);
      } else if (data?.projects) {
        setProjects(data.projects);
      } else {
        setProjects([]);
      }
    } catch (error: any) {
      console.log('PROJECT API ERROR:', error?.response?.status);
      console.log('PROJECT API ERROR DATA:', error?.response?.data);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            My Projects
          </Text>
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={styles.content}>
          {loading && <ActivityIndicator size="large" color={colors.primary} />}

          {!loading && projects.length === 0 && (
            <Text style={[styles.empty, { color: colors.subText }]}>
              No projects created yet
            </Text>
          )}

          {!loading &&
            projects.map((p: any) => (
              <View
                key={p.projectId}
                style={[styles.card, { backgroundColor: colors.card }]}
              >
                <Text style={[styles.cardTitle, { color: colors.text }]}>
                  {p.title}
                </Text>

                <Text style={[styles.item, { color: colors.subText }]}>
                  {p.description}
                </Text>

                <Text style={[styles.status, { color: colors.primary }]}>
                  Status: {p.status}
                </Text>
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

export default FacultyProjectsScreen;

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
    marginBottom: 6,
  },

  status: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
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
