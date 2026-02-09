import React, { useContext } from 'react';
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const MoreScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, setUser } = useContext(AuthContext);

  const handleLogout = () => {
    setUser(null);
    navigation.replace('Login');
  };
  if (!user || user.role !== 'student') return null;
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
          <Text style={styles.headerTitle}>More</Text>
        </View>
        {/* Profile Header */}
                <View style={styles.profileHeader}>
                  <Image
                    source={require('../assets/avatar.png')}
                    style={styles.profileImage}
                  />
        
                  <View style={styles.profileInfo}>
                    <Text style={styles.profileName}>
                      {user.name}
                    </Text>
                    <Text style={styles.profileEmail}>
                      {user.email}
                    </Text>
                  </View>
                </View>
        {/* Menu Items */}
        <ScrollView style={styles.list}>

          <MenuItem
            title="Profile"
            onPress={() => navigation.navigate('Profile')}
          />

          <MenuItem
            title="Help Center"
            onPress={() => navigation.navigate('HelpCenter')}
          />

          <MenuItem
            title="Deadlines"
            onPress={() => navigation.navigate('Deadlines')}
          />

          <MenuItem
            title="Settings"
            onPress={() => navigation.navigate('Settings')}
          />

          <MenuItem
            title="Log Out"
            danger
            onPress={handleLogout}
          />

        </ScrollView>

        {/* Bottom Dashboard */}
                <View style={styles.bottomTab}>
                
                  {/* Home */}
                  <TouchableOpacity
                      style={styles.tabItem1}
                      onPress={() => navigation.navigate('StudentHome')}
                    >
                      <Image source={require('../assets/home.png')} style={styles.tabIcon} />
                      <Text style={styles.tab}>Home</Text>
                    </TouchableOpacity>
                
                  {/* Schedule Meetings */}
                   <TouchableOpacity
                    style={styles.tabItem1}
                    onPress={() => navigation.navigate('ScheduledMeetings')}
                  ><Image source={require('../assets/meeting.png')} style={styles.tabIcon} />
                    <Text style={styles.tab}>Scheduled Meetings</Text>
                  </TouchableOpacity>
                
                  {/* Project Details */}
                  <View style={styles.tabItem1}>
                    <Image source={require('../assets/document.png')} style={styles.tabIcon} />
                    <Text style={styles.tab}>Project Details</Text>
                  </View>
                
                  {/* More */}
                  <View style={styles.tabItem1}>
                      <Image
                      source={require('../assets/more-color.png')}
                      style={styles.tabIcon}
                      resizeMode="contain"
                    />
                      <Text style={styles.tabActive}>More</Text>
                    </View>
                
                </View>
      </View>
    </SafeAreaView>
  );
};

export default MoreScreen;

/* =======================
   MENU ITEM COMPONENT
   ======================= */

const MenuItem = ({
  title,
  onPress,
  danger = false,
}: {
  title: string;
  onPress: () => void;
  danger?: boolean;
}) => (
  <TouchableOpacity style={styles.item} onPress={onPress}>
    <Text
      style={[
        styles.itemText,
        danger && styles.dangerText,
      ]}
    >
      {title}
    </Text>
    <Text style={styles.arrow}>&gt;</Text>
  </TouchableOpacity>
);

/* =======================
   STYLES
   ======================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
  },

  profileHeader: {
    backgroundColor: '#111827',
    paddingVertical: 28,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#D1D5DB',
  },

  profileInfo: {
    marginLeft: 16,
  },

  profileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#faf4f4',
  },

  profileEmail: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
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

  list: {
    backgroundColor: '#FFFFFF',
    marginTop: 12,
  },

  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },

  itemText: {
    fontSize: 15,
    color: '#111827',
  },

  dangerText: {
    color: '#DC2626',
    fontWeight: '500',
  },

  arrow: {
    fontSize: 18,
    color: '#9CA3AF',
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
  tabItem1: {
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
