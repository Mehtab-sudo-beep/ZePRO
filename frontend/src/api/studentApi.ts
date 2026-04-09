import API from './api';


export const createTeam = (data: {
  teamName: string;
  description: string;
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

export const rejectRequest = (requestId: number, reason: string) => {
  return API.post(`/student/reject-request/${requestId}`, { rejectionReason: reason });
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

export const getTeamProjectRequests = (studentId: number) => {
  return API.get(`/student/team-project-requests/${studentId}`);
};

// ================= STUDENT PROFILE =================

// ================= STUDENT PROFILE =================

export const getStudentProfile = async () => {
  const res = await API.get('/student/profile');
  return res.data; // ✅ IMPORTANT
};

export const updateStudentProfile = async (data: any) => {
  const res = await API.put('/student/profile', data);
  return res.data; // ✅ IMPORTANT
};

// ================= STUDENT PROFILE COMPLETION =================

export const getProfileStatus = (studentId: number) => {
  return API.get(`/student/profile-status/${studentId}`);
};

export const completeStudentProfile = (studentId: number, data: {
  rollNumber: string;
  cgpa: number;
  year: string;
  departmentId: number;
  instituteId: number;
  resumeLink: string;
  marksheetLink: string;
}) => {
  return API.post(`/student/complete-profile/${studentId}`, data);
};

export const getAllInstitutes = () => {
  return API.get('/student/institutes');
};

export const getDepartmentsByInstitute = (instituteId: number) => {
  return API.get(`/student/departments/${instituteId}`);
};