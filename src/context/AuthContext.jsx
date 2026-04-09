/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      localStorage.removeItem('token');
      return null;
    }

    return localStorage.getItem('token');
  });

  const [loading, setLoading] = useState(false);

  const login = (userType, name, volunteerId, departmentId, email, authToken) => {
    const userData = {
      userType,
      name,
      volunteerId,
      departmentId,
      email
    };

    setUser(userData);
    setToken(authToken);

    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);

    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  useEffect(() => {
    const handler = () => {
      logout();
      sessionStorage.setItem('sessionExpired', 'true');
    };

    window.addEventListener('auth:unauthorized', handler);
    return () => window.removeEventListener('auth:unauthorized', handler);
  }, []);

  const isAdmin = () => user?.userType === 'ADMIN';

  const isAuthenticated = () => !!token && !!user;

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    isAdmin,
    isAuthenticated,
    setLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
