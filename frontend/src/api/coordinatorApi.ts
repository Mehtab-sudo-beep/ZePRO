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
    fetch(`${BASE_URL}/faculties/search?q=${encodeURIComponent(query)}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(res => res.json()),

  // ✅ STUDENTS
  getAllStudents: (token: string) =>
    fetch(`${BASE_URL}/students`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(res => res.json()),

  searchStudents: (query: string, token: string) =>
    fetch(`${BASE_URL}/students/search?q=${encodeURIComponent(query)}`, {
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

  // ✅ STUDENTS AND TEAMS
  getStudentAndTeamDetails: (token: string) =>
    fetch(`${BASE_URL}/student-team-details`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(res => res.json()),

  getAvailableTeamsToJoin: (token: string) =>
    fetch(`${BASE_URL}/available-teams`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(res => res.json()),

  getFacultyProjects: (facultyId: string, token: string) =>
    fetch(`${BASE_URL}/faculty-projects/${facultyId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    }).then(res => res.json()),

  allocateTeamToFaculty: (teamId: string, facultyId: string, projectId: string, token: string) =>
    fetch(`${BASE_URL}/allocate-team`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ teamId, facultyId, projectId }),
    }).then(res => res.json()),

  // ✅ CREATE TEAM
  createTeam: (teamName: string, studentId: string, token: string) => {
    console.log('[coordinatorApi] 🆕 Creating team:', teamName, 'for student:', studentId);
    return fetch(`${BASE_URL}/create-team`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        teamName: teamName.trim(),
        studentId: String(studentId)
      }),
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            throw new Error(err.error || `HTTP ${res.status}`);
          });
        }
        return res.json();
      })
      .catch(err => {
        console.log('[coordinatorApi] ❌ Create team error:', err);
        throw err;
      });
  },

  // ✅ JOIN TEAM
  joinTeam: (studentId: string, teamId: string, token: string) => {
    console.log('[coordinatorApi] 👥 Joining team:', teamId, 'for student:', studentId);
    return fetch(`${BASE_URL}/join-team`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        studentId: String(studentId),
        teamId: String(teamId)
      }),
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(err => {
            throw new Error(err.error || `HTTP ${res.status}`);
          });
        }
        return res.json();
      })
      .catch(err => {
        console.log('[coordinatorApi] ❌ Join team error:', err);
        throw err;
      });
  },
};