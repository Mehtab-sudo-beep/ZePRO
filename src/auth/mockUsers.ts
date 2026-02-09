// src/auth/mockUsers.ts

export type Role = 'student' | 'faculty' | 'admin' | 'facultycoordinator';

export interface User {
  email: string;
  password: string;
  role: Role;
  name: string | null;

  // student-only fields
  isInTeam?: boolean;
  isTeamLead?: boolean;
}

export const mockUsers = [
  {
    email: 's1@edu.com',
    password: '123',
    role: 'student',
    name: null,
    isInTeam: false,
    isTeamLead: false,
  },
  {
    email: 's2@edu.com',
    password: '123',
    role: 'student',
    name: 'Student 2',
    isInTeam: true,
    isTeamLead: false,
  },
  {
    email: 'lead@edu.com',
    password: 'l123',
    role: 'student',
    name: null,
    isInTeam: true,
    isTeamLead: true,
  },
  {
    email: 'faculty@nitc.ac.in',
    password: 'faculty123',
    role: 'faculty',
    name: 'Dr. Vinay V. Panicker',
  },
  {
    email: 'admin@nitc.ac.in',
    password: 'a123',
    role: 'admin',
    name: 'admin1',
  },
  {
    email:'fcoo@nitc.ac.in',
    password: "fc123",
    role: 'facultycoordinator',
    name: 'Faculty Coordinator 1'
  }
] satisfies User[];
