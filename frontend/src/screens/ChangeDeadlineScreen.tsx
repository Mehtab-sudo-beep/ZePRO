import React, { useState, useEffect } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { coordinatorApi } from '../api/coordinatorApi';

interface Deadlines {
  teamFormationDeadline: string;
  projectRequestDeadline: string;
  meetingSchedulingDeadline: string;
}

const ChangeDeadlinesScreen: React.FC = () => {
  const navigation = useNavigation<any>();

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
  }, []);

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
    try {
      const data = await coordinatorApi.getDeadlines();
      setDeadlines({
        teamFormationDeadline: data.teamFormationDeadline ? new Date(data.teamFormationDeadline) : null,
        projectRequestDeadline: data.projectRequestDeadline ? new Date(data.projectRequestDeadline) : null,
        meetingSchedulingDeadline: data.meetingSchedulingDeadline ? new Date(data.meetingSchedulingDeadline) : null,
      });
    } catch (error: any) {
      console.log('Error fetching deadlines', error);
      Alert.alert('Error', error.message || 'Failed to fetch deadlines');
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
    const fields: { key: keyof Deadlines; label: string }[] = [
      { key: 'teamFormationDeadline', label: 'Team Formation Deadline' },
      { key: 'projectRequestDeadline', label: 'Project Request Deadline' },
      { key: 'meetingSchedulingDeadline', label: 'Meeting Scheduling Deadline' },
    ];

    fields.forEach(({ key, label }) => {
      if (!deadlines[key]) {
        newErrors[key] = `${label} is required`;
      }
    });

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

      await coordinatorApi.saveDeadlines(payload);
      
      Alert.alert(
        '✅ Deadlines Updated',
        'All deadlines have been successfully updated.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save deadlines');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEmails = async () => {
    setEmailLoading(true);
    try {
      const response = await coordinatorApi.sendDepartmentDeadlineEmail();
      Alert.alert('✅ Success', response.message || 'Emails sent successfully.');
    } catch (error: any) {
      Alert.alert('❌ Error', error.message || 'Failed to send emails. Make sure there are deadlines configured.');
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
      <View style={[styles.safeArea, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4F46E5" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image
            source={require('../assets/angle.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Deadline Management</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* Team Formation & Projects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Students phase</Text>

          <DeadlineField
            label="Team Formation Deadline"
            value={formatDateForFrontend(deadlines.teamFormationDeadline)}
            onPress={() => setShowPicker('teamFormationDeadline')}
            error={errors.teamFormationDeadline}
            description="Last date for students to form their project teams"
          />

          <DeadlineField
            label="Project Request Deadline"
            value={formatDateForFrontend(deadlines.projectRequestDeadline)}
            onPress={() => setShowPicker('projectRequestDeadline')}
            error={errors.projectRequestDeadline}
            description="Last date for teams to send faculty allocation requests"
          />
        </View>

        {/* Faculty phase */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Faculty Phase</Text>

          <DeadlineField
            label="Meeting Scheduling Deadline"
            value={formatDateForFrontend(deadlines.meetingSchedulingDeadline)}
            onPress={() => setShowPicker('meetingSchedulingDeadline')}
            error={errors.meetingSchedulingDeadline}
            description="Latest possible date to schedule a meeting with a student"
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
}: {
  label: string;
  value: string;
  onPress: () => void;
  error?: string;
  description?: string;
}) => {
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label}>{label}</Text>
      <TouchableOpacity 
        style={[fieldStyles.inputRow, error ? fieldStyles.inputRowError : null]}
        onPress={onPress}
      >
        <Text style={[fieldStyles.input, value === 'Not set' ? { color: '#9CA3AF' } : null]}>
          {value}
        </Text>
        <Image 
          source={require('../assets/deadlines/calendar.png')} 
          style={{ width: 18, height: 18, tintColor: '#4F46E5' }} 
        />
      </TouchableOpacity>
      {description && !error && (
        <Text style={fieldStyles.description}>{description}</Text>
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
    backgroundColor: '#F9FAFB',
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
    color: '#0c0b0b',
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
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
});

const fieldStyles = StyleSheet.create({
  wrapper: {
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
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
    color: '#111827',
  },
  description: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
  },
});

export default ChangeDeadlinesScreen;