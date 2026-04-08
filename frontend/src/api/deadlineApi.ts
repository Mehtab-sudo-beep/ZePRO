import axios from 'axios';

const API = 'http://localhost:8080/api/deadlines';

// ✅ GET DEADLINES (Works for all users - FC gets all, others get role-specific)
export const getDeadlines = async (token: string) => {
  return axios.get(`${API}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);
};

// ✅ CREATE DEADLINE (Faculty Coordinator only)
export const createDeadline = async (data: any, token: string) => {
  return axios.post(`${API}/create`, data, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);
};

// ✅ GET ALL DEADLINES (Faculty Coordinator only)
export const getAllDeadlines = async (token: string) => {
  return axios.get(`${API}/all`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);
};

// ✅ GET SINGLE DEADLINE
export const getDeadlineById = async (deadlineId: number, token: string) => {
  return axios.get(`${API}/${deadlineId}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);
};

// ✅ TOGGLE ACTIVE FLAG (Faculty Coordinator only)
export const toggleActiveDeadline = async (deadlineId: number, token: string) => {
  return axios.put(`${API}/${deadlineId}/toggle-active`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);
};

// ✅ UPDATE DEADLINE (Faculty Coordinator only)
export const updateDeadline = async (deadlineId: number, data: any, token: string) => {
  return axios.put(`${API}/${deadlineId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);
};

// ✅ DELETE DEADLINE (Faculty Coordinator only)
export const deleteDeadline = async (deadlineId: number, token: string) => {
  return axios.delete(`${API}/${deadlineId}`, {
    headers: { Authorization: `Bearer ${token}` },
  }).then(res => res.data);
};
