import axios from 'axios';

const API = 'http://10.226.126.133:8080/api/deadlines';

// ✅ GET DEADLINES (Works for all users)
// - Faculty Coordinator gets all deadlines for their department
// - Other users get role-specific deadlines for their department
export const getDeadlines = async (token: string) => {
  return axios.get(`${API}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);
};

// ✅ CREATE DEADLINE (Faculty Coordinator only)
// Department is auto-bound to coordinator's department
export const createDeadline = async (data: any, token: string) => {
  return axios.post(`${API}/create`, data, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);
};

// ✅ GET ALL DEADLINES FOR COORDINATOR'S DEPARTMENT (Faculty Coordinator only)
export const getCoordinatorAllDeadlines = async (token: string) => {
  return axios.get(`${API}/coordinator/all`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);
};

// ✅ GET DEADLINES BY ROLE FOR COORDINATOR'S DEPARTMENT
// Returns only active deadlines for a specific role
export const getDeadlinesByRole = async (role: string, token: string) => {
  return axios.get(`${API}/role/${role}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);
};

// ✅ GET SINGLE DEADLINE BY ID
export const getDeadlineById = async (deadlineId: number, token: string) => {
  return axios.get(`${API}/${deadlineId}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);
};

// ✅ TOGGLE DEADLINE ACTIVE STATUS (Faculty Coordinator only)
// Department verification is done on backend
export const toggleActiveDeadline = async (deadlineId: number, token: string) => {
  return axios.put(`${API}/${deadlineId}/toggle-active`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);
};

// ✅ UPDATE DEADLINE (Faculty Coordinator only)
// Department stays fixed - cannot be changed
// Only title, description, date, time, and roleSpecificity can be updated
export const updateDeadline = async (deadlineId: number, data: any, token: string) => {
  return axios.put(`${API}/${deadlineId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);
};

// ✅ DELETE DEADLINE (Faculty Coordinator only)
// Department verification is done on backend
export const deleteDeadline = async (deadlineId: number, token: string) => {
  return axios.delete(`${API}/${deadlineId}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);
};
