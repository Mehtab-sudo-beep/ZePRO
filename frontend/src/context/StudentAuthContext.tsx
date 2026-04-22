import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StudentUser {
  studentId?: string | number;
  facultyId?: string | number;
  name?: string;
  email?: string;
  role?: string;
  isInTeam?: boolean;
  isTeamLead?: boolean;
  [key: string]: any;
}

interface StudentAuthContextType {
  studentUser: StudentUser | null;
  setStudentUser: React.Dispatch<React.SetStateAction<StudentUser | null>>;
  loading: boolean; // ✅ ADD loading state
}

export const StudentAuthContext = createContext<StudentAuthContextType>({
  studentUser: null,
  setStudentUser: () => { },
  loading: true,
});

export const StudentAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [studentUser, setStudentUser] = useState<StudentUser | null>(null);
  const [loading, setLoading] = useState(true); // ✅ NEW

  useEffect(() => {
    const loadUser = async () => {
      try {
        const stored = await AsyncStorage.getItem('user');

        console.log("Context loading user:", stored);

        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.role === 'STUDENT') {
            setStudentUser(parsed);
          } else {
            setStudentUser(null);
          }
        } else {
          setStudentUser(null);
        }
      } catch (e) {
        console.log("Error loading user:", e);
        setStudentUser(null);
      } finally {
        setLoading(false); // ✅ ALWAYS RUNS
      }
    };

    loadUser();
  }, []);

  return (
    <StudentAuthContext.Provider value={{ studentUser, setStudentUser, loading }}>
      {children}
    </StudentAuthContext.Provider>
  );
};