import React, { useState, useContext, useEffect } from 'react';
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
  Animated,
  Modal,
  Dimensions,
} from 'react-native';

import { createDomain, getDomains } from '../api/facultyApi';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type NavProp = NativeStackNavigationProp<RootStackParamList, 'CreateDomain'>;

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
          <Text style={[styles.successTitleBig, { color: colors.text }]}>Domain Created</Text>
          <Text style={[styles.successMessageBig, { color: colors.subText }]}>Successfully added</Text>
        </Animated.View>
      </View>
    </Modal>
  );
};

const CreateDomainScreen = () => {
  const { user } = useContext(AuthContext);
  const { colors, theme } = useContext(ThemeContext);
  const navigation = useNavigation<NavProp>();

  const [name, setName] = useState('');
  const [domains, setDomains] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

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
    } catch (err) {
      console.log('[CreateDomainScreen] Error:', err);
    }
  };

  const handleCreate = async () => {
    const domainName = name.trim();

    if (!domainName) {
      Alert.alert('Required', 'Domain name cannot be empty');
      return;
    }

    const exists = domains.find(
      d => d.name?.toLowerCase() === domainName.toLowerCase(),
    );

    if (exists) {
      Alert.alert('Exists', 'This domain already exists');
      return;
    }

    try {
      setLoading(true);
      await createDomain(domainName, user!.token);
      setSuccess(true);
      setName('');
      setTimeout(() => {
        setSuccess(false);
        navigation.goBack();
      }, 2000);
    } catch (err) {
      console.log('[CreateDomainScreen] Error:', err);
      Alert.alert('Error', 'Failed to create domain');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} backgroundColor={colors.card} />

      <View style={styles.container}>
        {/* Header - Premium Style */}
        <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View>
            <Text style={[styles.headerGreeting, { color: colors.subText }]}>CREATE</Text>
            <Text style={[styles.headerTitle, { color: colors.text }]}>New Domain</Text>
          </View>
          <TouchableOpacity
            style={[styles.closeBtn, { backgroundColor: colors.primary + '15' }]}
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
            <Text style={[styles.fieldLabel, { color: colors.text }]}>Domain Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: colors.background,
                },
              ]}
              placeholder="e.g., Artificial Intelligence"
              placeholderTextColor={colors.subText}
              value={name}
              onChangeText={setName}
              editable={!loading}
              maxLength={50}
            />

            <Text style={[styles.charCount, { color: colors.subText }]}>
              {name.length}/50
            </Text>

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                {
                  backgroundColor: name.trim() && !loading ? colors.primary : '#ccc',
                  opacity: name.trim() && !loading ? 1 : 0.6,
                },
              ]}
              onPress={handleCreate}
              disabled={!name.trim() || loading}
              activeOpacity={0.85}
            >
              <Text style={styles.btnText}>
                {loading ? 'Creating...' : 'Create Domain'}
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

export default CreateDomainScreen;

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },

  header: {
    paddingTop: 15,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  headerGreeting: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },

  content: {
    padding: 16,
    paddingBottom: 32,
  },

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