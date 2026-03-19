export type Role = 'STUDENT' | 'FACULTY' | 'ADMIN' | 'FACULTY_COORDINATOR';

export interface User {
  token: string;
  role: Role;
  studentId?: number;
  isInTeam?: boolean;
  isTeamLead?: boolean;
}