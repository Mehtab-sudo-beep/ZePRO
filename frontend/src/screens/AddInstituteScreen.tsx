import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

const AddInstituteScreen: React.FC = () => {
  const navigation = useNavigation<any>();

  const [form, setForm] = useState({
    name: '',
    code: '',
    address: '',
    city: '',
    state: '',
    phone: '',
    email: '',
    website: '',
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ✅ VALIDATION
  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) newErrors.name = 'Institute name is required';
    if (!form.code.trim()) newErrors.code = 'Institute code is required';
    if (!form.address.trim()) newErrors.address = 'Address is required';
    if (!form.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    if (!form.website.trim()) newErrors.website = 'Website is required';

    if (form.email && !/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = 'Enter a valid email address';

    if (form.phone && !/^(\+91)?[6-9]\d{9}$/.test(form.phone))
      newErrors.phone = 'Enter a valid phone number';

    return newErrors;
  };

  const handleSubmit = async () => {
    console.log('====================');
    console.log('[AddInstitute] 🚀 Submit started');

    const validationErrors = validate();

    if (Object.keys(validationErrors).length > 0) {
      console.log('[AddInstitute] ❌ Validation failed');
      console.log(validationErrors);
      setErrors(validationErrors);
      return;
    }

    console.log('[AddInstitute] ✅ Validation passed');
    setLoading(true);

    try {
      const payload = {
        instituteName: form.name,
        instituteCode: form.code,
        address: form.address,
        city: form.city,
        state: form.state,
        phoneNumber: form.phone,
        email: form.email,
        website: form.website,
      };

      console.log('[AddInstitute] 📤 Payload:');
      console.log(JSON.stringify(payload, null, 2));

      // 🔥 IMPORTANT: Replace with your system IP
      const API_URL = 'http://localhost:8080/admin/institute';

      console.log('[AddInstitute] 🌐 Calling API:', API_URL);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      console.log('[AddInstitute] 📥 Response received');
      console.log('[AddInstitute] Status:', response.status);

      const responseText = await response.text();
      console.log('[AddInstitute] Raw response:', responseText);

      if (!response.ok) {
        console.log('[AddInstitute] ❌ Request failed');
        throw new Error(`Status ${response.status}`);
      }

      let data;
      try {
        data = JSON.parse(responseText);
        console.log('[AddInstitute] ✅ Parsed response:', data);
      } catch (e) {
        console.log('[AddInstitute] ⚠️ Not JSON response');
      }

      Alert.alert(
        'Success',
        `${data?.instituteName || form.name} added successfully`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

    } catch (error: any) {
      console.log('[AddInstitute] 💥 ERROR:', error.message);
      console.log(error);

      Alert.alert('Error', 'Failed to create institute');
    } finally {
      setLoading(false);
      console.log('[AddInstitute] 🏁 Finished');
      console.log('====================');
    }
  };

  const handleChange = (field: string, value: string) => {
    console.log(`[AddInstitute] ✏️ ${field}:`, value);

    setForm(prev => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Image source={require('../assets/angle.png')} style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Institute</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <Field
            label="Institute Name *"
            placeholder="e.g. NIT Calicut"
            value={form.name}
            onChangeText={(t: string) => handleChange('name', t)}
            error={errors.name}
          />

          <Field
            label="Institute Code *"
            placeholder="e.g. NITC"
            value={form.code}
            onChangeText={(t: string) => handleChange('code', t.toUpperCase())}
            error={errors.code}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>

          <Field
            label="Address *"
            placeholder="Street address"
            value={form.address}
            onChangeText={(t: string) => handleChange('address', t)}
            error={errors.address}
            multiline
          />

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Field
                label="City"
                placeholder="City"
                value={form.city}
                onChangeText={(t: string) => handleChange('city', t)}
              />
            </View>

            <View style={{ flex: 1, marginLeft: 8 }}>
              <Field
                label="State"
                placeholder="State"
                value={form.state}
                onChangeText={(t: string) => handleChange('state', t)}
              />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Details</Text>

          <Field
            label="Phone *"
            placeholder="+91 XXXXX XXXXX"
            value={form.phone}
            onChangeText={(t: string) => handleChange('phone', t)}
            error={errors.phone}
          />

          <Field
            label="Email *"
            placeholder="admin@inst.edu"
            value={form.email}
            onChangeText={(t: string) => handleChange('email', t)}
            error={errors.email}
          />

          <Field
            label="Website *"
            placeholder="https://example.com"
            value={form.website}
            onChangeText={(t: string) => handleChange('website', t)}
            error={errors.website}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitText}>Create Institute</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
};

const Field = ({
  label,
  placeholder,
  value,
  onChangeText,
  error,
  multiline = false,
}: any) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={{ fontWeight: '600' }}>{label}</Text>

    <TextInput
      style={{
        borderWidth: 1,
        borderColor: error ? 'red' : '#ddd',
        padding: 10,
        borderRadius: 8,
        marginTop: 5,
      }}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      multiline={multiline}
    />

    {error && <Text style={{ color: 'red' }}>{error}</Text>}
  </View>
);

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
  },

  backBtn: { width: 40 },
  backIcon: { width: 22, height: 22 },

  headerTitle: { fontSize: 18, fontWeight: 'bold' },

  scrollContent: { padding: 16 },

  section: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },

  sectionTitle: { fontWeight: 'bold', marginBottom: 10 },

  row: { flexDirection: 'row' },

  submitBtn: {
    backgroundColor: '#2563EB',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },

  submitBtnDisabled: { backgroundColor: '#93C5FD' },

  submitText: { color: '#fff', fontWeight: 'bold' },
});

export default AddInstituteScreen;