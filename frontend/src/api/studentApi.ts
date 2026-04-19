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

export const getAssignedProject = (studentId: number) => {
  console.log('[studentApi] 📡 Fetching assigned project for student:', studentId);
  return API.get(`/student/assigned-project/${studentId}`)
    .then(res => {
      console.log('[studentApi] ✅ Assigned project response:', res.data);
      return res.data; // ✅ Return the data directly
    })
    .catch(err => {
      console.log('[studentApi] ❌ Error fetching assigned project:', err);
      throw err;
    });
};

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
  const formData = new FormData();
  
  if (data.name) formData.append('name', data.name);
  if (data.email) formData.append('email', data.email);
  
  if (data.resumeFile && data.resumeFile.uri) {
    formData.append('resumeFile', {
      uri: data.resumeFile.uri,
      name: data.resumeFile.name,
      type: data.resumeFile.mimeType || 'application/pdf',
    } as any);
  }

  if (data.marksheetFile && data.marksheetFile.uri) {
    formData.append('marksheetFile', {
      uri: data.marksheetFile.uri,
      name: data.marksheetFile.name,
      type: data.marksheetFile.mimeType || 'application/pdf',
    } as any);
  }

  const res = await API.put('/student/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data; // ✅ IMPORTANT
};

// ================= STUDENT PROFILE COMPLETION =================

export const getProfileStatus = (studentId: number) => {
  console.log('[studentApi] 📡 Calling getProfileStatus for studentId:', studentId);
  return API.get(`/student/profile-status/${studentId}`);
};

export const completeStudentProfile = (studentId: number, data: {
  rollNumber: string;
  cgpa: number;
  year: string;
  instituteId: number;
  departmentId: number;
  resumeFile: any;     // File object from DocumentPicker
  marksheetFile: any;  // File object from DocumentPicker
  phone: string;
}) => {
  console.log('[studentApi] 📤 Calling completeStudentProfile for studentId:', studentId);
  console.log('[studentApi] Payload mapped to FormData:', data);

  const formData = new FormData();
  formData.append('rollNumber', data.rollNumber);
  formData.append('cgpa', data.cgpa.toString());
  formData.append('year', data.year);
  formData.append('instituteId', data.instituteId.toString());
  formData.append('departmentId', data.departmentId.toString());
  formData.append('phone', data.phone);

  if (data.resumeFile) {
    formData.append('resumeFile', {
      uri: data.resumeFile.uri,
      name: data.resumeFile.name,
      type: data.resumeFile.mimeType || 'application/pdf',
    } as any);
  }

  if (data.marksheetFile) {
    formData.append('marksheetFile', {
      uri: data.marksheetFile.uri,
      name: data.marksheetFile.name,
      type: data.marksheetFile.mimeType || 'application/pdf',
    } as any);
  }

  return API.post(`/student/complete-profile/${studentId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

export const getAllInstitutes = () => {
  console.log('[studentApi] 📡 Calling getAllInstitutes');
  return API.get('/student/institutes');
};

export const getDepartmentsByInstitute = (instituteId: number) => {
  console.log('[studentApi] 📡 Calling getDepartmentsByInstitute for instituteId:', instituteId);
  return API.get(`/student/departments/${instituteId}`);
};

export const getDepartmentDeadlines = (studentId: number) => {
  console.log('[studentApi] 📡 Fetching department deadlines for:', studentId);
  return API.get(`/student/department-deadlines/${studentId}`);
};

export const leaveTeam = (studentId: number) => {
  console.log('[studentApi] 📤 Leaving team for student:', studentId);
  return API.post(`/student/team/leave/${studentId}`);
};

export const assignTeamLeader = (currentLeadId: number, newLeadId: number) => {
  console.log('[studentApi] 📤 Assigning new team leader. Current:', currentLeadId, 'New:', newLeadId);
  return API.put(`/student/team/assign-leader/${currentLeadId}/${newLeadId}`);
};