// lib/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import * as api from './api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      if (api.isLoggedIn()) {
        try {
          const u = await api.getMe();
          setUser(u);
        } catch {
          api.logout();
        }
      }
      setLoading(false);
    }
    init();
  }, []);

  async function login(email, password) {
    const u = await api.login(email, password);
    setUser(u);
  }

  async function signup(name, email, password) {
    const u = await api.signup(name, email, password);
    setUser(u);
  }

  function logout() {
    api.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}