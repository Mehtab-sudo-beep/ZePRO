import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';

import { ThemeContext } from '../theme/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  getAllProjects,
  sendProjectRequest,
  getRequestedProjects,
} from "../api/studentApi";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { AuthContext } from "../context/AuthContext";
import { StudentAuthContext } from '../context/StudentAuthContext';
import { AlertContext } from '../context/AlertContext';

/* ================= ICON ================= */
const Icon = ({ name, size = 16, colors }: any) => {
  const isDark = colors.background === '#111827';

  const icons: any = {
    search: isDark
      ? require('../assets/search-white.png')
      : require('../assets/search.png'),
    filter: isDark
      ? require('../assets/filter-white.png')
      : require('../assets/filter.png'),
    user: isDark
      ? require('../assets/user-white.png')
      : require('../assets/user.png'),
    tag: isDark
      ? require('../assets/tag-white.png')
      : require('../assets/tag.png'),
    slot: isDark
      ? require('../assets/slot-white.png')
      : require('../assets/slot.png'),
  };

  return (
    <Image source={icons[name]} style={{ width: size, height: size }} />
  );
};

type SearchFilter = 'DOMAIN' | 'FACULTY' | 'PROJECT';

const ProjectListScreen: React.FC = () => {

  const navigation = useNavigation<any>();
  const { colors } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const { studentUser } = useContext(StudentAuthContext);
  const { showAlert } = useContext(AlertContext);

  const isDark = colors.background === '#111827';
  const divider = isDark ? '#374151' : '#E5E7EB';

  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [requestedProjects, setRequestedProjects] = useState<number[]>([]);

  const isTeamLead = studentUser?.isTeamLead === true;

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const studentId = await AsyncStorage.getItem("studentId");

        const res = await getAllProjects();
        setProjects(Array.isArray(res.data) ? res.data : []);

        const req = await getRequestedProjects(Number(studentId));
        setRequestedProjects(req.data);

      } catch (err) {
        console.log("PROJECT LOAD ERROR:", err);
      }
    };

    loadProjects();
  }, []);

  const filteredProjects = projects.filter(project => {
    const query = search.toLowerCase();
    
    return (
      project.title?.toLowerCase().includes(query) ||
      project.domain?.toLowerCase().includes(query) ||
      project.facultyName?.toLowerCase().includes(query)
    );
  });

  const sendRequest = async (projectId: number, projectTitle: string) => {
    try {
      const studentId = await AsyncStorage.getItem("studentId");

      await sendProjectRequest({
        studentId: Number(studentId),
        projectId,
      });

      setRequestedProjects(prev => [...prev, projectId]);

      showAlert("Request Sent", `Request sent for "${projectTitle}"`);

    } catch (err) {
      console.log("PROJECT REQUEST ERROR:", err);
      showAlert("Error", "Could not send request");
    }
  };

  /* ================= CARD ================= */
  const renderItem = ({ item }: any) => {

    const isRequested = requestedProjects.includes(item.projectId);

    return (
      <View style={[styles.card, { backgroundColor: colors.card }]}>

        <Text style={[styles.title, { color: colors.text }]}>
          {item.title}
        </Text>

        <View style={styles.row}>
          <Icon name="user" colors={colors} />
          <Text style={[styles.meta, { color: colors.subText }]}>
            {item.facultyName}
          </Text>
        </View>

        <View style={styles.row}>
          <Icon name="tag" colors={colors} />
          <Text style={[styles.meta, { color: colors.subText }]}>
            {item.domain}
          </Text>
        </View>

        <View style={styles.row}>
          <Icon name="slot" colors={colors} />
          <Text
            style={[
              styles.slots, // you may adjust styles.slots margin later if needed
              { color: item.slots > 0 ? colors.primary : '#EF4444', marginTop: 0 },
            ]}
          >
            {item.slots > 0
              ? `${item.slots} slots available`
              : "No slots available"}
          </Text>
        </View>

        {/* 🔥 IMPROVED BUTTON */}
        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.primaryBtn,
            {
              backgroundColor: isRequested
                ? '#6B7280'
                : !isTeamLead
                  ? '#9CA3AF'
                  : colors.primary,
            },
          ]}
          onPress={() => {
            if (!isTeamLead) return;

            if (isRequested) {
              showAlert("Request already sent");
              return;
            }

            sendRequest(item.projectId, item.title);
          }}
        >
          <View style={styles.btnContent}>
            {!isRequested && <Icon name="tag" size={14} colors={colors} />}
            <Text style={styles.btnText}>
              {isRequested
                ? "Requested"
                : !isTeamLead
                  ? "Only Team Lead"
                  : "Send Request"}
            </Text>
          </View>
        </TouchableOpacity>

      </View>
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

      {/* HEADER */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: divider }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Image
            source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Projects</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.container}>

        {/* SEARCH */}
        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Icon name="search" colors={colors} />

          <TextInput
            placeholder="Search projects..."
            placeholderTextColor={colors.subText}
            value={search}
            onChangeText={setSearch}
            style={[styles.searchInput, { color: colors.text }]}
          />
        </View>


        {/* LIST */}
        <FlatList
          data={filteredProjects}
          keyExtractor={item => item.projectId.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />

      </View>
    </SafeAreaView>
  );
};

export default ProjectListScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },

  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  backIcon: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },

  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    fontSize: 14,
  },

  card: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  title: {
    fontSize: 16,
    fontWeight: '700',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },

  meta: {
    fontSize: 13,
  },

  slots: {
    marginTop: 8,
    fontWeight: '600',
  },

  primaryBtn: {
    marginTop: 12,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },

  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },

  btnText: {
    color: '#fff',
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)', // 🔥 darker overlay
    justifyContent: 'center',
    alignItems: 'center',
  },

  dropdownBox: {
    width: 220,
    borderRadius: 12,
    paddingVertical: 6,

    elevation: 8,              // Android shadow
    shadowColor: '#000',       // iOS shadow
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },

  dropdownOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
});