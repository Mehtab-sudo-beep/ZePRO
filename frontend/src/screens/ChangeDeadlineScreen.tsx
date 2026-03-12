import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

interface Deadlines {
  formTeam: Date | null;
  sendRequest: Date | null;
  midtermEvaluation: Date | null;
  finalEvaluation: Date | null;
}

type DeadlineKey = keyof Deadlines;

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const formatDate = (date: Date | null): string => {
  if (!date) return '';
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

/* =======================
   CUSTOM CALENDAR MODAL
   ======================= */
const CalendarPicker = ({
  visible,
  selectedDate,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  selectedDate: Date | null;
  onConfirm: (date: Date) => void;
  onCancel: () => void;
}) => {
  const today = new Date();
  const initial = selectedDate ?? today;
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());
  const [picked, setPicked] = useState<Date | null>(selectedDate);

  React.useEffect(() => {
    if (visible) {
      const base = selectedDate ?? new Date();
      setViewYear(base.getFullYear());
      setViewMonth(base.getMonth());
      setPicked(selectedDate);
    }
  }, [visible]);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const getDaysInMonth = (year: number, month: number) =>
    new Date(year, month + 1, 0).getDate();

  const getFirstDayOfMonth = (year: number, month: number) =>
    new Date(year, month, 1).getDay();

  const isPast = (day: number) => {
    const d = new Date(viewYear, viewMonth, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d < t;
  };

  const isToday = (day: number) =>
    today.getDate() === day &&
    today.getMonth() === viewMonth &&
    today.getFullYear() === viewYear;

  const isSelected = (day: number) =>
    picked !== null &&
    picked.getDate() === day &&
    picked.getMonth() === viewMonth &&
    picked.getFullYear() === viewYear;

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={calStyles.overlay}>
        <View style={calStyles.container}>

          {/* Header */}
          <View style={calStyles.header}>
            <TouchableOpacity onPress={onCancel}>
              <Text style={calStyles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={calStyles.headerTitle}>Select Date</Text>
            <TouchableOpacity onPress={() => picked && onConfirm(picked)} disabled={!picked}>
              <Text style={[calStyles.doneText, !picked && { opacity: 0.4 }]}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Month Navigation */}
          <View style={calStyles.monthNav}>
            <TouchableOpacity onPress={prevMonth} style={calStyles.navBtn}>
              <Text style={calStyles.navArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={calStyles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
            <TouchableOpacity onPress={nextMonth} style={calStyles.navBtn}>
              <Text style={calStyles.navArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Day Names */}
          <View style={calStyles.dayNamesRow}>
            {DAYS.map(d => (
              <Text key={d} style={calStyles.dayName}>{d}</Text>
            ))}
          </View>

          {/* Grid */}
          <View style={calStyles.grid}>
            {cells.map((day, idx) => {
              if (!day) return <View key={`e-${idx}`} style={calStyles.cell} />;
              const past = isPast(day);
              const selected = isSelected(day);
              const todayCell = isToday(day);
              return (
                <TouchableOpacity
                  key={`d-${day}`}
                  style={[
                    calStyles.cell,
                    selected && calStyles.selectedCell,
                    todayCell && !selected && calStyles.todayCell,
                  ]}
                  onPress={() => !past && setPicked(new Date(viewYear, viewMonth, day))}
                  disabled={past}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    calStyles.dayText,
                    past && calStyles.pastDay,
                    selected && calStyles.selectedDayText,
                    todayCell && !selected && calStyles.todayText,
                  ]}>
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Selected bar */}
          <View style={calStyles.selectedBar}>
            <Text style={calStyles.selectedLabel}>
              {picked ? `Selected: ${formatDate(picked)}` : 'No date selected'}
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/* =======================
   MAIN SCREEN
   ======================= */
const ChangeDeadlinesScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [deadlines, setDeadlines] = useState<Deadlines>({
    formTeam: null,
    sendRequest: null,
    midtermEvaluation: null,
    finalEvaluation: null,
  });

  const [calendarVisible, setCalendarVisible] = useState(false);
  const [activeField, setActiveField] = useState<DeadlineKey | null>(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const openCalendar = (field: DeadlineKey) => {
    setActiveField(field);
    setCalendarVisible(true);
  };

  const handleConfirm = (date: Date) => {
    if (activeField) {
      setDeadlines(prev => ({ ...prev, [activeField]: date }));
      setErrors(prev => ({ ...prev, [activeField]: '' }));
    }
    setCalendarVisible(false);
    setActiveField(null);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const fields: { key: DeadlineKey; label: string }[] = [
      { key: 'formTeam', label: 'Form Team Deadline' },
      { key: 'sendRequest', label: 'Send Request Deadline' },
      { key: 'midtermEvaluation', label: 'Midterm Evaluation Deadline' },
      { key: 'finalEvaluation', label: 'Final Evaluation Deadline' },
    ];
    fields.forEach(({ key, label }) => {
      if (!deadlines[key]) newErrors[key] = `${label} is required`;
    });
    return newErrors;
  };

  const handleSave = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        '✅ Deadlines Updated',
        'All deadlines have been successfully updated.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1200);
  };

  const hasAnySummary = Object.values(deadlines).some(v => v !== null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image source={require('../assets/angle.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deadline Management</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team & Request Deadlines</Text>
          <DeadlineField
            label="Form Team Deadline *"
            description="Last date for students to form their project teams"
            value={deadlines.formTeam}
            error={errors.formTeam}
            onPress={() => openCalendar('formTeam')}
          />
          <DeadlineField
            label="Send Request Deadline *"
            description="Last date for teams to send faculty allocation requests"
            value={deadlines.sendRequest}
            error={errors.sendRequest}
            onPress={() => openCalendar('sendRequest')}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evaluation Deadlines</Text>
          <DeadlineField
            label="Midterm Evaluation Deadline *"
            description="Date of midterm project evaluation"
            value={deadlines.midtermEvaluation}
            error={errors.midtermEvaluation}
            onPress={() => openCalendar('midtermEvaluation')}
          />
          <DeadlineField
            label="Final Evaluation Deadline *"
            description="Date of final project evaluation and submission"
            value={deadlines.finalEvaluation}
            error={errors.finalEvaluation}
            onPress={() => openCalendar('finalEvaluation')}
          />
        </View>

        {hasAnySummary && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Deadline Summary</Text>
            {deadlines.formTeam && <SummaryRow label="Form Team" value={formatDate(deadlines.formTeam)} />}
            {deadlines.sendRequest && <SummaryRow label="Send Request" value={formatDate(deadlines.sendRequest)} />}
            {deadlines.midtermEvaluation && <SummaryRow label="Midterm Evaluation" value={formatDate(deadlines.midtermEvaluation)} />}
            {deadlines.finalEvaluation && <SummaryRow label="Final Evaluation" value={formatDate(deadlines.finalEvaluation)} />}
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>Update Deadlines</Text>}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      <CalendarPicker
        visible={calendarVisible}
        selectedDate={activeField ? deadlines[activeField] : null}
        onConfirm={handleConfirm}
        onCancel={() => { setCalendarVisible(false); setActiveField(null); }}
      />
    </SafeAreaView>
  );
};

/* =======================
   DEADLINE FIELD COMPONENT
   ======================= */
const DeadlineField = ({
  label, description, value, error, onPress,
}: {
  label: string;
  description?: string;
  value: Date | null;
  error?: string;
  onPress: () => void;
}) => (
  <View style={fieldStyles.wrapper}>
    <Text style={fieldStyles.label}>{label}</Text>
    <TouchableOpacity
      style={[fieldStyles.inputRow, error ? fieldStyles.inputRowError : null]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={fieldStyles.calIcon}></Text>
      <Text style={[fieldStyles.valueText, !value && fieldStyles.placeholderText]}>
        {value ? formatDate(value) : 'Tap to select date'}
      </Text>
      <Text style={fieldStyles.chevron}>›</Text>
    </TouchableOpacity>
    {description && !error && <Text style={fieldStyles.description}>{description}</Text>}
    {error ? <Text style={fieldStyles.errorText}>{error}</Text> : null}
  </View>
);

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <View style={summaryStyles.row}>
    <Text style={summaryStyles.label}>{label}</Text>
    <Text style={summaryStyles.value}>{value}</Text>
  </View>
);

/* =======================
   STYLES
   ======================= */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  backIcon: { width: 22, height: 22, resizeMode: 'contain' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#0c0b0b' },
  scrollContent: { padding: 16 },
  section: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: '#6B7280',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
  },
  summaryCard: {
    backgroundColor: '#EEF2FF', borderRadius: 12, padding: 16,
    marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#4F46E5',
  },
  summaryTitle: {
    fontSize: 13, fontWeight: '700', color: '#4F46E5',
    marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5,
  },
  submitBtn: {
    backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 4,
    shadowColor: '#2563EB', shadowOpacity: 0.3, shadowRadius: 10, elevation: 4,
  },
  submitBtnDisabled: { backgroundColor: '#93C5FD', shadowOpacity: 0 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F3F4F6', borderRadius: 8,
    borderWidth: 1, borderColor: '#E5E7EB',
    paddingHorizontal: 12, paddingVertical: 13,
  },
  inputRowError: { borderColor: '#DC2626', backgroundColor: '#FEF2F2' },
  calIcon: { fontSize: 16, marginRight: 8 },
  valueText: { flex: 1, fontSize: 14, color: '#111827', fontWeight: '500' },
  placeholderText: { color: '#9CA3AF', fontWeight: '400' },
  chevron: { fontSize: 20, color: '#9CA3AF', lineHeight: 22 },
  description: { fontSize: 11, color: '#9CA3AF', marginTop: 4 },
  errorText: { fontSize: 12, color: '#DC2626', marginTop: 4 },
});

const summaryStyles = StyleSheet.create({
  row: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingVertical: 5,
    borderBottomWidth: 1, borderBottomColor: '#C7D2FE',
  },
  label: { fontSize: 13, color: '#374151', fontWeight: '500' },
  value: { fontSize: 13, color: '#4F46E5', fontWeight: '700' },
});

const calStyles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  container: { backgroundColor: '#FFFFFF', borderRadius: 16, width: '100%', overflow: 'hidden' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  cancelText: { fontSize: 15, color: '#6B7280' },
  doneText: { fontSize: 15, fontWeight: '700', color: '#2563EB' },
  monthNav: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#F9FAFB',
  },
  navBtn: { width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  navArrow: { fontSize: 28, color: '#2563EB', lineHeight: 32 },
  monthLabel: { fontSize: 15, fontWeight: '700', color: '#111827' },
  dayNamesRow: {
    flexDirection: 'row', paddingHorizontal: 8,
    paddingVertical: 6, backgroundColor: '#F3F4F6',
  },
  dayName: { flex: 1, textAlign: 'center', fontSize: 11, fontWeight: '600', color: '#6B7280' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 8, paddingVertical: 8 },
  cell: { width: '14.28%', aspectRatio: 1, justifyContent: 'center', alignItems: 'center', marginVertical: 2 },
  selectedCell: { backgroundColor: '#2563EB', borderRadius: 50 },
  todayCell: { borderWidth: 1.5, borderColor: '#2563EB', borderRadius: 50 },
  dayText: { fontSize: 14, color: '#111827', fontWeight: '500' },
  pastDay: { color: '#D1D5DB' },
  selectedDayText: { color: '#FFFFFF', fontWeight: '700' },
  todayText: { color: '#2563EB', fontWeight: '700' },
  selectedBar: {
    paddingHorizontal: 20, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#E5E7EB',
    backgroundColor: '#F9FAFB', alignItems: 'center',
  },
  selectedLabel: { fontSize: 13, color: '#4F46E5', fontWeight: '600' },
});

export default ChangeDeadlinesScreen;