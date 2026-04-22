import API from './api';

export const signup = (data: any) => {
  console.log('Signup data:', data);
  return API.post('/auth/signup', data);
};

export const getAllowedTails = () => {
  return API.get('/auth/tails');
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

export const uploadProfilePicture = (data: FormData) => {
  return API.post('/auth/profile-picture', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const verifyOtp = (data: any) => {
  return API.post<{ valid: boolean }>('/auth/verify-otp', data);
};

export const resetPasswordOtp = (data: any) => {
  return API.post<{ message: string }>('/auth/reset-password-otp', data);
};