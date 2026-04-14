import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  StyleSheet,
  Alert,
} from 'react-native';

import { createDomain, getDomains } from '../api/facultyApi';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';

const CreateDomainScreen = () => {
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);

  const [name, setName] = useState('');
  const [domains, setDomains] = useState<any[]>([]);
  const [success, setSuccess] = useState(false);

  /* ================= SCREEN LOAD ================= */

  useEffect(() => {
    console.log('===== CreateDomainScreen Loaded =====');
    console.log('User token:', user?.token);

    if (user?.token) {
      loadDomains();
    }
  }, [user]);

  /* ================= LOAD DOMAINS ================= */

  const loadDomains = async () => {
    try {
      console.log('Calling getDomains API...');

      const data = await getDomains(user!.token);

      console.log('Domains received:', data);

      setDomains(data || []);
    } catch (err) {
      console.log('Error loading domains:', err);
    }
  };

  /* ================= CREATE DOMAIN ================= */

  const handleCreate = async () => {
    const domainName = name.trim();

    console.log('===== Create Domain Clicked =====');
    console.log('Entered domain name:', domainName);

    if (!domainName) {
      console.log('Domain name empty');
      Alert.alert('Validation Error', 'Domain name cannot be empty');
      return;
    }

    console.log('Checking duplicate domains...');

    const exists = domains.find(
      d => d.name?.toLowerCase() === domainName.toLowerCase(),
    );

    console.log('Duplicate check result:', exists);

    if (exists) {
      console.log('Domain already exists');
      Alert.alert('Domain Exists', 'This domain already exists');
      return;
    }

    try {
      console.log('Calling createDomain API...');

      await createDomain(domainName, user!.token);

      console.log('Domain created successfully');

      setSuccess(true);
      setName('');

      loadDomains();
    } catch (err) {
      console.log('Error creating domain:', err);
      Alert.alert('Error', 'Failed to create domain');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Create New Domain
        </Text>

        <TextInput
          style={[
            styles.input,
            { borderColor: colors.border, color: colors.text },
          ]}
          placeholder="Enter domain name"
          placeholderTextColor={colors.subText}
          value={name}
          onChangeText={text => {
            console.log('User typing:', text);
            setName(text);
            setSuccess(false);
          }}
        />

        <TouchableOpacity
          style={[
            styles.button,
            {
              backgroundColor: name.trim() ? colors.primary : '#cccccc',
            },
          ]}
          onPress={handleCreate}
          disabled={!name.trim()}
        >
          <Text style={styles.buttonText}>Create Domain</Text>
        </TouchableOpacity>

        {success && (
          <Text style={styles.successText}>✓ Domain created successfully</Text>
        )}
      </View>
    </View>
  );
};

export default CreateDomainScreen;

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
