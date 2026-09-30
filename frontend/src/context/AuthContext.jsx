import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('lostfound_token') || '');
  const [loading, setLoading] = useState(true);
  const [demoMode, setDemoMode] = useState(true); // Default true for reliable offline/online hackathon demo
  const [activeMissionId, setActiveMissionId] = useState(null);

  // Initialize or fetch current user
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (token) {
          const res = await api.getMe();
          if (res.success && res.user) {
            setUser(res.user);
          } else {
            // Auto login as default demo user
            await switchRole('user');
          }
        } else {
          // Auto login as default demo user for seamless judge experience
          await switchRole('user');
        }
      } catch (err) {
        console.warn('Auth init failed, switching to default demo user:', err.message);
        await switchRole('user');
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      if (res.success) {
        localStorage.setItem('lostfound_token', res.token);
        setToken(res.token);
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    localStorage.removeItem('lostfound_token');
    setToken('');
    setUser(null);
  };

  // Instant 1-click Role Switcher for Hackathon Judges
  const switchRole = async (targetRole) => {
    const roleAccounts = {
      user: { email: 'user@lostfound.org', password: 'Password123!' },
      moderator: { email: 'moderator@lostfound.org', password: 'Password123!' },
      admin: { email: 'admin@lostfound.org', password: 'Password123!' }
    };

    const creds = roleAccounts[targetRole] || roleAccounts.user;
    const res = await login(creds.email, creds.password);
    return res;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'user',
        token,
        loading,
        demoMode,
        setDemoMode,
        activeMissionId,
        setActiveMissionId,
        login,
        logout,
        switchRole
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
