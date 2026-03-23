import React, { useState, useContext } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../theme/ThemeContext';
import { AuthContext } from '../context/AuthContext';  // ← ADD

type Props = NativeStackScreenProps<RootStackParamList, 'CreateTeam'>;

// ← Use 10.0.2.2 for Android emulator
const BASE_URL = 'http://10.0.2.2:8080';

const CreateTeamScreen = ({ navigation }: Props) => {
  const { colors } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);  // ← ADD

  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateTeam = async () => {
    if (!teamName.trim()) {
      Alert.alert('Error', 'Team name is required');
      return;
    }

    // ← Guard: studentId must exist
    if (!user?.studentId) {
      Alert.alert('Error', 'Student ID not found. Please log in again.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/student/create-team`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`,
        },
        body: JSON.stringify({
          studentId: user.studentId,   // ← KEY FIX
          teamName: teamName.trim(),
          description: description.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        Alert.alert('Error', err.message || 'Failed to create team');
        return;
      }

      const data = await res.json();
      Alert.alert('Success', `Team "${data.teamName}" created!`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);

    } catch (e) {
      Alert.alert('Network Error', 'Could not reach server. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: colors.text }]}>Create New Team</Text>
        </View>

        <ScrollView contentContainerStyle={styles.formContainer} keyboardShouldPersistTaps="handled">
          <Text style={[styles.label, { color: colors.text }]}>Team Name (required)</Text>
          <TextInput
            style={[styles.input, {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
            }]}
            value={teamName}
            onChangeText={setTeamName}
            placeholder="Enter team name"
            placeholderTextColor={colors.subText}
            autoCapitalize="words"
          />

          <Text style={[styles.label, { color: colors.text }]}>Description (optional)</Text>
          <TextInput
            style={[styles.input, styles.textArea, {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
            }]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter team description"
            placeholderTextColor={colors.subText}
            multiline
          />

          <TouchableOpacity
            style={[styles.button, { backgroundColor: loading ? colors.subText : colors.primary }]}
            onPress={handleCreateTeam}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Creating...' : 'Create Team'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.cancelButtonText, { color: colors.subText }]}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default CreateTeamScreen;

const styles = StyleSheet.create({
  headerContainer: { paddingTop: 30, paddingHorizontal: 20, paddingBottom: 10 },
  title: { fontSize: 20, fontWeight: '600' },
  formContainer: { paddingHorizontal: 20, paddingBottom: 30 },
  label: { fontSize: 15, fontWeight: '600', marginTop: 20, marginBottom: 6 },
  input: { borderWidth: 1, padding: 12, fontSize: 15, borderRadius: 10 },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 30 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  cancelButton: { paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 12, borderWidth: 1 },
  cancelButtonText: { fontSize: 15 },
});