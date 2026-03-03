import React, { useContext } from 'react';
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'FacultyHome'>;

const FacultyHomeScreen: React.FC = () => {
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation<NavProp>();

  if (!user) return null;
  if (user.role !== 'faculty') return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Faculty Home</Text>
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={styles.content}>

          {/* Pending Requests */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Pending Requests</Text>
            <Text style={[styles.item, { color: colors.subText }]}>• Project Alpha – Team of 3 students</Text>
            <Text style={[styles.item, { color: colors.subText }]}>• Smart Attendance System – Team of 4 students</Text>
            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={() => navigation.navigate('FacultyRequests')}
            >
              <Text style={styles.primaryBtnText}>View All Requests</Text>
            </TouchableOpacity>
          </View>

          {/* Assigned Projects */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>My Projects</Text>
            <Text style={[styles.item, { color: colors.subText }]}>• Project Allocation System</Text>
            <Text style={[styles.item, { color: colors.subText }]}>• Campus Navigation App</Text>
            <TouchableOpacity
              style={[styles.outlineBtn, { borderColor: colors.primary }]}
              onPress={() => navigation.navigate('FacultyProjects')}
            >
              <Text style={[styles.outlineBtnText, { color: colors.primary }]}>View Project Details</Text>
            </TouchableOpacity>
          </View>

          {/* Meetings */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Upcoming Meetings</Text>
            <Text style={[styles.item, { color: colors.subText }]}>• 12 Feb – Project Discussion</Text>
            <Text style={[styles.item, { color: colors.subText }]}>• 14 Feb – Requirement Review</Text>
            <TouchableOpacity style={[styles.outlineBtn, { borderColor: colors.primary }]}>
              <Text style={[styles.outlineBtnText, { color: colors.primary }]}>View Meetings</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>

        {/* Bottom Tab */}
        <View style={[styles.bottomTab, { backgroundColor: colors.card, borderColor: colors.border }]}>

          <View style={styles.tabItem}>
            <Image source={require('../assets/home-color.png')} style={styles.tabIcon} />
            <Text style={[styles.tabActive, { color: colors.primary }]}>Home</Text>
          </View>

          <TouchableOpacity
            style={styles.tabItem}
            onPress={() => navigation.navigate('FacultyRequests')}
          >
            <Image source={require('../assets/meeting.png')} style={styles.tabIcon} />
            <Text style={[styles.tab, { color: colors.subText }]}>Request</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.tabItem}
          onPress={() => navigation.navigate('FacultyMore')}>
            <Image source={require('../assets/more.png')} style={styles.tabIcon} />
            <Text style={[styles.tab, { color: colors.subText }]}>More</Text>
          </TouchableOpacity>

        </View>

      </View>
    </SafeAreaView>
  );
};

export default FacultyHomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },
  headerIcon: {
    width: 60,
    height: 40,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
  },

  content: { padding: 16 },

  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  item: {
    fontSize: 14,
    marginBottom: 6,
  },

  primaryBtn: {
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },

  outlineBtn: {
    borderWidth: 1,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  outlineBtnText: {
    fontWeight: '500',
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