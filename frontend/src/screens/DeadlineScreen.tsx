import React, { useContext, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  ScrollView,
  Image,
  ActivityIndicator,
  Platform,
  StatusBar,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { ThemeContext } from '../theme/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { AlertContext } from '../context/AlertContext';
import {
  createDeadline,
  getDeadlines,
  deleteDeadline,
  updateDeadline,
  toggleActiveDeadline,
} from '../api/deadlineApi';
import DegreeSelector from '../components/DegreeSelector';
import { useDegree } from '../context/DegreeContext';

const Icons = {
  back: require('../assets/deadlines/back.png'),
  backWhite: require('../assets/deadlines/back-white.png'),
  add: require('../assets/deadlines/add.png'),
  addWhite: require('../assets/deadlines/add-white.png'),
  edit: require('../assets/deadlines/edit.png'),
  editWhite: require('../assets/deadlines/edit-white.png'),
  delete: require('../assets/deadlines/delete.png'),
  deleteWhite: require('../assets/deadlines/delete-white.png'),
  calendar: require('../assets/deadlines/calendar.png'),
  calendarWhite: require('../assets/deadlines/calendar-white.png'),
  clock: require('../assets/deadlines/clock.png'),
  clockWhite: require('../assets/deadlines/clock-white.png'),
  chevronDown: require('../assets/deadlines/chevron-down.png'),
  chevronDownWhite: require('../assets/deadlines/chevron-down-white.png'),
  empty: require('../assets/deadlines/empty.png'),
  emptyWhite: require('../assets/deadlines/empty-white.png'),
  toggleOn: require('../assets/deadlines/toggle-on.png'),
  toggleOff: require('../assets/deadlines/toggle-off.png'),
};

interface DeadlineItem {
  deadlineId: number;
  title: string;
  description?: string;
  deadlineDate: string;
  isActive: boolean;
  isPassed: boolean;
  roleSpecificity: RoleOption;
  createdAt: string;
  updatedAt: string;
}

type RoleOption = 'STUDENT' | 'FACULTY' | 'FACULTY_COORDINATOR' | 'ADMIN';

interface FormState {
  title: string;
  description: string;
  deadlineDate: Date;
  roleSpecificity: RoleOption;
  degree: 'UG' | 'PG';
}

interface Colors {
  background: string;
  card: string;
  text: string;
  subText: string;
  border: string;
  primary: string;
}

const ROLE_OPTIONS: RoleOption[] = ['STUDENT', 'FACULTY'];

const EMPTY_FORM: FormState = {
  title: '',
  description: '',
  deadlineDate: new Date(),
  roleSpecificity: 'STUDENT',
  degree: 'UG',
};

const formatLocalDate = (date: Date): string =>
  date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });

const formatLocalTime = (date: Date): string =>
  date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const toLocalDateTimeString = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:00`;
};

const getStatus = (deadline: DeadlineItem): { label: string; color: string; bg: string } => {
  if (!deadline.isActive) return { label: 'Inactive', color: '#EF4444', bg: '#EF444415' };
  if (deadline.isPassed) return { label: 'Overdue', color: '#F59E0B', bg: '#F59E0B15' };
  return { label: 'Active', color: '#10B981', bg: '#10B98115' };
};

interface RolePickerModalProps {
  visible: boolean;
  selected: RoleOption;
  colors: Colors;
  onSelect: (role: RoleOption) => void;
  onClose: () => void;
}

const RolePickerModal: React.FC<RolePickerModalProps> = ({ visible, selected, colors, onSelect, onClose }) => (
  <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
    <TouchableOpacity style={styles.roleOverlay} activeOpacity={1} onPress={onClose}>
      <View style={[styles.roleSheet, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.roleSheetTitle, { color: colors.subText }]}>Select Role</Text>
        {ROLE_OPTIONS.map((role) => (
          <TouchableOpacity
            key={role}
            style={[styles.roleOption, selected === role && { backgroundColor: colors.primary + '20' }]}
            onPress={() => onSelect(role)}
          >
            <Text style={[styles.roleOptionText, { color: selected === role ? colors.primary : colors.text }]}>
              {role.replace(/_/g, ' ')}
            </Text>
            {selected === role && <View style={[styles.roleCheck, { backgroundColor: colors.primary }]} />}
          </TouchableOpacity>
        ))}
      </View>
    </TouchableOpacity>
  </Modal>
);

interface FormModalProps {
  visible: boolean;
  isEdit: boolean;
  form: FormState;
  hasPickedDate: boolean;
  isDark: boolean;
  colors: Colors;
  showDatePicker: boolean;
  showTimePicker: boolean;
  showRolePicker: boolean;
  isBothCoordinator: boolean;
  onClose: () => void;
  onSubmit: () => void;
  onChangeForm: React.Dispatch<React.SetStateAction<FormState>>;
  onShowDatePicker: () => void;
  onShowTimePicker: () => void;
  onShowRolePicker: () => void;
  onHideDatePicker: () => void;
  onHideTimePicker: () => void;
  onHideRolePicker: () => void;
  onSelectRole: (role: RoleOption) => void;
  onSelectDegree: (degree: 'UG' | 'PG') => void;
  onPickDate: (date: Date) => void;
  onPickTime: (date: Date) => void;
}

const FormModal: React.FC<FormModalProps> = ({
  visible, isEdit, form, hasPickedDate, isDark, colors,
  showDatePicker, showTimePicker, showRolePicker, isBothCoordinator,
  onClose, onSubmit, onChangeForm,
  onShowDatePicker, onShowTimePicker, onShowRolePicker,
  onHideDatePicker, onHideTimePicker, onHideRolePicker,
  onSelectRole, onSelectDegree, onPickDate, onPickTime,
}) => (
  <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
    <View style={styles.modalBackdrop}>
      <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
        <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
        <View style={styles.modalHeader}>
          <Text style={[styles.modalTitle, { color: colors.text }]}>{isEdit ? 'Edit Deadline' : 'New Deadline'}</Text>
          <TouchableOpacity style={[styles.closeIconBtn, { backgroundColor: colors.background }]} onPress={onClose}>
            <Text style={[styles.closeIconText, { color: colors.subText }]}>✕</Text>
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false} style={{ flexGrow: 0 }}>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Title *</Text>
            <TextInput
              style={[styles.fieldInput, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="e.g. Project Submission"
              placeholderTextColor={colors.subText}
              value={form.title}
              onChangeText={(v) => onChangeForm((f) => ({ ...f, title: v }))}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Description</Text>
            <TextInput
              style={[styles.fieldInput, styles.textArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.text }]}
              placeholder="Optional details..."
              placeholderTextColor={colors.subText}
              value={form.description}
              onChangeText={(v) => onChangeForm((f) => ({ ...f, description: v }))}
              multiline
              numberOfLines={3}
            />
          </View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Applicable Role *</Text>
            <TouchableOpacity style={[styles.pickerRow, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={onShowRolePicker}>
              <Text style={[styles.pickerRowText, { color: colors.text }]}>{form.roleSpecificity.replace(/_/g, ' ')}</Text>
              <Image source={isDark ? Icons.chevronDownWhite : Icons.chevronDown} style={styles.pickerIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Degree Track *</Text>
            {isBothCoordinator ? (
              // Both-degree coordinator: can pick UG or PG
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {(['UG', 'PG'] as const).map((d) => (
                  <TouchableOpacity
                    key={d}
                    onPress={() => onSelectDegree(d)}
                    style={[
                      styles.degreeOption,
                      { backgroundColor: colors.background, borderColor: form.degree === d ? colors.primary : colors.border },
                      form.degree === d && { backgroundColor: colors.primary + '15' }
                    ]}
                  >
                    <Text style={[styles.degreeOptionText, { color: form.degree === d ? colors.primary : colors.text }]}>{d}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              // Single-degree coordinator: degree is fixed, show read-only badge
              <View style={[styles.degreeOption, { backgroundColor: colors.primary + '15', borderColor: colors.primary, alignSelf: 'flex-start', paddingHorizontal: 20 }]}>
                <Text style={[styles.degreeOptionText, { color: colors.primary }]}>{form.degree}</Text>
              </View>
            )}
          </View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Deadline Date *</Text>
            <TouchableOpacity style={[styles.pickerRow, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={onShowDatePicker}>
              <Image source={isDark ? Icons.calendarWhite : Icons.calendar} style={styles.pickerIcon} />
              <Text style={[styles.pickerRowText, { color: hasPickedDate ? colors.text : colors.subText, marginLeft: 8 }]}>
                {hasPickedDate ? formatLocalDate(form.deadlineDate) : 'Select date'}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Deadline Time *</Text>
            <TouchableOpacity style={[styles.pickerRow, { backgroundColor: colors.background, borderColor: colors.border }]} onPress={onShowTimePicker}>
              <Image source={isDark ? Icons.clockWhite : Icons.clock} style={styles.pickerIcon} />
              <Text style={[styles.pickerRowText, { color: hasPickedDate ? colors.text : colors.subText, marginLeft: 8 }]}>
                {hasPickedDate ? formatLocalTime(form.deadlineDate) : 'Select time'}
              </Text>
            </TouchableOpacity>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={form.deadlineDate}
              mode="date"
              minimumDate={new Date()}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, d) => { onHideDatePicker(); if (d) onPickDate(d); }}
            />
          )}
          {showTimePicker && (
            <DateTimePicker
              value={form.deadlineDate}
              mode="time"
              is24Hour
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={(_, d) => { onHideTimePicker(); if (d) onPickTime(d); }}
            />
          )}
          <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary }]} onPress={onSubmit} activeOpacity={0.85}>
            <Text style={styles.submitBtnText}>{isEdit ? 'Update Deadline' : 'Create Deadline'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.cancelBtn, { borderColor: colors.border }]} onPress={onClose}>
            <Text style={[styles.cancelBtnText, { color: colors.subText }]}>Cancel</Text>
          </TouchableOpacity>
          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </View>
    <RolePickerModal visible={showRolePicker} selected={form.roleSpecificity} colors={colors} onSelect={onSelectRole} onClose={onHideRolePicker} />
  </Modal>
);

interface DeadlineCardProps {
  item: DeadlineItem;
  isDark: boolean;
  colors: Colors;
  isFacultyCoordinator: boolean;
  onPress: (item: DeadlineItem) => void;
  onEdit: (item: DeadlineItem) => void;
  onToggle: (item: DeadlineItem) => void;
  onDelete: (item: DeadlineItem) => void;
}

const DeadlineCard: React.FC<DeadlineCardProps> = ({
  item, isDark, colors, isFacultyCoordinator, onPress, onEdit, onToggle, onDelete,
}) => {
  const status = getStatus(item);
  const date = new Date(item.deadlineDate);

  return (
    <TouchableOpacity activeOpacity={0.82} onPress={() => onPress(item)} style={[styles.card, { backgroundColor: colors.card }]}>
      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={2}>{item.title}</Text>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={[styles.rolePill, { backgroundColor: colors.primary + '18' }]}>
                <Text style={[styles.rolePillText, { color: colors.primary }]}>{item.roleSpecificity.replace(/_/g, ' ')}</Text>
              </View>
              <View style={[styles.rolePill, { backgroundColor: '#8B5CF618' }]}>
                <Text style={[styles.rolePillText, { color: '#8B5CF6' }]}>{(item as any).degree || 'UG'}</Text>
              </View>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
          </View>
        </View>
        {!!item.description && (
          <Text style={[styles.cardDesc, { color: colors.subText }]} numberOfLines={2}>{item.description}</Text>
        )}
        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Image source={isDark ? Icons.calendarWhite : Icons.calendar} style={[styles.metaIcon, { tintColor: colors.subText }]} />
            <Text style={[styles.metaText, { color: colors.subText }]}>
              {date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Image source={isDark ? Icons.clockWhite : Icons.clock} style={[styles.metaIcon, { tintColor: colors.subText }]} />
            <Text style={[styles.metaText, { color: colors.subText }]}>
              {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        </View>
        {isFacultyCoordinator && (
          <View style={[styles.cardActions, { borderTopColor: colors.border }]}>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: colors.primary, borderColor: colors.primary }]}
              onPress={(e) => { e.stopPropagation?.(); onEdit(item); }}
            >
              <Image source={Icons.editWhite} style={[styles.actionIcon, { tintColor: '#FFFFFF' }]} />
              <Text style={[styles.actionLabel, { color: '#FFFFFF' }]}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: item.isActive ? '#F59E0B' : '#10B981', borderColor: item.isActive ? '#F59E0B' : '#10B981' }]}
              onPress={(e) => { e.stopPropagation?.(); onToggle(item); }}
            >
              <Image 
                source={item.isActive ? Icons.toggleOff : Icons.toggleOn} 
                style={[styles.actionIcon, { tintColor: '#FFFFFF' }]} 
              />
              <Text style={[styles.actionLabel, { color: '#FFFFFF' }]}>{item.isActive ? 'Deactivate' : 'Activate'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, { backgroundColor: '#EF4444', borderColor: '#EF4444' }]}
              onPress={(e) => { e.stopPropagation?.(); onDelete(item); }}
            >
              <Image source={Icons.deleteWhite} style={[styles.actionIcon, { tintColor: '#FFFFFF' }]} />
              <Text style={[styles.actionLabel, { color: '#FFFFFF' }]}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const DeadlineScreen: React.FC = () => {
  const { colors, theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const navigation = useNavigation<any>();
  const { selectedDegree, setSelectedDegree } = useDegree();

  const isDark = theme === 'dark';

  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<DeadlineItem | null>(null);
  const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
  const [hasPickedDate, setHasPickedDate] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showRolePicker, setShowRolePicker] = useState(false);

  // ── Coordinator role flags ──────────────────────────────────────────────────
  const isUGCoord = user?.isUGCoordinator === true;
  const isPGCoord = user?.isPGCoordinator === true;
  const isBothCoordinator = isUGCoord && isPGCoord;
  // Any coordinator (UG-only, PG-only, both, or admin) can create/edit deadlines
  const isAnyCoordinator = isUGCoord || isPGCoord || user?.role === 'ADMIN' || user?.role === 'FACULTY_COORDINATOR';
  // For card action buttons: is this user a coordinator for the CURRENTLY SELECTED degree?
  const isFacultyCoordinator = isAnyCoordinator && (
    user?.role === 'ADMIN' ||
    user?.role === 'FACULTY_COORDINATOR' ||
    (selectedDegree === 'UG' && isUGCoord) ||
    (selectedDegree === 'PG' && isPGCoord)
  );
  const isStudent = user?.role === 'STUDENT';
  // Degree toggle in header: only if coordinator manages BOTH tracks or admin
  const showDegreeSelector = !isStudent && (user?.role === 'ADMIN' || isBothCoordinator);
  // The fixed degree for a single-track coordinator
  const fixedDegree: 'UG' | 'PG' = isUGCoord && !isPGCoord ? 'UG' : 'PG';

  useEffect(() => {
    if (user?.role === 'FACULTY') {
      if (user?.isUGCoordinator && !user?.isPGCoordinator && selectedDegree !== 'UG') {
        setSelectedDegree('UG');
      } else if (!user?.isUGCoordinator && user?.isPGCoordinator && selectedDegree !== 'PG') {
        setSelectedDegree('PG');
      }
    }
  }, [user, selectedDegree, setSelectedDegree]);

  const loadDeadlines = useCallback(async () => {
    if (!user?.token) return;
    try {
      setLoading(true);
      const data = await getDeadlines(selectedDegree);
      setDeadlines(data || []);
    } catch (err: any) {
      showAlert('Error', err?.response?.data?.error || 'Failed to load deadlines');
    } finally {
      setLoading(false);
    }
  }, [user?.token, showAlert, selectedDegree]);

  useFocusEffect(useCallback(() => { loadDeadlines(); }, [loadDeadlines]));

  const resetForm = useCallback(() => {
    // For both-degree coordinators → use selectedDegree; for single → use their fixed track
    const defaultDegree = isBothCoordinator ? selectedDegree : fixedDegree;
    setForm({ ...EMPTY_FORM, deadlineDate: new Date(), degree: defaultDegree });
    setHasPickedDate(false);
    setShowRolePicker(false);
    setShowDatePicker(false);
    setShowTimePicker(false);
  }, [selectedDegree, isBothCoordinator, fixedDegree]);

  const openCreate = useCallback(() => { resetForm(); setShowCreateModal(true); }, [resetForm]);

  const openEdit = useCallback((deadline: DeadlineItem) => {
    setSelectedDeadline(deadline);
    setForm({ title: deadline.title, description: deadline.description || '', deadlineDate: new Date(deadline.deadlineDate), roleSpecificity: deadline.roleSpecificity, degree: (deadline as any).degree || 'UG' });
    setHasPickedDate(true);
    setShowRolePicker(false);
    setShowDatePicker(false);
    setShowTimePicker(false);
    setShowEditModal(true);
  }, []);

  const closeCreate = useCallback(() => { setShowCreateModal(false); resetForm(); }, [resetForm]);
  const closeEdit = useCallback(() => { setShowEditModal(false); setSelectedDeadline(null); resetForm(); }, [resetForm]);

  // ── Navigate to detail screen ──────────────────────────────────────────────
  const handleCardPress = useCallback((item: DeadlineItem) => {
    navigation.navigate('DeadlineDetail', { deadline: item });
  }, [navigation]);

  const handleSelectRole = useCallback((role: RoleOption) => { setForm((f) => ({ ...f, roleSpecificity: role })); setShowRolePicker(false); }, []);
  const handleSelectDegree = useCallback((degree: 'UG' | 'PG') => { setForm((f) => ({ ...f, degree })); }, []);
  const handlePickDate = useCallback((d: Date) => { setForm((f) => ({ ...f, deadlineDate: d })); setHasPickedDate(true); }, []);
  const handlePickTime = useCallback((d: Date) => { setForm((f) => ({ ...f, deadlineDate: d })); setHasPickedDate(true); }, []);

  const handleCreate = useCallback(async () => {
    if (!form.title.trim()) { showAlert('Validation', 'Title is required'); return; }
    if (!hasPickedDate) { showAlert('Validation', 'Please select a deadline date and time'); return; }
    try {
      await createDeadline({ 
        title: form.title.trim(), 
        description: form.description.trim(), 
        deadlineDate: toLocalDateTimeString(form.deadlineDate), 
        isAutomatic: true, 
        roleSpecificity: form.roleSpecificity,
        degree: form.degree
      }, form.degree);
      showAlert('Success', 'Deadline created successfully');
      closeCreate();
      loadDeadlines();
    } catch (err: any) {
      showAlert('Error', err?.response?.data?.error || 'Failed to create deadline');
    }
  }, [form, hasPickedDate, user?.token, showAlert, closeCreate, loadDeadlines]);

  const handleUpdate = useCallback(async () => {
    if (!form.title.trim()) { showAlert('Validation', 'Title is required'); return; }
    try {
      if (!selectedDeadline) return;
      await updateDeadline(selectedDeadline.deadlineId, { 
        title: form.title.trim(), 
        description: form.description.trim(), 
        deadlineDate: toLocalDateTimeString(form.deadlineDate), 
        roleSpecificity: form.roleSpecificity,
        degree: form.degree
      });
      showAlert('Success', 'Deadline updated successfully');
      closeEdit();
      loadDeadlines();
    } catch (err: any) {
      showAlert('Error', err?.response?.data?.error || 'Failed to update deadline');
    }
  }, [form, user?.token, selectedDeadline, showAlert, closeEdit, loadDeadlines]);

  const handleDelete = useCallback((deadline: DeadlineItem) => {
    showAlert('Delete Deadline', `Are you sure you want to delete "${deadline.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          await deleteDeadline(deadline.deadlineId);
          showAlert('Success', 'Deadline deleted');
          loadDeadlines();
        } catch (err: any) {
          showAlert('Error', err?.response?.data?.error || 'Failed to delete deadline');
        }
      }},
    ]);
  }, [user?.token, showAlert, loadDeadlines]);

  const handleToggle = useCallback(async (deadline: DeadlineItem) => {
    try {
      await toggleActiveDeadline(deadline.deadlineId);
      loadDeadlines();
    } catch (err: any) {
      showAlert('Error', err?.response?.data?.error || 'Failed to toggle deadline');
    }
  }, [user?.token, showAlert, loadDeadlines]);

  const renderItem = useCallback(
    ({ item }: { item: DeadlineItem }) => (
      <DeadlineCard
        item={item}
        isDark={isDark}
        colors={colors}
        isFacultyCoordinator={isFacultyCoordinator}
        onPress={handleCardPress}
        onEdit={openEdit}
        onToggle={handleToggle}
        onDelete={handleDelete}
      />
    ),
    [isDark, colors, isFacultyCoordinator, handleCardPress, openEdit, handleToggle, handleDelete]
  );

  const sharedModalProps = {
    form, hasPickedDate, isDark, colors,
    showDatePicker, showTimePicker, showRolePicker,
    onChangeForm: setForm,
    onShowDatePicker: () => setShowDatePicker(true),
    onShowTimePicker: () => setShowTimePicker(true),
    onShowRolePicker: () => setShowRolePicker(true),
    onHideDatePicker: () => setShowDatePicker(false),
    onHideTimePicker: () => setShowTimePicker(false),
    onHideRolePicker: () => setShowRolePicker(false),
    onSelectRole: handleSelectRole,
    onSelectDegree: handleSelectDegree,
    onPickDate: handlePickDate,
    onPickTime: handlePickTime,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()}>
          <Image source={isDark ? Icons.backWhite : Icons.back} style={[styles.headerIcon, { tintColor: colors.text }]} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Deadlines{!isStudent ? ` (${selectedDegree})` : ''}
        </Text>
        {/* Degree toggle: only for both-degree coordinators / admin */}
        {showDegreeSelector && <DegreeSelector />}
        {/* Add button: any coordinator can add, students cannot */}
        {isAnyCoordinator && (
          <TouchableOpacity style={[styles.addBtn, { backgroundColor: colors.primary }]} onPress={openCreate} activeOpacity={0.85}>
            <Image source={isDark ? Icons.addWhite : Icons.add} style={[styles.addIcon, { tintColor: '#FFFFFF' }]} />
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={colors.primary} size="large" />
          <Text style={[styles.loadingText, { color: colors.subText }]}>Loading deadlines...</Text>
        </View>
      ) : deadlines.length === 0 ? (
        <View style={styles.centered}>
          <Image source={isDark ? Icons.emptyWhite : Icons.empty} style={styles.emptyIcon} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Deadlines</Text>
          <Text style={[styles.emptySubtitle, { color: colors.subText }]}>
            {isFacultyCoordinator ? 'Tap "+ Add" to create your first deadline.' : 'No active deadlines for your role yet.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={deadlines}
          keyExtractor={(item) => item.deadlineId.toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}

      <FormModal {...sharedModalProps} visible={showCreateModal} isEdit={false} isBothCoordinator={isBothCoordinator} onClose={closeCreate} onSubmit={handleCreate} />
      <FormModal {...sharedModalProps} visible={showEditModal} isEdit={true} isBothCoordinator={isBothCoordinator} onClose={closeEdit} onSubmit={handleUpdate} />
    </SafeAreaView>
  );
};

export default DeadlineScreen;

const styles = StyleSheet.create({
  header: { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, borderBottomWidth: 1 },
  headerBackBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center', marginRight: 4 },
  headerIcon: { width: 22, height: 22, resizeMode: 'contain' },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', marginLeft: 4, letterSpacing: 0.2 },
  addBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, gap: 5 },
  addIcon: { width: 14, height: 14, resizeMode: 'contain' },
  addBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 13 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 32 },
  loadingText: { marginTop: 12, fontSize: 14 },
  emptyIcon: { width: 72, height: 72, resizeMode: 'contain', opacity: 0.4, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  listContent: { padding: 16, paddingBottom: 32, gap: 12 },
  card: { borderRadius: 14, overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowOffset: { width: 0, height: 2 }, shadowRadius: 6 },
  cardAccent: { width: 4, alignSelf: 'stretch' },
  cardBody: { flex: 1, padding: 14 },
  cardTopRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: '700', marginBottom: 5, lineHeight: 20 },
  rolePill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  rolePillText: { fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusBadgeText: { fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
  cardDesc: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  cardMeta: { flexDirection: 'row', gap: 14, marginBottom: 4 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaIcon: { width: 13, height: 13, resizeMode: 'contain' },
  metaText: { fontSize: 12 },
  cardActions: { flexDirection: 'row', gap: 8, marginTop: 12, paddingTop: 12, borderTopWidth: 1 },
  actionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 7, borderRadius: 8, borderWidth: 1, gap: 4 },
  actionIcon: { width: 13, height: 13, resizeMode: 'contain' },
  actionLabel: { fontSize: 11, fontWeight: '600' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 0, maxHeight: '88%' },
  handleBar: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 14 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  modalTitle: { fontSize: 19, fontWeight: '700' },
  closeIconBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  closeIconText: { fontSize: 16, lineHeight: 20 },
  fieldGroup: { marginBottom: 14 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.4 },
  fieldInput: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 11, fontSize: 14 },
  textArea: { height: 80, textAlignVertical: 'top', paddingTop: 10 },
  pickerRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12 },
  pickerRowText: { flex: 1, fontSize: 14 },
  pickerIcon: { width: 16, height: 16, resizeMode: 'contain' },
  submitBtn: { marginTop: 6, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  submitBtnText: { color: '#FFFFFF', fontWeight: '700', fontSize: 15 },
  cancelBtn: { marginTop: 10, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  cancelBtnText: { fontWeight: '600', fontSize: 14 },
  roleOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', paddingHorizontal: 32 },
  roleSheet: { borderRadius: 16, padding: 8, borderWidth: 1 },
  roleSheetTitle: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6, paddingHorizontal: 12, paddingVertical: 8 },
  roleOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 13, borderRadius: 10 },
  roleOptionText: { fontSize: 14, fontWeight: '500' },
  roleCheck: { width: 8, height: 8, borderRadius: 4 },
  degreeOption: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
  },
  degreeOptionText: {
    fontSize: 14,
    fontWeight: '700',
  },
});