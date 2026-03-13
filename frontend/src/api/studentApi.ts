import axios from 'axios';

export const getProjectRequestsStatus = (studentId: number) =>
  axios.get(`/student/project-requests/${studentId}`);

export const getAssignedProject = (studentId: number) =>
  axios.get(`/student/assigned-project/${studentId}`);

export const getTeamInfo = (studentId: number) =>
  axios.get(`/student/team-info/${studentId}`);