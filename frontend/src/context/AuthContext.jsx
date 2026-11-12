import { createContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { mockDelay, mockUser } from '../utils/mockData';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = Boolean(user);

  /**
   * Login — tries real API first; falls back to mock in dev when no backend.
   */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      // ── Real API call (uncomment when backend is ready) ──
      // const { data } = await api.post('/auth/login', { email, password });
      // localStorage.setItem('access_token', data.access_token);
      // localStorage.setItem('user', JSON.stringify(data.user));
      // setUser(data.user);

      // ── Mock login ──
      await mockDelay(600);
      const cleanEmail = (email || '').trim().toLowerCase();
      const cleanPassword = (password || '').trim();
      if (cleanEmail === 'admin@sugarmill.com' && cleanPassword === 'password') {
        const token = 'mock-jwt-token-123';
        localStorage.setItem('access_token', token);
        localStorage.setItem('user', JSON.stringify(mockUser));
        setUser(mockUser);
        return { success: true };
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (err) {
      const message = err.response?.data?.detail || err.message || 'Login failed';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
