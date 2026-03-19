import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
} from 'react-native';

import { ThemeContext } from '../theme/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getAllProjects, sendProjectRequest, getRequestedProjects } from "../api/studentApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { AlertContext } from '../context/AlertContext';
interface Project {
  projectId: number;
  title: string;
  facultyName: string;
  domain: string;
  subdomain: string;
  description: string;
  slots: number;
}

type SearchFilter = 'DOMAIN' | 'FACULTY' | 'PROJECT';

const ProjectListScreen: React.FC = () => {

  const navigation = useNavigation<any>();
  const { colors } = useContext(ThemeContext);

  const [projects, setProjects] = useState<Project[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<SearchFilter>('PROJECT');
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [requestedProjects, setRequestedProjects] = useState<number[]>([]);
  const { user } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const isDark = colors.background === '#111827';

const isTeamLead = user?.isTeamLead === true;


  useEffect(() => {

  const loadProjects = async () => {

    try {

      const studentId = await AsyncStorage.getItem("studentId");

      const res = await getAllProjects();

      if (Array.isArray(res.data)) {
        setProjects(res.data);
      } else {
        setProjects([]);
      }

      const req = await getRequestedProjects(Number(studentId));

      setRequestedProjects(req.data);

    } catch (err) {

      console.log("PROJECT LOAD ERROR:", err);

    }

  };

  loadProjects();

}, []);

  const filteredProjects = (projects || []).filter(project => {

    const query = search.toLowerCase();

    if (filter === "DOMAIN") {
      return project.domain?.toLowerCase().includes(query) || project.subdomain?.toLowerCase().includes(query);
    } else if (filter === "FACULTY") {
      return project.facultyName?.toLowerCase().includes(query);
    } else { // 'PROJECT'
      return project.title?.toLowerCase().includes(query);
    }

  });

  const sendRequest = async (projectId: number, projectTitle: string) => {

    try {

      const studentId = await AsyncStorage.getItem("studentId");

      await sendProjectRequest({
        studentId: Number(studentId),
        projectId: projectId,
      });

      setRequestedProjects(prev => [...prev, projectId]);

showAlert(
  "Request Sent",
  `Your request for "${projectTitle}" has been sent`
);

    } catch (err) {

      console.log("PROJECT REQUEST ERROR:", err);
      showAlert("Error", "Could not send request");

    }

  };

  const renderItem = ({ item }: { item: Project }) => {

  const isRequested = requestedProjects.includes(item.projectId);

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >

      <Text style={[styles.title, { color: colors.text }]}>
        {item.title}
      </Text>

      <Text style={[styles.faculty, { color: colors.primary }]}>
        {item.facultyName}
      </Text>

      <Text style={[styles.text, { color: colors.text }]}>
        <Text style={styles.label}>Domain: </Text>
        {item.domain}
      </Text>

      <Text
        style={[
          styles.slots,
          { color: item.slots > 0 ? colors.primary : "red" },
        ]}
      >
        {item.slots > 0
          ? `Slots Available: ${item.slots}`
          : "No Slots Available"}
      </Text>

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: isRequested
            ? "#6B7280"   // gray-500
            : !isTeamLead
            ? "#999"
            : colors.primary,
          },
        ]}
        onPress={() => {

          if (!isTeamLead) {
            
            return;
          }

          if (isRequested) {
              showAlert("Request already sent for this project");
              return;
          }

          sendRequest(item.projectId, item.title);
        }}
      >
        <Text style={styles.buttonText}>
          {isRequested ? "Request Sent" : "Send Request"}
        </Text>
      </TouchableOpacity>

    </View>
  );
};

  return (

    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

      <View style={styles.header}>

        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Image
                    source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
                    style={styles.backIcon}
                  />
                  </TouchableOpacity>
        

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Projects
        </Text>

      </View>

      <View style={[styles.container, { backgroundColor: colors.background }]}>

        <View
          style={[
            styles.searchContainer,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              flexDirection: 'row',
              alignItems: 'center',
            },
          ]}
        >
          <TextInput
            placeholder={`Search by ${filter.toLowerCase()}`}
            placeholderTextColor={colors.subText}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: colors.text, flex: 1, paddingLeft: 14 }]}
          />

          <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />

          <TouchableOpacity 
            style={styles.filterDropdownButton}
            onPress={() => setDropdownVisible(true)}
          >
            <Text style={[styles.filterDropdownText, { color: colors.text }]}>
              {filter === 'DOMAIN' ? 'Domain' : filter === 'FACULTY' ? 'Faculty' : 'Project'}
            </Text>
          </TouchableOpacity>

        </View>

        <Modal visible={dropdownVisible} transparent animationType="fade">
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setDropdownVisible(false)}
          >
            <View style={[styles.dropdownBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {['PROJECT', 'DOMAIN', 'FACULTY'].map(type => (
                <TouchableOpacity
                  key={type}
                  style={styles.dropdownOption}
                  onPress={() => {
                    setFilter(type as SearchFilter);
                    setDropdownVisible(false);
                  }}
                >
                  <Text style={[styles.dropdownOptionText, { color: filter === type ? colors.primary : colors.text }]}>
                    {type === 'PROJECT' ? 'Project' : type === 'DOMAIN' ? 'Domain' : 'Faculty'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>

        {filteredProjects.length === 0 ? (

          <Text style={[styles.noProjectText, { color: colors.subText }]}>
            No projects found
          </Text>

        ) : (

          <FlatList
            data={filteredProjects}
            keyExtractor={item => item.projectId.toString()}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
          />

        )}

      </View>

    </SafeAreaView>

  );

};

export default ProjectListScreen;

const styles = StyleSheet.create({

  container: {
    flex: 1,
    padding: 16,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    gap: 12,
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },

  searchContainer: {
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },

  filterDropdownButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  
  filterDropdownText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  verticalDivider: {
    width: 1,
    height: 24,
  },
  
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  dropdownBox: {
    width: 200,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  
  dropdownOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150,150,150,0.1)',
  },
  
  dropdownOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },

  searchInput: {
    paddingVertical: 12,
    fontSize: 14,
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
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { width: 22, height: 22, resizeMode: 'contain' },
  headerSub: {
    fontSize: 12,
    marginTop: 1,
  },
});