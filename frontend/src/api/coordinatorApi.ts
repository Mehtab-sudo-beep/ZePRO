import API from './api';

const PREFIX = '/api/coordinator';

export const coordinatorApi = {
  // ✅ STATS
  getDashboardStats: (degree: string = 'UG') =>
    API.get(`${PREFIX}/stats?degree=${degree}`).then(res => res.data),

  // ✅ FACULTIES
  getAllFaculties: (degree: string = 'UG') =>
    API.get(`${PREFIX}/faculties?degree=${degree}`).then(res => res.data),

  searchFaculties: (query: string, degree: string = 'UG') =>
    API.get(`${PREFIX}/faculties/search?q=${encodeURIComponent(query)}&degree=${degree}`).then(res => res.data),

  // ✅ STUDENTS
  getAllStudents: (degree: string = 'UG') =>
    API.get(`${PREFIX}/students?degree=${degree}`).then(res => res.data),

  searchStudents: (query: string, degree: string = 'UG') =>
    API.get(`${PREFIX}/students/search?q=${encodeURIComponent(query)}&degree=${degree}`).then(res => res.data),

  getAllocatedStudents: (degree: string = 'UG') =>
    API.get(`${PREFIX}/students/allocated?degree=${degree}`).then(res => res.data),

  // ✅ TEAMS
  getAllTeams: (degree: string = 'UG') =>
    API.get(`${PREFIX}/teams?degree=${degree}`).then(res => res.data),

  getAllTeamsReport: (degree: string = 'UG') =>
    API.get(`${PREFIX}/teams/report?degree=${degree}`).then(res => res.data),

  downloadTeamsReportPdf: (degree: string = 'UG') =>
    API.get(`${PREFIX}/teams/report/pdf?degree=${degree}`, { responseType: 'blob' }).then(res => res.data),

  // ✅ ALLOCATION
  allocateStudent: (studentId: string, facultyId: string) =>
    API.post(`${PREFIX}/allocate`, { studentId, facultyId }).then(res => res.data),

  overrideAllocation: (studentId: string, newFacultyId: string) =>
    API.post(`${PREFIX}/override`, { studentId, newFacultyId }).then(res => res.data),

  // ✅ RULES
  getRules: (degree: string = 'UG') =>
    API.get(`${PREFIX}/rules?degree=${degree}`).then(res => res.data),

  saveRules: (rules: any) =>
    API.post(`${PREFIX}/rules`, rules).then(res => res.data),

  // ✅ DEPARTMENT DEADLINES
  getDeadlines: (degree: string = 'UG') =>
    API.get(`${PREFIX}/deadlines?degree=${degree}`).then(res => res.data),

  saveDeadlines: (deadlines: any, degree: string = 'UG') =>
    API.post(`${PREFIX}/deadlines?degree=${degree}`, deadlines).then(res => res.data),

  sendDepartmentDeadlineEmail: (degree: string = 'UG') =>
    API.post(`${PREFIX}/deadlines/send-email?degree=${degree}`).then(res => res.data),

  // ✅ STUDENTS AND TEAMS
  getStudentAndTeamDetails: (degree: string = 'UG') =>
    API.get(`${PREFIX}/student-team-details?degree=${degree}`).then(res => res.data),

  getAvailableTeamsToJoin: (degree: string = 'UG') =>
    API.get(`${PREFIX}/available-teams?degree=${degree}`).then(res => res.data),

  getFacultyProjects: (facultyId: string) =>
    API.get(`${PREFIX}/faculty-projects/${facultyId}`).then(res => res.data),

  allocateTeamToFaculty: (teamId: string, facultyId: string, projectId: string) =>
    API.post(`${PREFIX}/allocate-team`, { teamId, facultyId, projectId }).then(res => res.data),

  // ✅ CREATE TEAM
  createTeam: (teamName: string, studentId: string) => {
    console.log('[coordinatorApi] 🆕 Creating team:', teamName, 'for student:', studentId);
    return API.post(`${PREFIX}/create-team`, {
      teamName: teamName.trim(),
      studentId: String(studentId)
    }).then(res => res.data);
  },

  // ✅ JOIN TEAM
  joinTeam: (studentId: string, teamId: string) => {
    console.log('[coordinatorApi] 👥 Joining team:', teamId, 'for student:', studentId);
    return API.post(`${PREFIX}/join-team`, {
      studentId: String(studentId),
      teamId: String(teamId)
    }).then(res => res.data);
  },
};