import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../theme/ThemeContext';
import { AuthContext } from '../context/AuthContext';
import { AlertContext } from '../context/AlertContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createTeam } from '../api/studentApi';
type Props = NativeStackScreenProps<RootStackParamList, 'CreateTeam'>;

// UI UPGRADED — LOGIC UNCHANGED

const CreateTeamScreen = ({ navigation }: Props) => {
  const { colors } = useContext(ThemeContext);
  const { user, setUser } = useContext(AuthContext);
  const { showAlert } = useContext(AlertContext);
  const [teamNameError, setTeamNameError] = useState('');

  const isDark = colors.background === '#111827';
  const divider = isDark ? '#374151' : '#E5E7EB';

  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');

 const handleCreateTeam = async () => {
  if (!teamName.trim()) {
    setTeamNameError('Team name is required');
    return;
  }

  setTeamNameError(''); // clear error

  try {
    const studentId = await AsyncStorage.getItem('studentId');

    await createTeam({
      teamName,
      studentId: Number(studentId),
      description,
    });

    setUser({
      ...user,
      isInTeam: true,
      isTeamLead: true,
    });

    showAlert("Team created successfully");
    navigation.replace("StudentHome");

  } catch (err) {
    console.log("CREATE TEAM ERROR:", err);
    showAlert("Error creating team");
  }
};

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>

      {/* HEADER */}
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: divider },
        ]}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={
              isDark
                ? require('../assets/angle-white.png')
                : require('../assets/angle.png')
            }
            style={styles.backIcon}
          />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Create Team
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* FORM CARD */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          
          {/* TEAM NAME */}
          <Text style={[styles.label, { color: colors.subText }]}>
            TEAM NAME
          </Text>

          <TextInput
            style={[
  styles.input,
  {
    backgroundColor: colors.background,
    borderColor: teamNameError ? '#EF4444' : colors.border, // 🔥 RED IF ERROR
    color: colors.text,
  },
]}
            value={teamName}
            onChangeText={setTeamName}
            placeholder="Enter team name"
            placeholderTextColor={colors.subText}
          />

          {/* DESCRIPTION */}
          <Text style={[styles.label, { color: colors.subText }]}>
            DESCRIPTION
          </Text>

          <TextInput
            style={[
              styles.input,
              styles.textArea,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter description"
            placeholderTextColor={colors.subText}
            multiline
          />
        </View>

        {/* PRIMARY BUTTON */}
        <TouchableOpacity
          style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
          onPress={handleCreateTeam}
        >
          <Text style={styles.btnText}>Create Team</Text>
        </TouchableOpacity>

        {/* CANCEL BUTTON */}
        <TouchableOpacity
          style={[
            styles.secondaryBtn,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.secondaryText, { color: colors.subText }]}>
            Cancel
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

export default CreateTeamScreen;

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  header: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  content: {
    padding: 16,
  },

  card: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },

  label: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 6,
    marginTop: 12,
  },

  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
  },

  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  primaryBtn: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },

  secondaryBtn: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
  },

  btnText: {
    color: '#fff',
    fontWeight: '700',
  },

  secondaryText: {
    fontWeight: '600',
  },

  backIcon: {
    width: 22,
    height: 22,
    resizeMode: 'contain',
  },
});