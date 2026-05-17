"use client";

import { useEffect } from 'react';
import { useStore } from '../../store/useStore';

/**
 * AuthProvider — calls GET /api/auth/session on mount to hydrate
 * the Zustand store with the current user from the HttpOnly JWT cookie.
 * No Supabase Auth dependency.
 */
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { setUser, setSessionLoading } = useStore();

  useEffect(() => {
    fetch('/api/auth/session')
      .then((res) => res.json())
      .then(({ user }) => {
        setUser(user ?? null);
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setSessionLoading(false);
      });
  }, [setUser, setSessionLoading]);

  return <>{children}</>;
};
