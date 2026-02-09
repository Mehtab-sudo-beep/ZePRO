import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
// import HomeIcon from '../assets/home.png'
// import HomeActiveIcon from '../assets/home-color.png';

// import MeetingsIcon from '../assets/meeting.png';
// import MeetingsActiveIcon from '../assets/meeting-color.png';

// import ProjectsIcon from '../assets/document.png';
// import ProjectsActiveIcon from '../assetsdocument-color.png';

// import MoreIcon from '../assetsmore.png';
// import MoreActiveIcon from '../assets/bottomTabs/more-color.png';


type StudentHomeNavigationProp =
  NativeStackNavigationProp<RootStackParamList, 'StudentHome'>;
 


const StudentHomeScreen: React.FC = () => {
 


  const { user } = useContext(AuthContext);


  const navigation = useNavigation<StudentHomeNavigationProp>();


  if (!user) return null;
  if (user.role !== 'student') return null;

  const { isInTeam } = user;

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>

      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
 
  <Text style={[styles.headerTitle, { marginLeft: 8 }]}>
    Home
  </Text>
</View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>

        {/* =========================
            TEAM ACTIONS / DETAILS
           ========================= */}

        {!isInTeam ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Team Actions</Text>

            <TouchableOpacity style={styles.actionButton}
            onPress={() => navigation.navigate('CreateTeam')}>
              <Text style={styles.actionText}>Create Team</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}
            onPress={() => navigation.navigate('JoinTeam')}>
              <Text style={styles.actionText}>Join Team</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>My Team</Text>

            <Text style={styles.label}>Team Name</Text>
            <Text style={styles.value}>Project Alpha</Text>

            <Text style={styles.label}>Team Lead</Text>
            <Text style={styles.value}>Mehtab Shaik</Text>

            <Text style={styles.label}>Members</Text>
            <Text style={styles.value}>• Student A</Text>
            <Text style={styles.value}>• Student B</Text>
            <Text style={styles.value}>• Student C</Text>
          </View>
        )}

        {/* =========================
            PROJECT SECTION
           ========================= */}
        <View style={styles.card}>
  <Text style={styles.cardTitle}>Projects</Text>

  <TouchableOpacity
    style={styles.actionButton}
    onPress={() => navigation.navigate('ViewProjects')}
  >
    <Text style={styles.actionText}>View Projects</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.actionButton}
    
  >
    <Text style={styles.actionText}>View Allocated Project</Text>
  </TouchableOpacity>

  <Text style={styles.placeholderText}>
    Project details will appear once assigned.
  </Text>
</View>

      </ScrollView>

     {/* Bottom Dashboard */}
<View style={styles.bottomTab}>

  {/* Home */}
  <View style={styles.tabItem}>
    <Image
    source={require('../assets/home-color.png')}
    style={styles.tabIcon}
    resizeMode="contain"
  />
    <Text style={styles.tabActive}>Home</Text>
  </View>

  {/* Schedule Meetings */}
  <TouchableOpacity
    style={styles.tabItem}
    onPress={() => navigation.navigate('ScheduledMeetings')}
  >
    <Image source={require('../assets/meeting.png')} style={styles.tabIcon} />
    <Text style={styles.tab}>Schedule Meetings</Text>
  </TouchableOpacity>

  {/* Project Details */}
  <View style={styles.tabItem}>
    <Image source={require('../assets/document.png')} style={styles.tabIcon} />
    <Text style={styles.tab}>Project Details</Text>
  </View>

  {/* More */}
  <TouchableOpacity
    style={styles.tabItem}
    onPress={() => navigation.navigate('More')}
  ><Image source={require('../assets/more.png')} style={styles.tabIcon} />
    <Text style={styles.tab}>More</Text>
  </TouchableOpacity>

</View>

    </View>
    </SafeAreaView>
  );
};

export default StudentHomeScreen;

/* =======================
   STYLES (UNCHANGED)
   ======================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },

  header: {
    height: 60,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
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
    backgroundColor: '#FFFFFF',
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
    color: '#6B7280',
    marginTop: 8,
  },

  value: {
    fontSize: 14,
    fontWeight: '400',
    marginTop: 2,
  },
headerIcon: {
  width: 62,
  height: 42,
},
  actionButton: {
    borderWidth: 1,
    borderColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },

  actionText: {
    color: '#2563EB',
    fontWeight: '600',
  },

  actionButtonPrimary: {
    backgroundColor: '#232528',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 16,
  },

  actionTextPrimary: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  placeholderText: {
    color: '#6B7280',
    fontStyle: 'italic',
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

  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
safeArea: {
  flex: 1,
  backgroundColor: '#F9FAFB',
},
  viewMore: {
    fontSize: 18,
    fontWeight: '700',
    color: '#2b2c2d',
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
