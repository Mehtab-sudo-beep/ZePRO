import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { ThemeContext } from '../theme/ThemeContext';
import { AlertContext } from '../context/AlertContext';  // ✅ ADD THIS
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAllInstitutes,
  getDepartmentsByInstitute,
  completeStudentProfile,
} from '../api/studentApi';

type Props = NativeStackScreenProps<RootStackParamList, 'CompleteProfile'>;

// ── Reusable Picker Modal ────────────────────────────────────────────────────
const PickerModal = ({
  visible,
  title,
  items,
  labelKey,
  onSelect,
  onClose,
  colors,
}: {
  visible: boolean;
  title: string;
  items: any[];
  labelKey: string;
  onSelect: (item: any) => void;
  onClose: () => void;
  colors: any;
}) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={pickerStyles.overlay}>
      <View style={[pickerStyles.sheet, { backgroundColor: colors.card }]}>
        <View style={pickerStyles.handle} />
        <Text style={[pickerStyles.title, { color: colors.text }]}>{title}</Text>
        <FlatList
          data={items}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[pickerStyles.item, { borderBottomColor: colors.border }]}
              onPress={() => {
                onSelect(item);
                onClose();
              }}
            >
              <Text style={[pickerStyles.itemText, { color: colors.text }]}>
                {item[labelKey]}
              </Text>
              {item.code && (
                <Text style={[pickerStyles.itemCode, { color: colors.subText }]}>
                  {item.code}
                </Text>
              )}
            </TouchableOpacity>
          )}
        />
        <TouchableOpacity
          style={[pickerStyles.cancelBtn, { borderColor: colors.border }]}
          onPress={onClose}
        >
          <Text style={{ color: colors.subText, fontWeight: '600' }}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

const pickerStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  item: {
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemText: { fontSize: 15 },
  itemCode: { fontSize: 12 },
  cancelBtn: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
});

// ── Year options ──────────────────────────────────────────────────────────────
const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];

// ── Main Screen ───────────────────────────────────────────────────────────────
const CompleteProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useContext(ThemeContext);
  const { showAlert } = useContext(AlertContext);  // ✅ ADD THIS

  // Form fields
  const [rollNumber, setRollNumber] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [year, setYear] = useState('');
  const [resumeLink, setResumeLink] = useState('');
  const [marksheetLink, setMarksheetLink] = useState('');

  // Institute / Department
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedInstitute, setSelectedInstitute] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

  // Modal visibility
  const [showInstitutePicker, setShowInstitutePicker] = useState(false);
  const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // UI state
  const [loadingInstitutes, setLoadingInstitutes] = useState(true);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Load institutes on mount
  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const res = await getAllInstitutes();
        setInstitutes(res.data);  // ✅ EXTRACT .data
      } catch (e: any) {
        console.log('ERROR LOADING INSTITUTES:', e);
        showAlert(
          'Error',
          'Failed to load institutes. Please try again.',
          [{ text: 'OK' }]
        );
      } finally {
        setLoadingInstitutes(false);
      }
    };
    fetchInstitutes();
  }, [showAlert]);

  // Load departments when institute changes
  useEffect(() => {
    if (!selectedInstitute) return;
    const fetchDepts = async () => {
      setLoadingDepts(true);
      setSelectedDepartment(null);
      setDepartments([]);
      try {
        const res = await getDepartmentsByInstitute(selectedInstitute.instituteId);
        setDepartments(res.data);  // ✅ EXTRACT .data
      } catch (e: any) {
        console.log('ERROR LOADING DEPARTMENTS:', e);
        showAlert('Error', 'Failed to load departments.', [{ text: 'OK' }]);
      } finally {
        setLoadingDepts(false);
      }
    };
    fetchDepts();
  }, [selectedInstitute, showAlert]);

  const validate = (): string | null => {
    if (!rollNumber.trim()) return 'Roll number is required.';
    const cgpaNum = parseFloat(cgpa);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10)
      return 'CGPA must be a number between 0 and 10.';
    if (!year) return 'Please select your year of study.';
    if (!selectedInstitute) return 'Please select your institute.';
    if (!selectedDepartment) return 'Please select your department.';
    if (!resumeLink.trim()) return 'Resume link is required.';
    if (!marksheetLink.trim()) return 'Marksheet link is required.';
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      showAlert('Validation Error', validationError, [{ text: 'OK' }]);
      return;
    }

    setSubmitting(true);
    try {
      const studentId = await AsyncStorage.getItem('studentId');
      if (!studentId) throw new Error('Student ID not found. Please log in again.');

      const res = await completeStudentProfile(Number(studentId), {
        rollNumber: rollNumber.trim(),
        cgpa: parseFloat(cgpa),
        year,
        instituteId: selectedInstitute.instituteId,
        departmentId: selectedDepartment.departmentId,
        resumeLink: resumeLink.trim(),
        marksheetLink: marksheetLink.trim(),
      });

      console.log('PROFILE COMPLETED:', res);

      // ✅ SHOW SUCCESS ALERT AND NAVIGATE
      showAlert('Success', 'Your profile has been completed!', [
        {
          text: 'OK',
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: 'StudentHome' }],
            });
          },
        },
      ]);
    } catch (e: any) {
      console.log('SUBMIT ERROR:', e);
      const errorMsg =
        e?.response?.data?.error || e?.message || 'Something went wrong. Please try again.';
      showAlert('Error', errorMsg, [{ text: 'OK' }]);
    } finally {
      setSubmitting(false);
    }
  };

  const accentSoft = colors.primary + '18';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerBlock}>
          <View style={[styles.badgeIcon, { backgroundColor: accentSoft }]}>
            <Text style={{ fontSize: 26 }}>📋</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Complete Your Profile
          </Text>
          <Text style={[styles.subtitle, { color: colors.subText }]}>
            A few details are missing. Please fill in the information below to continue using ZePRO.
          </Text>
        </View>

        {/* ── Section: Academic Info ── */}
        <Text style={[styles.sectionLabel, { color: colors.subText }]}>ACADEMIC INFO</Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Roll Number */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Roll Number *</Text>
            <TextInput
              value={rollNumber}
              onChangeText={setRollNumber}
              placeholder="e.g. CS21B1042"
              placeholderTextColor={colors.subText}
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              autoCapitalize="characters"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* CGPA */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>CGPA *</Text>
            <TextInput
              value={cgpa}
              onChangeText={setCgpa}
              placeholder="e.g. 8.5"
              placeholderTextColor={colors.subText}
              keyboardType="decimal-pad"
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Year */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Year of Study *</Text>
            <TouchableOpacity
              style={[styles.selector, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={() => setShowYearPicker(true)}
            >
              <Text style={[styles.selectorText, { color: year ? colors.text : colors.subText }]}>
                {year || 'Select year'}
              </Text>
              <Text style={{ color: colors.subText, fontSize: 18 }}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Section: Institute & Department ── */}
        <Text style={[styles.sectionLabel, { color: colors.subText }]}>INSTITUTE & DEPARTMENT</Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Institute */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Institute *</Text>
            {loadingInstitutes ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 8 }} />
            ) : (
              <TouchableOpacity
                style={[styles.selector, { borderColor: colors.border, backgroundColor: colors.background }]}
                onPress={() => setShowInstitutePicker(true)}
              >
                <Text style={[styles.selectorText, { color: selectedInstitute ? colors.text : colors.subText }]}>
                  {selectedInstitute ? selectedInstitute.instituteName : 'Select institute'}
                </Text>
                <Text style={{ color: colors.subText, fontSize: 18 }}>›</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Department */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Department *</Text>
            {loadingDepts ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 8 }} />
            ) : (
              <TouchableOpacity
                style={[
                  styles.selector,
                  {
                    borderColor: colors.border,
                    backgroundColor: colors.background,
                    opacity: !selectedInstitute ? 0.5 : 1,
                  },
                ]}
                onPress={() => selectedInstitute && setShowDepartmentPicker(true)}
                disabled={!selectedInstitute}
              >
                <Text style={[styles.selectorText, { color: selectedDepartment ? colors.text : colors.subText }]}>
                  {selectedDepartment
                    ? selectedDepartment.departmentName
                    : selectedInstitute
                    ? 'Select department'
                    : 'Select institute first'}
                </Text>
                <Text style={{ color: colors.subText, fontSize: 18 }}>›</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Section: Documents ── */}
        <Text style={[styles.sectionLabel, { color: colors.subText }]}>DOCUMENT LINKS</Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Resume */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Resume Link *</Text>
            <TextInput
              value={resumeLink}
              onChangeText={setResumeLink}
              placeholder="https://drive.google.com/..."
              placeholderTextColor={colors.subText}
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              autoCapitalize="none"
              keyboardType="url"
            />
            <Text style={[styles.hint, { color: colors.subText }]}>
              Paste a publicly accessible link (Google Drive, Dropbox, etc.)
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Marksheet */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Marksheet Link *</Text>
            <TextInput
              value={marksheetLink}
              onChangeText={setMarksheetLink}
              placeholder="https://drive.google.com/..."
              placeholderTextColor={colors.subText}
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              autoCapitalize="none"
              keyboardType="url"
            />
            <Text style={[styles.hint, { color: colors.subText }]}>
              Share your latest semester marksheet
            </Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary, opacity: submitting ? 0.75 : 1 }]}
          onPress={handleSubmit}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitText}>Save & Continue →</Text>
          )}
        </TouchableOpacity>

        <Text style={[styles.footerNote, { color: colors.subText }]}>
          You can update these details later from your profile settings.
        </Text>
      </ScrollView>

      {/* Institute Picker Modal */}
      <PickerModal
        visible={showInstitutePicker}
        title="Select Institute"
        items={institutes.map(i => ({ ...i, code: i.instituteCode }))}
        labelKey="instituteName"
        onSelect={item => setSelectedInstitute(item)}
        onClose={() => setShowInstitutePicker(false)}
        colors={colors}
      />

      {/* Department Picker Modal */}
      <PickerModal
        visible={showDepartmentPicker}
        title="Select Department"
        items={departments.map(d => ({ ...d, code: d.departmentCode }))}
        labelKey="departmentName"
        onSelect={item => setSelectedDepartment(item)}
        onClose={() => setShowDepartmentPicker(false)}
        colors={colors}
      />

      {/* Year Picker Modal */}
      <Modal visible={showYearPicker} transparent animationType="slide">
        <View style={pickerStyles.overlay}>
          <View style={[pickerStyles.sheet, { backgroundColor: colors.card }]}>
            <View style={pickerStyles.handle} />
            <Text style={[pickerStyles.title, { color: colors.text }]}>Select Year</Text>
            {YEAR_OPTIONS.map(y => (
              <TouchableOpacity
                key={y}
                style={[pickerStyles.item, { borderBottomColor: colors.border }]}
                onPress={() => {
                  setYear(y);
                  setShowYearPicker(false);
                }}
              >
                <Text style={[pickerStyles.itemText, { color: colors.text }]}>{y}</Text>
                {year === y && <Text style={{ color: colors.primary, fontWeight: '700' }}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[pickerStyles.cancelBtn, { borderColor: colors.border }]}
              onPress={() => setShowYearPicker(false)}
            >
              <Text style={{ color: colors.subText, fontWeight: '600' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default CompleteProfileScreen;

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },

  headerBlock: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },

  badgeIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },

  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.4,
    textAlign: 'center',
  },

  subtitle: {
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 10,
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
    marginTop: 4,
    marginLeft: 2,
  },

  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },

  fieldWrap: {
    padding: 14,
  },

  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
    marginBottom: 8,
  },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },

  selector: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  selectorText: {
    fontSize: 14,
    flex: 1,
  },

  hint: {
    fontSize: 11,
    marginTop: 6,
    lineHeight: 16,
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    marginHorizontal: 14,
  },

  submitBtn: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },

  submitText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  footerNote: {
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});