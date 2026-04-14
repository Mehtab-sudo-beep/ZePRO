import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DropDownPicker from 'react-native-dropdown-picker';
import { createSubDomain, getDomains, getSubDomains } from '../api/facultyApi';

import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';

const CreateSubDomainScreen = () => {
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);
  const insets = useSafeAreaInsets();

  const [name, setName] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [domains, setDomains] = useState<any[]>([]);
  const [subDomains, setSubDomains] = useState<any[]>([]);

  const [open, setOpen] = useState(false);
  const [domainId, setDomainId] = useState<number | null>(null);
  const [items, setItems] = useState<any[]>([]);

  /* ================= LOAD DOMAINS ================= */

  useEffect(() => {
    if (user?.token) {
      loadDomains();
    }
  }, [user]);

  const loadDomains = async () => {
    try {
      console.log('[CreateSubDomainScreen] 📥 Loading domains...');
      const data = await getDomains(user!.token);
      setDomains(data || []);

      setItems(
        data.map((d: any) => ({
          label: d.name,
          value: d.domainId,
        })),
      );
      console.log('[CreateSubDomainScreen] ✅ Domains loaded:', data.length);
    } catch (err) {
      console.log('[CreateSubDomainScreen] ❌ Error loading domains:', err);
      Alert.alert('Error', 'Failed to load domains');
    }
  };

  /* ================= LOAD SUBDOMAINS ================= */

  useEffect(() => {
    if (!domainId || !user?.token) return;

    const fetchSubDomains = async () => {
      try {
        console.log('[CreateSubDomainScreen] 📥 Loading subdomains for domain:', domainId);
        const data = await getSubDomains(domainId, user!.token);
        setSubDomains(data || []);
        console.log('[CreateSubDomainScreen] ✅ Subdomains loaded:', data.length);
      } catch (err) {
        console.log('[CreateSubDomainScreen] ❌ Error loading subdomains:', err);
      }
    };

    fetchSubDomains();
  }, [domainId]);

  /* ================= CREATE SUBDOMAIN ================= */

  const handleCreate = async () => {
    const subDomainName = name.trim();

    if (!domainId) {
      Alert.alert('Validation', 'Please select a domain');
      return;
    }

    if (!subDomainName) {
      Alert.alert('Validation', 'SubDomain name cannot be empty');
      return;
    }

    const exists = subDomains.find(
      sd => sd.name?.toLowerCase() === subDomainName.toLowerCase(),
    );

    if (exists) {
      Alert.alert('SubDomain Exists', 'This subdomain already exists');
      return;
    }

    try {
      setLoading(true);
      console.log('[CreateSubDomainScreen] 📤 Creating subdomain:', subDomainName);

      await createSubDomain(subDomainName, domainId, user!.token);

      console.log('[CreateSubDomainScreen] ✅ Subdomain created successfully');
      setSuccess(true);
      setName('');

      // Reload subdomains
      const data = await getSubDomains(domainId, user!.token);
      setSubDomains(data || []);

      // Clear success message after 2 seconds
      setTimeout(() => setSuccess(false), 2000);
    } catch (err) {
      console.log('[CreateSubDomainScreen] ❌ Error creating subdomain:', err);
      Alert.alert('Error', 'Failed to create subdomain');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.background,
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }
      ]}
    >
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Create SubDomain
        </Text>

        {/* DOMAIN DROPDOWN */}
        <Text style={[styles.label, { color: colors.text }]}>
          Select Domain
        </Text>

        <DropDownPicker
          open={open}
          value={domainId}
          items={items}
          setOpen={setOpen}
          setValue={setDomainId}
          setItems={setItems}
          placeholder="Select Domain"
          style={[styles.dropdown, { borderColor: colors.border }]}
          dropDownContainerStyle={[styles.dropdownList, { borderColor: colors.border }]}
          textStyle={{ color: colors.text }}
        />

        {/* SUBDOMAIN INPUT */}
        <TextInput
          style={[
            styles.input,
            { borderColor: colors.border, color: colors.text },
          ]}
          placeholder="Enter subdomain name"
          placeholderTextColor={colors.subText}
          value={name}
          onChangeText={text => {
            setName(text);
            setSuccess(false);
          }}
          editable={!loading}
        />

        {/* CREATE BUTTON */}
        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: name.trim() && domainId && !loading ? colors.primary : '#ccc',
            },
          ]}
          onPress={handleCreate}
          disabled={!name.trim() || !domainId || loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Creating...' : 'Create SubDomain'}
          </Text>
        </TouchableOpacity>

        {/* SUCCESS MESSAGE */}
        {success && (
          <View style={[styles.successContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
            <Text style={styles.successText}>
              ✓ SubDomain created successfully
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default CreateSubDomainScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },

  card: {
    padding: 24,
    borderRadius: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },

  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
    letterSpacing: -0.5,
  },

  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },

  dropdown: {
    borderWidth: 1.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 20,
  },

  dropdownList: {
    borderWidth: 1.5,
    borderRadius: 10,
  },

  input: {
    borderWidth: 1.5,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    marginBottom: 20,
  },

  button: {
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },

  successContainer: {
    marginTop: 16,
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },

  successText: {
    color: '#10b981',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 14,
  },
});