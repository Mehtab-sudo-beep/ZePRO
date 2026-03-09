import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

interface Rules {
  maxTeamSize: number;
  maxStudentsPerFaculty: number;
}

const AdminChangeRulesScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [rules, setRules] = useState<Rules>({
    maxTeamSize: 4,
    maxStudentsPerFaculty: 10,
  });

  const [tempRules, setTempRules] = useState<Rules>(rules);

  const handleSaveRules = () => {
    if (!tempRules.maxTeamSize || tempRules.maxTeamSize <= 0) {
      Alert.alert('Error', 'Please enter a valid max team size');
      return;
    }
    if (!tempRules.maxStudentsPerFaculty || tempRules.maxStudentsPerFaculty <= 0) {
      Alert.alert('Error', 'Please enter a valid max students per faculty');
      return;
    }

    setRules(tempRules);
    Alert.alert('Success', 'Rules updated successfully!');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#4F46E5" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image
                                source={require('../assets/angle.png')}
                                style={styles.backIcon}
                              />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rule Management</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
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

          <TouchableOpacity style={styles.saveRulesButton} onPress={handleSaveRules}>
            <Text style={styles.saveRulesButtonText}>Save Rules</Text>
          </TouchableOpacity>

          <View style={styles.currentRulesCard}>
            <Text style={styles.currentRulesTitle}>Current Active Rules</Text>
            <Text style={styles.currentRuleText}>Max Team Size: {rules.maxTeamSize}</Text>
            <Text style={styles.currentRuleText}>
              Max Students per Faculty: {rules.maxStudentsPerFaculty}
            </Text>
          </View>
        </View>
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
});

export default AdminChangeRulesScreen;