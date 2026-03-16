import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';

import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type Props = {
  navigation: NativeStackNavigationProp<
    RootStackParamList,
    'FacultyCreateMenu'
  >;
};

const FacultyCreateMenuScreen: React.FC<Props> = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create</Text>

      {/* DOMAIN */}

      <TouchableOpacity
        style={[styles.card, { borderLeftColor: '#4F46E5' }]}
        onPress={() => navigation.navigate('CreateDomain')}
      >
        <Text style={[styles.cardTitle, { color: '#4F46E5' }]}>
          Create Domain
        </Text>
        <Text style={styles.cardSubtitle}>Add a new research domain</Text>
      </TouchableOpacity>

      {/* SUBDOMAIN */}

      <TouchableOpacity
        style={[styles.card, { borderLeftColor: '#16A34A' }]}
        onPress={() => navigation.navigate('CreateSubDomain')}
      >
        <Text style={[styles.cardTitle, { color: '#16A34A' }]}>
          Create SubDomain
        </Text>
        <Text style={styles.cardSubtitle}>
          Add specialization inside a domain
        </Text>
      </TouchableOpacity>

      {/* PROJECT */}

      <TouchableOpacity
        style={[styles.card, { borderLeftColor: '#F59E0B' }]}
        onPress={() => navigation.navigate('CreateProject')}
      >
        <Text style={[styles.cardTitle, { color: '#F59E0B' }]}>
          Create Project
        </Text>
        <Text style={styles.cardSubtitle}>Publish a project for students</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FacultyCreateMenuScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 20,
    paddingTop: 80,
  },

  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 40,
  },

  card: {
    backgroundColor: '#FFFFFF',
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
    color: '#6B7280',
  },
});
