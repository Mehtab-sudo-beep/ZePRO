import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { addDepartment } from '../api/departmentApi';
import { AlertContext } from '../context/AlertContext';  // ✅ IMPORT
import { ThemeContext } from '../theme/ThemeContext';  // ✅ IMPORT

type RouteP = RouteProp<RootStackParamList, 'AddDepartment'>;

/* ✅ FIELD PROPS TYPE */
interface FieldProps {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  multiline?: boolean;
  keyboardType?: 'default' | 'email-address' | 'number-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  editable?: boolean;
}

const AddDepartmentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<RouteP>();
  const { showAlert } = useContext(AlertContext);  // ✅ USE CONTEXT
  const { isDarkMode } = useContext(ThemeContext);  // ✅ GET THEME

  // ✅ FIXED: Provide default values
  const { instituteName = '', instituteId = null } = route.params || {};

  const [form, setForm] = useState({
    name: '',
    code: '',
    institute: instituteName,
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* VALIDATION */
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim())
      newErrors.name = 'Department name is required';

    if (!form.code.trim())
      newErrors.code = 'Department code is required';

    return newErrors;
  };

  const handleSubmit = async () => {
    console.log('[AddDepartment] 🚀 Submit started');

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showAlert('Validation Error', 'Please fill in all required fields');
      return;
    }

    // ✅ FIXED: Check if instituteId exists
    if (!instituteId) {
      console.log('[AddDepartment] ❌ Institute ID missing');
      showAlert('Error', 'Institute ID is missing. Please go back and try again.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        departmentName: form.name,
        instituteId: String(instituteId),
        departmentCode: form.code.toUpperCase(),
        description: form.description || '',
      };

      console.log('[AddDepartment] 📤 Sending:', payload);

      const response = await addDepartment(payload);

      console.log('[AddDepartment] ✅ Success:', response.data);

      showAlert(
        'Success',
        `"${form.name}" has been successfully added.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
            style: 'default',
          }
        ]
      );
    } catch (err: any) {
      console.log('[AddDepartment] 💥 ERROR:', err?.response?.data || err.message);
      showAlert(
        'Error',
        err.response?.data?.error || 'Failed to create department. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image
            source={
              isDarkMode
                ? require('../assets/angle-white.png')  // ✅ DARK THEME
                : require('../assets/angle.png')        // ✅ LIGHT THEME
            }
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Add Department</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* BASIC INFO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Field
            label="Department Name *"
            placeholder="e.g. Computer Science"
            value={form.name}
            onChangeText={(v: string) => handleChange('name', v)}
            error={errors.name}
          />

          <Field
            label="Department Code *"
            placeholder="e.g. CSE"
            value={form.code}
            onChangeText={(v: string) => handleChange('code', v.toUpperCase())}
            error={errors.code}
            autoCapitalize="characters"
          />

          <Field
            label="Institute Name"
            placeholder=""
            value={form.institute}
            onChangeText={() => { }}
            editable={false}
          />
        </View>

        {/* DESCRIPTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>

          <Field
            label="Description"
            placeholder="Department details (optional)..."
            value={form.description}
            onChangeText={(v: string) => handleChange('description', v)}
            multiline
          />
        </View>

        {/* SUBMIT */}
        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text style={styles.submitText}>Create Department</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

/* ✅ FIXED FIELD COMPONENT */
const Field: React.FC<FieldProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  multiline = false,
  keyboardType = 'default',
  autoCapitalize = 'words',
  editable = true,
}) => (
  <View style={fieldStyles.wrapper}>
    <Text style={fieldStyles.label}>{label}</Text>
    <TextInput
      style={[
        fieldStyles.input,
        multiline && fieldStyles.multiline,
        error && fieldStyles.inputError,
        !editable && fieldStyles.disabledInput,
      ]}
      placeholder={placeholder}
      placeholderTextColor="#9CA3AF"
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      multiline={multiline}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
    />
    {error && <Text style={fieldStyles.errorText}>{error}</Text>}
  </View>
);

export default AddDepartmentScreen;

/* STYLES */
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backBtn: { width: 40, justifyContent: 'center', alignItems: 'center' },
  backIcon: { width: 22, height: 22, resizeMode: 'contain' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1F2937' },
  scrollContent: { padding: 16, paddingBottom: 40 },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 12,
    color: '#374151',
  },
  submitBtn: {
    backgroundColor: '#4F46E5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
  },
  submitBtnDisabled: { backgroundColor: '#93C5FD' },
  submitText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  input: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 14,
  },
  multiline: { height: 100, textAlignVertical: 'top' },
  inputError: { borderColor: '#ef4444', borderWidth: 1 },
  disabledInput: { backgroundColor: '#E5E7EB', color: '#6B7280' },
  errorText: { color: '#ef4444', fontSize: 12, marginTop: 4 },
});