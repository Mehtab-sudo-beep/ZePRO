import React, { useContext, useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,

  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';
import { AlertContext } from '../context/AlertContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import {
  getFacultyProjects,
  updateProject,
  getDomains,
  getSubDomains,
  activateProjectStatus,
  deactivateProjectStatus
} from '../api/facultyApi';

const FacultyProjectsScreen = () => {
  const { user } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const { colors } = useContext(ThemeContext);
  const navigation: any = useNavigation();

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<Long | null>(null);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSlots, setEditSlots] = useState('');

  const [domains, setDomains] = useState<any[]>([]);
  const [subDomains, setSubDomains] = useState<any[]>([]);

  const [editDomainId, setEditDomainId] = useState<number | null>(null);
  const [editSubDomainId, setEditSubDomainId] = useState<number | null>(null);
  const [editDomainName, setEditDomainName] = useState('');
  const [editSubDomainName, setEditSubDomainName] = useState('');

  const [domainModal, setDomainModal] = useState(false);
  const [subDomainModal, setSubDomainModal] = useState(false);

  useEffect(() => {
    getDomains().then(d => setDomains(d || [])).catch(() => console.log("No domains"));
  }, []);

  useEffect(() => {
    if (editDomainId) {
      getSubDomains(editDomainId).then(d => setSubDomains(d || [])).catch(() => console.log("No subdomains"));
    }
  }, [editDomainId]);

  useFocusEffect(
    useCallback(() => {
      if (user?.token) loadProjects();
    }, [user])
  );

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data: any = await getFacultyProjects(user!.token);

      if (Array.isArray(data)) setProjects(data);
      else if (data?.projects) setProjects(data.projects);
      else setProjects([]);

    } catch (error: any) {
      Alert.alert('Error', 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSubmit = async () => {
    if (!editTitle.trim()) {
      showAlert('Error', 'Title required');
      return;
    }

    const slotCount = parseInt(editSlots);
    if (isNaN(slotCount) || slotCount < 1 || slotCount > 10) {
      showAlert('Error', 'Slots must be between 1 and 10');
      return;
    }

    try {
      await updateProject(
        editingProject.projectId,
        {
          title: editTitle,
          description: editDesc,
          studentSlots: slotCount,
          domainId: editDomainId,
          subDomainId: editSubDomainId
        },
        user!.token
      );

      setEditModalVisible(false);
      loadProjects();

    } catch {
      showAlert('Error', 'Update failed');
    }
  };

  const handleToggleStatus = async (projectId: Long, isCurrentlyActive: boolean) => {
    try {
      setActivatingId(projectId);

      if (isCurrentlyActive) {
        // Deactivating
        await deactivateProjectStatus(projectId, user!.token);
        showAlert('Success', 'Project deactivated');
      } else {
        // Activating
        await activateProjectStatus(projectId, user!.token);
        showAlert('Success', 'Project activated');
      }

      await loadProjects();

    } catch (error: any) {
      // ✅ CHECK FOR 403 ERROR AND SHOW FRIENDLY MESSAGE
      const errorCode = error?.response?.status;
      const errorMessage = error?.response?.data?.message;

      if (errorCode === 403) {
        showAlert(
          'Cannot Activate Project',
          'You have reached the maximum number of active projects. Please deactivate one project first to activate this project.',
          [{ text: 'OK', onPress: () => {} }]
        );
      } else {
        const userFriendlyMsg = errorMessage || error?.message || 'Failed to update project status';
        showAlert('Error', userFriendlyMsg);
      }
    } finally {
      setActivatingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'OPEN': return '#10B981';
      case 'ASSIGNED': return '#3B82F6';
      case 'CLOSE': return '#EF4444';
      default: return '#6B7280';
    }
  };

  if (!user?.token) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>

        {/* HEADER */}
        <View style={[styles.header, { backgroundColor: colors.card }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            My Projects
          </Text>
        </View>

        {/* CONTENT */}
        <ScrollView contentContainerStyle={styles.content}>

          {loading && <ActivityIndicator size="large" />}

          {!loading && projects.length === 0 && (
            <Text style={{ textAlign: 'center', color: colors.subText, marginTop: 20 }}>
              No projects created yet
            </Text>
          )}

          {!loading && projects.map((p: any) => (

            <View key={p.projectId} style={[styles.card, { backgroundColor: colors.card }]}>

              {/* TITLE AND EDIT ROW */}
              <View style={styles.titleRow}>
                <Text style={[styles.cardTitle, { color: colors.text, flex: 1 }]} numberOfLines={2}>
                  {p.title}
                </Text>

                <TouchableOpacity onPress={() => {
                  setEditingProject(p);
                  setEditTitle(p.title);
                  setEditDesc(p.description);
                  setEditSlots(p.maxSlots ? p.maxSlots.toString() : '3');
                  setEditDomainId(p.domainId || null);
                  setEditSubDomainId(p.subDomainId || null);
                  setEditDomainName(p.domain || '');
                  setEditSubDomainName(p.subdomain || '');
                  setEditModalVisible(true);
                }} style={styles.editButton}>
                  <Text style={{ color: colors.primary, fontWeight: '600', fontSize: 12 }}>Edit</Text>
                </TouchableOpacity>
              </View>

              {/* DESCRIPTION */}
              <Text style={[styles.description, { color: colors.subText }]} numberOfLines={2}>
                {p.description || 'No description'}
              </Text>

              {/* DIVIDER */}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* INFO GRID - VERTICAL */}
              <View style={styles.verticalInfoGrid}>

                {/* Domain and SubDomain */}
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Domain</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
                    {p.domain || '-'}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Sub Domain</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]} numberOfLines={1}>
                    {p.subdomain || '-'}
                  </Text>
                </View>

                {/* Assigned Students */}
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Assigned Students</Text>
                  <Text style={[styles.infoValue, { color: colors.text }]}>
                    {p.assignedStudents || 0}
                  </Text>
                </View>

                {/* Max Slots */}
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Max Slots</Text>
                  <Text style={[styles.infoValue, { color: '#10B981' }]}>
                    {p.maxSlots || 0}
                  </Text>
                </View>

                {/* Present Slots (Available) */}
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Available Slots</Text>
                  <Text style={[
                    styles.infoValue,
                    { color: p.presentSlots === 0 ? '#EF4444' : '#10B981' }
                  ]}>
                    {p.presentSlots || 0}
                  </Text>
                </View>

                {/* Status */}
                <View style={styles.infoItem}>
                  <Text style={styles.infoLabel}>Status</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(p.status) + '20' }
                  ]}>
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(p.status) }
                    ]}>
                      {p.status}
                    </Text>
                  </View>
                </View>

              </View>

              {/* DIVIDER */}
              <View style={[styles.divider, { backgroundColor: colors.border }]} />

              {/* FOOTER - ACTION BUTTON */}
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  { backgroundColor: p.isActive ? '#10B981' : '#EF4444' }
                ]}
                onPress={() => handleToggleStatus(p.projectId, p.isActive)}
                disabled={activatingId === p.projectId}
              >
                {activatingId === p.projectId ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.toggleText}>
                    {p.isActive ? '✓ Active' : '✕ Inactive'}
                  </Text>
                )}
              </TouchableOpacity>

            </View>
          ))}

        </ScrollView>
      </View>

      {/* EDIT MODAL */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Project</Text>

            <Text style={[styles.label, { color: colors.text }]}>Title</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholderTextColor={colors.subText}
            />

            <Text style={[styles.label, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              value={editDesc}
              onChangeText={setEditDesc}
              multiline
              placeholderTextColor={colors.subText}
            />

            <Text style={[styles.label, { color: colors.text }]}>Max Student Slots</Text>
            <TextInput
              style={[styles.input, { borderColor: colors.border, color: colors.text }]}
              keyboardType="numeric"
              value={editSlots}
              onChangeText={setEditSlots}
              placeholderTextColor={colors.subText}
            />

            <Text style={[styles.label, { color: colors.text }]}>Domain</Text>
            <TouchableOpacity
              style={[styles.picker, { borderColor: colors.border }]}
              onPress={() => setDomainModal(true)}
            >
              <Text style={{ color: colors.text }}>{editDomainName || 'Select Domain'}</Text>
            </TouchableOpacity>

            <Text style={[styles.label, { color: colors.text }]}>Sub Domain</Text>
            <TouchableOpacity
              style={[styles.picker, { borderColor: colors.border }]}
              onPress={() => setSubDomainModal(true)}
            >
              <Text style={{ color: colors.text }}>{editSubDomainName || 'Select Sub Domain'}</Text>
            </TouchableOpacity>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#9CA3AF' }]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.primary }]}
                onPress={handleEditSubmit}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* DOMAIN MODAL */}
      <Modal visible={domainModal} animationType="slide" transparent>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setDomainModal(false)} activeOpacity={1}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Domain</Text>
            <ScrollView>
              {domains.map((item) => (
                <TouchableOpacity
                  key={item.domainId}
                  style={[styles.modalItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setEditDomainId(item.domainId);
                    setEditDomainName(item.name);
                    setEditSubDomainId(null);
                    setEditSubDomainName('');
                    setDomainModal(false);
                  }}
                >
                  <Text style={{ color: colors.text }}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* SUBDOMAIN MODAL */}
      <Modal visible={subDomainModal} animationType="slide" transparent>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setSubDomainModal(false)} activeOpacity={1}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Sub Domain</Text>
            <ScrollView>
              {subDomains.map((item) => (
                <TouchableOpacity
                  key={item.subDomainId}
                  style={[styles.modalItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setEditSubDomainId(item.subDomainId);
                    setEditSubDomainName(item.name);
                    setSubDomainModal(false);
                  }}
                >
                  <Text style={{ color: colors.text }}>{item.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

    </SafeAreaView>
  );
};

export default FacultyProjectsScreen;

const styles = StyleSheet.create({

  container: { flex: 1 },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  header: {
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: 16,
    elevation: 3,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },

  content: {
    padding: 16,
  },

  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    elevation: 4,
  },

  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },

  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  description: {
    fontSize: 12,
    marginBottom: 8,
  },

  divider: {
    height: 1,
    marginVertical: 8,
  },

  verticalInfoGrid: {
    gap: 6,
  },

  infoItem: {
    paddingVertical: 4,
  },

  infoLabel: {
    fontSize: 10,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 2,
  },

  infoValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },

  statusText: {
    fontWeight: '600',
    fontSize: 11,
  },

  toggleButton: {
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },

  toggleText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
    maxHeight: '90%',
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },

  label: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginBottom: 10,
    fontSize: 14,
  },

  picker: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 10,
  },

  modalButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },

  modalButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },

  modalButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },

  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
  },

});