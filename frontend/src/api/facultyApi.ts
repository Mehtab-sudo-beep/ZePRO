import API from './api';

// ✅ GET ALL INSTITUTES
export const getAllInstitutes = (token: string) => {
  console.log('[facultyApi] 📡 Calling getAllInstitutes');
  return API.get('/faculty/institutes');
};

// ✅ GET DEPARTMENTS BY INSTITUTE
export const getDepartmentsByInstitute = (instituteId: number) => {
  console.log('[facultyApi] 📡 Calling getDepartmentsByInstitute for instituteId:', instituteId);
  return API.get(`/faculty/departments/${instituteId}`);
};

// ✅ GET FACULTY PROFILE STATUS
export const getFacultyProfileStatus = (facultyId: number, token: string) => {
  console.log('[facultyApi] 📡 Calling getFacultyProfileStatus for facultyId:', facultyId);
  return API.get(`/faculty/profile-status/${facultyId}`);
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
  departmentId: number;
  instituteId: number;
}, token: string) => {
  console.log('[facultyApi] 📤 Calling completeFacultyProfile for facultyId:', facultyId);
  console.log('[facultyApi] Payload:', data);
  return API.post(`/faculty/complete-profile/${facultyId}`, data);
};

export const getPendingRequests = async (degree: string, token: string) => {
  const res = await API.get(`/faculty/pending-requests?degree=${degree}`);
  return res.data;
};

export const getFacultyProjects = async (degree: string, token: string) => {
  const res = await API.get(`/faculty/my-projects?degree=${degree}`);
  return res.data;
};

export const getAllocationRules = async (degree: string, token: string) => {
  const res = await API.get(`/faculty/allocation-rules?degree=${degree}`);
  return res.data;
};

export const assignProject = async (
  projectId: number,
  teamId: number,
  token: string,
) => {
  const res = await API.post(
    `/faculty/assign-project`,
    { projectId, teamId }
  );
  return res.data;
};

export const createProject = async (data: any, token: string) => {
  const res = await API.post(`/faculty/project`, data);
  return res.data;
};

export const updateProject = async (projectId: number, data: any, token: string) => {
  const res = await API.put(`/faculty/project/${projectId}`, data);
  return res.data;
};

export const uploadProjectDocuments = async (projectId: number, formData: FormData, token: string) => {
  const res = await API.post(`/faculty/project/${projectId}/documents`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const activateProjectStatus = async (projectId: number, token: string) => {
  const res = await API.post(`/faculty/project/${projectId}/activate`, {});
  return res.data;
};

export const deactivateProjectStatus = async (projectId: number, token: string) => {
  const res = await API.post(`/faculty/project/${projectId}/deactivate`, {});
  return res.data;
};

export const createDomain = async (name: string, token: string) => {
  const res = await API.post(
    `/faculty/domain`,
    { name }
  );
  return res.data;
};

export const createSubDomain = async (
  name: string,
  domainId: number,
  token: string,
) => {
  const res = await API.post(
    `/faculty/subdomain`,
    { name, domainId }
  );
  return res.data;
};

export const getDomains = async (token: string) => {
  const res = await API.get(`/api/domains`);
  return res.data;
};

export const getSubDomains = async (domainId: number, token: string) => {
  const res = await API.get(`/api/subdomains/${domainId}`);
  return res.data;
};

export const getAllMeetings = async (degree: string, token: string) => {
  const res = await API.get(`/faculty/meetings?degree=${degree}`);

  return res.data;
};

export const scheduleMeeting = async (
  requestId: number,
  meetingTime: string,
  meetingLink: string,
  location: string,
  token: string,
) => {
  const res = await API.post(
    `/faculty/meetings`,
    {
      requestId,
      meetingTime,
      meetingLink,
      location,
    }
  );

  return res.data;
};

export const cancelMeeting = async (meetingId: number, token: string) => {
  const res = await API.put(
    `/faculty/meetings/${meetingId}/cancel`,
    {}
  );

  return res.data;
};

export const cancelRequest = async (requestId: number, token: string) => {
  const res = await API.put(
    `/faculty/requests/${requestId}/cancel`,
    {}
  );

  return res.data;
};

export const getFacultyProfile = async (degree: string, token: string) => {
  return API.get(`/faculty/profile?degree=${degree}`).then(res => res.data);
};

export const updateFacultyProfile = async (data: any, degree: string, token: string) => {
  return API.put(`/faculty/profile?degree=${degree}`, data).then(res => res.data);
};

export const completeMeeting = async (meetingId: number, token: string) => {
  return API.put(`/faculty/meetings/${meetingId}/complete`, {});
};

export const acceptProject = async (requestId: number, token: string) => {
  return API.put(`/faculty/meetings/request/${requestId}/accept`, {});
};

export const rejectProject = async (requestId: number, token: string, reason: string) => {
  return API.put(`/faculty/meetings/request/${requestId}/reject`, { reason });
};

export const rescheduleMeeting = async (
  requestId: number,
  meetingTime: string,
  meetingLink: string,
  location: string,
  title: string,
  token: string,
) => {
  return API.put(
    `/faculty/meetings/request/${requestId}/reschedule`,
    {
      requestId,
      meetingTime,
      meetingLink,
      location,
      title,
    }
  ).then(res => res.data);
};

export const deleteProject = async (projectId: number, token: string) => {
  const res = await API.delete(`/faculty/project/${projectId}`);
  return res.data;
};

export const deleteProjectDocuments = async (projectId: number, token: string) => {
  const res = await API.delete(`/faculty/project/${projectId}/documents`);
  return res.data;
};

