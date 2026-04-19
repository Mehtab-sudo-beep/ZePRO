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
} from '../api/facultyApi';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_PEEK = 60;

// ── status helpers ─────────────────────────────────────────────────────────────
const STATUS_META: Record<string, { label: string; bg: string; fg: string }> = {
  OPEN:     { label: 'Open',     bg: '#D1FAE5', fg: '#059669' },
  ASSIGNED: { label: 'Assigned', bg: '#DBEAFE', fg: '#2563EB' },
  CLOSE:    { label: 'Closed',   fg: '#DC2626', bg: '#FEE2E2' },
};
const getStatus = (s: string) =>
  STATUS_META[s?.toUpperCase()] ?? { label: s, fg: '#6B7280', bg: '#F3F4F6' };

// ── Project Detail Bottom Sheet ───────────────────────────────────────────────
const ProjectDetailSheet = ({
  project,
  visible,
  onClose,
  colors,
  onToggleStatus,
  onEdit,
  activatingId,
}: any) => {
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: SHEET_PEEK, useNativeDriver: true, tension: 65, friction: 11 }),
        Animated.timing(backdropAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: SCREEN_HEIGHT, duration: 280, useNativeDriver: true }),
        Animated.timing(backdropAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  if (!project) return null;

  const status = getStatus(project.status);
  const isActive = project.isActive;
  const isToggling = activatingId === project.projectId;

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <Animated.View style={[styles.sheetBackdrop, { opacity: backdropAnim }]}>
        <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={onClose} />
      </Animated.View>

      <Animated.View
        style={[
          styles.sheet,
          { backgroundColor: colors.card, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <View style={styles.sheetHandle}>
          <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
        </View>

        <TouchableOpacity onPress={onClose} style={styles.closeStrip} activeOpacity={0.7}>
          <Text style={[styles.closeLabel, { color: colors.subText }]}>▼  tap to close</Text>
        </TouchableOpacity>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.sheetScroll}
          bounces={false}
        >
          <View style={styles.sheetTitleRow}>
            <Text style={[styles.sheetTitle, { color: colors.text }]} numberOfLines={3}>
              {project.title}
            </Text>
            <View style={[styles.sheetStatusBadge, { backgroundColor: status.bg }]}>
              <Text style={[styles.sheetStatusText, { color: status.fg }]}>{status.label}</Text>
            </View>
          </View>

          <View style={[styles.descBlock, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Text style={[styles.descBlockLabel, { color: colors.subText }]}>DESCRIPTION</Text>
            <Text style={[styles.descBlockText, { color: colors.text }]}>
              {project.description || 'No description provided.'}
            </Text>
          </View>

          <View style={styles.infoCardRow}>
            <InfoCard label="Domain" value={project.domain || '—'} accent={colors.primary} bg={colors.background} textColor={colors.text} subColor={colors.subText} />
            <InfoCard label="Sub Domain" value={project.subdomain || '—'} accent="#8B5CF6" bg={colors.background} textColor={colors.text} subColor={colors.subText} />
          </View>

          <View style={styles.infoCardRow}>
            <SlotCard label="Max Slots" value={project.maxSlots ?? 0} color="#10B981" bg={colors.background} textColor={colors.text} subColor={colors.subText} />
            <SlotCard label="Available" value={project.presentSlots ?? 0} color={project.presentSlots === 0 ? '#EF4444' : '#10B981'} bg={colors.background} textColor={colors.text} subColor={colors.subText} />
            <SlotCard label="Assigned" value={project.assignedStudents ?? 0} color="#3B82F6" bg={colors.background} textColor={colors.text} subColor={colors.subText} />
          </View>

          {/* ── Refined Active Status Toggle ── */}
          <View style={[styles.statusToggleCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <View style={styles.statusToggleLeft}>
              <View style={[styles.statusPulseRing, { borderColor: isActive ? '#10B98140' : '#EF444440' }]}>
                <View style={[styles.statusPulseDot, { backgroundColor: isActive ? '#10B981' : '#EF4444' }]} />
              </View>
              <View>
                <Text style={[styles.statusToggleLabel, { color: colors.subText }]}>PROJECT STATUS</Text>
                <Text style={[styles.statusToggleValue, { color: isActive ? '#10B981' : '#EF4444' }]}>
                  {isActive ? 'Active' : 'Inactive'}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[
                styles.statusSwitch,
                { backgroundColor: isActive ? '#10B981' : colors.border },
              ]}
              onPress={() => onToggleStatus(project.projectId, isActive)}
              disabled={isToggling}
              activeOpacity={0.85}
            >
              {isToggling ? (
                <ActivityIndicator size="small" color="#fff" style={{ alignSelf: 'center', flex: 1 }} />
              ) : (
                <View style={[styles.statusSwitchKnob, { alignSelf: isActive ? 'flex-end' : 'flex-start' }]} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.sheetActions}>
            <TouchableOpacity
              style={[styles.sheetEditBtn, { borderColor: colors.primary, backgroundColor: colors.primary + '10' }]}
              onPress={() => onEdit(project)}
              activeOpacity={0.75}
            >
              <Text style={[styles.sheetEditText, { color: colors.primary }]}>✎  Edit Project</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.sheetToggleBtn, { backgroundColor: isActive ? '#EF4444' : '#10B981' }]}
              onPress={() => onToggleStatus(project.projectId, isActive)}
              disabled={isToggling}
              activeOpacity={0.85}
            >
              {isToggling ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.sheetToggleText}>
                  {isActive ? 'Deactivate' : 'Activate'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
};

// ── reusable cards ────────────────────────────────────────────────────────────
const InfoCard = ({ label, value, accent, bg, textColor, subColor }: any) => (
  <View style={[styles.infoCard, { backgroundColor: bg, borderLeftColor: accent }]}>
    <Text style={[styles.infoCardLabel, { color: subColor }]}>{label}</Text>
    <Text style={[styles.infoCardValue, { color: textColor }]} numberOfLines={2}>{value}</Text>
  </View>
);

const SlotCard = ({ label, value, color, bg, textColor, subColor }: any) => (
  <View style={[styles.slotCard, { backgroundColor: bg }]}>
    <Text style={[styles.slotNumber, { color }]}>{value}</Text>
    <Text style={[styles.slotLabel, { color: subColor }]}>{label}</Text>
  </View>
);

// ── Main Screen ────────────────────────────────────────────────────────────────
const FacultyProjectsScreen = () => {
  const { user } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const { colors } = useContext(ThemeContext);
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

  useEffect(() => {
    if (user?.token) {
      getDomains(user.token).then(d => setDomains(d || [])).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (editDomainId && user?.token) {
      getSubDomains(editDomainId, user.token).then(d => setSubDomains(d || [])).catch(() => {});
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
    setSheetVisible(false);
    setTimeout(() => {
      setEditingProject(project);
      setEditTitle(project.title);
      setEditDesc(project.description);
      setEditSlots(project.maxSlots ? project.maxSlots.toString() : '3');
      setEditDomainId(project.domainId || null);
      setEditSubDomainId(project.subDomainId || null);
      setEditDomainName(project.domain || '');
      setEditSubDomainName(project.subdomain || '');
      setEditModalVisible(true);
    }, 300);
  };

  const handleEditSubmit = async () => {
    if (!editTitle.trim()) { showAlert('Error', 'Title required'); return; }
    const slotCount = parseInt(editSlots);
    if (isNaN(slotCount) || slotCount < 1 || slotCount > 10) {
      showAlert('Error', 'Slots must be between 1 and 10'); return;
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
        showAlert('Cannot Activate Project', 'You have reached the maximum number of active projects. Please deactivate one project first to activate this project.', [{ text: 'OK', onPress: () => {} }]);
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

        {/* ── HEADER (back button left, no count badge) ── */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => navigation?.goBack?.()}
            style={[styles.backBtn, { backgroundColor: colors.background, borderColor: colors.border }]}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={[styles.backBtnText, { color: colors.text }]}>‹</Text>
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={[styles.headerSub, { color: colors.subText }]}>Dashboard</Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>My Projects</Text>
          </View>

          <View style={styles.backBtnPlaceholder} />
        </View>

        {/* ── LIST ── */}
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

          {loading && (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.subText }]}>Loading projects…</Text>
            </View>
          )}

          {!loading && projects.length === 0 && (
            <View style={styles.emptyWrap}>
              <View style={[styles.emptyIconCircle, { backgroundColor: colors.card, borderColor: colors.border }]}>
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
                activeOpacity={0.85}
                onPress={() => openDetail(p)}
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: isActive ? colors.primary + '40' : colors.border,
                  },
                ]}
              >
                <View style={[styles.cardStripe, { backgroundColor: isActive ? colors.primary : 'transparent' }]} />

                <View style={styles.cardInner}>

                  <View style={styles.titleRow}>
                    <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>
                      {p.title}
                    </Text>
                    <TouchableOpacity
                      onPress={(e) => { e.stopPropagation(); openEdit(p); }}
                      style={[styles.editBtn, { backgroundColor: colors.primary + '15', borderColor: colors.primary + '40' }]}
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
                      <View style={[styles.tag, { backgroundColor: colors.primary + '15' }]}>
                        <Text style={[styles.tagText, { color: colors.primary }]}>{p.domain}</Text>
                      </View>
                    ) : null}
                    {p.subdomain ? (
                      <View style={[styles.tag, { backgroundColor: '#8B5CF615' }]}>
                        <Text style={[styles.tagText, { color: '#8B5CF6' }]}>{p.subdomain}</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={[styles.divider, { backgroundColor: colors.border }]} />

                  {/* ── Refined Footer ── */}
                  <View style={styles.cardFooter}>
                    <View style={styles.slotsRow}>
                      <SlotPill label="Max" value={p.maxSlots ?? 0} color="#10B981" subColor={colors.subText} />
                      <View style={[styles.slotDivider, { backgroundColor: colors.border }]} />
                      <SlotPill label="Free" value={p.presentSlots ?? 0} color={p.presentSlots === 0 ? '#EF4444' : '#10B981'} subColor={colors.subText} />
                      <View style={[styles.slotDivider, { backgroundColor: colors.border }]} />
                      <SlotPill label="Students" value={p.assignedStudents ?? 0} color="#3B82F6" subColor={colors.subText} />
                    </View>

                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                      <Text style={[styles.statusText, { color: status.fg }]}>{status.label}</Text>
                    </View>
                  </View>

                  {/* ── Refined Toggle Row ── */}
                  <View style={[styles.toggleRow, { backgroundColor: colors.background, borderColor: colors.border }]}>
                    <View style={styles.toggleRowLeft}>
                      <View style={[styles.toggleDot, { backgroundColor: isActive ? '#10B981' : '#9CA3AF' }]} />
                      <Text style={[styles.toggleStateLabel, { color: colors.text }]}>
                        {isActive ? 'Active' : 'Inactive'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[
                        styles.toggleBtn,
                        {
                          backgroundColor: isActive ? '#FEE2E2' : '#D1FAE5',
                          borderColor: isActive ? '#FCA5A5' : '#6EE7B7',
                        },
                      ]}
                      onPress={(e) => { e.stopPropagation(); handleToggleStatus(p.projectId, isActive); }}
                      disabled={isToggling}
                      activeOpacity={0.8}
                    >
                      {isToggling ? (
                        <ActivityIndicator size="small" color={isActive ? '#DC2626' : '#059669'} />
                      ) : (
                        <Text style={[styles.toggleText, { color: isActive ? '#DC2626' : '#059669' }]}>
                          {isActive ? 'Deactivate' : 'Activate'}
                        </Text>
                      )}
                    </TouchableOpacity>
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
        onEdit={openEdit}
        activatingId={activatingId}
      />

      {/* ── EDIT MODAL ── */}
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

              <Text style={[styles.label, { color: colors.subText }]}>MAX STUDENT SLOTS  (1–10)</Text>
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

// ── slot pill ─────────────────────────────────────────────────────────────────
const SlotPill = ({ label, value, color, subColor }: any) => (
  <View style={styles.slotPill}>
    <Text style={[styles.slotPillValue, { color }]}>{value}</Text>
    <Text style={[styles.slotPillLabel, { color: subColor || '#9CA3AF' }]}>{label}</Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backBtnText: { fontSize: 24, fontWeight: '600', lineHeight: 26, marginTop: -2 },
  backBtnPlaceholder: { width: 38, height: 38 },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerSub: { fontSize: 10, fontWeight: '600', letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },

  // list
  content: { padding: 14 },
  loadingWrap: { alignItems: 'center', marginTop: 60, gap: 12 },
  loadingText: { fontSize: 13 },
  emptyWrap: { alignItems: 'center', marginTop: 80, gap: 8 },
  emptyIconCircle: { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 4, borderWidth: 1 },
  emptyTitle: { fontSize: 16, fontWeight: '700' },
  emptySubtitle: { fontSize: 13 },

  // card
  card: {
    borderRadius: 18,
    marginBottom: 14,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  cardStripe: { width: 4 },
  cardInner: { flex: 1, padding: 16 },

  titleRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6, gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: '700', flex: 1, lineHeight: 21, letterSpacing: -0.2 },

  editBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  editBtnText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },

  description: { fontSize: 12.5, lineHeight: 17, marginBottom: 10 },

  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  tag: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 7 },
  tagText: { fontSize: 10.5, fontWeight: '700', letterSpacing: 0.2 },

  divider: { height: 1, marginBottom: 12, opacity: 0.6 },

  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 12 },
  slotsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  slotDivider: { width: 1, height: 22, opacity: 0.7 },

  slotPill: { alignItems: 'center', minWidth: 42 },
  slotPillValue: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  slotPillLabel: { fontSize: 9.5, fontWeight: '600', marginTop: 2, letterSpacing: 0.3, textTransform: 'uppercase' },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10.5, fontWeight: '800', letterSpacing: 0.3 },

  // refined toggle row inside card
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  toggleRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  toggleDot: { width: 8, height: 8, borderRadius: 4 },
  toggleStateLabel: { fontSize: 12.5, fontWeight: '700', letterSpacing: -0.1 },

  toggleBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 92,
    borderWidth: 1,
  },
  toggleText: { fontWeight: '700', fontSize: 11.5, letterSpacing: 0.2 },

  tapHint: { fontSize: 10.5, textAlign: 'right', marginTop: 10, opacity: 0.6, fontWeight: '500' },

  // ── bottom sheet ──
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sheet: {
    position: 'absolute',
    left: 14,
    right: 14,
    top: 0,
    bottom: 0,
    borderRadius: 26,
    elevation: 22,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: -4 },
    overflow: 'hidden',
  },
  sheetHandle: { alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  handleBar: { width: 44, height: 4, borderRadius: 2 },

  closeStrip: { alignItems: 'center', paddingVertical: 4 },
  closeLabel: { fontSize: 10, fontWeight: '600', letterSpacing: 0.5 },

  sheetScroll: { padding: 20, paddingTop: 10, paddingBottom: 40 },

  sheetTitleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 16 },
  sheetTitle: { flex: 1, fontSize: 21, fontWeight: '800', lineHeight: 27, letterSpacing: -0.4 },
  sheetStatusBadge: { paddingHorizontal: 11, paddingVertical: 5, borderRadius: 10, marginTop: 3 },
  sheetStatusText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },

  descBlock: { borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1 },
  descBlockLabel: { fontSize: 9.5, fontWeight: '800', letterSpacing: 1.4, marginBottom: 6 },
  descBlockText: { fontSize: 14, lineHeight: 20 },

  infoCardRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  infoCard: { flex: 1, borderRadius: 12, padding: 13, borderLeftWidth: 3 },
  infoCardLabel: { fontSize: 9.5, fontWeight: '700', letterSpacing: 1.1, marginBottom: 5 },
  infoCardValue: { fontSize: 13.5, fontWeight: '700' },

  slotCard: { flex: 1, borderRadius: 14, padding: 14, alignItems: 'center' },
  slotNumber: { fontSize: 28, fontWeight: '800', lineHeight: 32, letterSpacing: -0.5 },
  slotLabel: { fontSize: 10, fontWeight: '700', marginTop: 3, textAlign: 'center', letterSpacing: 0.3 },

  // sheet status toggle
  statusToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    marginTop: 6,
    marginBottom: 16,
  },
  statusToggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  statusPulseRing: {
    width: 32, height: 32, borderRadius: 16, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
  },
  statusPulseDot: { width: 12, height: 12, borderRadius: 6 },
  statusToggleLabel: { fontSize: 9.5, fontWeight: '700', letterSpacing: 1.1, marginBottom: 2 },
  statusToggleValue: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },

  statusSwitch: {
    width: 52,
    height: 30,
    borderRadius: 15,
    padding: 3,
    justifyContent: 'center',
  },
  statusSwitchKnob: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 2, shadowOffset: { width: 0, height: 1 },
  },

  sheetActions: { flexDirection: 'row', gap: 10 },
  sheetEditBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  sheetEditText: { fontWeight: '800', fontSize: 13, letterSpacing: 0.2 },
  sheetToggleBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetToggleText: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 0.3 },

  // ── edit modal ──
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    maxHeight: '92%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.2 },
  modalCloseBtn: { padding: 4 },

  label: { fontSize: 10, fontWeight: '800', letterSpacing: 1.1, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 11,
    marginBottom: 13,
    fontSize: 14,
  },
  inputMulti: { minHeight: 84, textAlignVertical: 'top' },
  picker: {
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 13,
    marginBottom: 13,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 14, marginBottom: 8 },
  modalButton: { flex: 1, paddingVertical: 14, borderRadius: 11, alignItems: 'center' },
  modalButtonText: { color: '#fff', fontWeight: '800', fontSize: 13, letterSpacing: 0.2 },
  modalItem: { paddingVertical: 13, paddingHorizontal: 12, borderBottomWidth: StyleSheet.hairlineWidth },
});
