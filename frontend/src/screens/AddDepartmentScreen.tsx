import React, { useState, useContext } from 'react';
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
import { ThemeContext } from '../theme/ThemeContext';

const AddDepartmentScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { colors } = useContext(ThemeContext);

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
    if (form.hodEmail && !/\S+@\S+\.\S+/.test(form.hodEmail))
      newErrors.hodEmail = 'Enter a valid email address';
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
        'Department Created',
        `"${form.name}" has been successfully added.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    }, 1200);
  };

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image
            source={require('../assets/angle.png')}
            style={styles.backIcon}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Add Department</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">

        {/* Basic Info */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.subText }]}>Basic Information</Text>

          <Field
            label="Department Name *"
            placeholder="e.g. Computer Science & Engineering"
            value={form.name}
            onChangeText={v => handleChange('name', v)}
            error={errors.name}
            colors={colors}
          />

          <Field
            label="Department Code *"
            placeholder="e.g. CSE"
            value={form.code}
            onChangeText={v => handleChange('code', v.toUpperCase())}
            error={errors.code}
            autoCapitalize="characters"
            colors={colors}
          />

          <Field
            label="Institute Name *"
            placeholder="e.g. National Institute of Technology"
            value={form.institute}
            onChangeText={v => handleChange('institute', v)}
            error={errors.institute}
            colors={colors}
          />
        </View>

        {/* HOD Details */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.subText }]}>Head of Department</Text>

          <Field
            label="HOD Name"
            placeholder="e.g. Dr. John Smith"
            value={form.hodName}
            onChangeText={v => handleChange('hodName', v)}
            colors={colors}
          />

          <Field
            label="HOD Email"
            placeholder="hod@institute.edu"
            value={form.hodEmail}
            onChangeText={v => handleChange('hodEmail', v)}
            error={errors.hodEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            colors={colors}
          />

          <Field
            label="HOD Phone"
            placeholder="+91 XXXXX XXXXX"
            value={form.phone}
            onChangeText={v => handleChange('phone', v)}
            keyboardType="phone-pad"
            colors={colors}
          />
        </View>

        {/* Additional Info */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.subText }]}>Additional Info</Text>

          <Field
            label="Description"
            placeholder="Brief description of the department..."
            value={form.description}
            onChangeText={v => handleChange('description', v)}
            multiline
            colors={colors}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: colors.primary },
            loading && styles.submitBtnDisabled
          ]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color={colors.card} />
          ) : (
            <Text style={[styles.submitText, { color: colors.card }]}>
              Create Department
            </Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

/* FIELD COMPONENT */

const Field = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  multiline = false,
  keyboardType = 'default',
  autoCapitalize = 'words',
  colors,
}: any) => (
  <View style={fieldStyles.wrapper}>
    <Text style={[fieldStyles.label, { color: colors.text }]}>{label}</Text>

    <TextInput
      style={[
        fieldStyles.input,
        multiline && fieldStyles.multiline,
        {
          backgroundColor: colors.background,
          borderColor: error ? colors.error : colors.border,
          color: colors.text
        },
      ]}
      placeholder={placeholder}
      placeholderTextColor={colors.subText}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
      keyboardType={keyboardType}
      autoCapitalize={autoCapitalize}
    />

    {error ? <Text style={[fieldStyles.errorText, { color: colors.error }]}>{error}</Text> : null}
  </View>
);

/* STYLES */

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
  },
  backIcon: { width: 22, height: 22, resizeMode: 'contain' },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  submitBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitText: {
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
    marginBottom: 6,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 14,
    borderWidth: 1,
  },
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default AddDepartmentScreen;