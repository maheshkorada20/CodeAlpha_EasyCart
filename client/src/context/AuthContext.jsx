import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true,
  });

  api.interceptors.request.use((config) => {
    if (config.url && config.url.startsWith('/api/')) {
      config.url = config.url.substring(4);
    }
    return config;
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const login = async (emailOrData, password, adminCode) => {
    try {
      setError(null);
      let payload;
      if (typeof emailOrData === 'object' && emailOrData !== null) {
        payload = emailOrData;
      } else {
        payload = { email: emailOrData, password, adminCode };
      }
      const { data } = await api.post('/auth/login', payload);
      setUser(data);
      return { success: true, user: data };
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed';
      setError(message);
      return { success: false, message };
    }
  };

  const register = async (userDataOrName, email, password, phone) => {
    try {
      setError(null);
      let payload;
      if (typeof userDataOrName === 'object' && userDataOrName !== null) {
        payload = userDataOrName;
      } else {
        payload = { name: userDataOrName, email, password, phone };
      }
      const { data } = await api.post('/auth/register', payload);
      setUser(data);
      return { success: true, user: data };
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed';
      setError(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
      setUser(null);
    } catch (err) {
      console.error('Logout failed');
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      const { data } = await api.put('/auth/profile', profileData);
      setUser(data);
      return data;
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
      throw err;
    }
  };

  const unlockAdminRole = async (adminCode) => {
    try {
      setError(null);
      const { data } = await api.post('/auth/unlock-admin', { adminCode });
      setUser(data.user);
      return { success: true, message: data.message };
    } catch (err) {
      const message = err.response?.data?.message || 'Invalid Admin Access Code';
      setError(message);
      return { success: false, message };
    }
  };

  const googleLogin = async (googleUser) => {
    try {
      setError(null);
      const { data } = await api.post('/auth/google', googleUser);
      setUser(data);
      return { success: true, user: data };
    } catch (err) {
      const message = err.response?.data?.message || 'Google sign in failed';
      setError(message);
      return { success: false, message };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, logout, updateProfile, unlockAdminRole, googleLogin, api }}>
      {children}
    </AuthContext.Provider>
  );
};
