export type Role = 'STUDENT' | 'FACULTY' | 'ADMIN' | 'FACULTY_COORDINATOR';

export interface User {
  token: string;
  role: Role;
  email?: string;
  name?: string;
  facultyId?: number;
  studentId?: number;
  isInTeam?: boolean;
  isTeamLead?: boolean;
}
