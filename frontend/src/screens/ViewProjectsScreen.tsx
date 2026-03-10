import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

import { ThemeContext } from '../theme/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

/* ---------- TYPES ---------- */

interface Project {
  id: string;
  name: string;
  faculty: string;
  domain: string;
  subdomain: string;
  problem: string;
  slots: number;
}

type SearchFilter = 'DOMAIN' | 'FACULTY';

/* ---------- SAMPLE DATA ---------- */

const PROJECTS: Project[] = [
  {
    id: '1',
    name: 'Smart Attendance System',
    faculty: 'Dr. Vinay V. Panicker',
    domain: 'Machine Learning',
    subdomain: 'Computer Vision',
    problem: 'Automate student attendance using face recognition.',
    slots: 2,
  },
  {
    id: '2',
    name: 'E-Commerce Recommendation Engine',
    faculty: 'Dr. Anitha Menon',
    domain: 'Machine Learning',
    subdomain: 'Recommendation Systems',
    problem: 'Suggest products based on user behavior.',
    slots: 0,
  },
  {
    id: '3',
    name: 'College Event Management App',
    faculty: 'Prof. Rahul Nair',
    domain: 'Web Development',
    subdomain: 'Full Stack',
    problem: 'Manage registrations and event updates.',
    slots: 3,
  },
];

/* ---------- COMPONENT ---------- */

const ProjectListScreen: React.FC = () => {
  const { colors } = useContext(ThemeContext);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<SearchFilter>('DOMAIN');

  const filteredProjects = PROJECTS.filter(project => {
    const query = search.toLowerCase();
    if (filter === 'DOMAIN') {
      return project.domain.toLowerCase().includes(query);
    }
    return project.faculty.toLowerCase().includes(query);
  });

  const sendRequest = (projectName: string) => {
    Alert.alert(
      'Request Sent',
      `Your request for "${projectName}" has been sent.`,
      [{ text: 'OK' }],
    );
  };

  const renderItem = ({ item }: { item: Project }) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Text style={[styles.title, { color: colors.text }]}>{item.name}</Text>

      <Text style={[styles.faculty, { color: colors.primary }]}>
        {item.faculty}
      </Text>

      <Text style={[styles.text, { color: colors.text }]}>
        <Text style={styles.label}>Domain: </Text>
        {item.domain}
      </Text>

      <Text style={[styles.text, { color: colors.text }]}>
        <Text style={styles.label}>Sub-domain: </Text>
        {item.subdomain}
      </Text>

      <Text style={[styles.text, { color: colors.text }]}>
        <Text style={styles.label}>Problem: </Text>
        {item.problem}
      </Text>

      <Text
        style={[
          styles.slots,
          { color: item.slots > 0 ? colors.primary : 'red' },
        ]}
      >
        {item.slots > 0
          ? `Slots Available: ${item.slots}`
          : 'No Slots Available'}
      </Text>

      {item.slots > 0 && (
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={() => sendRequest(item.name)}
        >
          <Text style={styles.buttonText}>Send Request</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* SEARCH BAR (Clean) */}
        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <TextInput
            placeholder={
              filter === 'DOMAIN' ? 'Search by domain' : 'Search by faculty'
            }
            placeholderTextColor={colors.subText}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>

        {/* FILTER OPTIONS */}
        <View style={styles.filterRow}>
          {['DOMAIN', 'FACULTY'].map(type => (
            <TouchableOpacity
              key={type}
              style={[
                styles.filterChip,
                {
                  borderColor: colors.border,
                  backgroundColor:
                    filter === type ? colors.primary : 'transparent',
                },
              ]}
              onPress={() => setFilter(type as SearchFilter)}
            >
              <Text
                style={{
                  color: filter === type ? '#fff' : colors.text,
                  fontWeight: '600',
                }}
              >
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {filteredProjects.length === 0 ? (
          <Text style={[styles.noProjectText, { color: colors.subText }]}>
            No projects found
          </Text>
        ) : (
          <FlatList
            data={filteredProjects}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default ProjectListScreen;

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  searchContainer: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    marginBottom: 12,
  },

  searchInput: {
    paddingVertical: 12,
    fontSize: 14,
  },

  filterRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },

  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 10,
  },

  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
  },

  title: {
    fontSize: 17,
    fontWeight: '600',
  },

  faculty: {
    fontSize: 14,
    fontWeight: '600',
    marginVertical: 6,
  },

  label: {
    fontWeight: '600',
  },

  text: {
    fontSize: 14,
    marginBottom: 4,
  },

  slots: {
    marginTop: 8,
    fontWeight: '600',
  },

  button: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },

  noProjectText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 15,
  },
});
