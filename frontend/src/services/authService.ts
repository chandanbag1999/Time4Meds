import apiService, { api } from './api';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const data = await apiService.post<AuthResponse>('/auth/login', credentials, {
        timeout: 30000 // 30 seconds
      });
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const data = await apiService.post<AuthResponse>('/auth/register', credentials);
      if (data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  async forgotPassword(email: string): Promise<any> {
    try {
      return await apiService.post('/auth/forgot-password', { email });
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  async verifyResetToken(token: string): Promise<boolean> {
    try {
      await apiService.post('/auth/verify-reset-token', { token });
      return true;
    } catch (error) {
      console.error('Token verification error:', error);
      return false;
    }
  },

  async resetPassword(token: string, password: string): Promise<any> {
    try {
      return await apiService.post('/auth/reset-password', { token, password });
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (e) {
        console.error('Error parsing user data:', e);
        this.logout(); // Clear invalid data
        return null;
      }
    }
    return null;
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  isLoggedIn(): boolean {
    return !!this.getToken();
  },

  async updateProfile(userId: string, userData: Partial<User>): Promise<User> {
    try {
      const updatedUser = await apiService.put<User>(`/users/${userId}`, userData);
      
      // Update stored user data
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const newUserData = { ...currentUser, ...updatedUser };
        localStorage.setItem(USER_KEY, JSON.stringify(newUserData));
      }
      
      return updatedUser;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  }
};

export default authService; 