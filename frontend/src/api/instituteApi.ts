import API from './api';

export const getInstitutes = () => {
  console.log("📡 GET /admin/institutes");
  return API.get('/admin/institutes');
};

export const addInstitute = (data: {
  instituteName: string;
  instituteCode: string;
  address: string;
  city: string;
  state: string;
  phoneNumber: string;
  email: string;
  website: string;
  tail: string;
}) => {
  console.log("📤 POST /admin/institute", data);
  return API.post('/admin/institute', data);
};

export const deleteInstitute = (id: string) => {
  console.log("🗑 DELETE:", id);
  return API.delete(`/admin/institute/${id}`);
};

export const getAdminDashboardStats = () => {
  console.log('📊 GET /admin/dashboard/stats');
  return API.get('/admin/dashboard/stats');
};

export const getFacultyDashboardStats = (facultyId: number) => {
  console.log('📊 GET /admin/faculty/' + facultyId + '/dashboard-stats');
  return API.get(`/admin/faculty/${facultyId}/dashboard-stats`);
};

export const getStudentDashboardStats = (studentId: number) => {
  console.log('📊 GET /admin/student/' + studentId + '/dashboard-stats');
  return API.get(`/admin/student/${studentId}/dashboard-stats`);
};