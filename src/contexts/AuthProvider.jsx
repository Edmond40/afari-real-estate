import React, { useState, useEffect, useCallback } from 'react';
import { TOKEN_KEY, REFRESH_TOKEN_KEY } from '../config/auth';
import { AuthContext } from './auth-context';
import api from '../lib/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user from token on initial load
  const loadUser = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      setUser(data?.user || null);
    } catch (error) {
      console.error('Failed to load user', error);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const { token, refreshToken, user } = data || {};
      
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Login failed', error);
      return { success: false, error: error.response?.data?.message || 'Login failed' };
    }
  };

  const signup = async (userData) => {
    try {
      const { data } = await api.post('/auth/signup', userData);
      const { token, refreshToken, user } = data || {};
      
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
      
      setUser(user);
      return { success: true };
    } catch (error) {
      console.error('Signup failed', error);
      return { success: false, error: error.response?.data?.message || 'Signup failed' };
    }
  };

  const logout = async () => {
    try {
      // No backend endpoint required; clear client tokens
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      setUser(null);
    }
  };

  const updateProfile = async (userData) => {
    try {
      const { data } = await api.patch('/users/update-me', userData);
      setUser(data?.user || null);
      return { success: true };
    } catch (error) {
      console.error('Update profile failed', error);
      return { success: false, error: error.response?.data?.message || 'Update failed' };
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    signup,
    updateProfile,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
