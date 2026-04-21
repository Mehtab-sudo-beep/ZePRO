import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { AlertContext } from '../context/AlertContext';
import { AuthContext } from '../context/AuthContext';
import { coordinatorApi } from '../api/coordinatorApi';
import { ThemeContext } from '../theme/ThemeContext';

interface Rules {
  departmentId?: number;
  maxTeamSize: number;
  maxStudentsPerFaculty: number;
  maxProjectsPerFaculty: number;
  degree?: string;
}

const AdminChangeRulesScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { showAlert } = useContext(AlertContext);
  const { user } = useContext(AuthContext);
  const { colors } = useContext(ThemeContext);

  const [degree, setDegree] = useState<'UG' | 'PG'>('UG');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [rules, setRules] = useState<Rules>({
    maxTeamSize: 4,
    maxStudentsPerFaculty: 10,
    maxProjectsPerFaculty: 3,
  });

  const [tempRules, setTempRules] = useState<Rules>(rules);

  useEffect(() => {
    fetchRules(degree);
  }, [degree]);

  const fetchRules = async (selectedDegree: string) => {
    try {
      setLoading(true);
      const data = await coordinatorApi.getRules(selectedDegree);
      const fetchedRules = {
        maxTeamSize: data.maxTeamSize || 4,
        maxStudentsPerFaculty: data.maxStudentsPerFaculty || 10,
        maxProjectsPerFaculty: data.maxProjectsPerFaculty || 3,
        departmentId: data.departmentId,
        degree: selectedDegree
      };
      setRules(fetchedRules);
      setTempRules(fetchedRules);
    } catch (error: any) {
      console.log('Failed to fetch rules', error);
      showAlert('Error', 'Failed to fetch rules. Using defaults.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRules = async () => {
    if (!tempRules.maxTeamSize || tempRules.maxTeamSize <= 0) {
      showAlert('Error', 'Please enter a valid max team size');
      return;
    }
    if (!tempRules.maxStudentsPerFaculty || tempRules.maxStudentsPerFaculty <= 0) {
      showAlert('Error', 'Please enter a valid max students per faculty');
      return;
    }
    if (!tempRules.maxProjectsPerFaculty || tempRules.maxProjectsPerFaculty <= 0) {
      showAlert('Error', 'Please enter a valid max projects per faculty');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        departmentId: tempRules.departmentId,
        maxTeamSize: tempRules.maxTeamSize,
        maxStudentsPerFaculty: tempRules.maxStudentsPerFaculty,
        maxProjectsPerFaculty: tempRules.maxProjectsPerFaculty,
        degree
      };
      await coordinatorApi.saveRules(payload);
      setRules(tempRules);
      // Removed: showAlert('Success', 'Rules updated successfully!');
    } catch (error: any) {
      console.log('Failed to save rules', error);
      showAlert('Error', 'Failed to save rules');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image
            source={require('../assets/angle.png')}
            style={[styles.backIcon, { tintColor: colors.text }]}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Rule Management</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.degreeBtn, degree === 'UG' && styles.degreeBtnActive, { borderColor: colors.primary }]}
          onPress={() => setDegree('UG')}
        >
          <Text style={[styles.degreeText, { color: colors.text }, degree === 'UG' && { color: '#FFF' }]}>UG Rules</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.degreeBtn, degree === 'PG' && styles.degreeBtnActive, { borderColor: colors.primary }]}
          onPress={() => setDegree('PG')}
        >
          <Text style={[styles.degreeText, { color: colors.text }, degree === 'PG' && { color: '#FFF' }]}>PG Rules</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.rulesContainer}>
            <Text style={styles.rulesTitle}>Project Allocation Rules</Text>

            <View style={styles.ruleCard}>
              <Text style={styles.ruleLabel}>Maximum Team Size</Text>
              <TextInput
                style={styles.ruleInput}
                placeholder="Enter max team size"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={String(tempRules.maxTeamSize)}
                onChangeText={text =>
                  setTempRules({ ...tempRules, maxTeamSize: parseInt(text) || 0 })
                }
              />
              <Text style={styles.ruleDescription}>
                Maximum number of students allowed per team
              </Text>
            </View>

            <View style={styles.ruleCard}>
              <Text style={styles.ruleLabel}>Maximum Students per Faculty</Text>
              <TextInput
                style={styles.ruleInput}
                placeholder="Enter max students"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={String(tempRules.maxStudentsPerFaculty)}
                onChangeText={text =>
                  setTempRules({ ...tempRules, maxStudentsPerFaculty: parseInt(text) || 0 })
                }
              />
              <Text style={styles.ruleDescription}>
                Maximum number of students a faculty can guide
              </Text>
            </View>

            <View style={styles.ruleCard}>
              <Text style={styles.ruleLabel}>Maximum Projects per Faculty</Text>
              <TextInput
                style={styles.ruleInput}
                placeholder="Enter max projects"
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
                value={String(tempRules.maxProjectsPerFaculty)}
                onChangeText={text =>
                  setTempRules({ ...tempRules, maxProjectsPerFaculty: parseInt(text) || 0 })
                }
              />
              <Text style={styles.ruleDescription}>
                Maximum number of projects a faculty can manage
              </Text>
            </View>

            <TouchableOpacity style={[styles.saveRulesButton, { backgroundColor: colors.primary }]} onPress={handleSaveRules} disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveRulesButtonText}>Save Rules</Text>
              )}
            </TouchableOpacity>

            <View style={styles.currentRulesCard}>
              <Text style={styles.currentRulesTitle}>Current Active Rules ({degree})</Text>
              <Text style={styles.currentRuleText}>Max Team Size: {rules.maxTeamSize}</Text>
              <Text style={styles.currentRuleText}>
                Max Students per Faculty: {rules.maxStudentsPerFaculty}
              </Text>
              <Text style={styles.currentRuleText}>
                Max Projects per Faculty: {rules.maxProjectsPerFaculty}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  backArrow: {
    fontSize: 22,
    color: '#FFFFFF',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#0f0d0d',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  rulesContainer: {
    paddingBottom: 20,
  },
  rulesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 20,
  },
  ruleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  ruleLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  ruleInput: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 8,
  },

  backIcon: { width: 22, height: 22, resizeMode: 'contain' },
  ruleDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  saveRulesButton: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveRulesButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
  currentRulesCard: {
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    padding: 16,
  },
  currentRulesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4F46E5',
    marginBottom: 8,
  },
  currentRuleText: {
    fontSize: 14,
    color: '#1F2937',
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  degreeBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4F46E5',
  },
  degreeBtnActive: {
    backgroundColor: '#4F46E5',
  },
  degreeText: {
    fontWeight: '600',
    fontSize: 14,
  },
});

export default AdminChangeRulesScreen;