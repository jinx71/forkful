import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { getToken, setToken } from '../api/client';
import * as authApi from '../api/auth';

// NOTE: localStorage is fine for a portfolio app; httpOnly cookies are the
// more secure production pattern but require a same-site backend setup.
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Hydrate from token on mount.
  useEffect(() => {
    let cancelled = false;
    const boot = async () => {
      const token = getToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { user: u } = await authApi.me();
        if (!cancelled) setUser(u);
      } catch (_) {
        setToken(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    boot();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (creds) => {
    const { token, user: u } = await authApi.login(creds);
    setToken(token);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (creds) => {
    const { token, user: u } = await authApi.register(creds);
    setToken(token);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, isAuthed: !!user, login, register, logout }),
    [user, loading, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
