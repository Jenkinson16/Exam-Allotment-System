import { apiClient } from './client';

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  password: string;
  role: 'Admin' | 'Staff';
  registrationToken: string;
}

export interface AuthResponse {
  accessToken: string;
  user: {
    userId: number;
    username: string;
    role: string;
  };
}

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post('/api/auth/login', credentials);
    return response.data;
  },

  register: async (data: RegisterData): Promise<{ message: string }> => {
    const response = await apiClient.post('/api/auth/register', data);
    return response.data;
  },

  getProfile: async () => {
    const response = await apiClient.get('/api/auth/profile');
    return response.data;
  },
};

