import { mockUsers, User } from './mockUsers';

export const login = (
  email: string,
  password: string
): User | undefined => {
  return mockUsers.find(
    u => u.email === email && u.password === password
  );
};
