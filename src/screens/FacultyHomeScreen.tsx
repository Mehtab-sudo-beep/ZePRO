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
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<
  RootStackParamList,
  'FacultyHome'
>;

const FacultyHomeScreen: React.FC = () => {
  const { user } = useContext(AuthContext);
  const navigation = useNavigation<NavProp>();

  if (!user) return null;
if (!user) return null;
  if (user.role !== 'faculty') return null;
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

        {/* Header */}
        <View style={styles.header}>
          <Image
            source={require('../assets/zepro.png')}
            style={styles.headerIcon}
            resizeMode="contain"
          />
          <Text style={styles.headerTitle}>Faculty Home</Text>
        </View>

        {/* Content */}
        <ScrollView contentContainerStyle={styles.content}>

          {/* Pending Requests */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Pending Requests</Text>

            <Text style={styles.item}>
              • Project Alpha – Team of 3 students
            </Text>
            <Text style={styles.item}>
              • Smart Attendance System – Team of 4 students
            </Text>

            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={() => navigation.navigate('FacultyRequests')}
            >
              <Text style={styles.primaryBtnText}>
                View All Requests
              </Text>
            </TouchableOpacity>
          </View>

          {/* Assigned Projects */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>My Projects</Text>

            <Text style={styles.item}>
              • Project Allocation System
            </Text>
            <Text style={styles.item}>
              • Campus Navigation App
            </Text>

            <TouchableOpacity
              style={styles.outlineBtn}
              onPress={() => navigation.navigate('FacultyProjects')}
            >
              <Text style={styles.outlineBtnText}>
                View Project Details
              </Text>
            </TouchableOpacity>
          </View>

          {/* Meetings */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Upcoming Meetings</Text>

            <Text style={styles.item}>
              • 12 Feb – Project Discussion
            </Text>
            <Text style={styles.item}>
              • 14 Feb – Requirement Review
            </Text>

            <TouchableOpacity
              style={styles.outlineBtn}
             
            >
              <Text style={styles.outlineBtnText}>
                View Meetings
              </Text>
            </TouchableOpacity>
          </View>

        </ScrollView>

        {/* Bottom Dashboard */}
        <View style={styles.bottomTab}>
          <Text style={styles.tabActive}>Home</Text>
           <TouchableOpacity onPress={() => navigation.navigate('FacultyRequests')}>
              <Text style={styles.tab}>Request</Text>
            </TouchableOpacity>
          
          <Text style={styles.tab}>Projects</Text>
          <Text style={styles.tab}>More</Text>
        </View>

      </View>
    </SafeAreaView>
  );
};

export default FacultyHomeScreen;
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },

  header: {
    height: 60,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
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

  content: {
    padding: 16,
  },

  card: {
    backgroundColor: '#FFFFFF',
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
    color: '#374151',
  },

  primaryBtn: {
    backgroundColor: '#2563EB',
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
    borderColor: '#2563EB',
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  outlineBtnText: {
    color: '#2563EB',
    fontWeight: '500',
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
