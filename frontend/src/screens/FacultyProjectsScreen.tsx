import React, { useContext, useState, useEffect, useCallback, useRef } from 'react';
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
  Animated,
  Dimensions,
  StatusBar,
  Image,
  Platform,
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
  deactivateProjectStatus,
  getAllocationRules,
} from '../api/facultyApi';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_PEEK = 60;

// Solid status colors
const STATUS_META: Record<string, { label: string; bg: string; fg: string }> = {
  OPEN: { label: 'Open', bg: '#4abf71ff', fg: '#FFFFFF' },
  ASSIGNED: { label: 'Assigned', bg: '#3763c2ff', fg: '#FFFFFF' },
  CLOSE: { label: 'Closed', bg: '#d63838ff', fg: '#FFFFFF' },
};
const getStatus = (s: string) =>
  STATUS_META[s?.toUpperCase()] ?? { label: s, fg: '#FFFFFF', bg: '#6B7280' };

// ── Project Detail Modal ───────────────────────────────────────────────
const ProjectDetailSheet = ({
  project,
  visible,
  onClose,
  colors,
  onToggleStatus,
  activatingId,
}: any) => {
  if (!project) return null;

  const status = getStatus(project.status);
  const isActive = project.isActive;
  const isToggling = activatingId === project.projectId;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.sheetBackdrop}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      </View>

      <View style={styles.centeredModalContainer} pointerEvents="box-none">
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          {/* Close icon button (top-right) */}
          <TouchableOpacity onPress={onClose} style={styles.closeIconBtn} activeOpacity={0.7} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Image
              source={require('../assets/close.png')}
              style={[styles.closeIcon, { tintColor: colors.text }]}
              resizeMode="contain"
            />
          </TouchableOpacity>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.sheetScroll}
            bounces={false}
          >
            {/* Title + status */}
            <View style={styles.sheetTitleRow}>
              <Text style={[styles.sheetTitle, { color: colors.text }]} numberOfLines={3}>
                {project.title}
              </Text>
              <View style={[styles.sheetStatusBadge, { backgroundColor: status.bg }]}>
                <Text style={[styles.sheetStatusText, { color: status.fg }]}>{status.label}</Text>
              </View>
            </View>

            {/* Description */}
            <View style={[styles.descBlock, { backgroundColor: colors.background }]}>
              <Text style={[styles.descBlockLabel, { color: colors.subText }]}>DESCRIPTION</Text>
              <Text style={[styles.descBlockText, { color: colors.text }]}>
                {project.description || 'No description provided.'}
              </Text>
            </View>

            {/* Domain & SubDomain — vertical, no extra colored accents */}
            <View style={[styles.infoBlock, { backgroundColor: colors.background }]}>
              <Text style={[styles.infoBlockLabel, { color: colors.subText }]}>DOMAIN</Text>
              <Text style={[styles.infoBlockValue, { color: colors.text }]}>
                {project.domain || '—'}
              </Text>
            </View>

            <View style={[styles.infoBlock, { backgroundColor: colors.background }]}>
              <Text style={[styles.infoBlockLabel, { color: colors.subText }]}>SUB DOMAIN</Text>
              <Text style={[styles.infoBlockValue, { color: colors.text }]}>
                {project.subdomain || '—'}
              </Text>
            </View>

            {/* Slot stats — solid colors */}
            <View style={styles.infoCardRow}>
              <SlotCard label="Max Slots" value={project.maxSlots ?? 0} />
              <SlotCard
                label="Available"
                value={project.presentSlots ?? 0}
              />
              <SlotCard label="Assigned" value={project.assignedStudents ?? 0} />
            </View>

            {/* Active status indicator (solid) */}
            <View style={[styles.activeBanner, { backgroundColor: isActive ? 'rgb(50, 195, 96)' : '#EF4444' }]}>
              <View style={[styles.activeDot, { backgroundColor: '#FFFFFF' }]} />
              <Text style={styles.activeBannerText}>
                {isActive ? 'Project is currently ACTIVE' : 'Project is currently INACTIVE'}
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const SlotCard = ({ label, value, color, textColor }: any) => (
  <View style={[styles.slotCard, { backgroundColor: color }]}>
    <Text style={[styles.slotNumber, { color: textColor }]}>{value}</Text>
    <Text style={[styles.slotLabel, { color: textColor }]}>{label}</Text>
  </View>
);

// ── Main Screen ────────────────────────────────────────────────────────────────
const FacultyProjectsScreen = () => {
  const { user } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const { colors } = useContext(ThemeContext);
  const isDark = colors.background === '#111827';
  const navigation: any = useNavigation();

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activatingId, setActivatingId] = useState<any>(null);

  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [sheetVisible, setSheetVisible] = useState(false);

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
  const [maxTeamSize, setMaxTeamSize] = useState(10);

  useEffect(() => {
    if (user?.token) {
      getDomains(user.token).then(d => setDomains(d || [])).catch(() => { });
      getAllocationRules(user.token).then(rules => {
        if (rules && rules.maxTeamSize) {
          setMaxTeamSize(rules.maxTeamSize);
        }
      }).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (editDomainId && user?.token) {
      getSubDomains(editDomainId, user.token).then(d => setSubDomains(d || [])).catch(() => { });
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
    } catch {
      Alert.alert('Error', 'Failed to load projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (project: any) => {
    setSelectedProject(project);
    setSheetVisible(true);
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
    setEditModalVisible(true);
  };

  const handleEditSubmit = async () => {
    if (!editTitle.trim()) { showAlert('Error', 'Title required'); return; }
    const slotCount = parseInt(editSlots);
    if (isNaN(slotCount) || slotCount < 1 || slotCount > maxTeamSize) {
      showAlert('Error', `Slots must be between 1 and ${maxTeamSize}`); return;
    }
    try {
      await updateProject(
        editingProject.projectId,
        { title: editTitle, description: editDesc, studentSlots: slotCount, domainId: editDomainId, subDomainId: editSubDomainId },
        user!.token
      );
      setEditModalVisible(false);
      loadProjects();
    } catch {
      showAlert('Error', 'Update failed');
    }
  };

  const handleToggleStatus = async (projectId: any, isCurrentlyActive: boolean) => {
    try {
      setActivatingId(projectId);
      if (isCurrentlyActive) {
        await deactivateProjectStatus(projectId, user!.token);
        showAlert('Success', 'Project deactivated');
      } else {
        await activateProjectStatus(projectId, user!.token);
        showAlert('Success', 'Project activated');
      }
      await loadProjects();
    } catch (error: any) {
      const errorCode = error?.response?.status;
      const errorMessage = error?.response?.data?.message;
      if (errorCode === 403) {
        showAlert('Cannot Activate Project', 'You have reached the maximum number of active projects. Please deactivate one project first to activate this project.', [{ text: 'OK', onPress: () => { } }]);
      } else {
        showAlert('Error', errorMessage || error?.message || 'Failed to update project status');
      }
    } finally {
      setActivatingId(null);
    }
  };

  if (!user?.token) {
    return <View style={styles.center}><ActivityIndicator size="large" /></View>;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.container}>
        {/* HEADER with back button, no count */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Image
              source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>My Projects</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {loading && (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.subText }]}>Loading projects…</Text>
            </View>
          )}

          {!loading && projects.length === 0 && (
            <View style={styles.emptyWrap}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.card }]}>
                <Text style={{ fontSize: 32 }}>📂</Text>
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>No projects yet</Text>
              <Text style={[styles.emptySubtitle, { color: colors.subText }]}>Projects you create will appear here.</Text>
            </View>
          )}

          {!loading && projects.map((p: any) => {
            const status = getStatus(p.status);
            const isActive = p.isActive;
            const isToggling = activatingId === p.projectId;

            return (
              <TouchableOpacity
                key={p.projectId}
                activeOpacity={0.82}
                onPress={() => openDetail(p)}
                style={[styles.card, { backgroundColor: colors.card, borderColor: isActive ? colors.primary : colors.border }]}
              >
                <View style={[styles.cardStripe, { backgroundColor: isActive ? colors.primary : 'transparent' }]} />

                <View style={styles.cardInner}>
                  <View style={styles.titleRow}>
                    <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                      {p.title}
                    </Text>
                    <TouchableOpacity
                      onPress={(e) => { e.stopPropagation(); openEdit(p); }}
                      style={[
                        styles.editBtn,
                        {
                          borderColor: colors.primary,
                          backgroundColor: isDark ? colors.primary + '20' : colors.primary + '10'
                        }
                      ]}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={[styles.editBtnText, { color: colors.primary }]}>Edit</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={[styles.description, { color: colors.subText }]} numberOfLines={1}>
                    {p.description || 'No description'}
                  </Text>

                  <View style={styles.tagsRow}>
                    {p.domain ? (
                      <View
                        style={[
                          styles.tag,
                          { borderColor: colors.border, backgroundColor: colors.background },
                        ]}
                      >
                        <Text style={[styles.tagText, { color: colors.text }]}>
                          {p.domain}
                        </Text>
                      </View>
                    ) : null}

                    {p.subdomain ? (
                      <View
                        style={[
                          styles.tag,
                          { borderColor: colors.border, backgroundColor: colors.background },
                        ]}
                      >
                        <Text style={[styles.tagText, { color: colors.text }]}>
                          {p.subdomain}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.slotsRow}>
                      <SlotPill label="Max" value={p.maxSlots ?? 0} color="#10B981" />
                      <SlotPill label="Free" value={p.presentSlots ?? 0} color={p.presentSlots === 0 ? '#EF4444' : '#10B981'} />
                      <SlotPill label="Students" value={p.assignedStudents ?? 0} color="#2563EB" />
                    </View>

                    <View style={styles.footerRight}>
                      <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusText, { color: status.fg }]}>{status.label}</Text>
                      </View>

                      <TouchableOpacity
                        style={[styles.toggleBtn, { backgroundColor: isActive ? '#EF4444' : '#10B981' }]}
                        onPress={(e) => { e.stopPropagation(); handleToggleStatus(p.projectId, isActive); }}
                        disabled={isToggling}
                        activeOpacity={0.8}
                      >
                        {isToggling ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={styles.toggleText}>{isActive ? 'Inactivate' : 'Activate'}</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>

                  <Text style={[styles.tapHint, { color: colors.subText }]}>Tap card for full details  ›</Text>
                </View>
              </TouchableOpacity>
            );
          })}

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>

      <ProjectDetailSheet
        project={selectedProject}
        visible={sheetVisible}
        onClose={() => setSheetVisible(false)}
        colors={colors}
        onToggleStatus={handleToggleStatus}
        activatingId={activatingId}
      />

      {/* EDIT MODAL */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Edit Project</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={styles.modalCloseBtn}>
                <Text style={{ color: colors.subText, fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={[styles.label, { color: colors.subText }]}>PROJECT TITLE</Text>
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]} value={editTitle} onChangeText={setEditTitle} placeholderTextColor={colors.subText} placeholder="Enter title" />

              <Text style={[styles.label, { color: colors.subText }]}>DESCRIPTION</Text>
              <TextInput style={[styles.input, styles.inputMulti, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]} value={editDesc} onChangeText={setEditDesc} multiline placeholderTextColor={colors.subText} placeholder="Describe the project" />

              <Text style={[styles.label, { color: colors.subText }]}>MAX STUDENT SLOTS  (1–{maxTeamSize})</Text>
              <TextInput style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.card }]} keyboardType="numeric" value={editSlots} onChangeText={setEditSlots} placeholderTextColor={colors.subText} placeholder="e.g. 3" />

              <Text style={[styles.label, { color: colors.subText }]}>DOMAIN</Text>
              <TouchableOpacity style={[styles.picker, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => setDomainModal(true)}>
                <Text style={{ color: editDomainName ? colors.text : colors.subText }}>{editDomainName || 'Select Domain'}</Text>
                <Text style={{ color: colors.subText }}>›</Text>
              </TouchableOpacity>

              <Text style={[styles.label, { color: colors.subText }]}>SUB DOMAIN</Text>
              <TouchableOpacity style={[styles.picker, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => setSubDomainModal(true)}>
                <Text style={{ color: editSubDomainName ? colors.text : colors.subText }}>{editSubDomainName || 'Select Sub Domain'}</Text>
                <Text style={{ color: colors.subText }}>›</Text>
              </TouchableOpacity>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.border }]} onPress={() => setEditModalVisible(false)}>
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalButton, { backgroundColor: colors.primary }]} onPress={handleEditSubmit}>
                  <Text style={styles.modalButtonText}>Save Changes</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* DOMAIN MODAL */}
      <Modal visible={domainModal} animationType="slide" transparent>
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setDomainModal(false)} activeOpacity={1}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Select Domain</Text>
            <ScrollView>
              {domains.map(item => (
                <TouchableOpacity key={item.domainId} style={[styles.modalItem, { borderBottomColor: colors.border }]}
                  onPress={() => { setEditDomainId(item.domainId); setEditDomainName(item.name); setEditSubDomainId(null); setEditSubDomainName(''); setDomainModal(false); }}>
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
              {subDomains.map(item => (
                <TouchableOpacity key={item.subDomainId} style={[styles.modalItem, { borderBottomColor: colors.border }]}
                  onPress={() => { setEditSubDomainId(item.subDomainId); setEditSubDomainName(item.name); setSubDomainModal(false); }}>
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

const SlotPill = ({ label, value, color }: any) => (
  <View style={styles.slotPill}>
    <Text style={[styles.slotPillValue, { color }]}>{value}</Text>
    <Text style={styles.slotPillLabel}>{label}</Text>
  </View>
);

export default FacultyProjectsScreen;

// ─────────────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // header
  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  backIcon: { width: 22, height: 22, resizeMode: 'contain' },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    justifyContent: 'center', alignItems: 'center',
  },
  backBtnText: { fontSize: 30, fontWeight: '600', marginTop: -4 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerSub: { fontSize: 10, fontWeight: '600', letterSpacing: 1.2, textTransform: 'uppercase', marginBottom: 1 },
  headerTitle: { fontSize: 20, fontWeight: '800', letterSpacing: -0.3 },

  content: { padding: 14 },

  loadingWrap: { alignItems: 'center', marginTop: 60, gap: 12 },
  loadingText: { fontSize: 13 },

  emptyWrap: { alignItems: 'center', marginTop: 80, gap: 8 },
  emptyIconCircle: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySubtitle: { fontSize: 13 },

  // card
  card: {
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  cardStripe: { width: 4 },
  cardInner: { flex: 1, padding: 14 },

  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 4, gap: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', flex: 1, lineHeight: 20 },

  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  editBtnText: { fontSize: 12, fontWeight: '700' },

  description: { fontSize: 12, lineHeight: 16, marginBottom: 8 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  tag: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  tagText: { fontSize: 10, fontWeight: '700', color: '#FFFFFF' },

  cardFooter: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 },
  slotsRow: { flexDirection: 'row', gap: 8, flex: 1 },

  slotPill: { alignItems: 'center' },
  slotPillValue: { fontSize: 15, fontWeight: '800' },
  slotPillLabel: { fontSize: 9, color: '#9CA3AF', fontWeight: '500', marginTop: 1 },

  footerRight: { alignItems: 'flex-end', gap: 6 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 10, fontWeight: '700' },

  toggleBtn: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', minWidth: 84,
  },
  toggleText: { color: '#fff', fontWeight: '700', fontSize: 11 },

  tapHint: { fontSize: 10, textAlign: 'right', marginTop: 8, opacity: 0.6 },

  // ── project detail modal ──
  centeredModalContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    width: '100%',
    maxHeight: '85%',
    borderRadius: 24,
    elevation: 20,
    shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    overflow: 'hidden',
  },

  closeIconBtn: {
    position: 'absolute',
    top: 14, right: 14,
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center',
    zIndex: 10,
  },
  closeIcon: { width: 18, height: 18 },

  sheetScroll: { padding: 18, paddingTop: 16, paddingBottom: 48 },

  sheetTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 14, paddingRight: 36 },
  sheetTitle: { flex: 1, fontSize: 20, fontWeight: '800', lineHeight: 26, letterSpacing: -0.3 },
  sheetStatusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginTop: 2 },
  sheetStatusText: { fontSize: 11, fontWeight: '700' },

  descBlock: { borderRadius: 12, padding: 14, marginBottom: 12 },
  descBlockLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1.2, marginBottom: 6 },
  descBlockText: { fontSize: 14, lineHeight: 20 },

  // vertical info blocks (domain / subdomain)
  infoBlock: { borderRadius: 12, padding: 14, marginBottom: 10 },
  infoBlockLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1.2, marginBottom: 6 },
  infoBlockValue: { fontSize: 14, fontWeight: '700' },

  infoCardRow: { flexDirection: 'row', gap: 10, marginTop: 4, marginBottom: 14 },
  slotCard: { flex: 1, borderRadius: 12, padding: 14, alignItems: 'center' },
  slotNumber: { fontSize: 26, fontWeight: '800', lineHeight: 30 },
  slotLabel: { fontSize: 10, fontWeight: '700', marginTop: 2, textAlign: 'center', opacity: 0.95 },

  activeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
  },
  activeDot: { width: 10, height: 10, borderRadius: 5 },
  activeBannerText: { fontWeight: '700', fontSize: 13, color: '#FFFFFF' },

  sheetActions: { marginTop: 4, marginBottom: 12 },
  sheetToggleBtn: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetToggleText: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 0.3 },

  // edit modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 22, borderTopRightRadius: 22, padding: 18, maxHeight: '92%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 16, fontWeight: '700' },
  modalCloseBtn: { padding: 4 },

  label: { fontSize: 10, fontWeight: '700', letterSpacing: 1, marginBottom: 5 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, marginBottom: 12, fontSize: 14 },
  inputMulti: { minHeight: 80, textAlignVertical: 'top' },
  picker: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 12, marginBottom: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 14, marginBottom: 8 },
  modalButton: { flex: 1, paddingVertical: 13, borderRadius: 10, alignItems: 'center' },
  modalButtonText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  modalItem: { paddingVertical: 13, paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth },
});
