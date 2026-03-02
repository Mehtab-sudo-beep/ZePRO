import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemeContext } from '../theme/ThemeContext';
import { AuthContext } from '../context/AuthContext';

const AdminSettingsScreen = () => {
  const { theme, colors, toggleTheme } = useContext(ThemeContext);
  const { user, setUser } = useContext(AuthContext);

  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');

  const updateName = () => {
    if (user) {
      setUser({ ...user, name });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>

        {/* Dark Mode */}
        <View style={styles.row}>
          <Text style={{ color: colors.text }}>Dark Mode</Text>
          <Switch value={theme === 'dark'} onValueChange={toggleTheme} />
        </View>

        {/* Change Name */}
        <Text style={[styles.label, { color: colors.text }]}>Change Name</Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          value={name}
          onChangeText={setName}
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
          onPress={updateName}
        >
          <Text style={styles.buttonText}>Update Name</Text>
        </TouchableOpacity>

        {/* Change Password */}
        <Text style={[styles.label, { color: colors.text }]}>
          Change Password
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
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]}
        >
          <Text style={styles.buttonText}>Update Password</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default AdminSettingsScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  label: {
    marginTop: 15,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
