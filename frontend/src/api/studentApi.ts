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

export const getAllTeams = (studentId: number) => {
  return API.get(`/student/teams/${studentId}`);
};

export const sendJoinRequest = (data: {
  studentId: number;
  teamId: number;
}) => {
  return API.post("/student/send-join-request", data);
};

export const getReceivedRequests = (studentId: number) => {
  return API.get(`/student/team-join-requests/${studentId}`);
};

export const approveRequest = (requestId: number) => {
  return API.post(`/student/approve-request/${requestId}`);
};

export const rejectRequest = (requestId: number) => {
  return API.post(`/student/reject-request/${requestId}`);
};
export const getSentRequests = (studentId: number) => {
  return API.get(`/student/sent-requests/${studentId}`);
};
export const getAllProjects = () => {
  return API.get("/student/projects");
};

/* SEND project request */
export const sendProjectRequest = (data: {
  studentId: number;
  projectId: number;
}) => {
  return API.post("/student/request-project", data);
};

export const getRequestedProjects = (studentId: number) => {
  return API.get(`/student/requested-projects/${studentId}`);
};
export const getProjectScheduleResponses = (studentId: number) => {
  return API.get(`/student/project-requests/${studentId}`);
};

export const getMeetingDetails = (requestId: number) => {
  return API.get(`/student/meeting-details/${requestId}`);
};