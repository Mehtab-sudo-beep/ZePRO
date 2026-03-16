import axios from 'axios';

const API = 'http://localhost:8080';

export const getPendingRequests = async (token: string) => {
  const res = await axios.get(`${API}/faculty/pending-requests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const getFacultyProjects = async (facultyId: number, token: string) => {
  const res = await axios.get(`${API}/faculty/${facultyId}/projects`, {
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

export const getDomains = async () => {
  const res = await axios.get(`${API}/api/domains`);
  return res.data;
};

export const getSubDomains = async (domainId: number) => {
  const res = await axios.get(`${API}/api/subdomains/${domainId}`);
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
  token: string,
) => {
  const res = await axios.post(
    `${API}/faculty/meetings`,
    {
      requestId,
      meetingTime,
      meetingLink,
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

export const completeMeeting = async (meetingId: number, token: string) => {
  const res = await axios.put(
    `${API}/faculty/meetings/${meetingId}/complete`,
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
