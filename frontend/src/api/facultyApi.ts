import axios from 'axios';

const API = 'http://localhost:8080';

// ✅ GET ALL INSTITUTES
export const getAllInstitutes = () => {
  console.log('[facultyApi] 📡 Calling getAllInstitutes');
  return axios.get(`${API}/faculty/institutes`);
};

// ✅ GET DEPARTMENTS BY INSTITUTE
export const getDepartmentsByInstitute = (instituteId: number) => {
  console.log('[facultyApi] 📡 Calling getDepartmentsByInstitute for instituteId:', instituteId);
  return axios.get(`${API}/faculty/departments/${instituteId}`);
};

// ✅ GET FACULTY PROFILE STATUS
export const getFacultyProfileStatus = (facultyId: number, token: string) => {
  console.log('[facultyApi] 📡 Calling getFacultyProfileStatus for facultyId:', facultyId);
  return axios.get(`${API}/faculty/profile-status/${facultyId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// ✅ COMPLETE FACULTY PROFILE
export const completeFacultyProfile = (facultyId: number, data: {
  employeeId: string;
  designation: string;
  specialization: string;
  experience: string;
  qualification: string;
  cabinNo: string;
  phone: string;
  problemStatementLink: string;
  domains: string;
  subDomains: string;
  departmentId: number;
  instituteId: number;
}, token: string) => {
  console.log('[facultyApi] 📤 Calling completeFacultyProfile for facultyId:', facultyId);
  console.log('[facultyApi] Payload:', data);
  return axios.post(`${API}/faculty/complete-profile/${facultyId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getPendingRequests = async (token: string) => {
  const res = await axios.get(`${API}/faculty/pending-requests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getFacultyProjects = async (token: string) => {
  const res = await axios.get(`${API}/faculty/my-projects`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const assignProject = async (
  projectId: number,
  teamId: number,
  token: string,
) => {
  const res = await axios.post(
    `${API}/faculty/assign-project`,
    { projectId, teamId },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
};

export const createProject = async (data: any, token: string) => {
  const res = await axios.post(`${API}/faculty/project`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const updateProject = async (projectId: number, data: any, token: string) => {
  const res = await axios.put(`${API}/faculty/project/${projectId}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const activateProjectStatus = async (projectId: number, token: string) => {
  const res = await axios.post(`${API}/faculty/project/${projectId}/activate`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const deactivateProjectStatus = async (projectId: number, token: string) => {
  const res = await axios.post(`${API}/faculty/project/${projectId}/deactivate`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const createDomain = async (name: string, token: string) => {
  const res = await axios.post(
    `${API}/faculty/domain`,
    { name },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
};

export const createSubDomain = async (
  name: string,
  domainId: number,
  token: string,
) => {
  const res = await axios.post(
    `${API}/faculty/subdomain`,
    { name, domainId },
    { headers: { Authorization: `Bearer ${token}` } },
  );
  return res.data;
};

export const getDomains = async (token: string) => {
  const res = await axios.get(`${API}/api/domains`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getSubDomains = async (domainId: number, token: string) => {
  const res = await axios.get(`${API}/api/subdomains/${domainId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getAllMeetings = async (token: string) => {
  const res = await axios.get(`${API}/faculty/meetings`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return res.data;
};

export const scheduleMeeting = async (
  requestId: number,
  meetingTime: string,
  meetingLink: string,
  location: string,
  token: string,
) => {
  const res = await axios.post(
    `${API}/faculty/meetings`,
    {
      requestId,
      meetingTime,
      meetingLink,
      location,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );

  return res.data;
};

export const cancelMeeting = async (meetingId: number, token: string) => {
  const res = await axios.put(
    `${API}/faculty/meetings/${meetingId}/cancel`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return res.data;
};

export const cancelRequest = async (requestId: number, token: string) => {
  const res = await axios.put(
    `${API}/faculty/requests/${requestId}/cancel`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return res.data;
};

export const getFacultyProfile = async (token: string) => {
  return axios.get(`${API}/faculty/profile`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(res => res.data);
};

export const updateFacultyProfile = async (data: any, token: string) => {
  return axios.put(`${API}/faculty/profile`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }).then(res => res.data);
};

export const completeMeeting = async (meetingId: number, token: string) => {
  return axios.put(`${API}/faculty/meetings/${meetingId}/complete`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const acceptProject = async (requestId: number, token: string) => {
  return axios.put(`${API}/faculty/meetings/request/${requestId}/accept`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const rejectProject = async (requestId: number, token: string, reason: string) => {
  return axios.put(`${API}/faculty/meetings/request/${requestId}/reject`, { reason }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const rescheduleMeeting = async (
  requestId: number,
  meetingTime: string,
  meetingLink: string,
  location: string,
  title: string,
  token: string,
) => {
  return axios.put(
    `${API}/faculty/meetings/request/${requestId}/reschedule`,
    {
      requestId,
      meetingTime,
      meetingLink,
      location,
      title,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  ).then(res => res.data);
};

