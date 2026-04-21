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
  Dimensions,
  StatusBar,
  Image,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';
import { AlertContext } from '../context/AlertContext';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as DocumentPicker from 'expo-document-picker';
import { useDegree } from '../context/DegreeContext';
import DegreeSelector from '../components/DegreeSelector';

import {
  getFacultyProjects,
  updateProject,
  getDomains,
  getSubDomains,
  activateProjectStatus,
  deactivateProjectStatus,
  getAllocationRules,
  deleteProject,
  deleteProjectDocuments,
  uploadProjectDocuments,
} from '../api/facultyApi';

const { width } = Dimensions.get('window');

// Solid status colors
const STATUS_META: Record<string, { label: string; bg: string; fg: string }> = {
  OPEN: { label: 'Open', bg: '#10B981', fg: '#FFFFFF' },
  ASSIGNED: { label: 'Assigned', bg: '#2563EB', fg: '#FFFFFF' },
  CLOSE: { label: 'Closed', bg: '#EF4444', fg: '#FFFFFF' },
};
const getStatus = (s: string) =>
  STATUS_META[s?.toUpperCase()] ?? { label: s, fg: '#FFFFFF', bg: '#6B7280' };

// ── Main Screen ────────────────────────────────────────────────────────────────
const FacultyProjectsScreen = () => {
  const { user } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const { colors } = useContext(ThemeContext);
  const isDark = colors.background === '#111827';
  const navigation: any = useNavigation();

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<any>(null);
  const { selectedDegree } = useDegree();

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSlots, setEditSlots] = useState('');
  const [uploadingDocs, setUploadingDocs] = useState(false);
  const [editDegree, setEditDegree] = useState<'UG'|'PG'>('UG');

  const [domains, setDomains] = useState<any[]>([]);
  const [subDomains, setSubDomains] = useState<any[]>([]);
  const [editDomainId, setEditDomainId] = useState<number | null>(null);
  const [editSubDomainId, setEditSubDomainId] = useState<number | null>(null);
  const [editDomainName, setEditDomainName] = useState('');
  const [editSubDomainName, setEditSubDomainName] = useState('');
  const [domainModal, setDomainModal] = useState(false);
  const [subDomainModal, setSubDomainModal] = useState(false);
  const [maxTeamSize, setMaxTeamSize] = useState(10);

  useEffect(() => {
    if (user?.token) {
      getDomains(user.token).then(d => setDomains(d || [])).catch(() => { });
    }
  }, [user]);

  useEffect(() => {
    if (user?.token) {
      getAllocationRules(editDegree, user.token).then(rules => {
        if (rules && rules.maxTeamSize) {
          setMaxTeamSize(rules.maxTeamSize);
        }
      }).catch(() => {});
    }
  }, [user, editDegree]);

  useEffect(() => {
    if (editDomainId && user?.token) {
      getSubDomains(editDomainId, user.token).then(d => setSubDomains(d || [])).catch(() => { });
    }
  }, [editDomainId]);

  useFocusEffect(
    useCallback(() => {
      if (user?.token) loadProjects();
    }, [user, selectedDegree])
  );

  const loadProjects = async () => {
    try {
      setLoading(true);
      const data: any = await getFacultyProjects(selectedDegree, user!.token);
      if (Array.isArray(data)) setProjects(data);
      else if (data?.projects) setProjects(data.projects);
      else setProjects([]);
    } catch {
      showAlert('Error', 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (project: any) => {
    setEditingProject(project);
    setEditTitle(project.title);
    setEditDesc(project.description);
    setEditSlots(project.maxSlots ? project.maxSlots.toString() : '3');
    setEditDomainId(project.domainId || null);
    setEditSubDomainId(project.subDomainId || null);
    setEditDomainName(project.domain || '');
    setEditSubDomainName(project.subdomain || '');
    setEditDegree(project.degree || 'UG');
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    if (!editTitle.trim()) { showAlert('Error', 'Title required'); return; }
    const slotCount = parseInt(editSlots);
    if (isNaN(slotCount) || slotCount < 1 || slotCount > maxTeamSize) {
      showAlert('Error', `Slots must be between 1 and ${maxTeamSize}`); return;
    }
    try {
      setProcessingId(editingProject.projectId);
      await updateProject(
        editingProject.projectId,
        { title: editTitle, description: editDesc, studentSlots: slotCount, domainId: editDomainId, subDomainId: editSubDomainId, degree: editDegree },
        user!.token
      );
      setEditModalVisible(false);
      loadProjects();
      showAlert('Success', 'Project updated successfully');
    } catch (err: any) {
      showAlert('Error', err?.response?.data?.error || 'Update failed');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleStatus = async (projectId: any, isCurrentlyActive: boolean) => {
    try {
      setProcessingId(projectId);
      if (isCurrentlyActive) {
        await deactivateProjectStatus(projectId, user!.token);
        showAlert('Success', 'Project deactivated');
      } else {
        await activateProjectStatus(projectId, user!.token);
        showAlert('Success', 'Project activated');
      }
      await loadProjects();
    } catch (error: any) {
      showAlert('Error', error?.response?.data?.error || 'Failed to update status');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteProject = async (project: any) => {
    if (project.status === 'ASSIGNED') {
      showAlert('Cannot Delete', 'You cannot delete an allocated project.');
      return;
    }
    if (project.isActive) {
      showAlert('Cannot Delete', 'First deactivate this project and then do the delete option.');
      return;
    }

    showAlert(
      "Delete Project",
      `Are you sure you want to delete "${project.title}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setProcessingId(project.projectId);
              await deleteProject(project.projectId, user!.token);
              showAlert('Success', 'Project deleted successfully');
              loadProjects();
            } catch (err: any) {
              showAlert('Cannot Delete', err?.response?.data?.error || 'Failed to delete project');
            } finally {
              setProcessingId(null);
            }
          }
        }
      ]
    );
  };

  const handleAddDocuments = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        multiple: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setUploadingDocs(true);
        const formData = new FormData();
        result.assets.forEach((asset: any) => {
          formData.append('files', {
            uri: asset.uri,
            name: asset.name,
            type: asset.mimeType || 'application/pdf',
          } as any);
        });

        await uploadProjectDocuments(editingProject.projectId, formData, user!.token);
        showAlert('Success', 'Documents uploaded successfully');
        
        // Refresh project data to show new docs
        const data: any = await getFacultyProjects(selectedDegree, user!.token);
        const updatedProjects = Array.isArray(data) ? data : (data?.projects || []);
        setProjects(updatedProjects);
        const updatedEditing = updatedProjects.find((p: any) => p.projectId === editingProject.projectId);
        if (updatedEditing) setEditingProject(updatedEditing);

      }
    } catch (err) {
      showAlert('Error', 'Failed to upload documents');
    } finally {
      setUploadingDocs(false);
    }
  };

  const handleDeleteAllDocs = async () => {
    showAlert(
      "Delete All Documents",
      "Are you sure you want to delete all uploaded documents for this project?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            try {
              setUploadingDocs(true);
              await deleteProjectDocuments(editingProject.projectId, user!.token);
              showAlert('Success', 'All documents deleted');
              
              // Refresh
              const data: any = await getFacultyProjects(selectedDegree, user!.token);
              const updatedProjects = Array.isArray(data) ? data : (data?.projects || []);
              setProjects(updatedProjects);
              const updatedEditing = updatedProjects.find((p: any) => p.projectId === editingProject.projectId);
              if (updatedEditing) setEditingProject(updatedEditing);
            } catch (err) {
              showAlert('Error', 'Failed to delete documents');
            } finally {
              setUploadingDocs(false);
            }
          }
        }
      ]
    );
  };

  const accentSoft = isDark ? 'rgba(96,165,250,0.12)' : 'rgba(37,99,235,0.07)';
  const divider = isDark ? '#374151' : '#E5E7EB';

  if (!user?.token) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <View style={styles.container}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: divider }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image
              source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>My Projects</Text>
            <Text style={{ color: colors.subText, fontSize: 12 }}>{projects.length} Total Projects</Text>
          </View>
          <DegreeSelector />
        </View>


        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {loading && projects.length === 0 ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : projects.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No projects found</Text>
              <Text style={[styles.emptySubtitle, { color: colors.subText }]}>Projects you create will appear here.</Text>
            </View>
          ) : (
            projects.map((p) => {
              const status = getStatus(p.status);
              const isActive = p.isActive;
              const isProcessing = processingId === p.projectId;

              return (
                <View key={p.projectId} style={[styles.projectCard, { backgroundColor: colors.card }]}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.projectTitle, { color: colors.text }]} numberOfLines={2}>{p.title}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Text style={styles.statusText}>{status.label}</Text>
                      </View>
                    </View>
                    <View style={styles.cardActions}>
                      <TouchableOpacity 
                        style={[styles.iconBtn, { backgroundColor: accentSoft }]} 
                        onPress={() => openEdit(p)}
                      >
                        <Image source={require('../assets/edit.png')} style={[styles.icon, { tintColor: colors.primary }]} />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.iconBtn, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]} 
                        onPress={() => handleDeleteProject(p)}
                      >
                        <Image source={require('../assets/deadlines/delete.png')} style={[styles.icon, { tintColor: '#EF4444' }]} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={[styles.projectDesc, { color: colors.subText }]} numberOfLines={2}>
                    {p.description || 'No description provided.'}
                  </Text>

                  <View style={[styles.cardDivider, { backgroundColor: divider }]} />

                  <View style={styles.cardFooter}>
                    <View style={styles.statsRow}>
                      <StatItem label="MAX" value={p.maxSlots} colors={colors} />
                      <StatItem label="STUDENTS" value={p.assignedStudents} colors={colors} />
                      <StatItem label="REMAINING" value={p.presentSlots} color={p.presentSlots > 0 ? '#10B981' : '#EF4444'} colors={colors} />
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.toggleBtn, 
                        { backgroundColor: isActive ? '#EF4444' : '#10B981' }
                      ]}
                      onPress={() => handleToggleStatus(p.projectId, isActive)}
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <ActivityIndicator size="small" color="#FFF" />
                      ) : (
                        <Text style={styles.toggleText}>{isActive ? 'Deactivate' : 'Activate'}</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      </View>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Project</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <Text style={{ color: colors.subText, fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              <Text style={[styles.label, { color: colors.subText }]}>TITLE</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: divider }]} 
                value={editTitle} 
                onChangeText={setEditTitle} 
              />

              <Text style={[styles.label, { color: colors.subText }]}>DESCRIPTION</Text>
              <TextInput 
                style={[styles.input, styles.textArea, { backgroundColor: colors.background, color: colors.text, borderColor: divider }]} 
                value={editDesc} 
                onChangeText={setEditDesc} 
                multiline 
              />

              <Text style={[styles.label, { color: colors.subText }]}>MAX SLOTS (1-{maxTeamSize})</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: divider }]} 
                value={editSlots} 
                onChangeText={setEditSlots} 
                keyboardType="numeric"
              />

              <Text style={[styles.label, { color: colors.subText, marginTop: 12 }]}>DEGREE LEVEL</Text>
              <View style={styles.toggleContainer}>
                <TouchableOpacity 
                  style={[styles.degreeBtn, editDegree === 'UG' && styles.degreeBtnActive, { borderColor: colors.primary }]}
                  onPress={() => setEditDegree('UG')}
                >
                  <Text style={[styles.degreeText, { color: colors.text }, editDegree === 'UG' && { color: '#FFF' }]}>UG Project</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.degreeBtn, editDegree === 'PG' && styles.degreeBtnActive, { borderColor: colors.primary }]}
                  onPress={() => setEditDegree('PG')}
                >
                  <Text style={[styles.degreeText, { color: colors.text }, editDegree === 'PG' && { color: '#FFF' }]}>PG Project</Text>
                </TouchableOpacity>
              </View>

              {/* Domain Pickers */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16, marginTop: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.subText }]}>DOMAIN</Text>
                  <TouchableOpacity 
                    style={[styles.picker, { backgroundColor: colors.background, borderColor: divider }]} 
                    onPress={() => setDomainModal(true)}
                  >
                    <Text style={{ color: colors.text }} numberOfLines={1}>{editDomainName || 'Select'}</Text>
                  </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.label, { color: colors.subText }]}>SUB-DOMAIN</Text>
                  <TouchableOpacity 
                    style={[styles.picker, { backgroundColor: colors.background, borderColor: divider }]} 
                    onPress={() => setSubDomainModal(true)}
                  >
                    <Text style={{ color: colors.text }} numberOfLines={1}>{editSubDomainName || 'Select'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Document Management */}
              <View style={[styles.docSection, { backgroundColor: colors.background, borderColor: divider }]}>
                <View style={styles.docHeader}>
                  <Text style={[styles.docTitle, { color: colors.text }]}>Documents</Text>
                  {editingProject?.documents?.length > 0 && (
                    <TouchableOpacity onPress={handleDeleteAllDocs}>
                      <Text style={{ color: '#EF4444', fontSize: 12, fontWeight: '700' }}>Delete All</Text>
                    </TouchableOpacity>
                  )}
                </View>
                
                {editingProject?.documents?.length > 0 ? (
                  <View style={styles.docList}>
                    {editingProject.documents.map((doc: string, idx: number) => (
                      <View key={idx} style={[styles.docItem, { borderBottomColor: divider }]}>
                        <Text style={[styles.docName, { color: colors.text }]} numberOfLines={1}>
                          📄 Document {idx + 1}
                        </Text>
                      </View>
                    ))}
                  </View>
                ) : (
                  <Text style={{ color: colors.subText, fontSize: 13, marginVertical: 10 }}>No documents uploaded yet.</Text>
                )}

                <TouchableOpacity 
                  style={[styles.addDocBtn, { backgroundColor: colors.primary }]} 
                  onPress={handleAddDocuments}
                  disabled={uploadingDocs}
                >
                  {uploadingDocs ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.addDocText}>+ Add Documents (PDF)</Text>
                  )}
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={[styles.saveBtn, { backgroundColor: colors.primary }]} 
                onPress={handleEditSubmit}
                disabled={processingId !== null}
              >
                {processingId !== null ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Save Changes</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Domain Selection Modals */}
      <SelectionModal 
        visible={domainModal} 
        onClose={() => setDomainModal(false)} 
        title="Select Domain" 
        data={domains} 
        onSelect={(item: any) => {
          setEditDomainId(item.domainId);
          setEditDomainName(item.name);
          setEditSubDomainId(null);
          setEditSubDomainName('');
          setDomainModal(false);
        }}
        colors={colors}
      />
      <SelectionModal 
        visible={subDomainModal} 
        onClose={() => setSubDomainModal(false)} 
        title="Select Sub-Domain" 
        data={subDomains} 
        onSelect={(item: any) => {
          setEditSubDomainId(item.subDomainId);
          setEditSubDomainName(item.name);
          setSubDomainModal(false);
        }}
        colors={colors}
      />
    </SafeAreaView>
  );
};

const StatItem = ({ label, value, color, colors }: any) => (
  <View style={styles.statItem}>
    <Text style={[styles.statValue, { color: color || colors.text }]}>{value}</Text>
    <Text style={[styles.statLabel, { color: colors.subText }]}>{label}</Text>
  </View>
);

const SelectionModal = ({ visible, onClose, title, data, onSelect, colors }: any) => (
  <Modal visible={visible} transparent animationType="fade">
    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
      <View style={[styles.selectionBox, { backgroundColor: colors.card }]}>
        <Text style={[styles.modalTitle, { color: colors.text, marginBottom: 16 }]}>{title}</Text>
        <ScrollView>
          {data.map((item: any) => (
            <TouchableOpacity 
              key={item.domainId || item.subDomainId} 
              style={[styles.selectionItem, { borderBottomColor: colors.border }]}
              onPress={() => onSelect(item)}
            >
              <Text style={{ color: colors.text }}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </TouchableOpacity>
  </Modal>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    height: 70,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: { width: 20, height: 20, resizeMode: 'contain' },
  headerCenter: { flex: 1, marginLeft: 8 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  content: { padding: 16 },
  loadingWrap: { marginTop: 100, alignItems: 'center' },
  emptyWrap: { marginTop: 100, alignItems: 'center' },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  emptySubtitle: { fontSize: 14, textAlign: 'center' },

  // UG/PG Toggle
  toggleContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    justifyContent: 'center',
  },
  degreeBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  degreeBtnActive: {
    backgroundColor: '#3B82F6', // Using a default active color, could use colors.primary
  },
  degreeText: {
    fontSize: 14,
    fontWeight: '700',
  },

  // Project Card
  projectCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  projectTitle: { fontSize: 17, fontWeight: '700', marginBottom: 6, lineHeight: 22 },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: '#FFF', fontSize: 10, fontWeight: '800', textTransform: 'uppercase' },
  cardActions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  icon: { width: 18, height: 18, resizeMode: 'contain' },
  projectDesc: { fontSize: 13, marginTop: 12, lineHeight: 18 },
  cardDivider: { height: 1, marginVertical: 16 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statsRow: { flexDirection: 'row', gap: 16 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '800' },
  statLabel: { fontSize: 9, fontWeight: '700', marginTop: 2 },
  toggleBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, minWidth: 100, alignItems: 'center' },
  toggleText: { color: '#FFF', fontSize: 12, fontWeight: '800' },

  // Modals
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '800' },
  label: { fontSize: 10, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  picker: { borderWidth: 1, borderRadius: 12, padding: 14, marginBottom: 16, justifyContent: 'center' },
  
  // Document Section
  docSection: { borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1 },
  docHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  docTitle: { fontSize: 14, fontWeight: '800' },
  docList: { marginBottom: 12 },
  docItem: { paddingVertical: 10, borderBottomWidth: 1 },
  docName: { fontSize: 13, fontWeight: '500' },
  addDocBtn: { padding: 12, borderRadius: 10, alignItems: 'center' },
  addDocText: { color: '#FFF', fontWeight: '700', fontSize: 13 },
  
  saveBtn: { padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 10 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '800' },
  
  selectionBox: { width: '85%', maxHeight: '60%', borderRadius: 20, padding: 20, alignSelf: 'center' },
  selectionItem: { paddingVertical: 14, borderBottomWidth: 1 },
});

export default FacultyProjectsScreen;
