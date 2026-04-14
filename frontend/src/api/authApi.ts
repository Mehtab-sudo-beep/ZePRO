import API from './api';

export const signup = (data: any) => {
  return API.post('/auth/signup', data);
};

export const login = (data: any) => {
  return API.post('/auth/login', data);
};

export const googleLogin = (data: any) => {
  return API.post('/auth/google', data);
};

export const forgotPassword = (data: any) => {
  return API.post('/auth/forgot-password', data);
};