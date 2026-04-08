import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');

      console.log("🔐 TOKEN:", token);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    } catch (error) {
      console.log("❌ TOKEN ERROR:", error);
      return config;
    }
  },
  (error) => Promise.reject(error)
);

export const getInstitutes = () => {
  console.log("📡 GET /admin/institutes");
  return api.get('/admin/institutes');
};

// ✅ UPDATED: Add tail field
export const addInstitute = (data: {
  instituteName: string;
  instituteCode: string;
  address: string;
  city: string;
  state: string;
  phoneNumber: string;
  email: string;
  website: string;
  tail: string;  // ✅ NEW FIELD
}) => {
  console.log("📤 POST /admin/institute", data);
  return api.post('/admin/institute', data);
};

export const deleteInstitute = (id: string) => {
  console.log("🗑 DELETE:", id);
  return api.delete(`/admin/institute/${id}`);
};