import React, { useState, useEffect, useContext, useRef } from 'react';
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
import { AlertContext } from '../context/AlertContext';
import { AuthContext } from '../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from 'expo-document-picker';
import {
  getProfileStatus,
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
  const { showAlert } = useContext(AlertContext);
  const { setUser } = useContext(AuthContext);

  // ✅ ADD THIS REF TO TRACK MOUNTED STATE
  const isMountedRef = useRef(true);

  // Form fields
  const [phone, setPhone] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [cgpa, setCgpa] = useState('');
  const [year, setYear] = useState('');
  const [resumeFile, setResumeFile] = useState<any>(null);
  const [marksheetFile, setMarksheetFile] = useState<any>(null);

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

  // ✅ ADD THIS USEEFFECT - Track component mount/unmount
  useEffect(() => {
    isMountedRef.current = true;
    console.log('[CompleteProfile] 📱 Component mounted');

    return () => {
      isMountedRef.current = false;
      console.log('[CompleteProfile] 📱 Component unmounted');
    };
  }, []);

  // Load institutes on mount
  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const res = await getAllInstitutes();
        if (isMountedRef.current) {
          setInstitutes(res.data);
          console.log('[CompleteProfile] ✅ Institutes loaded:', res.data.length);
          
          if (res.data.length === 1) {
            console.log('[CompleteProfile] 🎯 Auto-selecting institute');
            setSelectedInstitute(res.data[0]);
            // No need to show selection block if only one
          } else if (res.data.length === 0) {
            showAlert('Invalid Domain', 'Your email domain is not registered to any institute. You cannot proceed.', [{
              text: 'OK',
              onPress: async () => {
                try {
                  await AsyncStorage.clear();
                } catch (e) { }
                setUser(null);
                navigation.reset({ index: 0, routes: [{ name: 'Login' as any }] });
              }
            }]);
          }
        }
      } catch (e: any) {
        console.log('[CompleteProfile] ❌ ERROR LOADING INSTITUTES:', e);
        if (isMountedRef.current) {
          showAlert(
            'Error',
            'Failed to load institutes. Please try again.',
            [{ text: 'OK' }]
          );
        }
      } finally {
        if (isMountedRef.current) {
          setLoadingInstitutes(false);
        }
      }
    };
    fetchInstitutes();
  }, [showAlert, navigation, setUser]);

  // Load departments when institute changes
  useEffect(() => {
    if (!selectedInstitute) return;
    const fetchDepts = async () => {
      setLoadingDepts(true);
      setSelectedDepartment(null);
      setDepartments([]);
      try {
        const res = await getDepartmentsByInstitute(selectedInstitute.instituteId);
        if (isMountedRef.current) {
          setDepartments(res.data);
          console.log('[CompleteProfile] ✅ Departments loaded:', res.data.length);
        }
      } catch (e: any) {
        console.log('[CompleteProfile] ❌ ERROR LOADING DEPARTMENTS:', e);
        if (isMountedRef.current) {
          showAlert('Error', 'Failed to load departments.', [{ text: 'OK' }]);
        }
      } finally {
        if (isMountedRef.current) {
          setLoadingDepts(false);
        }
      }
    };
    fetchDepts();
  }, [selectedInstitute, showAlert]);

  const validate = (): string | null => {
    if (!phone.trim()) return 'Phone number is required.';
    if (phone.length !== 10)
      return 'Please enter a valid 10-digit phone number.';
    
    if (!rollNumber.trim()) return 'Roll number is required.';
    const cgpaNum = parseFloat(cgpa);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10)
      return 'CGPA must be a number between 0 and 10.';
    if (!year) return 'Please select your year of study.';
    if (!selectedInstitute) return 'Please select your institute.';
    if (!selectedDepartment) return 'Please select your department.';
    if (!resumeFile) return 'Resume file is required.';
    if (!marksheetFile) return 'Marksheet file is required.';
    return null;
  };

  const pickDocument = async (setFile: (file: any) => void) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFile(result.assets[0]);
      }
    } catch (err) {
      console.log('Error picking document', err);
      showAlert('Error', 'Failed to pick document', [{ text: 'OK' }]);
    }
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

      console.log('\n[CompleteProfile] ═══════════════════════════════════════');
      console.log('[CompleteProfile] 📝 SUBMITTING PROFILE');
      console.log('[CompleteProfile] Student ID:', studentId);
      console.log('[CompleteProfile] ═══════════════════════════════════════');

      const payload = {
        rollNumber: rollNumber.trim(),
        cgpa: parseFloat(cgpa),
        year,
        instituteId: selectedInstitute.instituteId,
        departmentId: selectedDepartment.departmentId,
        resumeFile: resumeFile,
        marksheetFile: marksheetFile,
        phone: phone.trim(),
      };

      console.log('[CompleteProfile] 📤 Payload:', JSON.stringify(payload, null, 2));

      // ✅ STEP 1: POST - Save profile
      console.log('[CompleteProfile] 📤 POST: Saving profile...');
      const saveRes = await completeStudentProfile(Number(studentId), payload);

      // ✅ CHECK IF COMPONENT IS STILL MOUNTED
      if (!isMountedRef.current) {
        console.log('[CompleteProfile] ⚠️  Component unmounted, ignoring response');
        return;
      }

      console.log('\n[CompleteProfile] ✅ SAVE RESPONSE RECEIVED');
      console.log('[CompleteProfile] Status Code:', saveRes.status);
      console.log('[CompleteProfile] Response Data:', JSON.stringify(saveRes.data, null, 2));
      
      // ✅ SKIP VERIFICATION - FORCE NAVIGATION
      console.log('\n[CompleteProfile] ✅✅✅ PROFILE SAVED - NAVIGATING TO STUDENT HOME');
      console.log('[CompleteProfile] ═══════════════════════════════════════\n');

      await AsyncStorage.removeItem('profileIncomplete');

      showAlert('Success! 🎉', 'Your profile has been completed successfully!', [
        {
          text: 'Continue',
          onPress: () => {
            console.log('[CompleteProfile] 🚀 Navigating to StudentHome');
            if (isMountedRef.current) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'StudentHome' }],
              });
            }
          },
        },
      ]);
    } catch (e: any) {
      console.log('\n[CompleteProfile] ❌ ERROR');
      console.log('[CompleteProfile] Message:', e.message);
      console.log('[CompleteProfile] Response Status:', e?.response?.status);
      console.log('[CompleteProfile] Response Data:', e?.response?.data);
      console.log('[CompleteProfile] ═══════════════════════════════════════\n');

      if (isMountedRef.current) {
        const errorMsg = e?.response?.data?.error || e?.message || 'Failed to save profile';
        showAlert('Error', errorMsg, [{ text: 'OK', onPress: () => setSubmitting(false) }]);
      }
    } finally {
      if (isMountedRef.current) {
        setSubmitting(false);
      }
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

        {/* ── Section: Contact Info ── */}
        <Text style={[styles.sectionLabel, { color: colors.subText }]}>CONTACT INFO</Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Phone Number */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Phone Number *</Text>
            <TextInput
              value={phone}
              onChangeText={(text) => setPhone(text.replace(/[^0-9]/g, ''))}
              placeholder="e.g. 9876543210"
              placeholderTextColor={colors.subText}
              keyboardType="number-pad"
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              maxLength={10}
            />
            <Text style={[styles.hint, { color: colors.subText }]}>
              Enter a valid 10-digit phone number
            </Text>
          </View>
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
            ) : institutes.length === 1 ? (
              <View style={[styles.selector, { borderColor: colors.border, backgroundColor: colors.background, opacity: 0.8 }]}>
                <Text style={[styles.selectorText, { color: colors.text }]}>
                  {institutes[0].instituteName}
                </Text>
                <Text style={{ color: colors.primary, fontSize: 16 }}>✓</Text>
              </View>
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
        <Text style={[styles.sectionLabel, { color: colors.subText }]}>DOCUMENTS</Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Resume */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Resume (PDF/Image) *</Text>
            <TouchableOpacity 
              style={[styles.selector, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={() => pickDocument(setResumeFile)}
            >
              <Text style={[styles.selectorText, { color: resumeFile ? colors.text : colors.subText }]} numberOfLines={1}>
                {resumeFile ? resumeFile.name : 'Upload Resume Document'}
              </Text>
              <Text style={{ color: colors.subText, fontSize: 18 }}>📂</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Marksheet */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Marksheet (PDF/Image) *</Text>
            <TouchableOpacity 
              style={[styles.selector, { borderColor: colors.border, backgroundColor: colors.background }]}
              onPress={() => pickDocument(setMarksheetFile)}
            >
              <Text style={[styles.selectorText, { color: marksheetFile ? colors.text : colors.subText }]} numberOfLines={1}>
                {marksheetFile ? marksheetFile.name : 'Upload Marksheet Document'}
              </Text>
              <Text style={{ color: colors.subText, fontSize: 18 }}>📂</Text>
            </TouchableOpacity>
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