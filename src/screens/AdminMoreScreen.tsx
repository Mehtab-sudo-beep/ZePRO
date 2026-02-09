import React, { useContext } from 'react';
import {
  View,
  
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';

const AdminMoreScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, setUser } = useContext(AuthContext);

  const handleLogout = () => {
    setUser(null);
    navigation.replace('Login');
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>

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

        {/* Menu */}
        <View style={styles.menu}>

          <MenuItem
            title="Add Institute"
            onPress={() => navigation.navigate('AddInstitute')}
          />

          <MenuItem
            title="Add Department"
            onPress={() => navigation.navigate('AddDepartment')}
          />

          <MenuItem
            title="Rule Management"
            onPress={() => navigation.navigate('RuleManagement')}
          />

          <MenuItem
            title="Deadline Management"
            onPress={() => navigation.navigate('DeadlineManagement')}
          />

          <MenuItem
            title="Log Out"
            danger
            onPress={handleLogout}
          />


         {/* =========================
          Bottom Dashboard
         ========================= */}
      

        </View>
      </View>
      <View style={styles.bottomTab}>
        

        <TouchableOpacity onPress={() => navigation.navigate('AdminHome')}>
          <Text style={styles.tab}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Logs')}>
          <Text style={styles.tab}>Logs</Text>
        </TouchableOpacity>
        <Text style={styles.tabActive}>More</Text>
      </View>
    </SafeAreaView>
  );
};

export default AdminMoreScreen;

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
    color: '#FFFFFF',
  },

  profileEmail: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
  },

  menu: {
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
});
