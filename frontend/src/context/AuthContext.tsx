import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  token: string;
  role: string;
  name?: string;
  email?: string;
  studentId?: number;
  facultyId?: number;
  isInTeam?: boolean;
  isTeamLead?: boolean;
  phone?: string;
  isFC?: boolean;
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => Promise<void>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => Promise.resolve(),
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Restore user from AsyncStorage on app start ───────────────────────────
  useEffect(() => {
    const restoreUser = async () => {
      try {
        const stored = await AsyncStorage.getItem('user');
        if (stored) {
          setUserState(JSON.parse(stored));
        }
      } catch (e) {
        console.log('restore user error:', e);
      } finally {
        setLoading(false);
      }
    };
    restoreUser();
  }, []);

  // ── setUser also persists to AsyncStorage ─────────────────────────────────
  const setUser = async (newUser: User | null) => {
    setUserState(newUser);
    try {
      if (newUser) {
        await AsyncStorage.setItem('user', JSON.stringify(newUser));
      } else {
        await AsyncStorage.removeItem('user');
      }
    } catch (e) {
      console.log('setUser storage error:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};