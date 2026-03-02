import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../theme/ThemeContext';

type Props = NativeStackScreenProps<RootStackParamList, 'CreateTeam'>;

const CreateTeamScreen = ({ navigation }: Props) => {
  const { colors } = useContext(ThemeContext);

  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      Alert.alert('Error', 'Team name is required');
      return;
    }

    Alert.alert('Success', `Team "${teamName}" created!`, [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={{ flex: 1 }}>
        {/* Header (Lowered + No Z logo) */}
        <View style={styles.headerContainer}>
          <Text style={[styles.title, { color: colors.text }]}>
            Create New Team
          </Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.formContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Team Name */}
          <Text style={[styles.label, { color: colors.text }]}>
            Team Name (required)
          </Text>

          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={teamName}
            onChangeText={setTeamName}
            placeholder="Enter team name"
            placeholderTextColor={colors.subText}
            autoCapitalize="words"
          />

          {/* Description */}
          <Text style={[styles.label, { color: colors.text }]}>
            Description (optional)
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter team description"
            placeholderTextColor={colors.subText}
            multiline
          />

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={handleCreateTeam}
          >
            <Text style={styles.buttonText}>Create Team</Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={[
              styles.cancelButton,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[styles.cancelButtonText, { color: colors.subText }]}>
              Cancel
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default CreateTeamScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  headerContainer: {
    paddingTop: 30, // lowered properly
    paddingHorizontal: 20,
    paddingBottom: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: '600',
  },

  formContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  label: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 6,
  },

  input: {
    borderWidth: 1,
    padding: 12,
    fontSize: 15,
    borderRadius: 10,
  },

  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  button: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 30,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  cancelButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
    borderWidth: 1,
  },

  cancelButtonText: {
    fontSize: 15,
  },
});
