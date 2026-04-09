const BASE_URL = 'http://localhost:8080/api/coordinator';

export const coordinatorApi = {
  // ✅ STATS
  getDashboardStats: (token: string) =>
    fetch(`${BASE_URL}/stats`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(res => res.json()),

  // ✅ FACULTIES
  getAllFaculties: (token: string) =>
    fetch(`${BASE_URL}/faculties`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(res => res.json()),

  searchFaculties: (query: string, token: string) =>
    fetch(`${BASE_URL}/faculties/search?q=${query}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(res => res.json()),

  // ✅ STUDENTS
  getAllStudents: (token: string) =>
    fetch(`${BASE_URL}/students`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(res => res.json()),

  searchStudents: (query: string, token: string) =>
    fetch(`${BASE_URL}/students/search?q=${query}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(res => res.json()),

  getAllocatedStudents: (token: string) =>
    fetch(`${BASE_URL}/students/allocated`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(res => res.json()),

  // ✅ TEAMS
  getAllTeams: (token: string) =>
    fetch(`${BASE_URL}/teams`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(res => res.json()),

  getAllTeamsReport: (token: string) =>
    fetch(`${BASE_URL}/teams/report`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(res => res.json()),

  downloadTeamsReportPdf: (token: string) =>
    fetch(`${BASE_URL}/teams/report/pdf`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(res => res.blob()),

  // ✅ ALLOCATION
  allocateStudent: (studentId: string, facultyId: string, token: string) =>
    fetch(`${BASE_URL}/allocate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ studentId, facultyId }),
    }).then(res => res.json()),

  overrideAllocation: (studentId: string, newFacultyId: string, token: string) =>
    fetch(`${BASE_URL}/override`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ studentId, newFacultyId }),
    }).then(res => res.json()),

  // ✅ RULES
  getRules: (token: string) =>
    fetch(`${BASE_URL}/rules`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(res => res.json()),

  saveRules: (rules: any, token: string) =>
    fetch(`${BASE_URL}/rules`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(rules),
    }).then(res => res.json()),
};