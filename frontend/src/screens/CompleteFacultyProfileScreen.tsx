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
import {
  completeFacultyProfile,
  getAllInstitutes,
  getDepartmentsByInstitute,
} from '../api/facultyApi';

type Props = NativeStackScreenProps<RootStackParamList, 'CompleteFacultyProfile'>;

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

// ── Main Screen ───────────────────────────────────────────────────────────────
const CompleteFacultyProfileScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useContext(ThemeContext);
  const { showAlert } = useContext(AlertContext);
  const { setUser } = useContext(AuthContext);

  // ✅ TRACK MOUNTED STATE
  const isMountedRef = useRef(true);

  // Form fields
  const [employeeId, setEmployeeId] = useState('');
  const [designation, setDesignation] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [qualification, setQualification] = useState('');
  const [cabinNo, setCabinNo] = useState('');
  const [phone, setPhone] = useState('');
  const [problemStatementLink, setProblemStatementLink] = useState('');
  const [domains, setDomains] = useState('');
  const [subDomains, setSubDomains] = useState('');

  // Institute / Department
  const [institutes, setInstitutes] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [selectedInstitute, setSelectedInstitute] = useState<any>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

  // Modal visibility
  const [showInstitutePicker, setShowInstitutePicker] = useState(false);
  const [showDepartmentPicker, setShowDepartmentPicker] = useState(false);

  // UI state
  const [loadingInstitutes, setLoadingInstitutes] = useState(true);
  const [loadingDepts, setLoadingDepts] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // ✅ TRACK MOUNT/UNMOUNT
  useEffect(() => {
    isMountedRef.current = true;
    console.log('[CompleteFacultyProfile] 📱 Component mounted');

    return () => {
      isMountedRef.current = false;
      console.log('[CompleteFacultyProfile] 📱 Component unmounted');
    };
  }, []);

  // Load institutes on mount
  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        console.log('[CompleteFacultyProfile] 📡 Fetching institutes...');
        const token = await AsyncStorage.getItem('token');
        if (!token) {
          console.log('[CompleteFacultyProfile] ❌ No token found');
          return;
        }
        const res = await getAllInstitutes(token);
        
        if (isMountedRef.current) {
          console.log('[CompleteFacultyProfile] ✅ Institutes response:', res);
          console.log('[CompleteFacultyProfile] Status:', res.status);
          console.log('[CompleteFacultyProfile] Data:', res.data);
          console.log('[CompleteFacultyProfile] Data type:', typeof res.data);
          console.log('[CompleteFacultyProfile] Is Array:', Array.isArray(res.data));
          
          if (Array.isArray(res.data) && res.data.length > 0) {
            console.log('[CompleteFacultyProfile] ✅ Setting institutes:', res.data);
            setInstitutes(res.data);
            if (res.data.length === 1) {
               console.log('[CompleteFacultyProfile] 🎯 Auto-selecting institute');
               setSelectedInstitute(res.data[0]);
            }
          } else {
            console.log('[CompleteFacultyProfile] ⚠️  Empty institutes array');
            setInstitutes([]);
            showAlert('Invalid Domain', 'Your email domain is not registered to any institute. You cannot proceed.', [{ 
               text: 'OK', 
               onPress: async () => {
                 try {
                   await AsyncStorage.clear();
                 } catch (e) {}
                 setUser(null);
                 navigation.reset({ index: 0, routes: [{ name: 'Login' as any }] });
               }
             }]);
          }
        }
      } catch (e: any) {
        console.log('[CompleteFacultyProfile] ❌ ERROR LOADING INSTITUTES');
        console.log('[CompleteFacultyProfile] Error name:', e.name);
        console.log('[CompleteFacultyProfile] Error message:', e.message);
        console.log('[CompleteFacultyProfile] Error code:', e.code);
        console.log('[CompleteFacultyProfile] Error config:', e.config?.url);
        console.log('[CompleteFacultyProfile] Response status:', e.response?.status);
        console.log('[CompleteFacultyProfile] Response data:', e.response?.data);
        console.log('[CompleteFacultyProfile] Full error:', JSON.stringify(e, null, 2));
        
        if (isMountedRef.current) {
          showAlert('Error', `Failed to load institutes: ${e.message}`, [{ text: 'OK' }]);
          setInstitutes([]);
        }
      } finally {
        if (isMountedRef.current) {
          setLoadingInstitutes(false);
        }
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
        console.log('[CompleteFacultyProfile] 📡 Fetching departments...');
        console.log('[CompleteFacultyProfile] Institute ID:', selectedInstitute.instituteId);
        
        const res = await getDepartmentsByInstitute(selectedInstitute.instituteId);
        
        if (isMountedRef.current) {
          console.log('[CompleteFacultyProfile] ✅ Departments response:', res);
          console.log('[CompleteFacultyProfile] Status:', res.status);
          console.log('[CompleteFacultyProfile] Data:', res.data);
          console.log('[CompleteFacultyProfile] Data type:', typeof res.data);
          console.log('[CompleteFacultyProfile] Is Array:', Array.isArray(res.data));
          
          if (Array.isArray(res.data) && res.data.length > 0) {
            console.log('[CompleteFacultyProfile] ✅ Setting departments:', res.data);
            setDepartments(res.data);
          } else {
            console.log('[CompleteFacultyProfile] ⚠️  Empty departments array');
            setDepartments([]);
          }
        }
      } catch (e: any) {
        console.log('[CompleteFacultyProfile] ❌ ERROR LOADING DEPARTMENTS');
        console.log('[CompleteFacultyProfile] Error name:', e.name);
        console.log('[CompleteFacultyProfile] Error message:', e.message);
        console.log('[CompleteFacultyProfile] Error code:', e.code);
        console.log('[CompleteFacultyProfile] Error config:', e.config?.url);
        console.log('[CompleteFacultyProfile] Response status:', e.response?.status);
        console.log('[CompleteFacultyProfile] Response data:', e.response?.data);
        console.log('[CompleteFacultyProfile] Full error:', JSON.stringify(e, null, 2));
        
        if (isMountedRef.current) {
          showAlert('Error', `Failed to load departments: ${e.message}`, [{ text: 'OK' }]);
          setDepartments([]);
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
    if (!employeeId.trim()) return 'Employee ID is required.';
    if (!designation.trim()) return 'Designation is required.';
    if (!specialization.trim()) return 'Specialization is required.';
    if (!experience.trim()) return 'Experience is required.';
    if (!qualification.trim()) return 'Qualification is required.';
    if (!cabinNo.trim()) return 'Cabin number is required.';
    if (!phone.trim()) return 'Phone number is required.';
    if (!/^[0-9]{10}$/.test(phone.replace(/\D/g, '')))
      return 'Please enter a valid 10-digit phone number.';
    if (!problemStatementLink.trim()) return 'Problem statement link is required.';
    if (!domains.trim()) return 'Domains are required.';
    if (!subDomains.trim()) return 'Sub-domains are required.';
    if (!selectedInstitute) return 'Please select an institute.';
    if (!selectedDepartment) return 'Please select a department.';
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
      const facultyId = await AsyncStorage.getItem('facultyId');
      const token = await AsyncStorage.getItem('token');
      
      if (!facultyId || !token) 
        throw new Error('Faculty ID or token not found. Please log in again.');

      console.log('\n[CompleteFacultyProfile] ═══════════════════════════════════════');
      console.log('[CompleteFacultyProfile] 📝 SUBMITTING FACULTY PROFILE');
      console.log('[CompleteFacultyProfile] Faculty ID:', facultyId);
      console.log('[CompleteFacultyProfile] Token:', token.substring(0, 20) + '...');
      console.log('[CompleteFacultyProfile] ═══════════════════════════════════════');

      const payload = {
        employeeId: employeeId.trim(),
        designation: designation.trim(),
        specialization: specialization.trim(),
        experience: experience.trim(),
        qualification: qualification.trim(),
        cabinNo: cabinNo.trim(),
        phone: phone.trim(),
        problemStatementLink: problemStatementLink.trim(),
        domains: domains.trim(),
        subDomains: subDomains.trim(),
        departmentId: selectedDepartment.departmentId,
        instituteId: selectedInstitute.instituteId,
      };

      console.log('[CompleteFacultyProfile] 📤 Payload:', JSON.stringify(payload, null, 2));

      // ✅ POST - Save profile
      console.log('[CompleteFacultyProfile] 📤 POST: Saving profile...');
      const saveRes = await completeFacultyProfile(Number(facultyId), payload, token);

      // ✅ CHECK IF COMPONENT IS STILL MOUNTED
      if (!isMountedRef.current) {
        console.log('[CompleteFacultyProfile] ⚠️  Component unmounted, ignoring response');
        return;
      }

      console.log('\n[CompleteFacultyProfile] ✅ SAVE RESPONSE RECEIVED');
      console.log('[CompleteFacultyProfile] Status Code:', saveRes.status);
      console.log('[CompleteFacultyProfile] Response Data:', JSON.stringify(saveRes.data, null, 2));
      console.log('[CompleteFacultyProfile] Is Profile Complete:', saveRes.data?.isProfileComplete);
      
      // ✅ SKIP VERIFICATION - FORCE NAVIGATION
      console.log('\n[CompleteFacultyProfile] ✅✅✅ PROFILE SAVED - NAVIGATING TO FACULTY HOME');
      console.log('[CompleteFacultyProfile] ═══════════════════════════════════════\n');

      showAlert('Success! 🎉', 'Your profile has been completed successfully!', [
        {
          text: 'Continue',
          onPress: () => {
            console.log('[CompleteFacultyProfile] 🚀 Navigating to FacultyHome');
            if (isMountedRef.current) {
              navigation.reset({
                index: 0,
                routes: [{ name: 'FacultyHome' }],
              });
            }
          },
        },
      ]);
    } catch (e: any) {
      console.log('\n[CompleteFacultyProfile] ❌ ERROR');
      console.log('[CompleteFacultyProfile] Message:', e.message);
      console.log('[CompleteFacultyProfile] Response:', e?.response?.data);
      console.log('[CompleteFacultyProfile] Status:', e?.response?.status);
      console.log('[CompleteFacultyProfile] ═══════════════════════════════════════\n');

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
            <Text style={{ fontSize: 26 }}>👨‍🏫</Text>
          </View>
          <Text style={[styles.title, { color: colors.text }]}>
            Complete Your Profile
          </Text>
          <Text style={[styles.subtitle, { color: colors.subText }]}>
            Please provide your professional details to get started.
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
              onChangeText={setPhone}
              placeholder="e.g. 9876543210"
              placeholderTextColor={colors.subText}
              keyboardType="phone-pad"
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              maxLength={10}
            />
          </View>
        </View>

        {/* ── Section: Professional Info ── */}
        <Text style={[styles.sectionLabel, { color: colors.subText }]}>PROFESSIONAL INFO</Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Employee ID */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Employee ID *</Text>
            <TextInput
              value={employeeId}
              onChangeText={setEmployeeId}
              placeholder="e.g. FAC001"
              placeholderTextColor={colors.subText}
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              autoCapitalize="characters"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Designation */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Designation *</Text>
            <TextInput
              value={designation}
              onChangeText={setDesignation}
              placeholder="e.g. Assistant Professor"
              placeholderTextColor={colors.subText}
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Specialization */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Specialization *</Text>
            <TextInput
              value={specialization}
              onChangeText={setSpecialization}
              placeholder="e.g. Machine Learning"
              placeholderTextColor={colors.subText}
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Experience */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Experience (years) *</Text>
            <TextInput
              value={experience}
              onChangeText={setExperience}
              placeholder="e.g. 5"
              placeholderTextColor={colors.subText}
              keyboardType="number-pad"
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Qualification */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Qualification *</Text>
            <TextInput
              value={qualification}
              onChangeText={setQualification}
              placeholder="e.g. Ph.D. in Computer Science"
              placeholderTextColor={colors.subText}
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Cabin Number */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Cabin Number *</Text>
            <TextInput
              value={cabinNo}
              onChangeText={setCabinNo}
              placeholder="e.g. A-101"
              placeholderTextColor={colors.subText}
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            />
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

        {/* ── Section: Research Info ── */}
        <Text style={[styles.sectionLabel, { color: colors.subText }]}>RESEARCH & DOMAINS</Text>

        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Problem Statement Link */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Problem Statement Link *</Text>
            <TextInput
              value={problemStatementLink}
              onChangeText={setProblemStatementLink}
              placeholder="https://drive.google.com/..."
              placeholderTextColor={colors.subText}
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
              autoCapitalize="none"
              keyboardType="url"
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Domains */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Domains *</Text>
            <TextInput
              value={domains}
              onChangeText={setDomains}
              placeholder="e.g. AI, ML, Blockchain"
              placeholderTextColor={colors.subText}
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* Sub-Domains */}
          <View style={styles.fieldWrap}>
            <Text style={[styles.fieldLabel, { color: colors.subText }]}>Sub-Domains *</Text>
            <TextInput
              value={subDomains}
              onChangeText={setSubDomains}
              placeholder="e.g. NLP, Computer Vision, Smart Contracts"
              placeholderTextColor={colors.subText}
              style={[styles.input, { color: colors.text, borderColor: colors.border, backgroundColor: colors.background }]}
            />
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
    </SafeAreaView>
  );
};

export default CompleteFacultyProfileScreen;

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