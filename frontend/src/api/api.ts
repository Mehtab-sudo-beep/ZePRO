import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'http://4.186.27.158';

const API = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

API.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      console.log("🔐 TOKEN:", token);

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("❌ TOKEN ERROR:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;
