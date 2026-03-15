import React, { useState, useContext } from 'react';
import { View, TextInput, Button } from 'react-native';
import { createDomain } from '../api/facultyApi';
import { AuthContext } from '../context/AuthContext';

const CreateDomainScreen = () => {
  const { user } = useContext(AuthContext);

  const [name, setName] = useState('');

  const handleCreate = async () => {
    await createDomain(name, user.token);
  };

  return (
    <View>
      <TextInput placeholder="Domain Name" onChangeText={setName} />
      <Button title="Create Domain" onPress={handleCreate} />
    </View>
  );
};

export default CreateDomainScreen;
