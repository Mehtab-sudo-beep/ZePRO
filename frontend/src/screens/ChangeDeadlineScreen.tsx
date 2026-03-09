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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

interface Deadlines {
  formTeam: string;
  sendRequest: string;
  midtermEvaluation: string;
  finalEvaluation: string;
}

const ChangeDeadlinesScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [deadlines, setDeadlines] = useState<Deadlines>({
    formTeam: '',
    sendRequest: '',
    midtermEvaluation: '',
    finalEvaluation: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Simple date validation: DD/MM/YYYY
  const isValidDate = (value: string) => {
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
      { key: 'formTeam', label: 'Form Team Deadline' },
      { key: 'sendRequest', label: 'Send Request Deadline' },
      { key: 'midtermEvaluation', label: 'Midterm Evaluation Deadline' },
      { key: 'finalEvaluation', label: 'Final Evaluation Deadline' },
    ];

    fields.forEach(({ key, label }) => {
      if (!deadlines[key].trim()) {
        newErrors[key] = `${label} is required`;
      } else if (!isValidDate(deadlines[key])) {
        newErrors[key] = 'Enter a valid date in DD/MM/YYYY format';
      }
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

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        '✅ Deadlines Updated',
        'All deadlines have been successfully updated.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1200);
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

        {/* Team Formation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Team & Request Deadlines</Text>

          <DeadlineField
            label="Form Team Deadline *"
            placeholder="DD/MM/YYYY"
            value={deadlines.formTeam}
            onChangeText={v => handleChange('formTeam', v)}
            error={errors.formTeam}
            description="Last date for students to form their project teams"
          />

          <DeadlineField
            label="Send Request Deadline *"
            placeholder="DD/MM/YYYY"
            value={deadlines.sendRequest}
            onChangeText={v => handleChange('sendRequest', v)}
            error={errors.sendRequest}
            description="Last date for teams to send faculty allocation requests"
          />
        </View>

        {/* Evaluation */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Evaluation Deadlines</Text>

          <DeadlineField
            label="Midterm Evaluation Deadline *"
            placeholder="DD/MM/YYYY"
            value={deadlines.midtermEvaluation}
            onChangeText={v => handleChange('midtermEvaluation', v)}
            error={errors.midtermEvaluation}
            description="Date of midterm project evaluation"
          />

          <DeadlineField
            label="Final Evaluation Deadline *"
            placeholder="DD/MM/YYYY"
            value={deadlines.finalEvaluation}
            onChangeText={v => handleChange('finalEvaluation', v)}
            error={errors.finalEvaluation}
            description="Date of final project evaluation and submission"
          />
        </View>

        {/* Current Deadlines Summary */}
        {Object.values(deadlines).some(v => v.length === 10) && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Deadline Summary</Text>
            {deadlines.formTeam.length === 10 && (
              <SummaryRow label="Form Team" value={deadlines.formTeam} />
            )}
            {deadlines.sendRequest.length === 10 && (
              <SummaryRow label="Send Request" value={deadlines.sendRequest} />
            )}
            {deadlines.midtermEvaluation.length === 10 && (
              <SummaryRow label="Midterm Evaluation" value={deadlines.midtermEvaluation} />
            )}
            {deadlines.finalEvaluation.length === 10 && (
              <SummaryRow label="Final Evaluation" value={deadlines.finalEvaluation} />
            )}
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>Update Deadlines</Text>
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
  placeholder,
  value,
  onChangeText,
  error,
  description,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  description?: string;
}) => {
  const { TextInput } = require('react-native');
  return (
    <View style={fieldStyles.wrapper}>
      <Text style={fieldStyles.label}>{label}</Text>
      <View style={[fieldStyles.inputRow, error ? fieldStyles.inputRowError : null]}>
        
        <TextInput
          style={fieldStyles.input}
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          maxLength={10}
        />
      </View>
      {description && !error && (
        <Text style={fieldStyles.description}>{description}</Text>
      )}
      {error ? <Text style={fieldStyles.errorText}>{error}</Text> : null}
    </View>
  );
};

/* =======================
   SUMMARY ROW COMPONENT
   ======================= */

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
  backArrow: {
    fontSize: 22,
    color: '#FFFFFF',
  },
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
  summaryCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5',
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4F46E5',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
  calendarIcon: {
    fontSize: 16,
    marginRight: 8,
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

const summaryStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#C7D2FE',
  },
  label: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
  },
  value: {
    fontSize: 13,
    color: '#4F46E5',
    fontWeight: '700',
  },
});

export default ChangeDeadlinesScreen;