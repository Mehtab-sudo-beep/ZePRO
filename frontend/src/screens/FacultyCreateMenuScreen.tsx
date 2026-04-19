import React, { useContext } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  ScrollView,
} from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ThemeContext } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { AlertContext } from '../context/AlertContext';
type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'FacultyCreateMenu'>;
};

const FacultyCreateMenuScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useContext(ThemeContext);

  const isDark = colors.background === '#111827';
  const accentSoft = isDark ? 'rgba(96,165,250,0.12)' : 'rgba(37,99,235,0.07)';
  const divider = isDark ? '#374151' : '#E5E7EB';

  const menuItems = [
    {
      id: 'domain',
      title: 'Create Domain',
      subtitle: 'Define broad research areas',
      icon: require('../assets/create.png'),
      color: '#4F46E5',
      route: 'CreateDomain',
    },
    {
      id: 'subdomain',
      title: 'Create SubDomain',
      subtitle: 'Narrow down research focus',
      icon: require('../assets/create.png'),
      color: '#16A34A',
      route: 'CreateSubDomain',
    },
    {
      id: 'project',
      title: 'Create Project',
      subtitle: 'Launch student projects',
      icon: require('../assets/create.png'),
      color: '#F59E0B',
      route: 'CreateProject',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>
        {/* Header - Consistent with FacultyHomeScreen */}
        <View
          style={[
            styles.header,
            { backgroundColor: colors.card, borderBottomColor: divider },
          ]}
        >
          <View>
            <Text style={[styles.headerGreeting, { color: colors.subText }]}>
              Dashboard
            </Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Create New
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={false}
        >
          {/* Menu Cards */}
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.actionRow, { backgroundColor: colors.card }]}
              onPress={() => navigation.navigate(item.route as any)}
              activeOpacity={0.65}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: item.color + '20' }]}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 6,
                    backgroundColor: item.color,
                    opacity: 0.8,
                  }}
                />
              </View>
              <View style={styles.actionRowText}>
                <Text style={[styles.actionRowLabel, { color: colors.text }]}>
                  {item.title}
                </Text>
                <Text style={[styles.actionRowSub, { color: colors.subText }]}>
                  {item.subtitle}
                </Text>
              </View>
              <Text style={[styles.chevron, { color: colors.subText }]}>›</Text>
            </TouchableOpacity>
          ))}

          <View style={{ height: 16 }} />
        </ScrollView>
      </View>

      {/* Bottom Tab - Consistent with FacultyHomeScreen */}
      <View
        style={[styles.bottomTab, { backgroundColor: colors.card, borderTopColor: divider }]}
      >
        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('FacultyHome')}
        >
          <Image source={require('../assets/home.png')} style={styles.tabIcon} />
          <Text style={[styles.tab, { color: colors.subText }]}>Home</Text>
        </TouchableOpacity>

        <View style={styles.tabItem}>
          <View style={[styles.tabActiveIndicator, { backgroundColor: colors.primary }]} />
          <Image source={require('../assets/create-color.png')} style={styles.tabIcon} />
          <Text style={[styles.tabActive, { color: colors.primary }]}>Create</Text>
        </View>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('FacultyMore')}
        >
          <Image source={require('../assets/more.png')} style={styles.tabIcon} />
          <Text style={[styles.tab, { color: colors.subText }]}>More</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default FacultyCreateMenuScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    height: 72,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 2,
  },
  headerGreeting: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },

  content: { padding: 16, paddingBottom: 8 },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    marginBottom: 12,
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  actionIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRowText: { flex: 1 },
  actionRowLabel: { fontSize: 14, fontWeight: '600' },
  actionRowSub: { fontSize: 12, marginTop: 1 },
  chevron: { fontSize: 22, fontWeight: '300', marginRight: 2 },

  bottomTab: {
    height: 68,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 6,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  tabIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
    resizeMode: 'contain',
  },
  tab: {
    fontSize: 12,
    fontWeight: '500',
  },
  tabActive: {
    fontSize: 12,
    fontWeight: '700',
  },
  tabActiveIndicator: {
    position: 'absolute',
    top: 0,
    width: '40%',
    height: 3,
    borderBottomLeftRadius: 3,
    borderBottomRightRadius: 3,
  },
});