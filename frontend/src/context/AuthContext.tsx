// src/context/AuthContext.tsx

import React, { createContext, useState } from 'react';
export interface User {
  studentId?: string | number;
  facultyId?: string | number;
  name?: string;
  email?: string;
  role?: string;
  isInTeam?: boolean;
  isTeamLead?: boolean;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};
