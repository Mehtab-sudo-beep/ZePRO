import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../theme/ThemeContext';
import { StudentAuthContext } from '../context/StudentAuthContext';
import { AuthContext } from '../context/AuthContext';
import { AlertContext } from '../context/AlertContext';
import DocumentCard from '../components/DocumentCard';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from '@react-navigation/native';
import { sendProjectRequest, getDepartmentDeadlines, getProjectById } from '../api/studentApi';

import { BASE_URL } from '../api/api';

const ProjectDetailsScreen = () => {
  const { colors } = useContext(ThemeContext);
  const { studentUser } = useContext(StudentAuthContext);
  const { user } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { project: initialProject, isRequested: initialIsRequested, projectId: passedProjectId } = route.params || {};
  const [project, setProject] = useState<any>(initialProject || null);
  const [loadingProject, setLoadingProject] = useState(!initialProject && !!passedProjectId);

  const [isRequested, setIsRequested] = useState(initialIsRequested || false);
  const [isSending, setIsSending] = useState(false);
  const [loadingDeadline, setLoadingDeadline] = useState(true);
  const [deadlinePassed, setDeadlinePassed] = useState(false);

  const isDark = colors.background === '#111827';
  const isTeamLead = studentUser?.isTeamLead === true;

  useEffect(() => {
    if (!project && passedProjectId) {
      fetchProjectById();
    }
    fetchDeadlineStatus();
  }, []);

  const fetchProjectById = async () => {
    try {
      setLoadingProject(true);
      const studentIdStr = await AsyncStorage.getItem("studentId");
      const res = await getProjectById(Number(passedProjectId), Number(studentIdStr));
      setProject(res.data);
    } catch (err) {
      console.log('Error fetching project by ID', err);
      showAlert('Error', 'Failed to load project details');
    } finally {
      setLoadingProject(false);
    }
  };

  const fetchDeadlineStatus = async () => {
    try {
      const studentIdStr = await AsyncStorage.getItem("studentId");
      if (!studentIdStr) return;
      const res = await getDepartmentDeadlines(Number(studentIdStr));
      const deadlineStr = res.data?.projectCreationDate;
      
      if (!deadlineStr) {
        // null deadline means always enabled
        setDeadlinePassed(true);
      } else {
        const deadlineDate = new Date(deadlineStr);
        if (new Date() > deadlineDate) {
          setDeadlinePassed(true);
        } else {
          setDeadlinePassed(false);
        }
      }
    } catch (err) {
      console.log('Error fetching deadlines', err);
      // fallback
      setDeadlinePassed(true);
    } finally {
      setLoadingDeadline(false);
    }
  };

  const handleSendRequest = async () => {
    if (!isTeamLead) {
      showAlert('⚠️ Not Team Lead', 'Only the team lead can send requests');
      return;
    }
    if (isRequested) {
      showAlert("⚠️ Already Requested", "You already requested this project");
      return;
    }

    try {
      setIsSending(true);
      const studentId = await AsyncStorage.getItem("studentId");

      await sendProjectRequest({
        studentId: Number(studentId),
        projectId: project.projectId,
      });

      setIsRequested(true);
      showAlert("Request Sent", `Request sent for "${project.title}"`, [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || 'Failed to send request';
      showAlert('Error', errorMsg, [{ text: 'OK' }]);
    } finally {
      setIsSending(false);
    }
  };



  if (loadingProject) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ marginTop: 12, color: colors.subText }}>Loading project details...</Text>
      </SafeAreaView>
    );
  }

  if (!project) return null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: isDark ? '#374151' : '#E5E7EB' }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }}>
          <Image
            source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Project Details</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: colors.text }]}>{project.title}</Text>
        
        {project.description ? (
          <Text style={[styles.description, { color: colors.subText }]}>{project.description}</Text>
        ) : null}

        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Text style={[styles.label, { color: colors.subText }]}>Faculty</Text>
          <Text style={[styles.value, { color: colors.text }]}>{project.facultyName}</Text>

          <Text style={[styles.label, { color: colors.subText }]}>Domain</Text>
          <Text style={[styles.value, { color: colors.text }]}>{project.domain || 'N/A'}</Text>

          <Text style={[styles.label, { color: colors.subText }]}>Subdomain</Text>
          <Text style={[styles.value, { color: colors.text }]}>{project.subdomain || 'N/A'}</Text>

          <Text style={[styles.label, { color: colors.subText }]}>Slots Available</Text>
          <Text style={[styles.value, { color: project.remainingSlots > 0 ? colors.primary : '#EF4444' }]}>
            {project.remainingSlots > 0 ? `${project.remainingSlots} slots` : 'No slots available'}
          </Text>
        </View>

        {project.documents && project.documents.length > 0 && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Documents</Text>
            {project.documents.map((doc: string, index: number) => {
              return (
                <DocumentCard
                  key={index}
                  label={`Document ${index + 1}`}
                  value={doc}
                  colors={colors}
                  user={user}
                />
              );
            })}
          </View>
        )}

      </ScrollView>

      {/* FIXED BOTTOM BUTTON */}
      <View style={[styles.bottomBar, { backgroundColor: colors.card, borderTopColor: isDark ? '#374151' : '#E5E7EB' }]}>
        {loadingDeadline ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              {
                backgroundColor: isRequested
                  ? '#6B7280'
                  : (!isTeamLead || !deadlinePassed)
                    ? '#9CA3AF'
                    : colors.primary,
              },
            ]}
            onPress={handleSendRequest}
            disabled={!isTeamLead || isRequested || isSending || !deadlinePassed}
          >
            {isSending ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.btnText}>
                {isRequested
                  ? "✓ Requested"
                  : !isTeamLead
                    ? "Team Lead Only"
                    : !deadlinePassed
                      ? "Deadline Active (Wait)"
                      : "Send Request"}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

export default ProjectDetailsScreen;

const styles = StyleSheet.create({
  header: {
    height: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  backIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  description: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 20,
  },
  card: {
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.0,
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  docLink: {
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  linkText: {
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  bottomBar: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
  },
  primaryBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});
