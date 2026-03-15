import API from './api';

export const createTeam = (data: {
  teamName: string;
  studentId: number;
}) => API.post('/student/create-team', data);

export const joinTeam = (data: {
  teamId: number;
  studentId: number;
}) => API.post('/student/join-team', data);

export const getProjectRequestsStatus = (studentId: number) =>
  API.get(`/student/project-requests/${studentId}`);

export const getAssignedProject = (studentId: number) =>
  API.get(`/student/assigned-project/${studentId}`);

export const getTeamInfo = (studentId: number) =>
  API.get(`/student/team-info/${studentId}`);