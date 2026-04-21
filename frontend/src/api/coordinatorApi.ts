import API from './api';

const PREFIX = '/api/coordinator';

export const coordinatorApi = {
  // ✅ STATS
  getDashboardStats: () =>
    API.get(`${PREFIX}/stats`).then(res => res.data),

  // ✅ FACULTIES
  getAllFaculties: () =>
    API.get(`${PREFIX}/faculties`).then(res => res.data),

  searchFaculties: (query: string) =>
    API.get(`${PREFIX}/faculties/search?q=${encodeURIComponent(query)}`).then(res => res.data),

  // ✅ STUDENTS
  getAllStudents: () =>
    API.get(`${PREFIX}/students`).then(res => res.data),

  searchStudents: (query: string) =>
    API.get(`${PREFIX}/students/search?q=${encodeURIComponent(query)}`).then(res => res.data),

  getAllocatedStudents: () =>
    API.get(`${PREFIX}/students/allocated`).then(res => res.data),

  // ✅ TEAMS
  getAllTeams: () =>
    API.get(`${PREFIX}/teams`).then(res => res.data),

  getAllTeamsReport: () =>
    API.get(`${PREFIX}/teams/report`).then(res => res.data),

  downloadTeamsReportPdf: () =>
    API.get(`${PREFIX}/teams/report/pdf`, { responseType: 'blob' }).then(res => res.data),

  // ✅ ALLOCATION
  allocateStudent: (studentId: string, facultyId: string) =>
    API.post(`${PREFIX}/allocate`, { studentId, facultyId }).then(res => res.data),

  overrideAllocation: (studentId: string, newFacultyId: string) =>
    API.post(`${PREFIX}/override`, { studentId, newFacultyId }).then(res => res.data),

  // ✅ RULES
  getRules: () =>
    API.get(`${PREFIX}/rules`).then(res => res.data),

  saveRules: (rules: any) =>
    API.post(`${PREFIX}/rules`, rules).then(res => res.data),

  // ✅ DEPARTMENT DEADLINES
  getDeadlines: () =>
    API.get(`${PREFIX}/deadlines`).then(res => res.data),

  saveDeadlines: (deadlines: any) =>
    API.post(`${PREFIX}/deadlines`, deadlines).then(res => res.data),

  sendDepartmentDeadlineEmail: () =>
    API.post(`${PREFIX}/deadlines/send-email`).then(res => res.data),

  // ✅ STUDENTS AND TEAMS
  getStudentAndTeamDetails: () =>
    API.get(`${PREFIX}/student-team-details`).then(res => res.data),

  getAvailableTeamsToJoin: () =>
    API.get(`${PREFIX}/available-teams`).then(res => res.data),

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