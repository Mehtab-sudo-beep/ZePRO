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
import { useNavigation, RouteProp, useRoute } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/AppNavigator';
import { addDepartment } from '../api/departmentApi';

type RouteP = RouteProp<RootStackParamList, 'AddDepartment'>;

/* ✅ FIELD PROPS TYPE (FIXES ERROR) */
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

  const { instituteName, instituteId } = route.params;

  const [form, setForm] = useState({
    name: '',
    code: '',
    institute: instituteName,
    coordinatorName: '',
    coordinatorEmail: '',
    coordinatorPhone: '',
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

    if (
      form.coordinatorEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.coordinatorEmail)
    ) {
      newErrors.coordinatorEmail = 'Enter a valid email';
    }

    if (
      form.coordinatorPhone &&
      !/^\d{10}$/.test(form.coordinatorPhone)
    ) {
      newErrors.coordinatorPhone = 'Enter valid 10-digit phone number';
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);

    try {
      const payload = {
        departmentName: form.name,
        instituteId: Number(instituteId),
        departmentCode: form.code,
        description: form.description || '',
        coordinatorName: form.coordinatorName,
        coordinatorEmail: form.coordinatorEmail,
        coordinatorPhone: form.coordinatorPhone,
      };

      console.log('[AddDepartment] 📤 Sending:', payload);

      await addDepartment(payload);

      console.log('[AddDepartment] ✅ Success');

      Alert.alert(
        '✅ Department Created',
        `"${form.name}" has been successfully added.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      console.log('[AddDepartment] 💥 ERROR:', err?.response?.data || err.message);
      Alert.alert('Error', 'Failed to create department. Please try again.');
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
            source={require('../assets/angle.png')}
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

        {/* FACULTY COORDINATOR */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Faculty Coordinator</Text>

          <Field
            label="Coordinator Name"
            placeholder="e.g. Dr. John"
            value={form.coordinatorName}
            onChangeText={(v: string) => handleChange('coordinatorName', v)}
          />

          <Field
            label="Coordinator Email"
            placeholder="email@college.com"
            value={form.coordinatorEmail}
            onChangeText={(v: string) => handleChange('coordinatorEmail', v)}
            error={errors.coordinatorEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Field
            label="Coordinator Phone"
            placeholder="10-digit number"
            value={form.coordinatorPhone}
            onChangeText={(v: string) => handleChange('coordinatorPhone', v)}
            error={errors.coordinatorPhone}
            keyboardType="number-pad"
          />
        </View>

        {/* DESCRIPTION */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Info</Text>

          <Field
            label="Description"
            placeholder="Department details..."
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
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Create Department</Text>
          )}
        </TouchableOpacity>
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
        !editable && { backgroundColor: '#E5E7EB' },
      ]}
      placeholder={placeholder}
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
  },
  backBtn: { width: 40 },
  backIcon: { width: 22, height: 22 },
  headerTitle: { fontSize: 17, fontWeight: '700' },
  scrollContent: { padding: 16 },
  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 10,
    color: '#6B7280',
  },
  submitBtn: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitBtnDisabled: { backgroundColor: '#93C5FD' },
  submitText: { color: '#fff', fontWeight: '700' },
});

const fieldStyles = StyleSheet.create({
  wrapper: { marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600' },
  input: {
    backgroundColor: '#F3F4F6',
    padding: 10,
    borderRadius: 8,
    marginTop: 4,
  },
  multiline: { height: 80 },
  inputError: { borderColor: 'red', borderWidth: 1 },
  errorText: { color: 'red', fontSize: 12 },
});