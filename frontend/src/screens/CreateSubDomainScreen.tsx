import React, { useContext, useEffect, useState } from 'react';
import { View, TextInput, Button } from 'react-native';
import { createSubDomain, getDomains } from '../api/facultyApi';
import { AuthContext } from '../context/AuthContext';

const CreateSubDomainScreen = () => {
  const { user } = useContext(AuthContext);

  const [domains, setDomains] = useState<any[]>([]);
  const [domainId, setDomainId] = useState<number>();
  const [name, setName] = useState('');

  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    const d = await getDomains();
    setDomains(d);
    if (d.length > 0) setDomainId(d[0].id);
  };

  const handleCreate = async () => {
    await createSubDomain(name, domainId!, user.token);
  };

  return (
    <View>
      <TextInput placeholder="Subdomain Name" onChangeText={setName} />
      <Button title="Create Subdomain" onPress={handleCreate} />
    </View>
  );
};

export default CreateSubDomainScreen;
