import React, { useState } from 'react';
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
import { Image } from 'react-native';
import { RootStackParamList } from '../navigation/AppNavigator'; 
import { SafeAreaView } from 'react-native-safe-area-context';


type Props = NativeStackScreenProps<RootStackParamList, 'CreateTeam'>;

const CreateTeamScreen = ({ navigation }: Props) => {
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateTeam = () => {
    if (!teamName.trim()) {
      Alert.alert('Error', 'Team name is required');
      return;
    }
    // TODO: Integrate with your API to create team and enable join requests view
    Alert.alert(
      'Success',
      `Team "${teamName}" created!${description ? `\nDescription: ${description}` : ''}\n\nJoin requests will appear in your team dashboard.`,
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Image
          source={require('../assets/zepro.png')}
          style={styles.headerIcon}
          resizeMode="contain"
        />
        <Text style={[styles.title, { marginLeft: 8 }]}>
          Create New Team
        </Text>
      </View>
      <ScrollView style={styles.container1} keyboardShouldPersistTaps="handled">
      <Text style={styles.label}>Team Name (required)</Text>
      <TextInput
        style={styles.input}
        value={teamName}
        onChangeText={setTeamName}
        placeholder="Enter team name"
        autoCapitalize="words"
      />
      <Text style={styles.label}>Description (optional)</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="Enter team description"
        multiline
        numberOfLines={4}
      />
      <TouchableOpacity style={styles.button} onPress={handleCreateTeam}>
        <Text style={styles.buttonText}>Create Team</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.cancelButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.cancelButtonText}>Cancel</Text>
      </TouchableOpacity>
    </ScrollView>
    /</View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container1:{
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    
    
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 12,
    fontSize: 16,
    borderRadius: 8,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 30,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  cancelButtonText: {
    color: '#6c757d',
    fontSize: 16,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  headerIcon: {
  width: 62,
  height: 42,
},
});

export default CreateTeamScreen;
