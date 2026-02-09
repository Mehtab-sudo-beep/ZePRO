import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

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
  {
    id: '4',
    name: 'Smart Waste Management System',
    faculty: 'Dr. Suresh Kumar',
    domain: 'IoT',
    subdomain: 'Embedded Systems',
    problem: 'Optimize waste collection using smart sensors.',
    slots: 1,
  },
  {
    id: '5',
    name: 'Blockchain Certificate Verification',
    faculty: 'Dr. Neha Sharma',
    domain: 'Blockchain',
    subdomain: 'Smart Contracts',
    problem: 'Verify certificates securely using blockchain.',
    slots: 2,
  },
  {
    id: '6',
    name: 'AI Chatbot for College Helpdesk',
    faculty: 'Dr. Ramesh Iyer',
    domain: 'Artificial Intelligence',
    subdomain: 'NLP',
    problem: 'Automate student queries using AI.',
    slots: 0,
  },
  {
    id: '7',
    name: 'Smart Traffic Signal Control',
    faculty: 'Prof. Kiran Das',
    domain: 'Machine Learning',
    subdomain: 'Reinforcement Learning',
    problem: 'Reduce congestion using adaptive signals.',
    slots: 2,
  },
  {
    id: '8',
    name: 'Online Exam Proctoring System',
    faculty: 'Dr. Meera Joseph',
    domain: 'Computer Vision',
    subdomain: 'Face Tracking',
    problem: 'Detect cheating during online exams.',
    slots: 1,
  },
  {
    id: '9',
    name: 'Healthcare Appointment App',
    faculty: 'Dr. Abdul Rahman',
    domain: 'Mobile Development',
    subdomain: 'React Native',
    problem: 'Simplify doctor appointment booking.',
    slots: 3,
  },
  {
    id: '10',
    name: 'Crop Yield Prediction',
    faculty: 'Dr. Lakshmi Priya',
    domain: 'Data Science',
    subdomain: 'Predictive Analytics',
    problem: 'Predict crop yield using ML models.',
    slots: 0,
  },
];

/* ---------- COMPONENT ---------- */

const ProjectListScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<SearchFilter>('DOMAIN');

  const filteredProjects = PROJECTS.filter((project) => {
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
      [{ text: 'OK' }]
    );
  };

  const renderItem = ({ item }: { item: Project }) => (
    <View style={styles.card}>
      <Text style={styles.title}>{item.name}</Text>
      <Text style={styles.faculty}> {item.faculty}</Text>

      <Text style={styles.text}>
        <Text style={styles.label}>Domain: </Text>{item.domain}
      </Text>

      <Text style={styles.text}>
        <Text style={styles.label}>Sub-domain: </Text>{item.subdomain}
      </Text>

      <Text style={styles.text}>
        <Text style={styles.label}>Problem: </Text>{item.problem}
      </Text>

      <Text
        style={[
          styles.slots,
          { color: item.slots > 0 ? 'green' : 'red' },
        ]}
      >
        {item.slots > 0
          ? `Slots Available: ${item.slots}`
          : 'No Slots Available'}
      </Text>

      {item.slots > 0 && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => sendRequest(item.name)}
        >
          <Text style={styles.buttonText}>Send Request</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* 🔍 SEARCH BAR */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder={
            filter === 'DOMAIN'
              ? 'Search by domain'
              : 'Search by faculty'
          }
          placeholderTextColor="#000"
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        <Text style={styles.searchEmoji}>🔍</Text>
      </View>

      {/* 🎛 FILTER OPTIONS */}
      <View style={styles.filterRow}>
        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === 'DOMAIN' && styles.activeFilter,
          ]}
          onPress={() => setFilter('DOMAIN')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'DOMAIN' && styles.activeFilterText,
            ]}
          >
            Domain
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterChip,
            filter === 'FACULTY' && styles.activeFilter,
          ]}
          onPress={() => setFilter('FACULTY')}
        >
          <Text
            style={[
              styles.filterText,
              filter === 'FACULTY' && styles.activeFilterText,
            ]}
          >
            Faculty
          </Text>
        </TouchableOpacity>
      </View>

      {filteredProjects.length === 0 ? (
        <Text style={styles.noProjectText}>
          No projects found
        </Text>
      ) : (
        <FlatList
          data={filteredProjects}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default ProjectListScreen;

/* ---------- STYLES ---------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding: 10,
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    color: '#000',
  },
  searchEmoji: {
    fontSize: 18,
  },

  filterRow: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  filterChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    marginRight: 10,
  },
  activeFilter: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  filterText: {
    color: '#333',
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#fff',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  faculty: {
    fontSize: 14,
    fontWeight: '600',
    marginVertical: 6,
    color: '#2563EB',
  },
  label: {
    fontWeight: '600',
  },
  text: {
    fontSize: 14,
    marginBottom: 4,
    color: '#333',
  },
  slots: {
    marginTop: 6,
    fontWeight: 'bold',
  },
  button: {
    marginTop: 10,
    backgroundColor: '#ff9900',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noProjectText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#777',
  },
});