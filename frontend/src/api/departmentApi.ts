import API from './api';

// ✅ GET all departments for an institute
export const getDepartments = (instituteId: string) => {
  console.log('📡 GET /admin/departments/', instituteId);
  return API.get(`/admin/departments/${instituteId}`);
};

// ✅ CREATE department
export const addDepartment = (data: {
  departmentName: string;
  instituteId: string;
  departmentCode: string;
  description?: string;
}) => {
  console.log('📤 POST /admin/department', data);
  return API.post('/admin/department', data);
};

// ✅ DELETE department
export const deleteDepartment = (id: string) => {
  console.log('🗑 DELETE /admin/department/', id);
  return API.delete(`/admin/department/${id}`);
};

// ✅ GET users by department
export const getUsersByDepartment = (departmentId: string) => {
  console.log('📡 GET /admin/users/', departmentId);
  return API.get(`/admin/users/${departmentId}`);
};

// ✅ GET FACULTY BY DEPARTMENT
export const getFacultyByDepartment = (departmentId: string) => {
  console.log('📡 GET /admin/department/' + departmentId + '/faculty');
  return API.get(`/admin/department/${departmentId}/faculty`);
};

// ✅ ASSIGN FACULTY COORDINATOR - FIXED ENDPOINT
export const assignFacultyCoordinator = (departmentId: string, facultyId: string) => {
  const payload = {
    facultyId: parseInt(facultyId),
    departmentId: parseInt(departmentId),
  };
  
  console.log('📤 POST /admin/department/' + departmentId + '/coordinator');
  console.log('Payload:', payload);
  
  return API.post(`/admin/department/${departmentId}/coordinator`, payload);
};

// ✅ REMOVE FACULTY COORDINATOR
export const removeFacultyCoordinator = (departmentId: string, facultyId: string) => {
  console.log('🗑 DELETE /admin/department/' + departmentId + '/coordinator/' + facultyId);
  return API.delete(`/admin/department/${departmentId}/coordinator/${facultyId}`);
};

// ✅ GET DEPARTMENT STATS
export const getDepartmentStats = (departmentId: string) => {
  console.log('📊 GET /admin/department/' + departmentId + '/stats');
  return API.get(`/admin/department/${departmentId}/stats`);
};