import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);

  if (!user) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={[styles.back, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Profile
          </Text>
        </View>

        {/* Profile Top */}
        <View style={[styles.profileHeader, { backgroundColor: colors.card }]}>
          <Image
            source={require('../assets/avatar.png')}
            style={[
              styles.profileImage,
              { backgroundColor: colors.background },
            ]}
          />

          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {user.name}
            </Text>
            <Text style={[styles.profileEmail, { color: colors.subText }]}>
              {user.email}
            </Text>
          </View>
        </View>

        {/* Details */}
        <ScrollView
          style={[styles.list, { backgroundColor: colors.card }]}
          contentContainerStyle={{ paddingBottom: 20 }}
        >
          <InfoItem label="Year" value="3rd Year" colors={colors} />
          <InfoItem label="Branch" value="Computer Science" colors={colors} />
          <InfoItem
            label="College"
            value="National Institute of Technology, Calicut"
            colors={colors}
          />
          <InfoItem label="CGPA" value="8.75" colors={colors} />
          <InfoItem
            label="Interests"
            value="AI, Web Dev, Competitive Programming"
            colors={colors}
          />
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const InfoItem = ({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: any;
}) => (
  <View style={[styles.item, { borderColor: colors.border }]}>
    <Text style={[styles.label, { color: colors.subText }]}>{label}</Text>
    <Text style={[styles.value, { color: colors.text }]}>{value}</Text>
  </View>
);

export default ProfileScreen;

/* =======================
   STYLES
======================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    height: 60,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },

  back: {
    fontSize: 22,
  },

  profileHeader: {
    paddingVertical: 28,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },

  profileImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },

  profileInfo: {
    marginLeft: 16,
  },

  profileName: {
    fontSize: 16,
    fontWeight: '600',
  },

  profileEmail: {
    fontSize: 13,
    marginTop: 4,
  },

  list: {
    marginTop: 12,
    paddingHorizontal: 16,
    flex: 1,
  },

  item: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },

  label: {
    fontSize: 14,
  },

  value: {
    fontSize: 15,
    fontWeight: '500',
    marginTop: 4,
  },
});
