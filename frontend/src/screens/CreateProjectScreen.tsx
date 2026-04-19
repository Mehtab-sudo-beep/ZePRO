import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  FlatList,
  Pressable,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';

import { createProject, getDomains, getSubDomains, getAllocationRules } from '../api/facultyApi';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type NavProp = NativeStackNavigationProp<RootStackParamList, 'CreateProject'>;

interface PickerItem {
  name?: string;
  label?: string;
  domainId?: number | null;
  subDomainId?: number | null;
}

// ── Success Sheet ──────────────────────────────────────────────────────────
const SuccessSheet = ({ visible, onClose, colors }: any) => {
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const opacityAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      const timer = setTimeout(onClose, 2000);
      return () => clearTimeout(timer);
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, onClose]);

  return (
    <Modal visible={visible} transparent animationType="none">
      <View style={styles.successBackdrop}>
        <Animated.View
          style={[
            styles.successContent,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <View style={styles.successIconBig}>
            <Text style={styles.successCheckmarkBig}>✓</Text>
          </View>
          <Text style={[styles.successTitleBig, { color: colors.text }]}>Project Created</Text>
          <Text style={[styles.successMessageBig, { color: colors.subText }]}>Published successfully</Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

// ── Modal Picker ────────────────────────────────────────────────────────────
const PickerModal = ({
  visible,
  onClose,
  data,
  onSelect,
  title,
  colors,
}: {
  visible: boolean;
  onClose: () => void;
  data: PickerItem[];
  onSelect: (item: PickerItem) => void;
  title: string;
  colors: any;
}) => {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <Pressable style={styles.modalOverlay} onPress={onClose} />
      <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
        <View style={styles.modalHandle}>
          <View style={[styles.handleBar, { backgroundColor: colors.border }]} />
        </View>
        <Text style={[styles.modalTitle, { color: colors.text }]}>{title}</Text>
        <FlatList
          data={data}
          keyExtractor={(item: PickerItem, idx: number) => `picker-${idx}`}
          renderItem={({ item }: { item: PickerItem }) => (
            <TouchableOpacity
              style={[styles.modalItem, { borderBottomColor: colors.border }]}
              onPress={() => onSelect(item)}
              activeOpacity={0.7}
            >
              <Text style={[styles.modalItemText, { color: colors.text }]}>
                {item.name || item.label}
              </Text>
              <Text style={[styles.modalItemIcon, { color: colors.primary }]}>›</Text>
            </TouchableOpacity>
          )}
          scrollEnabled
          nestedScrollEnabled={false}
        />
      </View>
    </Modal>
  );
};

const CreateProjectScreen = () => {
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation<NavProp>();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slots, setSlots] = useState('');
  const [domains, setDomains] = useState<PickerItem[]>([]);
  const [subDomains, setSubDomains] = useState<PickerItem[]>([]);
  const [domainId, setDomainId] = useState<number | null>(null);
  const [subDomainId, setSubDomainId] = useState<number | null>(null);
  const [domainName, setDomainName] = useState('');
  const [subDomainName, setSubDomainName] = useState('');
  const [domainModal, setDomainModal] = useState(false);
  const [subDomainModal, setSubDomainModal] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [maxTeamSize, setMaxTeamSize] = useState(10);

  const isDark = colors.background === '#111827';
  const accentSoft = isDark ? 'rgba(96,165,250,0.12)' : 'rgba(37,99,235,0.07)';
  const divider = isDark ? '#374151' : '#E5E7EB';

  useEffect(() => {
    if (user?.token) {
      loadDomains();
      loadRules();
    }
  }, [user]);

  const loadRules = async () => {
    try {
      const rules = await getAllocationRules(user!.token);
      if (rules && rules.maxTeamSize) {
        setMaxTeamSize(rules.maxTeamSize);
      }
    } catch (err) {
      console.log('[CreateProjectScreen] Error fetching rules', err);
    }
  };

  const loadDomains = async () => {
    try {
      const data = await getDomains(user!.token);
      if (!data || data.length === 0) {
        setDomains([{ domainId: null, name: 'No domains available' }]);
      } else {
        setDomains(data);
      }
    } catch (err) {
      console.log('[CreateProjectScreen] Error:', err);
      Alert.alert('Error', 'Failed to load domains');
    }
  };

  useEffect(() => {
    if (!domainId || !user?.token) return;
    const fetchSub = async () => {
      try {
        const data = await getSubDomains(domainId, user!.token);
        if (!data || data.length === 0) {
          setSubDomains([{ subDomainId: null, name: 'No subdomains available' }]);
        } else {
          setSubDomains(data);
        }
      } catch (err) {
        console.log('[CreateProjectScreen] Error:', err);
      }
    };
    fetchSub();
  }, [domainId, user]);

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Required', 'Project title is required');
      return;
    }
    if (!domainId) {
      Alert.alert('Required', 'Please select a domain');
      return;
    }
    if (!subDomainId) {
      Alert.alert('Required', 'Please select a subdomain');
      return;
    }
    const slotCount = parseInt(slots, 10);
    if (isNaN(slotCount) || slotCount < 1 || slotCount > maxTeamSize) {
      Alert.alert('Invalid', `Slots must be between 1 and ${maxTeamSize}`);
      return;
    }

    try {
      setLoading(true);
      await createProject(
        {
          title,
          description,
          domainId,
          subDomainId,
          studentSlots: slotCount,
        },
        user!.token,
      );
      setSuccess(true);
      setTimeout(() => {
        setTitle('');
        setDescription('');
        setSlots('');
        setDomainName('');
        setSubDomainName('');
        setDomainId(null);
        setSubDomainId(null);
        setSuccess(false);
        navigation.goBack();
      }, 2000);
    } catch (err) {
      console.log('[CreateProjectScreen] Error:', err);
      Alert.alert('Error', 'Failed to create project');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header - Matching FacultyHomeScreen */}
        <View
          style={[
            styles.header,
            { backgroundColor: colors.card, borderBottomColor: divider },
          ]}
        >
          <View>
            <Text style={[styles.headerGreeting, { color: colors.subText }]}>
              Create
            </Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              New Project
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: accentSoft }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.closeBtnText, { color: colors.primary }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={false}
        >
          {/* Form Card */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Project Title</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="e.g., Smart IDS Detection"
              placeholderTextColor={colors.subText}
              value={title}
              onChangeText={setTitle}
              maxLength={60}
              editable={!loading}
            />
            <Text style={[styles.charCount, { color: colors.subText }]}>
              {title.length}/60
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 12 }]}>
              Description
            </Text>
            <TextInput
              style={[
                styles.textArea,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="Describe your project..."
              placeholderTextColor={colors.subText}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={250}
              textAlignVertical="top"
              editable={!loading}
            />
            <Text style={[styles.charCount, { color: colors.subText }]}>
              {description.length}/250
            </Text>

            <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 12 }]}>
              Student Slots (1-{maxTeamSize})
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="Number of slots"
              placeholderTextColor={colors.subText}
              keyboardType="numeric"
              value={slots}
              onChangeText={setSlots}
              maxLength={2}
              editable={!loading}
            />

            <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 12 }]}>
              Domain
            </Text>
            <TouchableOpacity
              style={[
                styles.selector,
                { borderColor: colors.border, backgroundColor: colors.background },
              ]}
              onPress={() => setDomainModal(true)}
              activeOpacity={0.75}
              disabled={loading}
            >
              <Text
                style={[
                  styles.selectorText,
                  { color: domainName ? colors.text : colors.subText },
                ]}
              >
                {domainName || 'Select Domain'}
              </Text>
              <Text style={[styles.selectorArrow, { color: colors.subText }]}>›</Text>
            </TouchableOpacity>

            <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 12 }]}>
              SubDomain
            </Text>
            <TouchableOpacity
              style={[
                styles.selector,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.background,
                  opacity: domainId ? 1 : 0.5,
                },
              ]}
              onPress={() => {
                if (!domainId) {
                  Alert.alert('Select Domain First', 'Please choose a domain');
                  return;
                }
                setSubDomainModal(true);
              }}
              activeOpacity={0.75}
              disabled={!domainId || loading}
            >
              <Text
                style={[
                  styles.selectorText,
                  { color: subDomainName ? colors.text : colors.subText },
                ]}
              >
                {subDomainName || 'Select SubDomain'}
              </Text>
              <Text style={[styles.selectorArrow, { color: colors.subText }]}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                {
                  backgroundColor:
                    title.trim() && domainId && subDomainId && slots.trim() && !loading
                      ? colors.primary
                      : '#ccc',
                  opacity:
                    title.trim() && domainId && subDomainId && slots.trim() && !loading
                      ? 1
                      : 0.6,
                },
              ]}
              onPress={handleCreate}
              disabled={
                !title.trim() ||
                !domainId ||
                !subDomainId ||
                !slots.trim() ||
                loading
              }
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>
                {loading ? 'Publishing...' : 'Publish Project'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 16 }} />
        </ScrollView>
      </View>

      <PickerModal
        visible={domainModal}
        onClose={() => setDomainModal(false)}
        data={domains}
        onSelect={(item: PickerItem) => {
          if (item.domainId === null) {
            Alert.alert('No Domains', 'Create a domain first');
            return;
          }
          setDomainId(item.domainId || null);
          setDomainName(item.name || '');
          setDomainModal(false);
          setSubDomainName('');
          setSubDomainId(null);
        }}
        title="Select Domain"
        colors={colors}
      />

      <PickerModal
        visible={subDomainModal}
        onClose={() => setSubDomainModal(false)}
        data={subDomains}
        onSelect={(item: PickerItem) => {
          if (item.subDomainId === null) {
            Alert.alert('No SubDomains', 'Create a subdomain first');
            return;
          }
          setSubDomainId(item.subDomainId || null);
          setSubDomainName(item.name || '');
          setSubDomainModal(false);
        }}
        title="Select SubDomain"
        colors={colors}
      />

      <SuccessSheet visible={success} onClose={() => setSuccess(false)} colors={colors} />
    </SafeAreaView>
  );
};

export default CreateProjectScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    height: 72,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 2,
  },
  headerGreeting: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 18,
    fontWeight: '700',
  },

  content: { padding: 16, paddingBottom: 8 },

  card: {
    borderRadius: 14,
    marginBottom: 12,
    overflow: 'hidden',
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  fieldLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },

  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },

  textArea: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },

  charCount: {
    fontSize: 10,
    textAlign: 'right',
    marginBottom: 12,
  },

  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  selectorText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  selectorArrow: {
    fontSize: 18,
    marginLeft: 8,
  },

  primaryBtn: {
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  btnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  modalSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
  },
  modalHandle: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 0.5,
  },
  modalItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalItemIcon: {
    fontSize: 18,
    fontWeight: '700',
  },

  successBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContent: {
    alignItems: 'center',
    gap: 12,
  },
  successIconBig: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successCheckmarkBig: {
    fontSize: 48,
    color: '#fff',
    fontWeight: '800',
  },
  successTitleBig: {
    fontSize: 24,
    fontWeight: '800',
  },
  successMessageBig: {
    fontSize: 14,
    textAlign: 'center',
  },
});