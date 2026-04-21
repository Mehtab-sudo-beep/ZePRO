import API from './api';

// ✅ GET DEADLINES (Works for all users)
export const getDeadlines = async () => {
  return API.get('/api/deadlines').then(res => res.data);
};

// ✅ CREATE DEADLINE (Faculty Coordinator only)
export const createDeadline = async (data: any) => {
  return API.post('/api/deadlines/create', data).then(res => res.data);
};

// ✅ GET ALL DEADLINES FOR COORDINATOR'S DEPARTMENT (Faculty Coordinator only)
export const getCoordinatorAllDeadlines = async () => {
  return API.get('/api/deadlines/coordinator/all').then(res => res.data);
};

// ✅ GET DEADLINES BY ROLE FOR COORDINATOR'S DEPARTMENT
export const getDeadlinesByRole = async (role: string) => {
  return API.get(`/api/deadlines/role/${role}`).then(res => res.data);
};

// ✅ GET SINGLE DEADLINE BY ID
export const getDeadlineById = async (deadlineId: number) => {
  return API.get(`/api/deadlines/${deadlineId}`).then(res => res.data);
};

// ✅ TOGGLE DEADLINE ACTIVE STATUS (Faculty Coordinator only)
export const toggleActiveDeadline = async (deadlineId: number) => {
  return API.put(`/api/deadlines/${deadlineId}/toggle-active`, {}).then(res => res.data);
};

// ✅ UPDATE DEADLINE (Faculty Coordinator only)
export const updateDeadline = async (deadlineId: number, data: any) => {
  return API.put(`/api/deadlines/${deadlineId}`, data).then(res => res.data);
};

// ✅ DELETE DEADLINE (Faculty Coordinator only)
export const deleteDeadline = async (deadlineId: number) => {
  return API.delete(`/api/deadlines/${deadlineId}`).then(res => res.data);
};

// ✅ SEND DEADLINE EMAIL MANUALLY (Faculty Coordinator only)
export const sendDeadlineEmailManually = async (deadlineId: number) => {
  return API.post(`/api/deadlines/${deadlineId}/send-email`, {}).then(res => res.data);
};
