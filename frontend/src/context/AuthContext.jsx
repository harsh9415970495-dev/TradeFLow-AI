import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const API_URL = 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Configure Axios default headers
  const setAuthHeader = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        setAuthHeader(token);
        try {
          const res = await axios.get(`${API_URL}/auth/profile`);
          if (res.data.success) {
            setUser(res.data);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Failed to load user profile', err);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const register = async (username, email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/register`, { username, email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setAuthHeader(res.data.token);
        setUser(res.data);
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password });
      if (res.data.success) {
        localStorage.setItem('token', res.data.token);
        setAuthHeader(res.data.token);
        setUser(res.data);
        return true;
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check credentials.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateBalance = (newBalance) => {
    setUser((prev) => (prev ? { ...prev, cashBalance: newBalance } : null));
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthHeader(null);
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        register,
        login,
        logout,
        updateBalance,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
