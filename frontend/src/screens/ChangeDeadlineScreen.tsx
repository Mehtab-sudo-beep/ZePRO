import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { coordinatorApi } from '../api/coordinatorApi';
import { AlertContext } from '../context/AlertContext';
import { ThemeContext } from '../theme/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { useDegree } from '../context/DegreeContext';
import DegreeSelector from '../components/DegreeSelector';
import DateTimePicker from '@react-native-community/datetimepicker';

interface Deadlines {
  teamFormationDeadline: string;
  projectRequestDeadline: string;
  meetingSchedulingDeadline: string;
}

const ChangeDeadlinesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { showAlert } = useContext(AlertContext);
  const { colors } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const { selectedDegree, setSelectedDegree } = useDegree();
  const isDark = colors.background === '#111827';

  const showDegreeSelector = user?.role === 'ADMIN' || (user?.isUGCoordinator && user?.isPGCoordinator);

  useEffect(() => {
    if (user?.role === 'FACULTY') {
      if (user?.isUGCoordinator && !user?.isPGCoordinator && selectedDegree !== 'UG') {
        setSelectedDegree('UG');
      } else if (!user?.isUGCoordinator && user?.isPGCoordinator && selectedDegree !== 'PG') {
        setSelectedDegree('PG');
      }
    }
  }, [user, selectedDegree, setSelectedDegree]);

  const [deadlines, setDeadlines] = useState<{
    teamFormationDeadline: Date | null;
    projectRequestDeadline: Date | null;
    meetingSchedulingDeadline: Date | null;
  }>({
    teamFormationDeadline: null,
    projectRequestDeadline: null,
    meetingSchedulingDeadline: null,
  });

  const [showPicker, setShowPicker] = useState<keyof Deadlines | null>(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [emailLoading, setEmailLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchDeadlines();
  }, [selectedDegree]);

  const formatDateForFrontend = (date: Date | null) => {
    if (!date) return 'Not set';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateForBackend = (date: Date | null) => {
    if (!date) return null;
    // Format to ISO string for backend
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T23:59:59`;
  };

  const fetchDeadlines = async () => {
    setFetching(true);
    try {
      const data = await coordinatorApi.getDeadlines(selectedDegree);
      setDeadlines({
        teamFormationDeadline: data.teamFormationDeadline ? new Date(data.teamFormationDeadline) : null,
        projectRequestDeadline: data.projectRequestDeadline ? new Date(data.projectRequestDeadline) : null,
        meetingSchedulingDeadline: data.meetingSchedulingDeadline ? new Date(data.meetingSchedulingDeadline) : null,
      });
    } catch (error: any) {
      console.log('Error fetching deadlines', error);
      showAlert('Error', error.message || 'Failed to fetch deadlines');
    } finally {
      setFetching(false);
    }
  };

  // Simple date validation: DD/MM/YYYY
  const isValidDate = (value: string) => {
    if (!value) return true; // Optional logic: let API decide or allow empty (to clear)
    const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
    if (!regex.test(value)) return false;
    const [, day, month, year] = value.match(regex)!;
    const d = new Date(Number(year), Number(month) - 1, Number(day));
    return (
      d.getFullYear() === Number(year) &&
      d.getMonth() === Number(month) - 1 &&
      d.getDate() === Number(day)
    );
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    const now = new Date();
    now.setHours(0, 0, 0, 0); // Start of today for comparison

    if (deadlines.teamFormationDeadline && deadlines.teamFormationDeadline < now) {
      newErrors.teamFormationDeadline = 'Deadline cannot be in the past';
    }
    if (deadlines.projectRequestDeadline && deadlines.projectRequestDeadline < now) {
      newErrors.projectRequestDeadline = 'Deadline cannot be in the past';
    }
    if (deadlines.meetingSchedulingDeadline && deadlines.meetingSchedulingDeadline < now) {
      newErrors.meetingSchedulingDeadline = 'Deadline cannot be in the past';
    }

    return newErrors;
  };

  const handleSave = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        teamFormationDeadline: formatDateForBackend(deadlines.teamFormationDeadline),
        projectRequestDeadline: formatDateForBackend(deadlines.projectRequestDeadline),
        meetingSchedulingDeadline: formatDateForBackend(deadlines.meetingSchedulingDeadline),
      };

      await coordinatorApi.saveDeadlines(payload, selectedDegree);

      showAlert(
        '✅ Deadlines Updated',
        `Deadlines for ${selectedDegree} have been successfully updated.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      showAlert('Error', error.message || 'Failed to save deadlines');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmails = async () => {
    setEmailLoading(true);
    try {
      const response = await coordinatorApi.sendDepartmentDeadlineEmail(selectedDegree);
      showAlert('✅ Success', response.message || 'Emails sent successfully.');
    } catch (error: any) {
      showAlert('❌ Error', error.message || 'Failed to send emails. Make sure there are deadlines configured.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleChange = (field: keyof Deadlines, value: string) => {
    // Auto-insert slashes for DD/MM/YYYY
    let formatted = value.replace(/[^0-9]/g, '');
    if (formatted.length >= 3 && formatted.length <= 4) {
      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
    } else if (formatted.length >= 5) {
      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4) + '/' + formatted.slice(4, 8);
    }

    setDeadlines(prev => ({ ...prev, [field]: formatted }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (fetching) {
    return (
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Image
            source={isDark ? require('../assets/angle-white.png') : require('../assets/angle.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 8 }}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            Deadlines ({selectedDegree})
          </Text>
        </View>
        {showDegreeSelector && <DegreeSelector />}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* Team Formation & Projects */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.subText }]}>Students phase</Text>

          <DeadlineField
            label="Team Formation Deadline"
            value={formatDateForFrontend(deadlines.teamFormationDeadline)}
            onPress={() => setShowPicker('teamFormationDeadline')}
            error={errors.teamFormationDeadline}
            description="Last date for students to form their project teams"
            colors={colors}
          />

          <DeadlineField
            label="Project Request Deadline"
            value={formatDateForFrontend(deadlines.projectRequestDeadline)}
            onPress={() => setShowPicker('projectRequestDeadline')}
            error={errors.projectRequestDeadline}
            description="Last date for teams to send faculty allocation requests"
            colors={colors}
          />
        </View>

        {/* Faculty phase */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.subText }]}>Faculty Phase</Text>

          <DeadlineField
            label="Meeting Scheduling Deadline"
            value={formatDateForFrontend(deadlines.meetingSchedulingDeadline)}
            onPress={() => setShowPicker('meetingSchedulingDeadline')}
            error={errors.meetingSchedulingDeadline}
            description="Latest possible date to schedule a meeting with a student"
            colors={colors}
          />
        </View>

        {showPicker && (
          <DateTimePicker
            value={deadlines[showPicker] || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            minimumDate={new Date()}
            onChange={(_, date) => {
              setShowPicker(null);
              if (date) {
                setDeadlines(prev => ({ ...prev, [showPicker]: date }));
                if (errors[showPicker]) {
                  setErrors(prev => ({ ...prev, [showPicker]: '' }));
                }
              }
            }}
          />
        )}

        {/* Action Buttons */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSave}
          disabled={loading || emailLoading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>Save Deadlines</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.emailBtn, emailLoading && styles.submitBtnDisabled]}
          onPress={handleSendEmails}
          disabled={loading || emailLoading}
          activeOpacity={0.85}
        >
          {emailLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>Broadcast Deadlines (Email)</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>

      {/* Bottom Tab */}
      <View style={[styles.bottomTab, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        <TouchableOpacity
          style={styles.bottomTabItem}
          onPress={() => navigation.navigate('FacultyCoordinatorDashboard')}
        >
          <Image
            source={isDark ? require('../assets/home-white.png') : require('../assets/home.png')}
            style={styles.bottomTabIcon}
          />
          <Text style={[styles.bottomTabLabel, { color: colors.subText }]}>Home</Text>
        </TouchableOpacity>

        <View style={styles.bottomTabItem}>
          <Image source={require('../assets/dd-color.png')} style={styles.bottomTabIcon} />
          <Text style={[styles.bottomTabLabelActive, { color: colors.primary }]}>Deadlines</Text>
        </View>

        <TouchableOpacity
          style={styles.bottomTabItem}
          onPress={() => navigation.navigate('FacultyCoordinatorMore')}
        >
          <Image
            source={isDark ? require('../assets/more-white.png') : require('../assets/more.png')}
            style={styles.bottomTabIcon}
          />
          <Text style={[styles.bottomTabLabel, { color: colors.subText }]}>More</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

/* =======================
   DEADLINE FIELD COMPONENT
   ======================= */

const DeadlineField = ({
  label,
  value,
  onPress,
  error,
  description,
  colors,
}: {
  label: string;
  value: string;
  onPress: () => void;
  error?: string;
  description?: string;
  colors: any;
}) => {
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={[fieldStyles.label, { color: colors.text }]}>{label}</Text>
      <TouchableOpacity
        style={[
          fieldStyles.inputRow,
          { backgroundColor: colors.background, borderColor: colors.border },
          error ? fieldStyles.inputRowError : null
        ]}
        onPress={onPress}
      >
        <Text style={[fieldStyles.input, { color: colors.text }, value === 'Not set' ? { color: '#9CA3AF' } : null]}>
          {value}
        </Text>
        <Image
          source={require('../assets/deadlines/calendar.png')}
          style={{ width: 18, height: 18, tintColor: colors.primary }}
        />
      </TouchableOpacity>
      {description && !error && (
        <Text style={[fieldStyles.description, { color: colors.subText }]}>{description}</Text>
      )}
      {error ? <Text style={fieldStyles.errorText}>{error}</Text> : null}
    </View>
  );
};

/* =======================
   STYLES
   ======================= */

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backIcon: { width: 22, height: 22, resizeMode: 'contain' },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  submitBtnDisabled: {
    backgroundColor: '#93C5FD',
    shadowOpacity: 0,
  },
  emailBtn: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#10B981',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  bottomTab: {
    height: 60,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  bottomTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  bottomTabIcon: {
    width: 22,
    height: 22,
    marginBottom: 4,
    resizeMode: 'contain',
  },
  bottomTabLabel: {
    fontSize: 12,
  },
  bottomTabLabelActive: {
    fontSize: 12,
    fontWeight: '700',
  },
});

const fieldStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  inputRowError: {
    borderColor: '#DC2626',
    backgroundColor: '#FEF2F2',
  },
  input: {
    flex: 1,
    paddingVertical: 11,
    fontSize: 14,
  },
  description: {
    fontSize: 11,
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
});

export default ChangeDeadlinesScreen;