import React, { useContext } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Image,
} from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ThemeContext } from '../theme/ThemeContext';

type Props = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'FacultyCreateMenu'
  >;
};

const FacultyCreateMenuScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useContext(ThemeContext);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>Create</Text>

      {/* DOMAIN */}
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderLeftColor: '#4F46E5',
          },
        ]}
        onPress={() => navigation.navigate('CreateDomain')}
      >
        <Text style={[styles.cardTitle, { color: '#4F46E5' }]}>
          Create Domain
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.subText }]}>
          Add a new research domain
        </Text>
      </TouchableOpacity>

      {/* SUBDOMAIN */}
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderLeftColor: '#16A34A',
          },
        ]}
        onPress={() => navigation.navigate('CreateSubDomain')}
      >
        <Text style={[styles.cardTitle, { color: '#16A34A' }]}>
          Create SubDomain
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.subText }]}>
          Add specialization inside a domain
        </Text>
      </TouchableOpacity>

      {/* PROJECT */}
      <TouchableOpacity
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            borderLeftColor: '#F59E0B',
          },
        ]}
        onPress={() => navigation.navigate('CreateProject')}
      >
        <Text style={[styles.cardTitle, { color: '#F59E0B' }]}>
          Create Project
        </Text>
        <Text style={[styles.cardSubtitle, { color: colors.subText }]}>
          Publish a project for students
        </Text>
      </TouchableOpacity>

      {/* 🔽 Bottom Navigation */}
      <View
        style={[
          styles.bottomTab,
          {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
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
          <Text style={[styles.tabText, { color: colors.subText }]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('FacultyCreateMenu')}
        >
          <Image
            source={require('../assets/create.png')}
            style={styles.tabIcon}
          />
          <Text style={[styles.tabText, { color: colors.primary }]}>
            Create
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.tabItem}
          onPress={() => navigation.navigate('FacultyMore')}
        >
          <Image
            source={require('../assets/more.png')}
            style={styles.tabIcon}
          />
          <Text style={[styles.tabText, { color: colors.subText }]}>
            More
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default FacultyCreateMenuScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 80,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 40,
  },

  card: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
    borderLeftWidth: 6,

    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },

    elevation: 4,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },

  cardSubtitle: {
    fontSize: 14,
  },

  /* 🔽 Bottom Nav */
  bottomTab: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,

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

  tabText: {
    fontSize: 12,
  },
});