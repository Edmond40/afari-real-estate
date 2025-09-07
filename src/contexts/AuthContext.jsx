import React, { useState, useEffect, useContext } from 'react';
import api from '../lib/api';
import { AuthContext } from './auth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
//   const navigate = useNavigate();

  // Check if user is logged in on initial load
  useEffect(() => {
    const bootstrap = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        const me = data?.data?.user || data?.user || data;
        setUser(me || JSON.parse(localStorage.getItem('user') || 'null'));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await api.post('/auth/login', { email, password });
      const token = data?.token;
      const user = data?.data?.user || data?.user;
      if (!token || !user) throw new Error('Invalid login response');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const signup = async (name, email, password, role = 'ADMIN') => {
    try {
      const { data } = await api.post('/auth/signup', { name, email, password, passwordConfirm: password, role });
      const token = data?.token;
      const user = data?.data?.user || data?.user;
      if (!token || !user) throw new Error('Invalid signup response');
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message || error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // navigate('/login');
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
