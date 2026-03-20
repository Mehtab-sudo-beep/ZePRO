import React, { useEffect, useState, useContext } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';

import DropDownPicker from 'react-native-dropdown-picker';

import { createSubDomain, getDomains, getSubDomains } from '../api/facultyApi';

import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';

const CreateSubDomainScreen = () => {
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);

  const [name, setName] = useState('');
  const [success, setSuccess] = useState(false);

  const [domains, setDomains] = useState<any[]>([]);
  const [subDomains, setSubDomains] = useState<any[]>([]);

  const [open, setOpen] = useState(false);
  const [domainId, setDomainId] = useState<number | null>(null);
  const [items, setItems] = useState<any[]>([]);

  /* ================= LOAD DOMAINS ================= */

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      const data = await getDomains();

      setDomains(data || []);

      setItems(
        data.map((d: any) => ({
          label: d.name,
          value: d.domainId,
        })),
      );
    } catch (err) {
      console.log('Error loading domains', err);
    }
  };

  /* ================= LOAD SUBDOMAINS ================= */

  useEffect(() => {
    if (!domainId) return;

    const fetchSubDomains = async () => {
      try {
        const data = await getSubDomains(domainId);
        setSubDomains(data || []);
      } catch (err) {
        console.log('Error loading subdomains', err);
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
      await createSubDomain(subDomainName, domainId, user.token);

      setSuccess(true);
      setName('');

      const data = await getSubDomains(domainId);
      setSubDomains(data || []);
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Failed to create subdomain');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownList}
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
        />

        {/* CREATE BUTTON */}

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: name.trim() && domainId ? '#2563EB' : '#ccc',
            },
          ]}
          onPress={handleCreate}
          disabled={!name.trim() || !domainId}
        >
          <Text style={styles.buttonText}>Create SubDomain</Text>
        </TouchableOpacity>

        {success && (
          <Text style={styles.successText}>
            ✓ SubDomain created successfully
          </Text>
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
    borderRadius: 12,
    elevation: 3,
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 20,
  },

  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
  },

  dropdown: {
    borderColor: '#2563EB',
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    marginBottom: 20,
  },

  dropdownList: {
    borderColor: '#2563EB',
    backgroundColor: '#FFFFFF',
  },

  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    marginBottom: 20,
  },

  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },

  successText: {
    marginTop: 16,
    color: 'green',
    fontWeight: '600',
    textAlign: 'center',
  },
});
