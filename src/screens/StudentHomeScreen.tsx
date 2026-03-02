import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';

import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type StudentHomeNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'StudentHome'
>;

const StudentHomeScreen: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation<StudentHomeNavigationProp>();

  const [showAllocatedMessage, setShowAllocatedMessage] = useState(false);

  if (!user || user.role !== 'student') return null;

  const { isInTeam } = user;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Home</Text>
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={styles.content}>
          {!isInTeam ? (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                Team Actions
              </Text>

              <TouchableOpacity
                style={[styles.actionButton, { borderColor: colors.primary }]}
                onPress={() => navigation.navigate('CreateTeam')}
              >
                <Text style={[styles.actionText, { color: colors.primary }]}>
                  Create Team
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { borderColor: colors.primary }]}
                onPress={() => navigation.navigate('JoinTeam')}
              >
                <Text style={[styles.actionText, { color: colors.primary }]}>
                  Join Team
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={[styles.card, { backgroundColor: colors.card }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>
                My Team
              </Text>

              <Text style={[styles.label, { color: colors.subText }]}>
                Team Name
              </Text>
              <Text style={[styles.value, { color: colors.text }]}>
                Project Alpha
              </Text>

              <Text style={[styles.label, { color: colors.subText }]}>
                Team Lead
              </Text>
              <Text style={[styles.value, { color: colors.text }]}>
                Mehtab Shaik
              </Text>

              <Text style={[styles.label, { color: colors.subText }]}>
                Members
              </Text>
              <Text style={[styles.value, { color: colors.text }]}>
                • Student A
              </Text>
              <Text style={[styles.value, { color: colors.text }]}>
                • Student B
              </Text>
              <Text style={[styles.value, { color: colors.text }]}>
                • Student C
              </Text>
            </View>
          )}

          {/* Projects Section */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Projects
            </Text>

            <TouchableOpacity
              style={[styles.actionButton, { borderColor: colors.primary }]}
              onPress={() => navigation.navigate('ViewProjects')}
            >
              <Text style={[styles.actionText, { color: colors.primary }]}>
                View Projects
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { borderColor: colors.primary }]}
              onPress={() => setShowAllocatedMessage(true)}
            >
              <Text style={[styles.actionText, { color: colors.primary }]}>
                View Allocated Project
              </Text>
            </TouchableOpacity>

            {showAllocatedMessage && (
              <Text
                style={[
                  styles.placeholderText,
                  { color: colors.subText, marginTop: 10 },
                ]}
              >
                Project details will appear once assigned.
              </Text>
            )}
          </View>
        </ScrollView>

        {/* Bottom Tab */}
        <View
          style={[
            styles.bottomTab,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          {/* Home */}
          <View style={styles.tabItem}>
            <Image
              source={require('../assets/home-color.png')}
              style={styles.tabIcon}
            />
            <Text style={[styles.tabActive, { color: colors.primary }]}>
              Home
            </Text>
          </View>

          {/* Meetings */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigation.navigate('ScheduledMeetings')}
          >
            <Image
              source={require('../assets/meeting.png')}
              style={styles.tabIcon}
            />
            <Text style={[styles.tab, { color: colors.subText }]}>
              Meetings
            </Text>
          </TouchableOpacity>

          {/* More */}
          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigation.navigate('More')}
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

export default StudentHomeScreen;

/* ======================= STYLES ======================= */

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    height: 60,
    paddingHorizontal: 20,
    justifyContent: 'center',
    elevation: 4,
  },

  headerTitle: {
    fontSize: 20,
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
    fontWeight: '500',
    marginBottom: 12,
  },

  label: {
    fontSize: 13,
    marginTop: 8,
  },

  value: {
    fontSize: 14,
    marginTop: 2,
  },

  actionButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },

  actionText: {
    fontWeight: '600',
  },

  placeholderText: {
    fontStyle: 'italic',
  },

  bottomTab: {
    height: 60,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },

  tab: {
    fontSize: 12,
  },

  tabActive: {
    fontSize: 12,
    fontWeight: '700',
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
});
