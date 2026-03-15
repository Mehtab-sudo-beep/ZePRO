import React, { useContext, useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { createProject } from '../api/facultyApi';
import { AuthContext } from '../context/AuthContext';

const CreateProjectScreen = () => {
  const { user } = useContext(AuthContext);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    await createProject({ title, description }, user.token);
  };

  return (
    <View>
      <TextInput placeholder="Title" onChangeText={setTitle} />
      <TextInput placeholder="Description" onChangeText={setDescription} />
      <Button title="Create Project" onPress={handleCreate} />
    </View>
  );
};

export default CreateProjectScreen;
