export type Role = 'STUDENT' | 'FACULTY' | 'ADMIN' | 'FACULTY_COORDINATOR';

export interface User {
  token: string;
  role: Role;
  email?: string;
  name?: string;
  isInTeam?: boolean;
  isTeamLead?: boolean;
}
