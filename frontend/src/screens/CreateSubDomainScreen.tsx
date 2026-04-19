import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Modal,
  Animated,
  Dimensions,
  ImageStyle
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { createSubDomain, getDomains, getSubDomains } from '../api/facultyApi';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'CreateSubDomain'>;

interface SubDomainItem {
  subDomainId?: number | null;
  name?: string;
}

interface DomainItem {
  domainId?: number | null;
  name?: string;
}

// ── Success Sheet ──────────────────────────────────────────────────────────
const SuccessSheet = ({ visible, onClose, colors }: { visible: boolean; onClose: () => void; colors: any }) => {
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
          <Text style={[styles.successTitleBig, { color: colors.text }]}>SubDomain Created</Text>
          <Text style={[styles.successMessageBig, { color: colors.subText }]}>Successfully added</Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

const CreateSubDomainScreen = () => {
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const navigation = useNavigation<NavProp>();

  const [name, setName] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [domains, setDomains] = useState<DomainItem[]>([]);
  const [subDomains, setSubDomains] = useState<SubDomainItem[]>([]);
  const [open, setOpen] = useState(false);
  const [domainId, setDomainId] = useState<number | null>(null);
  const [items, setItems] = useState<Array<{ label: string; value: number }>>([]);

  const isDark = colors.background === '#111827';
  const accentSoft = isDark ? 'rgba(96,165,250,0.12)' : 'rgba(37,99,235,0.07)';
  const divider = isDark ? '#374151' : '#E5E7EB';

  useEffect(() => {
    if (user?.token) {
      loadDomains();
    }
  }, [user]);

  const loadDomains = async () => {
    try {
      const data = await getDomains(user!.token);
      setDomains(data || []);
      setItems(
        (data || []).map((d: DomainItem) => ({
          label: d.name || 'Unknown',
          value: d.domainId || 0,
        })),
      );
    } catch (err) {
      console.log('[CreateSubDomainScreen] Error:', err);
      Alert.alert('Error', 'Failed to load domains');
    }
  };

  useEffect(() => {
    if (!domainId || !user?.token) return;

    const fetchSubDomains = async () => {
      try {
        const data = await getSubDomains(domainId, user!.token);
        setSubDomains(data || []);
      } catch (err) {
        console.log('[CreateSubDomainScreen] Error:', err);
      }
    };

    fetchSubDomains();
  }, [domainId, user]);

  const handleCreate = async () => {
    const subDomainName = name.trim();

    if (!domainId) {
      Alert.alert('Required', 'Please select a domain');
      return;
    }

    if (!subDomainName) {
      Alert.alert('Required', 'SubDomain name is required');
      return;
    }

    const exists = subDomains.find(
      (sd: SubDomainItem) => sd.name?.toLowerCase() === subDomainName.toLowerCase(),
    );

    if (exists) {
      Alert.alert('Exists', 'This subdomain already exists');
      return;
    }

    try {
      setLoading(true);
      await createSubDomain(subDomainName, domainId, user!.token);
      setSuccess(true);
      setName('');

      setTimeout(() => {
        setSuccess(false);
        navigation.goBack();
      }, 2000);
    } catch (err) {
      console.log('[CreateSubDomainScreen] Error:', err);
      Alert.alert('Error', 'Failed to create subdomain');
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
            <Text style={[styles.headerGreeting, { color: colors.subText }]}>Create</Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>New SubDomain</Text>
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
          scrollEnabled={!open}
        >
          {/* Form Card */}
          <View style={[styles.card, { backgroundColor: colors.card }]}>

            {/* Domain Dropdown */}
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Select Domain</Text>
            <View style={styles.dropdownContainer}>
              <DropDownPicker
                open={open}
                value={domainId}
                items={items}
                setOpen={setOpen}
                setValue={setDomainId}
                setItems={setItems}
                placeholder="Choose a domain"
                style={[styles.dropdown, { borderColor: colors.border, backgroundColor: colors.background }]} 
                dropDownContainerStyle={[
                  styles.dropdownList,
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
                textStyle={{ color: colors.text, fontSize: 14, fontWeight: '500' }}
                placeholderStyle={{ color: colors.subText }}
                arrowIconStyle={{ tintColor: colors.subText } as ImageStyle}
                selectedItemContainerStyle={{ backgroundColor: colors.primary + '12' }}
                disabled={loading}
                maxHeight={200}
                zIndex={1000}
              />
            </View>

            {/* SubDomain Input */}
            <Text style={[styles.fieldLabel, { color: colors.text, marginTop: 14 }]}>SubDomain Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="e.g., Deep Learning"
              placeholderTextColor={colors.subText}
              value={name}
              onChangeText={setName}
              editable={!loading && domainId !== null}
              maxLength={50}
            />

            <Text style={[styles.charCount, { color: colors.subText }]}>{name.length}/50</Text>

            {/* Create Button */}
            <TouchableOpacity
              style={[
                styles.primaryBtn,
                {
                  backgroundColor: name.trim() && domainId && !loading ? colors.primary : '#ccc',
                  opacity: name.trim() && domainId && !loading ? 1 : 0.6,
                },
              ]}
              onPress={handleCreate}
              disabled={!name.trim() || !domainId || loading}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>
                {loading ? 'Creating...' : 'Create SubDomain'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 16 }} />
        </ScrollView>
      </View>

      <SuccessSheet visible={success} onClose={() => setSuccess(false)} colors={colors} />
    </SafeAreaView>
  );
};

export default CreateSubDomainScreen;

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

  dropdownContainer: {
    marginBottom: 12,
    zIndex: 1000,
  },

  dropdown: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },

  dropdownList: {
    borderWidth: 1.5,
    borderRadius: 10,
    marginTop: 2,
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

  charCount: {
    fontSize: 10,
    textAlign: 'right',
    marginBottom: 12,
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