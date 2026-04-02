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
} from 'react-native';

import { createProject, getDomains, getSubDomains } from '../api/facultyApi';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../theme/ThemeContext';

const CreateProjectScreen = () => {
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [slots, setSlots] = useState('');

  const [domains, setDomains] = useState<any[]>([]);
  const [subDomains, setSubDomains] = useState<any[]>([]);

  const [domainId, setDomainId] = useState<number | null>(null);
  const [subDomainId, setSubDomainId] = useState<number | null>(null);

  const [domainName, setDomainName] = useState('');
  const [subDomainName, setSubDomainName] = useState('');

  const [domainModal, setDomainModal] = useState(false);
  const [subDomainModal, setSubDomainModal] = useState(false);

  const [success, setSuccess] = useState(false);

  /* LOAD DOMAINS */

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    try {
      const data = await getDomains();

      if (!data || data.length === 0) {
        setDomains([{ domainId: null, name: 'None Available' }]);
      } else {
        setDomains(data);
      }
    } catch (err) {
      console.log(err);
    }
  };

  /* LOAD SUBDOMAINS */

  useEffect(() => {
    if (!domainId) return;

    const fetchSub = async () => {
      const data = await getSubDomains(domainId);

      if (!data || data.length === 0) {
        setSubDomains([{ subDomainId: null, name: 'None Available' }]);
      } else {
        setSubDomains(data);
      }
    };

    fetchSub();
  }, [domainId]);

  /* CREATE PROJECT */

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Mandatory', 'Project title is required');
      return;
    }

    if (!domainId) {
      Alert.alert('Mandatory', 'Please select a domain');
      return;
    }

    if (!subDomainId) {
      Alert.alert('Mandatory', 'Please select a subdomain');
      return;
    }

    const slotCount = parseInt(slots);
    if (isNaN(slotCount) || slotCount < 1 || slotCount > 3) {
      Alert.alert('Invalid Slots', 'Slots must be between 1 and 3');
      return;
    }

    try {
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

      setTitle('');
      setDescription('');
      setSlots('');
      setDomainName('');
      setSubDomainName('');
      setDomainId(null);
      setSubDomainId(null);

      setTimeout(() => setSuccess(false), 3000);
    } catch {
      Alert.alert('Error', 'Failed to create project');
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <View style={[styles.card, { backgroundColor: colors.card }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          Create Project
        </Text>

        {/* TITLE */}

        <Text style={styles.label}>Project Title</Text>

        <TextInput
          style={[styles.input, { borderColor: colors.border }]}
          placeholder="Example: Smart IDS Detection"
          placeholderTextColor="#9CA3AF"
          value={title}
          onChangeText={setTitle}
        />

        {/* DESCRIPTION */}

        <Text style={styles.label}>Project Description</Text>

        <TextInput
          style={[styles.input, { borderColor: colors.border }]}
          placeholder="Short description of the project"
          placeholderTextColor="#9CA3AF"
          value={description}
          onChangeText={setDescription}
        />

        {/* SLOTS */}
        <Text style={styles.label}>Student Slots (Max 3)</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border }]}
          placeholder="Number of slots (1-3)"
          placeholderTextColor="#9CA3AF"
          keyboardType="numeric"
          value={slots}
          onChangeText={setSlots}
        />

        {/* DOMAIN */}

        <Text style={styles.label}>Domain</Text>

        <TouchableOpacity
          style={styles.selector}
          onPress={() => setDomainModal(true)}
        >
          <Text style={styles.selectorText}>
            {domainName || 'Select Domain'}
          </Text>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* SUBDOMAIN */}

        <Text style={styles.label}>Sub Domain</Text>

        <TouchableOpacity
          style={[styles.selector, { opacity: domainId ? 1 : 0.5 }]}
          onPress={() => {
            if (!domainId) {
              Alert.alert('Select domain first');
              return;
            }

            setSubDomainModal(true);
          }}
        >
          <Text style={styles.selectorText}>
            {subDomainName || 'Select Sub Domain'}
          </Text>

          <Text style={styles.arrow}>›</Text>
        </TouchableOpacity>

        {/* CREATE BUTTON */}

        <TouchableOpacity style={styles.button} onPress={handleCreate}>
          <Text style={styles.buttonText}>Create Project</Text>
        </TouchableOpacity>

        {success && (
          <Text style={styles.successText}>✓ Project created successfully</Text>
        )}
      </View>

      {/* DOMAIN MODAL */}

      <Modal visible={domainModal} animationType="slide" transparent>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setDomainModal(false)}
        />

        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select Domain</Text>

          <FlatList
            data={domains}
            keyExtractor={item => item.domainId?.toString() || 'null-domain'}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  if (item.domainId === null) {
                    Alert.alert('No Domains Available');
                    setDomainModal(false);
                    return;
                  }

                  setDomainId(item.domainId);
                  setDomainName(item.name);
                  setDomainModal(false);

                  setSubDomainName('');
                  setSubDomainId(null);
                }}
              >
                <Text style={styles.modalText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>

      {/* SUBDOMAIN MODAL */}

      <Modal visible={subDomainModal} animationType="slide" transparent>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setSubDomainModal(false)}
        />

        <View style={styles.modalSheet}>
          <Text style={styles.modalTitle}>Select Sub Domain</Text>

          <FlatList
            data={subDomains}
            keyExtractor={item =>
              item.subDomainId?.toString() || 'null-subdomain'
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.modalItem}
                onPress={() => {
                  if (item.subDomainId === null) {
                    Alert.alert('No SubDomains Available');
                    setSubDomainModal(false);
                    return;
                  }

                  setSubDomainId(item.subDomainId);
                  setSubDomainName(item.name);
                  setSubDomainModal(false);
                }}
              >
                <Text style={styles.modalText}>{item.name}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </ScrollView>
  );
};

export default CreateProjectScreen;

/* STYLES */

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },

  card: {
    padding: 26,
    borderRadius: 16,
    elevation: 6,
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 25,
    textAlign: 'center',
  },

  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: '600',
  },

  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    marginBottom: 18,
    backgroundColor: '#F9FAFB',
  },

  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    marginBottom: 18,
    backgroundColor: '#F9FAFB',
  },

  selectorText: {
    fontSize: 15,
    color: '#374151',
  },

  arrow: {
    fontSize: 18,
    color: '#9CA3AF',
  },

  button: {
    backgroundColor: '#2563EB',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },

  successText: {
    marginTop: 16,
    color: 'green',
    textAlign: 'center',
    fontWeight: '600',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },

  modalSheet: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    maxHeight: '55%',
  },

  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },

  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderColor: '#E5E7EB',
  },

  modalText: {
    fontSize: 16,
  },
});
