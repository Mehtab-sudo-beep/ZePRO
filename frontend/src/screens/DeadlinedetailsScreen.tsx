import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { ThemeContext } from '../theme/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { AlertContext } from '../context/AlertContext';
import {
  deleteDeadline,
  toggleActiveDeadline,
  sendDeadlineEmailManually,
} from '../api/deadlineApi';

// ─── Static Image Imports ─────────────────────────────────────────────────────

const Icons = {
  back: require('../assets/deadlines/back.png'),
  backWhite: require('../assets/deadlines/back-white.png'),
  edit: require('../assets/deadlines/edit.png'),
  editWhite: require('../assets/deadlines/edit-white.png'),
  delete: require('../assets/deadlines/delete.png'),
  deleteWhite: require('../assets/deadlines/delete-white.png'),
  calendar: require('../assets/deadlines/calendar.png'),
  calendarWhite: require('../assets/deadlines/calendar-white.png'),
  clock: require('../assets/deadlines/clock.png'),
  clockWhite: require('../assets/deadlines/clock-white.png'),
  toggleOn: require('../assets/deadlines/toggle-on.png'),
  toggleOff: require('../assets/deadlines/toggle-off.png'),
};

// ─── Types ────────────────────────────────────────────────────────────────────

type RoleOption = 'STUDENT' | 'FACULTY' | 'FACULTY_COORDINATOR' | 'ADMIN';

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

type DeadlineDetailRouteProp = RouteProp<
  { DeadlineDetail: { deadline: DeadlineItem; onUpdate: () => void } },
  'DeadlineDetail'
>;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getStatus = (deadline: DeadlineItem) => {
  if (!deadline.isActive) return { label: 'Inactive', color: '#EF4444', bg: '#EF444415' };
  if (deadline.isPassed) return { label: 'Overdue', color: '#F59E0B', bg: '#F59E0B15' };
  return { label: 'Active', color: '#10B981', bg: '#10B98115' };
};

const formatFullDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

const formatTime = (dateStr: string): string =>
  new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const formatShortDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

const getTimeRemaining = (deadlineDateStr: string): { text: string; urgent: boolean } => {
  const now = new Date();
  const deadline = new Date(deadlineDateStr);
  const diffMs = deadline.getTime() - now.getTime();

  if (diffMs <= 0) return { text: 'Deadline has passed', urgent: true };

  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return { text: `${diffMins} minute${diffMins !== 1 ? 's' : ''} remaining`, urgent: true };
  if (diffHours < 24) return { text: `${diffHours} hour${diffHours !== 1 ? 's' : ''} remaining`, urgent: true };
  if (diffDays === 1) return { text: '1 day remaining', urgent: true };
  if (diffDays <= 3) return { text: `${diffDays} days remaining`, urgent: true };
  return { text: `${diffDays} days remaining`, urgent: false };
};

// ─── InfoRow ──────────────────────────────────────────────────────────────────

interface InfoRowProps {
  icon: any;
  label: string;
  value: string;
  colors: any;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value, colors }) => (
  <View style={[infoRowStyles.container, { borderBottomColor: colors.border }]}>
    <View style={[infoRowStyles.iconWrap, { backgroundColor: colors.primary + '15' }]}>
      <Image source={icon} style={[infoRowStyles.icon, { tintColor: colors.primary }]} />
    </View>
    <View style={infoRowStyles.textWrap}>
      <Text style={[infoRowStyles.label, { color: colors.subText }]}>{label}</Text>
      <Text style={[infoRowStyles.value, { color: colors.text }]}>{value}</Text>
    </View>
  </View>
);

const infoRowStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 14,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    width: 16,
    height: 16,
    resizeMode: 'contain',
  },
  textWrap: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
});

// ─── DeadlineDetailScreen ─────────────────────────────────────────────────────

const DeadlineDetailScreen: React.FC = () => {
  const { colors, theme } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const navigation = useNavigation<any>();
  const route = useRoute<DeadlineDetailRouteProp>();

  const { deadline, onUpdate } = route.params;
  const isDark = theme === 'dark';

  const isFacultyCoordinator =
    user?.isFC === true && (user?.role === 'FACULTY' || user?.role === 'ADMIN');

  const status = getStatus(deadline);
  const timeRemaining = getTimeRemaining(deadline.deadlineDate);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleDelete = () => {
    showAlert(
      'Delete Deadline',
      `Are you sure you want to delete "${deadline.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDeadline(deadline.deadlineId);
              showAlert('Success', 'Deadline deleted');
              onUpdate?.();
              navigation.goBack();
            } catch (err: any) {
              showAlert('Error', err?.response?.data?.error || 'Failed to delete deadline');
            }
          },
        },
      ]
    );
  };

  const handleSendEmail = async () => {
    try {
      await sendDeadlineEmailManually(deadline.deadlineId);
      showAlert('Success', 'Deadline reminder email has been sent to users.');
    } catch (err: any) {
      showAlert('Error', err?.response?.data?.error || 'Failed to send email');
    }
  };

  const handleToggle = async () => {
    try {
      await toggleActiveDeadline(deadline.deadlineId);
      showAlert('Success', deadline.isActive ? 'Deadline deactivated' : 'Deadline activated');
      onUpdate?.();
      navigation.goBack();
    } catch (err: any) {
      showAlert('Error', err?.response?.data?.error || 'Failed to toggle deadline');
    }
  };

  const handleEdit = () => {
    // Navigate back and trigger edit — pass deadlineId so the list screen can open edit modal
    navigation.navigate('Deadlines', { editDeadlineId: deadline.deadlineId });
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.headerBackBtn} onPress={() => navigation.goBack()}>
          <Image
            source={isDark ? Icons.backWhite : Icons.back}
            style={[styles.headerIcon, { tintColor: colors.text }]}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Deadline Details</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Hero Card ─────────────────────────────────────────────────────── */}
        <View style={[styles.heroCard, { backgroundColor: colors.card }]}>
          {/* Colored top accent strip */}
          <View style={[styles.heroAccent, { backgroundColor: status.color }]} />

          <View style={styles.heroBody}>
            {/* Status + Role row */}
            <View style={styles.heroTopRow}>
              <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                <View style={[styles.statusDot, { backgroundColor: status.color }]} />
                <Text style={[styles.statusBadgeText, { color: status.color }]}>{status.label}</Text>
              </View>
              <View style={[styles.rolePill, { backgroundColor: colors.primary + '18' }]}>
                <Text style={[styles.rolePillText, { color: colors.primary }]}>
                  {deadline.roleSpecificity.replace(/_/g, ' ')}
                </Text>
              </View>
            </View>

            {/* Title */}
            <Text style={[styles.heroTitle, { color: colors.text }]}>{deadline.title}</Text>

            {/* Time remaining banner */}
            {deadline.isActive && (
              <View
                style={[
                  styles.timeRemainingBanner,
                  {
                    backgroundColor: timeRemaining.urgent
                      ? '#EF444412'
                      : colors.primary + '12',
                    borderColor: timeRemaining.urgent
                      ? '#EF444430'
                      : colors.primary + '30',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.timeRemainingText,
                    { color: timeRemaining.urgent ? '#EF4444' : colors.primary },
                  ]}
                >
                  ⏱ {timeRemaining.text}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── Info Section ──────────────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.subText }]}>Schedule</Text>

          <InfoRow
            icon={isDark ? Icons.calendarWhite : Icons.calendar}
            label="Deadline Date"
            value={formatFullDate(deadline.deadlineDate)}
            colors={colors}
          />
          <InfoRow
            icon={isDark ? Icons.clockWhite : Icons.clock}
            label="Deadline Time"
            value={formatTime(deadline.deadlineDate)}
            colors={colors}
          />
        </View>

        {/* ── Description ───────────────────────────────────────────────────── */}
        {!!deadline.description && (
          <View style={[styles.section, { backgroundColor: colors.card }]}>
            <Text style={[styles.sectionTitle, { color: colors.subText }]}>Description</Text>
            <Text style={[styles.descriptionText, { color: colors.text }]}>
              {deadline.description}
            </Text>
          </View>
        )}

        {/* ── Metadata ──────────────────────────────────────────────────────── */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.subText }]}>Details</Text>

          <View style={styles.metaGrid}>
            <View style={[styles.metaCell, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.metaCellLabel, { color: colors.subText }]}>Created</Text>
              <Text style={[styles.metaCellValue, { color: colors.text }]}>
                {formatShortDate(deadline.createdAt)}
              </Text>
            </View>
            <View style={[styles.metaCell, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.metaCellLabel, { color: colors.subText }]}>Last Updated</Text>
              <Text style={[styles.metaCellValue, { color: colors.text }]}>
                {formatShortDate(deadline.updatedAt)}
              </Text>
            </View>
            <View style={[styles.metaCell, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.metaCellLabel, { color: colors.subText }]}>Status</Text>
              <Text style={[styles.metaCellValue, { color: status.color }]}>{status.label}</Text>
            </View>
            <View style={[styles.metaCell, { backgroundColor: colors.background, borderColor: colors.border }]}>
              <Text style={[styles.metaCellLabel, { color: colors.subText }]}>Role</Text>
              <Text style={[styles.metaCellValue, { color: colors.primary }]}>
                {deadline.roleSpecificity.replace(/_/g, ' ')}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Actions (Faculty Coordinator only) ────────────────────────────── */}
        {isFacultyCoordinator && (
          <View style={styles.actionsSection}>
            {/* Edit */}
            <TouchableOpacity
              style={[styles.actionRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              onPress={handleEdit}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: colors.primary + '15' }]}>
                <Image
                  source={isDark ? Icons.editWhite : Icons.edit}
                  style={[styles.actionIcon, { tintColor: colors.primary }]}
                />
              </View>
              <View style={styles.actionTextWrap}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>Edit Deadline</Text>
                <Text style={[styles.actionSubtitle, { color: colors.subText }]}>
                  Modify title, date, role or description
                </Text>
              </View>
              <Text style={[styles.actionChevron, { color: colors.subText }]}>›</Text>
            </TouchableOpacity>

            {/* Toggle Active */}
            <TouchableOpacity
              style={[
                styles.actionRow,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={handleToggle}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.actionIconWrap,
                  { backgroundColor: deadline.isActive ? '#F59E0B15' : '#10B98115' },
                ]}
              >
                <Image
                  source={deadline.isActive ? Icons.toggleOff : Icons.toggleOn}
                  style={[
                    styles.actionIcon,
                    { tintColor: deadline.isActive ? '#F59E0B' : '#10B981' },
                  ]}
                />
              </View>
              <View style={styles.actionTextWrap}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>
                  {deadline.isActive ? 'Deactivate Deadline' : 'Activate Deadline'}
                </Text>
                <Text style={[styles.actionSubtitle, { color: colors.subText }]}>
                  {deadline.isActive
                    ? 'Hide this deadline from users'
                    : 'Make this deadline visible to users'}
                </Text>
              </View>
              <Text style={[styles.actionChevron, { color: colors.subText }]}>›</Text>
            </TouchableOpacity>

            {/* Send Email */}
            <TouchableOpacity
              style={[
                styles.actionRow,
                {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={handleSendEmail}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.actionIconWrap,
                  { backgroundColor: '#3B82F615' },
                ]}
              >
                <Text style={{ fontSize: 18 }}>📧</Text>
              </View>
              <View style={styles.actionTextWrap}>
                <Text style={[styles.actionTitle, { color: colors.text }]}>
                  Send Email Reminder
                </Text>
                <Text style={[styles.actionSubtitle, { color: colors.subText }]}>
                  Broadcast this deadline to all relevant users
                </Text>
              </View>
              <Text style={[styles.actionChevron, { color: colors.subText }]}>›</Text>
            </TouchableOpacity>

            {/* Delete */}
            <TouchableOpacity
              style={[styles.actionRow, styles.actionRowDanger, { backgroundColor: colors.card, borderColor: '#EF444430' }]}
              onPress={handleDelete}
              activeOpacity={0.7}
            >
              <View style={[styles.actionIconWrap, { backgroundColor: '#EF444415' }]}>
                <Image
                  source={isDark ? Icons.deleteWhite : Icons.delete}
                  style={[styles.actionIcon, { tintColor: '#EF4444' }]}
                />
              </View>
              <View style={styles.actionTextWrap}>
                <Text style={[styles.actionTitle, { color: '#EF4444' }]}>Delete Deadline</Text>
                <Text style={[styles.actionSubtitle, { color: colors.subText }]}>
                  Permanently remove this deadline
                </Text>
              </View>
              <Text style={[styles.actionChevron, { color: '#EF4444' }]}>›</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

export default DeadlineDetailScreen;

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  // Header
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  headerBackBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },

  // Scroll
  scrollContent: {
    padding: 16,
    gap: 12,
  },

  // Hero Card
  heroCard: {
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  heroAccent: {
    height: 5,
    width: '100%',
  },
  heroBody: {
    padding: 18,
    gap: 12,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  rolePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 29,
    letterSpacing: 0.1,
  },
  timeRemainingBanner: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  timeRemainingText: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Sections
  section: {
    borderRadius: 16,
    padding: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },

  // Meta grid
  metaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  metaCell: {
    width: '47%',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
  },
  metaCellLabel: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  metaCellValue: {
    fontSize: 13,
    fontWeight: '600',
  },

  // Actions
  actionsSection: {
    gap: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    gap: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 4,
  },
  actionRowDanger: {
    // Overrides provided inline
  },
  actionIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    width: 18,
    height: 18,
    resizeMode: 'contain',
  },
  actionTextWrap: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    lineHeight: 16,
  },
  actionChevron: {
    fontSize: 22,
    fontWeight: '300',
    lineHeight: 26,
  },
});