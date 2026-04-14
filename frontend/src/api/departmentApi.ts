import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://localhost:8080';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      console.log('[API] 🔐 Token attached:', token.substring(0, 20) + '...');
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('[API] ⚠️ No token found!');
    }
  } catch (e) {
    console.log('❌ Token error:', e);
  }
  return config;
});

// ✅ GET all departments for an institute
export const getDepartments = (instituteId: string) => {
  console.log('📡 GET /admin/departments/', instituteId);
  return api.get(`/admin/departments/${instituteId}`);
};

// ✅ CREATE department
export const addDepartment = (data: {
  departmentName: string;
  instituteId: string;
  departmentCode: string;
  description?: string;
}) => {
  console.log('📤 POST /admin/department', data);
  return api.post('/admin/department', data);
};

// ✅ DELETE department
export const deleteDepartment = (id: string) => {
  console.log('🗑 DELETE /admin/department/', id);
  return api.delete(`/admin/department/${id}`);
};

// ✅ GET users by department
export const getUsersByDepartment = (departmentId: string) => {
  console.log('📡 GET /admin/users/', departmentId);
  return api.get(`/admin/users/${departmentId}`);
};

// ✅ GET FACULTY BY DEPARTMENT
export const getFacultyByDepartment = (departmentId: string) => {
  console.log('📡 GET /admin/department/' + departmentId + '/faculty');
  return api.get(`/admin/department/${departmentId}/faculty`);
};

// ✅ ASSIGN FACULTY COORDINATOR - FIXED ENDPOINT
export const assignFacultyCoordinator = (departmentId: string, facultyId: string) => {
  const payload = {
    facultyId: parseInt(facultyId),
    departmentId: parseInt(departmentId),
  };
  
  console.log('📤 POST /admin/department/' + departmentId + '/coordinator');
  console.log('Payload:', payload);
  
  return api.post(`/admin/department/${departmentId}/coordinator`, payload);
};

// ✅ REMOVE FACULTY COORDINATOR
export const removeFacultyCoordinator = (departmentId: string, facultyId: string) => {
  console.log('🗑 DELETE /admin/department/' + departmentId + '/coordinator/' + facultyId);
  return api.delete(`/admin/department/${departmentId}/coordinator/${facultyId}`);
};

// ✅ GET DEPARTMENT STATS
export const getDepartmentStats = (departmentId: string) => {
  console.log('📊 GET /admin/department/' + departmentId + '/stats');
  return api.get(`/admin/department/${departmentId}/stats`);
};