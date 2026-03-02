import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';

const AdminMoreScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user, setUser } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);

  if (!user || user.role !== 'admin') return null;

  const handleLogout = () => {
    setUser(null);
    navigation.replace('Login');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        {/* Profile */}
        <View style={[styles.profileHeader, { backgroundColor: colors.card }]}>
          <Image
            source={require('../assets/avatar.png')}
            style={styles.profileImage}
          />
          <View style={{ marginLeft: 15 }}>
            <Text style={[styles.name, { color: colors.text }]}>
              {user.name}
            </Text>
            <Text style={{ color: colors.subText }}>{user.email}</Text>
          </View>
        </View>

        {/* Menu */}
        <View style={[styles.menu, { backgroundColor: colors.card }]}>
          <MenuItem
            title="Institute & Department"
            onPress={() => navigation.navigate('AddInstitute')}
            colors={colors}
          />

          <MenuItem
            title="Rule Management"
            onPress={() => navigation.navigate('RuleManagement')}
            colors={colors}
          />

          <MenuItem
            title="Deadline Management"
            onPress={() => navigation.navigate('DeadlineManagement')}
            colors={colors}
          />

          <MenuItem
            title="Settings"
            onPress={() => navigation.navigate('AdminSettings')}
            colors={colors}
          />

          <MenuItem
            title="Log Out"
            onPress={handleLogout}
            danger
            colors={colors}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AdminMoreScreen;

const MenuItem = ({ title, onPress, danger = false, colors }: any) => (
  <TouchableOpacity
    style={[styles.item, { borderColor: colors.border }]}
    onPress={onPress}
  >
    <Text
      style={[styles.itemText, { color: danger ? '#DC2626' : colors.text }]}
    >
      {title}
    </Text>
    <Text style={{ color: colors.subText }}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  profileHeader: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  menu: {
    marginTop: 10,
  },
  item: {
    paddingVertical: 18,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  itemText: {
    fontSize: 16,
  },
});
