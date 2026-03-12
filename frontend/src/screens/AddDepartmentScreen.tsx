import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const AddDepartmentScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [form, setForm] = useState({
    name: '',
    code: '',
    institute: '',
    hodName: '',
    hodEmail: '',
    phone: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = 'Department name is required';
    if (!form.code.trim()) newErrors.code = 'Department code is required';
    if (!form.institute.trim()) newErrors.institute = 'Institute name is required';
    if (form.hodEmail && !/@gmail\.com$/i.test(form.hodEmail.trim()))
      newErrors.hodEmail = 'Only Gmail addresses are accepted';

    // Phone validation: only digits, must be exactly 10
    if (form.phone.trim()) {
      const digits = form.phone.replace(/\D/g, '');
      if (digits.length !== 10) {
        newErrors.phone = 'Phone number must be exactly 10 digits';
      }
    }

    return newErrors;
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      Alert.alert(
        '✅ Department Created',
        `"${form.name}" has been successfully added.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    }, 1200);
  };

  const handleChange = (field: string, value: string) => {
    // For phone: only allow digits, max 10
    if (field === 'phone') {
      const digits = value.replace(/\D/g, '').slice(0, 10);
      setForm(prev => ({ ...prev, phone: digits }));
      if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
      return;
    }
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image source={require('../assets/angle.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Department</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Field
            label="Department Name *"
            placeholder="e.g. Computer Science & Engineering"
            value={form.name}
            onChangeText={v => handleChange('name', v)}
            error={errors.name}
          />

          <Field
            label="Department Code *"
            placeholder="e.g. CSE"
            value={form.code}
            onChangeText={v => handleChange('code', v.toUpperCase())}
            error={errors.code}
            autoCapitalize="characters"
          />

          <Field
            label="Institute Name *"
            placeholder="e.g. National Institute of Technology"
            value={form.institute}
            onChangeText={v => handleChange('institute', v)}
            error={errors.institute}
          />
        </View>

        {/* HOD Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Head of Department</Text>

          <Field
            label="HOD Name"
            placeholder="e.g. Dr. John Smith"
            value={form.hodName}
            onChangeText={v => handleChange('hodName', v)}
          />

          <Field
            label="HOD Email"
            placeholder="hod@gmail.com"
            value={form.hodEmail}
            onChangeText={v => handleChange('hodEmail', v)}
            error={errors.hodEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          {/* Phone with digit counter */}
          <View style={fieldStyles.wrapper}>
            <View style={fieldStyles.labelRow}>
              <Text style={fieldStyles.label}>HOD Phone</Text>
              <Text style={[
                fieldStyles.counter,
                form.phone.length === 10 && fieldStyles.counterDone,
              ]}>
                {form.phone.length}/10
              </Text>
            </View>
            <TextInput
              style={[
                fieldStyles.input,
                errors.phone ? fieldStyles.inputError : null,
                form.phone.length === 10 && !errors.phone ? fieldStyles.inputSuccess : null,
              ]}
              placeholder="+91 XXXXX XXXXX"
              placeholderTextColor="#9CA3AF"
              value={form.phone}
              onChangeText={v => handleChange('phone', v)}
              keyboardType="phone-pad"
              maxLength={10}
            />
            {errors.phone
              ? <Text style={fieldStyles.errorText}>{errors.phone}</Text>
              : form.phone.length === 10
              ? <Text style={fieldStyles.successText}>✓ Valid phone number</Text>
              : form.phone.length > 0
              ? <Text style={fieldStyles.hintText}>{10 - form.phone.length} more digit{10 - form.phone.length !== 1 ? 's' : ''} needed</Text>
              : null
            }
          </View>
        </View>

        {/* Additional Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Info</Text>

          <Field
            label="Description"
            placeholder="Brief description of the department..."
            value={form.description}
            onChangeText={v => handleChange('description', v)}
            multiline
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitText}>Create Department</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

/* =======================
   FIELD COMPONENT
   ======================= */
const Field = ({
  label, placeholder, value, onChangeText, error,
  multiline = false, keyboardType = 'default', autoCapitalize = 'words',
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  error?: string;
  multiline?: boolean;
  keyboardType?: any;
  autoCapitalize?: any;
}) => (
  <View style={fieldStyles.wrapper}>
    <Text style={fieldStyles.label}>{label}</Text>
    <TextInput
      style={[
        fieldStyles.input,
        multiline && fieldStyles.multiline,
        error ? fieldStyles.inputError : null,
      ]}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
    />
    {error ? <Text style={fieldStyles.errorText}>{error}</Text> : null}
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
  backArrow: { fontSize: 22, color: '#FFFFFF' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: '#100f0f' },
  scrollContent: { padding: 16 },
  section: {
    backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  backIcon: { width: 22, height: 22, resizeMode: 'contain' },
  sectionTitle: {
    fontSize: 12, fontWeight: '700', color: '#6B7280',
    textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 12,
  },
  submitBtn: {
    backgroundColor: '#2563EB', borderRadius: 12, paddingVertical: 16,
    alignItems: 'center', marginTop: 8,
    shadowColor: '#2563EB', shadowOpacity: 0.3, shadowRadius: 10, elevation: 4,
  },
  submitBtnDisabled: { backgroundColor: '#93C5FD', shadowOpacity: 0 },
  submitText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151' },
  counter: { fontSize: 12, fontWeight: '600', color: '#9CA3AF' },
  counterDone: { color: '#059669' },
  input: {
    backgroundColor: '#F3F4F6', borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 11,
    fontSize: 14, color: '#111827',
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  multiline: { minHeight: 80, textAlignVertical: 'top' },
  inputError: { borderColor: '#DC2626', backgroundColor: '#FEF2F2' },
  inputSuccess: { borderColor: '#059669', backgroundColor: '#F0FDF4' },
  errorText: { fontSize: 12, color: '#DC2626', marginTop: 4 },
  successText: { fontSize: 12, color: '#059669', marginTop: 4, fontWeight: '600' },
  hintText: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
});

export default AddDepartmentScreen;