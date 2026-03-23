import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:8080';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {}
  return config;
});

// GET all departments for a given institute
export const getDepartments = (instituteId: string) => {
  console.log('📡 GET /admin/departments/', instituteId);
  return api.get(`/admin/departments/${instituteId}`);
};

// POST create a department
export const addDepartment = (data: {
  departmentName: string;
  instituteId: number;
}) => {
  console.log('📤 POST /admin/department', data);
  return api.post('/admin/department', data);
};

// DELETE department by id
export const deleteDepartment = (id: string) => {
  console.log('🗑 DELETE /admin/department/', id);
  return api.delete(`/admin/department/${id}`);
};

// GET all users by department
export const getUsersByDepartment = (departmentId: string) => {
  console.log('📡 GET /admin/users/', departmentId);
  return api.get(`/admin/users/${departmentId}`);
};

// GET all users in database
export const getAllUsers = () => {
  console.log('📡 GET /admin/users');
  return api.get('/admin/users');
};
